-- El slug de proyecto debe ser único solo entre proyectos ACTIVOS.
-- Con el índice único completo, un proyecto borrado lógicamente (deleted_at)
-- seguía reservando su slug e impedía recrear un proyecto con el mismo nombre
-- (violaba uq_projects_tenant_slug con code 23505). Lo sustituimos por un
-- índice único PARCIAL que ignora los borrados.

DROP INDEX IF EXISTS dataroom.uq_projects_tenant_slug;

CREATE UNIQUE INDEX IF NOT EXISTS uq_projects_tenant_slug
  ON dataroom.projects (tenant, slug)
  WHERE deleted_at IS NULL;
