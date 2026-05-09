import { useRef } from 'react';
import { useTheme } from './hooks/useTheme';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import { Sidebar } from './components/Sidebar';
import { Editor } from './components/Editor';

function App() {
  useTheme();
  const searchRef = useRef<HTMLInputElement>(null);
  useKeyboardShortcuts({ searchRef });

  return (
    <div className="flex h-screen w-screen bg-white dark:bg-gray-900 overflow-hidden">
      <Sidebar searchRef={searchRef} />
      <main className="flex-1 flex overflow-hidden">
        <Editor />
      </main>
    </div>
  );
}

export default App;
