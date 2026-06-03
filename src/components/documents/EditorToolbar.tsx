'use client';

import type { Editor } from '@tiptap/react';

type Props = {
  editor: Editor | null;
};

function ToolButton({
  onClick,
  active,
  label,
  title,
}: {
  onClick: () => void;
  active?: boolean;
  label: string;
  title: string;
}) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className={`px-2 py-1 rounded text-sm border ${
        active
          ? 'bg-indigo-600 border-indigo-500 text-white'
          : 'bg-slate-800 border-slate-600 text-slate-200 hover:bg-slate-700'
      }`}
    >
      {label}
    </button>
  );
}

export function EditorToolbar({ editor }: Props) {
  if (!editor) return null;

  return (
    <div className="flex flex-wrap gap-1 p-2 border-b border-slate-600 bg-slate-900/80">
      <ToolButton
        title="Bold"
        label="B"
        active={editor.isActive('bold')}
        onClick={() => editor.chain().focus().toggleBold().run()}
      />
      <ToolButton
        title="Italic"
        label="I"
        active={editor.isActive('italic')}
        onClick={() => editor.chain().focus().toggleItalic().run()}
      />
      <ToolButton
        title="Underline"
        label="U"
        active={editor.isActive('underline')}
        onClick={() => editor.chain().focus().toggleUnderline().run()}
      />
      <span className="w-px h-6 bg-slate-600 mx-1 self-center" />
      <ToolButton
        title="Heading 1"
        label="H1"
        active={editor.isActive('heading', { level: 1 })}
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
      />
      <ToolButton
        title="Heading 2"
        label="H2"
        active={editor.isActive('heading', { level: 2 })}
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
      />
      <ToolButton
        title="Paragraph"
        label="P"
        active={editor.isActive('paragraph')}
        onClick={() => editor.chain().focus().setParagraph().run()}
      />
      <span className="w-px h-6 bg-slate-600 mx-1 self-center" />
      <ToolButton
        title="Bullet list"
        label="• List"
        active={editor.isActive('bulletList')}
        onClick={() => editor.chain().focus().toggleBulletList().run()}
      />
      <ToolButton
        title="Numbered list"
        label="1. List"
        active={editor.isActive('orderedList')}
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
      />
    </div>
  );
}
