/** PUBLIC (pre-auth) — validates an invitation token. Heavily rate-limited. */
import { z } from 'zod';
import { validateInvitationToken } from '@/dataroom/services/investors';
import { rateLimit, tooManyRequests } from '@/dataroom/lib/rate-limit';
import { requestMeta } from '@/dataroom/lib/audit';
import { errorResponse } from '@/dataroom/lib/authz';

export const runtime = 'nodejs';

const Body = z.object({ token: z.string().min(10).max(100) });

export async function POST(req: Request) {
  try {
    const meta = requestMeta(req);
    const rl = rateLimit({ key: `inv-validate:${meta.ip ?? 'unknown'}`, limit: 10, windowMs: 60_000 });
    if (!rl.ok) return tooManyRequests(rl.retryAfterSeconds);

    const parsed = Body.safeParse(await req.json());
    if (!parsed.success) return Response.json({ error: 'invalid_request' }, { status: 400 });

    const result = await validateInvitationToken(parsed.data.token, meta);
    if (!result.ok) return Response.json({ ok: false, reason: result.reason }, { status: 400 });

    // Prefill data only — never internal IDs beyond what the form needs.
    return Response.json({ ok: true, investor: result.investor });
  } catch (err) {
    return errorResponse(err);
  }
}
