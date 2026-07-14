/** ADMIN — renombrar / eliminar una carpeta (categoría). */
import { z } from 'zod';
import { requireAdmin, errorResponse } from '@/dataroom/lib/authz';
import { renameCategory, deleteCategory, setCategoryLevel } from '@/dataroom/services/categories';

export const runtime = 'nodejs';

const Body = z.object({
  name: z.string().trim().min(1).max(120).optional(),
  level: z.union([z.literal(1), z.literal(2)]).optional(),
});

export async function PATCH(req: Request, ctx: { params: Promise<{ catId: string }> }) {
  try {
    await requireAdmin();
    const { catId } = await ctx.params;
    const parsed = Body.safeParse(await req.json());
    if (!parsed.success || (!parsed.data.name && !parsed.data.level)) {
      return Response.json({ error: 'invalid_request' }, { status: 400 });
    }
    if (parsed.data.name) await renameCategory(catId, parsed.data.name);
    if (parsed.data.level) await setCategoryLevel(catId, parsed.data.level);
    return Response.json({ ok: true });
  } catch (err) {
    return errorResponse(err);
  }
}

export async function DELETE(_req: Request, ctx: { params: Promise<{ catId: string }> }) {
  try {
    await requireAdmin();
    const { catId } = await ctx.params;
    await deleteCategory(catId);
    return Response.json({ ok: true });
  } catch (err) {
    return errorResponse(err);
  }
}
