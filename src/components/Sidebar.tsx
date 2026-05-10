import { useState } from 'react';
import { useShallow } from 'zustand/shallow';
import { useNoteStore } from '../store/useNoteStore';
import { NoteItem } from './NoteItem';
import { TagBadge } from './TagBadge';
import { useToast } from './Toast';
import { haptics } from '../utils/haptics';
import { EmptyState } from './EmptyState';
import type { SortBy } from '../types';

const SORT_LABELS: Record<SortBy, string> = {
  updatedAt: '更新順',
  createdAt: '作成順',
  title: 'タイトル順',
};
const SORT_ORDER: SortBy[] = ['updatedAt', 'createdAt', 'title'];

interface Props {
  searchRef: React.RefObject<HTMLInputElement | null>;
  onOpenSettings?: () => void;
}

export function Sidebar({ searchRef, onOpenSettings }: Props) {
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
    restoreNote,
    commitDelete,
    setSearchQuery,
    toggleFilterTag,
    clearFilterTags,
    setSortBy,
    setTheme,
    setActiveNote,
    filteredNotes,
  } = useNoteStore(useShallow(s => ({
    notes: s.notes,
    tags: s.tags,
    activeNoteId: s.activeNoteId,
    searchQuery: s.searchQuery,
    filterTagIds: s.filterTagIds,
    sortBy: s.sortBy,
    theme: s.theme,
    createNote: s.createNote,
    deleteNote: s.deleteNote,
    restoreNote: s.restoreNote,
    commitDelete: s.commitDelete,
    setSearchQuery: s.setSearchQuery,
    toggleFilterTag: s.toggleFilterTag,
    clearFilterTags: s.clearFilterTags,
    setSortBy: s.setSortBy,
    setTheme: s.setTheme,
    setActiveNote: s.setActiveNote,
    filteredNotes: s.filteredNotes,
  })));

  const visible = filteredNotes();
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const toast = useToast();

  function handleDelete(id: string) {
    haptics.delete();
    let restored = false;
    const removed = deleteNote(id);
    setConfirmDeleteId(null);
    if (!removed) return;
    toast.show(`「${removed.title || '無題のノート'}」を削除しました`, {
      action: {
        label: '元に戻す',
        onClick: () => { restored = true; restoreNote(removed); haptics.success(); },
      },
      duration: 5000,
    });
    window.setTimeout(() => { if (!restored) commitDelete(removed); }, 5200);
  }

  const themeIcons: Record<string, string> = { light: '☀️', dark: '🌙', system: '🖥️' };
  const themeLabels: Record<string, string> = { light: 'ライト', dark: 'ダーク', system: 'システム' };
  const themeOrder: Array<'light' | 'dark' | 'system'> = ['light', 'dark', 'system'];
  const nextTheme = themeOrder[(themeOrder.indexOf(theme) + 1) % 3];
  const nextSort = SORT_ORDER[(SORT_ORDER.indexOf(sortBy) + 1) % SORT_ORDER.length];

  function handleCreateNote() {
    createNote();
  }

  function handleSelectNote(id: string) {
    setActiveNote(id);
  }

  return (
    <aside className="w-full sm:w-64 h-full flex flex-col bg-paper-50 dark:bg-paper-900 sm:border-r border-paper-300/60 dark:border-paper-700/60">
      {/* Header */}
      <div className="px-3 pt-3 pb-2 flex items-center justify-between">
        <span className="text-base font-bold text-paper-700 dark:text-paper-100 select-none">
          📝 TakeNote
        </span>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setTheme(nextTheme)}
            title={`テーマ: ${themeLabels[theme]} → ${themeLabels[nextTheme]}`}
            aria-label={`テーマを切り替え (現在: ${themeLabels[theme]})`}
            className="min-w-11 min-h-11 sm:min-w-9 sm:min-h-9 flex items-center justify-center rounded-lg hover:bg-paper-200 dark:hover:bg-paper-700/40 transition-colors text-base active:scale-95"
          >
            {themeIcons[theme]}
          </button>
          {onOpenSettings && (
            <button
              type="button"
              onClick={onOpenSettings}
              title="設定"
              aria-label="設定を開く"
              className="min-w-11 min-h-11 sm:min-w-9 sm:min-h-9 flex items-center justify-center rounded-lg hover:bg-paper-200 dark:hover:bg-paper-700/40 transition-colors text-paper-600 dark:text-paper-300 active:scale-95"
            >
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
                <circle cx="9" cy="9" r="2.5" stroke="currentColor" strokeWidth="1.5"/>
                <path d="M9 1v2M9 15v2M1 9h2M15 9h2M3.3 3.3l1.4 1.4M13.3 13.3l1.4 1.4M3.3 14.7l1.4-1.4M13.3 4.7l1.4-1.4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </button>
          )}
          {/* デスクトップでは + ボタン、モバイルでは FAB を使う */}
          <button
            type="button"
            onClick={handleCreateNote}
            title="新しいノート (⌘N)"
            aria-label="新しいノートを作成"
            className="hidden sm:flex min-w-9 min-h-9 items-center justify-center rounded-lg bg-accent-500 hover:bg-accent-600 text-paper-50 transition-colors text-xl leading-none active:scale-95 shadow-paper"
          >
            +
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="px-3 pb-2">
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-paper-500 dark:text-paper-400 text-sm select-none pointer-events-none" aria-hidden="true">🔍</span>
          <input
            ref={searchRef}
            type="search"
            inputMode="search"
            enterKeyHint="search"
            autoCapitalize="off"
            autoCorrect="off"
            autoComplete="off"
            spellCheck={false}
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="検索... (⌘K)"
            aria-label="ノートを検索"
            className="w-full pl-9 pr-10 h-11 sm:h-10 text-sm rounded-xl bg-paper-100 dark:bg-paper-800 border border-paper-300/60 dark:border-paper-700/60 text-paper-700 dark:text-paper-100 placeholder-paper-500 dark:placeholder-paper-400 focus:outline-none focus:ring-2 focus:ring-accent-400 transition"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              aria-label="検索をクリア"
              className="absolute right-1.5 top-1/2 -translate-y-1/2 text-paper-500 hover:text-paper-700 dark:hover:text-paper-100 w-9 h-9 flex items-center justify-center rounded-full hover:bg-paper-200 dark:hover:bg-paper-700/40 transition"
            >
              ×
            </button>
          )}
        </div>
      </div>

      {/* Tag filters */}
      {tags.length > 0 && (
        <div className="px-3 pb-2">
          <div className="flex flex-wrap gap-1.5">
            <button
              type="button"
              onClick={clearFilterTags}
              aria-pressed={filterTagIds.length === 0}
              className={`text-xs px-3 py-1.5 min-h-8 rounded-full transition-colors
                ${filterTagIds.length === 0
                  ? 'bg-accent-100 dark:bg-accent-700/30 text-accent-700 dark:text-accent-200 font-medium'
                  : 'text-paper-500 dark:text-paper-400 hover:bg-paper-200 dark:hover:bg-paper-700/40'
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
            <p className="text-xs text-paper-500 dark:text-paper-400 mt-1">
              {filterTagIds.length}個のタグで絞り込み中 (AND条件)
            </p>
          )}
        </div>
      )}

      {/* Sort + Note count row */}
      <div className="px-3 pb-1 flex items-center justify-between">
        <p className="text-xs text-paper-500 dark:text-paper-400">
          {visible.length} / {notes.length} ノート
        </p>
        <button
          type="button"
          onClick={() => setSortBy(nextSort)}
          title={`ソート: ${SORT_LABELS[sortBy]} → ${SORT_LABELS[nextSort]}`}
          aria-label={`並び替え (現在: ${SORT_LABELS[sortBy]})`}
          className="text-xs text-paper-500 dark:text-paper-400 hover:text-accent-600 dark:hover:text-accent-200 transition-colors px-2 py-1.5 rounded-md hover:bg-accent-50 dark:hover:bg-accent-700/20"
        >
          ↕ {SORT_LABELS[sortBy]}
        </button>
      </div>

      {/* Note list */}
      <div className="flex-1 overflow-y-auto px-2 pb-2 space-y-0.5" role="list">
        {visible.length === 0 ? (
          searchQuery || filterTagIds.length > 0
            ? <EmptyState variant="no-results" query={searchQuery} />
            : <EmptyState variant="no-note" />
        ) : (
          visible.map(note => (
            <div
              key={note.id}
              className="relative group/item"
              role="listitem"
              onMouseLeave={() => setConfirmDeleteId(null)}
            >
              <NoteItem
                note={note}
                active={note.id === activeNoteId}
                onSelect={handleSelectNote}
              />
              {/* デスクトップのみ: ホバーで削除ボタン (モバイルはスワイプ・長押し) */}
              <div className="hidden sm:block absolute top-1.5 right-1.5 opacity-0 group-hover/item:opacity-100 focus-within:opacity-100 transition-opacity">
                {confirmDeleteId === note.id ? (
                  <div className="flex gap-1">
                    <button
                      type="button"
                      onClick={() => handleDelete(note.id)}
                      className="text-xs px-3 h-9 min-w-11 bg-danger text-paper-50 rounded-lg hover:opacity-90 transition-opacity active:scale-95"
                      aria-label={`「${note.title || '無題のノート'}」を削除`}
                    >
                      削除
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmDeleteId(null)}
                      className="text-xs px-3 h-9 min-w-11 bg-paper-200 dark:bg-paper-700 text-paper-600 dark:text-paper-200 rounded-lg hover:bg-paper-300 dark:hover:bg-paper-600 transition-colors active:scale-95"
                      aria-label="削除をキャンセル"
                    >
                      ×
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={e => { e.stopPropagation(); setConfirmDeleteId(note.id); }}
                    className="min-w-9 min-h-9 flex items-center justify-center text-paper-500 hover:text-danger transition-colors text-sm rounded-lg hover:bg-danger/10 active:scale-95"
                    aria-label={`「${note.title || '無題のノート'}」を削除`}
                  >
                    🗑
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer: Keyboard shortcuts (desktop only) */}
      <div className="hidden sm:block px-3 py-2 border-t border-paper-300/60 dark:border-paper-700/60">
        <div className="grid grid-cols-2 gap-x-2 gap-y-0.5">
          {[
            ['⌘N', '新規ノート'],
            ['⌘K', '検索'],
            ['⌘P', 'ピン留め'],
            ['⌘⇧E', 'エクスポート'],
          ].map(([key, label]) => (
            <div key={key} className="flex items-center gap-1">
              <kbd className="text-xs px-1 py-0.5 bg-paper-200 dark:bg-paper-800 rounded border border-paper-300 dark:border-paper-700 font-mono text-paper-600 dark:text-paper-300 shrink-0">
                {key}
              </kbd>
              <span className="text-xs text-paper-500 dark:text-paper-400 truncate">{label}</span>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}
