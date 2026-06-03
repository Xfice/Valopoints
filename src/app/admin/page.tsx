import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getSession } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import { applyMonthlyDeduction, getRank } from '@/services/pointsCalculator';
import { AdminPlayersTable } from './AdminPlayersTable';
import { LogoutButton } from '@/components/LogoutButton';

export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  const session = await getSession();
  if (!session.isLoggedIn) redirect('/login');
  if (!session.isAdmin) redirect('/dashboard');

  const profiles = await prisma.userProfile.findMany({
    include: { user: { select: { id: true, username: true, email: true } } },
  });
  const allRecords = await prisma.matchRecord.findMany();

  const entries: {
    userId: string;
    displayName: string;
    username: string;
    email: string | null;
    points: number;
    rankName: string;
    rankImagePath: string | undefined;
    rankColor: string | undefined;
  }[] = [];

  for (const p of profiles) {
    const recs = allRecords.filter(
      (r) => r.userId === p.userId && r.puuid === p.puuid && r.matchPlayedAt >= p.linkedAt
    );
    const pts = applyMonthlyDeduction(recs.map((r) => ({ pointsEarned: r.pointsEarned, matchPlayedAt: r.matchPlayedAt })));
    const rank = getRank(pts);
    entries.push({
      userId: p.userId,
      displayName: `${p.riotName}#${p.riotTag}`,
      username: p.user.username,
      email: p.user.email,
      points: pts,
      rankName: rank.name,
      rankImagePath: rank.imagePath,
      rankColor: rank.color,
    });
  }

  const leaderboard = [...entries].sort((a, b) => b.points - a.points).slice(0, 20);
  const allPlayers = [...entries].sort((a, b) => a.displayName.localeCompare(b.displayName));

  return (
    <div className="min-h-screen">
      <nav className="border-b-2 border-valo-red py-3 px-4" style={{ background: 'linear-gradient(180deg, var(--valo-dark) 0%, var(--valo-black) 100%)' }}>
        <div className="flex justify-between items-center max-w-6xl mx-auto">
          <Link href="/" className="font-bold text-valo-red">RankUp ValoPoints</Link>
          <div className="flex gap-4">
            <span className="text-gray-500">Admin</span>
            <Link href="/dashboard" className="text-gray-300 hover:text-white">Dashboard</Link>
            <Link href="/prizes" className="text-gray-300 hover:text-white">Prizes</Link>
            <LogoutButton />
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto p-6">
        <h1 className="text-2xl font-bold mb-6">Admin – Players</h1>
        <AdminPlayersTable leaderboard={leaderboard} allPlayers={allPlayers} />
      </main>
    </div>
  );
}
