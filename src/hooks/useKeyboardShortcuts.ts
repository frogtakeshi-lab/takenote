import { useEffect, useRef } from 'react';
import { useNoteStore } from '../store/useNoteStore';
import { downloadMarkdown } from '../utils/exportMarkdown';

interface Options {
  searchRef: React.RefObject<HTMLInputElement | null>;
}

export function useKeyboardShortcuts({ searchRef }: Options) {
  const storeRef = useRef(useNoteStore.getState());

  useEffect(() => {
    return useNoteStore.subscribe(s => { storeRef.current = s; });
  }, []);

  useEffect(() => {
    function handler(e: KeyboardEvent) {
      const meta = e.metaKey || e.ctrlKey;
      if (!meta) return;

      const tag = (e.target as HTMLElement).tagName;
      const isInput = tag === 'INPUT' || tag === 'TEXTAREA';

      // Ctrl/Cmd+N → 新規ノート
      if (e.key === 'n' && !e.shiftKey && !isInput) {
        e.preventDefault();
        storeRef.current.createNote();
        return;
      }

      // Ctrl/Cmd+K → 検索バーにフォーカス
      if (e.key === 'k' && !e.shiftKey) {
        e.preventDefault();
        searchRef.current?.focus();
        searchRef.current?.select();
        return;
      }

      // Ctrl/Cmd+P → ピン留め切替
      if (e.key === 'p' && !e.shiftKey) {
        e.preventDefault();
        const { activeNoteId, togglePin } = storeRef.current;
        if (activeNoteId) togglePin(activeNoteId);
        return;
      }

      // Ctrl/Cmd+Shift+E → Markdownエクスポート
      if (e.key === 'E' && e.shiftKey) {
        e.preventDefault();
        const { activeNoteId, notes } = storeRef.current;
        if (!activeNoteId) return;
        const note = notes.find(n => n.id === activeNoteId);
        if (note) downloadMarkdown(note.title, note.content);
        return;
      }
    }

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [searchRef]);
}
