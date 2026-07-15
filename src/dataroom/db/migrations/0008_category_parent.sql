-- Subcarpetas: una categoría puede tener carpeta padre (p. ej. proyectos dentro de «4 · Colateral»).
ALTER TABLE dataroom.document_categories
  ADD COLUMN IF NOT EXISTS parent_id uuid REFERENCES dataroom.document_categories(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS ix_categories_parent ON dataroom.document_categories (parent_id);
