interface Props {
  title?: string;
  onBack: () => void;
  onMenu?: () => void;
  rightSlot?: React.ReactNode;
}

export function MobileHeader({ title, onBack, onMenu, rightSlot }: Props) {
  return (
    <header className="sm:hidden flex items-center gap-1 px-2 py-2 border-b border-paper-300/60 dark:border-paper-700/60 bg-paper-50 dark:bg-paper-900 shrink-0">
      <button
        type="button"
        onClick={onBack}
        aria-label="一覧に戻る"
        className="min-w-11 min-h-11 flex items-center justify-center rounded-lg hover:bg-paper-200 dark:hover:bg-paper-700/40 transition-colors text-paper-600 dark:text-paper-300 active:scale-95"
      >
        <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true">
          <path d="M14 5l-7 6 7 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>
      <h1 className="flex-1 text-sm font-semibold text-paper-700 dark:text-paper-100 truncate text-center px-1">
        {title || '無題のノート'}
      </h1>
      {rightSlot}
      {onMenu && (
        <button
          type="button"
          onClick={onMenu}
          aria-label="その他のメニュー"
          aria-haspopup="menu"
          className="min-w-11 min-h-11 flex items-center justify-center rounded-lg hover:bg-paper-200 dark:hover:bg-paper-700/40 transition-colors text-paper-600 dark:text-paper-300 active:scale-95"
        >
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true">
            <circle cx="11" cy="5" r="1.6" fill="currentColor"/>
            <circle cx="11" cy="11" r="1.6" fill="currentColor"/>
            <circle cx="11" cy="17" r="1.6" fill="currentColor"/>
          </svg>
        </button>
      )}
    </header>
  );
}
