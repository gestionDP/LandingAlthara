/**
 * Dataroom configuration. Server-only.
 * Reuses Althara_back infrastructure: Neon Postgres, Clerk, GCS, Resend.
 */

export const DATAROOM_TENANT = process.env.DATAROOM_TENANT ?? 'althara';

export const INVITATION_TTL_HOURS = Number(process.env.DATAROOM_INVITATION_TTL_HOURS ?? 72);

export const SIGNED_URL_TTL_SECONDS = Number(process.env.DATAROOM_SIGNED_URL_TTL ?? 60);

/** Max upload size in bytes (default 50 MB). */
export const MAX_UPLOAD_BYTES = Number(process.env.DATAROOM_MAX_UPLOAD_MB ?? 50) * 1024 * 1024;

/** Max PDF size we watermark in-process (larger files fall back to signed URL + audit). */
export const MAX_WATERMARK_BYTES = 25 * 1024 * 1024;

export const NDA_POLICIES = ['resign', 'grandfather', 'block'] as const;
export type NdaPolicy = (typeof NDA_POLICIES)[number];

/** Version of legal texts accepted at registration. Bump when texts change. */
export const LEGAL_TERMS_VERSION = process.env.DATAROOM_TERMS_VERSION ?? '2026-07-v1';

/* ---------- Capa 1: documento de verificación (ALT-WEB-2026-01 §06) -------- */

/**
 * Documento firmado por el administrador. Disciplina de versión: el documento
 * firmado se congela; cualquier cambio de cifras obliga a emitir una nueva
 * referencia (ALT-TR-2026-02) con nueva fecha y firma. Nunca dos versiones
 * firmadas en circulación simultánea.
 */
export const VERIFICATION_DOC_REF = process.env.VERIFICATION_DOC_REF ?? 'ALT-TR-2026-01';
export const VERIFICATION_DOC_VERSION = process.env.VERIFICATION_DOC_VERSION ?? 'v1.0';

/** Ruta del PDF en el almacén (GCS en producción, disco local en desarrollo). */
export const VERIFICATION_DOC_PATH = (locale: 'es' | 'en'): string =>
  process.env.VERIFICATION_DOC_PATH ??
  `verification/${VERIFICATION_DOC_REF}-${VERIFICATION_DOC_VERSION}-${locale}.pdf`;

/** Validez del enlace de confirmación y descarga, en horas. */
export const VERIFICATION_TOKEN_TTL_HOURS = Number(
  process.env.VERIFICATION_TOKEN_TTL_HOURS ?? 720, // 30 días
);

export function requiredEnv(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing required env var: ${name}`);
  return v;
}

export const env = {
  databaseUrl: () => requiredEnv('DATABASE_URL'),
  gcsBucket: () => requiredEnv('GCS_BUCKET_NAME'),
  gcsProjectId: () => process.env.GCS_PROJECT_ID,
  gcsCredentialsJson: () => process.env.GCS_CREDENTIALS_JSON, // path or inline JSON
  resendApiKey: () => requiredEnv('RESEND_API_KEY'),
  resendFrom: () => process.env.RESEND_FROM_EMAIL ?? 'noreply@crm.althara.es',
  resendFromName: () => process.env.RESEND_FROM_NAME ?? 'Althara',
  /** Buzón real del administrador para avisos internos (KYC, visados). */
  adminEmail: () => process.env.DATAROOM_ADMIN_EMAIL ?? process.env.ADMIN_EMAIL ?? process.env.RESEND_FROM_EMAIL ?? 'info@gestiondelpapeleo.com',
  /** Buzón del revisor legal (abogado). */
  legalEmail: () => process.env.DATAROOM_LEGAL_EMAIL ?? null,
  appBaseUrl: () => process.env.NEXT_PUBLIC_APP_URL ?? 'https://althara.es',
};
