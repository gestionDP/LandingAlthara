/**
 * PÚBLICO (pre-auth, token) — entrega del PDF firmado (Capa 1).
 *
 * Cada descarga queda registrada en dataroom.verification_downloads y en la
 * auditoría: quién, cuándo y qué versión se entregó. El fichero se sirve desde
 * el backend; nunca se expone una URL pública del almacén.
 */
import { downloadVerificationDocument } from '@/dataroom/services/verification';
import { rateLimit, tooManyRequests } from '@/dataroom/lib/rate-limit';
import { requestMeta } from '@/dataroom/lib/audit';

export const runtime = 'nodejs';

export async function GET(req: Request) {
  const token = new URL(req.url).searchParams.get('token') ?? '';
  const meta = requestMeta(req);

  const rl = rateLimit({
    key: `verification-download:${meta.ip ?? 'unknown'}`,
    limit: 20,
    windowMs: 60 * 60_000,
  });
  if (!rl.ok) return tooManyRequests(rl.retryAfterSeconds);

  const result = await downloadVerificationDocument(token, meta);

  if (!result.ok) {
    const status = result.reason === 'document_not_ready' ? 503 : 403;
    return Response.json({ error: result.reason }, { status });
  }

  return new Response(new Uint8Array(result.data.pdf), {
    status: 200,
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${result.data.filename}"`,
      'Cache-Control': 'private, no-store',
      'X-Robots-Tag': 'noindex, nofollow',
    },
  });
}
