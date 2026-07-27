-- L4 · cartera completa — «inversor global» de la matriz de accesos
-- (ALT-WEB-2026-01 v1.2 §07). Idempotente.
--
-- El inversor global ve todos los proyectos del tenant sin necesidad de una
-- fila en project_access. Una asignación explícita suspendida o revocada
-- sigue mandando sobre el acceso global.
ALTER TABLE dataroom.investors
  ADD COLUMN IF NOT EXISTS global_access boolean NOT NULL DEFAULT false;

CREATE INDEX IF NOT EXISTS ix_investors_global_access
  ON dataroom.investors (tenant, global_access)
  WHERE global_access;
