import { useEffect, useState } from 'react';
import { NodeViewWrapper, type NodeViewProps } from '@tiptap/react';
import { loadImage } from './imageStore';

export function StoredImage({ node }: NodeViewProps) {
  const refId = node.attrs.refId as string | null;
  const fallbackSrc = node.attrs.src as string | undefined;
  const alt = (node.attrs.alt as string | undefined) ?? '添付画像';
  const [url, setUrl] = useState<string | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let revoke: string | null = null;
    let cancelled = false;
    if (refId) {
      loadImage(refId)
        .then(blob => {
          if (cancelled) return;
          if (!blob) { setError(true); return; }
          revoke = URL.createObjectURL(blob);
          setUrl(revoke);
        })
        .catch(() => !cancelled && setError(true));
    } else if (fallbackSrc) {
      setUrl(fallbackSrc);
    }
    return () => {
      cancelled = true;
      if (revoke) URL.revokeObjectURL(revoke);
    };
  }, [refId, fallbackSrc]);

  return (
    <NodeViewWrapper
      as="figure"
      className="my-3 rounded-xl overflow-hidden border border-paper-300/60 dark:border-paper-700/60 bg-paper-50 dark:bg-paper-900"
    >
      {error ? (
        <div className="p-4 text-sm text-paper-500 dark:text-paper-400 text-center">
          画像を読み込めませんでした
        </div>
      ) : url ? (
        <img src={url} alt={alt} className="block max-w-full h-auto mx-auto" />
      ) : (
        <div className="p-8 text-sm text-paper-500 dark:text-paper-400 text-center">
          読み込み中…
        </div>
      )}
    </NodeViewWrapper>
  );
}
