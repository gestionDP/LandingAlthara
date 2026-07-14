/**
 * Investor lifecycle: create + invite, resend, revoke, activate (registration),
 * suspend/reactivate/disable. No public sign-up exists anywhere.
 */
import { and, eq, desc } from 'drizzle-orm';
import { clerkClient } from '@clerk/nextjs/server';
import { db, schema } from '../db/client';
import { DATAROOM_TENANT, INVITATION_TTL_HOURS, LEGAL_TERMS_VERSION, env } from '../config';
import {
  generateInvitationToken,
  hashToken,
  looksLikeToken,
  invitationExpiry,
} from '../core/tokens.ts';
import { checkPasswordPolicy } from '../core/passwords.ts';
import {
  canTransitionInvestor,
  invitationIsRedeemable,
  type InvestorStatus,
} from '../core/states.ts';
import { writeAudit, type AuditActor, type RequestMeta } from '../lib/audit';
import { sendTransactionalEmail } from '../lib/emails/send';
import { encryptKyc } from '../lib/kyc-crypto';
import { AuthzError } from '../lib/authz';

const T = DATAROOM_TENANT;

export interface CreateInvestorInput {
  email: string;
  firstName?: string;
  lastName?: string;
  company?: string;
  phone?: string;
  investorType?: 'individual' | 'legal_entity' | 'professional' | 'institutional';
  language?: 'es' | 'en';
  projectIds?: string[];
  sendInvitation?: boolean;
}

function activationUrl(rawToken: string): string {
  return `${env.appBaseUrl()}/dataroom/activate/${rawToken}`;
}

async function issueInvitation(investorId: string, actor: AuditActor, resend = false) {
  // Invalidate any previous pending invitations (single active invitation).
  await db()
    .update(schema.invitations)
    .set({ status: 'revoked', revokedAt: new Date() })
    .where(
      and(eq(schema.invitations.investorId, investorId), eq(schema.invitations.status, 'pending')),
    );

  const token = generateInvitationToken();
  await db().insert(schema.invitations).values({
    tenant: T,
    investorId,
    tokenHash: token.hash,
    expiresAt: invitationExpiry(INVITATION_TTL_HOURS),
    createdBy: actor.id ?? null,
  });

  await writeAudit({
    tenant: T,
    actor,
    action: resend ? 'invitation.resent' : 'invitation.sent',
    entityType: 'investor',
    entityId: investorId,
  });

  return token.raw;
}

export async function createInvestor(input: CreateInvestorInput, actor: AuditActor) {
  const email = input.email.trim().toLowerCase();

  const existing = await db()
    .select()
    .from(schema.investors)
    .where(and(eq(schema.investors.tenant, T), eq(schema.investors.email, email)))
    .limit(1);
  if (existing[0]) throw new AuthzError(409, 'email_already_registered');

  const [investor] = await db()
    .insert(schema.investors)
    .values({
      tenant: T,
      email,
      firstName: input.firstName ?? null,
      lastName: input.lastName ?? null,
      company: input.company ?? null,
      phone: input.phone ?? null,
      investorType: input.investorType ?? null,
      language: input.language ?? 'es',
      status: 'draft',
      createdBy: actor.id ?? null,
    })
    .returning();

  await writeAudit({
    tenant: T, actor, action: 'investor.created', entityType: 'investor', entityId: investor.id,
  });

  // Optional initial project assignments
  for (const projectId of input.projectIds ?? []) {
    await db().insert(schema.projectAccess).values({
      tenant: T, investorId: investor.id, projectId, grantedBy: actor.id ?? null,
    }).onConflictDoNothing();
  }

  if (input.sendInvitation !== false) {
    await inviteInvestor(investor.id, actor);
  }
  return investor;
}

export async function inviteInvestor(investorId: string, actor: AuditActor, resend = false) {
  const [investor] = await db()
    .select().from(schema.investors)
    .where(and(eq(schema.investors.id, investorId), eq(schema.investors.tenant, T)))
    .limit(1);
  if (!investor) throw new AuthzError(404, 'investor_not_found');
  if (investor.status === 'active') throw new AuthzError(409, 'account_already_active');
  if (!canTransitionInvestor(investor.status as InvestorStatus, 'invited'))
    throw new AuthzError(409, 'invalid_state_for_invitation');

  const rawToken = await issueInvitation(investorId, actor, resend);

  const sent = await sendTransactionalEmail({
    template: resend ? 'invitation_resend' : 'invitation',
    locale: (investor.language as 'es' | 'en') ?? 'es',
    to: investor.email,
    investorId,
    params: {
      investorName: investor.firstName ?? undefined,
      actionUrl: activationUrl(rawToken),
      expiresHours: INVITATION_TTL_HOURS,
    },
  });
  if (!sent.ok) {
    // Email failed: keep investor in previous state so admin can retry; audit trail already records it.
    throw new AuthzError(502, 'invitation_email_failed');
  }

  await db()
    .update(schema.investors)
    .set({ status: 'invited', invitedAt: new Date(), updatedAt: new Date() })
    .where(eq(schema.investors.id, investorId));

  return { ok: true };
}

