import type { Editor } from '@tiptap/react';
import { ImageButton } from '../features/image/ImageButton';
import { VoiceButton } from '../features/voice/VoiceButton';

interface ToolbarButtonProps {
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  title: string;
  ariaLabel?: string;
  children: React.ReactNode;
}

function ToolbarButton({ onClick, active, disabled, title, ariaLabel, children }: ToolbarButtonProps) {
  return (
    <button
      type="button"
      onMouseDown={e => { e.preventDefault(); onClick(); }}
      disabled={disabled}
      title={title}
      aria-label={ariaLabel ?? title}
      aria-pressed={active}
      className={`min-w-11 min-h-11 sm:min-w-9 sm:min-h-9 px-2 flex items-center justify-center rounded-lg text-sm transition-colors
        ${active
          ? 'bg-accent-100 dark:bg-accent-700/30 text-accent-700 dark:text-accent-200'
          : 'text-paper-600 dark:text-paper-300 hover:bg-paper-200 dark:hover:bg-paper-700/40'
        }
        ${disabled ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer active:scale-95'}
      `}
    >
      {children}
    </button>
  );
}

function Divider() {
  return <div className="w-px h-6 bg-paper-300 dark:bg-paper-700 mx-0.5" aria-hidden="true" />;
}

interface Props {
  editor: Editor;
  onExport: () => void;
}

export function Toolbar({ editor, onExport }: Props) {
  return (
    <div
      role="toolbar"
      aria-label="書式設定ツールバー"
      className="flex items-center gap-0.5 px-3 py-2 border-t sm:border-t-0 sm:border-b border-paper-300/60 dark:border-paper-700/60 bg-paper-50 dark:bg-paper-900 sm:dark:bg-paper-900/40 overflow-x-auto toolbar-scroll shrink-0 scrollbar-none pb-[calc(env(safe-area-inset-bottom)+0.5rem)] sm:pb-2 shadow-paper sm:shadow-none"
    >
      {/* Headings */}
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        active={editor.isActive('heading', { level: 1 })}
        title="見出し1 (H1)"
      >
        <span className="font-bold text-xs">H1</span>
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        active={editor.isActive('heading', { level: 2 })}
        title="見出し2 (H2)"
      >
        <span className="font-bold text-xs">H2</span>
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        active={editor.isActive('heading', { level: 3 })}
        title="見出し3 (H3)"
      >
        <span className="font-bold text-xs">H3</span>
      </ToolbarButton>

      <Divider />

      {/* Text styles */}
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBold().run()}
        active={editor.isActive('bold')}
        title="太字 (Ctrl+B)"
      >
        <strong>B</strong>
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleItalic().run()}
        active={editor.isActive('italic')}
        title="斜体 (Ctrl+I)"
      >
        <em>I</em>
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleStrike().run()}
        active={editor.isActive('strike')}
        title="取り消し線"
      >
        <s>S</s>
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleCode().run()}
        active={editor.isActive('code')}
        title="インラインコード"
      >
        <span className="font-mono text-xs">{`<>`}</span>
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleHighlight().run()}
        active={editor.isActive('highlight')}
        title="ハイライト"
      >
        <span className="text-xs">HL</span>
      </ToolbarButton>

      <Divider />

      {/* Lists */}
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        active={editor.isActive('bulletList')}
        title="箇条書きリスト"
      >
        <span className="text-xs">≡</span>
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        active={editor.isActive('orderedList')}
        title="番号付きリスト"
      >
        <span className="text-xs">1≡</span>
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleTaskList().run()}
        active={editor.isActive('taskList')}
        title="チェックリスト"
      >
        <span className="text-xs">☑</span>
      </ToolbarButton>

      <Divider />

      {/* Image / Camera */}
      <ImageButton editor={editor} />

      {/* Voice */}
      <VoiceButton editor={editor} />

      <Divider />

      {/* Block elements */}
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        active={editor.isActive('blockquote')}
        title="引用"
      >
        <span className="text-sm">"</span>
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        active={editor.isActive('codeBlock')}
        title="コードブロック"
      >
        <span className="font-mono text-xs">{`{}`}</span>
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().setHorizontalRule().run()}
        title="区切り線"
      >
        <span className="text-xs">—</span>
      </ToolbarButton>

      <Divider />

      {/* Undo/Redo */}
      <ToolbarButton
        onClick={() => editor.chain().focus().undo().run()}
        disabled={!editor.can().undo()}
        title="元に戻す (Ctrl+Z)"
      >
        <span className="text-xs">↩</span>
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!editor.can().redo()}
        title="やり直し (Ctrl+Y)"
      >
        <span className="text-xs">↪</span>
      </ToolbarButton>

      <Divider />

      {/* Export */}
      <ToolbarButton
        onClick={onExport}
        title="Markdownでエクスポート (⌘⇧E)"
      >
        <span className="text-xs">↓md</span>
      </ToolbarButton>
    </div>
  );
}
