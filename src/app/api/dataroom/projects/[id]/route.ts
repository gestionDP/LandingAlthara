/** INVESTOR — project detail + authorized document list. IDOR-safe: 404 for anything not assigned. */
import { and, eq } from 'drizzle-orm';
import { requireInvestor, errorResponse, AuthzError } from '@/dataroom/lib/authz';
import { computeProjectVisibility } from '@/dataroom/core/access.ts';
import { ndaStateFor } from '@/dataroom/services/projects';
import { listAuthorizedDocuments } from '@/dataroom/services/documents';
import { db, schema } from '@/dataroom/db/client';
import { DATAROOM_TENANT } from '@/dataroom/config';

export const runtime = 'nodejs';

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const investor = await requireInvestor();
    const { id } = await ctx.params;

    const [project] = await db().select().from(schema.projects)
      .where(and(eq(schema.projects.id, id), eq(schema.projects.tenant, DATAROOM_TENANT))).limit(1);
    if (!project || project.deletedAt) throw new AuthzError(404, 'not_found');

    const [assignment] = await db().select().from(schema.projectAccess).where(and(
      eq(schema.projectAccess.investorId, investor.id),
      eq(schema.projectAccess.projectId, id),
    )).limit(1);

    const visible = computeProjectVisibility({
      sameTenant: investor.tenant === project.tenant,
      investorStatus: investor.status,
      projectStatus: project.status,
      assignment: assignment ? { status: assignment.status } : null,
    });
    // Same 404 as nonexistent: never reveal that the project exists.
    if (!visible) throw new AuthzError(404, 'not_found');

    const [documents, ndaState, categories] = await Promise.all([
      listAuthorizedDocuments(investor, id),
      ndaStateFor(investor, project),
      db().select().from(schema.documentCategories)
        .where(eq(schema.documentCategories.projectId, id))
        .orderBy(schema.documentCategories.sortOrder),
    ]);

    return Response.json({
      project: {
        id: project.id,
        name: project.name,
        description: project.description,
        status: project.status,
        investmentType: project.investmentType,
        updatedAt: project.updatedAt,
        ndaRequired: project.ndaRequired,
      },
      accessStatus: assignment?.status,
      ndaState,
      categories: categories.map((c) => ({ id: c.id, name: c.name, slug: c.slug, parentId: c.parentId })),
      documents,
    });
  } catch (err) {
    return errorResponse(err);
  }
}