export async function revokeInvitation(investorId: string, actor: AuditActor) {
  const res = await db()
    .update(schema.invitations)
    .set({ status: 'revoked', revokedAt: new Date() })
    .where(
      and(eq(schema.invitations.investorId, investorId), eq(schema.invitations.status, 'pending')),
    )
    .returning({ id: schema.invitations.id });
  if (res.length > 0) {
    await db()
      .update(schema.investors)
      .set({ status: 'invitation_revoked', updatedAt: new Date() })
      .where(and(eq(schema.investors.id, investorId), eq(schema.investors.status, 'invited')));
  }
  await writeAudit({
    tenant: T, actor, action: 'invitation.revoked', entityType: 'investor', entityId: investorId,
  });
  return { revoked: res.length };
}

/** Validates a raw token. Also used by the public validate endpoint (rate-limited). */
export async function validateInvitationToken(rawToken: string, req?: RequestMeta) {
  if (!looksLikeToken(rawToken)) return { ok: false as const, reason: 'invalid' as const };

  const [invitation] = await db()
    .select()
    .from(schema.invitations)
    .where(eq(schema.invitations.tokenHash, hashToken(rawToken)))
    .limit(1);

  if (!invitation) {
    await writeAudit({
      tenant: T, actor: { type: 'system' }, action: 'invitation.validation_failed',
      entityType: 'invitation', result: 'denied', metadata: { reason: 'not_found' }, req,
    });
    return { ok: false as const, reason: 'invalid' as const };
  }

  const redeemable = invitationIsRedeemable({
    status: invitation.status,
    expiresAt: invitation.expiresAt,
  });
  if (!redeemable.ok) {
    if (redeemable.reason === 'expired' && invitation.status === 'pending') {
      await db().update(schema.invitations).set({ status: 'expired' })
        .where(eq(schema.invitations.id, invitation.id));
      await db().update(schema.investors).set({ status: 'invitation_expired', updatedAt: new Date() })
        .where(and(eq(schema.investors.id, invitation.investorId), eq(schema.investors.status, 'invited')));
    }
    await writeAudit({
      tenant: T, actor: { type: 'system' }, action: 'invitation.validation_failed',
      entityType: 'invitation', entityId: invitation.id, result: 'denied',
      metadata: { reason: redeemable.reason }, req,
    });
    return { ok: false as const, reason: redeemable.reason };
  }

  const [investor] = await db()
    .select().from(schema.investors)
    .where(eq(schema.investors.id, invitation.investorId)).limit(1);
  if (!investor || investor.deletedAt || investor.status === 'disabled' || investor.status === 'suspended')
    return { ok: false as const, reason: 'revoked' as const };
  if (investor.status === 'active') return { ok: false as const, reason: 'already_active' as const };

  await writeAudit({
    tenant: T, actor: { type: 'investor', email: investor.email },
    action: 'invitation.validated', entityType: 'invitation', entityId: invitation.id, req,
  });

  return {
    ok: true as const,
    invitation,
    investor: {
      id: investor.id,
      email: investor.email,
      firstName: investor.firstName,
      lastName: investor.lastName,
      company: investor.company,
      phone: investor.phone,
      language: investor.language,
      investorType: investor.investorType,
    },
  };
}

export interface CompleteRegistrationInput {
  token: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  country: string;
  company?: string;
  investorType: 'individual' | 'legal_entity' | 'professional' | 'institutional';
  acceptPrivacy: boolean;
  acceptTerms: boolean;
  language?: 'es' | 'en';
  // KYC (verificación de identidad) — se recoge en la activación.
  kyc: {
    documentType: 'dni' | 'nie' | 'passport' | 'other';
    documentNumber: string;
    residenceCountry: string;
    investorProfile: Record<string, unknown>;
  };
}

