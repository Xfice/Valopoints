'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Spinner } from '@/components/Spinner';
import { fetchWithAuth } from '@/lib/api';

interface PlayerEntry {
  userId: string;
  displayName: string;
  username: string;
  email: string | null;
  points: number;
  rankName: string;
  rankImagePath?: string;
  rankColor?: string;
}

interface Props {
  leaderboard: PlayerEntry[];
  allPlayers: PlayerEntry[];
}

export function AdminPlayersTable({ leaderboard, allPlayers }: Props) {
  const [tab, setTab] = useState<'leaderboard' | 'all'>('all');
  const [removing, setRemoving] = useState<string | null>(null);
  const router = useRouter();

  const data = tab === 'leaderboard' ? leaderboard : allPlayers;

  async function handleRemove(userId: string) {
    if (!confirm('Remove this player? This will delete their account and all data.')) return;
    setRemoving(userId);
    const res = await fetchWithAuth('/api/admin/remove-player', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId }),
    });
    setRemoving(null);
    if (res.ok) {
      router.refresh();
    } else {
      const data = await res.json();
      alert(data.error || 'Failed to remove');
    }
  }

  return (
    <div className="bg-valo-panel border border-gray-600 rounded-lg overflow-hidden">
      <div className="flex border-b border-gray-600">
        <button
          onClick={() => setTab('all')}
          className={`px-4 py-3 font-medium transition ${
            tab === 'all'
              ? 'bg-valo-red text-white'
              : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
          }`}
        >
          All Players
        </button>
        <button
          onClick={() => setTab('leaderboard')}
          className={`px-4 py-3 font-medium transition ${
            tab === 'leaderboard'
              ? 'bg-valo-red text-white'
              : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
          }`}
        >
          Leaderboard
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-600">
              <th className="text-left p-3">#</th>
              <th className="text-left p-3">Player</th>
              <th className="text-left p-3">Username</th>
              <th className="text-left p-3">Points</th>
              <th className="text-left p-3">Rank</th>
              {tab === 'all' && <th className="text-left p-3 w-24">Actions</th>}
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td colSpan={tab === 'all' ? 6 : 5} className="p-8 text-center text-gray-500">
                  No players yet.
                </td>
              </tr>
            ) : (
              data.map((e, i) => (
                <tr key={e.userId} className="border-b border-gray-700 hover:bg-gray-800/50">
                  <td className="p-3">{tab === 'leaderboard' ? i + 1 : '—'}</td>
                  <td className="p-3 font-medium">{e.displayName}</td>
                  <td className="p-3 text-gray-400">{e.username}</td>
                  <td className="p-3">{e.points.toFixed(1)}</td>
                  <td className="p-3">
                    <span className="flex items-center gap-2">
                      {e.rankImagePath && (
                        <img
                          src={e.rankImagePath}
                          alt={e.rankName}
                          className={e.rankColor === 'black' ? 'belt-thumb belt-thumb-black' : 'belt-thumb'}
                        />
                      )}
                      <span className="text-gray-400">{e.rankName}</span>
                    </span>
                  </td>
                  {tab === 'all' && (
                    <td className="p-3">
                      <button
                        onClick={() => handleRemove(e.userId)}
                        disabled={removing === e.userId}
                        className="px-2 py-1 text-xs bg-red-900/50 hover:bg-red-600 text-red-300 hover:text-white rounded disabled:opacity-50 flex items-center gap-1"
                      >
                        {removing === e.userId ? <><Spinner className="w-3 h-3" /> Removing...</> : 'Remove'}
                      </button>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
