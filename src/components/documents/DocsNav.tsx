import Link from 'next/link';
import { LogoutButton } from '@/components/LogoutButton';

type Props = {
  username?: string;
};

export function DocsNav({ username }: Props) {
  return (
    <nav className="border-b border-slate-700 py-3 px-4 bg-slate-950">
      <div className="flex justify-between items-center max-w-5xl mx-auto">
        <div className="flex items-center gap-6">
          <Link href="/documents" className="font-semibold text-indigo-400">
            Ajaia Docs
          </Link>
          <Link href="/documents" className="text-sm text-slate-300 hover:text-white">
            Documents
          </Link>
        </div>
        <div className="flex items-center gap-4 text-sm">
          {username && <span className="text-slate-400">{username}</span>}
          <LogoutButton />
        </div>
      </div>
    </nav>
  );
}