/**
 * Completes registration: creates the Clerk user (with the password chosen by
 * the investor), activates the account and burns the token. Idempotent per
 * token: a used token can never complete again.
 */
export async function completeRegistration(input: CompleteRegistrationInput, req?: RequestMeta) {
  const validation = await validateInvitationToken(input.token, req);
  if (!validation.ok) return { ok: false as const, reason: validation.reason };

  if (!input.acceptPrivacy || !input.acceptTerms)
    return { ok: false as const, reason: 'legal_not_accepted' as const };

  const pw = checkPasswordPolicy(input.password);
  if (!pw.ok) return { ok: false as const, reason: 'weak_password' as const, errors: pw.errors };

  const { invitation, investor } = validation;

  // Mark registration in progress (visible to admins).
  await db().update(schema.investors)
    .set({ status: 'registration_started', updatedAt: new Date() })
    .where(eq(schema.investors.id, investor.id));

  // Create the Clerk user. If the email already exists in Clerk we link it —
  // never expose which emails exist.
  const client = await clerkClient();
  let clerkUserId: string;
  try {
    const existing = await client.users.getUserList({ emailAddress: [investor.email] });
    if (existing.data.length > 0) {
      clerkUserId = existing.data[0].id;
      await client.users.updateUser(clerkUserId, { password: input.password });
    } else {
      const created = await client.users.createUser({
        emailAddress: [investor.email],
        password: input.password,
        firstName: input.firstName,
        lastName: input.lastName,
        publicMetadata: { dataroom_role: 'investor', dataroom_tenant: T },
      });
      clerkUserId = created.id;
    }
  } catch (err) {
    // Roll back state so the token remains usable after a transient failure.
    await db().update(schema.investors)
      .set({ status: 'invited', updatedAt: new Date() })
      .where(eq(schema.investors.id, investor.id));
    console.error('[dataroom] clerk user creation failed', err instanceof Error ? err.message : err);
    return { ok: false as const, reason: 'account_creation_failed' as const };
  }

  const now = new Date();
  // Burn the token FIRST (single-use), then activate.
  const burned = await db().update(schema.invitations)
    .set({ status: 'used', usedAt: now })
    .where(and(eq(schema.invitations.id, invitation.id), eq(schema.invitations.status, 'pending')))
    .returning({ id: schema.invitations.id });
  if (burned.length === 0) return { ok: false as const, reason: 'used' as const }; // raced

  // Cuenta creada, pero la identidad debe validarla el admin: pending_validation.
  await db().update(schema.investors)
    .set({
      clerkUserId,
      status: 'pending_validation',
      rejectionReason: null,
      firstName: input.firstName,
      lastName: input.lastName,
      phone: input.phone ?? null,
      country: input.country,
      company: input.company ?? null,
      investorType: input.investorType,
      language: input.language ?? investor.language ?? 'es',
      privacyAcceptedAt: now,
      termsAcceptedAt: now,
      termsVersion: LEGAL_TERMS_VERSION,
      updatedAt: now,
    })
    .where(eq(schema.investors.id, investor.id));

  // Guardar el KYC cifrado.
  await db().insert(schema.investorKyc).values({
    tenant: T,
    investorId: investor.id,
    documentType: input.kyc.documentType,
    residenceCountry: input.kyc.residenceCountry,
    encryptedPayload: encryptKyc({
      documentNumber: input.kyc.documentNumber,
      phone: input.phone ?? null,
      investorProfile: input.kyc.investorProfile,
    }),
  }).onConflictDoUpdate({
    target: schema.investorKyc.investorId,
    set: {
      documentType: input.kyc.documentType,
      residenceCountry: input.kyc.residenceCountry,
      encryptedPayload: encryptKyc({
        documentNumber: input.kyc.documentNumber,
        phone: input.phone ?? null,
        investorProfile: input.kyc.investorProfile,
      }),
      submittedAt: now,
      updatedAt: now,
    },
  });

  await writeAudit({
    tenant: T, actor: { type: 'investor', id: investor.id, email: investor.email },
    action: 'registration.completed', entityType: 'investor', entityId: investor.id, req,
  });
  await writeAudit({
    tenant: T, actor: { type: 'investor', id: investor.id, email: investor.email },
    action: 'kyc.submitted', entityType: 'investor', entityId: investor.id, req,
  });

  return { ok: true as const };
}

