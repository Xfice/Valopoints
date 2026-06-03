import { redirect } from 'next/navigation';
import { getSession } from '@/lib/session';
import { DocsNav } from '@/components/documents/DocsNav';

export default async function DocumentsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session.isLoggedIn) redirect('/login');

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <DocsNav username={session.username} />
      <main className="max-w-5xl mx-auto px-4 py-8">{children}</main>
    </div>
  );
}
