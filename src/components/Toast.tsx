import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

interface ToastAction {
  label: string;
  onClick: () => void;
}

interface ToastItem {
  id: number;
  message: string;
  action?: ToastAction;
  duration: number;
  variant: 'default' | 'success' | 'danger';
}

interface ToastContextValue {
  show: (message: string, opts?: { action?: ToastAction; duration?: number; variant?: ToastItem['variant'] }) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('ToastProvider が必要です');
  return ctx;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);
  const seq = useRef(0);

  const dismiss = useCallback((id: number) => {
    setItems(prev => prev.filter(t => t.id !== id));
  }, []);

  const show: ToastContextValue['show'] = useCallback((message, opts = {}) => {
    const id = ++seq.current;
    const item: ToastItem = {
      id,
      message,
      action: opts.action,
      duration: opts.duration ?? 5000,
      variant: opts.variant ?? 'default',
    };
    setItems(prev => [...prev, item]);
    window.setTimeout(() => dismiss(id), item.duration);
  }, [dismiss]);

  return (
    <ToastContext.Provider value={{ show }}>
      {children}
      <div
        aria-live="polite"
        aria-atomic="true"
        className="fixed inset-x-0 z-50 flex flex-col items-center gap-2 px-4 pointer-events-none"
        style={{ bottom: 'calc(env(safe-area-inset-bottom) + 5rem)' }}
      >
        <AnimatePresence>
          {items.map(item => (
            <motion.div
              key={item.id}
              initial={{ y: 20, opacity: 0, scale: 0.95 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 10, opacity: 0, scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 320, damping: 28 }}
              className={`pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl shadow-paper-lg max-w-sm w-full
                ${item.variant === 'danger' ? 'bg-danger text-paper-50'
                  : item.variant === 'success' ? 'bg-success text-paper-50'
                  : 'bg-paper-700 text-paper-50 dark:bg-paper-200 dark:text-paper-700'}`}
            >
              <span className="flex-1 text-sm">{item.message}</span>
              {item.action && (
                <button
                  type="button"
                  onClick={() => { item.action!.onClick(); dismiss(item.id); }}
                  className="text-sm font-semibold underline underline-offset-2 px-2 py-1 -mr-1 active:scale-95"
                >
                  {item.action.label}
                </button>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

/**
 * 単純なグローバル参照 (Provider 外からも push したい場合用)
 */
let globalShow: ToastContextValue['show'] | null = null;

export function ToastBridge() {
  const { show } = useToast();
  useEffect(() => {
    globalShow = show;
    return () => { globalShow = null; };
  }, [show]);
  return null;
}

export function toast(message: string, opts?: Parameters<ToastContextValue['show']>[1]): void {
  globalShow?.(message, opts);
}
