-- Nivel de acceso por carpeta (spec ALT-RM): 1 = bienvenida/resumen (solo vista),
-- 2 = documentación completa (requiere NDA). Por defecto 2.
ALTER TABLE dataroom.document_categories ADD COLUMN IF NOT EXISTS level integer NOT NULL DEFAULT 2;
