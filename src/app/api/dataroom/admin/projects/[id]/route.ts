/** ADMIN — project detail (investors, documents, NDA, activity) / update / NDA version. */
import { z } from 'zod';
import { and, desc, eq, isNull } from 'drizzle-orm';
import { requireAdmin, errorResponse, AuthzError } from '@/dataroom/lib/authz';
import { updateProject, softDeleteProject } from '@/dataroom/services/projects';
import { getSignedNdaCopyUrl } from '@/dataroom/services/nda';
import { db, schema } from '@/dataroom/db/client';
import { DATAROOM_TENANT } from '@/dataroom/config';

export const runtime = 'nodejs';

export async function GET(req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
    const { id } = await ctx.params;
    const url = new URL(req.url);

    // Sub-resource: signed NDA copy download URL
    const signatureId = url.searchParams.get('ndaCopy');
    if (signatureId) {
      const copyUrl = await getSignedNdaCopyUrl(signatureId);
      return Response.json({ url: copyUrl });
    }

    const [project] = await db().select().from(schema.projects)
      .where(and(eq(schema.projects.id, id), eq(schema.projects.tenant, DATAROOM_TENANT))).limit(1);
    if (!project || project.deletedAt) throw new AuthzError(404, 'project_not_found');

    const [investors, documents, categories, ndaVersions, signatures, activity] = await Promise.all([
      db().select({
        access: schema.projectAccess,
        investorId: schema.investors.id,
        email: schema.investors.email,
        firstName: schema.investors.firstName,
        lastName: schema.investors.lastName,
        investorStatus: schema.investors.status,
      }).from(schema.projectAccess)
        .innerJoin(schema.investors, eq(schema.projectAccess.investorId, schema.investors.id))
        .where(eq(schema.projectAccess.projectId, id)),
      db().select().from(schema.documents)
        .where(and(eq(schema.documents.projectId, id), isNull(schema.documents.deletedAt)))
        .orderBy(desc(schema.documents.updatedAt)),
      db().select().from(schema.documentCategories)
        .where(eq(schema.documentCategories.projectId, id))
        .orderBy(schema.documentCategories.sortOrder),
      db().select({
        id: schema.ndaVersions.id,
        version: schema.ndaVersions.version,
        title: schema.ndaVersions.title,
        active: schema.ndaVersions.active,
        createdAt: schema.ndaVersions.createdAt,
      }).from(schema.ndaVersions)
        .where(and(eq(schema.ndaVersions.tenant, DATAROOM_TENANT), isNull(schema.ndaVersions.projectId)))
        .orderBy(desc(schema.ndaVersions.version)),
      db().select({
        id: schema.ndaSignatures.id,
        investorId: schema.ndaSignatures.investorId,
        status: schema.ndaSignatures.status,
        signedAt: schema.ndaSignatures.signedAt,
        signerFullName: schema.ndaSignatures.signerFullName,
        hasCopy: schema.ndaSignatures.signedCopyPath,
      }).from(schema.ndaSignatures).where(eq(schema.ndaSignatures.projectId, id)),
      db().select().from(schema.auditEvents)
        .where(and(eq(schema.auditEvents.entityType, 'project'), eq(schema.auditEvents.entityId, id)))
        .orderBy(desc(schema.auditEvents.createdAt)).limit(50),
    ]);

    return Response.json({ project, investors, documents, categories, ndaVersions, signatures, activity });
  } catch (err) {
    return errorResponse(err);
  }
}

const PatchBody = z.object({
  action: z.enum(['update']),
  data: z.record(z.string(), z.unknown()).optional(),
});

const UpdateData = z.object({
  name: z.string().min(2).max(150).optional(),
  description: z.string().max(5000).optional(),
  internalCode: z.string().max(50).optional(),
  investmentType: z.string().max(80).optional(),
  ownerName: z.string().max(120).optional(),
  status: z.enum(['draft', 'active', 'temporarily_unavailable', 'closed', 'archived']).optional(),
  ndaRequired: z.boolean().optional(),
  ndaPolicy: z.enum(['resign', 'grandfather', 'block']).optional(),
});

export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const admin = await requireAdmin();
    const { id } = await ctx.params;
    const parsed = PatchBody.safeParse(await req.json());
    if (!parsed.success) return Response.json({ error: 'invalid_request' }, { status: 400 });

    const actor = { type: 'admin' as const, id: admin.userId, email: admin.email };

    if (parsed.data.action === 'update') {
      const data = UpdateData.safeParse(parsed.data.data ?? {});
      if (!data.success) return Response.json({ error: 'invalid_request' }, { status: 400 });
      await updateProject(id, data.data, actor);
      return Response.json({ ok: true });
    }

    return Response.json({ error: 'invalid_request' }, { status: 400 });
  } catch (err) {
    return errorResponse(err);
  }
}

/** DELETE — borrado lógico del proyecto (accesos revocados al instante). */
export async function DELETE(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const admin = await requireAdmin();
    const { id } = await ctx.params;
    await softDeleteProject(id, { type: 'admin', id: admin.userId, email: admin.email });
    return Response.json({ ok: true });
  } catch (err) {
    return errorResponse(err);
  }
}
