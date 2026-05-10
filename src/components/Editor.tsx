import { useEffect, useCallback, useRef, useState, useMemo } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import Placeholder from '@tiptap/extension-placeholder';
import Highlight from '@tiptap/extension-highlight';
import Typography from '@tiptap/extension-typography';
import { useShallow } from 'zustand/shallow';
import { useNoteStore } from '../store/useNoteStore';
import { useVisualViewport } from '../hooks/useVisualViewport';
import { useMediaQuery } from '../hooks/useMediaQuery';
import { Toolbar } from './Toolbar';
import { TagPicker } from './TagPicker';
import { downloadMarkdown } from '../utils/exportMarkdown';

type SaveStatus = 'saved' | 'saving';

export function Editor() {
  const { notes, activeNoteId, updateNote, togglePin } = useNoteStore(useShallow(s => ({
    notes: s.notes,
    activeNoteId: s.activeNoteId,
    updateNote: s.updateNote,
    togglePin: s.togglePin,
  })));

  const activeNote = notes.find(n => n.id === activeNoteId) ?? null;
  const titleRef = useRef<HTMLTextAreaElement>(null);
  const saveTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('saved');
  const [isFocused, setIsFocused] = useState(false);
  const isMobile = useMediaQuery('(max-width: 640px)');
  const keyboardInset = useVisualViewport();

  const extensions = useMemo(() => [
    StarterKit,
    TaskList,
    TaskItem.configure({ nested: true }),
    Highlight,
    Typography,
    Placeholder.configure({
      placeholder: 'ここに書き始めましょう... (Markdown 記法対応)',
    }),
  ], []);

  const editor = useEditor({
    extensions,
    content: '',
    editorProps: {
      attributes: { class: 'prose-editor focus:outline-none' },
    },
    onFocus: () => setIsFocused(true),
    onBlur: () => setIsFocused(false),
    onUpdate: ({ editor }) => {
      if (!activeNote) return;
      setSaveStatus('saving');
      if (saveTimeout.current) clearTimeout(saveTimeout.current);
      saveTimeout.current = setTimeout(() => {
        const json = JSON.stringify(editor.getJSON());
        updateNote(activeNote.id, { content: json });
        setSaveStatus('saved');
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
    setSaveStatus('saved');
  }, [editor, activeNote]);

  const handleTitleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      if (!activeNote) return;
      updateNote(activeNote.id, { title: e.target.value });
      e.target.style.height = 'auto';
      e.target.style.height = e.target.scrollHeight + 'px';
    },
    [activeNote, updateNote]
  );

  const handleDone = useCallback(() => {
    editor?.commands.blur();
    titleRef.current?.blur();
    setIsFocused(false);
  }, [editor]);

  const isAnyFocused = isFocused || (typeof document !== 'undefined' && document.activeElement === titleRef.current);

  if (!activeNote) {
    return (
      <div className="h-full flex flex-col items-center justify-center bg-paper-100 dark:bg-paper-800 text-paper-500 dark:text-paper-400 select-none px-4">
        <div className="text-5xl mb-4" aria-hidden="true">📝</div>
        <p className="text-lg font-medium text-paper-600 dark:text-paper-300 text-center">ノートを選択または作成</p>
        <p className="text-sm mt-2 text-paper-500 dark:text-paper-400 text-center">
          <span className="hidden sm:inline">
            左のリストまたは
            <kbd className="mx-1 px-1.5 py-0.5 text-xs bg-paper-200 dark:bg-paper-700 rounded border border-paper-300 dark:border-paper-600 font-mono">⌘N</kbd>
            で新規作成
          </span>
          <span className="sm:hidden">右下の ＋ ボタンから新規作成</span>
        </p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-paper-100 dark:bg-paper-800 overflow-hidden relative">
      {/* デスクトップは上部、モバイルはキーボード追従の下部固定で表示するため
          Toolbar 自体は下部に出す */}
      {editor && !isMobile && (
        <Toolbar
          editor={editor}
          onExport={() => downloadMarkdown(activeNote.title, activeNote.content)}
        />
      )}

      {/* モバイル: フローティング「完了」 */}
      {isMobile && isAnyFocused && (
        <button
          type="button"
          onClick={handleDone}
          aria-label="入力を完了してキーボードを閉じる"
          className="fixed top-2 right-3 z-50 px-4 h-9 rounded-full bg-paper-700 text-paper-50 dark:bg-paper-200 dark:text-paper-700 text-sm font-medium shadow-paper-lg active:scale-95"
        >
          完了
        </button>
      )}

      {/* Editor area */}
      <div className="flex-1 overflow-y-auto overscroll-contain">
        <div
          className="max-w-3xl mx-auto px-4 sm:px-8 py-4 sm:py-6"
          style={{ paddingBottom: isMobile ? `calc(env(safe-area-inset-bottom) + ${keyboardInset + 80}px)` : undefined }}
        >
          {/* Title row */}
          <div className="flex items-start gap-2 mb-1">
            <textarea
              ref={titleRef}
              value={activeNote.title}
              onChange={handleTitleChange}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              placeholder="タイトル"
              rows={1}
              enterKeyHint="next"
              autoCapitalize="sentences"
              autoCorrect="on"
              spellCheck={true}
              aria-label="ノートタイトル"
              className="flex-1 text-2xl sm:text-3xl font-bold text-paper-700 dark:text-paper-100 placeholder-paper-400 dark:placeholder-paper-500 bg-transparent border-none resize-none focus:outline-none leading-tight overflow-hidden"
              style={{ height: 'auto' }}
              onInput={e => {
                const el = e.currentTarget;
                el.style.height = 'auto';
                el.style.height = el.scrollHeight + 'px';
              }}
            />
            {/* Pin button */}
            <button
              type="button"
              onClick={() => togglePin(activeNote.id)}
              title={activeNote.pinned ? 'ピン留めを解除 (⌘P)' : 'ピン留め (⌘P)'}
              aria-label={activeNote.pinned ? 'ピン留めを解除' : 'ピン留めする'}
              aria-pressed={activeNote.pinned ?? false}
              className={`mt-1 min-w-11 min-h-11 sm:min-w-10 sm:min-h-10 flex items-center justify-center rounded-xl transition-all shrink-0 text-lg active:scale-95
                ${activeNote.pinned
                  ? 'text-accent-600 bg-accent-100 dark:bg-accent-700/30 dark:text-accent-200 hover:bg-accent-200 dark:hover:bg-accent-700/40'
                  : 'text-paper-400 dark:text-paper-500 hover:text-paper-600 dark:hover:text-paper-200 hover:bg-paper-200 dark:hover:bg-paper-700/40'
                }`}
            >
              📌
            </button>
          </div>

          {/* Tags */}
          <div className="mb-4">
            <TagPicker note={activeNote} />
          </div>

          {/* Meta + Save status */}
          <div className="flex items-center justify-between mb-4">
            <p className="text-xs text-paper-500 dark:text-paper-400">
              {new Date(activeNote.updatedAt).toLocaleString('ja-JP', {
                year: 'numeric', month: 'short', day: 'numeric',
                hour: '2-digit', minute: '2-digit',
              })} に更新
            </p>
            <span
              role="status"
              aria-live="polite"
              aria-label={saveStatus === 'saving' ? '保存中' : '保存済み'}
              className={`flex items-center gap-1 text-xs transition-colors ${
                saveStatus === 'saving' ? 'text-warning' : 'text-paper-500 dark:text-paper-400'
              }`}
            >
              {saveStatus === 'saving' ? (
                <>
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="animate-spin" aria-hidden="true">
                    <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.5" strokeDasharray="20 10" strokeLinecap="round" />
                  </svg>
                  <span className="hidden sm:inline">保存中…</span>
                </>
              ) : (
                <>
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                    <path d="M3 7.5l3 3 5-6" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <span className="hidden sm:inline">保存済み</span>
                </>
              )}
            </span>
          </div>

          {/* Editor content */}
          <EditorContent
            editor={editor}
            className="min-h-96 text-paper-700 dark:text-paper-100 text-base leading-relaxed [&_.ProseMirror]:min-h-96"
          />
        </div>
      </div>

      {/* モバイル: ボトム固定ツールバー (キーボード追従) */}
      {editor && isMobile && (
        <div
          className="fixed inset-x-0 z-30"
          style={{ bottom: keyboardInset }}
        >
          <Toolbar
            editor={editor}
            onExport={() => downloadMarkdown(activeNote.title, activeNote.content)}
          />
        </div>
      )}
    </div>
  );
}
