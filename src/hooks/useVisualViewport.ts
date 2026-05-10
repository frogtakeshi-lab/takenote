import { useEffect, useState } from 'react';

/**
 * ソフトキーボード等で被さる分の画面下端オフセット (px) を返す。
 * 値が 0 ならキーボード非表示、>0 ならその分だけ底面要素を上に押し上げる。
 */
export function useVisualViewport(): number {
  const [bottomInset, setBottomInset] = useState(0);

  useEffect(() => {
    const vv = window.visualViewport;
    if (!vv) return;
    const update = () => {
      const inset = window.innerHeight - vv.height - vv.offsetTop;
      setBottomInset(Math.max(0, inset));
    };
    vv.addEventListener('resize', update);
    vv.addEventListener('scroll', update);
    update();
    return () => {
      vv.removeEventListener('resize', update);
      vv.removeEventListener('scroll', update);
    };
  }, []);

  return bottomInset;
}
