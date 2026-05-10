interface Props {
  onClick: () => void;
  label?: string;
  icon?: React.ReactNode;
}

export function Fab({ onClick, label = '新しいノート', icon }: Props) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="fixed right-4 bottom-[calc(env(safe-area-inset-bottom)+1rem)] z-40 w-14 h-14 rounded-full bg-accent-500 hover:bg-accent-600 text-paper-50 shadow-paper-lg flex items-center justify-center text-3xl leading-none active:scale-95 transition-transform"
    >
      {icon ?? '＋'}
    </button>
  );
}
