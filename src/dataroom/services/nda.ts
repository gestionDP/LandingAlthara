/**
 * NDA lifecycle: versioned agreement per project, click-wrap signature with
 * evidence, archived signed copy in GCS, immediate unlock (frontend refetches).
 */
import { and, eq, isNull, sql } from 'drizzle-orm';
import { db, schema } from '../db/client';
import { DATAROOM_TENANT, env } from '../config';
import { sha256Hex } from '../core/tokens.ts';
import { buildSignedNdaPdf } from '../lib/nda-pdf';
import { uploadObject, signedUrl } from '../lib/storage';
import { writeAudit, type AuditActor, type RequestMeta } from '../lib/audit';
import { sendTransactionalEmail } from '../lib/emails/send';
import { AuthzError, type Investor } from '../lib/authz';
import { ndaStateFor } from './projects';

const T = DATAROOM_TENANT;

/** NDA GLOBAL: un único acuerdo para todo el portal (project_id NULL). */
export async function createNdaVersion(
  input: { title: string; bodyText: string },
  actor: AuditActor,
) {
  const prev = await db().select().from(schema.ndaVersions)
    .where(and(eq(schema.ndaVersions.tenant, T), isNull(schema.ndaVersions.projectId)))
    .orderBy(sql`${schema.ndaVersions.version} DESC`).limit(1);
  const nextVersion = (prev[0]?.version ?? 0) + 1;

  // Desactivar todas las versiones anteriores (globales y antiguas por proyecto).
  await db().update(schema.ndaVersions).set({ active: false })
    .where(and(eq(schema.ndaVersions.tenant, T), eq(schema.ndaVersions.active, true)));

  const [version] = await db().insert(schema.ndaVersions).values({
    tenant: T,
    projectId: null,
    version: nextVersion,
    title: input.title,
    bodyText: input.bodyText,
    bodySha256: sha256Hex(input.bodyText),
    active: true,
  }).returning();

  await writeAudit({
    tenant: T, actor, action: 'nda.version_created', entityType: 'nda_version', entityId: version.id,
    metadata: { version: nextVersion, scope: 'global' },
  });
  return version;
}

/** Última versión global activa del NDA (o null si aún no existe). */
export async function getActiveGlobalNda() {
  const [active] = await db().select().from(schema.ndaVersions).where(and(
    eq(schema.ndaVersions.tenant, T),
    isNull(schema.ndaVersions.projectId),
    eq(schema.ndaVersions.active, true),
  )).limit(1);
  return active ?? null;
}

/** Investor opens the NDA to review it (audited). */
export async function getNdaForSigning(investor: Investor, projectId: string, req?: RequestMeta) {
  const [project] = await db().select().from(schema.projects)
    .where(and(eq(schema.projects.id, projectId), eq(schema.projects.tenant, T))).limit(1);
  if (!project) throw new AuthzError(404, 'not_found');

  const [assignment] = await db().select().from(schema.projectAccess).where(and(
    eq(schema.projectAccess.investorId, investor.id),
    eq(schema.projectAccess.projectId, projectId),
    eq(schema.projectAccess.status, 'active'),
  )).limit(1);
  if (!assignment) throw new AuthzError(404, 'not_found');

  const state = await ndaStateFor(investor, project);
  const active = await getActiveGlobalNda();

  await writeAudit({
    tenant: T, actor: { type: 'investor', id: investor.id, email: investor.email },
    action: 'nda.opened', entityType: 'project', entityId: projectId, req,
  });

  return {
    state,
    version: active
      ? { id: active.id, version: active.version, title: active.title, bodyText: active.bodyText }
      : null,
  };
}

/**
 * Click-wrap signature. Idempotent: re-signing the same version returns the
 * existing signature instead of duplicating.
 */
