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
      className={`inline-flex items-center gap-1 rounded-full font-medium cursor-pointer select-none transition-opacity
        ${small ? 'text-xs px-2 py-0.5' : 'text-xs px-2.5 py-1'}
        ${onClick ? 'hover:opacity-80' : ''}
        ${active ? 'ring-2 ring-offset-1 ring-offset-white dark:ring-offset-gray-900' : ''}
      `}
      style={{
        backgroundColor: tag.color + '22',
        color: tag.color,
      }}
      onClick={onClick}
    >
      {tag.name}
      {onRemove && (
        <button
          className="ml-0.5 hover:opacity-60 transition-opacity"
          onClick={e => { e.stopPropagation(); onRemove(); }}
          aria-label="タグを削除"
        >
          ×
        </button>
      )}
    </span>
  );
}
