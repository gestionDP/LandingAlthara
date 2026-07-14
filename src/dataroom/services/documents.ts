/**
 * Document management: multi-upload, versioning (immutable), publication,
 * archiving, per-investor permissions, authorized listing, preview/download
 * with backend authorization + short-lived signed URLs + watermarking.
 */
import { and, eq, desc, inArray, isNull } from 'drizzle-orm';
import { db, schema } from '../db/client';
import { DATAROOM_TENANT, MAX_UPLOAD_BYTES } from '../config';
import { validateUpload, buildStoragePath, safeDownloadName } from '../core/naming.ts';
import { sha256Hex } from '../core/tokens.ts';
import { computeDocumentAccess, type AccessDecision } from '../core/access.ts';
import { uploadObject, downloadObject, signedUrl } from '../lib/storage';
import { canWatermark, watermarkPdf } from '../lib/watermark';
import { writeAudit, type AuditActor, type RequestMeta } from '../lib/audit';
import { AuthzError, type Investor } from '../lib/authz';
import { ndaStateFor } from './projects';
import { isReviewApproved, resetReviews, notifyReviewersPendingReview } from './reviews';

const T = DATAROOM_TENANT;

export interface UploadDocumentInput {
  projectId: string;
  categoryId?: string;
  title: string;
  description?: string;
  confidentiality: 'generic' | 'sensitive';
  downloadable: boolean;
  requiresNda: boolean;
  publish: boolean;
  file: { name: string; mimeType: string; data: Buffer };
  /** empty = all investors of the project; ids = only those investors (allow rows) */
  restrictToInvestorIds?: string[];
}

export async function uploadDocument(input: UploadDocumentInput, actor: AuditActor) {
  const [project] = await db().select().from(schema.projects)
    .where(and(eq(schema.projects.id, input.projectId), eq(schema.projects.tenant, T))).limit(1);
  if (!project) throw new AuthzError(404, 'project_not_found');

  const check = validateUpload({
    fileName: input.file.name,
    mimeType: input.file.mimeType,
    sizeBytes: input.file.data.length,
    maxBytes: MAX_UPLOAD_BYTES,
  });
  if (!check.ok) throw new AuthzError(422, check.error);

  const [document] = await db().insert(schema.documents).values({
    tenant: T,
    projectId: input.projectId,
    categoryId: input.categoryId ?? null,
    title: input.title,
    description: input.description ?? null,
    confidentiality: input.confidentiality,
    downloadable: input.downloadable,
    requiresNda: input.requiresNda,
    status: 'draft',
    createdBy: actor.id ?? null,
  }).returning();

  let version;
  try {
    version = await addVersion(
      { documentId: document.id, file: input.file, comment: 'Versión inicial', publish: input.publish },
      actor,
      { skipSupersede: true, ext: check.ext },
    );
  } catch (err) {
    // Si falla el guardado del fichero, deshacemos el documento recién creado
    // para no dejar un borrador huérfano sin versión.
    await db().delete(schema.documentVersions).where(eq(schema.documentVersions.documentId, document.id));
    await db().delete(schema.documents).where(eq(schema.documents.id, document.id));
    throw err;
  }

  if (input.restrictToInvestorIds?.length) {
    await db().insert(schema.documentPermissions).values(
      input.restrictToInvestorIds.map((investorId) => ({
        tenant: T, documentId: document.id, investorId,
        effect: 'allow' as const, canDownload: input.downloadable, createdBy: actor.id ?? null,
      })),
    ).onConflictDoNothing();
    // Restricted docs: investors not listed get no access via a marker deny-all?
    // Model: restricted = sensitive + generic-level assignments blocked; explicit
    // allow rows open it. For full-level assignees not listed, add deny rows.
    const assignees = await db().select({ investorId: schema.projectAccess.investorId })
      .from(schema.projectAccess)
      .where(eq(schema.projectAccess.projectId, input.projectId));
    const allowed = new Set(input.restrictToInvestorIds);
    const denyRows = assignees
      .filter((a) => !allowed.has(a.investorId))
      .map((a) => ({
        tenant: T, documentId: document.id, investorId: a.investorId,
        effect: 'deny' as const, canDownload: false, createdBy: actor.id ?? null,
      }));
    if (denyRows.length)
      await db().insert(schema.documentPermissions).values(denyRows).onConflictDoNothing();
  }

  await writeAudit({
    tenant: T, actor, action: 'document.uploaded', entityType: 'document', entityId: document.id,
    metadata: { title: input.title, projectId: input.projectId, size: input.file.data.length },
  });
  if (input.publish) {
    await writeAudit({
      tenant: T, actor, action: 'document.published', entityType: 'document', entityId: document.id,
    });
  }

  // Aviso a abogado y fiscal: hay un documento nuevo pendiente de visado.
  await notifyReviewersPendingReview(document.title, project.name);

  return { document, version };
}

