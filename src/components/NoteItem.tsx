import { useState } from 'react';
import { motion, useMotionValue, useTransform } from 'framer-motion';
import { useShallow } from 'zustand/shallow';
import { useNoteStore } from '../store/useNoteStore';
import { useMediaQuery } from '../hooks/useMediaQuery';
import { useLongPress } from '../hooks/useLongPress';
import { ContextMenu, type ContextMenuItem } from './ContextMenu';
import type { Note } from '../types';
import { TagBadge } from './TagBadge';

interface Props {
  note: Note;
  active: boolean;
  onSelect?: (id: string) => void;
}

function formatDate(ts: number) {
  const d = new Date(ts);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  if (diff < 60_000) return 'たった今';
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}分前`;
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}時間前`;
  return d.toLocaleDateString('ja-JP', { month: 'short', day: 'numeric' });
}

function getPreview(content: string): string {
  if (!content) return '';
  try {
    const doc = JSON.parse(content) as { type?: string; text?: string; content?: unknown[] };
    const texts: string[] = [];
    function walk(node: { type?: string; text?: string; content?: unknown[] }) {
      if (node.type === 'text' && node.text) texts.push(node.text);
      if (node.content) (node.content as typeof node[]).forEach(walk);
    }
    walk(doc);
    return texts.join(' ').slice(0, 80);
  } catch {
    return content.slice(0, 80);
  }
}

export function NoteItem({ note, active, onSelect }: Props) {
  const { setActiveNote, tags, deleteNote, togglePin } = useNoteStore(useShallow(s => ({
    setActiveNote: s.setActiveNote,
    tags: s.tags,
    deleteNote: s.deleteNote,
    togglePin: s.togglePin,
  })));
  const isMobile = useMediaQuery('(max-width: 640px)');
  const [menuOpen, setMenuOpen] = useState(false);

  const x = useMotionValue(0);
  const bgOpacity = useTransform(x, [-160, -40, 0], [1, 0.4, 0]);

  const noteTags = tags.filter(t => note.tagIds.includes(t.id));
  const preview = getPreview(note.content);

  const longPress = useLongPress(() => setMenuOpen(true), { ms: 450, vibrate: 15 });

  function handleClick() {
    if (longPress.didTrigger()) return;
    if (onSelect) onSelect(note.id);
    else setActiveNote(note.id);
  }

  function performDelete() {
    if (navigator.vibrate) navigator.vibrate([10, 30, 10]);
    deleteNote(note.id);
  }

  const menuItems: ContextMenuItem[] = [
    {
      key: 'pin',
      label: note.pinned ? 'ピン留めを解除' : 'ピン留めする',
      icon: '📌',
      onClick: () => togglePin(note.id),
    },
    {
      key: 'delete',
      label: '削除',
      icon: '🗑',
      onClick: performDelete,
      destructive: true,
    },
  ];

  // モバイル: スワイプで削除アクションを表示
  // デスクトップ: ホバーで削除ボタン表示 (Sidebar 側の既存挙動を温存するため、
  // モバイル時のみスワイプ可能にする)
  const enableSwipe = isMobile;

  const inner = (
    <div
      className={`px-4 py-3 min-h-14 sm:min-h-12 rounded-xl cursor-pointer transition-colors group bg-paper-50 dark:bg-paper-900
        ${active
          ? 'bg-accent-100/60! dark:bg-accent-700/20! border border-accent-400/40 dark:border-accent-600/40'
          : 'hover:bg-paper-200/60 dark:hover:bg-paper-700/30 border border-transparent'
        }
      `}
    >
      <div className="flex items-start justify-between gap-1.5">
        <div className="flex items-center gap-1 min-w-0">
          {note.pinned && (
            <span className="text-xs text-accent-500 dark:text-accent-400 shrink-0" aria-label="ピン留め済み">📌</span>
          )}
          <p className={`text-sm font-medium truncate leading-snug
            ${active ? 'text-accent-700 dark:text-accent-200' : 'text-paper-700 dark:text-paper-100'}
          `}>
            {note.title || '無題のノート'}
          </p>
        </div>
        <span className="text-xs text-paper-500 dark:text-paper-400 shrink-0 mt-0.5">
          {formatDate(note.updatedAt)}
        </span>
      </div>
      {preview && (
        <p className="text-xs text-paper-500 dark:text-paper-400 mt-1 truncate leading-snug">
          {preview}
        </p>
      )}
      {noteTags.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {noteTags.slice(0, 3).map(tag => (
            <TagBadge key={tag.id} tag={tag} small />
          ))}
        </div>
      )}
    </div>
  );

  return (
    <>
      {enableSwipe ? (
        <div className="relative">
          <motion.div
            style={{ opacity: bgOpacity }}
            className="absolute inset-0 bg-danger rounded-xl flex items-center justify-end pr-6 pointer-events-none"
            aria-hidden="true"
          >
            <span className="text-paper-50 text-sm font-medium">削除</span>
          </motion.div>
          <motion.div
            drag="x"
            dragConstraints={{ left: -200, right: 0 }}
            dragElastic={{ left: 0.05, right: 0 }}
            style={{ x }}
            onDragEnd={(_, info) => {
              if (info.offset.x < -120) {
                performDelete();
              } else {
                x.set(0);
              }
            }}
            onClick={handleClick}
            {...longPress.handlers}
          >
            {inner}
          </motion.div>
        </div>
      ) : (
        <div onClick={handleClick} {...longPress.handlers}>
          {inner}
        </div>
      )}
      <ContextMenu
        open={menuOpen}
        title={note.title || '無題のノート'}
        items={menuItems}
        onClose={() => setMenuOpen(false)}
      />
    </>
  );
}
