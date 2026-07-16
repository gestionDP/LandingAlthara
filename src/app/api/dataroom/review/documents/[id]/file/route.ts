/** REVISOR — abrir/previsualizar el archivo a revisar (sin marca de agua). */
import { requireReviewer, errorResponse } from '@/dataroom/lib/authz';
import { serveDocumentAsAdmin, streamDocumentAsAdmin } from '@/dataroom/services/documents';

export const runtime = 'nodejs';

export async function GET(req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    await requireReviewer();
    const { id } = await ctx.params;
    const url = new URL(req.url);
    const kind = url.searchParams.get('kind') === 'download' ? 'download' : 'preview';

    if (url.searchParams.get('stream') === '1') {
      const { data, mimeType, fileName } = await streamDocumentAsAdmin(id, kind);
      const disposition = kind === 'download' ? 'attachment' : 'inline';
      return new Response(new Uint8Array(data), {
        headers: {
          'Content-Type': mimeType,
          'Content-Disposition': `${disposition}; filename="${fileName.replace(/"/g, '')}"`,
          'Cache-Control': 'private, no-store',
        },
      });
    }

    const res = await serveDocumentAsAdmin(id, kind);
    return Response.json(res);
  } catch (err) {
    return errorResponse(err);
  }
}
