-- Dataroom initial migration. Idempotent. Run with: npm run dataroom:migrate
-- All objects live in the dedicated "dataroom" schema (logical isolation from public/*).

CREATE SCHEMA IF NOT EXISTS dataroom;

DO $$ BEGIN
  CREATE TYPE dataroom.investor_status AS ENUM ('draft','invited','invitation_expired','invitation_revoked','registration_started','active','suspended','disabled');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE TYPE dataroom.investor_type AS ENUM ('individual','legal_entity','professional','institutional');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE TYPE dataroom.invitation_status AS ENUM ('pending','used','revoked','expired');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE TYPE dataroom.project_status AS ENUM ('draft','active','temporarily_unavailable','closed','archived');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE TYPE dataroom.access_status AS ENUM ('active','suspended','revoked');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE TYPE dataroom.access_level AS ENUM ('generic','full');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE TYPE dataroom.confidentiality AS ENUM ('generic','sensitive');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE TYPE dataroom.document_status AS ENUM ('draft','published','archived','revoked');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE TYPE dataroom.version_status AS ENUM ('draft','published','superseded','archived','revoked');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE TYPE dataroom.permission_effect AS ENUM ('allow','deny');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE TYPE dataroom.nda_signature_status AS ENUM ('signed','expired','revoked');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE TYPE dataroom.nda_policy AS ENUM ('resign','grandfather','block');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS dataroom.investors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant text NOT NULL,
  email text NOT NULL,
  clerk_user_id text,
  first_name text,
  last_name text,
  company text,
  phone text,
  country text,
  investor_type dataroom.investor_type,
  language text NOT NULL DEFAULT 'es',
  status dataroom.investor_status NOT NULL DEFAULT 'draft',
  privacy_accepted_at timestamptz,
  terms_accepted_at timestamptz,
  terms_version text,
  internal_notes text,
  invited_at timestamptz,
  activated_at timestamptz,
  last_access_at timestamptz,
  created_by text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz
);
CREATE UNIQUE INDEX IF NOT EXISTS uq_investors_tenant_email ON dataroom.investors (tenant, email);
CREATE UNIQUE INDEX IF NOT EXISTS uq_investors_clerk_user ON dataroom.investors (clerk_user_id) WHERE clerk_user_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS ix_investors_tenant_status ON dataroom.investors (tenant, status);

CREATE TABLE IF NOT EXISTS dataroom.invitations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant text NOT NULL,
  investor_id uuid NOT NULL REFERENCES dataroom.investors(id),
  token_hash text NOT NULL,
  status dataroom.invitation_status NOT NULL DEFAULT 'pending',
  expires_at timestamptz NOT NULL,
  used_at timestamptz,
  revoked_at timestamptz,
  attempt_count integer NOT NULL DEFAULT 0,
  created_by text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS uq_invitations_token_hash ON dataroom.invitations (token_hash);
CREATE INDEX IF NOT EXISTS ix_invitations_investor ON dataroom.invitations (investor_id);

CREATE TABLE IF NOT EXISTS dataroom.projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant text NOT NULL,
  name text NOT NULL,
  slug text NOT NULL,
  internal_code text,
  description text,
  cover_image_path text,
  status dataroom.project_status NOT NULL DEFAULT 'draft',
  investment_type text,
  owner_name text,
  visibility text NOT NULL DEFAULT 'private',
  nda_required boolean NOT NULL DEFAULT true,
  nda_policy dataroom.nda_policy NOT NULL DEFAULT 'resign',
  created_by text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz
);
CREATE UNIQUE INDEX IF NOT EXISTS uq_projects_tenant_slug ON dataroom.projects (tenant, slug);
CREATE INDEX IF NOT EXISTS ix_projects_tenant_status ON dataroom.projects (tenant, status);

CREATE TABLE IF NOT EXISTS dataroom.project_access (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant text NOT NULL,
  investor_id uuid NOT NULL REFERENCES dataroom.investors(id),
  project_id uuid NOT NULL REFERENCES dataroom.projects(id),
  status dataroom.access_status NOT NULL DEFAULT 'active',
  access_level dataroom.access_level NOT NULL DEFAULT 'full',
  granted_by text,
  granted_at timestamptz NOT NULL DEFAULT now(),
  revoked_at timestamptz,
  revoked_by text,
  internal_notes text
);
CREATE UNIQUE INDEX IF NOT EXISTS uq_project_access ON dataroom.project_access (investor_id, project_id);
CREATE INDEX IF NOT EXISTS ix_project_access_project ON dataroom.project_access (project_id);

CREATE TABLE IF NOT EXISTS dataroom.document_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant text NOT NULL,
  project_id uuid NOT NULL REFERENCES dataroom.projects(id),
  name text NOT NULL,
  slug text NOT NULL,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS uq_categories_project_slug ON dataroom.document_categories (project_id, slug);

CREATE TABLE IF NOT EXISTS dataroom.documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant text NOT NULL,
  project_id uuid NOT NULL REFERENCES dataroom.projects(id),
  category_id uuid REFERENCES dataroom.document_categories(id),
  title text NOT NULL,
  description text,
  confidentiality dataroom.confidentiality NOT NULL DEFAULT 'sensitive',
  downloadable boolean NOT NULL DEFAULT true,
  requires_nda boolean NOT NULL DEFAULT true,
  status dataroom.document_status NOT NULL DEFAULT 'draft',
  current_version_id uuid,
  created_by text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz
);
CREATE INDEX IF NOT EXISTS ix_documents_project_status ON dataroom.documents (project_id, status);
CREATE INDEX IF NOT EXISTS ix_documents_tenant ON dataroom.documents (tenant);

CREATE TABLE IF NOT EXISTS dataroom.document_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id uuid NOT NULL REFERENCES dataroom.documents(id),
  version_number integer NOT NULL,
  storage_path text NOT NULL,
  original_name text NOT NULL,
  mime_type text NOT NULL,
  size_bytes bigint NOT NULL,
  sha256 text NOT NULL,
  status dataroom.version_status NOT NULL DEFAULT 'published',
  version_comment text,
  uploaded_by text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS uq_versions_doc_number ON dataroom.document_versions (document_id, version_number);

CREATE TABLE IF NOT EXISTS dataroom.document_permissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant text NOT NULL,
  document_id uuid NOT NULL REFERENCES dataroom.documents(id),
  investor_id uuid NOT NULL REFERENCES dataroom.investors(id),
  effect dataroom.permission_effect NOT NULL,
  can_download boolean NOT NULL DEFAULT true,
  created_by text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS uq_doc_permission ON dataroom.document_permissions (document_id, investor_id);

CREATE TABLE IF NOT EXISTS dataroom.nda_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant text NOT NULL,
  project_id uuid NOT NULL REFERENCES dataroom.projects(id),
  version integer NOT NULL,
  title text NOT NULL,
  body_text text NOT NULL,
  body_sha256 text NOT NULL,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS uq_nda_project_version ON dataroom.nda_versions (project_id, version);

CREATE TABLE IF NOT EXISTS dataroom.nda_signatures (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant text NOT NULL,
  investor_id uuid NOT NULL REFERENCES dataroom.investors(id),
  project_id uuid NOT NULL REFERENCES dataroom.projects(id),
  nda_version_id uuid NOT NULL REFERENCES dataroom.nda_versions(id),
  status dataroom.nda_signature_status NOT NULL DEFAULT 'signed',
  signed_at timestamptz NOT NULL DEFAULT now(),
  signer_full_name text NOT NULL,
  ip text,
  user_agent text,
  evidence jsonb,
  signed_copy_path text
);
CREATE UNIQUE INDEX IF NOT EXISTS uq_nda_signature ON dataroom.nda_signatures (investor_id, nda_version_id);
CREATE INDEX IF NOT EXISTS ix_nda_signatures_project ON dataroom.nda_signatures (project_id);

CREATE TABLE IF NOT EXISTS dataroom.downloads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant text NOT NULL,
  investor_id uuid NOT NULL REFERENCES dataroom.investors(id),
  document_id uuid NOT NULL REFERENCES dataroom.documents(id),
  version_id uuid NOT NULL REFERENCES dataroom.document_versions(id),
  kind text NOT NULL,
  watermarked boolean NOT NULL DEFAULT false,
  ip text,
  user_agent text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS ix_downloads_investor ON dataroom.downloads (investor_id, created_at);
CREATE INDEX IF NOT EXISTS ix_downloads_document ON dataroom.downloads (document_id);

CREATE TABLE IF NOT EXISTS dataroom.audit_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant text NOT NULL,
  actor_type text NOT NULL,
  actor_id text,
  actor_email text,
  action text NOT NULL,
  entity_type text NOT NULL,
  entity_id text,
  result text NOT NULL DEFAULT 'success',
  metadata jsonb,
  ip text,
  user_agent text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS ix_audit_tenant_created ON dataroom.audit_events (tenant, created_at);
CREATE INDEX IF NOT EXISTS ix_audit_entity ON dataroom.audit_events (entity_type, entity_id);

-- Append-only guard: forbid UPDATE/DELETE on audit_events.
CREATE OR REPLACE FUNCTION dataroom.forbid_audit_mutation() RETURNS trigger AS $fn$
BEGIN
  RAISE EXCEPTION 'audit_events is append-only';
END;
$fn$ LANGUAGE plpgsql;
DO $$ BEGIN
  CREATE TRIGGER trg_audit_append_only
  BEFORE UPDATE OR DELETE ON dataroom.audit_events
  FOR EACH ROW EXECUTE FUNCTION dataroom.forbid_audit_mutation();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS dataroom.email_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant text NOT NULL,
  investor_id uuid REFERENCES dataroom.investors(id),
  template text NOT NULL,
  subject text NOT NULL,
  to_email text NOT NULL,
  status text NOT NULL,
  provider_id text,
  error text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS ix_email_events_investor ON dataroom.email_events (investor_id);

CREATE TABLE IF NOT EXISTS dataroom.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant text NOT NULL,
  investor_id uuid NOT NULL REFERENCES dataroom.investors(id),
  type text NOT NULL,
  payload jsonb,
  read_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS ix_notifications_investor ON dataroom.notifications (investor_id, read_at);
