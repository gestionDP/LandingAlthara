/** REVISOR — aprueba o rechaza (con motivo) su visado de un documento. */
import { z } from 'zod';
import { requireReviewer, errorResponse } from '@/dataroom/lib/authz';
import { reviewDocument } from '@/dataroom/services/reviews';

export const runtime = 'nodejs';

const Body = z.object({
  role: z.enum(['legal', 'tax']),
  decision: z.enum(['approve', 'reject']),
  reason: z.string().trim().min(3).max(1000).optional(),
});

export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await ctx.params;
    const parsed = Body.safeParse(await req.json());
    if (!parsed.success) return Response.json({ error: 'invalid_request' }, { status: 400 });
    if (parsed.data.decision === 'reject' && !parsed.data.reason) {
      return Response.json({ error: 'reason_required' }, { status: 400 });
    }
    // Exige que el usuario tenga ESE rol (abogado o fiscal) concreto.
    const r = await requireReviewer(parsed.data.role);
    await reviewDocument(id, parsed.data.role, parsed.data.decision, parsed.data.reason ?? null, {
      type: 'reviewer', id: r.userId, email: r.email,
    });
    return Response.json({ ok: true });
  } catch (err) {
    return errorResponse(err);
  }
}
