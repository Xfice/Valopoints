import { redirect } from 'next/navigation';
import { getSession } from '@/lib/session';
import { MainNav } from '@/components/MainNav';

export default async function DocumentsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session.isLoggedIn) redirect('/login');

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <MainNav username={session.username} active="documents" />
      <main className="max-w-5xl mx-auto px-4 py-8">{children}</main>
    </div>
  );
}
