import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  generateInvitationToken,
  tokenMatches,
  looksLikeToken,
  invitationExpiry,
  sha256Hex,
} from '../core/tokens.ts';
import { checkPasswordPolicy } from '../core/passwords.ts';

describe('invitation tokens', () => {
  it('generates unique, well-formed tokens whose raw value differs from the stored hash', () => {
    const a = generateInvitationToken();
    const b = generateInvitationToken();
    assert.notEqual(a.raw, b.raw);
    assert.notEqual(a.raw, a.hash);
    assert.ok(looksLikeToken(a.raw));
    assert.match(a.hash, /^[0-9a-f]{64}$/);
  });
  it('verifies with timing-safe comparison and rejects tampered tokens', () => {
    const t = generateInvitationToken();
    assert.ok(tokenMatches(t.raw, t.hash));
    assert.ok(!tokenMatches(t.raw + 'x', t.hash));
    assert.ok(!tokenMatches(t.raw.slice(0, -1) + (t.raw.at(-1) === 'A' ? 'B' : 'A'), t.hash));
  });
  it('rejects garbage token shapes before touching the DB', () => {
    assert.ok(!looksLikeToken(''));
    assert.ok(!looksLikeToken('short'));
    assert.ok(!looksLikeToken(null));
    assert.ok(!looksLikeToken('a'.repeat(400)));
    assert.ok(!looksLikeToken('has spaces and $ymbols'.padEnd(45, 'x')));
  });
  it('computes expiry from TTL', () => {
    const from = new Date('2026-07-13T10:00:00Z');
    assert.equal(invitationExpiry(72, from).toISOString(), '2026-07-16T10:00:00.000Z');
  });
  it('sha256Hex is deterministic', () => {
    assert.equal(sha256Hex('althara'), sha256Hex('althara'));
    assert.notEqual(sha256Hex('a'), sha256Hex('b'));
  });
});

describe('password policy', () => {
  it('accepts a strong password', () => {
    assert.ok(checkPasswordPolicy('Correct-Horse-42-Battery').ok);
  });
  it('rejects weak passwords with reasons', () => {
    assert.deepEqual(checkPasswordPolicy('short').ok, false);
    assert.ok(checkPasswordPolicy('alllowercase123456').errors.includes('needs_uppercase'));
    assert.ok(checkPasswordPolicy('ALLUPPERCASE123456').errors.includes('needs_lowercase'));
    assert.ok(checkPasswordPolicy('NoDigitsHerePlease').errors.includes('needs_digit'));
    assert.ok(checkPasswordPolicy('Password12345678').errors.includes('too_common'));
  });
});
