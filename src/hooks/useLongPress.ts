import { useRef, useCallback } from 'react';

interface Options {
  ms?: number;
  vibrate?: number;
}

/**
 * 長押しハンドラを返す。touch / pointer 両対応。
 * 戻り値の handlers をターゲット要素に spread する。
 */
export function useLongPress(onLongPress: () => void, opts: Options = {}) {
  const { ms = 500, vibrate = 15 } = opts;
  const timer = useRef<number | null>(null);
  const triggered = useRef(false);

  const start = useCallback(() => {
    triggered.current = false;
    if (timer.current) window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => {
      triggered.current = true;
      if (vibrate && navigator.vibrate) navigator.vibrate(vibrate);
      onLongPress();
    }, ms);
  }, [onLongPress, ms, vibrate]);

  const cancel = useCallback(() => {
    if (timer.current) {
      window.clearTimeout(timer.current);
      timer.current = null;
    }
  }, []);

  return {
    handlers: {
      onPointerDown: start,
      onPointerUp: cancel,
      onPointerLeave: cancel,
      onPointerCancel: cancel,
      onContextMenu: (e: React.MouseEvent) => {
        if (triggered.current) e.preventDefault();
      },
    },
    didTrigger: () => triggered.current,
  };
}
