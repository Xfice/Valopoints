import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';
import { getSession } from '@/lib/session';

export default async function HomePage() {
  const session = await getSession();
  if (session.isLoggedIn) redirect('/documents');
  redirect('/login');
}
