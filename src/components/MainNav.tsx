import Link from 'next/link';
import { LogoutButton } from '@/components/LogoutButton';

type Props = {
  username?: string;
  /** Highlight current section */
  active?: 'documents' | 'dashboard' | 'leaderboard' | 'prizes';
  /** Optional label before nav links (e.g. Admin) */
  prefix?: React.ReactNode;
  auth?: 'logout' | 'login-or-logout';
  isLoggedIn?: boolean;
};

const linkClass = (isActive: boolean) =>
  isActive
    ? 'text-white font-medium'
    : 'text-gray-300 hover:text-white';

export function MainNav({
  username,
  active,
  prefix,
  auth = 'logout',
  isLoggedIn = true,
}: Props) {
  return (
    <nav
      className="border-b-2 border-valo-red py-3 px-4"
      style={{ background: 'linear-gradient(180deg, var(--valo-dark) 0%, var(--valo-black) 100%)' }}
    >
      <div className="flex flex-wrap justify-between items-center gap-3 max-w-6xl mx-auto">
        <div className="flex flex-wrap items-center gap-4 sm:gap-6">
          <Link href="/dashboard" className="font-bold text-valo-red whitespace-nowrap">
            RankUp ValoPoints
          </Link>
          <Link
            href="/documents"
            className={`text-sm whitespace-nowrap ${active === 'documents' ? 'text-indigo-300 font-medium' : 'text-indigo-400/90 hover:text-indigo-300'}`}
          >
            Ajaia Docs
          </Link>
        </div>
        <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-sm">
          {prefix}
          <Link href="/documents" className={linkClass(active === 'documents')}>
            Documents
          </Link>
          <Link href="/dashboard" className={linkClass(active === 'dashboard')}>
            Dashboard
          </Link>
          <Link href="/leaderboard" className={linkClass(active === 'leaderboard')}>
            Leaderboard
          </Link>
          <Link href="/prizes" className={linkClass(active === 'prizes')}>
            Prizes
          </Link>
          {username && <span className="text-gray-400 hidden sm:inline">{username}</span>}
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
