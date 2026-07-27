/**
 * Sección 09 · Acceso — ALT-WEB-2026-01 v1.2 §04.I.
 *
 * Lo que entra por el único botón del site. Antes iba a Formspree; ahora queda
 * en la misma base de datos y con la misma auditoría que el resto, de modo que
 * el compromiso público —«toda solicitud recibe respuesta en 24 horas, en un
 * sentido u otro»— es comprobable contra un registro propio.
 */
import { db, schema } from '../db/client';
import { writeAudit, type RequestMeta } from '../lib/audit';
import { sendTransactionalEmail } from '../lib/emails/send';
import { DATAROOM_TENANT, LEGAL_TERMS_VERSION, env } from '../config';

export async function createAccessRequest(input: {
  email: string;
  phone?: string | null;
  locale: 'es' | 'en';
  meta: RequestMeta;
}): Promise<{ ok: true }> {
  const email = input.email.trim().toLowerCase();
  const phone = input.phone?.trim() || null;

  const [row] = await db()
    .insert(schema.accessRequests)
    .values({
      tenant: DATAROOM_TENANT,
      email,
      phone,
      locale: input.locale,
      consentVersion: LEGAL_TERMS_VERSION,
      ip: input.meta.ip ?? null,
      userAgent: input.meta.userAgent?.slice(0, 500) ?? null,
    })
    .returning({ id: schema.accessRequests.id });

  // Aviso al administrador: es quien tiene que responder dentro del plazo.
  await sendTransactionalEmail({
    template: 'access_request_admin',
    locale: 'es',
    to: env.adminEmail(),
    params: { investorEmail: email, reason: phone ?? undefined },
  });

  // Acuse al solicitante, en su idioma. Un fallo aquí no invalida la solicitud:
  // ya está registrada y el administrador ya ha sido avisado.
  await sendTransactionalEmail({
    template: 'access_request_ack',
    locale: input.locale,
    to: email,
    params: {},
  });

  await writeAudit({
    tenant: DATAROOM_TENANT,
    actor: { type: 'system', email },
    action: 'access_request.received',
    entityType: 'access_request',
    entityId: row?.id ?? null,
    req: input.meta,
  });

  return { ok: true };
}
