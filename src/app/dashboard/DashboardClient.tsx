'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { getAgentIconPath } from '@/lib/agentIcons';
import { Spinner } from '@/components/Spinner';
import { fetchWithAuth } from '@/lib/api';

interface Profile {
  riotName: string;
  riotTag: string;
}

interface Record {
  id: string;
  agent: string | null;
  won: boolean;
  kills: number;
  deaths: number;
  assists: number;
  wasMvp: boolean;
  wasTeamMvp: boolean;
  aces: number;
  pointsEarned: number;
  matchPlayedAt: Date;
}

interface Rank {
  name: string;
  pointRange: string;
  hourlyRate: number;
  imagePath?: string;
  color?: string;
}

interface Props {
  profile: Profile;
  records: Record[];
  totalPoints: number;
  rank: Rank | null;
  valorantRank: string | null;
  valorantRankImagePath?: string | null;
}

export function DashboardClient({ profile, records, totalPoints, rank, valorantRank, valorantRankImagePath }: Props) {
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();

  async function handleRefresh() {
    setRefreshing(true);
    await fetchWithAuth('/api/dashboard/refresh', { method: 'POST' });
    router.refresh();
    setRefreshing(false);
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="rounded-lg p-4" style={{ background: 'linear-gradient(135deg, var(--valo-red) 0%, #cc3643 100%)' }}>
          <h3 className="text-sm text-red-200 opacity-75">Total Points</h3>
          <p className="text-2xl font-bold total-points-value">{totalPoints.toFixed(1)}</p>
          {rank && rank.hourlyRate > 0 && (
            <p className="text-sm mt-1 text-white">Your prize: <span className="prize-value">{rank.hourlyRate} pesos/hr</span></p>
          )}
          <p className="text-sm mt-1 font-bold text-white" style={{ letterSpacing: '0.02em' }}>{profile.riotName}#{profile.riotTag}</p>
        </div>
        <div className="flex flex-col gap-2">
          {valorantRank && (
            <div className="valorant-rank-card border rounded-lg p-4">
              <h3 className="text-sm text-gray-500 mb-1">Valorant Rank</h3>
              <div className="flex items-center gap-2">
                {valorantRankImagePath && (
                  <img
                    src={valorantRankImagePath}
                    alt={valorantRank}
                    className="valorant-rank-img"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                  />
                )}
                <p className="font-semibold text-gray-900">{valorantRank}</p>
              </div>
            </div>
          )}
          <div className="bg-valo-panel border border-gray-600 rounded-lg p-4 flex-1 flex flex-col justify-center">
            <h3 className="text-sm text-gray-400">Matches Tracked</h3>
            <p className="text-2xl font-bold">{records.length}</p>
          </div>
        </div>
        {rank && (
          <div className={`rank-card border rounded-lg p-4 text-center ${rank.color === 'black' ? '' : 'rank-card-kyu'}`}>
            <div className="belt-img-wrap belt-img-offset mb-2">
              <img
                src={rank.imagePath!}
                alt={`${rank.name} belt`}
                className={rank.color === 'black' ? 'rank-belt rank-belt-black' : 'rank-belt'}
              />
            </div>
            <h3 className="text-sm text-gray-500 mb-1">Rank:</h3>
            <p className="font-semibold text-gray-900">{rank.name}</p>
            <p className="text-sm text-gray-500 mt-1">{rank.pointRange} pts</p>
          </div>
        )}
      </div>

      <button
        onClick={handleRefresh}
        disabled={refreshing}
        className="mb-6 px-4 py-2 border border-valo-red text-valo-red hover:bg-valo-red hover:text-white rounded font-medium disabled:opacity-50 flex items-center gap-2"
      >
        {refreshing ? <><Spinner className="w-4 h-4" /> Refreshing...</> : 'Refresh Matches'}
      </button>

      <div className="bg-valo-panel border border-gray-600 rounded-lg overflow-hidden">
        <div className="px-4 py-2" style={{ background: 'linear-gradient(90deg, var(--valo-red) 0%, #cc3643 100%)' }}>
          <h2 className="font-semibold">Recent Matches</h2>
        </div>
        {records.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No matches yet. Click &quot;Refresh Matches&quot; to fetch your ranked games.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-600">
                  <th className="text-left p-3">Agent</th>
                  <th className="text-left p-3">Result</th>
                  <th className="text-left p-3">K/D/A</th>
                  <th className="text-left p-3">MVP</th>
                  <th className="text-left p-3">Team MVP</th>
                  <th className="text-left p-3">Aces</th>
                  <th className="text-left p-3">Points</th>
                  <th className="text-left p-3">Date</th>
                </tr>
              </thead>
              <tbody>
                {records.map((r) => {
                  const agentIconPath = getAgentIconPath(r.agent);
                  return (
                  <tr key={r.id} className="border-b border-gray-700 hover:bg-gray-800/50">
                    <td className="p-3">
                      <span className="flex items-center gap-2">
                        {agentIconPath && (
                          <img
                            src={agentIconPath}
                            alt={r.agent || ''}
                            className="agent-thumb"
                            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                          />
                        )}
                        <span className="font-bold">{r.agent || '-'}</span>
                      </span>
                    </td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded text-xs font-bold ${r.won ? 'badge-win-result' : 'badge-loss-result'}`}>
                        {r.won ? 'WIN' : 'LOSS'}
                      </span>
                    </td>
                    <td className="p-3 font-bold tabular-nums">{r.kills}/{r.deaths}/{r.assists}</td>
                    <td className="p-3">{r.wasMvp ? <span className="badge-mvp-result">★ MVP</span> : <span className="text-gray-500">—</span>}</td>
                    <td className="p-3">{r.wasTeamMvp ? <span className="badge-team-mvp-result">Team MVP</span> : <span className="text-gray-500">—</span>}</td>
                    <td className="p-3">{r.aces > 0 ? <span className="badge-ace-result">{r.aces} ACE{r.aces > 1 ? 'S' : ''}</span> : <span className="text-gray-500">—</span>}</td>
                    <td className="p-3">{r.pointsEarned > 0 ? '+' : ''}{r.pointsEarned}</td>
                    <td className="p-3">{new Date(r.matchPlayedAt).toLocaleDateString()}</td>
                  </tr>
                );})}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
