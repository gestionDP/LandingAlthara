/** PUBLIC (pre-auth) — completes registration from an invitation token. */
import { z } from 'zod';
import { completeRegistration } from '@/dataroom/services/investors';
import { rateLimit, tooManyRequests } from '@/dataroom/lib/rate-limit';
import { requestMeta } from '@/dataroom/lib/audit';
import { errorResponse } from '@/dataroom/lib/authz';

export const runtime = 'nodejs';

const Body = z.object({
  token: z.string().min(10).max(100),
  password: z.string().min(1).max(200),
  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(100),
  phone: z.string().max(30).optional(),
  country: z.string().min(2).max(80),
  company: z.string().max(150).optional(),
  investorType: z.enum(['individual', 'legal_entity', 'professional', 'institutional']),
  acceptPrivacy: z.literal(true),
  acceptTerms: z.literal(true),
  language: z.enum(['es', 'en']).optional(),
  kyc: z.object({
    documentType: z.enum(['dni', 'nie', 'passport', 'other']),
    documentNumber: z.string().trim().min(3).max(60),
    residenceCountry: z.string().trim().length(2),
    investorProfile: z.object({
      investorType: z.string().optional(),
      ticketRange: z.string().optional(),
      experience: z.string().optional(),
    }).passthrough(),
  }),
});

export async function POST(req: Request) {
  try {
    const meta = requestMeta(req);
    const rl = rateLimit({ key: `inv-complete:${meta.ip ?? 'unknown'}`, limit: 5, windowMs: 60_000 });
    if (!rl.ok) return tooManyRequests(rl.retryAfterSeconds);

    const parsed = Body.safeParse(await req.json());
    if (!parsed.success)
      return Response.json({ error: 'invalid_request', details: parsed.error.flatten().fieldErrors }, { status: 400 });

    const result = await completeRegistration(parsed.data, meta);
    if (!result.ok) {
      const status = result.reason === 'weak_password' || result.reason === 'legal_not_accepted' ? 422 : 400;
      return Response.json(
        { ok: false, reason: result.reason, errors: 'errors' in result ? result.errors : undefined },
        { status },
      );
    }
    return Response.json({ ok: true });
  } catch (err) {
    return errorResponse(err);
  }
}
