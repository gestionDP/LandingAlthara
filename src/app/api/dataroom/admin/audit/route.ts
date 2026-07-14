/** ADMIN — audit trail query (filterable, paginated, read-only). */
import { and, desc, eq, type SQL } from 'drizzle-orm';
import { requireAdmin, errorResponse } from '@/dataroom/lib/authz';
import { db, schema } from '@/dataroom/db/client';
import { DATAROOM_TENANT } from '@/dataroom/config';

export const runtime = 'nodejs';

export async function GET(req: Request) {
  try {
    await requireAdmin();
    const url = new URL(req.url);
    const action = url.searchParams.get('action');
    const entityType = url.searchParams.get('entityType');
    const entityId = url.searchParams.get('entityId');
    const limit = Math.min(Number(url.searchParams.get('limit') ?? 100), 500);
    const offset = Math.max(Number(url.searchParams.get('offset') ?? 0), 0);

    const conditions: SQL[] = [eq(schema.auditEvents.tenant, DATAROOM_TENANT)];
    if (action) conditions.push(eq(schema.auditEvents.action, action));
    if (entityType) conditions.push(eq(schema.auditEvents.entityType, entityType));
    if (entityId) conditions.push(eq(schema.auditEvents.entityId, entityId));

    const events = await db().select().from(schema.auditEvents)
      .where(and(...conditions))
      .orderBy(desc(schema.auditEvents.createdAt))
      .limit(limit).offset(offset);

    return Response.json({ events, limit, offset });
  } catch (err) {
    return errorResponse(err);
  }
}
