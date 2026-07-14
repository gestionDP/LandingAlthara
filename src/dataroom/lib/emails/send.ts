/**
 * Email delivery via Resend (same provider as Althara_back). Every send —
 * success or failure — is recorded in dataroom.email_events and audited.
 */
import { Resend } from 'resend';
import { db, schema } from '../../db/client';
import { writeAudit } from '../audit';
import { env, DATAROOM_TENANT } from '../../config';
import { renderEmail, type EmailTemplate, type EmailLocale } from './templates';

let _resend: Resend | null = null;
function resend(): Resend {
  if (!_resend) _resend = new Resend(env.resendApiKey());
  return _resend;
}

export async function sendTransactionalEmail(input: {
  template: EmailTemplate;
  locale: EmailLocale;
  to: string;
  investorId?: string | null;
  params: {
    investorName?: string;
    projectName?: string;
    documentCount?: number;
    documentTitles?: string[];
    actionUrl?: string;
    expiresHours?: number;
    reason?: string;
    investorEmail?: string;
    documentTitle?: string;
    reviewRole?: string;
    reviewDecision?: string;
  };
}): Promise<{ ok: boolean; error?: string }> {
  const { subject, html } = renderEmail(input.template, input.locale, input.params);

  let status: 'sent' | 'failed' = 'sent';
  let providerId: string | null = null;
  let errorMsg: string | null = null;

  try {
    const res = await resend().emails.send({
      from: `${env.resendFromName()} <${env.resendFrom()}>`,
      to: input.to,
      subject,
      html,
    });
    if (res.error) {
      status = 'failed';
      errorMsg = res.error.message;
    } else {
      providerId = res.data?.id ?? null;
    }
  } catch (err) {
    status = 'failed';
    errorMsg = err instanceof Error ? err.message : 'unknown_error';
  }

  await db().insert(schema.emailEvents).values({
    tenant: DATAROOM_TENANT,
    investorId: input.investorId ?? null,
    template: input.template,
    subject,
    toEmail: input.to,
    status,
    providerId,
    error: errorMsg,
  });

  await writeAudit({
    tenant: DATAROOM_TENANT,
    actor: { type: 'system' },
    action: status === 'sent' ? 'email.sent' : 'email.failed',
    entityType: 'email',
    entityId: providerId,
    result: status === 'sent' ? 'success' : 'error',
    metadata: { template: input.template, to: input.to },
  });

  return status === 'sent' ? { ok: true } : { ok: false, error: errorMsg ?? 'send_failed' };
}