export async function addVersion(
  input: { documentId: string; file: { name: string; mimeType: string; data: Buffer }; comment?: string; publish: boolean },
  actor: AuditActor,
  opts?: { skipSupersede?: boolean; ext?: string },
) {
  const [document] = await db().select().from(schema.documents)
    .where(and(eq(schema.documents.id, input.documentId), eq(schema.documents.tenant, T))).limit(1);
  if (!document) throw new AuthzError(404, 'document_not_found');

  let ext = opts?.ext;
  if (!ext) {
    const check = validateUpload({
      fileName: input.file.name, mimeType: input.file.mimeType,
      sizeBytes: input.file.data.length, maxBytes: MAX_UPLOAD_BYTES,
    });
    if (!check.ok) throw new AuthzError(422, check.error);
    ext = check.ext;
  }

  const prev = await db().select().from(schema.documentVersions)
    .where(eq(schema.documentVersions.documentId, input.documentId))
    .orderBy(desc(schema.documentVersions.versionNumber)).limit(1);
  const versionNumber = (prev[0]?.versionNumber ?? 0) + 1;

  const [version] = await db().insert(schema.documentVersions).values({
    documentId: input.documentId,
    versionNumber,
    storagePath: '', // set after we know the id
    originalName: input.file.name,
    mimeType: input.file.mimeType,
    sizeBytes: input.file.data.length,
    sha256: sha256Hex(input.file.data),
    status: input.publish ? 'published' : 'draft',
    versionComment: input.comment ?? null,
    uploadedBy: actor.id ?? null,
  }).returning();

  const storagePath = buildStoragePath({
    tenant: T, projectId: document.projectId, documentId: document.id, versionId: version.id, ext,
  });
  await uploadObject({ path: storagePath, data: input.file.data, contentType: input.file.mimeType });
  await db().update(schema.documentVersions).set({ storagePath })
    .where(eq(schema.documentVersions.id, version.id));

  if (input.publish) {
    if (!opts?.skipSupersede && prev[0] && prev[0].status === 'published') {
      await db().update(schema.documentVersions).set({ status: 'superseded' })
        .where(eq(schema.documentVersions.id, prev[0].id));
    }
    await db().update(schema.documents)
      .set({ currentVersionId: version.id, status: 'published', updatedAt: new Date() })
      .where(eq(schema.documents.id, document.id));
  }

  if (versionNumber > 1) {
    // Nueva versión → se reinicia el doble visado (abogado + fiscal) y se avisa.
    await resetReviews(document.id);
    const [proj] = await db().select({ name: schema.projects.name }).from(schema.projects)
      .where(eq(schema.projects.id, document.projectId)).limit(1);
    await notifyReviewersPendingReview(document.title, proj?.name ?? null);
    await writeAudit({
      tenant: T, actor, action: 'document.versioned', entityType: 'document', entityId: document.id,
      metadata: { versionNumber },
    });
  }
  return { ...version, storagePath };
}

/** Mueve el documento a otra carpeta (categoryId null = raíz). */
export async function moveDocument(documentId: string, categoryId: string | null, actor: AuditActor) {
  const [document] = await db().select().from(schema.documents)
    .where(and(eq(schema.documents.id, documentId), eq(schema.documents.tenant, T))).limit(1);
  if (!document) throw new AuthzError(404, 'document_not_found');
  await db().update(schema.documents)
    .set({ categoryId, updatedAt: new Date() })
    .where(eq(schema.documents.id, documentId));
  await writeAudit({
    tenant: T, actor, action: 'document.renamed', entityType: 'document', entityId: documentId,
    metadata: { movedToCategory: categoryId },
  });
  return { ok: true };
}

