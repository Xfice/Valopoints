import Link from 'next/link';

export const dynamic = 'force-dynamic';
import { prisma } from '@/lib/prisma';
import { applyMonthlyDeduction, getRank } from '@/services/pointsCalculator';
import { getSession } from '@/lib/session';
import { RankUpNav } from '@/components/RankUpNav';

export default async function LeaderboardPage() {
  const session = await getSession();
  const profiles = await prisma.userProfile.findMany();
  const allRecords = await prisma.matchRecord.findMany();
  const entries = [];

  for (const p of profiles) {
    const recs = allRecords.filter(
      (r) => r.userId === p.userId && r.puuid === p.puuid && r.matchPlayedAt >= p.linkedAt
    );
    const pts = applyMonthlyDeduction(recs.map((r) => ({ pointsEarned: r.pointsEarned, matchPlayedAt: r.matchPlayedAt })));
    const rank = getRank(pts);
    entries.push({ displayName: `${p.riotName}#${p.riotTag}`, points: pts, rankName: rank.name, rankImagePath: rank.imagePath, rankColor: rank.color });
  }

  const leaderboard = entries
    .sort((a, b) => b.points - a.points)
    .slice(0, 20)
    .map((e, i) => ({ ...e, rank: i + 1 }));

  return (
    <div className="min-h-screen">
      <RankUpNav showLeaderboard={false} auth="login-or-logout" isLoggedIn={session.isLoggedIn} />

      <main className="max-w-4xl mx-auto p-6">
        <h1 className="text-2xl font-bold mb-6">Leaderboard</h1>
        <div className="bg-valo-panel border border-gray-600 rounded-lg overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-600">
                <th className="text-left p-3">#</th>
                <th className="text-left p-3">Player</th>
                <th className="text-left p-3">Points</th>
                <th className="text-left p-3">Rank</th>
              </tr>
            </thead>
            <tbody>
              {leaderboard.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-gray-500">
                    No players yet.
                  </td>
                </tr>
              ) : (
                leaderboard.map((e) => (
                  <tr key={e.rank} className="border-b border-gray-700 hover:bg-gray-800/50">
                    <td className="p-3">{e.rank}</td>
                    <td className="p-3 font-medium">{e.displayName}</td>
                    <td className="p-3">{e.points.toFixed(1)}</td>
                    <td className="p-3">
                      <span className="flex items-center gap-2">
                        {e.rankImagePath && (
                          <img src={e.rankImagePath} alt={e.rankName} className={e.rankColor === 'black' ? 'belt-thumb belt-thumb-black' : 'belt-thumb'} />
                        )}
                        <span className="text-gray-400">{e.rankName}</span>
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
