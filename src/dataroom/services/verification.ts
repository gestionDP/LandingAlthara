/**
 * Capa 1 — documento de verificación. ALT-WEB-2026-01 v1.2 §06.
 *
 * Flujo: formulario (nombre, email, teléfono) → email de doble opt-in →
 * confirmación → descarga del PDF firmado por el administrador. Cada descarga
 * queda registrada: quién, cuándo y qué versión se entregó.
 *
 * Disciplina de versión: el documento firmado se congela. Un cambio de cifras
 * obliga a emitir ALT-TR-2026-02 con nueva fecha y firma; la versión anterior
 * se archiva y deja de distribuirse. Nunca dos versiones firmadas en
 * circulación simultánea. Por eso la referencia y la versión entregadas se
 * guardan en cada fila: el registro sigue siendo veraz aunque el documento
 * vigente cambie después.
 */
import { and, eq } from 'drizzle-orm';
import { db, schema } from '../db/client';
import { writeAudit, type RequestMeta } from '../lib/audit';
import { sendTransactionalEmail } from '../lib/emails/send';
import { downloadObject } from '../lib/storage';
import {
  generateInvitationToken,
  hashToken,
  invitationExpiry,
  looksLikeToken,
} from '../core/tokens';
import {
  DATAROOM_TENANT,
  LEGAL_TERMS_VERSION,
  VERIFICATION_DOC_PATH,
  VERIFICATION_DOC_REF,
  VERIFICATION_DOC_VERSION,
  VERIFICATION_TOKEN_TTL_HOURS,
  env,
} from '../config';

export type VerificationLocale = 'es' | 'en';

export type VerificationFailure =
  | 'invalid_token'
  | 'not_found'
  | 'expired'
  | 'revoked'
  | 'not_confirmed'
  | 'document_not_ready';

interface Ok<T> {
  ok: true;
  data: T;
}
interface Fail {
  ok: false;
  reason: VerificationFailure;
}

/* ----------------------------- 1 · solicitud ------------------------------ */

export async function requestVerificationDocument(input: {
  name: string;
  email: string;
  phone?: string | null;
  locale: VerificationLocale;
  meta: RequestMeta;
}): Promise<{ ok: true }> {
  const email = input.email.trim().toLowerCase();
  const { raw, hash } = generateInvitationToken();
  const expiresAt = invitationExpiry(VERIFICATION_TOKEN_TTL_HOURS);

  const [row] = await db()
    .insert(schema.verificationRequests)
    .values({
      tenant: DATAROOM_TENANT,
      name: input.name.trim(),
      email,
      phone: input.phone?.trim() || null,
      locale: input.locale,
      tokenHash: hash,
      expiresAt,
      consentVersion: LEGAL_TERMS_VERSION,
      documentRef: VERIFICATION_DOC_REF,
      documentVersion: VERIFICATION_DOC_VERSION,
      ip: input.meta.ip ?? null,
      userAgent: input.meta.userAgent?.slice(0, 500) ?? null,
    })
    .returning({ id: schema.verificationRequests.id });

  const confirmUrl = `${env.appBaseUrl()}/api/verification/confirm?token=${encodeURIComponent(raw)}`;

  await sendTransactionalEmail({
    template: 'verification_confirm',
    locale: input.locale,
    to: email,
    params: {
      investorName: input.name.trim(),
      actionUrl: confirmUrl,
      expiresHours: VERIFICATION_TOKEN_TTL_HOURS,
      documentRef: VERIFICATION_DOC_REF,
      documentVersion: VERIFICATION_DOC_VERSION,
    },
  });

  // Aviso interno: el administrador debe poder acreditar cada cifra el día que
  // se le solicite, así que conviene que sepa quién ha pedido el documento.
  await sendTransactionalEmail({
    template: 'verification_requested_admin',
    locale: 'es',
    to: env.adminEmail(),
    params: {
      investorName: input.name.trim(),
      investorEmail: email,
      documentRef: VERIFICATION_DOC_REF,
      documentVersion: VERIFICATION_DOC_VERSION,
    },
  });

  await writeAudit({
    tenant: DATAROOM_TENANT,
    actor: { type: 'system', email },
    action: 'verification.requested',
    entityType: 'verification_request',
    entityId: row?.id ?? null,
    metadata: { documentRef: VERIFICATION_DOC_REF, documentVersion: VERIFICATION_DOC_VERSION },
    req: input.meta,
  });

  // Respuesta siempre idéntica: no se revela si el email ya había solicitado.
  return { ok: true };
}

