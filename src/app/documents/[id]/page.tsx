import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getSession } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import { getDocumentAccess } from '@/lib/documents';
import { DocumentEditor } from '@/components/documents/DocumentEditor';

export const dynamic = 'force-dynamic';

type Props = { params: { id: string } };

export default async function DocumentPage({ params }: Props) {
  const session = await getSession();
  if (!session.userId) return null;

  const access = await getDocumentAccess(params.id, session.userId);
  if (access === 'none') notFound();

  const doc = await prisma.document.findUnique({ where: { id: params.id } });
  if (!doc) notFound();

  return (
    <div>
      <Link href="/documents" className="text-sm text-indigo-400 hover:underline mb-4 inline-block">
        ← Back to documents
      </Link>
      <DocumentEditor
        documentId={doc.id}
        initialTitle={doc.title}
        initialContent={doc.content}
        access={access}
        canShare={access === 'owner'}
      />
    </div>
  );
}