export async function setInvestorStatus(
  investorId: string,
  to: 'active' | 'suspended' | 'disabled',
  actor: AuditActor,
) {
  const [investor] = await db()
    .select().from(schema.investors)
    .where(and(eq(schema.investors.id, investorId), eq(schema.investors.tenant, T)))
    .limit(1);
  if (!investor) throw new AuthzError(404, 'investor_not_found');
  if (!canTransitionInvestor(investor.status as InvestorStatus, to))
    throw new AuthzError(409, 'invalid_transition');

  await db().update(schema.investors)
    .set({ status: to, updatedAt: new Date() })
    .where(eq(schema.investors.id, investorId));

  // Revoke live Clerk sessions immediately on suspend/disable.
  if ((to === 'suspended' || to === 'disabled') && investor.clerkUserId) {
    try {
      const client = await clerkClient();
      const sessions = await client.sessions.getSessionList({ userId: investor.clerkUserId });
      await Promise.all(sessions.data.map((s) => client.sessions.revokeSession(s.id)));
    } catch (err) {
      console.error('[dataroom] failed to revoke sessions', err instanceof Error ? err.message : err);
    }
  }

  await writeAudit({
    tenant: T, actor,
    action: to === 'suspended' ? 'investor.suspended' : to === 'disabled' ? 'investor.disabled' : 'investor.reactivated',
    entityType: 'investor', entityId: investorId,
  });

  if (to === 'suspended') {
    await sendTransactionalEmail({
      template: 'account_suspended',
      locale: (investor.language as 'es' | 'en') ?? 'es',
      to: investor.email,
      investorId,
      params: { investorName: investor.firstName ?? undefined },
    });
  }
  return { ok: true };
}

/** Borrado lógico del inversor: pierde acceso al instante, el histórico se conserva. */
export async function softDeleteInvestor(investorId: string, actor: AuditActor) {
  const [investor] = await db().select().from(schema.investors)
    .where(and(eq(schema.investors.id, investorId), eq(schema.investors.tenant, T))).limit(1);
  if (!investor || investor.deletedAt) throw new AuthzError(404, 'investor_not_found');

  await db().update(schema.investors)
    .set({ deletedAt: new Date(), status: 'disabled', updatedAt: new Date() })
    .where(eq(schema.investors.id, investorId));
  await db().update(schema.invitations)
    .set({ status: 'revoked', revokedAt: new Date() })
    .where(and(eq(schema.invitations.investorId, investorId), eq(schema.invitations.status, 'pending')));

  if (investor.clerkUserId) {
    try {
      const client = await clerkClient();
      const sessions = await client.sessions.getSessionList({ userId: investor.clerkUserId });
      await Promise.all(sessions.data.map((s) => client.sessions.revokeSession(s.id)));
    } catch (err) {
      console.error('[dataroom] failed to revoke sessions on delete', err instanceof Error ? err.message : err);
    }
  }

  await writeAudit({ tenant: T, actor, action: 'investor.deleted', entityType: 'investor', entityId: investorId });
  return { ok: true };
}

export async function updateInvestorAdminData(
  investorId: string,
  patch: Partial<{
    firstName: string; lastName: string; company: string; phone: string;
    investorType: 'individual' | 'legal_entity' | 'professional' | 'institutional';
    language: 'es' | 'en'; internalNotes: string; email: string;
  }>,
  actor: AuditActor,
) {
  const [investor] = await db()
    .select().from(schema.investors)
    .where(and(eq(schema.investors.id, investorId), eq(schema.investors.tenant, T)))
    .limit(1);
  if (!investor) throw new AuthzError(404, 'investor_not_found');

  // Email can only change before activation (pre-Clerk).
  if (patch.email && investor.status === 'active') throw new AuthzError(409, 'email_locked_after_activation');
  const email = patch.email?.trim().toLowerCase();

  await db().update(schema.investors)
    .set({
      ...patch,
      email: email ?? investor.email,
      updatedAt: new Date(),
    })
    .where(eq(schema.investors.id, investorId));

  await writeAudit({
    tenant: T, actor, action: 'investor.updated', entityType: 'investor', entityId: investorId,
    metadata: { fields: Object.keys(patch) },
  });
  return { ok: true };
}

export async function listInvitations(investorId: string) {
  return db()
    .select({
      id: schema.invitations.id,
      status: schema.invitations.status,
      expiresAt: schema.invitations.expiresAt,
      usedAt: schema.invitations.usedAt,
      revokedAt: schema.invitations.revokedAt,
      createdAt: schema.invitations.createdAt,
    })
    .from(schema.invitations)
    .where(eq(schema.invitations.investorId, investorId))
    .orderBy(desc(schema.invitations.createdAt));
}
