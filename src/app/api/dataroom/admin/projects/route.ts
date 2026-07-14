/** ADMIN — list / create projects. */
import { z } from 'zod';
import { and, desc, eq, isNull, sql } from 'drizzle-orm';
import { requireAdmin, errorResponse } from '@/dataroom/lib/authz';
import { createProject } from '@/dataroom/services/projects';
import { db, schema } from '@/dataroom/db/client';
import { DATAROOM_TENANT } from '@/dataroom/config';

export const runtime = 'nodejs';

export async function GET() {
  try {
    await requireAdmin();
    const projects = await db()
      .select({
        id: schema.projects.id,
        name: schema.projects.name,
        slug: schema.projects.slug,
        internalCode: schema.projects.internalCode,
        status: schema.projects.status,
        investmentType: schema.projects.investmentType,
        ownerName: schema.projects.ownerName,
        ndaRequired: schema.projects.ndaRequired,
        ndaPolicy: schema.projects.ndaPolicy,
        updatedAt: schema.projects.updatedAt,
        investorCount: sql<number>`(
          SELECT count(*)::int FROM dataroom.project_access pa
          WHERE pa.project_id = "dataroom"."projects"."id" AND pa.status = 'active'
        )`,
        documentCount: sql<number>`(
          SELECT count(*)::int FROM dataroom.documents d
          WHERE d.project_id = "dataroom"."projects"."id" AND d.status = 'published'
        )`,
      })
      .from(schema.projects)
      .where(and(eq(schema.projects.tenant, DATAROOM_TENANT), isNull(schema.projects.deletedAt)))
      .orderBy(desc(schema.projects.updatedAt));
    return Response.json({ projects });
  } catch (err) {
    return errorResponse(err);
  }
}

const CreateBody = z.object({
  name: z.string().min(2).max(150),
  internalCode: z.string().max(50).optional(),
  description: z.string().max(5000).optional(),
  investmentType: z.string().max(80).optional(),
  ownerName: z.string().max(120).optional(),
  ndaRequired: z.boolean().optional(),
  ndaPolicy: z.enum(['resign', 'grandfather', 'block']).optional(),
});

export async function POST(req: Request) {
  try {
    const admin = await requireAdmin();
    const parsed = CreateBody.safeParse(await req.json());
    if (!parsed.success)
      return Response.json({ error: 'invalid_request', details: parsed.error.flatten().fieldErrors }, { status: 400 });
    const project = await createProject(parsed.data, { type: 'admin', id: admin.userId, email: admin.email });
    return Response.json({ project }, { status: 201 });
  } catch (err) {
    return errorResponse(err);
  }
}
