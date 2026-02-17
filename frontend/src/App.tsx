import { useState, useRef, useLayoutEffect } from 'react';
import { useLabState } from './hooks/useLabState';
import { JournalStream } from './components/journal/JournalStream';
import { Book, PenTool, Database } from 'lucide-react';
import { ToolRegistry } from './components/tools/ToolRegistry';

function App() {
  const { labState, loading, error } = useLabState();
  const [view, setView] = useState<'journal' | 'tools' | 'notes'>('journal');
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);

  // Persistent Scroll Registry
  const scrollRegistry = useRef<Record<string, number>>({});

  // Unique key for the current logical view context
  const viewKey = view === 'journal'
    ? (selectedProjectId ? `project-${selectedProjectId}` : 'journal-global')
    : view;

  // Scroll Restoration Logic
  useLayoutEffect(() => {
    if (loading) return;

    // 1. Restore scroll for the incoming view immediately
    const savedPosition = scrollRegistry.current[viewKey] || 0;

    // Tiny delay to ensure DOM is ready but before paint
    const timer = setTimeout(() => {
      window.scrollTo({ top: savedPosition, behavior: 'auto' });
    }, 0);

    return () => {
      // 2. Save scroll for the outgoing view before it unmounts
      scrollRegistry.current[viewKey] = window.scrollY;
      clearTimeout(timer);
    };
  }, [viewKey, loading]);

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
          <div className="mb-12">
            <h1 className="text-sm font-mono tracking-[0.2em] text-zinc-500 mb-1 uppercase select-none flex items-center gap-2">
              {labState.profile?.name || 'ASR Lab'} <span className="text-emerald-500/50 italic font-bold">●</span>
            </h1>
            <p className="text-[10px] text-zinc-600 font-mono leading-relaxed truncate">
              {labState.profile?.bio}
            </p>
          </div>

          {/* Navigation Links */}
          <div className="space-y-1">
            <button
              onClick={() => { setView('journal'); setSelectedProjectId(null); }}
              className={`w-full text-left px-3 py-2 rounded-md text-sm transition-all duration-200 flex items-center gap-3 font-medium tracking-wide ${view === 'journal' && !selectedProjectId ? 'text-white bg-zinc-900/50 shadow-sm shadow-black' : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900/30'}`}
            >
              <Book className="w-4 h-4 opacity-70" />
              Journal
            </button>
            <div className="pt-6 pb-2 px-3 text-[10px] font-mono uppercase tracking-[0.2em] text-zinc-600 select-none">Chapters</div>
            {labState.projects.map(p => (
              <button
                key={p.id}
                onClick={() => enterProject(p.id)}
                className={`w-full text-left px-3 py-1.5 rounded-md text-sm transition-all duration-200 flex items-center gap-3 ${selectedProjectId === p.id ? 'text-orange-400 bg-orange-950/10' : 'text-zinc-500 hover:text-zinc-300'}`}
              >
                <span className={`w-1.5 h-1.5 rounded-full transition-transform duration-300 ${selectedProjectId === p.id ? 'scale-125 bg-orange-500' : p.health.score > 80 ? 'bg-emerald-500/50' : 'bg-zinc-700'}`} />
                {p.name}
              </button>
            ))}
          </div>

          {/* Secondary Links */}
          <div className="mt-8 space-y-1 border-t border-zinc-900/50 pt-6">
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
              Artifacts
            </button>
          </div>

          {/* Vitals / Contact */}
          {(labState.profile?.github || labState.profile?.linkedin || labState.profile?.email) && (
            <div className="mt-8 space-y-1">
              <div className="px-3 pb-2 text-[10px] font-mono uppercase tracking-[0.2em] text-zinc-600 select-none">Vitals</div>
              {labState.profile.github && (
                <a href={labState.profile.github} target="_blank" rel="noreferrer" className="flex items-center gap-3 px-3 py-1.5 text-xs text-zinc-500 hover:text-zinc-300 transition-colors">
                  <div className="w-4 flex justify-center"><span className="text-[8px] font-mono opacity-40">GH</span></div>
                  GitHub
                </a>
              )}
              {labState.profile.linkedin && (
                <a href={labState.profile.linkedin} target="_blank" rel="noreferrer" className="flex items-center gap-3 px-3 py-1.5 text-xs text-zinc-500 hover:text-zinc-300 transition-colors">
                  <div className="w-4 flex justify-center"><span className="text-[8px] font-mono opacity-40">LI</span></div>
                  LinkedIn
                </a>
              )}
              {labState.profile.email && (
                <a href={`mailto:${labState.profile.email}`} className="flex items-center gap-3 px-3 py-1.5 text-xs text-zinc-500 hover:text-zinc-300 transition-colors">
                  <div className="w-4 flex justify-center"><span className="text-[8px] font-mono opacity-40">EM</span></div>
                  Email
                </a>
              )}
            </div>
          )}
        </div>

        {/* Footer Status */}
        <div className="text-[10px] font-mono text-zinc-700 space-y-2 select-none">
          <div className="flex items-center justify-between">
            <span>HEALTH</span>
            <span className="text-emerald-500 font-bold tracking-widest">{labState.derived.global_health}%</span>
          </div>
          <div className="flex items-center justify-between">
            <span>FOCUS</span>
            <span className="text-orange-500 font-bold uppercase tracking-widest">
              {labState.projects.find(p => p.id === labState.derived.current_focus_project_id)?.name || 'NONE'}
            </span>
          </div>
          <div className="pt-4 border-t border-zinc-900/50 text-zinc-800 flex justify-between">
            <span>v1.0.4 • {new Date().getFullYear()}</span>
            <span>{labState.profile?.name?.split(' ')[0].toUpperCase()}</span>
          </div>
        </div>
      </nav>

      {/* 2. Main Canvas (Persistent Container) */}
      <main className="flex-1 md:ml-64 relative min-h-screen">
        <div
          key={viewKey}
          className="max-w-3xl mx-auto px-6 md:px-12 w-full transition-opacity duration-300 animate-[fadeIn_0.3s_ease-out]"
        >
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
