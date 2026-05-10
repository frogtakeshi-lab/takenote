import { useEffect } from 'react';
import { usePreferences } from '../features/settings/usePreferences';

export function useFontScale() {
  const fontScale = usePreferences(s => s.fontScale);
  const paperTexture = usePreferences(s => s.paperTexture);

  useEffect(() => {
    document.documentElement.dataset.fontScale = fontScale;
    document.documentElement.classList.toggle('paper-texture', paperTexture);
  }, [fontScale, paperTexture]);
}
