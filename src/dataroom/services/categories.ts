/** Carpetas del data room (document_categories): crear, renombrar, eliminar. */
import { and, eq, isNull } from 'drizzle-orm';
import { db, schema } from '../db/client';
import { DATAROOM_TENANT } from '../config';
import { slugify } from '../core/naming.ts';
import { AuthzError } from '../lib/authz';

const T = DATAROOM_TENANT;

export async function createCategory(
  projectId: string,
  name: string,
  level = 2,
  parentId?: string | null,
) {
  const clean = name.trim();
  if (!clean) throw new AuthzError(400, 'invalid_name');
  const [project] = await db().select().from(schema.projects)
    .where(and(eq(schema.projects.id, projectId), eq(schema.projects.tenant, T))).limit(1);
  if (!project) throw new AuthzError(404, 'project_not_found');

  let resolvedLevel = level === 1 ? 1 : 2;
  let resolvedParentId: string | null = null;
  if (parentId) {
    const [parent] = await db().select().from(schema.documentCategories)
      .where(and(
        eq(schema.documentCategories.id, parentId),
        eq(schema.documentCategories.projectId, projectId),
        eq(schema.documentCategories.tenant, T),
      )).limit(1);
    if (!parent) throw new AuthzError(400, 'invalid_parent');
    resolvedParentId = parent.id;
    resolvedLevel = parent.level;
  }

  const existing = await db().select({ slug: schema.documentCategories.slug })
    .from(schema.documentCategories)
    .where(eq(schema.documentCategories.projectId, projectId));
  const taken = new Set(existing.map((e) => e.slug));
  const base = slugify(clean) || 'carpeta';
  let slug = base;
  let n = 2;
  while (taken.has(slug)) slug = `${base}-${n++}`;

  const siblings = await db().select({ id: schema.documentCategories.id })
    .from(schema.documentCategories)
    .where(and(
      eq(schema.documentCategories.projectId, projectId),
      resolvedParentId
        ? eq(schema.documentCategories.parentId, resolvedParentId)
        : isNull(schema.documentCategories.parentId),
    ));

  const [cat] = await db().insert(schema.documentCategories).values({
    tenant: T,
    projectId,
    name: clean,
    slug,
    sortOrder: siblings.length,
    level: resolvedLevel,
    parentId: resolvedParentId,
  }).returning();
  return cat;
}

export async function setCategoryLevel(categoryId: string, level: number) {
  const [cat] = await db().select().from(schema.documentCategories)
    .where(and(eq(schema.documentCategories.id, categoryId), eq(schema.documentCategories.tenant, T))).limit(1);
  if (!cat) throw new AuthzError(404, 'category_not_found');
  await db().update(schema.documentCategories).set({ level: level === 1 ? 1 : 2 })
    .where(eq(schema.documentCategories.id, categoryId));
  return { ok: true };
}

export async function renameCategory(categoryId: string, name: string) {
  const clean = name.trim();
  if (!clean) throw new AuthzError(400, 'invalid_name');
  const [cat] = await db().select().from(schema.documentCategories)
    .where(and(eq(schema.documentCategories.id, categoryId), eq(schema.documentCategories.tenant, T))).limit(1);
  if (!cat) throw new AuthzError(404, 'category_not_found');
  await db().update(schema.documentCategories).set({ name: clean })
    .where(eq(schema.documentCategories.id, categoryId));
  return { ok: true };
}

/** Elimina la carpeta; sus documentos pasan a la raíz y las subcarpetas suben un nivel. */
export async function deleteCategory(categoryId: string) {
  const [cat] = await db().select().from(schema.documentCategories)
    .where(and(eq(schema.documentCategories.id, categoryId), eq(schema.documentCategories.tenant, T))).limit(1);
  if (!cat) throw new AuthzError(404, 'category_not_found');
  await db().update(schema.documentCategories).set({ parentId: cat.parentId })
    .where(eq(schema.documentCategories.parentId, categoryId));
  await db().update(schema.documents).set({ categoryId: null, updatedAt: new Date() })
    .where(eq(schema.documents.categoryId, categoryId));
  await db().delete(schema.documentCategories).where(eq(schema.documentCategories.id, categoryId));
  return { ok: true };
}
