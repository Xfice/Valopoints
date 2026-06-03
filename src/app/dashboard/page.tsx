import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';
import Link from 'next/link';
import { getSession } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import { getMmr } from '@/services/valorantApi';
import { applyMonthlyDeduction, getRank } from '@/services/pointsCalculator';
import { DashboardClient } from './DashboardClient';
import { LogoutButton } from '@/components/LogoutButton';

export default async function DashboardPage() {
  const session = await getSession();

  const profile = await prisma.userProfile.findUnique({
    where: { userId: session.userId! },
  });

  let records: { id: string; agent: string | null; won: boolean; kills: number; deaths: number; assists: number; wasMvp: boolean; wasTeamMvp: boolean; aces: number; pointsEarned: number; matchPlayedAt: Date }[] = [];
  let totalPoints = 0;
  let rank = null;
  let valorantRank: string | null = null;
  let valorantRankImagePath: string | null = null;

  if (profile) {
    records = await prisma.matchRecord.findMany({
      where: { userId: session.userId!, puuid: profile.puuid, matchPlayedAt: { gte: profile.linkedAt } },
      orderBy: { matchPlayedAt: 'desc' },
      take: 50,
    });

    const forCalc = records.map((r) => ({ pointsEarned: r.pointsEarned, matchPlayedAt: r.matchPlayedAt }));
    totalPoints = applyMonthlyDeduction(forCalc);
    rank = getRank(totalPoints);
    const mmr = await getMmr(profile.riotName, profile.riotTag, profile.region, 'pc', profile.puuid);
    if (mmr.success && mmr.rank) {
      valorantRank = mmr.rank;
      valorantRankImagePath = `/images/ranks/${mmr.rank.toLowerCase().replace(/\s/g, '')}.png`;
    } else {
      valorantRank = 'Unranked';
      valorantRankImagePath = '/images/ranks/unranked.png';
    }
  }

  return (
    <div className="min-h-screen">
      <nav className="border-b-2 border-valo-red py-3 px-4" style={{ background: 'linear-gradient(180deg, var(--valo-dark) 0%, var(--valo-black) 100%)' }}>
        <div className="flex justify-between items-center max-w-6xl mx-auto">
          <Link href="/" className="font-bold text-valo-red">RankUp ValoPoints</Link>
          <div className="flex gap-4">
            <Link href="/dashboard" className="text-gray-300 hover:text-white">Dashboard</Link>
            <Link href="/leaderboard" className="text-gray-300 hover:text-white">Leaderboard</Link>
            <Link href="/prizes" className="text-gray-300 hover:text-white">Prizes</Link>
            <LogoutButton />
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto p-6">
        <h1 className="text-2xl font-bold mb-1">Dashboard</h1>
        <p className="text-gray-500 text-sm mb-6">
          Track your ranked progress.{' '}
          <span className="point-legend">
            <span className="badge-win">Win +3</span>
            <span className="separator">·</span>
            <span className="badge-loss">Loss -1.5</span>
            <span className="separator">·</span>
            <span className="badge-mvp">MVP +1</span>
            <span className="separator">·</span>
            <span className="badge-team-mvp">Team MVP +0.5</span>
            <span className="separator">·</span>
            <span className="badge-ace">Ace +0.5</span>
          </span>
        </p>

        {!profile ? (
          <div className="bg-valo-panel border border-yellow-600 rounded-lg p-6">
            <h2 className="text-lg font-semibold mb-2">Link Your Riot Account</h2>
            <p className="text-gray-400 mb-4">Connect your Valorant Riot ID to start tracking ranked matches.</p>
            <a href="/dashboard/link" className="inline-block px-4 py-2 bg-valo-red hover:bg-red-600 rounded font-medium">
              Link Riot Account
            </a>
          </div>
        ) : (
          <DashboardClient
            profile={profile}
            records={records}
            totalPoints={totalPoints}
            rank={rank}
            valorantRank={valorantRank}
            valorantRankImagePath={valorantRankImagePath}
          />
        )}
      </main>
    </div>
  );
}
