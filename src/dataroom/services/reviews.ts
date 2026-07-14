/**
 * Doble visado de documentos (spec ALT-RM): abogado (legal) + fiscal (tax).
 * Un documento no está disponible para el inversor hasta que AMBOS aprueban.
 * Una nueva versión reinicia los dos visados (ver addVersion en documents.ts).
 */
import { and, desc, eq, isNull, or } from 'drizzle-orm';
import { db, schema } from '../db/client';
import { DATAROOM_TENANT, env } from '../config';
import { writeAudit, type AuditActor } from '../lib/audit';
import { AuthzError, type ReviewerRole } from '../lib/authz';
import { sendTransactionalEmail } from '../lib/emails/send';

const T = DATAROOM_TENANT;

/** ¿El documento tiene ambos visados aprobados? */
export function isReviewApproved(d: { legalStatus: string; taxStatus: string }): boolean {
  return d.legalStatus === 'approved' && d.taxStatus === 'approved';
}

/**
 * Cola del revisor: documentos con algún visado PENDIENTE (requieren su acción)
 * o RECHAZADO (para mantener visible el motivo hasta que el admin suba una
 * versión corregida) en alguno de sus roles.
 */
export async function listPendingReviews(roles: ReviewerRole[]) {
  const conds = [];
  if (roles.includes('legal')) conds.push(or(eq(schema.documents.legalStatus, 'pending'), eq(schema.documents.legalStatus, 'rejected')));
  if (roles.includes('tax')) conds.push(or(eq(schema.documents.taxStatus, 'pending'), eq(schema.documents.taxStatus, 'rejected')));
  if (conds.length === 0) return [];
  return db()
    .select({
      id: schema.documents.id,
      title: schema.documents.title,
      status: schema.documents.status,
      updatedAt: schema.documents.updatedAt,
      projectId: schema.documents.projectId,
      projectName: schema.projects.name,
      legalStatus: schema.documents.legalStatus,
      legalReason: schema.documents.legalReason,
      taxStatus: schema.documents.taxStatus,
      taxReason: schema.documents.taxReason,
    })
    .from(schema.documents)
    .innerJoin(schema.projects, eq(schema.documents.projectId, schema.projects.id))
    .where(and(
      eq(schema.documents.tenant, T),
      isNull(schema.documents.deletedAt),
      or(...conds),
    ))
    .orderBy(desc(schema.documents.updatedAt));
}

/**
 * Vista global para el revisor: TODOS los documentos de TODOS los proyectos
 * (no borrados), con su estado de visado y carpeta. Solo lectura.
 */
export async function listAllForReview() {
  return db()
    .select({
      id: schema.documents.id,
      title: schema.documents.title,
      status: schema.documents.status,
      updatedAt: schema.documents.updatedAt,
      legalStatus: schema.documents.legalStatus,
      legalReason: schema.documents.legalReason,
      taxStatus: schema.documents.taxStatus,
      taxReason: schema.documents.taxReason,
      projectId: schema.projects.id,
      projectName: schema.projects.name,
      projectStatus: schema.projects.status,
      categoryName: schema.documentCategories.name,
    })
    .from(schema.documents)
    .innerJoin(schema.projects, eq(schema.documents.projectId, schema.projects.id))
    .leftJoin(schema.documentCategories, eq(schema.documents.categoryId, schema.documentCategories.id))
    .where(and(
      eq(schema.documents.tenant, T),
      isNull(schema.documents.deletedAt),
      isNull(schema.projects.deletedAt),
    ))
    .orderBy(schema.projects.name, schema.documents.title);
}

/** El revisor aprueba o rechaza (con motivo) su visado del documento. */
export async function reviewDocument(
  documentId: string,
  role: ReviewerRole,
  decision: 'approve' | 'reject',
  reason: string | null,
  actor: AuditActor,
) {
  const [doc] = await db().select().from(schema.documents)
    .where(and(eq(schema.documents.id, documentId), eq(schema.documents.tenant, T))).limit(1);
  if (!doc) throw new AuthzError(404, 'document_not_found');

  const status = decision === 'approve' ? 'approved' as const : 'rejected' as const;
  const now = new Date();
  const who = actor.email ?? actor.id ?? null;
  const set = role === 'legal'
    ? { legalStatus: status, legalReason: decision === 'reject' ? reason : null, legalReviewedBy: who, legalReviewedAt: now, updatedAt: now }
    : { taxStatus: status, taxReason: decision === 'reject' ? reason : null, taxReviewedBy: who, taxReviewedAt: now, updatedAt: now };
  await db().update(schema.documents).set(set).where(eq(schema.documents.id, documentId));

  await writeAudit({
    tenant: T, actor,
    action: decision === 'approve' ? 'review.approved' : 'review.rejected',
    entityType: 'document', entityId: documentId, metadata: { role, reason },
  });

  // Aviso al admin (no debe bloquear la decisión si el email falla).
  try {
    await sendTransactionalEmail({
      template: 'document_reviewed_admin',
      locale: 'es',
      to: env.adminEmail(),
      params: {
        documentTitle: doc.title,
        reviewRole: role === 'legal' ? 'Abogado' : 'Fiscal',
        reviewDecision: decision === 'approve' ? 'aprobado' : 'rechazado',
        reason: reason ?? undefined,
      },
    });
  } catch {
    /* el fallo de email no bloquea la revisión */
  }

  return { ok: true };
}

/** Avisa por email al abogado y al fiscal de que hay un documento por visar. */
export async function notifyReviewersPendingReview(documentTitle: string, projectName: string | null) {
  const to = env.reviewerEmails();
  await Promise.all(to.map((addr) =>
    sendTransactionalEmail({
      template: 'document_pending_review',
      locale: 'es',
      to: addr,
      params: {
        documentTitle,
        projectName: projectName ?? undefined,
        actionUrl: `${env.appBaseUrl()}/dataroom/review`,
      },
    }).catch(() => { /* el fallo de email no bloquea la subida */ }),
  ));
}

/** Reinicia ambos visados a pendiente (al subir una versión nueva). */
export async function resetReviews(documentId: string) {
  await db().update(schema.documents)
    .set({
      legalStatus: 'pending', legalReason: null, legalReviewedBy: null, legalReviewedAt: null,
      taxStatus: 'pending', taxReason: null, taxReviewedBy: null, taxReviewedAt: null,
      updatedAt: new Date(),
    })
    .where(eq(schema.documents.id, documentId));
}
