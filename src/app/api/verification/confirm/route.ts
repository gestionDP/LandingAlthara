/**
 * PÚBLICO (pre-auth) — confirmación del doble opt-in (Capa 1).
 * Se llega desde el enlace del correo; siempre redirige a una página, nunca
 * devuelve JSON al navegador.
 */
import { NextResponse } from 'next/server';
import { confirmVerificationRequest } from '@/dataroom/services/verification';
import { rateLimit, tooManyRequests } from '@/dataroom/lib/rate-limit';
import { requestMeta } from '@/dataroom/lib/audit';

export const runtime = 'nodejs';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const token = url.searchParams.get('token') ?? '';
  const meta = requestMeta(req);

  const rl = rateLimit({
    key: `verification-confirm:${meta.ip ?? 'unknown'}`,
    limit: 20,
    windowMs: 60_000,
  });
  if (!rl.ok) return tooManyRequests(rl.retryAfterSeconds);

  const result = await confirmVerificationRequest(token, meta);

  if (!result.ok) {
    return NextResponse.redirect(new URL(`/verificacion?error=${result.reason}`, url.origin));
  }

  return NextResponse.redirect(
    new URL(`/verificacion/documento?token=${encodeURIComponent(token)}`, url.origin),
  );
}
