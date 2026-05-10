import { useRef, useEffect, useState, lazy, Suspense } from 'react';
import { useShallow } from 'zustand/shallow';
import { useTheme } from './hooks/useTheme';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import { useViewMode } from './hooks/useViewMode';
import { useFontScale } from './hooks/useFontScale';
import { Sidebar } from './components/Sidebar';
import { MobileHeader } from './components/MobileHeader';
import { Fab } from './components/Fab';

const Editor = lazy(() => import('./components/Editor').then(m => ({ default: m.Editor })));
import { useNoteStore } from './store/useNoteStore';
import { consumePendingShare, buildSharedNoteContent } from './features/share/handleShare';
import { InstallPrompt } from './features/pwa/InstallPrompt';
import { UpdateToast } from './features/pwa/UpdateToast';
import { OfflineBadge } from './features/pwa/OfflineBadge';
import { SettingsSheet } from './features/settings/SettingsSheet';

function App() {
  useTheme();
  useFontScale();
  const searchRef = useRef<HTMLInputElement>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const { view, isMobile, goList } = useViewMode();
  const { notes, activeNoteId, createNote, createNoteFromShare } = useNoteStore(useShallow(s => ({
    notes: s.notes,
    activeNoteId: s.activeNoteId,
    createNote: s.createNote,
    createNoteFromShare: s.createNoteFromShare,
  })));
  const activeNote = notes.find(n => n.id === activeNoteId) ?? null;

  useKeyboardShortcuts({ searchRef });

  // PWA 共有ターゲット: ?shared=1 で起動した場合に Cache から取り込む
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const shared = params.get('shared');
    const action = params.get('action');

    if (shared === '1') {
      void (async () => {
        const data = await consumePendingShare();
        history.replaceState({}, '', window.location.pathname);
        if (data) {
          const { title, bodyText } = buildSharedNoteContent(data);
          createNoteFromShare(title, bodyText);
        }
      })();
    } else if (action === 'new') {
      createNote();
      history.replaceState({}, '', window.location.pathname);
    }
  }, [createNote, createNoteFromShare]);

  const showSidebar = !isMobile || view === 'list';
  const showEditor = !isMobile || view === 'editor';

  return (
    <div className="flex h-full w-screen bg-paper-100 dark:bg-paper-800 overflow-hidden">
      {showSidebar && (
        <div className="relative sm:relative inset-y-0 left-0 w-full sm:w-auto h-full">
          <Sidebar searchRef={searchRef} onOpenSettings={() => setSettingsOpen(true)} />
        </div>
      )}

      {showEditor && (
        <main className="flex-1 flex flex-col overflow-hidden">
          {isMobile && (
            <MobileHeader
              title={activeNote?.title || '無題のノート'}
              onBack={goList}
              onMenu={() => setSettingsOpen(true)}
            />
          )}
          <div className="flex-1 overflow-hidden">
            <Suspense fallback={
              <div className="h-full flex items-center justify-center text-paper-500 dark:text-paper-400 text-sm">
                エディタを読み込み中…
              </div>
            }>
              <Editor />
            </Suspense>
          </div>
        </main>
      )}

      {/* FAB: モバイル一覧画面のみ */}
      {isMobile && view === 'list' && (
        <Fab onClick={createNote} />
      )}

      {/* 設定 bottom sheet */}
      <SettingsSheet open={settingsOpen} onClose={() => setSettingsOpen(false)} />

      {/* PWA UI */}
      <OfflineBadge />
      <InstallPrompt />
      <UpdateToast />
    </div>
  );
}

export default App;
