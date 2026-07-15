/** ADMIN — crear carpeta (categoría) en un proyecto o restaurar la estructura estándar. */
import { z } from 'zod';
import { requireAdmin, errorResponse } from '@/dataroom/lib/authz';
import { createCategory } from '@/dataroom/services/categories';
import { ensureStandardFolders } from '@/dataroom/services/projects';

export const runtime = 'nodejs';

const Body = z.union([
  z.object({ restoreStandard: z.literal(true) }),
  z.object({
    name: z.string().trim().min(1).max(120),
    level: z.union([z.literal(1), z.literal(2)]).optional(),
    parentId: z.string().uuid().nullable().optional(),
  }),
]);

export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const admin = await requireAdmin();
    const { id } = await ctx.params;
    const parsed = Body.safeParse(await req.json());
    if (!parsed.success) return Response.json({ error: 'invalid_request' }, { status: 400 });

    if ('restoreStandard' in parsed.data) {
      const r = await ensureStandardFolders(id, { type: 'admin', id: admin.userId, email: admin.email });
      return Response.json({ ok: true, created: r.created });
    }
    const cat = await createCategory(id, parsed.data.name, parsed.data.level ?? 2, parsed.data.parentId);
    return Response.json({ ok: true, category: cat });
  } catch (err) {
    return errorResponse(err);
  }
}
