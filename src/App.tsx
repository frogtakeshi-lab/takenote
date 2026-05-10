import { useRef, useState, useCallback } from 'react';
import { useTheme } from './hooks/useTheme';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import { Sidebar } from './components/Sidebar';
import { Editor } from './components/Editor';

function App() {
  useTheme();
  const searchRef = useRef<HTMLInputElement>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const closeSidebar = useCallback(() => setSidebarOpen(false), []);
  const openSidebar = useCallback(() => setSidebarOpen(true), []);

  useKeyboardShortcuts({ searchRef });

  return (
    <div className="flex h-full w-screen bg-paper-100 dark:bg-paper-800 overflow-hidden">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-paper-900/50 z-20 sm:hidden"
          onClick={closeSidebar}
          aria-hidden="true"
        />
      )}

      {/* Sidebar — always visible on desktop, drawer on mobile */}
      <div className={`
        fixed sm:relative inset-y-0 left-0 z-30 sm:z-auto
        transform transition-transform duration-300 ease-in-out sm:transform-none
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full sm:translate-x-0'}
      `}>
        <Sidebar searchRef={searchRef} onClose={closeSidebar} />
      </div>

      {/* Main content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile header bar */}
        <div className="sm:hidden flex items-center gap-2 px-3 py-2 border-b border-paper-300/60 dark:border-paper-700/60 bg-paper-50 dark:bg-paper-900 shrink-0">
          <button
            type="button"
            onClick={openSidebar}
            aria-label="サイドバーを開く"
            className="min-w-11 min-h-11 flex items-center justify-center rounded-lg hover:bg-paper-200 dark:hover:bg-paper-700/40 transition-colors text-paper-600 dark:text-paper-300 active:scale-95"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
              <path d="M3 5h14M3 10h14M3 15h14" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round"/>
            </svg>
          </button>
          <span className="text-sm font-semibold text-paper-700 dark:text-paper-100">TakeNote</span>
        </div>

        <div className="flex-1 overflow-hidden">
          <Editor onOpenSidebar={openSidebar} />
        </div>
      </main>
    </div>
  );
}

export default App;
