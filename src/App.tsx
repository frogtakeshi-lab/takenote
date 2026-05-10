import { useRef, useEffect } from 'react';
import { useShallow } from 'zustand/shallow';
import { useTheme } from './hooks/useTheme';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import { useViewMode } from './hooks/useViewMode';
import { Sidebar } from './components/Sidebar';
import { Editor } from './components/Editor';
import { MobileHeader } from './components/MobileHeader';
import { Fab } from './components/Fab';
import { useNoteStore } from './store/useNoteStore';
import { consumePendingShare, buildSharedNoteContent } from './features/share/handleShare';

function App() {
  useTheme();
  const searchRef = useRef<HTMLInputElement>(null);
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
          <Sidebar searchRef={searchRef} />
        </div>
      )}

      {showEditor && (
        <main className="flex-1 flex flex-col overflow-hidden">
          {isMobile && (
            <MobileHeader
              title={activeNote?.title || '無題のノート'}
              onBack={goList}
            />
          )}
          <div className="flex-1 overflow-hidden">
            <Editor />
          </div>
        </main>
      )}

      {/* FAB: モバイル一覧画面のみ */}
      {isMobile && view === 'list' && (
        <Fab onClick={createNote} />
      )}
    </div>
  );
}

export default App;
