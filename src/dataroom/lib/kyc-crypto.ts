/**
 * Cifrado de los datos sensibles del KYC (nº documento, teléfono, perfil).
 * AES-256-GCM. La clave sale de KYC_ENCRYPTION_KEY; si no está, se deriva de un
 * secreto existente (solo dev). El resultado es "iv.tag.datos" en base64.
 * Réplica funcional del cifrado Fernet del backend (formato distinto, mismo fin).
 */
import crypto from 'node:crypto';

function key(): Buffer {
  const raw = process.env.KYC_ENCRYPTION_KEY;
  if (raw && raw.trim()) {
    const b = (() => { try { return Buffer.from(raw, 'base64'); } catch { return Buffer.alloc(0); } })();
    if (b.length === 32) return b;
    return crypto.createHash('sha256').update(raw).digest();
  }
  const secret = process.env.CLERK_SECRET_KEY ?? process.env.SECRET_KEY ?? 'dataroom-kyc-dev-secret';
  return crypto.createHash('sha256').update(`kyc:${secret}`).digest();
}

export function encryptKyc(payload: unknown): string {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', key(), iv);
  const data = Buffer.concat([cipher.update(JSON.stringify(payload), 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `${iv.toString('base64')}.${tag.toString('base64')}.${data.toString('base64')}`;
}

export function decryptKyc(token: string): Record<string, unknown> {
  const [ivB, tagB, dataB] = token.split('.');
  if (!ivB || !tagB || !dataB) throw new Error('invalid_kyc_token');
  const decipher = crypto.createDecipheriv('aes-256-gcm', key(), Buffer.from(ivB, 'base64'));
  decipher.setAuthTag(Buffer.from(tagB, 'base64'));
  const out = Buffer.concat([decipher.update(Buffer.from(dataB, 'base64')), decipher.final()]);
  return JSON.parse(out.toString('utf8')) as Record<string, unknown>;
}
