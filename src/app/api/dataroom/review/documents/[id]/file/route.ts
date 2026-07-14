/** REVISOR — abrir/previsualizar el archivo a revisar (sin marca de agua). */
import { requireReviewer, errorResponse } from '@/dataroom/lib/authz';
import { serveDocumentAsAdmin } from '@/dataroom/services/documents';

export const runtime = 'nodejs';

export async function GET(req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    await requireReviewer();
    const { id } = await ctx.params;
    const kind = new URL(req.url).searchParams.get('kind') === 'download' ? 'download' : 'preview';
    const res = await serveDocumentAsAdmin(id, kind);
    return Response.json(res);
  } catch (err) {
    return errorResponse(err);
  }
}
