import { useEffect, useState, useCallback } from 'react';
import { useNoteStore } from '../store/useNoteStore';
import { useMediaQuery } from './useMediaQuery';

export type View = 'list' | 'editor';

/**
 * モバイル時の単一ペイン遷移を管理する。
 * - ノート選択 → editor へ自動遷移 (history.pushState)
 * - 戻る (popstate) で list へ
 * デスクトップでは常に両ペイン表示なので view の遷移は使わない。
 */
export function useViewMode() {
  const isMobile = useMediaQuery('(max-width: 640px)');
  const activeNoteId = useNoteStore(s => s.activeNoteId);
  const setActiveNote = useNoteStore(s => s.setActiveNote);
  const [view, setView] = useState<View>(activeNoteId ? 'editor' : 'list');

  // モバイルでノートが選択されたら editor へ遷移
  useEffect(() => {
    if (!isMobile) return;
    if (activeNoteId && view !== 'editor') {
      setView('editor');
      if (history.state?.view !== 'editor') {
        history.pushState({ view: 'editor' }, '');
      }
    }
  }, [activeNoteId, isMobile, view]);

  // ハードウェア戻るで list に戻す
  useEffect(() => {
    function onPop() {
      setView('list');
    }
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  const goList = useCallback(() => {
    setView('list');
    setActiveNote(null);
    if (history.state?.view === 'editor') {
      history.back();
    }
  }, [setActiveNote]);

  const goEditor = useCallback(() => {
    setView('editor');
  }, []);

  return { view, isMobile, goList, goEditor };
}
