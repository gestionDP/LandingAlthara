/** REVISOR (abogado) — cola de documentos pendientes de su visado. */
import { requireReviewer, errorResponse } from '@/dataroom/lib/authz';
import { listPendingReviews } from '@/dataroom/services/reviews';

export const runtime = 'nodejs';

export async function GET() {
  try {
    const r = await requireReviewer();
    const items = await listPendingReviews(r.roles);
    return Response.json({ roles: r.roles, items });
  } catch (err) {
    return errorResponse(err);
  }
}
