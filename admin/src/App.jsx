import React, { useState, useEffect } from 'react';
import { Folder, PenTool, Database, User, Save, Plus, Layout, RefreshCw, CheckCircle2 } from 'lucide-react';
import { ProjectEditor } from './ui/ProjectEditor';
import { NoteEditor } from './ui/NoteEditor';
import { ToolsEditor } from './ui/ToolsEditor';
import { ProfileEditor } from './ui/ProfileEditor';

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

function App() {
    const [view, setView] = useState('projects'); // projects | notes | tools | profile | editor | note-editor
    const [data, setData] = useState({ projects: [], notes: [], tools: [], profile: {} });
    const [loading, setLoading] = useState(true);
    const [isPublishing, setIsPublishing] = useState(false);

    // Editor State
    const [activeFile, setActiveFile] = useState(null); // { type: 'project' | 'note', id: 'filename', ... }

    useEffect(() => {
        fetchStructure();
    }, []);

    const fetchStructure = async () => {
        try {
            console.log("[App] Fetching structure...");
            const res = await fetch('/api/structure');
            const json = await res.json();
            console.log("[App] Structure loaded:", json);
            setData(json);
            setLoading(false);
        } catch (e) {
            console.error("[App] Fetch structure failed", e);
            setLoading(false);
        }
    };

    const publishLive = async () => {
        setIsPublishing(true);
        console.log("[App] Triggering publish...");
        try {
            const res = await fetch('/api/publish', { method: 'POST' });
            if (res.ok) {
                console.log("[App] Finalised Live Publish");
                alert("Successfully Published Live!");
            } else {
                if (res.status === 404) {
                    alert("Publish API not found (404). Please RESTART your admin server to pick up new code.");
                } else {
                    alert("Publish failed. Check console mapping.");
                }
            }
        } catch (e) {
            console.error("[App] Publish error", e);
            alert("Publish error.");
        } finally {
            setIsPublishing(false);
        }
    };

    /* --- Projects --- */
    const loadProject = async (slug) => {
        const res = await fetch(`/api/project/${slug}`);
        const { meta, timeline, caseStudy } = await res.json();
        setActiveFile({ type: 'project', id: slug, meta, timeline, caseStudy });
        setView('editor');
    };

    const saveProject = async (slug, meta, timeline, caseStudy) => {
        try {
            await fetch('/api/project', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ slug, meta, timeline, caseStudy })
            });
            await fetchStructure();
            setView('projects');
        } catch (e) { alert("Save failed."); }
    };

    const deleteProject = async (slug) => {
        if (!slug) return;
        if (!confirm(`Permanently delete project "${slug}" and all its logs?`)) return;
        try {
            const res = await fetch(`/api/project/${slug}`, { method: 'DELETE' });
            if (res.ok) {
                await fetchStructure();
                setView('projects');
            } else {
                alert("Delete failed on server.");
            }
        } catch (e) {
            console.error(e);
            alert("Delete network error.");
        }
    };

    /* --- Notes --- */
    const loadNote = async (filename) => {
        const res = await fetch(`/api/note/${filename}`);
        const { content } = await res.json();
        setActiveFile({ type: 'note', id: filename, content });
        setView('note-editor');
    };

    const saveNote = async (filename, content) => {
        try {
            await fetch('/api/note', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ filename, content })
            });
            await fetchStructure();
            setView('notes');
        } catch (e) { alert("Save failed."); }
    };

    const deleteNote = async (filename) => {
        if (!filename) return;
        if (!confirm(`Delete ${filename}?`)) return;
        try {
            const res = await fetch(`/api/note/${filename}`, { method: 'DELETE' });
            if (res.ok) {
                await fetchStructure();
                setView('notes');
            } else {
                alert("Delete failed on server.");
            }
        } catch (e) {
            console.error(e);
            alert("Delete network error.");
        }
    };

    /* --- Tools & Profile --- */
    const saveData = async (type, payload) => {
        console.log(`[App] Saving ${type}:`, payload);
        try {
            const res = await fetch(`/api/data/${type}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            console.log(`[App] ${type} save response:`, res.status);
            await fetchStructure();
            alert(`${type.toUpperCase()} updated.`);
        } catch (e) {
            console.error(`[App] Save ${type} failed`, e);
            alert("Update failed.");
        }
    };

    if (loading) return <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-zinc-600 font-mono text-xs uppercase tracking-widest">Initialising Workspace...</div>;

    return (
        <div className="flex min-h-screen bg-zinc-950 text-zinc-300 font-sans selection:bg-orange-900/40">

            {/* Sidebar (Only if not in focused editor) */}
            {(view !== 'note-editor' && view !== 'editor') && (
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

                    <div className="mt-auto">
                        <div className="px-3 pb-2 border-t border-zinc-900 pt-4">
                            <div className="text-[10px] text-zinc-600 font-mono">
                                v1.2.5 • Server: {data?.serverStart ? new Date(data.serverStart).toLocaleTimeString() : 'Unknown'}
                            </div>
                        </div>
                    </div>
                </nav>
            )}

            {/* Main Canvas */}
            <main className="flex-1 flex flex-col min-w-0">

                {/* View: Project List */}
                {view === 'projects' && (
                    <div className="p-8 max-w-4xl animate-in fade-in duration-500">
                        <div className="flex justify-between items-center mb-8">
                            <h1 className="text-2xl font-semibold text-white tracking-tight">Project Registry</h1>
                            <button onClick={() => { setActiveFile(null); setView('editor'); }} className="bg-white text-black px-4 py-2 rounded-md text-sm font-medium hover:bg-zinc-200 flex items-center gap-2 transition-colors">
                                <Plus className="w-4 h-4" /> New Module
                            </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {data.projects.map(slug => (
                                <button key={slug} onClick={() => loadProject(slug)} className="group text-left p-6 rounded-xl border border-zinc-900 bg-zinc-900/10 hover:bg-zinc-900 hover:border-zinc-700 transition-all">
                                    <h3 className="text-lg font-medium text-zinc-200 mb-1 group-hover:text-white">{slug}</h3>
                                    <div className="text-xs text-zinc-500 font-mono">/content/projects/{slug}</div>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* View: Notes List */}
                {view === 'notes' && (
                    <div className="p-8 max-w-4xl animate-in fade-in duration-500">
                        <div className="flex justify-between items-center mb-8">
                            <h1 className="text-2xl font-semibold text-white tracking-tight">Neural Vault</h1>
                            <button onClick={() => { setActiveFile(null); setView('note-editor'); }} className="bg-white text-black px-4 py-2 rounded-md text-sm font-medium hover:bg-zinc-200 flex items-center gap-2 transition-colors">
                                <Plus className="w-4 h-4" /> New Entry
                            </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {data.notes.map(filename => (
                                <button key={filename} onClick={() => loadNote(filename)} className="group text-left p-6 rounded-xl border border-zinc-900 bg-zinc-900/10 hover:bg-zinc-900 hover:border-zinc-700 transition-all">
                                    <h3 className="text-lg font-medium text-zinc-200 mb-1 group-hover:text-white truncate">{filename}</h3>
                                    <div className="text-xs text-zinc-500 font-mono">/content/notes/{filename}</div>
                                </button>
                            ))}
                            {data.notes.length === 0 && (
                                <div className="col-span-2 py-20 text-center text-zinc-700 border border-dashed border-zinc-900 rounded-2xl font-mono text-xs uppercase tracking-[0.4em]">
                                    Vault Empty
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* View: Tools Stack */}
                {view === 'tools' && (
                    <ToolsEditor tools={data.tools} onSave={(payload) => saveData('tools', payload)} />
                )}

                {/* View: Profile */}
                {view === 'profile' && (
                    <ProfileEditor profile={data.profile} onSave={(payload) => saveData('profile', payload)} />
                )}

                {/* View: Note Editor (Focused) */}
                {view === 'note-editor' && (
                    <NoteEditor
                        note={activeFile?.type === 'note' ? activeFile : null}
                        onSave={saveNote}
                        onCancel={() => setView('notes')}
                        onDelete={() => deleteNote(activeFile.id)}
                    />
                )}

                {/* View: Project Editor (Focused) */}
                {view === 'editor' && (
                    <ProjectEditor
                        project={activeFile?.type === 'project' ? activeFile : null}
                        onSave={saveProject}
                        onCancel={() => setView('projects')}
                        onDelete={deleteProject}
                    />
                )}

            </main>
        </div>
    );
}

export default App;
