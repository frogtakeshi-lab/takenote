import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const DISMISS_KEY = 'takenote-install-dismissed';

export function InstallPrompt() {
  const [evt, setEvt] = useState<BeforeInstallPromptEvent | null>(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (localStorage.getItem(DISMISS_KEY)) return;
    function handler(e: Event) {
      e.preventDefault();
      setEvt(e as BeforeInstallPromptEvent);
      // 起動直後は邪魔なので 3 秒待ってから表示
      window.setTimeout(() => setShow(true), 3000);
    }
    window.addEventListener('beforeinstallprompt', handler as EventListener);
    return () => window.removeEventListener('beforeinstallprompt', handler as EventListener);
  }, []);

  function dismiss() {
    setShow(false);
    localStorage.setItem(DISMISS_KEY, '1');
  }

  async function install() {
    if (!evt) return;
    await evt.prompt();
    await evt.userChoice;
    setEvt(null);
    setShow(false);
  }

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ y: 60, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 60, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 320, damping: 28 }}
          role="dialog"
          aria-label="ホーム画面に追加"
          className="fixed inset-x-3 bottom-3 sm:left-auto sm:right-4 sm:max-w-sm z-40 bg-paper-50 dark:bg-paper-900 border border-paper-300/60 dark:border-paper-700/60 rounded-2xl shadow-paper-lg p-4"
          style={{ marginBottom: 'env(safe-area-inset-bottom)' }}
        >
          <div className="flex items-start gap-3">
            <div className="text-2xl" aria-hidden="true">📲</div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-paper-700 dark:text-paper-100">ホーム画面に追加</p>
              <p className="text-xs text-paper-500 dark:text-paper-400 mt-1">
                アプリのように起動でき、オフラインでも使えます。
              </p>
              <div className="flex gap-2 mt-3">
                <button
                  type="button"
                  onClick={install}
                  className="px-3 h-9 text-sm font-medium bg-accent-500 hover:bg-accent-600 text-paper-50 rounded-lg active:scale-95"
                >
                  追加
                </button>
                <button
                  type="button"
                  onClick={dismiss}
                  className="px-3 h-9 text-sm text-paper-500 dark:text-paper-400 hover:bg-paper-200 dark:hover:bg-paper-700/40 rounded-lg active:scale-95"
                >
                  あとで
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
