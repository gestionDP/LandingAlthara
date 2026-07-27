-- Capa 1: documento de verificación (ALT-WEB-2026-01 v1.2 §06).
--
-- Registro de solicitudes del documento de verificación firmado y de cada
-- descarga (quién, cuándo, versión entregada). Idempotente.

DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname='verification_request_status') THEN
  CREATE TYPE dataroom.verification_request_status AS ENUM
    ('pending_confirmation','confirmed','revoked','expired'); END IF; END $$;

CREATE TABLE IF NOT EXISTS dataroom.verification_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant text NOT NULL,
  name text NOT NULL,
  email text NOT NULL,
  phone text,
  locale text NOT NULL DEFAULT 'es',
  status dataroom.verification_request_status NOT NULL DEFAULT 'pending_confirmation',
  -- SHA-256 del token en crudo; el token nunca se almacena.
  token_hash text NOT NULL,
  expires_at timestamptz NOT NULL,
  confirmed_at timestamptz,
  revoked_at timestamptz,
  -- Finalidad declarada aceptada por el solicitante, con su versión de texto.
  consent_version text NOT NULL,
  consent_at timestamptz NOT NULL DEFAULT now(),
  -- Versión del documento vigente en el momento de la solicitud.
  document_ref text NOT NULL,
  document_version text NOT NULL,
  ip text,
  user_agent text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_verification_requests_token_hash
  ON dataroom.verification_requests (token_hash);
CREATE INDEX IF NOT EXISTS ix_verification_requests_email
  ON dataroom.verification_requests (email, created_at);

-- Registro de descargas. Append-only por disciplina: nunca se actualiza.
CREATE TABLE IF NOT EXISTS dataroom.verification_downloads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant text NOT NULL,
  request_id uuid NOT NULL REFERENCES dataroom.verification_requests(id),
  document_ref text NOT NULL,
  document_version text NOT NULL,
  ip text,
  user_agent text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS ix_verification_downloads_request
  ON dataroom.verification_downloads (request_id, created_at);
