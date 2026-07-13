/** INVESTOR — GET: review NDA (audited). POST: sign NDA (idempotent, rate-limited). */
import { z } from 'zod';
import { requireInvestor, errorResponse } from '@/dataroom/lib/authz';
import { getNdaForSigning, signNda } from '@/dataroom/services/nda';
import { requestMeta } from '@/dataroom/lib/audit';
import { rateLimit, tooManyRequests } from '@/dataroom/lib/rate-limit';

export const runtime = 'nodejs';

export async function GET(req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const investor = await requireInvestor();
    const { id } = await ctx.params;
    const result = await getNdaForSigning(investor, id, requestMeta(req));
    return Response.json(result);
  } catch (err) {
    return errorResponse(err);
  }
}

const SignBody = z.object({
  ndaVersionId: z.string().uuid(),
  signerFullName: z.string().min(5).max(150),
  accepted: z.literal(true),
});

export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const investor = await requireInvestor();
    const { id } = await ctx.params;

    const rl = rateLimit({ key: `nda-sign:${investor.id}`, limit: 5, windowMs: 60_000 });
    if (!rl.ok) return tooManyRequests(rl.retryAfterSeconds);

    const parsed = SignBody.safeParse(await req.json());
    if (!parsed.success) return Response.json({ error: 'invalid_request' }, { status: 400 });

    const result = await signNda(investor, { projectId: id, ...parsed.data }, requestMeta(req));
    return Response.json(result);
  } catch (err) {
    return errorResponse(err);
  }
}
