/** ADMIN — NDA global del portal: versiones y firmas. */
import { z } from 'zod';
import { and, desc, eq, isNull } from 'drizzle-orm';
import { requireAdmin, errorResponse } from '@/dataroom/lib/authz';
import { createNdaVersion } from '@/dataroom/services/nda';
import { db, schema } from '@/dataroom/db/client';
import { DATAROOM_TENANT } from '@/dataroom/config';

export const runtime = 'nodejs';

export async function GET() {
  try {
    await requireAdmin();
    const [versions, signatures] = await Promise.all([
      db().select({
        id: schema.ndaVersions.id,
        version: schema.ndaVersions.version,
        title: schema.ndaVersions.title,
        bodyText: schema.ndaVersions.bodyText,
        active: schema.ndaVersions.active,
        createdAt: schema.ndaVersions.createdAt,
      }).from(schema.ndaVersions)
        .where(and(eq(schema.ndaVersions.tenant, DATAROOM_TENANT), isNull(schema.ndaVersions.projectId)))
        .orderBy(desc(schema.ndaVersions.version)),
      db().select({
        id: schema.ndaSignatures.id,
        status: schema.ndaSignatures.status,
        signedAt: schema.ndaSignatures.signedAt,
        signerFullName: schema.ndaSignatures.signerFullName,
        email: schema.investors.email,
        version: schema.ndaVersions.version,
      }).from(schema.ndaSignatures)
        .innerJoin(schema.investors, eq(schema.ndaSignatures.investorId, schema.investors.id))
        .innerJoin(schema.ndaVersions, eq(schema.ndaSignatures.ndaVersionId, schema.ndaVersions.id))
        .where(eq(schema.ndaSignatures.tenant, DATAROOM_TENANT))
        .orderBy(desc(schema.ndaSignatures.signedAt)),
    ]);
    return Response.json({ versions, signatures });
  } catch (err) {
    return errorResponse(err);
  }
}

const Body = z.object({
  title: z.string().min(2).max(200),
  bodyText: z.string().min(50).max(100_000),
});

export async function POST(req: Request) {
  try {
    const admin = await requireAdmin();
    const parsed = Body.safeParse(await req.json());
    if (!parsed.success) return Response.json({ error: 'invalid_request' }, { status: 400 });
    const version = await createNdaVersion(parsed.data, { type: 'admin', id: admin.userId, email: admin.email });
    return Response.json({ ok: true, version: version.version }, { status: 201 });
  } catch (err) {
    return errorResponse(err);
  }
}
