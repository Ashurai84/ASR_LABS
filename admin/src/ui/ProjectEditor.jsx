import React, { useState, useEffect } from 'react';
import { Save, X, Plus, Trash2, ArrowRight, Github, ExternalLink, Tag, RefreshCw } from 'lucide-react';

const parseFrontmatter = (text) => {
    const regex = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/;
    const match = text?.match(regex);
    if (!match) return { data: {}, content: text || '' };

    const yaml = match[1];
    const content = match[2];
    const data = {};

    yaml.split('\n').forEach(line => {
        const [key, ...val] = line.split(':');
        if (key && val.length) {
            let value = val.join(':').trim();
            // Handle arrays like tags: ["tag1", "tag2"]
            if (value.startsWith('[') && value.endsWith(']')) {
                data[key.trim()] = value.slice(1, -1).split(',').map(v => v.trim().replace(/^["']|["']$/g, ''));
            } else {
                data[key.trim()] = value.replace(/^["']|["']$/g, '');
            }
        }
    });

    return { data, content };
};

const stringifyFrontmatter = (data, content) => {
    const yaml = Object.entries(data).map(([key, val]) => {
        if (Array.isArray(val)) {
            return `${key}: [${val.map(v => `"${v}"`).join(', ')}]`;
        }
        return `${key}: "${val}"`;
    }).join('\n');
    return `---\n${yaml}\n---\n\n${content}`;
};

export const ProjectEditor = ({ project, onSave, onCancel, onDelete }) => {
    const [meta, setMeta] = useState({
        name: '',
        slug: '',
        status: 'active',
        github: '',
        demo: '',
        tags: [],
        description: '',
        published: 'false'
    });

    const [timelineMarkdown, setTimelineMarkdown] = useState('');
    const [remoteActivity, setRemoteActivity] = useState({ pulses: [], moderation: { hiddenDates: [] } });
    const [isScanning, setIsScanning] = useState(false);

    const [newEntry, setNewEntry] = useState({
        date: new Date().toISOString().split('T')[0],
        type: 'decision',
        title: '',
        description: '',
        outcome: ''
    });

    const [tagsInput, setTagsInput] = useState('');

    useEffect(() => {
        if (project) {
            const { data } = parseFrontmatter(project.meta);
            setMeta({
                name: data.name || '',
                slug: data.slug || project.id || '',
                status: data.status || 'active',
                github: data.github || '',
                demo: data.demo || '',
                tags: data.tags || [],
                description: data.description || '',
                published: data.published || 'false'
            });
            setTagsInput((data.tags || []).join(', '));
            setTimelineMarkdown(project.timeline || '');
            fetchRemoteActivity(project.id, data.github);
        }
    }, [project]);

    const fetchRemoteActivity = async (projectId = project?.id, githubUrl = meta.github) => {
        setIsScanning(true);
        try {
            // Include github URL in query if avaliable so new projects can preview
            const urlQuery = githubUrl ? `?url=${encodeURIComponent(githubUrl)}` : '';
            const res = await fetch(`/api/project/${projectId || 'new'}/activity${urlQuery}`);
            const data = await res.json();
            setRemoteActivity(data);
        } catch (e) {
            console.error("Failed to fetch activity", e);
        } finally {
            setIsScanning(false);
        }
    };

    const togglePulse = async (date) => {
        if (!project) {
            alert("Please save the project first before moderating activity.");
            return;
        }

        const currentHidden = remoteActivity.moderation?.hiddenDates || [];
        const nextHidden = currentHidden.includes(date)
            ? currentHidden.filter(d => d !== date)
            : [...currentHidden, date];

        const nextModeration = { ...remoteActivity.moderation, hiddenDates: nextHidden };

        try {
            await fetch(`/api/project/${project.id}/moderation`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(nextModeration)
            });
            setRemoteActivity({ ...remoteActivity, moderation: nextModeration });
        } catch (e) {
            alert("Failed to save moderation");
        }
    };

    const handleSave = (publishedOverride) => {
        const finalMeta = publishedOverride ? { ...meta, published: publishedOverride } : meta;
        // Clean up tags on save
        finalMeta.tags = tagsInput.split(',').map(t => t.trim()).filter(Boolean);
        const metaMarkdown = stringifyFrontmatter(finalMeta, '');
        onSave(meta.slug, metaMarkdown, timelineMarkdown);
    };

    const addTimelineEntry = () => {
        if (!newEntry.title) return;

        const entryMd = `
### ${newEntry.date} • ${newEntry.type.toUpperCase()}
**${newEntry.title}**
${newEntry.description}
${newEntry.outcome ? `\n> Outcome: ${newEntry.outcome}` : ''}
---
`;
        setTimelineMarkdown(prev => entryMd + prev);
        setNewEntry({
            date: new Date().toISOString().split('T')[0],
            type: 'decision',
            title: '',
            description: '',
            outcome: ''
        });
    };

    return (
        <div className="flex flex-col h-full bg-zinc-950 overflow-hidden">
            {/* Header */}
            <div className="h-14 border-b border-zinc-900 flex items-center justify-between px-6 bg-zinc-950/50 backdrop-blur-sm sticky top-0 z-20">
                <div className="flex items-center gap-4">
                    <button onClick={onCancel} className="p-2 hover:bg-zinc-900 rounded-md text-zinc-500 hover:text-white transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                    <div className="h-4 w-px bg-zinc-800" />
                    <span className="text-sm font-mono text-zinc-400">/projects/{meta.slug || 'new-project'}</span>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setMeta({ ...meta, published: meta.published === 'true' ? 'false' : 'true' })}
                        className={`mr-4 flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-mono border transition-all ${meta.published === 'true' ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-500' : 'bg-zinc-900 border-zinc-800 text-zinc-600'}`}
                    >
                        <div className={`w-1.5 h-1.5 rounded-full ${meta.published === 'true' ? 'bg-emerald-500' : 'bg-zinc-700'}`} />
                        {meta.published === 'true' ? 'PUBLISHED' : 'DRAFT'}
                    </button>
                    {project && (
                        <button onClick={() => onDelete(project.id)} className="p-2 hover:bg-red-950/30 text-zinc-600 hover:text-red-500 rounded-md transition-colors mr-2">
                            <Trash2 className="w-4 h-4" />
                        </button>
                    )}

                    <button
                        onClick={async () => {
                            await handleSave('true');
                            const res = await fetch('/api/publish', { method: 'POST' });
                            if (res.ok) alert("Project Saved & Published Live!");
                        }}
                        className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded-md text-sm font-bold transition-all shadow-lg shadow-blue-900/40 flex items-center gap-2 active:scale-95"
                    >
                        <Save className="w-4 h-4" /> SAVE & PUBLISH
                    </button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto">
                <div className="max-w-6xl mx-auto px-6 py-10 grid grid-cols-1 lg:grid-cols-2 gap-12">

                    {/* Left: Metadata Form */}
                    <div className="space-y-8">
                        <div>
                            <h2 className="text-xs font-mono text-zinc-500 uppercase tracking-[0.3em] mb-4">Project Identity</h2>
                            <div className="space-y-4">
                                <input
                                    type="text"
                                    value={meta.name}
                                    onChange={e => setMeta({ ...meta, name: e.target.value })}
                                    placeholder="Project Name"
                                    className="w-full bg-transparent text-3xl font-bold text-white placeholder:text-zinc-800 focus:outline-none"
                                />
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-mono text-zinc-600 uppercase">Slug</label>
                                        <input
                                            disabled={!!project}
                                            type="text"
                                            value={meta.slug}
                                            onChange={e => setMeta({ ...meta, slug: e.target.value.toLowerCase().replace(/[^a-z0-9]/g, '-') })}
                                            className="w-full bg-zinc-900/50 border border-zinc-900 px-3 py-2 rounded text-zinc-400 focus:border-zinc-700 outline-none font-mono text-xs"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-mono text-zinc-600 uppercase">Status</label>
                                        <select
                                            value={meta.status}
                                            onChange={e => setMeta({ ...meta, status: e.target.value })}
                                            className="w-full bg-zinc-900/50 border border-zinc-900 px-3 py-2 rounded text-zinc-400 focus:border-zinc-700 outline-none font-mono text-xs appearance-none"
                                        >
                                            <option value="active">ACTIVE</option>
                                            <option value="archived">ARCHIVED</option>
                                            <option value="paused">PAUSED</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h2 className="text-xs font-mono text-zinc-500 uppercase tracking-[0.3em]">External Context</h2>
                            <div className="grid grid-cols-1 gap-4">
                                <div className="flex items-center gap-3 bg-zinc-900/30 p-2 rounded border border-zinc-900/50 focus-within:border-zinc-800">
                                    <Github className="w-4 h-4 text-zinc-600" />
                                    <input
                                        type="text"
                                        value={meta.github}
                                        onChange={e => setMeta({ ...meta, github: e.target.value })}
                                        placeholder="GitHub Repository URL"
                                        className="flex-1 bg-transparent border-none outline-none text-xs font-mono text-zinc-400"
                                    />
                                </div>
                                <div className="flex items-center gap-3 bg-zinc-900/30 p-2 rounded border border-zinc-900/50 focus-within:border-zinc-800">
                                    <ExternalLink className="w-4 h-4 text-zinc-600" />
                                    <input
                                        type="text"
                                        value={meta.demo}
                                        onChange={e => setMeta({ ...meta, demo: e.target.value })}
                                        placeholder="Live Demo URL"
                                        className="flex-1 bg-transparent border-none outline-none text-xs font-mono text-zinc-400"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h2 className="text-xs font-mono text-zinc-500 uppercase tracking-[0.3em]">Documentation</h2>
                            <textarea
                                value={meta.description}
                                onChange={e => setMeta({ ...meta, description: e.target.value })}
                                placeholder="Core project mission and technical overview..."
                                className="w-full bg-zinc-900/30 border border-zinc-900 rounded p-4 text-sm leading-relaxed text-zinc-400 focus:border-zinc-800 outline-none h-32 resize-none font-serif"
                            />

                            <div className="space-y-2">
                                <label className="text-[10px] font-mono text-zinc-600 uppercase">Tags (comma separated)</label>
                                <input
                                    type="text"
                                    value={tagsInput}
                                    onChange={e => {
                                        setTagsInput(e.target.value);
                                    }}
                                    className="w-full bg-zinc-900/50 border border-zinc-900 px-3 py-2 rounded text-zinc-400 focus:border-zinc-700 outline-none font-mono text-xs"
                                    placeholder="react, typescript, rust..."
                                />
                            </div>
                        </div>
                    </div>

                    {/* Right: Timeline Management */}
                    <div className="space-y-8 flex flex-col h-full">
                        <div className="bg-zinc-900/20 border border-zinc-900 rounded-lg overflow-hidden">
                            <div className="bg-zinc-900/40 px-4 py-2 border-b border-zinc-900 flex items-center justify-between">
                                <h3 className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest">New Timeline Entry</h3>
                                <button
                                    onClick={addTimelineEntry}
                                    className="text-emerald-500 hover:text-emerald-400 text-[10px] font-bold uppercase tracking-tighter flex items-center gap-1"
                                >
                                    <Plus className="w-3 h-3" /> Append to Log
                                </button>
                            </div>
                            <div className="p-4 space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <input
                                        type="date"
                                        value={newEntry.date}
                                        onChange={e => setNewEntry({ ...newEntry, date: e.target.value })}
                                        className="bg-zinc-950 border border-zinc-800 rounded px-2 py-1 text-xs font-mono text-zinc-400"
                                    />
                                    <select
                                        value={newEntry.type}
                                        onChange={e => setNewEntry({ ...newEntry, type: e.target.value })}
                                        className="bg-zinc-950 border border-zinc-800 rounded px-2 py-1 text-xs font-mono text-zinc-400"
                                    >
                                        <option value="decision">DECISION</option>
                                        <option value="pulse">PULSE</option>
                                        <option value="ship">SHIP</option>
                                        <option value="milestone">MILESTONE</option>
                                    </select>
                                </div>
                                <input
                                    type="text"
                                    value={newEntry.title}
                                    onChange={e => setNewEntry({ ...newEntry, title: e.target.value })}
                                    placeholder="Entry Title (e.g. Migrated to Rust)"
                                    className="w-full bg-zinc-950 border border-zinc-800 rounded px-2 py-1.5 text-xs text-white"
                                />
                                <div className="space-y-2">
                                    <textarea
                                        value={newEntry.description}
                                        onChange={e => setNewEntry({ ...newEntry, description: e.target.value })}
                                        placeholder="Details/Rationale..."
                                        className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 text-xs text-zinc-400 h-20 resize-none"
                                    />
                                    <input
                                        type="text"
                                        value={newEntry.outcome}
                                        onChange={e => setNewEntry({ ...newEntry, outcome: e.target.value })}
                                        placeholder="Outcome (optional)..."
                                        className="w-full bg-zinc-950 border border-zinc-800 rounded px-2 py-1 text-[10px] font-mono italic text-zinc-500"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex-1 flex flex-col min-h-0">
                            <h3 className="text-xs font-mono text-zinc-500 uppercase tracking-[0.3em] mb-4">Timeline History</h3>
                            <textarea
                                value={timelineMarkdown}
                                onChange={e => setTimelineMarkdown(e.target.value)}
                                className="flex-1 bg-zinc-900/10 border border-zinc-900 rounded p-4 font-mono text-xs leading-relaxed text-zinc-500 focus:outline-none focus:border-zinc-800 overflow-y-auto"
                                spellCheck={false}
                            />
                        </div>

                        {/* Remote Activity Moderation */}
                        <div className="pt-6 border-t border-zinc-900">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-xs font-mono text-zinc-500 uppercase tracking-[0.3em]">Automated Activity</h3>
                                <button
                                    onClick={() => fetchRemoteActivity()}
                                    className={`text-[10px] font-mono text-zinc-600 hover:text-white flex items-center gap-2 ${isScanning ? 'animate-pulse' : ''}`}
                                >
                                    <RefreshCw className={`w-3 h-3 ${isScanning ? 'animate-spin' : ''}`} /> SCAN
                                </button>
                            </div>

                            <div className="space-y-2 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
                                {remoteActivity.pulses?.map(p => {
                                    const isHidden = remoteActivity.moderation?.hiddenDates?.includes(p.date);
                                    return (
                                        <div key={p.date} className="flex items-center justify-between p-2.5 rounded bg-zinc-900/40 border border-zinc-900 group hover:border-zinc-800 transition-colors">
                                            <div className="flex flex-col gap-0.5">
                                                <span className={`text-[11px] font-mono ${isHidden ? 'text-zinc-700 line-through' : 'text-zinc-400 font-bold'}`}>
                                                    {p.date} • {p.commits.length} commits
                                                </span>
                                                <span className="text-[10px] text-zinc-600 truncate max-w-[200px]">{p.commits[0]}</span>
                                            </div>
                                            <button
                                                onClick={() => togglePulse(p.date)}
                                                className={`px-2 py-1 rounded text-[10px] font-bold tracking-tighter transition-all ${isHidden ? 'bg-zinc-800 text-zinc-500 hover:text-emerald-500' : 'bg-emerald-900/20 text-emerald-500 hover:bg-emerald-500 hover:text-white'}`}
                                            >
                                                {isHidden ? 'SHOW' : 'HIDE'}
                                            </button>
                                        </div>
                                    );
                                })}
                                {(!remoteActivity.pulses || remoteActivity.pulses.length === 0) && (
                                    <div className="py-8 text-center border border-dashed border-zinc-900 rounded text-[10px] font-mono text-zinc-700 uppercase tracking-widest">
                                        No remote pulses found
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};
