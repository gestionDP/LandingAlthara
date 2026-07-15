/** ADMIN — multi-file upload to a project (multipart/form-data). */
import { z } from 'zod';
import { requireAdmin, errorResponse } from '@/dataroom/lib/authz';
import { uploadDocument } from '@/dataroom/services/documents';
import { notifyNewDocuments } from '@/dataroom/services/notifications';
import { MAX_UPLOAD_BYTES } from '@/dataroom/config';

export const runtime = 'nodejs';
export const maxDuration = 60;

const Meta = z.object({
  categoryId: z.string().uuid().optional(),
  confidentiality: z.enum(['generic', 'sensitive']).default('sensitive'),
  downloadable: z.boolean().default(true),
  requiresNda: z.boolean().default(true),
  publish: z.boolean().default(true),
  notify: z.boolean().default(false),
  restrictToInvestorIds: z.array(z.string().uuid()).max(200).optional(),
  titles: z.record(z.string(), z.string().max(200)).optional(), // filename -> title
  description: z.string().max(2000).optional(),
});

export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const admin = await requireAdmin();
    const { id: projectId } = await ctx.params;

    const form = await req.formData();
    const metaRaw = form.get('meta');
    const parsed = Meta.safeParse(metaRaw ? JSON.parse(String(metaRaw)) : {});
    if (!parsed.success)
      return Response.json({ error: 'invalid_request', details: parsed.error.flatten().fieldErrors }, { status: 400 });
    const meta = parsed.data;

    const files = form.getAll('files').filter((f): f is File => f instanceof File);
    if (files.length === 0) return Response.json({ error: 'no_files' }, { status: 400 });
    if (files.length > 50) return Response.json({ error: 'too_many_files' }, { status: 400 });

    const actor = { type: 'admin' as const, id: admin.userId, email: admin.email };
    const results: { fileName: string; ok: boolean; documentId?: string; error?: string }[] = [];
    const publishedIds: string[] = [];

    for (const file of files) {
      if (file.size > MAX_UPLOAD_BYTES) {
        results.push({ fileName: file.name, ok: false, error: 'file_too_large' });
        continue;
      }
      try {
        const data = Buffer.from(await file.arrayBuffer());
        const { document } = await uploadDocument(
          {
            projectId,
            categoryId: meta.categoryId,
            title: meta.titles?.[file.name] ?? file.name.replace(/\.[^.]+$/, ''),
            description: meta.description,
            confidentiality: meta.confidentiality,
            downloadable: meta.downloadable,
            requiresNda: meta.requiresNda,
            publish: meta.publish,
            file: { name: file.name, mimeType: file.type, data },
            restrictToInvestorIds: meta.restrictToInvestorIds,
          },
          actor,
        );
        results.push({ fileName: file.name, ok: true, documentId: document.id });
        if (meta.publish) publishedIds.push(document.id);
      } catch (err) {
        results.push({
          fileName: file.name,
          ok: false,
          error: err instanceof Error ? err.message : 'upload_failed',
        });
      }
    }

    // ONE grouped notification for the whole batch (never per-file emails).
    let notified = 0;
    if (meta.notify && publishedIds.length > 0) {
      const res = await notifyNewDocuments({ projectId, documentIds: publishedIds }, actor);
      notified = res.notified;
    }

    return Response.json({ results, notified });
  } catch (err) {
    return errorResponse(err);
  }
}
