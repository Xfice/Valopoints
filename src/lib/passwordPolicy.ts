/** Matches ValoPoints desktop: min 8 chars, alphanumeric only; no symbol/uppercase rules. */
export const PASSWORD_POLICY_MESSAGE =
  'Password must be at least 8 characters, letters and numbers only (no symbols).';

export function isValidPassword(password: string): boolean {
  return /^[a-zA-Z0-9]{8,}$/.test(password);
}
