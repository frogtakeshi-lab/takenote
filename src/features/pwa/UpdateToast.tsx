import { useRegisterSW } from 'virtual:pwa-register/react';
import { AnimatePresence, motion } from 'framer-motion';

export function UpdateToast() {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisterError(error) {
      console.error('SW register error', error);
    },
  });

  return (
    <AnimatePresence>
      {needRefresh && (
        <motion.div
          initial={{ y: 60, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 60, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 320, damping: 28 }}
          role="status"
          aria-live="polite"
          className="fixed inset-x-3 bottom-3 sm:left-auto sm:right-4 sm:max-w-sm z-40 bg-paper-700 text-paper-50 dark:bg-paper-200 dark:text-paper-700 rounded-2xl shadow-paper-lg px-4 py-3 flex items-center gap-3"
          style={{ marginBottom: 'env(safe-area-inset-bottom)' }}
        >
          <span className="flex-1 text-sm">新バージョンが利用可能です</span>
          <button
            type="button"
            onClick={() => updateServiceWorker(true)}
            className="px-3 h-9 text-sm font-semibold bg-accent-500 text-paper-50 rounded-lg active:scale-95"
          >
            更新
          </button>
          <button
            type="button"
            onClick={() => setNeedRefresh(false)}
            aria-label="通知を閉じる"
            className="min-w-9 min-h-9 flex items-center justify-center rounded-lg hover:bg-black/10 dark:hover:bg-white/10 active:scale-95"
          >
            ×
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
