/** ADMIN — list investors / create + invite investor. */
import { z } from 'zod';
import { and, desc, eq, isNull, sql } from 'drizzle-orm';
import { requireAdmin, errorResponse } from '@/dataroom/lib/authz';
import { createInvestor } from '@/dataroom/services/investors';
import { db, schema } from '@/dataroom/db/client';
import { DATAROOM_TENANT } from '@/dataroom/config';

export const runtime = 'nodejs';

export async function GET(req: Request) {
  try {
    await requireAdmin();
    const url = new URL(req.url);
    const status = url.searchParams.get('status');

    const base = and(eq(schema.investors.tenant, DATAROOM_TENANT), isNull(schema.investors.deletedAt));
    const where = status ? and(base, eq(schema.investors.status, status as never)) : base;

    const investors = await db()
      .select({
        id: schema.investors.id,
        email: schema.investors.email,
        firstName: schema.investors.firstName,
        lastName: schema.investors.lastName,
        company: schema.investors.company,
        status: schema.investors.status,
        invitedAt: schema.investors.invitedAt,
        lastAccessAt: schema.investors.lastAccessAt,
        createdAt: schema.investors.createdAt,
        projectCount: sql<number>`(
          SELECT count(*)::int FROM dataroom.project_access pa
          WHERE pa.investor_id = "dataroom"."investors"."id" AND pa.status = 'active'
        )`,
        pendingNdaCount: sql<number>`(
          SELECT count(*)::int FROM dataroom.project_access pa
          JOIN dataroom.projects p ON p.id = pa.project_id
          WHERE pa.investor_id = "dataroom"."investors"."id" AND pa.status = 'active'
            AND p.nda_required = true
            AND NOT EXISTS (
              SELECT 1 FROM dataroom.nda_signatures ns
              JOIN dataroom.nda_versions nv ON nv.id = ns.nda_version_id AND nv.active = true
              WHERE ns.investor_id = "dataroom"."investors"."id" AND ns.project_id = p.id AND ns.status = 'signed'
            )
        )`,
      })
      .from(schema.investors)
      .where(where)
      .orderBy(desc(schema.investors.createdAt))
      .limit(500);

    return Response.json({ investors });
  } catch (err) {
    return errorResponse(err);
  }
}

const CreateBody = z.object({
  email: z.string().email().max(200),
  firstName: z.string().max(100).optional(),
  lastName: z.string().max(100).optional(),
  company: z.string().max(150).optional(),
  phone: z.string().max(30).optional(),
  investorType: z.enum(['individual', 'legal_entity', 'professional', 'institutional']).optional(),
  language: z.enum(['es', 'en']).optional(),
  projectIds: z.array(z.string().uuid()).max(50).optional(),
  sendInvitation: z.boolean().optional(),
});

export async function POST(req: Request) {
  try {
    const admin = await requireAdmin();
    const parsed = CreateBody.safeParse(await req.json());
    if (!parsed.success)
      return Response.json({ error: 'invalid_request', details: parsed.error.flatten().fieldErrors }, { status: 400 });

    const investor = await createInvestor(parsed.data, {
      type: 'admin', id: admin.userId, email: admin.email,
    });
    return Response.json({ investor }, { status: 201 });
  } catch (err) {
    return errorResponse(err);
  }
}
