/** REVISOR — vista global de todos los documentos de todos los proyectos. */
import { requireReviewer, errorResponse } from '@/dataroom/lib/authz';
import { listAllForReview } from '@/dataroom/services/reviews';

export const runtime = 'nodejs';

export async function GET() {
  try {
    const r = await requireReviewer();
    const items = await listAllForReview();
    return Response.json({ roles: r.roles, items });
  } catch (err) {
    return errorResponse(err);
  }
}
