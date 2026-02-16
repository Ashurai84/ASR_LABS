import { useState } from 'react';
import { useLabState } from './hooks/useLabState';
import { JournalStream } from './components/journal/JournalStream';
import { Book, PenTool, Database } from 'lucide-react';
import { ToolRegistry } from './components/tools/ToolRegistry';

function App() {
  const { labState, loading, error } = useLabState();
  const [view, setView] = useState<'journal' | 'tools' | 'notes'>('journal');
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);

  // Helper to enter project context
  const enterProject = (id: string) => {
    setSelectedProjectId(id);
    setView('journal');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black text-zinc-500 font-mono text-sm animate-pulse tracking-widest">
        INITIALIZING SEQUENCE...
      </div>
    );
  }

  if (error || !labState) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black text-red-500 font-mono text-sm border border-red-900/20 p-8 rounded-lg">
        SYSTEM FAILURE: {error || "State unreachable"}
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-black text-zinc-300 font-sans selection:bg-orange-900/30 selection:text-orange-200">

      {/* 1. Minimal Sidebar (Fixed) */}
      <nav className="w-64 fixed inset-y-0 left-0 border-r border-zinc-900/50 p-8 hidden md:flex flex-col justify-between bg-black/60 backdrop-blur-xl z-50">
        <div>
          {/* Brand */}
          <h1 className="text-sm font-mono tracking-[0.2em] text-zinc-500 mb-12 uppercase">
            ASR Lab <span className="text-emerald-500/50">●</span>
          </h1>

          {/* Navigation Links */}
          <div className="space-y-1">
            <button
              onClick={() => { setView('journal'); setSelectedProjectId(null); }}
              className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors flex items-center gap-3 font-medium tracking-wide ${view === 'journal' && !selectedProjectId ? 'text-white bg-zinc-900/50' : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900/30'}`}
            >
              <Book className="w-4 h-4 opacity-70" />
              Journal
            </button>
            <div className="pt-4 pb-2 px-3 text-[10px] font-mono uppercase tracking-widest text-zinc-600">Projects</div>
            {labState.projects.map(p => (
              <button
                key={p.id}
                onClick={() => enterProject(p.id)}
                className={`w-full text-left px-3 py-1.5 rounded-md text-sm transition-colors flex items-center gap-3 ${selectedProjectId === p.id ? 'text-orange-400 bg-orange-950/10' : 'text-zinc-500 hover:text-zinc-300'}`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${p.health.score > 80 ? 'bg-emerald-500/50' : 'bg-zinc-700'}`} />
                {p.name}
              </button>
            ))}
          </div>

          {/* Secondary Links */}
          <div className="mt-12 space-y-1 border-t border-zinc-900 pt-8">
            <button
              onClick={() => setView('notes')}
              className={`w-full text-left px-3 py-2 text-sm transition-colors flex items-center gap-3 ${view === 'notes' ? 'text-white' : 'text-zinc-600 hover:text-zinc-400'}`}
            >
              <PenTool className="w-4 h-4 opacity-50" />
              Notes
            </button>
            <button
              onClick={() => setView('tools')}
              className={`w-full text-left px-3 py-2 text-sm transition-colors flex items-center gap-3 ${view === 'tools' ? 'text-white' : 'text-zinc-600 hover:text-zinc-400'}`}
            >
              <Database className="w-4 h-4 opacity-50" />
              Tools
            </button>
          </div>
        </div>

        {/* Footer Status */}
        <div className="text-[10px] font-mono text-zinc-700 space-y-2">
          <div className="flex items-center justify-between">
            <span>HEALTH</span>
            <span className="text-emerald-500">98%</span>
          </div>
          <div className="flex items-center justify-between">
            <span>FOCUS</span>
            <span className="text-orange-500">HIGH</span>
          </div>
          <div className="pt-4 border-t border-zinc-900 text-zinc-800">
            v1.0.4 • {new Date().getFullYear()}
          </div>
        </div>
      </nav>

      {/* 2. Main Canvas (Scrollable) */}
      <main className="flex-1 md:ml-64 relative min-h-screen">
        <div className="max-w-3xl mx-auto px-6 md:px-12 w-full">
          {view === 'journal' && (
            <JournalStream
              events={Object.values(labState.timeline_events)}
              projects={labState.projects}
              selectedProjectId={selectedProjectId}
            />
          )}

          {view === 'tools' && (
            <ToolRegistry
              projects={labState.projects}
              onSelectProject={enterProject}
            />
          )}

          {view === 'notes' && (
            <div className="pt-32 pb-32 flex flex-col items-center justify-center text-zinc-600 space-y-4">
              <PenTool className="w-12 h-12 opacity-20" />
              <p className="font-mono text-sm uppercase tracking-widest opacity-50">Notes Module Coming Soon</p>
            </div>
          )}
        </div>
      </main>

    </div>
  );
}

export default App;
