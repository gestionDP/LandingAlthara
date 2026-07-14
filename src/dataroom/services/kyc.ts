/**
 * KYC del inversor (verificación de identidad). Réplica del flujo del backend:
 * datos sensibles cifrados, estado pending_validation → active/rejected por admin.
 */
import { and, eq } from 'drizzle-orm';
import { db, schema } from '../db/client';
import { DATAROOM_TENANT, env } from '../config';
import { encryptKyc, decryptKyc } from '../lib/kyc-crypto';
import { writeAudit, type AuditActor } from '../lib/audit';
import { AuthzError, type Investor } from '../lib/authz';
import { sendTransactionalEmail } from '../lib/emails/send';

const T = DATAROOM_TENANT;

export interface KycInput {
  documentType: string;
  documentNumber: string;
  phone: string;
  residenceCountry: string;
  investorProfile: Record<string, unknown>;
}

/** Guarda (cifrado) el KYC y pone al inversor en pending_validation. */
export async function submitKyc(investorId: string, input: KycInput, actor: AuditActor) {
  const encryptedPayload = encryptKyc({
    documentNumber: input.documentNumber,
    phone: input.phone,
    investorProfile: input.investorProfile,
  });
  await db().insert(schema.investorKyc).values({
    tenant: T,
    investorId,
    documentType: input.documentType,
    residenceCountry: input.residenceCountry,
    encryptedPayload,
  }).onConflictDoUpdate({
    target: schema.investorKyc.investorId,
    set: {
      documentType: input.documentType,
      residenceCountry: input.residenceCountry,
      encryptedPayload,
      submittedAt: new Date(),
      updatedAt: new Date(),
    },
  });

  await db().update(schema.investors)
    .set({ status: 'pending_validation', rejectionReason: null, updatedAt: new Date() })
    .where(eq(schema.investors.id, investorId));

  await writeAudit({ tenant: T, actor, action: 'kyc.submitted', entityType: 'investor', entityId: investorId });

  // Avisa al admin de que hay un KYC pendiente de validación. No debe bloquear el submit.
  try {
    const [inv] = await db().select({ email: schema.investors.email })
      .from(schema.investors)
      .where(and(eq(schema.investors.id, investorId), eq(schema.investors.tenant, T))).limit(1);
    const adminEmail = env.adminEmail();
    await sendTransactionalEmail({
      template: 'kyc_submitted_admin',
      locale: 'es',
      to: adminEmail,
      investorId,
      params: { investorEmail: inv?.email ?? undefined },
    });
  } catch {
    /* el fallo de email no debe interrumpir el envío de KYC */
  }

  return { ok: true };
}

export async function getKycStatus(investor: Investor) {
  const [row] = await db().select({
    submittedAt: schema.investorKyc.submittedAt,
    documentType: schema.investorKyc.documentType,
    residenceCountry: schema.investorKyc.residenceCountry,
  })
    .from(schema.investorKyc)
    .where(eq(schema.investorKyc.investorId, investor.id)).limit(1);
  return {
    submitted: !!row,
    submittedAt: row?.submittedAt ?? null,
    documentType: row?.documentType ?? null,
    residenceCountry: row?.residenceCountry ?? null,
    status: investor.status,
    rejectionReason: investor.rejectionReason ?? null,
  };
}

/** Contenido descifrado del KYC — para el propio inversor (sus datos). */
export async function getKycForInvestor(investor: Investor) {
  const [row] = await db().select().from(schema.investorKyc)
    .where(and(eq(schema.investorKyc.investorId, investor.id), eq(schema.investorKyc.tenant, T))).limit(1);
  if (!row) return null;
  let decrypted: Record<string, unknown> = {};
  try { decrypted = decryptKyc(row.encryptedPayload); } catch { /* clave distinta / dato antiguo */ }
  return {
    documentType: row.documentType,
    documentNumber: (decrypted.documentNumber as string) ?? null,
    residenceCountry: row.residenceCountry,
    phone: (decrypted.phone as string) ?? null,
    investorProfile: (decrypted.investorProfile as Record<string, unknown>) ?? null,
    submittedAt: row.submittedAt,
    status: investor.status,
    rejectionReason: investor.rejectionReason ?? null,
  };
}

/** Contenido descifrado del KYC — SOLO para el admin. */
export async function getKycForAdmin(investorId: string) {
  const [row] = await db().select().from(schema.investorKyc)
    .where(and(eq(schema.investorKyc.investorId, investorId), eq(schema.investorKyc.tenant, T))).limit(1);
  if (!row) return null;
  let decrypted: Record<string, unknown> = {};
  try { decrypted = decryptKyc(row.encryptedPayload); } catch { /* clave distinta / dato antiguo */ }
  return {
    documentType: row.documentType,
    residenceCountry: row.residenceCountry,
    submittedAt: row.submittedAt,
    documentNumber: (decrypted.documentNumber as string) ?? null,
    phone: (decrypted.phone as string) ?? null,
    investorProfile: (decrypted.investorProfile as Record<string, unknown>) ?? null,
  };
}

export async function validateInvestorKyc(investorId: string, actor: AuditActor) {
  const [inv] = await db().select().from(schema.investors)
    .where(and(eq(schema.investors.id, investorId), eq(schema.investors.tenant, T))).limit(1);
  if (!inv) throw new AuthzError(404, 'investor_not_found');
  if (inv.status !== 'pending_validation') throw new AuthzError(409, 'not_pending_validation');
  await db().update(schema.investors)
    .set({ status: 'active', activatedAt: inv.activatedAt ?? new Date(), rejectionReason: null, updatedAt: new Date() })
    .where(eq(schema.investors.id, investorId));
  await writeAudit({ tenant: T, actor, action: 'kyc.validated', entityType: 'investor', entityId: investorId });

  // Notifica al inversor que su identidad ha sido verificada. No debe bloquear la validación.
  try {
    await sendTransactionalEmail({
      template: 'kyc_validated',
      locale: (inv.language as 'es' | 'en') ?? 'es',
      to: inv.email,
      investorId,
      params: {
        investorName: inv.firstName ?? undefined,
        actionUrl: `${env.appBaseUrl()}/dataroom`,
      },
    });
  } catch {
    /* el fallo de email no debe interrumpir la validación */
  }

  return { ok: true };
}

export async function rejectInvestorKyc(investorId: string, reason: string, actor: AuditActor) {
  const [inv] = await db().select().from(schema.investors)
    .where(and(eq(schema.investors.id, investorId), eq(schema.investors.tenant, T))).limit(1);
  if (!inv) throw new AuthzError(404, 'investor_not_found');
  await db().update(schema.investors)
    .set({ status: 'rejected', rejectionReason: reason, updatedAt: new Date() })
    .where(eq(schema.investors.id, investorId));
  await writeAudit({ tenant: T, actor, action: 'kyc.rejected', entityType: 'investor', entityId: investorId, metadata: { reason } });

  // Notifica al inversor del rechazo, con el motivo. No debe bloquear el rechazo.
  try {
    await sendTransactionalEmail({
      template: 'kyc_rejected',
      locale: (inv.language as 'es' | 'en') ?? 'es',
      to: inv.email,
      investorId,
      params: {
        investorName: inv.firstName ?? undefined,
        reason,
        actionUrl: `${env.appBaseUrl()}/dataroom`,
      },
    });
  } catch {
    /* el fallo de email no debe interrumpir el rechazo */
  }

  return { ok: true };
}
