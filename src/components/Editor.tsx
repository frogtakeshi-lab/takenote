import { useEffect, useCallback, useRef } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import Placeholder from '@tiptap/extension-placeholder';
import Highlight from '@tiptap/extension-highlight';
import Typography from '@tiptap/extension-typography';
import { useNoteStore } from '../store/useNoteStore';
import { Toolbar } from './Toolbar';
import { TagPicker } from './TagPicker';

export function Editor() {
  const { notes, activeNoteId, updateNote } = useNoteStore(s => ({
    notes: s.notes,
    activeNoteId: s.activeNoteId,
    updateNote: s.updateNote,
  }));

  const activeNote = notes.find(n => n.id === activeNoteId) ?? null;
  const titleRef = useRef<HTMLTextAreaElement>(null);
  const saveTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const editor = useEditor({
    extensions: [
      StarterKit,
      TaskList,
      TaskItem.configure({ nested: true }),
      Highlight,
      Typography,
      Placeholder.configure({
        placeholder: 'ここに書き始めましょう...\n/ でコマンド、** で太字',
      }),
    ],
    content: '',
    editorProps: {
      attributes: {
        class: 'prose-editor focus:outline-none',
      },
    },
    onUpdate: ({ editor }) => {
      if (!activeNote) return;
      const json = JSON.stringify(editor.getJSON());
      if (saveTimeout.current) clearTimeout(saveTimeout.current);
      saveTimeout.current = setTimeout(() => {
        updateNote(activeNote.id, { content: json });
      }, 300);
    },
  });

  // Load note content when switching notes
  const prevNoteId = useRef<string | null>(null);
  useEffect(() => {
    if (!editor || !activeNote) return;
    if (prevNoteId.current === activeNote.id) return;
    prevNoteId.current = activeNote.id;

    if (activeNote.content) {
      try {
        editor.commands.setContent(JSON.parse(activeNote.content), { emitUpdate: false });
      } catch {
        editor.commands.setContent(activeNote.content, { emitUpdate: false });
      }
    } else {
      editor.commands.clearContent(false);
    }
  }, [editor, activeNote]);

  const handleTitleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      if (!activeNote) return;
      updateNote(activeNote.id, { title: e.target.value });
      // Auto-resize
      e.target.style.height = 'auto';
      e.target.style.height = e.target.scrollHeight + 'px';
    },
    [activeNote, updateNote]
  );

  if (!activeNote) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-white dark:bg-gray-900 text-gray-400 dark:text-gray-600">
        <div className="text-5xl mb-4">📝</div>
        <p className="text-lg font-medium text-gray-500 dark:text-gray-500">ノートを選択または作成</p>
        <p className="text-sm mt-1">サイドバーから + ボタンで新規作成</p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-white dark:bg-gray-900 overflow-hidden">
      {editor && <Toolbar editor={editor} />}

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-8 py-6">
          {/* Title */}
          <textarea
            ref={titleRef}
            value={activeNote.title}
            onChange={handleTitleChange}
            placeholder="タイトル"
            rows={1}
            className="w-full text-3xl font-bold text-gray-900 dark:text-gray-100 placeholder-gray-300 dark:placeholder-gray-700 bg-transparent border-none resize-none focus:outline-none mb-1 leading-tight overflow-hidden"
            style={{ height: 'auto' }}
            onInput={e => {
              const el = e.currentTarget;
              el.style.height = 'auto';
              el.style.height = el.scrollHeight + 'px';
            }}
          />

          {/* Tags */}
          <div className="mb-5">
            <TagPicker note={activeNote} />
          </div>

          {/* Meta */}
          <div className="mb-4 text-xs text-gray-400 dark:text-gray-600">
            {new Date(activeNote.updatedAt).toLocaleString('ja-JP', {
              year: 'numeric', month: 'short', day: 'numeric',
              hour: '2-digit', minute: '2-digit',
            })} に更新
          </div>

          {/* Editor */}
          <EditorContent
            editor={editor}
            className="min-h-96 text-gray-800 dark:text-gray-200 text-base leading-relaxed [&_.ProseMirror]:min-h-96"
          />
        </div>
      </div>
    </div>
  );
}
