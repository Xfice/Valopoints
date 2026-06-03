import { signOut } from 'next-auth/react';

/**
 * Fetch that redirects to /login when session expires (401).
 * Clears the invalid session before redirecting.
 */
export async function fetchWithAuth(
  input: RequestInfo | URL,
  init?: RequestInit
): Promise<Response> {
  const res = await fetch(input, init);
  if (res.status === 401) {
    await signOut({ redirect: false });
    window.location.href = '/login';
    throw new Error('Session expired');
  }
  return res;
}
