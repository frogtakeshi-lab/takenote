import { useRef, useState } from 'react';
import type { Editor } from '@tiptap/react';
import { v4 as uuidv4 } from 'uuid';
import { resizeImage } from './resizeImage';
import { saveImage } from './imageStore';

interface Props {
  editor: Editor;
}

export function ImageButton({ editor }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setBusy(true);
    try {
      for (const file of Array.from(files)) {
        if (!file.type.startsWith('image/')) continue;
        const blob = await resizeImage(file);
        const id = uuidv4();
        await saveImage(id, blob);
        editor.chain().focus().insertContent({
          type: 'image',
          attrs: { refId: id, alt: file.name },
        }).run();
      }
    } catch (e) {
      console.error('画像の処理に失敗', e);
      alert('画像を読み込めませんでした');
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={busy}
        title="画像を挿入 (カメラまたは写真)"
        aria-label="画像を挿入"
        className={`min-w-11 min-h-11 sm:min-w-9 sm:min-h-9 px-2 flex items-center justify-center rounded-lg text-sm transition-colors text-paper-600 dark:text-paper-300 hover:bg-paper-200 dark:hover:bg-paper-700/40 active:scale-95
          ${busy ? 'opacity-40 cursor-wait' : 'cursor-pointer'}`}
      >
        {busy ? (
          <svg width="16" height="16" viewBox="0 0 16 16" className="animate-spin" aria-hidden="true">
            <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.5" fill="none" strokeDasharray="22 12" strokeLinecap="round" />
          </svg>
        ) : (
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
            <rect x="2" y="3.5" width="14" height="11" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
            <circle cx="6" cy="7.5" r="1.25" fill="currentColor"/>
            <path d="M2.5 13l4-3.5 3 2.5 2-1.5 4 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        )}
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        multiple
        onChange={e => handleFiles(e.target.files)}
        className="sr-only"
        aria-hidden="true"
      />
    </>
  );
}
