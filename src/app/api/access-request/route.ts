/**
 * PÚBLICO (pre-auth) — solicitud de acceso de la sección 09 (ALT-WEB-2026-01 §04.I).
 * Sustituye al envío a Formspree. Fuertemente limitado por frecuencia.
 */
import { z } from 'zod';
import { createAccessRequest } from '@/dataroom/services/access-requests';
import { rateLimit, tooManyRequests } from '@/dataroom/lib/rate-limit';
import { requestMeta } from '@/dataroom/lib/audit';
import { errorResponse } from '@/dataroom/lib/authz';

export const runtime = 'nodejs';

const Body = z.object({
  email: z.string().trim().email().max(200),
  phone: z.string().trim().max(40).optional().or(z.literal('')),
  locale: z.enum(['es', 'en']).default('es'),
  consent: z.literal(true),
});

export async function POST(req: Request) {
  try {
    const meta = requestMeta(req);
    const rl = rateLimit({
      key: `access-request:${meta.ip ?? 'unknown'}`,
      limit: 5,
      windowMs: 60 * 60_000,
    });
    if (!rl.ok) return tooManyRequests(rl.retryAfterSeconds);

    const parsed = Body.safeParse(await req.json());
    if (!parsed.success) return Response.json({ error: 'invalid_request' }, { status: 400 });

    await createAccessRequest({
      email: parsed.data.email,
      phone: parsed.data.phone || null,
      locale: parsed.data.locale,
      meta,
    });

    return Response.json({ ok: true });
  } catch (err) {
    return errorResponse(err);
  }
}
