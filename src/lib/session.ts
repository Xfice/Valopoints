import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export interface SessionData {
  userId?: string;
  username?: string;
  isLoggedIn: boolean;
  isAdmin?: boolean;
}

export async function getSession(): Promise<SessionData> {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return { isLoggedIn: false };
  }
  const user = session.user as { id?: string; name?: string };
  if (!user.id) {
    return { isLoggedIn: false };
  }
  const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
  if (!dbUser) {
    return { isLoggedIn: false };
  }
  const adminEmail = (process.env.ADMIN_EMAIL || '').toLowerCase();
  const isAdmin =
    (dbUser.email && dbUser.email.toLowerCase() === adminEmail) ||
    dbUser.username === 'admin';
  return {
    userId: user.id,
    username: user.name ?? undefined,
    isLoggedIn: true,
    isAdmin,
  };
}