export async function signNda(
  investor: Investor,
  input: { projectId: string; ndaVersionId: string; signerFullName: string; accepted: boolean },
  req?: RequestMeta,
) {
  if (!input.accepted) throw new AuthzError(422, 'acceptance_required');
  if (!input.signerFullName || input.signerFullName.trim().length < 5)
    throw new AuthzError(422, 'signer_name_required');

  const [project] = await db().select().from(schema.projects)
    .where(and(eq(schema.projects.id, input.projectId), eq(schema.projects.tenant, T))).limit(1);
  if (!project) throw new AuthzError(404, 'not_found');

  const [assignment] = await db().select().from(schema.projectAccess).where(and(
    eq(schema.projectAccess.investorId, investor.id),
    eq(schema.projectAccess.projectId, input.projectId),
    eq(schema.projectAccess.status, 'active'),
  )).limit(1);
  if (!assignment) throw new AuthzError(404, 'not_found');

  const [version] = await db().select().from(schema.ndaVersions).where(and(
    eq(schema.ndaVersions.id, input.ndaVersionId),
    isNull(schema.ndaVersions.projectId),
    eq(schema.ndaVersions.active, true),
  )).limit(1);
  if (!version) throw new AuthzError(409, 'nda_version_not_active');

  // Idempotency: existing signature for this version?
  const [existing] = await db().select().from(schema.ndaSignatures).where(and(
    eq(schema.ndaSignatures.investorId, investor.id),
    eq(schema.ndaSignatures.ndaVersionId, version.id),
  )).limit(1);
  if (existing && existing.status === 'signed') return { ok: true, signatureId: existing.id, idempotent: true };

  const signedAt = new Date();
  const [signature] = await db().insert(schema.ndaSignatures).values({
    tenant: T,
    investorId: investor.id,
    projectId: input.projectId,
    ndaVersionId: version.id,
    status: 'signed',
    signedAt,
    signerFullName: input.signerFullName.trim(),
    ip: req?.ip ?? null,
    userAgent: req?.userAgent?.slice(0, 500) ?? null,
    evidence: {
      mechanism: 'click_wrap',
      acceptedBodySha256: version.bodySha256,
      acceptedAt: signedAt.toISOString(),
      termsShownVersion: version.version,
    },
  }).onConflictDoNothing().returning();

  const sigId = signature?.id ?? existing?.id;
  if (!sigId) throw new AuthzError(409, 'signature_conflict');

  // Archive the signed copy (best-effort: signature stands even if PDF fails).
  try {
    const pdf = await buildSignedNdaPdf({
      title: version.title,
      bodyText: version.bodyText,
      version: version.version,
      bodySha256: version.bodySha256,
      signerFullName: input.signerFullName.trim(),
      signerEmail: investor.email,
      projectName: project.name,
      signedAtIso: signedAt.toISOString(),
      ip: req?.ip ?? null,
      signatureId: sigId,
    });
    const path = `dataroom/${T}/${input.projectId}/nda/${sigId}.pdf`;
    await uploadObject({ path, data: pdf, contentType: 'application/pdf' });
    await db().update(schema.ndaSignatures).set({ signedCopyPath: path })
      .where(eq(schema.ndaSignatures.id, sigId));
  } catch (err) {
    console.error('[dataroom] NDA copy generation failed', err instanceof Error ? err.message : err);
  }

  await writeAudit({
    tenant: T, actor: { type: 'investor', id: investor.id, email: investor.email },
    action: 'nda.signed', entityType: 'project', entityId: input.projectId,
    metadata: { ndaVersion: version.version, signatureId: sigId }, req,
  });

  await sendTransactionalEmail({
    template: 'nda_signed',
    locale: (investor.language as 'es' | 'en') ?? 'es',
    to: investor.email,
    investorId: investor.id,
    params: {
      investorName: investor.firstName ?? undefined,
      projectName: project.name,
      actionUrl: `${env.appBaseUrl()}/dataroom/projects/${input.projectId}`,
    },
  });

  return { ok: true, signatureId: sigId, idempotent: false };
}

/** Admin: short-lived URL to the archived signed copy. */
export async function getSignedNdaCopyUrl(signatureId: string) {
  const [sig] = await db().select().from(schema.ndaSignatures)
    .where(and(eq(schema.ndaSignatures.id, signatureId), eq(schema.ndaSignatures.tenant, T))).limit(1);
  if (!sig?.signedCopyPath) throw new AuthzError(404, 'signed_copy_not_found');
  return signedUrl({ path: sig.signedCopyPath, disposition: 'attachment', downloadName: `nda_${signatureId.slice(0, 8)}.pdf`, ttlSeconds: 120 });
}
