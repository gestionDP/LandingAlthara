import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  canTransitionInvestor,
  invitationIsRedeemable,
  deriveNdaState,
  ndaUnlocksSensitive,
  canTransitionVersion,
  projectDocumentsAvailable,
} from '../core/states.ts';

describe('investor state machine', () => {
  it('follows the happy path draft -> invited -> registration_started -> active', () => {
    assert.ok(canTransitionInvestor('draft', 'invited'));
    assert.ok(canTransitionInvestor('invited', 'registration_started'));
    assert.ok(canTransitionInvestor('registration_started', 'active'));
  });
  it('allows re-invite after expiry/revocation', () => {
    assert.ok(canTransitionInvestor('invitation_expired', 'invited'));
    assert.ok(canTransitionInvestor('invitation_revoked', 'invited'));
    assert.ok(canTransitionInvestor('invited', 'invited')); // resend
  });
  it('suspension is reversible, disable requires re-invitation', () => {
    assert.ok(canTransitionInvestor('active', 'suspended'));
    assert.ok(canTransitionInvestor('suspended', 'active'));
    assert.ok(canTransitionInvestor('disabled', 'invited'));
    assert.ok(!canTransitionInvestor('disabled', 'active'));
  });
  it('forbids skipping registration', () => {
    assert.ok(!canTransitionInvestor('draft', 'active'));
    assert.ok(!canTransitionInvestor('invited', 'active'));
  });
});

describe('invitation redeemability', () => {
  const future = new Date(Date.now() + 3600_000);
  const past = new Date(Date.now() - 3600_000);
  it('accepts a pending, unexpired invitation', () => {
    assert.deepEqual(invitationIsRedeemable({ status: 'pending', expiresAt: future }), { ok: true });
  });
  it('rejects used / revoked / expired', () => {
    assert.equal((invitationIsRedeemable({ status: 'used', expiresAt: future }) as any).reason, 'used');
    assert.equal((invitationIsRedeemable({ status: 'revoked', expiresAt: future }) as any).reason, 'revoked');
    assert.equal((invitationIsRedeemable({ status: 'pending', expiresAt: past }) as any).reason, 'expired');
    assert.equal((invitationIsRedeemable({ status: 'expired', expiresAt: future }) as any).reason, 'expired');
  });
});

describe('NDA state derivation', () => {
  const base = { ndaRequired: true, hasActiveNdaVersion: true, activeVersionNumber: 2 } as const;
  it('not_required when project does not require NDA', () => {
    assert.equal(
      deriveNdaState({ ...base, ndaRequired: false, signature: null, policy: 'resign' }),
      'not_required',
    );
  });
  it('pending_signature when never signed', () => {
    assert.equal(deriveNdaState({ ...base, signature: null, policy: 'resign' }), 'pending_signature');
  });
  it('signed with the current version', () => {
    assert.equal(
      deriveNdaState({ ...base, signature: { status: 'signed', versionNumber: 2 }, policy: 'resign' }),
      'signed',
    );
  });
  it('old signature: resign -> pending, grandfather -> signed, block -> expired', () => {
    const sig = { status: 'signed', versionNumber: 1 } as const;
    assert.equal(deriveNdaState({ ...base, signature: sig, policy: 'resign' }), 'pending_signature');
    assert.equal(deriveNdaState({ ...base, signature: sig, policy: 'grandfather' }), 'signed');
    assert.equal(deriveNdaState({ ...base, signature: sig, policy: 'block' }), 'expired');
  });
  it('revoked signature blocks', () => {
    assert.equal(
      deriveNdaState({ ...base, signature: { status: 'revoked', versionNumber: 2 }, policy: 'resign' }),
      'revoked',
    );
  });
  it('only not_required and signed unlock sensitive docs', () => {
    assert.ok(ndaUnlocksSensitive('signed'));
    assert.ok(ndaUnlocksSensitive('not_required'));
    for (const s of ['required', 'pending_signature', 'expired', 'revoked'] as const)
      assert.ok(!ndaUnlocksSensitive(s));
  });
});

describe('version + project states', () => {
  it('published version can be superseded but archived cannot change', () => {
    assert.ok(canTransitionVersion('published', 'superseded'));
    assert.ok(!canTransitionVersion('archived', 'published'));
  });
  it('only active projects serve documents', () => {
    assert.ok(projectDocumentsAvailable('active'));
    for (const s of ['draft', 'temporarily_unavailable', 'closed', 'archived'] as const)
      assert.ok(!projectDocumentsAvailable(s));
  });
});
