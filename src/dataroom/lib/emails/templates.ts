/**
 * Transactional email templates, ES/EN, Althara branding.
 * Links are always absolute and never contain sensitive data beyond the
 * one-time invitation token (which is itself single-use and expiring).
 */

export type EmailTemplate =
  | 'invitation'
  | 'invitation_resend'
  | 'invitation_reminder'
  | 'account_activated'
  | 'nda_signed'
  | 'new_documents'
  | 'new_version'
  | 'project_granted'
  | 'project_revoked'
  | 'password_reset'
  | 'account_suspended'
  | 'kyc_validated'
  | 'kyc_rejected'
  | 'kyc_submitted_admin'
  | 'document_reviewed_admin'
  | 'document_pending_review';

export type EmailLocale = 'es' | 'en';

export interface RenderedEmail {
  subject: string;
  html: string;
}

interface TemplateParams {
  investorName?: string;
  projectName?: string;
  documentCount?: number;
  documentTitles?: string[];
  actionUrl?: string;
  expiresHours?: number;
  /** Motivo del rechazo de KYC (kyc_rejected). */
  reason?: string;
  /** Email del inversor, para avisos internos al admin (kyc_submitted_admin). */
  investorEmail?: string;
  /** Visado de documentos (document_reviewed_admin). */
  documentTitle?: string;
  reviewRole?: string;
  reviewDecision?: string;
}

const BRAND = {
  bg: '#102027',
  panel: '#1c3742',
  text: '#e6e2d7',
  muted: '#d9dad7',
};

function layout(locale: EmailLocale, title: string, bodyHtml: string, cta?: { label: string; url: string }): string {
  const confidential =
    locale === 'es'
      ? 'Este mensaje es confidencial y está dirigido únicamente a su destinatario.'
      : 'This message is confidential and intended solely for its recipient.';
  return `<!doctype html><html><body style="margin:0;padding:0;background:${BRAND.bg};font-family:Arial,Helvetica,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${BRAND.bg};padding:32px 0;">
    <tr><td align="center">
      <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="background:${BRAND.panel};border-radius:8px;padding:40px;">
        <tr><td style="color:${BRAND.text};font-size:22px;font-weight:bold;letter-spacing:2px;padding-bottom:24px;">ALTHARA</td></tr>
        <tr><td style="color:${BRAND.text};font-size:18px;font-weight:600;padding-bottom:16px;">${title}</td></tr>
        <tr><td style="color:${BRAND.muted};font-size:14px;line-height:22px;padding-bottom:24px;">${bodyHtml}</td></tr>
        ${
          cta
            ? `<tr><td style="padding-bottom:24px;"><a href="${cta.url}" style="display:inline-block;background:${BRAND.text};color:${BRAND.bg};text-decoration:none;font-size:14px;font-weight:600;padding:12px 28px;border-radius:4px;">${cta.label}</a></td></tr>`
            : ''
        }
        <tr><td style="color:${BRAND.muted};font-size:11px;line-height:16px;border-top:1px solid rgba(217,218,215,0.2);padding-top:16px;">${confidential}</td></tr>
      </table>
    </td></tr>
  </table></body></html>`;
}

type Dict = Record<
  EmailTemplate,
  (p: TemplateParams) => { subject: string; title: string; body: string; cta?: string }
>;

