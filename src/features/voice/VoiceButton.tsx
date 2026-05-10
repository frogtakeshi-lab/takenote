import { useEffect, useState } from 'react';
import type { Editor } from '@tiptap/react';
import { useSpeechRecognition } from './useSpeechRecognition';

interface Props {
  editor: Editor;
  lang?: string;
}

export function VoiceButton({ editor, lang = 'ja-JP' }: Props) {
  const [showHint, setShowHint] = useState(false);

  const { state, toggle, supported } = useSpeechRecognition({
    lang,
    onFinal: (text) => {
      editor.chain().focus().insertContent(text).run();
    },
  });

  // 権限拒否時のヒント自動表示
  useEffect(() => {
    if (state === 'denied' || state === 'error' || state === 'unsupported') {
      setShowHint(true);
      const t = setTimeout(() => setShowHint(false), 4000);
      return () => clearTimeout(t);
    }
  }, [state]);

  const listening = state === 'listening';
  const disabled = !supported;

  const label = listening
    ? '音声入力を停止'
    : disabled
      ? '音声入力 (このブラウザは未対応)'
      : '音声入力を開始';

  return (
    <div className="relative inline-flex">
      <button
        type="button"
        onClick={() => {
          if (disabled) {
            setShowHint(true);
            setTimeout(() => setShowHint(false), 4000);
            return;
          }
          toggle();
        }}
        title={label}
        aria-label={label}
        aria-pressed={listening}
        className={`min-w-11 min-h-11 sm:min-w-9 sm:min-h-9 px-2 flex items-center justify-center rounded-lg text-sm transition-colors active:scale-95
          ${listening
            ? 'bg-danger/20 text-danger animate-pulse'
            : 'text-paper-600 dark:text-paper-300 hover:bg-paper-200 dark:hover:bg-paper-700/40'}
          ${disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}
        `}
      >
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
          <rect x="6.5" y="2" width="5" height="9" rx="2.5" stroke="currentColor" strokeWidth="1.5" fill={listening ? 'currentColor' : 'none'}/>
          <path d="M3.5 9a5.5 5.5 0 0 0 11 0M9 14.5V17M6 17h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      </button>
      {showHint && (
        <div
          role="alert"
          className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-56 px-3 py-2 text-xs bg-paper-700 text-paper-50 dark:bg-paper-200 dark:text-paper-700 rounded-lg shadow-paper-lg z-50"
        >
          {state === 'unsupported' && 'このブラウザは音声入力に未対応です'}
          {state === 'denied' && 'マイクの利用が拒否されました。ブラウザ設定から許可してください'}
          {state === 'error' && '音声認識でエラーが発生しました'}
        </div>
      )}
    </div>
  );
}
