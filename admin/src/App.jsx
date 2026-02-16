import React, { useState, useEffect } from 'react';
import { Folder, PenTool, Database, User, Save, Plus, ArrowRight, Layout } from 'lucide-react';

/* --- Components --- */

const SidebarItem = ({ icon: Icon, label, active, onClick }) => (
    <button
        onClick={onClick}
        className={`w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-all ${active
                ? 'bg-zinc-800 text-white shadow-sm'
                : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50'
            }`}
    >
        <Icon className="w-4 h-4" />
        {label}
    </button>
);

/* --- Main App --- */

function App() {
    const [view, setView] = useState('projects'); // projects | notes | tools | profile
    const [data, setData] = useState({ projects: [], notes: [], tools: [], profile: {} });
    const [loading, setLoading] = useState(true);

    // Editor State
    const [activeFile, setActiveFile] = useState(null); // { type: 'project', id: 'slug' }
    const [editorContent, setEditorContent] = useState(''); // current text
    const [editorMeta, setEditorMeta] = useState(''); // for project meta

    useEffect(() => {
        fetchStructure();
    }, []);

    const fetchStructure = async () => {
        try {
            const res = await fetch('/api/structure');
            const json = await res.json();
            setData(json);
            setLoading(false);
        } catch (e) { console.error(e); }
    };

    const loadProject = async (slug) => {
        const res = await fetch(`/api/project/${slug}`);
        const { meta, timeline } = await res.json();
        setActiveFile({ type: 'project', id: slug });
        setEditorMeta(meta);
        setEditorContent(timeline); // We edit timeline primarily
        setView('editor');
    };

    const saveProject = async () => {
        if (!activeFile) return;
        await fetch('/api/project', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                slug: activeFile.id,
                meta: editorMeta,
                timeline: editorContent
            })
        });
        alert('Project Saved');
    };

    const createProject = async () => {
        const slug = prompt("Project Slug (e.g. asr-lab):");
        if (!slug) return;
        await fetch('/api/project', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ slug, meta: `# ${slug}\n`, timeline: '' })
        });
        await fetchStructure();
        loadProject(slug);
    };

    if (loading) return <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-zinc-600">Loading Workspace...</div>;

    return (
        <div className="flex min-h-screen bg-zinc-950 text-zinc-300 font-sans selection:bg-orange-900/40">

            {/* Sidebar */}
            <nav className="w-64 border-r border-zinc-900 p-4 flex flex-col gap-8 bg-zinc-950">
                <div>
                    <div className="px-3 mb-6 flex items-center gap-2 text-zinc-100 font-bold tracking-tight">
                        <Layout className="w-5 h-5 text-orange-500" />
                        ASR.ADMIN
                    </div>
                    <div className="space-y-1">
                        <SidebarItem icon={Folder} label="Projects" active={view === 'projects'} onClick={() => setView('projects')} />
                        <SidebarItem icon={PenTool} label="Notes" active={view === 'notes'} onClick={() => setView('notes')} />
                        <SidebarItem icon={Database} label="Tools" active={view === 'tools'} onClick={() => setView('tools')} />
                        <SidebarItem icon={User} label="Profile" active={view === 'profile'} onClick={() => setView('profile')} />
                    </div>
                </div>

                <div className="mt-auto px-3 pb-4 border-t border-zinc-900 pt-4">
                    <div className="text-[10px] text-zinc-600 font-mono">
                        Running locally on :3001
                    </div>
                </div>
            </nav>

            {/* Main Canvas */}
            <main className="flex-1 flex flex-col min-w-0">

                {/* View: Project List */}
                {view === 'projects' && (
                    <div className="p-8 max-w-4xl">
                        <div className="flex justify-between items-center mb-8">
                            <h1 className="text-2xl font-semibold text-white">Projects</h1>
                            <button onClick={createProject} className="bg-white text-black px-4 py-2 rounded-md text-sm font-medium hover:bg-zinc-200 flex items-center gap-2">
                                <Plus className="w-4 h-4" /> New Project
                            </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {data.projects.map(slug => (
                                <button key={slug} onClick={() => loadProject(slug)} className="group text-left p-6 rounded-lg border border-zinc-900 bg-zinc-900/30 hover:bg-zinc-900 hover:border-zinc-700 transition-all">
                                    <h3 className="text-lg font-medium text-zinc-200 mb-1 group-hover:text-white">{slug}</h3>
                                    <div className="text-xs text-zinc-500 font-mono">/content/projects/{slug}</div>
                                </button>
                            ))}
                            {data.projects.length === 0 && (
                                <div className="col-span-2 py-12 text-center text-zinc-600 border border-dashed border-zinc-900 rounded-lg">
                                    No projects found. Create one.
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* View: Editor (Generic for Project) */}
                {view === 'editor' && activeFile && (
                    <div className="flex-1 flex flex-col h-screen">
                        {/* Editor Toolbar */}
                        <header className="h-14 border-b border-zinc-900 flex items-center justify-between px-6 bg-zinc-950">
                            <div className="flex items-center gap-4 text-sm">
                                <button onClick={() => setView('projects')} className="text-zinc-500 hover:text-white font-mono">← Back</button>
                                <span className="text-zinc-700">/</span>
                                <span className="font-mono text-zinc-300">{activeFile.id}</span>
                            </div>
                            <button onClick={saveProject} className="text-emerald-500 hover:text-emerald-400 text-sm font-mono flex items-center gap-2">
                                <Save className="w-4 h-4" /> Save Changes
                            </button>
                        </header>

                        {/* Split Pane Editor */}
                        <div className="flex-1 flex overflow-hidden">
                            <div className="w-1/2 border-r border-zinc-900 flex flex-col">
                                <div className="bg-zinc-900/50 px-4 py-2 text-xs font-mono text-zinc-500 uppercase tracking-widest">Metadata (project.md)</div>
                                <textarea
                                    className="flex-1 bg-zinc-950 p-6 focus:outline-none font-mono text-sm leading-relaxed resize-none text-zinc-400"
                                    value={editorMeta}
                                    onChange={(e) => setEditorMeta(e.target.value)}
                                    spellCheck={false}
                                />
                            </div>
                            <div className="w-1/2 flex flex-col">
                                <div className="bg-zinc-900/50 px-4 py-2 text-xs font-mono text-zinc-500 uppercase tracking-widest">Timeline (timeline.md)</div>
                                <textarea
                                    className="flex-1 bg-zinc-950 p-6 focus:outline-none font-mono text-sm leading-relaxed resize-none text-zinc-300"
                                    value={editorContent}
                                    onChange={(e) => setEditorContent(e.target.value)}
                                    placeholder="- date: 2024-01-01..."
                                    spellCheck={false}
                                />
                            </div>
                        </div>
                    </div>
                )}

                {/* Placeholder Views */}
                {(view === 'notes' || view === 'tools' || view === 'profile') && (
                    <div className="flex flex-col items-center justify-center flex-1 text-zinc-600">
                        <Database className="w-12 h-12 mb-4 opacity-20" />
                        <p>Module under construction.</p>
                    </div>
                )}

            </main>
        </div>
    );
}

export default App;
