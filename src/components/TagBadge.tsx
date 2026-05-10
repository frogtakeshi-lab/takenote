import type { Tag } from '../types';

interface Props {
  tag: Tag;
  onRemove?: () => void;
  onClick?: () => void;
  active?: boolean;
  small?: boolean;
}

export function TagBadge({ tag, onRemove, onClick, active, small }: Props) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full font-medium select-none transition-opacity border
        ${small ? 'text-xs px-2 py-0.5 min-h-7' : 'text-sm px-2.5 py-1 min-h-8'}
        ${onClick ? 'cursor-pointer hover:opacity-80' : ''}
        ${active ? 'ring-2 ring-offset-1 ring-offset-paper-100 dark:ring-offset-paper-800' : ''}
      `}
      style={{
        backgroundColor: `color-mix(in oklab, ${tag.color} 18%, transparent)`,
        color: `color-mix(in oklab, ${tag.color} 78%, var(--color-paper-700))`,
        borderColor: `color-mix(in oklab, ${tag.color} 35%, transparent)`,
      }}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      aria-pressed={onClick ? active : undefined}
    >
      {tag.name}
      {onRemove && (
        <button
          type="button"
          className="ml-0.5 -mr-1 w-6 h-6 flex items-center justify-center rounded-full hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
          onClick={e => { e.stopPropagation(); onRemove(); }}
          aria-label={`タグ「${tag.name}」を削除`}
        >
          ×
        </button>
      )}
    </span>
  );
}
