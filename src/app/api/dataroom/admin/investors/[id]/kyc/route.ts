/** ADMIN — ver KYC descifrado y validar / rechazar la identidad del inversor. */
import { z } from 'zod';
import { requireAdmin, errorResponse } from '@/dataroom/lib/authz';
import { getKycForAdmin, validateInvestorKyc, rejectInvestorKyc } from '@/dataroom/services/kyc';

export const runtime = 'nodejs';

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
    const { id } = await ctx.params;
    const kyc = await getKycForAdmin(id);
    return Response.json({ kyc });
  } catch (err) {
    return errorResponse(err);
  }
}

const Body = z.object({
  decision: z.enum(['validate', 'reject']),
  reason: z.string().trim().min(3).max(1000).optional(),
});

export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const admin = await requireAdmin();
    const { id } = await ctx.params;
    const parsed = Body.safeParse(await req.json());
    if (!parsed.success) return Response.json({ error: 'invalid_request' }, { status: 400 });
    const actor = { type: 'admin' as const, id: admin.userId, email: admin.email };

    if (parsed.data.decision === 'validate') {
      await validateInvestorKyc(id, actor);
    } else {
      if (!parsed.data.reason) return Response.json({ error: 'reason_required' }, { status: 400 });
      await rejectInvestorKyc(id, parsed.data.reason, actor);
    }
    return Response.json({ ok: true });
  } catch (err) {
    return errorResponse(err);
  }
}
