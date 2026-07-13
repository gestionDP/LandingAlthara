/**
 * Password policy (validated server-side before creating the Clerk user;
 * Clerk applies its own checks on top). Pure module.
 */

export interface PasswordCheck {
  ok: boolean;
  errors: string[];
}

export function checkPasswordPolicy(password: string): PasswordCheck {
  const errors: string[] = [];
  if (password.length < 12) errors.push('min_length_12');
  if (password.length > 128) errors.push('max_length_128');
  if (!/[a-z]/.test(password)) errors.push('needs_lowercase');
  if (!/[A-Z]/.test(password)) errors.push('needs_uppercase');
  if (!/[0-9]/.test(password)) errors.push('needs_digit');
  if (/^(password|contraseñ|12345|qwerty|althara)/i.test(password)) errors.push('too_common');
  return { ok: errors.length === 0, errors };
}
