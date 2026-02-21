import { useState, useRef, useLayoutEffect } from 'react';
import { useLabState } from './hooks/useLabState';
import { JournalStream } from './components/journal/JournalStream';
import { Book, PenTool, Database, Github, Linkedin, Mail } from 'lucide-react';
import { ToolRegistry } from './components/tools/ToolRegistry';
import { NotesList } from './components/notes/NotesList';

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
      <div className="flex items-center justify-center min-h-screen bg-black text-[#6b7280] font-mono text-sm tracking-widest animate-pulse-subtle">
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
              className={`w-full text-left px-3 py-2 rounded-md text-[13px] transition-all duration-200 ease-out flex items-center gap-3 font-medium tracking-wide border border-transparent 
                ${view === 'journal' && !selectedProjectId
                  ? 'text-white bg-[#18181b] shadow-subtle border-[#27272a]'
                  : 'text-[#a1a1aa] hover:text-[#ededed] hover:bg-[#18181b]/50'}`}
            >
              <Book className={`w-4 h-4 transition-opacity duration-200 ${view === 'journal' && !selectedProjectId ? 'opacity-100' : 'opacity-50'}`} />
              Journal
            </button>
            <div className="pt-6 pb-2 px-3 text-[10px] font-mono uppercase tracking-[0.2em] text-zinc-600 select-none">Chapters</div>
            {labState.projects.map(p => (
              <button
                key={p.id}
                onClick={() => enterProject(p.id)}
                className={`w-full text-left px-3 py-1.5 rounded-md text-[13px] transition-all duration-200 ease-out flex items-center gap-3 group border border-transparent
                  ${selectedProjectId === p.id
                    ? 'text-white bg-[#18181b] shadow-subtle border-[#27272a]'
                    : 'text-[#85858b] hover:text-[#ededed] hover:bg-[#18181b]/30'}`}
              >
                <span className={`w-[6px] h-[6px] rounded-full transition-all duration-300 shadow-glow
                  ${selectedProjectId === p.id
                    ? 'scale-110 bg-[#ededed]'
                    : p.health.score > 80 ? 'bg-[#22c55e]/50 group-hover:bg-[#22c55e]' : 'bg-[#52525b] group-hover:bg-[#a1a1aa]'}`} />
                <span className="truncate">{p.name}</span>
              </button>
            ))}
          </div>

          {/* Secondary Links */}
          <div className="mt-8 space-y-1 border-t border-[#27272a] pt-6">
            <button
              onClick={() => { setView('notes'); setSelectedProjectId(null); }}
              className={`w-full text-left px-3 py-2 rounded-md text-[13px] transition-all duration-200 ease-out flex items-center gap-3 border border-transparent
                ${view === 'notes' ? 'text-white bg-[#18181b] shadow-subtle border-[#27272a]' : 'text-[#85858b] hover:text-[#ededed] hover:bg-[#18181b]/30'}`}
            >
              <PenTool className={`w-4 h-4 transition-opacity duration-200 ${view === 'notes' ? 'opacity-100' : 'opacity-40'}`} />
              Notes
            </button>
            <button
              onClick={() => { setView('tools'); setSelectedProjectId(null); }}
              className={`w-full text-left px-3 py-2 rounded-md text-[13px] transition-all duration-200 ease-out flex items-center gap-3 border border-transparent
                ${view === 'tools' ? 'text-white bg-[#18181b] shadow-subtle border-[#27272a]' : 'text-[#85858b] hover:text-[#ededed] hover:bg-[#18181b]/30'}`}
            >
              <Database className={`w-4 h-4 transition-opacity duration-200 ${view === 'tools' ? 'opacity-100' : 'opacity-40'}`} />
              Artifacts
            </button>
          </div>

          {/* Vitals / Contact */}
          {(labState.profile?.github || labState.profile?.linkedin || labState.profile?.email) && (
            <div className="mt-8 space-y-3">
              <div className="px-3 text-[10px] font-mono uppercase tracking-[0.2em] text-[#6b7280] select-none">Vitals</div>
              <div className="flex items-center gap-4 px-3">
                {labState.profile.github && (
                  <a href={labState.profile.github} target="_blank" title="GitHub" rel="noreferrer" className="text-[#3f3f46] hover:text-[#ffffff] transition-colors">
                    <Github className="w-4 h-4" />
                  </a>
                )}
                {labState.profile.linkedin && (
                  <a href={labState.profile.linkedin} target="_blank" title="LinkedIn" rel="noreferrer" className="text-[#3f3f46] hover:text-[#ffffff] transition-colors">
                    <Linkedin className="w-4 h-4" />
                  </a>
                )}
                {labState.profile.email && (
                  <a href={`mailto:${labState.profile.email}`} title="Email" className="text-[#3f3f46] hover:text-[#ffffff] transition-colors">
                    <Mail className="w-4 h-4" />
                  </a>
                )}
              </div>
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
          className={`mx-auto px-6 md:px-12 w-full transition-opacity duration-300 animate-[fadeIn_0.3s_ease-out] ${view === 'tools' ? 'max-w-6xl' : 'max-w-3xl'
            }`}
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
              tools={labState.tools || []}
            />
          )}

          {view === 'notes' && (
            <NotesList notes={labState.notes || []} />
          )}
        </div>
      </main>

    </div>
  );
}

export default App;