const es: Dict = {
  invitation: (p) => ({
    subject: 'Invitación al portal de inversores de Althara',
    title: 'Ha sido invitado al portal privado de inversores',
    body: `Hola${p.investorName ? ` ${p.investorName}` : ''},<br/><br/>Althara le ha dado acceso a su portal privado de inversores. Para activar su cuenta, cree su contraseña a través del siguiente enlace. El enlace es personal, de un solo uso y caduca en ${p.expiresHours ?? 72} horas.`,
    cta: 'Activar mi cuenta',
  }),
  invitation_resend: (p) => ({
    subject: 'Nueva invitación al portal de inversores de Althara',
    title: 'Le hemos reenviado su invitación',
    body: `Hola${p.investorName ? ` ${p.investorName}` : ''},<br/><br/>Le hemos generado un nuevo enlace de activación. Los enlaces anteriores han quedado invalidados. Este enlace caduca en ${p.expiresHours ?? 72} horas.`,
    cta: 'Activar mi cuenta',
  }),
  invitation_reminder: (p) => ({
    subject: 'Recordatorio: su invitación al portal de Althara está pendiente',
    title: 'Su invitación sigue pendiente',
    body: `Hola${p.investorName ? ` ${p.investorName}` : ''},<br/><br/>Le recordamos que tiene una invitación pendiente al portal privado de inversores de Althara. Si el enlace ha caducado, contacte con su gestor para recibir uno nuevo.`,
    cta: 'Completar activación',
  }),
  account_activated: (p) => ({
    subject: 'Su cuenta de inversor está activa',
    title: 'Cuenta activada correctamente',
    body: `Hola${p.investorName ? ` ${p.investorName}` : ''},<br/><br/>Su cuenta del portal de inversores de Althara ya está activa. Puede acceder a los proyectos que le han sido asignados.`,
    cta: 'Ir a mi portal',
  }),
  nda_signed: (p) => ({
    subject: `NDA firmado — ${p.projectName ?? ''}`,
    title: 'Confirmación de firma del NDA',
    body: `Hemos registrado su firma del acuerdo de confidencialidad del proyecto <strong>${p.projectName ?? ''}</strong>. La documentación sensible del proyecto ha quedado desbloqueada en su portal.`,
    cta: 'Ver documentación',
  }),
  new_documents: (p) => ({
    subject: `Nueva documentación disponible — ${p.projectName ?? 'Althara'}`,
    title: `${p.documentCount ?? 1} documento(s) nuevo(s) disponible(s)`,
    body: `Se ha publicado nueva documentación en el proyecto <strong>${p.projectName ?? ''}</strong>:<br/><br/>${(p.documentTitles ?? []).map((t) => `• ${t}`).join('<br/>')}`,
    cta: 'Ver documentos',
  }),
  new_version: (p) => ({
    subject: `Documento actualizado — ${p.projectName ?? 'Althara'}`,
    title: 'Nueva versión disponible',
    body: `Se ha publicado una nueva versión de un documento en el proyecto <strong>${p.projectName ?? ''}</strong>:<br/><br/>${(p.documentTitles ?? []).map((t) => `• ${t}`).join('<br/>')}`,
    cta: 'Ver documento',
  }),
  project_granted: (p) => ({
    subject: `Acceso concedido — ${p.projectName ?? 'Althara'}`,
    title: 'Nuevo proyecto disponible',
    body: `Se le ha concedido acceso al proyecto <strong>${p.projectName ?? ''}</strong> en el portal de inversores de Althara.`,
    cta: 'Abrir proyecto',
  }),
  project_revoked: (p) => ({
    subject: `Acceso actualizado — ${p.projectName ?? 'Althara'}`,
    title: 'Cambio en sus accesos',
    body: `Su acceso al proyecto <strong>${p.projectName ?? ''}</strong> ha sido retirado. Si cree que se trata de un error, contacte con su gestor.`,
  }),
  password_reset: (p) => ({
    subject: 'Restablecimiento de contraseña — Althara',
    title: 'Restablecer su contraseña',
    body: 'Hemos recibido una solicitud para restablecer su contraseña. Si no ha sido usted, ignore este mensaje.',
    cta: 'Restablecer contraseña',
  }),
  account_suspended: (p) => ({
    subject: 'Su cuenta ha sido suspendida temporalmente',
    title: 'Cuenta suspendida',
    body: `Hola${p.investorName ? ` ${p.investorName}` : ''},<br/><br/>Su acceso al portal de inversores ha sido suspendido temporalmente. Para más información, contacte con su gestor en Althara.`,
  }),
  kyc_validated: (p) => ({
    subject: 'Su identidad ha sido verificada',
    title: 'Verificación completada',
    body: `Hola${p.investorName ? ` ${p.investorName}` : ''},<br/><br/>Hemos verificado correctamente su identidad. Su acceso al portal de inversores de Althara ya está activo y puede consultar los proyectos que le han sido asignados.`,
    cta: 'Ir a mi portal',
  }),
  kyc_rejected: (p) => ({
    subject: 'No hemos podido verificar su identidad',
    title: 'Verificación no completada',
    body: `Hola${p.investorName ? ` ${p.investorName}` : ''},<br/><br/>No hemos podido verificar su identidad.<br/><br/>Motivo: <strong>${p.reason ?? 'No especificado'}</strong><br/><br/>Le invitamos a corregir los datos indicados y reenviar su verificación desde el portal. Si tiene dudas, contacte con su gestor en Althara.`,
    cta: 'Revisar mi verificación',
  }),
  kyc_submitted_admin: (p) => ({
    subject: 'Nuevo KYC pendiente de validación',
    title: 'Un inversor ha enviado su KYC',
    body: `El inversor <strong>${p.investorEmail ?? 'desconocido'}</strong> ha enviado su verificación de identidad (KYC) y está pendiente de validación en el panel de administración.`,
  }),
  document_reviewed_admin: (p) => ({
    subject: `Visado ${p.reviewDecision ?? ''} — ${p.documentTitle ?? 'documento'}`,
    title: `Un revisor ha ${p.reviewDecision ?? 'revisado'} un documento`,
    body: `El revisor de <strong>${p.reviewRole ?? ''}</strong> ha <strong>${p.reviewDecision ?? 'revisado'}</strong> el documento <strong>${p.documentTitle ?? ''}</strong>.${p.reason ? `<br/><br/>Motivo: <strong>${p.reason}</strong>` : ''}<br/><br/>Consulte el estado del visado en el panel de administración.`,
  }),
  document_pending_review: (p) => ({
    subject: `Nuevo documento pendiente de su visado — ${p.projectName ?? 'Althara'}`,
    title: 'Tiene un documento pendiente de revisión',
    body: `Se ha subido el documento <strong>${p.documentTitle ?? ''}</strong>${p.projectName ? ` en el proyecto <strong>${p.projectName}</strong>` : ''} y requiere su visado de abogado antes de publicarse al inversor.`,
    cta: 'Revisar ahora',
  }),
};

