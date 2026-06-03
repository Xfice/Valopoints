import type { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';

function usernameFromEmail(email: string): string {
  const base = email.split('@')[0].replace(/[^a-zA-Z0-9]/g, '_').slice(0, 20) || 'user';
  return base;
}

function uniqueUsername(base: string): Promise<string> {
  return prisma.user.findUnique({ where: { username: base } }).then((existing) => {
    if (!existing) return base;
    let n = 1;
    const tryNext = (): Promise<string> =>
      prisma.user.findUnique({ where: { username: `${base}${n}` } }).then((e) => {
        if (!e) return `${base}${n}`;
        n++;
        return tryNext();
      });
    return tryNext();
  });
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'email',
      credentials: { email: { label: 'Email', type: 'email' }, password: { label: 'Password', type: 'password' } },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        const email = String(credentials.email).trim().toLowerCase();
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user || !user.passwordHash || !bcrypt.compareSync(credentials.password, user.passwordHash)) {
          return null;
        }
        return { id: user.id, email: user.email!, name: user.username };
      },
    }),
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? [
          GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          }),
        ]
      : []),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === 'google' && user?.email) {
        const email = user.email.toLowerCase();
        const existing = await prisma.user.findUnique({ where: { email } });
        if (!existing) {
          const username = await uniqueUsername(usernameFromEmail(email));
          await prisma.user.create({
            data: {
              username,
              email,
              passwordHash: null,
            },
          });
        }
      }
      return true;
    },
    async jwt({ token, user, account }) {
      if (account?.provider === 'google' && user?.email) {
        const email = user.email.toLowerCase();
        let dbUser = await prisma.user.findUnique({ where: { email } });
        if (!dbUser) {
          const username = await uniqueUsername(usernameFromEmail(email));
          dbUser = await prisma.user.create({
            data: { username, email, passwordHash: null },
          });
        }
        if (dbUser) token.userId = dbUser.id;
      } else if (user?.id) {
        token.userId = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as { id?: string }).id = token.userId as string;
      }
      return session;
    },
  },
  pages: { signIn: '/login' },
  session: { strategy: 'jwt', maxAge: 60 * 60 * 24 * 7 },
  secret: process.env.NEXTAUTH_SECRET || process.env.SESSION_SECRET,
};