export async function renameDocument(documentId: string, title: string, actor: AuditActor) {
  const [document] = await db().select().from(schema.documents)
    .where(and(eq(schema.documents.id, documentId), eq(schema.documents.tenant, T))).limit(1);
  if (!document) throw new AuthzError(404, 'document_not_found');
  await db().update(schema.documents)
    .set({ title, updatedAt: new Date() })
    .where(eq(schema.documents.id, documentId));
  await writeAudit({
    tenant: T, actor, action: 'document.renamed', entityType: 'document', entityId: documentId,
    metadata: { title },
  });
  return { ok: true };
}

/** Restaura una versión anterior como la actual (la actual pasa a superseded). */
export async function restoreVersion(documentId: string, versionId: string, actor: AuditActor) {
  const [document] = await db().select().from(schema.documents)
    .where(and(eq(schema.documents.id, documentId), eq(schema.documents.tenant, T))).limit(1);
  if (!document) throw new AuthzError(404, 'document_not_found');
  const [target] = await db().select().from(schema.documentVersions)
    .where(and(eq(schema.documentVersions.id, versionId), eq(schema.documentVersions.documentId, documentId))).limit(1);
  if (!target) throw new AuthzError(404, 'version_not_found');
  if (document.currentVersionId === versionId) return { ok: true };

  if (document.currentVersionId) {
    await db().update(schema.documentVersions).set({ status: 'superseded' })
      .where(eq(schema.documentVersions.id, document.currentVersionId));
  }
  await db().update(schema.documentVersions).set({ status: 'published' })
    .where(eq(schema.documentVersions.id, versionId));
  await db().update(schema.documents)
    .set({ currentVersionId: versionId, status: 'published', updatedAt: new Date() })
    .where(eq(schema.documents.id, documentId));

  await writeAudit({
    tenant: T, actor, action: 'document.versioned', entityType: 'document', entityId: documentId,
    metadata: { restoredToVersion: target.versionNumber },
  });
  return { ok: true };
}

export async function setDocumentStatus(
  documentId: string,
  status: 'published' | 'archived' | 'revoked',
  actor: AuditActor,
) {
  const [document] = await db().select().from(schema.documents)
    .where(and(eq(schema.documents.id, documentId), eq(schema.documents.tenant, T))).limit(1);
  if (!document) throw new AuthzError(404, 'document_not_found');
  if (status === 'published' && !document.currentVersionId)
    throw new AuthzError(409, 'no_published_version');

  await db().update(schema.documents)
    .set({ status, updatedAt: new Date() })
    .where(eq(schema.documents.id, documentId));

  await writeAudit({
    tenant: T, actor,
    action: status === 'published' ? 'document.published' : 'document.archived',
    entityType: 'document', entityId: documentId, metadata: { status },
  });
  return { ok: true };
}

/** Borrado lógico del documento (el archivo se conserva en GCS por trazabilidad). */
export async function softDeleteDocument(documentId: string, actor: AuditActor) {
  const [document] = await db().select().from(schema.documents)
    .where(and(eq(schema.documents.id, documentId), eq(schema.documents.tenant, T))).limit(1);
  if (!document || document.deletedAt) throw new AuthzError(404, 'document_not_found');

  await db().update(schema.documents)
    .set({ deletedAt: new Date(), status: 'revoked', updatedAt: new Date() })
    .where(eq(schema.documents.id, documentId));

  await writeAudit({
    tenant: T, actor, action: 'document.deleted', entityType: 'document', entityId: documentId,
    metadata: { title: document.title },
  });
  return { ok: true };
}

