import Link from 'next/link';
import { getAllRanks } from '@/services/pointsCalculator';
import { getSession } from '@/lib/session';
import { MainNav } from '@/components/MainNav';

export const dynamic = 'force-dynamic';

export default async function PrizesPage() {
  const session = await getSession();
  const ranks = getAllRanks();
  const kyuRanks = ranks.slice(0, 5);
  const danRanks = ranks.slice(5);

  return (
    <div className="min-h-screen">
      <MainNav active="prizes" auth="login-or-logout" isLoggedIn={session.isLoggedIn} />

      <main className="max-w-4xl mx-auto p-6">
        <h1 className="text-2xl font-bold mb-4">Prizes & Ranks</h1>
        <p className="text-gray-400 mb-6">Computer rental prizes based on your RankUp ValoPoints rank.</p>

        <div className="bg-valo-panel border border-gray-600 rounded-lg overflow-hidden mb-6">
          <div className="px-4 py-2" style={{ background: 'linear-gradient(90deg, var(--valo-red) 0%, #cc3643 100%)' }}>
            <h2 className="font-semibold">Kyu Ranks (Colored Belts)</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-600 bg-black/40">
                  <th className="text-left p-3 text-valo-red">Rank</th>
                  <th className="text-left p-3 text-valo-red">Point Range</th>
                  <th className="text-right p-3 text-valo-red">Prize</th>
                </tr>
              </thead>
              <tbody>
                {kyuRanks.map((r) => (
                  <tr key={r.name} className="border-b border-gray-700 hover:bg-valo-red/10">
                    <td className="p-3">
                      <span className="flex items-center gap-2">
                        <span className="belt-img-wrap inline-flex items-center">
                          <img src={r.imagePath} alt={r.name} className="belt-thumb" />
                        </span>
                        <span className="font-medium">{r.name}</span>
                      </span>
                    </td>
                    <td className="p-3">{r.pointRange} pts</td>
                    <td className="p-3 text-right">{r.hourlyRate > 0 ? `${r.hourlyRate} pesos/hr` : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-valo-panel border border-gray-600 rounded-lg overflow-hidden mb-6">
          <div className="px-4 py-2" style={{ background: 'linear-gradient(90deg, var(--valo-red) 0%, #cc3643 100%)' }}>
            <h2 className="font-semibold">Dan Ranks (Black Belts)</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-600 bg-black/40">
                  <th className="text-left p-3 text-valo-red">Rank</th>
                  <th className="text-left p-3 text-valo-red">Point Range</th>
                  <th className="text-right p-3 text-valo-red">Prize</th>
                </tr>
              </thead>
              <tbody>
                {danRanks.map((r) => (
                  <tr key={r.name} className="border-b border-gray-700 hover:bg-valo-red/10">
                    <td className="p-3">
                      <span className="flex items-center gap-2">
                        <span className="belt-img-wrap inline-flex items-center">
                          <img src={r.imagePath} alt={r.name} className="belt-thumb belt-thumb-black" />
                        </span>
                        <span className="font-medium">{r.name}</span>
                      </span>
                    </td>
                    <td className="p-3">{r.pointRange} pts</td>
                    <td className="p-3 text-right">{r.hourlyRate > 0 ? `${r.hourlyRate} pesos/hr` : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="text-center">
          <Link href="/dashboard" className="inline-block px-6 py-2 bg-valo-red hover:bg-red-600 rounded font-medium">
            Back to Dashboard
          </Link>
        </div>
      </main>
    </div>
  );
}
