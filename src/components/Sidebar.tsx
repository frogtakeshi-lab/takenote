import { useState } from 'react';
import { useNoteStore } from '../store/useNoteStore';
import { NoteItem } from './NoteItem';
import { TagBadge } from './TagBadge';
import type { SortBy } from '../types';

const SORT_LABELS: Record<SortBy, string> = {
  updatedAt: '更新順',
  createdAt: '作成順',
  title: 'タイトル順',
};
const SORT_ORDER: SortBy[] = ['updatedAt', 'createdAt', 'title'];

interface Props {
  searchRef: React.RefObject<HTMLInputElement | null>;
}

export function Sidebar({ searchRef }: Props) {
  const {
    notes,
    tags,
    activeNoteId,
    searchQuery,
    filterTagIds,
    sortBy,
    theme,
    createNote,
    deleteNote,
    setSearchQuery,
    toggleFilterTag,
    clearFilterTags,
    setSortBy,
    setTheme,
    filteredNotes,
  } = useNoteStore(s => ({
    notes: s.notes,
    tags: s.tags,
    activeNoteId: s.activeNoteId,
    searchQuery: s.searchQuery,
    filterTagIds: s.filterTagIds,
    sortBy: s.sortBy,
    theme: s.theme,
    createNote: s.createNote,
    deleteNote: s.deleteNote,
    setSearchQuery: s.setSearchQuery,
    toggleFilterTag: s.toggleFilterTag,
    clearFilterTags: s.clearFilterTags,
    setSortBy: s.setSortBy,
    setTheme: s.setTheme,
    filteredNotes: s.filteredNotes,
  }));

  const visible = filteredNotes();
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const themeIcons: Record<string, string> = { light: '☀️', dark: '🌙', system: '🖥️' };
  const themeOrder: Array<'light' | 'dark' | 'system'> = ['light', 'dark', 'system'];
  const nextTheme = themeOrder[(themeOrder.indexOf(theme) + 1) % 3];
  const nextSort = SORT_ORDER[(SORT_ORDER.indexOf(sortBy) + 1) % SORT_ORDER.length];

  return (
    <aside className="w-64 h-full flex flex-col bg-gray-50 dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 shrink-0">
      {/* Header */}
      <div className="px-3 pt-3 pb-2 flex items-center justify-between">
        <span className="text-base font-bold text-gray-900 dark:text-gray-100 select-none">
          📝 TakeNote
        </span>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setTheme(nextTheme)}
            title={`テーマ: ${theme} → ${nextTheme}`}
            className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-sm"
          >
            {themeIcons[theme]}
          </button>
          <button
            onClick={createNote}
            title="新しいノート (⌘N)"
            className="w-7 h-7 flex items-center justify-center rounded-md bg-indigo-600 hover:bg-indigo-700 text-white transition-colors text-lg leading-none"
          >
            +
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="px-3 pb-2">
        <div className="relative">
          <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm select-none">🔍</span>
          <input
            ref={searchRef}
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="検索... (⌘K)"
            className="w-full pl-8 pr-3 py-1.5 text-sm rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-400 dark:focus:ring-indigo-600 transition"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              ×
            </button>
          )}
        </div>
      </div>

      {/* Tag filters */}
      {tags.length > 0 && (
        <div className="px-3 pb-2">
          <div className="flex flex-wrap gap-1">
            <button
              onClick={clearFilterTags}
              className={`text-xs px-2 py-0.5 rounded-full transition-colors
                ${filterTagIds.length === 0
                  ? 'bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 font-medium'
                  : 'text-gray-500 dark:text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-800'
                }`}
            >
              すべて
            </button>
            {tags.map(tag => (
              <TagBadge
                key={tag.id}
                tag={tag}
                active={filterTagIds.includes(tag.id)}
                onClick={() => toggleFilterTag(tag.id)}
                small
              />
            ))}
          </div>
          {filterTagIds.length > 1 && (
            <p className="text-xs text-gray-400 dark:text-gray-600 mt-1">
              {filterTagIds.length}個のタグで絞り込み中 (AND条件)
            </p>
          )}
        </div>
      )}

      {/* Sort + Note count row */}
      <div className="px-3 pb-1 flex items-center justify-between">
        <p className="text-xs text-gray-400 dark:text-gray-600">
          {visible.length} / {notes.length} ノート
        </p>
        <button
          onClick={() => setSortBy(nextSort)}
          title={`ソート: ${SORT_LABELS[sortBy]} → ${SORT_LABELS[nextSort]}`}
          className="text-xs text-gray-400 dark:text-gray-600 hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors px-1.5 py-0.5 rounded hover:bg-indigo-50 dark:hover:bg-indigo-950/30"
        >
          ↕ {SORT_LABELS[sortBy]}
        </button>
      </div>

      {/* Note list */}
      <div className="flex-1 overflow-y-auto px-2 pb-2 space-y-0.5">
        {visible.length === 0 ? (
          <div className="py-8 text-center text-sm text-gray-400 dark:text-gray-600">
            {searchQuery || filterTagIds.length > 0 ? '一致するノートがありません' : 'ノートがありません'}
          </div>
        ) : (
          visible.map(note => (
            <div
              key={note.id}
              className="relative group/item"
              onMouseLeave={() => setConfirmDeleteId(null)}
            >
              <NoteItem note={note} active={note.id === activeNoteId} />
              {/* Delete button */}
              <div className="absolute top-1.5 right-1.5 opacity-0 group-hover/item:opacity-100 transition-opacity">
                {confirmDeleteId === note.id ? (
                  <div className="flex gap-1">
                    <button
                      onClick={() => { deleteNote(note.id); setConfirmDeleteId(null); }}
                      className="text-xs px-1.5 py-0.5 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                    >
                      削除
                    </button>
                    <button
                      onClick={() => setConfirmDeleteId(null)}
                      className="text-xs px-1.5 py-0.5 bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                    >
                      ×
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={e => { e.stopPropagation(); setConfirmDeleteId(note.id); }}
                    className="w-5 h-5 flex items-center justify-center text-gray-400 hover:text-red-500 transition-colors text-xs rounded hover:bg-red-50 dark:hover:bg-red-950/30"
                    title="ノートを削除"
                  >
                    🗑
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer: Keyboard shortcuts */}
      <div className="px-3 py-2 border-t border-gray-200 dark:border-gray-800">
        <div className="grid grid-cols-2 gap-x-2 gap-y-0.5">
          {[
            ['⌘N', '新規ノート'],
            ['⌘K', '検索'],
            ['⌘P', 'ピン留め'],
            ['⌘⇧E', 'エクスポート'],
          ].map(([key, label]) => (
            <div key={key} className="flex items-center gap-1">
              <kbd className="text-xs px-1 py-0.5 bg-gray-100 dark:bg-gray-800 rounded border border-gray-300 dark:border-gray-700 font-mono text-gray-500 dark:text-gray-500 shrink-0">
                {key}
              </kbd>
              <span className="text-xs text-gray-400 dark:text-gray-600 truncate">{label}</span>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}