export async function setDocumentPermission(
  input: { documentId: string; investorId: string; effect: 'allow' | 'deny' | 'clear'; canDownload?: boolean },
  actor: AuditActor,
) {
  if (input.effect === 'clear') {
    await db().delete(schema.documentPermissions).where(and(
      eq(schema.documentPermissions.documentId, input.documentId),
      eq(schema.documentPermissions.investorId, input.investorId),
    ));
  } else {
    await db().insert(schema.documentPermissions).values({
      tenant: T,
      documentId: input.documentId,
      investorId: input.investorId,
      effect: input.effect,
      canDownload: input.canDownload ?? true,
      createdBy: actor.id ?? null,
    }).onConflictDoUpdate({
      target: [schema.documentPermissions.documentId, schema.documentPermissions.investorId],
      set: { effect: input.effect, canDownload: input.canDownload ?? true, createdBy: actor.id ?? null },
    });
  }
  await writeAudit({
    tenant: T, actor, action: 'permission.changed', entityType: 'document', entityId: input.documentId,
    metadata: { investorId: input.investorId, effect: input.effect, canDownload: input.canDownload },
  });
  return { ok: true };
}

/* ------------------------- investor-facing reads ------------------------- */

async function loadAccessContext(investor: Investor, documentId: string) {
  const [document] = await db().select().from(schema.documents)
    .where(eq(schema.documents.id, documentId)).limit(1);
  if (!document) throw new AuthzError(404, 'not_found');

  const [project] = await db().select().from(schema.projects)
    .where(eq(schema.projects.id, document.projectId)).limit(1);
  if (!project) throw new AuthzError(404, 'not_found');

  const [assignment] = await db().select().from(schema.projectAccess).where(and(
    eq(schema.projectAccess.investorId, investor.id),
    eq(schema.projectAccess.projectId, project.id),
  )).limit(1);

  const [permission] = await db().select().from(schema.documentPermissions).where(and(
    eq(schema.documentPermissions.documentId, documentId),
    eq(schema.documentPermissions.investorId, investor.id),
  )).limit(1);

  const ndaState = await ndaStateFor(investor, project);

  // El nivel de la carpeta manda (igual que en el índice): Nivel 1 = solo vista
  // sin NDA; Nivel 2 = requiere NDA.
  let folderLevel = 2;
  if (document.categoryId) {
    const [cat] = await db().select({ level: schema.documentCategories.level })
      .from(schema.documentCategories)
      .where(eq(schema.documentCategories.id, document.categoryId)).limit(1);
    folderLevel = cat?.level ?? 2;
  }
  const docInput = folderLevel === 1
    ? { status: document.status, confidentiality: 'generic' as const, downloadable: false, requiresNda: false }
    : { status: document.status, confidentiality: 'sensitive' as const, downloadable: document.downloadable, requiresNda: true };

  const decision = computeDocumentAccess({
    sameTenant: investor.tenant === document.tenant && document.tenant === T,
    investorStatus: investor.status,
    projectStatus: project.status,
    assignment: assignment ? { status: assignment.status, accessLevel: assignment.accessLevel } : null,
    document: docInput,
    permission: permission ? { effect: permission.effect, canDownload: permission.canDownload } : null,
    ndaState,
  });

  // Sin doble visado (abogado + fiscal) no hay acceso, aunque el resto permita.
  if (!isReviewApproved(document)) {
    return { document, project, decision: { canView: false, canDownload: false, reason: 'document_unavailable' as const } };
  }

  return { document, project, decision };
}

