/**
 * State machines for the dataroom domain. Pure module — no dependencies —
 * so it is unit-testable with plain `node --test`.
 */

export type InvestorStatus =
  | 'draft'
  | 'invited'
  | 'invitation_expired'
  | 'invitation_revoked'
  | 'registration_started'
  | 'pending_validation'
  | 'rejected'
  | 'active'
  | 'suspended'
  | 'disabled';

export type InvitationStatus = 'pending' | 'used' | 'revoked' | 'expired';

export type ProjectStatus =
  | 'draft'
  | 'active'
  | 'temporarily_unavailable'
  | 'closed'
  | 'archived';

export type AccessStatus = 'pending' | 'active' | 'suspended' | 'revoked';

export type DocumentStatus = 'draft' | 'published' | 'archived' | 'revoked';

export type VersionStatus = 'draft' | 'published' | 'superseded' | 'archived' | 'revoked';

export type NdaSignatureStatus = 'signed' | 'expired' | 'revoked';

export type NdaState =
  | 'not_required'
  | 'required'
  | 'pending_signature'
  | 'signed'
  | 'expired'
  | 'revoked';

const INVESTOR_TRANSITIONS: Record<InvestorStatus, InvestorStatus[]> = {
  draft: ['invited', 'disabled'],
  invited: ['invitation_expired', 'invitation_revoked', 'registration_started', 'invited', 'disabled'],
  invitation_expired: ['invited', 'disabled'],
  invitation_revoked: ['invited', 'disabled'],
  registration_started: ['pending_validation', 'active', 'invited', 'disabled'],
  pending_validation: ['active', 'rejected', 'disabled'],
  rejected: ['pending_validation', 'disabled'],
  active: ['suspended', 'disabled'],
  suspended: ['active', 'disabled'],
  disabled: ['invited'], // re-enable requires a fresh invitation
};

export function canTransitionInvestor(from: InvestorStatus, to: InvestorStatus): boolean {
  return INVESTOR_TRANSITIONS[from]?.includes(to) ?? false;
}

/** Statuses in which an investor may authenticate and use the portal. */
export function investorCanAccessPortal(status: InvestorStatus): boolean {
  return status === 'active';
}

/** Statuses in which an invitation can still be redeemed. */
export function invitationIsRedeemable(inv: {
  status: InvitationStatus;
  expiresAt: Date;
  now?: Date;
}): { ok: true } | { ok: false; reason: 'used' | 'revoked' | 'expired' } {
  if (inv.status === 'used') return { ok: false, reason: 'used' };
  if (inv.status === 'revoked') return { ok: false, reason: 'revoked' };
  const now = inv.now ?? new Date();
  if (inv.status === 'expired' || inv.expiresAt.getTime() <= now.getTime())
    return { ok: false, reason: 'expired' };
  return { ok: true };
}

/** Project statuses visible to an investor with an active assignment. */
export function projectIsVisible(status: ProjectStatus): boolean {
  return status === 'active' || status === 'temporarily_unavailable' || status === 'closed';
}

/** Project statuses whose documents may be served. */
export function projectDocumentsAvailable(status: ProjectStatus): boolean {
  return status === 'active';
}

const VERSION_TRANSITIONS: Record<VersionStatus, VersionStatus[]> = {
  draft: ['published', 'archived'],
  published: ['superseded', 'archived', 'revoked'],
  superseded: ['archived', 'revoked'],
  archived: [],
  revoked: [],
};

export function canTransitionVersion(from: VersionStatus, to: VersionStatus): boolean {
  return VERSION_TRANSITIONS[from]?.includes(to) ?? false;
}

/**
 * Derive the NDA state shown to an investor for a project.
 * `policy` applies when the active NDA version is newer than the signed one:
 *  - resign: must sign the new version (state -> pending_signature)
 *  - grandfather: previous signature keeps access (state -> signed)
 *  - block: sensitive content blocked until admin decides (state -> expired)
 */
export function deriveNdaState(input: {
  ndaRequired: boolean;
  hasActiveNdaVersion: boolean;
  signature: { status: NdaSignatureStatus; versionNumber: number } | null;
  activeVersionNumber: number | null;
  policy: 'resign' | 'grandfather' | 'block';
}): NdaState {
  if (!input.ndaRequired) return 'not_required';
  if (!input.hasActiveNdaVersion || input.activeVersionNumber === null) return 'required';
  const sig = input.signature;
  if (!sig) return 'pending_signature';
  if (sig.status === 'revoked') return 'revoked';
  if (sig.status === 'expired') return 'expired';
  if (sig.versionNumber < input.activeVersionNumber) {
    if (input.policy === 'grandfather') return 'signed';
    if (input.policy === 'resign') return 'pending_signature';
    return 'expired'; // block
  }
  return 'signed';
}

/** NDA states that unlock sensitive content. */
export function ndaUnlocksSensitive(state: NdaState): boolean {
  return state === 'not_required' || state === 'signed';
}
