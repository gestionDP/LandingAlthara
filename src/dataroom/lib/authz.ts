/**
 * Authorization helpers. Every dataroom API route MUST go through one of
 * these guards. Clerk provides authentication; the investors table + tenant
 * column provide authorization. Deny by default.
 */
import { auth, clerkClient } from '@clerk/nextjs/server';
import { eq } from 'drizzle-orm';
import { db, schema } from '../db/client';
import { DATAROOM_TENANT } from '../config';
import { investorCanAccessPortal, type InvestorStatus } from '../core/states.ts';

export type Investor = typeof schema.investors.$inferSelect;

export class AuthzError extends Error {
  constructor(
    public status: number,
    public code: string,
  ) {
    super(code);
  }
}

/**
 * Admin = Clerk user with publicMetadata.dataroom_role === 'admin'.
 * Tenant scoping uses the dataroom-specific `dataroom_tenant` claim so it
 * never collides with the CRM/WL universal-login `tenant_slug` claim.
 */
export async function requireAdmin(): Promise<{ userId: string; email: string | null }> {
  const { userId } = await auth();
  if (!userId) throw new AuthzError(401, 'unauthenticated');
  const client = await clerkClient();
  const user = await client.users.getUser(userId);
  const role = user.publicMetadata?.dataroom_role;
  const tenant = (user.publicMetadata?.dataroom_tenant as string | undefined) ?? DATAROOM_TENANT;
  if (role !== 'admin' || tenant !== DATAROOM_TENANT) throw new AuthzError(403, 'forbidden');
  return { userId, email: user.primaryEmailAddress?.emailAddress ?? null };
}

export type ReviewerRole = 'legal' | 'tax';

/**
 * Revisor = Clerk user con `publicMetadata.dataroom_role` = 'legal' (abogado),
 * 'tax' (fiscal) o 'both' (ambos, útil para pruebas). También admite un array
 * `dataroom_roles: ['legal','tax']`. Alta manual en Clerk. Aprueba/rechaza el
 * visado de documentos. `only` exige que el usuario tenga ESE rol concreto.
 */
export async function requireReviewer(only?: ReviewerRole): Promise<{ userId: string; email: string | null; roles: ReviewerRole[] }> {
  const { userId } = await auth();
  if (!userId) throw new AuthzError(401, 'unauthenticated');
  const client = await clerkClient();
  const user = await client.users.getUser(userId);
  const raw = user.publicMetadata?.dataroom_role;
  const rawList = user.publicMetadata?.dataroom_roles;
  const tenant = (user.publicMetadata?.dataroom_tenant as string | undefined) ?? DATAROOM_TENANT;

  const roles = new Set<ReviewerRole>();
  if (Array.isArray(rawList)) rawList.forEach((r) => { if (r === 'legal' || r === 'tax') roles.add(r); });
  if (raw === 'legal' || raw === 'tax') roles.add(raw);
  if (raw === 'both' || raw === 'legal_tax') { roles.add('legal'); roles.add('tax'); }

  if (roles.size === 0 || tenant !== DATAROOM_TENANT) throw new AuthzError(403, 'forbidden');
  if (only && !roles.has(only)) throw new AuthzError(403, 'forbidden');
  return { userId, email: user.primaryEmailAddress?.emailAddress ?? null, roles: [...roles] };
}

/** Investor = Clerk user linked to an ACTIVE dataroom.investors row in this tenant. */
export async function requireInvestor(): Promise<Investor> {
  const { userId } = await auth();
  if (!userId) throw new AuthzError(401, 'unauthenticated');
  const rows = await db()
    .select()
    .from(schema.investors)
    .where(eq(schema.investors.clerkUserId, userId))
    .limit(1);
  const investor = rows[0];
  if (!investor || investor.deletedAt) throw new AuthzError(403, 'not_an_investor');
  if (investor.tenant !== DATAROOM_TENANT) throw new AuthzError(403, 'tenant_mismatch');
  if (!investorCanAccessPortal(investor.status as InvestorStatus))
    throw new AuthzError(403, `account_${investor.status}`);
  return investor;
}

/** Inversor vinculado a un usuario Clerk, CUALQUIER estado (para KYC/onboarding). */
export async function requireLinkedInvestor(): Promise<Investor> {
  const { userId } = await auth();
  if (!userId) throw new AuthzError(401, 'unauthenticated');
  const rows = await db()
    .select()
    .from(schema.investors)
    .where(eq(schema.investors.clerkUserId, userId))
    .limit(1);
  const investor = rows[0];
  if (!investor || investor.deletedAt) throw new AuthzError(403, 'not_an_investor');
  if (investor.tenant !== DATAROOM_TENANT) throw new AuthzError(403, 'tenant_mismatch');
  return investor;
}

/** Uniform JSON error response; internals are never leaked. */
export function errorResponse(err: unknown): Response {
  if (err instanceof AuthzError) {
    return Response.json({ error: err.code }, { status: err.status });
  }
  console.error('[dataroom] unhandled error', err);
  return Response.json({ error: 'internal_error' }, { status: 500 });
}
