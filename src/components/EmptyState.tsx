interface Props {
  variant?: 'no-note' | 'no-results';
  query?: string;
}

export function EmptyState({ variant = 'no-note', query }: Props) {
  if (variant === 'no-results') {
    return (
      <div className="py-10 text-center text-sm text-paper-500 dark:text-paper-400 px-4">
        <div className="text-3xl mb-2" aria-hidden="true">🔍</div>
        <p>{query ? `「${query}」に一致するノートがありません` : '一致するノートがありません'}</p>
      </div>
    );
  }

  return (
    <div className="py-12 text-center text-sm text-paper-500 dark:text-paper-400 px-4">
      <div className="text-4xl mb-3" aria-hidden="true">📝</div>
      <p className="text-base font-medium text-paper-600 dark:text-paper-300 mb-1">最初のメモを書いてみましょう</p>
      <p className="text-xs">
        <span className="sm:hidden">右下の ＋ ボタンから</span>
        <span className="hidden sm:inline">⌘N または上の ＋ ボタンから</span>
      </p>
    </div>
  );
}
