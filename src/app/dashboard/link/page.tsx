'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Spinner } from '@/components/Spinner';
import { fetchWithAuth } from '@/lib/api';

export default function LinkRiotPage() {
  const [riotName, setRiotName] = useState('');
  const [riotTag, setRiotTag] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [linked, setLinked] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    const res = await fetchWithAuth('/api/dashboard/link', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ riotName, riotTag }),
    });
    let data: { error?: string } = {};
    try {
      const text = await res.text();
      data = text ? JSON.parse(text) : {};
    } catch {
      setLoading(false);
      setError('Invalid response from server');
      return;
    }
    setLoading(false);
    if (!res.ok) {
      setError(data.error || 'Failed to link');
      return;
    }
    setLinked(true);
    setTimeout(() => {
      router.push('/dashboard');
      router.refresh();
    }, 1500);
  }

  if (linked) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-valo-panel border border-green-600 rounded-lg p-6 text-center">
          <p className="text-green-400 text-lg font-medium mb-2">Profile linked!</p>
          <p className="text-gray-400 text-sm">Redirecting to dashboard...</p>
          <Spinner className="w-6 h-6 mx-auto mt-4 text-green-400" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-valo-panel border border-gray-600 rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Link Your Riot Account</h2>
        <p className="text-gray-400 mb-4">Enter your Valorant Riot ID (e.g. PlayerName#NA1)</p>
        {error && <p className="text-red-400 text-sm mb-2">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Riot ID (name)</label>
            <input
              type="text"
              value={riotName}
              onChange={(e) => setRiotName(e.target.value)}
              placeholder="PlayerName"
              className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded text-white"
              required
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Tag</label>
            <input
              type="text"
              value={riotTag}
              onChange={(e) => setRiotTag(e.target.value)}
              placeholder="NA1"
              className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded text-white"
              required
            />
          </div>
          <div className="flex gap-2">
            <button type="submit" disabled={loading} className="px-4 py-2 bg-valo-red hover:bg-red-600 rounded font-medium disabled:opacity-70 flex items-center gap-2">
              {loading ? <><Spinner className="w-4 h-4" /> Linking...</> : 'Link Account'}
            </button>
            <Link href="/dashboard" className="px-4 py-2 border border-gray-600 rounded font-medium hover:bg-gray-700">
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