/** Documents of a project as seen by one investor (locked docs included as placeholders). */
export async function listAuthorizedDocuments(investor: Investor, projectId: string) {
  // Publicados + borradores: el índice se muestra COMPLETO (semáforo), aunque
  // los borradores solo aparezcan como "en revisión" sin acceso.
  const allDocs = await db()
    .select()
    .from(schema.documents)
    .where(and(
      eq(schema.documents.projectId, projectId),
      eq(schema.documents.tenant, T),
      inArray(schema.documents.status, ['published', 'draft']),
      isNull(schema.documents.deletedAt),
    ));
  if (allDocs.length === 0) return [];

  const [project] = await db().select().from(schema.projects)
    .where(eq(schema.projects.id, projectId)).limit(1);
  if (!project) return [];

  const [assignment] = await db().select().from(schema.projectAccess).where(and(
    eq(schema.projectAccess.investorId, investor.id),
    eq(schema.projectAccess.projectId, projectId),
  )).limit(1);

  const publishedIds = allDocs.filter((d) => d.status === 'published').map((d) => d.id);
  const perms = publishedIds.length
    ? await db().select().from(schema.documentPermissions).where(and(
        inArray(schema.documentPermissions.documentId, publishedIds),
        eq(schema.documentPermissions.investorId, investor.id),
      ))
    : [];
  const permMap = new Map(perms.map((p) => [p.documentId, p]));

  const versionIds = allDocs.map((d) => d.currentVersionId).filter((v): v is string => !!v);
  const versions = versionIds.length
    ? await db().select().from(schema.documentVersions)
        .where(inArray(schema.documentVersions.id, versionIds))
    : [];
  const versionMap = new Map(versions.map((v) => [v.id, v]));

  const categories = await db().select().from(schema.documentCategories)
    .where(eq(schema.documentCategories.projectId, projectId));
  const catMap = new Map(categories.map((c) => [c.id, c]));

  const ndaState = await ndaStateFor(investor, project);

  const result = [];
  for (const doc of allDocs) {
    const cat = doc.categoryId ? catMap.get(doc.categoryId) : undefined;
    const folderLevel = cat?.level ?? 2;
    const base = {
      id: doc.id,
      title: doc.title,
      description: doc.description,
      category: cat?.name ?? null,
      categorySlug: cat?.slug ?? null,
      confidentiality: doc.confidentiality,
      folderLevel,
    };

    // Borrador o pendiente de doble visado → placeholder "en revisión"
    // (visible en el índice, sin acceso hasta que abogado + fiscal aprueben).
    if (doc.status === 'draft' || !isReviewApproved(doc)) {
      result.push({
        ...base, updatedAt: doc.updatedAt, isNew: false,
        indexState: 'en_revision' as const, locked: true as const, lockReason: 'in_review', canDownload: false,
      });
      continue;
    }

    const perm = permMap.get(doc.id);
    // El NIVEL de la carpeta manda: Nivel 1 = solo vista, sin NDA; Nivel 2 = requiere NDA.
    const docInput = folderLevel === 1
      ? { status: doc.status, confidentiality: 'generic' as const, downloadable: false, requiresNda: false }
      : { status: doc.status, confidentiality: 'sensitive' as const, downloadable: doc.downloadable, requiresNda: true };
    const decision: AccessDecision = computeDocumentAccess({
      sameTenant: investor.tenant === doc.tenant && doc.tenant === T,
      investorStatus: investor.status,
      projectStatus: project.status,
      assignment: assignment ? { status: assignment.status, accessLevel: assignment.accessLevel } : null,
      document: docInput,
      permission: perm ? { effect: perm.effect, canDownload: perm.canDownload } : null,
      ndaState,
    });

    if (decision.reason === 'explicit_deny' || decision.reason === 'not_assigned' ||
        decision.reason === 'assignment_inactive' || decision.reason === 'tenant_mismatch') continue;

    const version = doc.currentVersionId ? versionMap.get(doc.currentVersionId) : undefined;
    result.push({
      ...base,
      updatedAt: doc.updatedAt,
      isNew: doc.updatedAt > new Date(Date.now() - 7 * 24 * 3600_000),
      ...(decision.canView
        ? {
            indexState: 'disponible' as const,
            locked: false as const,
            canDownload: decision.canDownload,
            mimeType: version?.mimeType ?? null,
            sizeBytes: version?.sizeBytes ?? null,
            versionNumber: version?.versionNumber ?? null,
          }
        : { indexState: 'pendiente' as const, locked: true as const, lockReason: decision.reason, canDownload: false }),
    });
  }
  return result;
}

/**
 * Authorized preview/download. Returns either a redirect URL (signed, 60s)
 * or a watermarked buffer. ALWAYS audited; denials audited too.
 */
export async function serveDocument(
  investor: Investor,
  documentId: string,
  kind: 'preview' | 'download',
  req?: RequestMeta,
): Promise<
  | { type: 'url'; url: string; watermark?: string }
  | { type: 'buffer'; data: Buffer; contentType: string; fileName: string }
