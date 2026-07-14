/**
 * Almacenamiento de documentos.
 *
 * En producción usa Google Cloud Storage (bucket privado, sin URLs públicas
 * permanentes). En desarrollo local, si no hay credenciales de GCS válidas,
 * cae automáticamente a disco local (carpeta .dataroom-storage) y sirve los
 * ficheros mediante /api/dataroom/files con una URL firmada (HMAC + caducidad).
 */
import { Storage } from '@google-cloud/storage';
import fs from 'node:fs';
import fsp from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import { env, SIGNED_URL_TTL_SECONDS } from '../config';

const LOCAL_ROOT = process.env.DATAROOM_LOCAL_DIR ?? path.join(process.cwd(), '.dataroom-storage');

/**
 * ¿Usar disco local? Sí cuando se fuerza (DATAROOM_STORAGE=local), cuando no
 * hay bucket, o cuando GCS_CREDENTIALS_JSON apunta a un fichero que no existe
 * (caso típico en local: la ruta viene copiada del backend y el .json no está).
 */
function isLocalMode(): boolean {
  if ((process.env.DATAROOM_STORAGE ?? '').toLowerCase() === 'local') return true;
  if (!process.env.GCS_BUCKET_NAME) return true;
  const creds = process.env.GCS_CREDENTIALS_JSON;
  if (creds && !creds.trim().startsWith('{') && !fs.existsSync(creds)) return true;
  return false;
}

/* ------------------------------ modo local -------------------------------- */

function fileSecret(): string {
  return process.env.CLERK_SECRET_KEY ?? process.env.SECRET_KEY ?? 'dataroom-local-secret';
}
function signLocal(payload: string): string {
  return crypto.createHmac('sha256', fileSecret()).update(payload).digest('hex').slice(0, 40);
}
/** Ruta absoluta en disco para un objeto, protegida contra path traversal. */
export function localFilePath(rel: string): string {
  const full = path.resolve(LOCAL_ROOT, rel);
  const root = path.resolve(LOCAL_ROOT);
  if (full !== root && !full.startsWith(root + path.sep)) throw new Error('invalid_path');
  return full;
}
export function verifyLocalFileToken(p: { path: string; exp: number; disposition: string; sig: string }): boolean {
  if (!p.path || !p.sig || !Number.isFinite(p.exp) || Date.now() > p.exp) return false;
  const expected = signLocal(`${p.path}|${p.exp}|${p.disposition}`);
  if (expected.length !== p.sig.length) return false;
  return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(p.sig));
}

/* -------------------------------- GCS ------------------------------------- */

let _storage: Storage | null = null;
function storage(): Storage {
  if (_storage) return _storage;
  const credsRaw = env.gcsCredentialsJson();
  if (credsRaw && credsRaw.trim().startsWith('{')) {
    _storage = new Storage({ projectId: env.gcsProjectId(), credentials: JSON.parse(credsRaw) });
  } else if (credsRaw) {
    _storage = new Storage({ projectId: env.gcsProjectId(), keyFilename: credsRaw });
  } else {
    _storage = new Storage({ projectId: env.gcsProjectId() }); // ADC
  }
  return _storage;
}
function bucket() {
  return storage().bucket(env.gcsBucket());
}

/* ------------------------------- API ------------------------------------- */

export async function uploadObject(input: {
  path: string;
  data: Buffer;
  contentType: string;
}): Promise<void> {
  if (isLocalMode()) {
    const full = localFilePath(input.path);
    await fsp.mkdir(path.dirname(full), { recursive: true });
    await fsp.writeFile(full, input.data);
    return;
  }
  await bucket().file(input.path).save(input.data, {
    contentType: input.contentType,
    resumable: false,
    metadata: { cacheControl: 'private, no-store' },
  });
}

export async function downloadObject(objectPath: string): Promise<Buffer> {
  if (isLocalMode()) return fsp.readFile(localFilePath(objectPath));
  const [data] = await bucket().file(objectPath).download();
  return data;
}

/**
 * URL de corta duración generada SOLO tras autorización en el backend.
 * En local devuelve una ruta a /api/dataroom/files firmada con HMAC.
 */
export async function signedUrl(input: {
  path: string;
  disposition: 'inline' | 'attachment';
  downloadName?: string;
  ttlSeconds?: number;
}): Promise<string> {
  const ttl = input.ttlSeconds ?? SIGNED_URL_TTL_SECONDS;
  if (isLocalMode()) {
    const exp = Date.now() + ttl * 1000;
    const sig = signLocal(`${input.path}|${exp}|${input.disposition}`);
    const qs = new URLSearchParams({ p: input.path, e: String(exp), d: input.disposition, s: sig });
    if (input.downloadName) qs.set('n', input.downloadName);
    return `/api/dataroom/files?${qs.toString()}`;
  }
  const [url] = await bucket()
    .file(input.path)
    .getSignedUrl({
      version: 'v4',
      action: 'read',
      expires: Date.now() + ttl * 1000,
      responseDisposition:
        input.disposition === 'attachment' && input.downloadName
          ? `attachment; filename="${input.downloadName}"`
          : input.disposition,
    });
  return url;
}

export async function deleteObject(objectPath: string): Promise<void> {
  if (isLocalMode()) {
    await fsp.rm(localFilePath(objectPath), { force: true });
    return;
  }
  await bucket().file(objectPath).delete({ ignoreNotFound: true });
}
