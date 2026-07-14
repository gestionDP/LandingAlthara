/** ADMIN — document lifecycle: publish/archive, new version, permissions, activity. */
import { z } from 'zod';
import { and, desc, eq } from 'drizzle-orm';
import { requireAdmin, errorResponse, AuthzError } from '@/dataroom/lib/authz';
import { addVersion, setDocumentStatus, setDocumentPermission, softDeleteDocument, renameDocument, restoreVersion, moveDocument } from '@/dataroom/services/documents';
import { notifyNewDocuments } from '@/dataroom/services/notifications';
import { db, schema } from '@/dataroom/db/client';
import { DATAROOM_TENANT, MAX_UPLOAD_BYTES } from '@/dataroom/config';

export const runtime = 'nodejs';
export const maxDuration = 60;

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
    const { id } = await ctx.params;
    const [document] = await db().select().from(schema.documents)
      .where(and(eq(schema.documents.id, id), eq(schema.documents.tenant, DATAROOM_TENANT))).limit(1);
    if (!document) throw new AuthzError(404, 'document_not_found');

    const [versions, permissions, accessLog] = await Promise.all([
      db().select().from(schema.documentVersions)
        .where(eq(schema.documentVersions.documentId, id))
        .orderBy(desc(schema.documentVersions.versionNumber)),
      db().select({
        perm: schema.documentPermissions,
        email: schema.investors.email,
      }).from(schema.documentPermissions)
        .innerJoin(schema.investors, eq(schema.documentPermissions.investorId, schema.investors.id))
        .where(eq(schema.documentPermissions.documentId, id)),
      db().select({
        kind: schema.downloads.kind,
        watermarked: schema.downloads.watermarked,
        createdAt: schema.downloads.createdAt,
        email: schema.investors.email,
      }).from(schema.downloads)
        .innerJoin(schema.investors, eq(schema.downloads.investorId, schema.investors.id))
        .where(eq(schema.downloads.documentId, id))
        .orderBy(desc(schema.downloads.createdAt)).limit(100),
    ]);

    return Response.json({ document, versions, permissions, accessLog });
  } catch (err) {
    return errorResponse(err);
  }
}

const PatchBody = z.object({
  action: z.enum(['publish', 'archive', 'revoke', 'set_permission', 'notify', 'rename', 'restore_version', 'move']),
  title: z.string().trim().min(1).max(300).optional(),
  versionId: z.string().uuid().optional(),
  categoryId: z.string().uuid().nullable().optional(),
  permission: z.object({
    investorId: z.string().uuid(),
    effect: z.enum(['allow', 'deny', 'clear']),
    canDownload: z.boolean().optional(),
  }).optional(),
});

export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const admin = await requireAdmin();
    const { id } = await ctx.params;
    const parsed = PatchBody.safeParse(await req.json());
    if (!parsed.success) return Response.json({ error: 'invalid_request' }, { status: 400 });

    const actor = { type: 'admin' as const, id: admin.userId, email: admin.email };
    const { action, permission, title, versionId, categoryId } = parsed.data;

    if (action === 'rename') {
      if (!title) return Response.json({ error: 'invalid_request' }, { status: 400 });
      await renameDocument(id, title, actor);
    } else if (action === 'move') {
      await moveDocument(id, categoryId ?? null, actor);
    } else if (action === 'restore_version') {
      if (!versionId) return Response.json({ error: 'invalid_request' }, { status: 400 });
      await restoreVersion(id, versionId, actor);
    } else if (action === 'set_permission') {
      if (!permission) return Response.json({ error: 'invalid_request' }, { status: 400 });
      await setDocumentPermission({ documentId: id, ...permission }, actor);
    } else if (action === 'notify') {
      const [doc] = await db().select().from(schema.documents)
        .where(eq(schema.documents.id, id)).limit(1);
      if (!doc) throw new AuthzError(404, 'document_not_found');
      await notifyNewDocuments({ projectId: doc.projectId, documentIds: [id] }, actor);
    } else {
      const status = action === 'publish' ? 'published' : action === 'archive' ? 'archived' : 'revoked';
      await setDocumentStatus(id, status, actor);
    }
    return Response.json({ ok: true });
  } catch (err) {
    return errorResponse(err);
  }
}

/** DELETE — borrado lógico del documento. */
export async function DELETE(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const admin = await requireAdmin();
    const { id } = await ctx.params;
    await softDeleteDocument(id, { type: 'admin', id: admin.userId, email: admin.email });
    return Response.json({ ok: true });
  } catch (err) {
    return errorResponse(err);
  }
}

/** POST — upload a new version (multipart: file, comment, publish). */
export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const admin = await requireAdmin();
    const { id } = await ctx.params;
    const form = await req.formData();
    const file = form.get('file');
    if (!(file instanceof File)) return Response.json({ error: 'no_file' }, { status: 400 });
    if (file.size > MAX_UPLOAD_BYTES) return Response.json({ error: 'file_too_large' }, { status: 422 });

    const comment = String(form.get('comment') ?? '');
    const publish = String(form.get('publish') ?? 'true') === 'true';
    const notify = String(form.get('notify') ?? 'false') === 'true';

    const actor = { type: 'admin' as const, id: admin.userId, email: admin.email };
    const data = Buffer.from(await file.arrayBuffer());
    const version = await addVersion(
      { documentId: id, file: { name: file.name, mimeType: file.type, data }, comment, publish },
      actor,
    );

    if (notify && publish) {
      const [doc] = await db().select().from(schema.documents)
        .where(eq(schema.documents.id, id)).limit(1);
      if (doc) await notifyNewDocuments({ projectId: doc.projectId, documentIds: [id], kind: 'new_version' }, actor);
    }

    return Response.json({ ok: true, versionNumber: version.versionNumber });
  } catch (err) {
    return errorResponse(err);
  }
}
