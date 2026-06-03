import Link from 'next/link';
import { LogoutButton } from '@/components/LogoutButton';

type Props = {
  /** Extra label/links before standard items (e.g. Admin) */
  prefix?: React.ReactNode;
  showLeaderboard?: boolean;
  auth?: 'logout' | 'login-or-logout';
  isLoggedIn?: boolean;
};

export function RankUpNav({
  prefix,
  showLeaderboard = true,
  auth = 'logout',
  isLoggedIn = true,
}: Props) {
  return (
    <nav
      className="border-b-2 border-valo-red py-3 px-4"
      style={{ background: 'linear-gradient(180deg, var(--valo-dark) 0%, var(--valo-black) 100%)' }}
    >
      <div className="flex justify-between items-center max-w-6xl mx-auto">
        <Link href="/" className="font-bold text-valo-red">
          RankUp ValoPoints
        </Link>
        <div className="flex flex-wrap gap-4 items-center">
          {prefix}
          <Link href="/dashboard" className="text-gray-300 hover:text-white">
            Dashboard
          </Link>
          {showLeaderboard && (
            <Link href="/leaderboard" className="text-gray-300 hover:text-white">
              Leaderboard
            </Link>
          )}
          <Link href="/prizes" className="text-gray-300 hover:text-white">
            Prizes
          </Link>
          <Link href="/documents" className="text-gray-300 hover:text-white">
            Documents
          </Link>
          {auth === 'logout' ? (
            <LogoutButton />
          ) : isLoggedIn ? (
            <LogoutButton />
          ) : (
            <Link href="/login" className="text-gray-400 hover:text-white">
              Login
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
