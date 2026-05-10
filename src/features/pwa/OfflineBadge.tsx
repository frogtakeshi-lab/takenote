import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

export function OfflineBadge() {
  const [online, setOnline] = useState(typeof navigator === 'undefined' ? true : navigator.onLine);

  useEffect(() => {
    const on = () => setOnline(true);
    const off = () => setOnline(false);
    window.addEventListener('online', on);
    window.addEventListener('offline', off);
    return () => {
      window.removeEventListener('online', on);
      window.removeEventListener('offline', off);
    };
  }, []);

  return (
    <AnimatePresence>
      {!online && (
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -20, opacity: 0 }}
          role="status"
          aria-live="polite"
          className="fixed top-2 left-1/2 -translate-x-1/2 z-40 px-3 py-1 text-xs font-medium bg-paper-700 text-paper-50 dark:bg-paper-200 dark:text-paper-700 rounded-full shadow-paper"
        >
          オフライン
        </motion.div>
      )}
    </AnimatePresence>
  );
}
