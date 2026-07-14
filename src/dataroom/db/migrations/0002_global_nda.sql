-- NDA global: un único acuerdo para todo el portal (decisión 2026-07-13).
-- Las versiones con project_id NULL son globales; se conserva compatibilidad
-- con las filas antiguas por proyecto.

ALTER TABLE dataroom.nda_versions ALTER COLUMN project_id DROP NOT NULL;
ALTER TABLE dataroom.nda_signatures ALTER COLUMN project_id DROP NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS uq_nda_global_version
  ON dataroom.nda_versions (tenant, version) WHERE project_id IS NULL;
