/** ADMIN — investor detail / edit / lifecycle actions (invite, resend, revoke, suspend...). */
import { z } from 'zod';
import { and, desc, eq } from 'drizzle-orm';
import { requireAdmin, errorResponse, AuthzError } from '@/dataroom/lib/authz';
import {
  inviteInvestor, revokeInvitation, setInvestorStatus, updateInvestorAdminData, listInvitations,
  softDeleteInvestor,
} from '@/dataroom/services/investors';
import { db, schema } from '@/dataroom/db/client';
import { DATAROOM_TENANT } from '@/dataroom/config';

export const runtime = 'nodejs';

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
    const { id } = await ctx.params;

    const [investor] = await db().select().from(schema.investors)
      .where(and(eq(schema.investors.id, id), eq(schema.investors.tenant, DATAROOM_TENANT))).limit(1);
    if (!investor) throw new AuthzError(404, 'investor_not_found');

    const [invitations, assignments, signatures, recentDownloads, timeline] = await Promise.all([
      listInvitations(id),
      db().select({
        access: schema.projectAccess,
        projectName: schema.projects.name,
        projectStatus: schema.projects.status,
      }).from(schema.projectAccess)
        .innerJoin(schema.projects, eq(schema.projectAccess.projectId, schema.projects.id))
        .where(eq(schema.projectAccess.investorId, id)),
      db().select({
        id: schema.ndaSignatures.id,
        projectId: schema.ndaSignatures.projectId,
        status: schema.ndaSignatures.status,
        signedAt: schema.ndaSignatures.signedAt,
        signerFullName: schema.ndaSignatures.signerFullName,
        hasCopy: schema.ndaSignatures.signedCopyPath,
      }).from(schema.ndaSignatures).where(eq(schema.ndaSignatures.investorId, id)),
      db().select().from(schema.downloads)
        .where(eq(schema.downloads.investorId, id))
        .orderBy(desc(schema.downloads.createdAt)).limit(25),
      db().select().from(schema.auditEvents)
        .where(and(
          eq(schema.auditEvents.entityType, 'investor'),
          eq(schema.auditEvents.entityId, id),
        ))
        .orderBy(desc(schema.auditEvents.createdAt)).limit(50),
    ]);

    return Response.json({ investor, invitations, assignments, signatures, recentDownloads, timeline });
  } catch (err) {
    return errorResponse(err);
  }
}

const PatchBody = z.object({
  action: z.enum(['update', 'invite', 'resend_invitation', 'revoke_invitation', 'suspend', 'reactivate', 'disable']),
  data: z.object({
    firstName: z.string().max(100).optional(),
    lastName: z.string().max(100).optional(),
    company: z.string().max(150).optional(),
    phone: z.string().max(30).optional(),
    email: z.string().email().max(200).optional(),
    investorType: z.enum(['individual', 'legal_entity', 'professional', 'institutional']).optional(),
    language: z.enum(['es', 'en']).optional(),
    internalNotes: z.string().max(5000).optional(),
  }).optional(),
});

export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const admin = await requireAdmin();
    const { id } = await ctx.params;
    const parsed = PatchBody.safeParse(await req.json());
    if (!parsed.success) return Response.json({ error: 'invalid_request' }, { status: 400 });

    const actor = { type: 'admin' as const, id: admin.userId, email: admin.email };
    const { action, data } = parsed.data;

    switch (action) {
      case 'update':
        await updateInvestorAdminData(id, data ?? {}, actor);
        break;
      case 'invite':
        await inviteInvestor(id, actor, false);
        break;
      case 'resend_invitation':
        await inviteInvestor(id, actor, true);
        break;
      case 'revoke_invitation':
        await revokeInvitation(id, actor);
        break;
      case 'suspend':
        await setInvestorStatus(id, 'suspended', actor);
        break;
      case 'reactivate':
        await setInvestorStatus(id, 'active', actor);
        break;
      case 'disable':
        await setInvestorStatus(id, 'disabled', actor);
        break;
    }
    return Response.json({ ok: true });
  } catch (err) {
    return errorResponse(err);
  }
}

/** DELETE — borrado lógico del inversor (revoca sesiones e invitaciones). */
export async function DELETE(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const admin = await requireAdmin();
    const { id } = await ctx.params;
    await softDeleteInvestor(id, { type: 'admin', id: admin.userId, email: admin.email });
    return Response.json({ ok: true });
  } catch (err) {
    return errorResponse(err);
  }
}
