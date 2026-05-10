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
          onClick={() => setOpen(!open)}
          className="text-xs text-gray-400 dark:text-gray-600 hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors px-1.5 py-0.5 rounded-md hover:bg-indigo-50 dark:hover:bg-indigo-950/30 border border-dashed border-gray-300 dark:border-gray-700 hover:border-indigo-400"
        >
          + タグ
        </button>
      </div>

      {open && (
        <div className="absolute top-full left-0 mt-1 w-56 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50 py-1.5">
          <div className="px-2 pb-1.5">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') handleCreateTag();
                if (e.key === 'Escape') setOpen(false);
              }}
              placeholder="タグ名を入力..."
              className="w-full px-2 py-1 text-sm bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded text-gray-800 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-indigo-400"
            />
          </div>

          {input && !tags.find(t => t.name.toLowerCase() === input.toLowerCase()) && (
            <button
              onClick={handleCreateTag}
              className="w-full text-left px-3 py-1.5 text-sm text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 transition-colors"
            >
              「{input}」を作成
            </button>
          )}

          {filtered.length > 0 && (
            <div className="border-t border-gray-100 dark:border-gray-700 mt-1 pt-1">
              {filtered.map(tag => (
                <div
                  key={tag.id}
                  className="flex items-center justify-between px-3 py-1 hover:bg-gray-50 dark:hover:bg-gray-700/50 group/tag"
                >
                  <button
                    onClick={() => { addTag(tag.id); setInput(''); }}
                    className="flex-1 text-left"
                  >
                    <TagBadge tag={tag} small />
                  </button>
                  <button
                    onClick={() => deleteTag(tag.id)}
                    title="タグを削除"
                    className="opacity-0 group-hover/tag:opacity-100 text-xs text-gray-400 hover:text-red-500 transition-all ml-1"
                  >
                    🗑
                  </button>
                </div>
              ))}
            </div>
          )}

          {filtered.length === 0 && !input && availableTags.length === 0 && (
            <p className="px-3 py-2 text-xs text-gray-400 dark:text-gray-600">
              タグを入力して作成
            </p>
          )}
        </div>
      )}
    </div>
  );
}
