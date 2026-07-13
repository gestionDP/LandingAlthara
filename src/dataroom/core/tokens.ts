/**
 * Invitation tokens. Pure module (node:crypto only).
 *
 * Raw token: 32 random bytes, base64url (~43 chars). Sent by email once,
 * NEVER stored. The database stores only its SHA-256 hex hash; lookups
 * compare hashes with timing-safe equality.
 */
import { randomBytes, createHash, timingSafeEqual } from 'node:crypto';

export function generateInvitationToken(): { raw: string; hash: string } {
  const raw = randomBytes(32).toString('base64url');
  return { raw, hash: hashToken(raw) };
}

export function hashToken(raw: string): string {
  return createHash('sha256').update(raw, 'utf8').digest('hex');
}

export function tokenMatches(raw: string, storedHash: string): boolean {
  const a = Buffer.from(hashToken(raw), 'hex');
  const b = Buffer.from(storedHash, 'hex');
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

/** Basic shape check before hitting the database. */
export function looksLikeToken(raw: unknown): raw is string {
  return typeof raw === 'string' && /^[A-Za-z0-9_-]{40,50}$/.test(raw);
}

export function invitationExpiry(ttlHours: number, from: Date = new Date()): Date {
  return new Date(from.getTime() + ttlHours * 3600_000);
}

/** SHA-256 of arbitrary content (file buffers, NDA bodies). */
export function sha256Hex(data: Buffer | string): string {
  return createHash('sha256').update(data).digest('hex');
}
