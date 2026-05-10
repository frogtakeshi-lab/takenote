import { AnimatePresence, motion } from 'framer-motion';
import { useEffect } from 'react';
import { usePreferences, type FontScale } from './usePreferences';
import { useNoteStore } from '../../store/useNoteStore';

interface Props {
  open: boolean;
  onClose: () => void;
}

const FONT_SIZES: Array<{ value: FontScale; label: string }> = [
  { value: 'sm', label: '小' },
  { value: 'base', label: '標準' },
  { value: 'lg', label: '大' },
  { value: 'xl', label: '特大' },
];

const THEMES: Array<{ value: 'light' | 'dark' | 'system'; label: string; icon: string }> = [
  { value: 'light', label: 'ライト', icon: '☀️' },
  { value: 'dark', label: 'ダーク', icon: '🌙' },
  { value: 'system', label: 'システム', icon: '🖥️' },
];

export function SettingsSheet({ open, onClose }: Props) {
  const { fontScale, paperTexture, voiceLang, hapticsEnabled,
          setFontScale, setPaperTexture, setVoiceLang, setHapticsEnabled } = usePreferences();
  const theme = useNoteStore(s => s.theme);
  const setTheme = useNoteStore(s => s.setTheme);

  useEffect(() => {
    if (!open) return;
    function onEsc(e: KeyboardEvent) { if (e.key === 'Escape') onClose(); }
    document.addEventListener('keydown', onEsc);
    return () => document.removeEventListener('keydown', onEsc);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 bg-paper-900/50 z-50"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            aria-hidden="true"
          />
          <motion.div
            role="dialog"
            aria-label="設定"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 320, damping: 30 }}
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.4 }}
            onDragEnd={(_, info) => { if (info.offset.y > 100) onClose(); }}
            className="fixed inset-x-0 bottom-0 z-50 max-h-[85vh] overflow-y-auto bg-paper-50 dark:bg-paper-900 rounded-t-2xl shadow-paper-lg pb-[calc(env(safe-area-inset-bottom)+1rem)]"
          >
            <div className="flex justify-center pt-2 pb-1" aria-hidden="true">
              <div className="w-10 h-1.5 rounded-full bg-paper-300 dark:bg-paper-700" />
            </div>
            <div className="px-4 py-2 flex items-center justify-between border-b border-paper-300/60 dark:border-paper-700/60">
              <h2 className="text-base font-semibold text-paper-700 dark:text-paper-100">設定</h2>
              <button
                type="button"
                onClick={onClose}
                aria-label="設定を閉じる"
                className="min-w-9 min-h-9 flex items-center justify-center rounded-lg hover:bg-paper-200 dark:hover:bg-paper-700/40 active:scale-95"
              >
                ×
              </button>
            </div>

            <div className="p-2 space-y-1">
              {/* テーマ */}
              <SettingRow label="テーマ">
                <SegmentedControl
                  value={theme}
                  options={THEMES.map(t => ({ value: t.value, label: `${t.icon} ${t.label}` }))}
                  onChange={(v) => setTheme(v as typeof theme)}
                />
              </SettingRow>

              {/* フォントサイズ */}
              <SettingRow label="文字サイズ">
                <SegmentedControl
                  value={fontScale}
                  options={FONT_SIZES.map(f => ({ value: f.value, label: f.label }))}
                  onChange={(v) => setFontScale(v as FontScale)}
                />
              </SettingRow>

              {/* 紙テクスチャ */}
              <SettingRow label="紙テクスチャ" description="背景に微細な紙の質感を加える">
                <Toggle checked={paperTexture} onChange={setPaperTexture} ariaLabel="紙テクスチャ" />
              </SettingRow>

              {/* ハプティクス */}
              <SettingRow label="バイブレーション" description="削除や長押しの触覚フィードバック">
                <Toggle checked={hapticsEnabled} onChange={setHapticsEnabled} ariaLabel="バイブレーション" />
              </SettingRow>

              {/* 音声入力言語 */}
              <SettingRow label="音声入力の言語">
                <SegmentedControl
                  value={voiceLang}
                  options={[
                    { value: 'ja-JP', label: '日本語' },
                    { value: 'en-US', label: 'English' },
                  ]}
                  onChange={(v) => setVoiceLang(v as 'ja-JP' | 'en-US')}
                />
              </SettingRow>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function SettingRow({ label, description, children }: { label: string; description?: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3 px-3 py-3 min-h-14 rounded-xl">
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-paper-700 dark:text-paper-100">{label}</p>
        {description && <p className="text-xs text-paper-500 dark:text-paper-400 mt-0.5">{description}</p>}
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}

function Toggle({ checked, onChange, ariaLabel }: { checked: boolean; onChange: (b: boolean) => void; ariaLabel: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={ariaLabel}
      onClick={() => onChange(!checked)}
      className={`relative w-12 h-7 rounded-full transition-colors active:scale-95
        ${checked ? 'bg-accent-500' : 'bg-paper-300 dark:bg-paper-700'}`}
    >
      <span
        className={`absolute top-0.5 w-6 h-6 bg-paper-50 rounded-full shadow transition-transform
          ${checked ? 'translate-x-5' : 'translate-x-0.5'}`}
      />
    </button>
  );
}

function SegmentedControl<T extends string>({ value, options, onChange }: {
  value: T;
  options: Array<{ value: T; label: string }>;
  onChange: (v: T) => void;
}) {
  return (
    <div className="inline-flex bg-paper-200 dark:bg-paper-800 rounded-lg p-0.5">
      {options.map(opt => (
        <button
          key={opt.value}
          type="button"
          aria-pressed={value === opt.value}
          onClick={() => onChange(opt.value)}
          className={`px-3 h-8 text-xs font-medium rounded-md transition-colors active:scale-95
            ${value === opt.value
              ? 'bg-paper-50 dark:bg-paper-900 text-paper-700 dark:text-paper-100 shadow-sm'
              : 'text-paper-500 dark:text-paper-400 hover:text-paper-700 dark:hover:text-paper-100'}`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