const en: Dict = {
  invitation: (p) => ({
    subject: 'Invitation to the Althara investor portal',
    title: 'You have been invited to the private investor portal',
    body: `Hello${p.investorName ? ` ${p.investorName}` : ''},<br/><br/>Althara has granted you access to its private investor portal. To activate your account, create your password using the link below. The link is personal, single-use and expires in ${p.expiresHours ?? 72} hours.`,
    cta: 'Activate my account',
  }),
  invitation_resend: (p) => ({
    subject: 'New invitation to the Althara investor portal',
    title: 'Your invitation has been resent',
    body: `Hello${p.investorName ? ` ${p.investorName}` : ''},<br/><br/>We have generated a new activation link. Previous links are no longer valid. This link expires in ${p.expiresHours ?? 72} hours.`,
    cta: 'Activate my account',
  }),
  invitation_reminder: (p) => ({
    subject: 'Reminder: your Althara portal invitation is pending',
    title: 'Your invitation is still pending',
    body: `Hello${p.investorName ? ` ${p.investorName}` : ''},<br/><br/>This is a reminder that you have a pending invitation to the Althara investor portal. If the link has expired, contact your manager to receive a new one.`,
    cta: 'Complete activation',
  }),
  account_activated: (p) => ({
    subject: 'Your investor account is active',
    title: 'Account successfully activated',
    body: `Hello${p.investorName ? ` ${p.investorName}` : ''},<br/><br/>Your Althara investor portal account is now active. You can access the projects assigned to you.`,
    cta: 'Go to my portal',
  }),
  nda_signed: (p) => ({
    subject: `NDA signed — ${p.projectName ?? ''}`,
    title: 'NDA signature confirmation',
    body: `We have recorded your signature of the non-disclosure agreement for <strong>${p.projectName ?? ''}</strong>. The project's sensitive documentation is now unlocked in your portal.`,
    cta: 'View documents',
  }),
  new_documents: (p) => ({
    subject: `New documents available — ${p.projectName ?? 'Althara'}`,
    title: `${p.documentCount ?? 1} new document(s) available`,
    body: `New documentation has been published in <strong>${p.projectName ?? ''}</strong>:<br/><br/>${(p.documentTitles ?? []).map((t) => `• ${t}`).join('<br/>')}`,
    cta: 'View documents',
  }),
  new_version: (p) => ({
    subject: `Document updated — ${p.projectName ?? 'Althara'}`,
    title: 'New version available',
    body: `A new version of a document has been published in <strong>${p.projectName ?? ''}</strong>:<br/><br/>${(p.documentTitles ?? []).map((t) => `• ${t}`).join('<br/>')}`,
    cta: 'View document',
  }),
  project_granted: (p) => ({
    subject: `Access granted — ${p.projectName ?? 'Althara'}`,
    title: 'New project available',
    body: `You have been granted access to <strong>${p.projectName ?? ''}</strong> in the Althara investor portal.`,
    cta: 'Open project',
  }),
  project_revoked: (p) => ({
    subject: `Access updated — ${p.projectName ?? 'Althara'}`,
    title: 'A change to your access',
    body: `Your access to <strong>${p.projectName ?? ''}</strong> has been withdrawn. If you believe this is an error, please contact your manager.`,
  }),
  password_reset: () => ({
    subject: 'Password reset — Althara',
    title: 'Reset your password',
    body: 'We received a request to reset your password. If this was not you, please ignore this message.',
    cta: 'Reset password',
  }),
  account_suspended: (p) => ({
    subject: 'Your account has been temporarily suspended',
    title: 'Account suspended',
    body: `Hello${p.investorName ? ` ${p.investorName}` : ''},<br/><br/>Your access to the investor portal has been temporarily suspended. For more information, contact your Althara manager.`,
  }),
  kyc_validated: (p) => ({
    subject: 'Your identity has been verified',
    title: 'Verification complete',
    body: `Hello${p.investorName ? ` ${p.investorName}` : ''},<br/><br/>We have successfully verified your identity. Your access to the Althara investor portal is now active and you can review the projects assigned to you.`,
    cta: 'Go to my portal',
  }),
  kyc_rejected: (p) => ({
    subject: 'We could not verify your identity',
    title: 'Verification not completed',
    body: `Hello${p.investorName ? ` ${p.investorName}` : ''},<br/><br/>We were unable to verify your identity.<br/><br/>Reason: <strong>${p.reason ?? 'Not specified'}</strong><br/><br/>Please correct the details above and resubmit your verification from the portal. If you have any questions, contact your Althara manager.`,
    cta: 'Review my verification',
  }),
  kyc_submitted_admin: (p) => ({
    subject: 'New KYC pending validation',
    title: 'An investor has submitted their KYC',
    body: `Investor <strong>${p.investorEmail ?? 'unknown'}</strong> has submitted their identity verification (KYC) and it is pending validation in the admin panel.`,
  }),
  document_reviewed_admin: (p) => ({
    subject: `Review ${p.reviewDecision ?? ''} — ${p.documentTitle ?? 'document'}`,
    title: `A reviewer has ${p.reviewDecision ?? 'reviewed'} a document`,
    body: `The <strong>${p.reviewRole ?? ''}</strong> reviewer has <strong>${p.reviewDecision ?? 'reviewed'}</strong> the document <strong>${p.documentTitle ?? ''}</strong>.${p.reason ? `<br/><br/>Reason: <strong>${p.reason}</strong>` : ''}<br/><br/>Check the review status in the admin panel.`,
  }),
  document_pending_review: (p) => ({
    subject: `New document pending your review — ${p.projectName ?? 'Althara'}`,
    title: 'You have a document pending review',
    body: `The document <strong>${p.documentTitle ?? ''}</strong>${p.projectName ? ` in project <strong>${p.projectName}</strong>` : ''} has been uploaded and requires legal review before it is published to the investor.`,
    cta: 'Review now',
  }),
};

export function renderEmail(
  template: EmailTemplate,
  locale: EmailLocale,
  params: TemplateParams,
): RenderedEmail {
  const dict = locale === 'en' ? en : es;
  const t = dict[template](params);
  const cta = t.cta && params.actionUrl ? { label: t.cta, url: params.actionUrl } : undefined;
  return { subject: t.subject, html: layout(locale, t.title, t.body, cta) };
}
