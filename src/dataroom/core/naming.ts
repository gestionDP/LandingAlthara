/**
 * File validation and safe storage naming. Pure module.
 */

export const ALLOWED_FILE_TYPES: Record<string, string[]> = {
  // extension -> allowed MIME types
  pdf: ['application/pdf'],
  docx: ['application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
  xlsx: ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'],
  pptx: ['application/vnd.openxmlformats-officedocument.presentationml.presentation'],
  csv: ['text/csv', 'application/csv', 'text/plain'],
  png: ['image/png'],
  jpg: ['image/jpeg'],
  jpeg: ['image/jpeg'],
  webp: ['image/webp'],
  // zip intentionally excluded by default; enable only after explicit validation
};

const BLOCKED_EXTENSIONS = new Set([
  'exe', 'bat', 'cmd', 'sh', 'js', 'mjs', 'html', 'htm', 'svg', 'php', 'jar', 'msi', 'dll',
  'scr', 'vbs', 'ps1', 'apk', 'com', 'zip',
]);

export function fileExtension(name: string): string {
  const idx = name.lastIndexOf('.');
  return idx === -1 ? '' : name.slice(idx + 1).toLowerCase();
}

export function validateUpload(input: {
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  maxBytes: number;
}): { ok: true; ext: string } | { ok: false; error: string } {
  const ext = fileExtension(input.fileName);
  if (!ext) return { ok: false, error: 'missing_extension' };
  if (BLOCKED_EXTENSIONS.has(ext)) return { ok: false, error: 'blocked_extension' };
  const allowedMimes = ALLOWED_FILE_TYPES[ext];
  if (!allowedMimes) return { ok: false, error: 'extension_not_allowed' };
  if (!allowedMimes.includes(input.mimeType)) return { ok: false, error: 'mime_mismatch' };
  if (input.sizeBytes <= 0) return { ok: false, error: 'empty_file' };
  if (input.sizeBytes > input.maxBytes) return { ok: false, error: 'file_too_large' };
  return { ok: true, ext };
}

/** Storage names are opaque: never derived from the user-provided filename. */
export function buildStoragePath(input: {
  tenant: string;
  projectId: string;
  documentId: string;
  versionId: string;
  ext: string;
}): string {
  return `dataroom/${input.tenant}/${input.projectId}/${input.documentId}/${input.versionId}.${input.ext}`;
}

/** Sanitized filename used only in Content-Disposition on download. */
export function safeDownloadName(title: string, ext: string): string {
  const base = title
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-zA-Z0-9._ -]/g, '')
    .trim()
    .replace(/\s+/g, '_')
    .slice(0, 80) || 'document';
  return `${base}.${ext}`;
}

export function slugify(name: string): string {
  return name
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);
}

/** Partially mask an email for watermarks / UI (j***@d***.com). */
export function maskEmail(email: string): string {
  const [user, domain] = email.split('@');
  if (!domain) return '***';
  const maskedUser = user.slice(0, 1) + '***';
  const dotIdx = domain.lastIndexOf('.');
  const maskedDomain =
    dotIdx > 0 ? domain.slice(0, 1) + '***' + domain.slice(dotIdx) : domain.slice(0, 1) + '***';
  return `${maskedUser}@${maskedDomain}`;
}
