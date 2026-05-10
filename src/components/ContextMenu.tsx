import { AnimatePresence, motion } from 'framer-motion';
import { useEffect } from 'react';

export interface ContextMenuItem {
  key: string;
  label: string;
  icon?: React.ReactNode;
  onClick: () => void;
  destructive?: boolean;
}

interface Props {
  open: boolean;
  title?: string;
  items: ContextMenuItem[];
  onClose: () => void;
}

export function ContextMenu({ open, title, items, onClose }: Props) {
  useEffect(() => {
    if (!open) return;
    function onEsc(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', onEsc);
    return () => document.removeEventListener('keydown', onEsc);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 bg-paper-900/50 z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            aria-hidden="true"
          />
          <motion.div
            role="menu"
            aria-label={title}
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 320, damping: 30 }}
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.4 }}
            onDragEnd={(_, info) => {
              if (info.offset.y > 80) onClose();
            }}
            className="fixed inset-x-0 bottom-0 z-50 bg-paper-50 dark:bg-paper-900 rounded-t-2xl shadow-paper-lg pb-[calc(env(safe-area-inset-bottom)+0.5rem)]"
          >
            {/* drag handle */}
            <div className="flex justify-center pt-2 pb-1" aria-hidden="true">
              <div className="w-10 h-1.5 rounded-full bg-paper-300 dark:bg-paper-700" />
            </div>
            {title && (
              <p className="px-4 py-2 text-xs text-paper-500 dark:text-paper-400 truncate">
                {title}
              </p>
            )}
            <div className="px-2 pb-2">
              {items.map(item => (
                <button
                  key={item.key}
                  type="button"
                  role="menuitem"
                  onClick={() => { item.onClick(); onClose(); }}
                  className={`w-full flex items-center gap-3 px-4 py-3 min-h-12 rounded-xl text-left text-base transition-colors active:scale-[0.98]
                    ${item.destructive
                      ? 'text-danger hover:bg-danger/10'
                      : 'text-paper-700 dark:text-paper-100 hover:bg-paper-200 dark:hover:bg-paper-700/40'}
                  `}
                >
                  {item.icon && <span className="w-6 text-center" aria-hidden="true">{item.icon}</span>}
                  <span className="flex-1">{item.label}</span>
                </button>
              ))}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
