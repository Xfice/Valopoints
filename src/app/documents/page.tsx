import { getSession } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import { DocumentsList } from '@/components/documents/DocumentsList';

export const dynamic = 'force-dynamic';

export default async function DocumentsPage() {
  const session = await getSession();
  if (!session.userId) return null;

  const owned = await prisma.document.findMany({
    where: { ownerId: session.userId },
    orderBy: { updatedAt: 'desc' },
    select: {
      id: true,
      title: true,
      updatedAt: true,
      owner: { select: { username: true } },
    },
  });

  const shared = await prisma.document.findMany({
    where: {
      shares: { some: { userId: session.userId } },
      NOT: { ownerId: session.userId },
    },
    orderBy: { updatedAt: 'desc' },
    select: {
      id: true,
      title: true,
      updatedAt: true,
      owner: { select: { username: true } },
    },
  });

  return (
    <div>
      <h1 className="text-2xl font-bold mb-2">Your workspace</h1>
      <p className="text-slate-400 text-sm mb-6">
        Create, edit, import, and share lightweight documents.
      </p>
      <DocumentsList
        owned={owned.map((d) => ({ ...d, updatedAt: d.updatedAt.toISOString() }))}
        shared={shared.map((d) => ({ ...d, updatedAt: d.updatedAt.toISOString() }))}
      />
    </div>
  );
}
