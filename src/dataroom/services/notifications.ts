/**
 * Grouped notifications: one email per investor per batch of published
 * documents (never one email per file). In-app notification rows too.
 */
import { and, eq, inArray } from 'drizzle-orm';
import { db, schema } from '../db/client';
import { DATAROOM_TENANT, env } from '../config';
import { computeDocumentAccess } from '../core/access.ts';
import { writeAudit, type AuditActor } from '../lib/audit';
import { sendTransactionalEmail } from '../lib/emails/send';
import { AuthzError } from '../lib/authz';
import { ndaStateFor } from './projects';

const T = DATAROOM_TENANT;

/**
 * Notify investors of a project about newly published documents.
 * Only investors who can actually SEE each document are notified about it,
 * and locked sensitive titles are never leaked.
 */
export async function notifyNewDocuments(
  input: { projectId: string; documentIds: string[]; kind?: 'new_documents' | 'new_version' },
  actor: AuditActor,
) {
  const [project] = await db().select().from(schema.projects)
    .where(and(eq(schema.projects.id, input.projectId), eq(schema.projects.tenant, T))).limit(1);
  if (!project) throw new AuthzError(404, 'project_not_found');

  const docs = await db().select().from(schema.documents).where(and(
    inArray(schema.documents.id, input.documentIds),
    eq(schema.documents.projectId, input.projectId),
    eq(schema.documents.status, 'published'),
  ));
  if (docs.length === 0) return { notified: 0 };

  const assignments = await db()
    .select({ access: schema.projectAccess, investor: schema.investors })
    .from(schema.projectAccess)
    .innerJoin(schema.investors, eq(schema.projectAccess.investorId, schema.investors.id))
    .where(and(
      eq(schema.projectAccess.projectId, input.projectId),
      eq(schema.projectAccess.status, 'active'),
      eq(schema.investors.status, 'active'),
    ));

  let notified = 0;
  for (const { access, investor } of assignments) {
    const perms = await db().select().from(schema.documentPermissions).where(and(
      inArray(schema.documentPermissions.documentId, docs.map((d) => d.id)),
      eq(schema.documentPermissions.investorId, investor.id),
    ));
    const permMap = new Map(perms.map((p) => [p.documentId, p]));
    const ndaState = await ndaStateFor(investor as never, project);

    const visibleTitles = docs
      .filter((doc) => {
        const perm = permMap.get(doc.id);
        const d = computeDocumentAccess({
          sameTenant: true,
          investorStatus: investor.status,
          projectStatus: project.status,
          assignment: { status: access.status, accessLevel: access.accessLevel },
          document: {
            status: doc.status, confidentiality: doc.confidentiality,
            downloadable: doc.downloadable, requiresNda: doc.requiresNda,
          },
          permission: perm ? { effect: perm.effect, canDownload: perm.canDownload } : null,
          ndaState,
        });
        // Notify about viewable docs AND NDA-locked ones (title level only if generic).
        return d.canView || d.reason === 'nda_required';
      })
      .map((doc) => doc.title);

    if (visibleTitles.length === 0) continue;

    await db().insert(schema.notifications).values({
      tenant: T,
      investorId: investor.id,
      type: input.kind ?? 'new_documents',
      payload: { projectId: project.id, projectName: project.name, count: visibleTitles.length },
    });

    await sendTransactionalEmail({
      template: input.kind ?? 'new_documents',
      locale: (investor.language as 'es' | 'en') ?? 'es',
      to: investor.email,
      investorId: investor.id,
      params: {
        investorName: investor.firstName ?? undefined,
        projectName: project.name,
        documentCount: visibleTitles.length,
        documentTitles: visibleTitles.slice(0, 10),
        actionUrl: `${env.appBaseUrl()}/dataroom/projects/${project.id}`,
      },
    });
    notified++;
  }

  await writeAudit({
    tenant: T, actor, action: 'notification.sent', entityType: 'project', entityId: input.projectId,
    metadata: { documentCount: docs.length, investorsNotified: notified },
  });
  return { notified };
}

export async function listNotifications(investorId: string) {
  return db().select().from(schema.notifications)
    .where(eq(schema.notifications.investorId, investorId))
    .orderBy(schema.notifications.createdAt);
}
