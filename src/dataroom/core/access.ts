/**
 * Effective access computation — THE single source of truth for authorization
 * decisions on documents. Pure module, exhaustively unit-tested.
 *
 * Deny by default: every input must positively allow access.
 */
import {
  investorCanAccessPortal,
  projectDocumentsAvailable,
  ndaUnlocksSensitive,
  type InvestorStatus,
  type ProjectStatus,
  type AccessStatus,
  type DocumentStatus,
  type NdaState,
} from './states.ts';

export interface AccessInput {
  sameTenant: boolean;
  investorStatus: InvestorStatus;
  projectStatus: ProjectStatus;
  /** null = project never assigned to this investor */
  assignment: { status: AccessStatus; accessLevel: 'generic' | 'full' } | null;
  document: {
    status: DocumentStatus;
    confidentiality: 'generic' | 'sensitive';
    downloadable: boolean;
    requiresNda: boolean;
  };
  /** Per-investor override; null = no specific permission row */
  permission: { effect: 'allow' | 'deny'; canDownload: boolean } | null;
  ndaState: NdaState;
}

export type DenyReason =
  | 'tenant_mismatch'
  | 'account_inactive'
  | 'project_unavailable'
  | 'not_assigned'
  | 'assignment_inactive'
  | 'document_unavailable'
  | 'explicit_deny'
  | 'nda_required'
  | 'level_insufficient';

export interface AccessDecision {
  canView: boolean;
  canDownload: boolean;
  reason: DenyReason | null;
}

const DENY = (reason: DenyReason): AccessDecision => ({
  canView: false,
  canDownload: false,
  reason,
});

export function computeDocumentAccess(i: AccessInput): AccessDecision {
  if (!i.sameTenant) return DENY('tenant_mismatch');
  if (!investorCanAccessPortal(i.investorStatus)) return DENY('account_inactive');
  if (!projectDocumentsAvailable(i.projectStatus)) return DENY('project_unavailable');
  if (!i.assignment) return DENY('not_assigned');
  if (i.assignment.status !== 'active') return DENY('assignment_inactive');
  if (i.document.status !== 'published') return DENY('document_unavailable');
  if (i.permission?.effect === 'deny') return DENY('explicit_deny');

  const isSensitive = i.document.confidentiality === 'sensitive';

  // "Acceso limitado" (accessLevel 'generic'): modelo tipo Google Drive — el
  // inversor solo ve los documentos que se le han compartido explícitamente
  // (permiso 'allow'). Sin permiso explícito no ve NADA, sea general o
  // confidencial. El "acceso completo" ('full') ve todo por defecto.
  if (i.assignment.accessLevel === 'generic' && i.permission?.effect !== 'allow') {
    return DENY('level_insufficient');
  }

  // NDA gate applies to sensitive documents flagged requires_nda.
  if (isSensitive && i.document.requiresNda && !ndaUnlocksSensitive(i.ndaState)) {
    return DENY('nda_required');
  }

  const canDownload =
    i.document.downloadable && (i.permission ? i.permission.canDownload : true);

  return { canView: true, canDownload, reason: null };
}

/** Whether an investor may even see the project card / open the project page. */
export function computeProjectVisibility(i: {
  sameTenant: boolean;
  investorStatus: InvestorStatus;
  projectStatus: ProjectStatus;
  assignment: { status: AccessStatus } | null;
}): boolean {
  if (!i.sameTenant) return false;
  if (!investorCanAccessPortal(i.investorStatus)) return false;
  // Solo un acceso ACTIVO muestra el proyecto. 'pending' (invitación sin
  // aceptar), 'suspended' o 'revoked' no lo muestran.
  if (!i.assignment || i.assignment.status !== 'active') return false;
  if (i.projectStatus === 'draft' || i.projectStatus === 'archived') return false;
  return true;
}
