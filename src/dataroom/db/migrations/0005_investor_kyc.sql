-- KYC del inversor + estados de validación (spec ALT-RM-2026-01).
ALTER TYPE dataroom.investor_status ADD VALUE IF NOT EXISTS 'pending_validation';
ALTER TYPE dataroom.investor_status ADD VALUE IF NOT EXISTS 'rejected';

ALTER TABLE dataroom.investors ADD COLUMN IF NOT EXISTS rejection_reason text;

CREATE TABLE IF NOT EXISTS dataroom.investor_kyc (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant text NOT NULL,
  investor_id uuid NOT NULL REFERENCES dataroom.investors(id),
  document_type text NOT NULL,
  residence_country text NOT NULL,
  encrypted_payload text NOT NULL,
  submitted_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS uq_investor_kyc_investor ON dataroom.investor_kyc (investor_id);

-- Todos los inversores ya activos deben completar KYC (decisión de producto).
-- Ejecutar cuando el portal ya muestre la pantalla de KYC pendiente:
-- UPDATE dataroom.investors SET status='pending_validation', updated_at=now()
--   WHERE tenant='althara' AND status='active';
