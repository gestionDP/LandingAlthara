/** ADMIN — grant / revoke project access for an investor. */
import { z } from 'zod';
import { requireAdmin, errorResponse } from '@/dataroom/lib/authz';
import { grantProjectAccess, revokeProjectAccess } from '@/dataroom/services/projects';

export const runtime = 'nodejs';

const GrantBody = z.object({
  projectId: z.string().uuid(),
  accessLevel: z.enum(['generic', 'full']).optional(),
  notes: z.string().max(2000).optional(),
  notify: z.boolean().optional(),
});

export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const admin = await requireAdmin();
    const { id } = await ctx.params;
    const parsed = GrantBody.safeParse(await req.json());
    if (!parsed.success) return Response.json({ error: 'invalid_request' }, { status: 400 });

    await grantProjectAccess(
      { investorId: id, ...parsed.data },
      { type: 'admin', id: admin.userId, email: admin.email },
    );
    return Response.json({ ok: true });
  } catch (err) {
    return errorResponse(err);
  }
}

const RevokeBody = z.object({ projectId: z.string().uuid(), notify: z.boolean().optional() });

export async function DELETE(req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const admin = await requireAdmin();
    const { id } = await ctx.params;
    const parsed = RevokeBody.safeParse(await req.json());
    if (!parsed.success) return Response.json({ error: 'invalid_request' }, { status: 400 });

    await revokeProjectAccess(
      { investorId: id, projectId: parsed.data.projectId, notify: parsed.data.notify },
      { type: 'admin', id: admin.userId, email: admin.email },
    );
    return Response.json({ ok: true });
  } catch (err) {
    return errorResponse(err);
  }
}
