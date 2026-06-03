import { prisma } from '@/lib/prisma';

export type DocumentAccess = 'owner' | 'shared' | 'none';

export async function getDocumentAccess(
  documentId: string,
  userId: string
): Promise<DocumentAccess> {
  const doc = await prisma.document.findUnique({
    where: { id: documentId },
    select: { ownerId: true, shares: { where: { userId }, select: { id: true } } },
  });
  if (!doc) return 'none';
  if (doc.ownerId === userId) return 'owner';
  if (doc.shares.length > 0) return 'shared';
  return 'none';
}

export async function canEditDocument(documentId: string, userId: string): Promise<boolean> {
  const access = await getDocumentAccess(documentId, userId);
  return access === 'owner' || access === 'shared';
}

export function emptyEditorContent(): string {
  return JSON.stringify({
    type: 'doc',
    content: [{ type: 'paragraph' }],
  });
}

export function textToEditorContent(text: string): string {
  const paragraphs = text.split(/\r?\n/).map((line) => ({
    type: 'paragraph',
    content: line ? [{ type: 'text', text: line }] : undefined,
  }));
  return JSON.stringify({
    type: 'doc',
    content: paragraphs.length ? paragraphs : [{ type: 'paragraph' }],
  });
}
