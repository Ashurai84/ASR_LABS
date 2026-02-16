import { useState } from 'react';
import { useLabState } from './hooks/useLabState';
import { FocusModule } from './components/focus/FocusModule';
import { ProjectExplorer } from './components/project/ProjectList';
import { Terminal, Database } from 'lucide-react';

function App() {
  const { data, loading, error } = useLabState();
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-zinc-500 font-mono text-sm">Initializing Lab Environment...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-red-500">
        <p>System Failure: {error}</p>
      </div>
    );
  }

  const currentFocusProject = data.projects.find(p => p.id === data.derived.current_focus_project_id);

  return (
    <div className="min-h-screen bg-black text-zinc-300 font-sans selection:bg-emerald-500/30">

      {/* Header */}
      <header className="border-b border-zinc-900 sticky top-0 bg-black/80 backdrop-blur-md z-50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-zinc-900 rounded border border-zinc-800">
              <Terminal className="w-4 h-4 text-emerald-500" />
            </div>
            <span className="font-bold text-white tracking-tight">ASR Lab</span>
          </div>
          <div className="flex items-center gap-4 text-xs font-mono text-zinc-500">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              OPERATIONAL
            </span>
            <span className="opacity-50">v{data.meta.version}</span>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-12 space-y-16">

        {/* Section 1: Focus */}
        <section>
          <FocusModule
            project={currentFocusProject}
            globalHealth={data.derived.global_health}
          />
        </section>

        {/* Section 2: Explorer */}
        <section>
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Database className="w-5 h-5 text-zinc-600" />
              Project Registry
            </h2>
            <div className="text-xs text-zinc-500 font-mono">
              {data.projects.length} Active Modules
            </div>
          </div>

          <ProjectExplorer
            projects={data.projects}
            timeline={data.timeline_events}
            selectedProjectId={selectedProjectId}
            onSelectProject={setSelectedProjectId}
          />
        </section>

      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-900 mt-20 py-12 text-center">
        <p className="text-zinc-600 text-xs font-mono">
          Generated at {new Date(data.meta.generated_at).toISOString()}
        </p>
      </footer>
    </div>
  );
}

export default App;
