'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { Spinner } from './Spinner';

export function LogoutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleLogout() {
    setLoading(true);
    await signOut({ redirect: false });
    router.push('/');
    router.refresh();
  }

  return (
    <button onClick={handleLogout} disabled={loading} className="text-gray-400 hover:text-white disabled:opacity-70 flex items-center gap-2">
      {loading ? <><Spinner className="w-4 h-4" /> Logging out...</> : 'Logout'}
    </button>
  );
}
