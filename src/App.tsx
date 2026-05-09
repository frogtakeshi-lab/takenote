import { useTheme } from './hooks/useTheme';
import { Sidebar } from './components/Sidebar';
import { Editor } from './components/Editor';

function App() {
  useTheme();

  return (
    <div className="flex h-screen w-screen bg-white dark:bg-gray-900 overflow-hidden">
      <Sidebar />
      <main className="flex-1 flex overflow-hidden">
        <Editor />
      </main>
    </div>
  );
}

export default App;