> {
  const { document, decision } = await loadAccessContext(investor, documentId);

  const permitted = kind === 'preview' ? decision.canView : decision.canDownload;
  if (!permitted) {
    await writeAudit({
      tenant: T, actor: { type: 'investor', id: investor.id, email: investor.email },
      action: 'document.access_denied', entityType: 'document', entityId: documentId,
      result: 'denied', metadata: { kind, reason: decision.reason }, req,
    });
    throw new AuthzError(decision.reason === 'nda_required' ? 423 : 404, decision.reason ?? 'denied');
  }

  if (!document.currentVersionId) throw new AuthzError(404, 'not_found');
  const [version] = await db().select().from(schema.documentVersions)
    .where(eq(schema.documentVersions.id, document.currentVersionId)).limit(1);
  if (!version || version.status !== 'published') throw new AuthzError(404, 'not_found');

  const [dl] = await db().insert(schema.downloads).values({
    tenant: T,
    investorId: investor.id,
    documentId,
    versionId: version.id,
    kind,
    watermarked: false,
    ip: req?.ip ?? null,
    userAgent: req?.userAgent?.slice(0, 500) ?? null,
  }).returning();

  await writeAudit({
    tenant: T, actor: { type: 'investor', id: investor.id, email: investor.email },
    action: kind === 'preview' ? 'document.viewed' : 'document.downloaded',
    entityType: 'document', entityId: documentId,
    metadata: { versionNumber: version.versionNumber, kind }, req,
  });

  const ext = version.storagePath.split('.').pop() ?? 'bin';
  const fileName = safeDownloadName(document.title, ext);

  // Watermark dinámico (email + timestamp) en TODA visualización y descarga de
  // PDFs (spec ALT-RM). Antes solo en descarga de confidenciales.
  const shouldWatermark = canWatermark(version.mimeType, version.sizeBytes);

  if (shouldWatermark) {
    const original = await downloadObject(version.storagePath);
    const stamped = await watermarkPdf({
      pdf: original,
      investorName: `${investor.firstName ?? ''} ${investor.lastName ?? ''}`.trim() || investor.email,
      investorEmail: investor.email,
      downloadId: dl.id,
    });
    await db().update(schema.downloads).set({ watermarked: true })
      .where(eq(schema.downloads.id, dl.id));
    return { type: 'buffer', data: stamped, contentType: 'application/pdf', fileName };
  }

  const url = await signedUrl({
    path: version.storagePath,
    disposition: kind === 'preview' ? 'inline' : 'attachment',
    downloadName: fileName,
  });
  // Para formatos que no admiten marca incrustada (docx, xlsx, imagen), el
  // visor superpone esta etiqueta (email + fecha) sobre la previsualización.
  const stamp = new Date().toISOString().slice(0, 16).replace('T', ' ');
  return { type: 'url', url, watermark: `${investor.email} · ${stamp} UTC` };
}

/**
 * ADMIN: URL firmada del documento (sin marca de agua, sin registro de
 * descarga de inversor). Permite abrir/previsualizar el archivo cargado.
 */
export async function serveDocumentAsAdmin(
  documentId: string,
  kind: 'preview' | 'download',
): Promise<{ url: string; mimeType: string | null; fileName: string }> {
  const [document] = await db().select().from(schema.documents)
    .where(and(eq(schema.documents.id, documentId), eq(schema.documents.tenant, T))).limit(1);
  if (!document || !document.currentVersionId) throw new AuthzError(404, 'not_found');
  const [version] = await db().select().from(schema.documentVersions)
    .where(eq(schema.documentVersions.id, document.currentVersionId)).limit(1);
  if (!version) throw new AuthzError(404, 'not_found');

  const ext = version.storagePath.split('.').pop() ?? 'bin';
  const fileName = safeDownloadName(document.title, ext);
  const url = await signedUrl({
    path: version.storagePath,
    disposition: kind === 'preview' ? 'inline' : 'attachment',
    downloadName: fileName,
  });
  return { url, mimeType: version.mimeType, fileName };
}
