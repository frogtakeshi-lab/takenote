import { useState, useRef, useEffect } from 'react';
import { useShallow } from 'zustand/shallow';
import { useNoteStore } from '../store/useNoteStore';
import { TagBadge } from './TagBadge';
import type { Note } from '../types';

interface Props {
  note: Note;
}

export function TagPicker({ note }: Props) {
  const { tags, createTag, updateNote, deleteTag } = useNoteStore(useShallow(s => ({
    tags: s.tags,
    createTag: s.createTag,
    updateNote: s.updateNote,
    deleteTag: s.deleteTag,
  })));

  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const noteTags = tags.filter(t => note.tagIds.includes(t.id));
  const availableTags = tags.filter(t => !note.tagIds.includes(t.id));

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (!containerRef.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  function addTag(tagId: string) {
    updateNote(note.id, { tagIds: [...note.tagIds, tagId] });
  }

  function removeTag(tagId: string) {
    updateNote(note.id, { tagIds: note.tagIds.filter(id => id !== tagId) });
  }

  function handleCreateTag() {
    const name = input.trim();
    if (!name) return;
    const tag = createTag(name);
    addTag(tag.id);
    setInput('');
  }

  const filtered = availableTags.filter(t =>
    t.name.toLowerCase().includes(input.toLowerCase())
  );

  return (
    <div ref={containerRef} className="relative">
      <div className="flex flex-wrap items-center gap-1.5">
        {noteTags.map(tag => (
          <TagBadge key={tag.id} tag={tag} onRemove={() => removeTag(tag.id)} />
        ))}
        <button
          type="button"
          onClick={() => setOpen(!open)}
          aria-expanded={open}
          aria-haspopup="true"
          aria-label="タグを追加"
          className="text-sm text-paper-500 dark:text-paper-400 hover:text-accent-600 dark:hover:text-accent-200 transition-colors px-3 py-1 min-h-9 rounded-full hover:bg-accent-50 dark:hover:bg-accent-700/20 border border-dashed border-paper-300 dark:border-paper-600 hover:border-accent-400 active:scale-95"
        >
          + タグ
        </button>
      </div>

      {open && (
        <div
          role="dialog"
          aria-label="タグを選択または作成"
          className="absolute top-full left-0 mt-1 w-64 max-w-[calc(100vw-2rem)] bg-paper-50 dark:bg-paper-900 border border-paper-300/60 dark:border-paper-700/60 rounded-xl shadow-paper-lg z-50 py-2"
        >
          <div className="px-2 pb-2">
            <input
              ref={inputRef}
              type="text"
              inputMode="text"
              enterKeyHint="done"
              autoCapitalize="off"
              autoCorrect="off"
              autoComplete="off"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') handleCreateTag();
                if (e.key === 'Escape') setOpen(false);
              }}
              placeholder="タグ名を入力..."
              aria-label="タグ名"
              className="w-full px-3 h-10 text-sm bg-paper-100 dark:bg-paper-800 border border-paper-300/60 dark:border-paper-700/60 rounded-lg text-paper-700 dark:text-paper-100 placeholder-paper-400 dark:placeholder-paper-500 focus:outline-none focus:ring-2 focus:ring-accent-400"
            />
          </div>

          {input && !tags.find(t => t.name.toLowerCase() === input.toLowerCase()) && (
            <button
              type="button"
              onClick={handleCreateTag}
              className="w-full text-left px-3 py-2 min-h-11 text-sm text-accent-700 dark:text-accent-200 hover:bg-accent-50 dark:hover:bg-accent-700/20 transition-colors"
            >
              「{input}」を作成
            </button>
          )}

          {filtered.length > 0 && (
            <div className="border-t border-paper-200 dark:border-paper-700 mt-1 pt-1">
              {filtered.map(tag => (
                <div
                  key={tag.id}
                  className="flex items-center justify-between px-2 py-1.5 hover:bg-paper-100 dark:hover:bg-paper-800/60 group/tag"
                >
                  <button
                    type="button"
                    onClick={() => { addTag(tag.id); setInput(''); }}
                    className="flex-1 text-left min-h-9 px-1 active:scale-95"
                    aria-label={`タグ「${tag.name}」を追加`}
                  >
                    <TagBadge tag={tag} small />
                  </button>
                  <button
                    type="button"
                    onClick={() => deleteTag(tag.id)}
                    title="タグを削除"
                    aria-label={`タグ「${tag.name}」を完全に削除`}
                    className="opacity-0 group-hover/tag:opacity-100 focus:opacity-100 w-9 h-9 flex items-center justify-center text-paper-500 hover:text-danger transition-all ml-1 rounded-md hover:bg-danger/10"
                  >
                    🗑
                  </button>
                </div>
              ))}
            </div>
          )}

          {filtered.length === 0 && !input && availableTags.length === 0 && (
            <p className="px-3 py-2 text-xs text-paper-500 dark:text-paper-400">
              タグを入力して作成
            </p>
          )}
        </div>
      )}
    </div>
  );
}
