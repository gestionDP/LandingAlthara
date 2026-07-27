/**
 * PÚBLICO (pre-auth) — solicitud del documento de verificación (Capa 1).
 * ALT-WEB-2026-01 v1.2 §06. Fuertemente limitado por frecuencia.
 *
 * La respuesta es siempre la misma tanto si el email es nuevo como si ya
 * había solicitado el documento: no se filtra quién está en la lista.
 */
import { z } from 'zod';
import { requestVerificationDocument } from '@/dataroom/services/verification';
import { rateLimit, tooManyRequests } from '@/dataroom/lib/rate-limit';
import { requestMeta } from '@/dataroom/lib/audit';
import { errorResponse } from '@/dataroom/lib/authz';

export const runtime = 'nodejs';

const Body = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(200),
  phone: z.string().trim().max(40).optional().or(z.literal('')),
  locale: z.enum(['es', 'en']).default('es'),
  // Finalidad declarada: entrega del documento y posible contacto comercial.
  consent: z.literal(true),
});

export async function POST(req: Request) {
  try {
    const meta = requestMeta(req);
    const rl = rateLimit({
      key: `verification-request:${meta.ip ?? 'unknown'}`,
      limit: 5,
      windowMs: 60 * 60_000,
    });
    if (!rl.ok) return tooManyRequests(rl.retryAfterSeconds);

    const parsed = Body.safeParse(await req.json());
    if (!parsed.success) return Response.json({ error: 'invalid_request' }, { status: 400 });

    await requestVerificationDocument({
      name: parsed.data.name,
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
