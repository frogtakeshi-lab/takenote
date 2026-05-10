/**
 * Vibration API のラッパ。未対応端末では無音。
 * iOS Safari (PWA インストール後を含む) は無視されることが多い。
 */
function vibrate(pattern: number | number[]): void {
  if (typeof navigator === 'undefined' || !navigator.vibrate) return;
  if (!getEnabled()) return;
  try { navigator.vibrate(pattern); } catch { /* noop */ }
}

const STORAGE_KEY = 'takenote-haptics-enabled';

function getEnabled(): boolean {
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    return v === null ? true : v === '1';
  } catch {
    return true;
  }
}

export function setHapticsEnabled(enabled: boolean): void {
  try { localStorage.setItem(STORAGE_KEY, enabled ? '1' : '0'); } catch { /* noop */ }
}

export function isHapticsEnabled(): boolean {
  return getEnabled();
}

export const haptics = {
  tap: () => vibrate(8),
  warn: () => vibrate(20),
  delete: () => vibrate([10, 30, 10]),
  pin: () => vibrate(15),
  success: () => vibrate([8, 40, 8]),
};
