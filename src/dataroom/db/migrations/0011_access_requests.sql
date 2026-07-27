-- Solicitudes de acceso de la sección 09 · Acceso (ALT-WEB-2026-01 v1.2 §04.I).
--
-- Sustituye a Formspree: la solicitud que entra por el único botón del site
-- queda en la misma base de datos y con la misma auditoría que el resto.
-- Idempotente.

DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname='access_request_status') THEN
  CREATE TYPE dataroom.access_request_status AS ENUM ('new','answered','discarded'); END IF; END $$;

CREATE TABLE IF NOT EXISTS dataroom.access_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant text NOT NULL,
  email text NOT NULL,
  phone text,
  locale text NOT NULL DEFAULT 'es',
  status dataroom.access_request_status NOT NULL DEFAULT 'new',
  -- Consentimiento con finalidad declarada, con su versión de texto.
  consent_version text NOT NULL,
  consent_at timestamptz NOT NULL DEFAULT now(),
  -- Compromiso público: respuesta en 24 horas, en un sentido u otro.
  answered_at timestamptz,
  answered_by text,
  internal_notes text,
  ip text,
  user_agent text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS ix_access_requests_status
  ON dataroom.access_requests (tenant, status, created_at);
CREATE INDEX IF NOT EXISTS ix_access_requests_email
  ON dataroom.access_requests (email, created_at);
