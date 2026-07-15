/** ADMIN — aviso agrupado tras subir varios documentos (un email por inversor, no uno por archivo). */
import { z } from 'zod';
import { requireAdmin, errorResponse } from '@/dataroom/lib/authz';
import { notifyNewDocuments } from '@/dataroom/services/notifications';

export const runtime = 'nodejs';

const Body = z.object({
  documentIds: z.array(z.string().uuid()).min(1).max(500),
});

export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const admin = await requireAdmin();
    const { id: projectId } = await ctx.params;
    const parsed = Body.safeParse(await req.json());
    if (!parsed.success) return Response.json({ error: 'invalid_request' }, { status: 400 });

    const actor = { type: 'admin' as const, id: admin.userId, email: admin.email };
    const res = await notifyNewDocuments({ projectId, documentIds: parsed.data.documentIds }, actor);
    return Response.json({ ok: true, notified: res.notified });
  } catch (err) {
    return errorResponse(err);
  }
}
