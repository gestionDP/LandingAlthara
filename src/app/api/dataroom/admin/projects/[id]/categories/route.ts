/** ADMIN — crear carpeta (categoría) en un proyecto. */
import { z } from 'zod';
import { requireAdmin, errorResponse } from '@/dataroom/lib/authz';
import { createCategory } from '@/dataroom/services/categories';

export const runtime = 'nodejs';

const Body = z.object({ name: z.string().trim().min(1).max(120), level: z.union([z.literal(1), z.literal(2)]).optional() });

export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
    const { id } = await ctx.params;
    const parsed = Body.safeParse(await req.json());
    if (!parsed.success) return Response.json({ error: 'invalid_request' }, { status: 400 });
    const cat = await createCategory(id, parsed.data.name, parsed.data.level ?? 2);
    return Response.json({ ok: true, category: cat });
  } catch (err) {
    return errorResponse(err);
  }
}
