/**
 * Immutable audit trail. Rows are append-only (DB trigger forbids UPDATE/DELETE).
 * NEVER pass passwords, raw tokens or unnecessary personal data in metadata.
 */
import { db, schema } from '../db/client';

export type AuditAction =
  | 'investor.created'
  | 'investor.updated'
  | 'investor.suspended'
  | 'investor.reactivated'
  | 'investor.disabled'
  | 'investor.deleted'
  | 'project.deleted'
  | 'document.deleted'
  | 'invitation.sent'
  | 'invitation.resent'
  | 'invitation.revoked'
  | 'invitation.validated'
  | 'invitation.validation_failed'
  | 'registration.completed'
  | 'auth.login'
  | 'auth.denied'
  | 'project.created'
  | 'project.updated'
  | 'project.access_granted'
  | 'project.access_revoked'
  | 'project.invitation_accepted'
  | 'project.invitation_declined'
  | 'nda.opened'
  | 'nda.signed'
  | 'nda.version_created'
  | 'document.uploaded'
  | 'document.published'
  | 'document.versioned'
  | 'document.archived'
  | 'document.viewed'
  | 'document.downloaded'
  | 'document.access_denied'
  | 'permission.changed'
  | 'email.sent'
  | 'email.failed'
  | 'notification.sent';

export interface AuditActor {
  type: 'admin' | 'investor' | 'system';
  id?: string | null;
  email?: string | null;
}

export interface RequestMeta {
  ip?: string | null;
  userAgent?: string | null;
}

export async function writeAudit(input: {
  tenant: string;
  actor: AuditActor;
  action: AuditAction;
  entityType: string;
  entityId?: string | null;
  result?: 'success' | 'denied' | 'error';
  metadata?: Record<string, unknown>;
  req?: RequestMeta;
}): Promise<void> {
  try {
    await db()
      .insert(schema.auditEvents)
      .values({
        tenant: input.tenant,
        actorType: input.actor.type,
        actorId: input.actor.id ?? null,
        actorEmail: input.actor.email ?? null,
        action: input.action,
        entityType: input.entityType,
        entityId: input.entityId ?? null,
        result: input.result ?? 'success',
        metadata: input.metadata ?? null,
        ip: input.req?.ip ?? null,
        userAgent: input.req?.userAgent?.slice(0, 500) ?? null,
      });
  } catch (err) {
    // Auditing must never break the main flow, but failures are logged.
    console.error('[dataroom.audit] failed to write audit event', {
      action: input.action,
      entityType: input.entityType,
      error: err instanceof Error ? err.message : String(err),
    });
  }
}

export function requestMeta(req: Request): RequestMeta {
  return {
    ip:
      req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
      req.headers.get('x-real-ip') ??
      null,
    userAgent: req.headers.get('user-agent'),
  };
}
