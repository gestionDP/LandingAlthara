/** INVESTOR — profile + portal summary (projects, notifications, recent activity). */
import { z } from 'zod';
import { and, desc, eq, isNull } from 'drizzle-orm';
import { auth, clerkClient } from '@clerk/nextjs/server';
import { requireInvestor, requireLinkedInvestor, requireAdmin, requireReviewer, errorResponse, AuthzError } from '@/dataroom/lib/authz';
import { getKycStatus } from '@/dataroom/services/kyc';
import { listAuthorizedProjects } from '@/dataroom/services/projects';
import { db, schema } from '@/dataroom/db/client';
import { DATAROOM_TENANT } from '@/dataroom/config';

export const runtime = 'nodejs';

export async function GET() {
  try {
    let investor;
    try {
      investor = await requireInvestor();
    } catch (err) {
      if (err instanceof AuthzError && err.code === 'not_an_investor') {
        // ¿Es admin? → a su panel.
        try {
          await requireAdmin();
          return Response.json({ admin: true });
        } catch { /* sigue */ }

        // ¿Es revisor (abogado/fiscal)? → a su portal de visado.
        try {
          await requireReviewer();
          return Response.json({ reviewer: true });
        } catch { /* sigue */ }

        // ¿Existe una ficha de inversor con el MISMO email pero sin vincular?
        // Pasa cuando alguien inicia sesión directamente en Clerk sin usar el
        // enlace de activación (su email ya existía en la instancia).
        const { userId } = await auth();
        if (userId) {
          const client = await clerkClient();
          const user = await client.users.getUser(userId);
          const email = user.primaryEmailAddress?.emailAddress?.toLowerCase();
          if (email) {
            const [byEmail] = await db().select().from(schema.investors).where(and(
              eq(schema.investors.tenant, DATAROOM_TENANT),
              eq(schema.investors.email, email),
              isNull(schema.investors.deletedAt),
            )).limit(1);
            if (byEmail) {
              if (byEmail.status === 'active' && !byEmail.clerkUserId) {
                // Cuenta activa sin vincular: la vinculamos y el front recarga.
                await db().update(schema.investors)
                  .set({ clerkUserId: userId, updatedAt: new Date() })
                  .where(eq(schema.investors.id, byEmail.id));
                return Response.json({ linked: true });
              }
              // Invitación aún sin completar: el front muestra instrucciones claras.
              return Response.json({ pendingActivation: true, status: byEmail.status });
            }
          }
        }
        throw err;
      }
      // Inversor vinculado pero pendiente de validación o rechazado (KYC):
      // el front muestra la pantalla de KYC / estado.
      if (err instanceof AuthzError && (err.code === 'account_pending_validation' || err.code === 'account_rejected')) {
        const inv = await requireLinkedInvestor();
        const k = await getKycStatus(inv);
        return Response.json({ kyc: { state: inv.status, submitted: k.submitted, rejectionReason: k.rejectionReason } });
      }
      throw err;
    }

    await db().update(schema.investors)
      .set({ lastAccessAt: new Date() })
      .where(eq(schema.investors.id, investor.id));

    const [projects, notifications, recentAccess, pendingInvitations] = await Promise.all([
      listAuthorizedProjects(investor),
      db().select().from(schema.notifications)
        .where(eq(schema.notifications.investorId, investor.id))
        .orderBy(desc(schema.notifications.createdAt)).limit(10),
      db().select({
        documentId: schema.downloads.documentId,
        kind: schema.downloads.kind,
        createdAt: schema.downloads.createdAt,
      }).from(schema.downloads)
        .where(eq(schema.downloads.investorId, investor.id))
        .orderBy(desc(schema.downloads.createdAt)).limit(10),
      db().select({
        projectId: schema.projects.id,
        name: schema.projects.name,
        investmentType: schema.projects.investmentType,
        description: schema.projects.description,
        grantedAt: schema.projectAccess.grantedAt,
        accessLevel: schema.projectAccess.accessLevel,
      }).from(schema.projectAccess)
        .innerJoin(schema.projects, eq(schema.projectAccess.projectId, schema.projects.id))
        .where(and(
          eq(schema.projectAccess.investorId, investor.id),
          eq(schema.projectAccess.status, 'pending'),
          eq(schema.projects.tenant, DATAROOM_TENANT),
          isNull(schema.projects.deletedAt),
        )),
    ]);

    return Response.json({
      investor: {
        firstName: investor.firstName,
        lastName: investor.lastName,
        email: investor.email,
        status: investor.status,
        language: investor.language,
        phone: investor.phone,
        company: investor.company,
        country: investor.country,
        investorType: investor.investorType,
      },
      projects,
      notifications,
      recentAccess,
      pendingInvitations,
    });
  } catch (err) {
    return errorResponse(err);
  }
}

const ProfileSchema = z.object({
  firstName: z.string().trim().max(120).optional(),
  lastName: z.string().trim().max(120).optional(),
  phone: z.string().trim().max(40).optional(),
  company: z.string().trim().max(160).optional(),
  country: z.string().trim().max(80).optional(),
  investorType: z.enum(['individual', 'legal_entity', 'professional', 'institutional']).optional(),
  language: z.enum(['es', 'en']).optional(),
});

/** El propio inversor completa/edita sus datos de perfil. */
export async function PATCH(req: Request) {
  try {
    const investor = await requireInvestor();
    const body = await req.json().catch(() => null);
    const parsed = ProfileSchema.safeParse(body);
    if (!parsed.success) return Response.json({ error: 'invalid_request' }, { status: 400 });

    const p = parsed.data;
    const set: Record<string, unknown> = { updatedAt: new Date() };
    (['firstName', 'lastName', 'phone', 'company', 'country', 'investorType', 'language'] as const)
      .forEach((k) => {
        if (p[k] !== undefined) set[k] = p[k] === '' ? null : p[k];
      });

    await db().update(schema.investors)
      .set(set)
      .where(eq(schema.investors.id, investor.id));

    return Response.json({ ok: true });
  } catch (err) {
    return errorResponse(err);
  }
}
