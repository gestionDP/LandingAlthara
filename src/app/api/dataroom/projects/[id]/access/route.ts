/** INVESTOR — acepta o rechaza una invitación pendiente a un proyecto. */
import { requireInvestor, errorResponse } from '@/dataroom/lib/authz';
import { respondProjectInvitation } from '@/dataroom/services/projects';

export const runtime = 'nodejs';

export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const investor = await requireInvestor();
    const { id } = await ctx.params;
    const body = (await req.json().catch(() => null)) as { action?: string } | null;
    if (body?.action !== 'accept' && body?.action !== 'reject') {
      return Response.json({ error: 'invalid_action' }, { status: 400 });
    }
    const res = await respondProjectInvitation(investor, id, body.action === 'accept');
    return Response.json(res);
  } catch (err) {
    return errorResponse(err);
  }
}
