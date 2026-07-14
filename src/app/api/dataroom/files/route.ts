/**
 * Sirve ficheros del almacenamiento LOCAL (solo dev, cuando no hay GCS).
 * El acceso se valida con la URL firmada (HMAC + caducidad) que genera
 * storage.signedUrl(); nunca se sirve una ruta sin firma válida.
 */
import fs from 'node:fs';
import fsp from 'node:fs/promises';
import { verifyLocalFileToken, localFilePath } from '@/dataroom/lib/storage';

export const runtime = 'nodejs';

const CONTENT_TYPES: Record<string, string> = {
  pdf: 'application/pdf',
  png: 'image/png',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  webp: 'image/webp',
  gif: 'image/gif',
  csv: 'text/csv',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
};

export async function GET(req: Request) {
  const u = new URL(req.url);
  const p = u.searchParams.get('p') ?? '';
  const exp = Number(u.searchParams.get('e') ?? '0');
  const disposition = u.searchParams.get('d') ?? 'inline';
  const sig = u.searchParams.get('s') ?? '';
  const name = u.searchParams.get('n') ?? undefined;

  if (!verifyLocalFileToken({ path: p, exp, disposition, sig })) {
    return new Response('Forbidden', { status: 403 });
  }

  let full: string;
  try {
    full = localFilePath(p);
  } catch {
    return new Response('Bad request', { status: 400 });
  }
  if (!fs.existsSync(full)) return new Response('Not found', { status: 404 });

  const data = await fsp.readFile(full);
  const ext = p.toLowerCase().match(/\.([a-z0-9]+)$/)?.[1] ?? '';
  const contentType = CONTENT_TYPES[ext] ?? 'application/octet-stream';
  const contentDisposition =
    disposition === 'attachment'
      ? `attachment; filename="${(name ?? 'documento').replace(/"/g, '')}"`
      : 'inline';

  return new Response(new Uint8Array(data), {
    headers: {
      'Content-Type': contentType,
      'Content-Disposition': contentDisposition,
      'Cache-Control': 'private, no-store',
    },
  });
}
