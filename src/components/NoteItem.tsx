import { useNoteStore } from '../store/useNoteStore';
import type { Note } from '../types';
import { TagBadge } from './TagBadge';

interface Props {
  note: Note;
  active: boolean;
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
    const doc = JSON.parse(content);
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

export function NoteItem({ note, active }: Props) {
  const { setActiveNote, tags } = useNoteStore(s => ({
    setActiveNote: s.setActiveNote,
    tags: s.tags,
  }));

  const noteTags = tags.filter(t => note.tagIds.includes(t.id));
  const preview = getPreview(note.content);

  return (
    <div
      onClick={() => setActiveNote(note.id)}
      className={`px-3 py-2.5 rounded-lg cursor-pointer transition-colors group
        ${active
          ? 'bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-800'
          : 'hover:bg-gray-100 dark:hover:bg-gray-800/50 border border-transparent'
        }
      `}
    >
      <div className="flex items-start justify-between gap-2">
        <p className={`text-sm font-medium truncate leading-snug
          ${active ? 'text-indigo-700 dark:text-indigo-300' : 'text-gray-800 dark:text-gray-200'}
        `}>
          {note.title || '無題のノート'}
        </p>
        <span className="text-xs text-gray-400 dark:text-gray-600 shrink-0 mt-0.5">
          {formatDate(note.updatedAt)}
        </span>
      </div>
      {preview && (
        <p className="text-xs text-gray-500 dark:text-gray-500 mt-0.5 truncate leading-snug">
          {preview}
        </p>
      )}
      {noteTags.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-1.5">
          {noteTags.slice(0, 3).map(tag => (
            <TagBadge key={tag.id} tag={tag} small />
          ))}
        </div>
      )}
    </div>
  );
}