/* --------------------------- 2 · confirmación ----------------------------- */

async function findByToken(rawToken: string) {
  if (!looksLikeToken(rawToken)) return null;
  const rows = await db()
    .select()
    .from(schema.verificationRequests)
    .where(
      and(
        eq(schema.verificationRequests.tokenHash, hashToken(rawToken)),
        eq(schema.verificationRequests.tenant, DATAROOM_TENANT),
      ),
    )
    .limit(1);
  return rows[0] ?? null;
}

export async function confirmVerificationRequest(
  rawToken: string,
  meta: RequestMeta,
): Promise<Ok<{ id: string; locale: VerificationLocale }> | Fail> {
  const row = await findByToken(rawToken);
  if (!row) return deny('invalid_token', null, meta);
  if (row.status === 'revoked') return deny('revoked', row.id, meta);
  if (row.expiresAt.getTime() < Date.now()) return deny('expired', row.id, meta);

  if (row.status !== 'confirmed') {
    await db()
      .update(schema.verificationRequests)
      .set({ status: 'confirmed', confirmedAt: new Date() })
      .where(eq(schema.verificationRequests.id, row.id));

    await writeAudit({
      tenant: DATAROOM_TENANT,
      actor: { type: 'system', email: row.email },
      action: 'verification.confirmed',
      entityType: 'verification_request',
      entityId: row.id,
      req: meta,
    });
  }

  return { ok: true, data: { id: row.id, locale: (row.locale as VerificationLocale) ?? 'es' } };
}

/* ----------------------------- 3 · descarga ------------------------------- */

export async function downloadVerificationDocument(
  rawToken: string,
  meta: RequestMeta,
): Promise<Ok<{ pdf: Buffer; filename: string }> | Fail> {
  const row = await findByToken(rawToken);
  if (!row) return deny('invalid_token', null, meta);
  if (row.status === 'revoked') return deny('revoked', row.id, meta);
  if (row.expiresAt.getTime() < Date.now()) return deny('expired', row.id, meta);
  if (row.status !== 'confirmed') return deny('not_confirmed', row.id, meta);

  const locale = (row.locale as VerificationLocale) ?? 'es';

  let pdf: Buffer;
  try {
    pdf = await downloadObject(VERIFICATION_DOC_PATH(locale));
  } catch {
    // El PDF firmado aún no está cargado. La solicitud queda registrada igual.
    return deny('document_not_ready', row.id, meta);
  }

  // Se registra la versión VIGENTE en el momento de la entrega, no la que se
  // solicitó: el registro debe reflejar qué se descargó realmente.
  await db().insert(schema.verificationDownloads).values({
    tenant: DATAROOM_TENANT,
    requestId: row.id,
    documentRef: VERIFICATION_DOC_REF,
    documentVersion: VERIFICATION_DOC_VERSION,
    ip: meta.ip ?? null,
    userAgent: meta.userAgent?.slice(0, 500) ?? null,
  });

  await writeAudit({
    tenant: DATAROOM_TENANT,
    actor: { type: 'system', email: row.email },
    action: 'verification.downloaded',
    entityType: 'verification_request',
    entityId: row.id,
    metadata: { documentRef: VERIFICATION_DOC_REF, documentVersion: VERIFICATION_DOC_VERSION },
    req: meta,
  });

  return {
    ok: true,
    data: {
      pdf,
      filename: `${VERIFICATION_DOC_REF}-${VERIFICATION_DOC_VERSION}-${locale}.pdf`,
    },
  };
}

/* -------------------------------- utilidades ------------------------------ */

async function deny(
  reason: VerificationFailure,
  entityId: string | null,
  meta: RequestMeta,
): Promise<Fail> {
  await writeAudit({
    tenant: DATAROOM_TENANT,
    actor: { type: 'system' },
    action: 'verification.denied',
    entityType: 'verification_request',
    entityId,
    result: reason === 'document_not_ready' ? 'error' : 'denied',
    metadata: { reason },
    req: meta,
  });
  return { ok: false, reason };
}
