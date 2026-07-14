-- Doble visado (abogado + fiscal) por documento (spec ALT-RM).
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname='review_status') THEN
  CREATE TYPE dataroom.review_status AS ENUM ('pending','approved','rejected'); END IF; END $$;
ALTER TABLE dataroom.documents ADD COLUMN IF NOT EXISTS legal_status dataroom.review_status NOT NULL DEFAULT 'pending';
ALTER TABLE dataroom.documents ADD COLUMN IF NOT EXISTS legal_reason text;
ALTER TABLE dataroom.documents ADD COLUMN IF NOT EXISTS legal_reviewed_by text;
ALTER TABLE dataroom.documents ADD COLUMN IF NOT EXISTS legal_reviewed_at timestamptz;
ALTER TABLE dataroom.documents ADD COLUMN IF NOT EXISTS tax_status dataroom.review_status NOT NULL DEFAULT 'pending';
ALTER TABLE dataroom.documents ADD COLUMN IF NOT EXISTS tax_reason text;
ALTER TABLE dataroom.documents ADD COLUMN IF NOT EXISTS tax_reviewed_by text;
ALTER TABLE dataroom.documents ADD COLUMN IF NOT EXISTS tax_reviewed_at timestamptz;
