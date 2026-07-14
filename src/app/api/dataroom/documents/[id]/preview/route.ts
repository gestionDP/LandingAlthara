/** INVESTOR — authorized preview. Backend validates, returns 60s signed URL. */
import { requireInvestor, errorResponse } from '@/dataroom/lib/authz';
import { serveDocument } from '@/dataroom/services/documents';
import { requestMeta } from '@/dataroom/lib/audit';

export const runtime = 'nodejs';

export async function GET(req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const investor = await requireInvestor();
    const { id } = await ctx.params;
    const result = await serveDocument(investor, id, 'preview', requestMeta(req));
    if (result.type === 'url') return Response.json({ url: result.url, watermark: result.watermark });
    return new Response(new Uint8Array(result.data), {
      headers: {
        'Content-Type': result.contentType,
        'Content-Disposition': `inline; filename="${result.fileName}"`,
        'Cache-Control': 'private, no-store',
      },
    });
  } catch (err) {
    return errorResponse(err);
  }
}
