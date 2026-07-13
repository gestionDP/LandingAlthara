/**
 * Google Cloud Storage — private bucket, no permanent public URLs.
 * Reads/writes under the dataroom/ prefix of the existing Althara bucket.
 */
import { Storage } from '@google-cloud/storage';
import { env, SIGNED_URL_TTL_SECONDS } from '../config';

let _storage: Storage | null = null;

function storage(): Storage {
  if (_storage) return _storage;
  const credsRaw = env.gcsCredentialsJson();
  if (credsRaw && credsRaw.trim().startsWith('{')) {
    _storage = new Storage({
      projectId: env.gcsProjectId(),
      credentials: JSON.parse(credsRaw),
    });
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

export async function uploadObject(input: {
  path: string;
  data: Buffer;
  contentType: string;
}): Promise<void> {
  await bucket().file(input.path).save(input.data, {
    contentType: input.contentType,
    resumable: false,
    metadata: { cacheControl: 'private, no-store' },
  });
}

export async function downloadObject(path: string): Promise<Buffer> {
  const [data] = await bucket().file(path).download();
  return data;
}

/**
 * Short-lived V4 signed URL, generated ONLY after backend authorization.
 * `disposition` controls inline preview vs attachment download.
 */
export async function signedUrl(input: {
  path: string;
  disposition: 'inline' | 'attachment';
  downloadName?: string;
  ttlSeconds?: number;
}): Promise<string> {
  const [url] = await bucket()
    .file(input.path)
    .getSignedUrl({
      version: 'v4',
      action: 'read',
      expires: Date.now() + (input.ttlSeconds ?? SIGNED_URL_TTL_SECONDS) * 1000,
      responseDisposition:
        input.disposition === 'attachment' && input.downloadName
          ? `attachment; filename="${input.downloadName}"`
          : input.disposition,
    });
  return url;
}

export async function deleteObject(path: string): Promise<void> {
  await bucket().file(path).delete({ ignoreNotFound: true });
}
