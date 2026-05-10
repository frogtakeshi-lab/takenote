import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type FontScale = 'sm' | 'base' | 'lg' | 'xl';

export interface Preferences {
  fontScale: FontScale;
  paperTexture: boolean;
  voiceLang: 'ja-JP' | 'en-US';
  hapticsEnabled: boolean;
}

interface PrefStore extends Preferences {
  setFontScale: (s: FontScale) => void;
  setPaperTexture: (b: boolean) => void;
  setVoiceLang: (l: 'ja-JP' | 'en-US') => void;
  setHapticsEnabled: (b: boolean) => void;
}

export const usePreferences = create<PrefStore>()(
  persist(
    (set) => ({
      fontScale: 'base',
      paperTexture: false,
      voiceLang: 'ja-JP',
      hapticsEnabled: true,
      setFontScale: (fontScale) => set({ fontScale }),
      setPaperTexture: (paperTexture) => set({ paperTexture }),
      setVoiceLang: (voiceLang) => set({ voiceLang }),
      setHapticsEnabled: (hapticsEnabled) => {
        try { localStorage.setItem('takenote-haptics-enabled', hapticsEnabled ? '1' : '0'); } catch { /* noop */ }
        set({ hapticsEnabled });
      },
    }),
    { name: 'takenote-prefs' }
  )
);
