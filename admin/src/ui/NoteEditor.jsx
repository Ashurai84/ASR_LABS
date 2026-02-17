import React, { useState, useEffect } from 'react';
import { marked } from 'marked';
import { Save, Eye, Edit3, Trash2, X } from 'lucide-react';

const parseFrontmatter = (text) => {
    const regex = /^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/;
    const match = text.match(regex);
    if (!match) return { data: {}, content: text };

    const yaml = match[1];
    const content = match[2];
    const data = {};

    yaml.split('\n').forEach(line => {
        const [key, ...val] = line.split(':');
        if (key && val.length) {
            data[key.trim()] = val.join(':').trim().replace(/^["']|["']$/g, '');
        }
    });

    return { data, content };
};

export const NoteEditor = ({ note, onSave, onCancel, onDelete }) => {
    const [title, setTitle] = useState('');
    const [slug, setSlug] = useState('');
    const [content, setContent] = useState('');
    const [published, setPublished] = useState(false);
    const [mode, setMode] = useState('edit'); // edit | preview

    useEffect(() => {
        if (note) {
            try {
                const { data, content: body } = parseFrontmatter(note.content);
                setTitle(data.title || '');
                setSlug(data.slug || note.filename.replace('.md', ''));
                setContent(body || '');
                setPublished(data.published === 'true');
            } catch (e) {
                console.error("Error parsing note", e);
                setContent(note.content);
            }
        }
    }, [note]);

    const handleTitleChange = (e) => {
        const val = e.target.value;
        setTitle(val);
        if (!note) { // Only auto-slug for new notes
            setSlug(val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''));
        }
    };

    const handleSave = (publishedOverride) => {
        const isPublished = publishedOverride === true ? true : published;
        const frontmatter = [
            '---',
            `title: "${title}"`,
            `slug: "${slug}"`,
            `date: "${new Date().toISOString().split('T')[0]}"`,
            `published: "${isPublished}"`,
            '---',
            '',
            content
        ].join('\n');
        onSave(`${slug}.md`, frontmatter);
    };

    return (
        <div className="flex flex-col h-full bg-zinc-950">
            {/* Header */}
            <div className="h-14 border-b border-zinc-900 flex items-center justify-between px-6 bg-zinc-950/50 backdrop-blur-sm sticky top-0 z-20">
                <div className="flex items-center gap-4">
                    <button onClick={onCancel} className="p-2 hover:bg-zinc-900 rounded-md text-zinc-500 hover:text-white transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                    <div className="h-4 w-px bg-zinc-800" />
                    <span className="text-sm font-mono text-zinc-400">{slug || 'new-note'}.md</span>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setPublished(!published)}
                        className={`mr-4 flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-mono border transition-all ${published ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-500' : 'bg-zinc-900 border-zinc-800 text-zinc-600'}`}
                    >
                        <div className={`w-1.5 h-1.5 rounded-full ${published ? 'bg-emerald-500' : 'bg-zinc-700'}`} />
                        {published ? 'PUBLISHED' : 'DRAFT'}
                    </button>
                    <div className="flex bg-zinc-900 rounded-lg p-1 mr-4">
                        <button
                            onClick={() => setMode('edit')}
                            className={`px-3 py-1 text-xs font-mono rounded-md transition-all ${mode === 'edit' ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
                        >
                            <Edit3 className="w-3.5 h-3.5 inline mr-1.5" /> EDITOR
                        </button>
                        <button
                            onClick={() => setMode('preview')}
                            className={`px-3 py-1 text-xs font-mono rounded-md transition-all ${mode === 'preview' ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
                        >
                            <Eye className="w-3.5 h-3.5 inline mr-1.5" /> PREVIEW
                        </button>
                    </div>

                    {note && (
                        <button onClick={onDelete} className="p-2 hover:bg-red-950/30 text-zinc-600 hover:text-red-500 rounded-md transition-colors mr-2">
                            <Trash2 className="w-4 h-4" />
                        </button>
                    )}

                    <button
                        onClick={async () => {
                            setPublished(true);
                            handleSave(true);
                            const res = await fetch('/api/publish', { method: 'POST' });
                            if (res.ok) alert("Note Saved & Published Live!");
                        }}
                        className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded-md text-sm font-bold transition-all shadow-lg shadow-blue-900/40 flex items-center gap-2 active:scale-95"
                    >
                        <Save className="w-4 h-4" /> SAVE & PUBLISH
                    </button>
                </div>
            </div>

            {/* Editor Body */}
            <div className="flex-1 overflow-hidden flex flex-col max-w-5xl mx-auto w-full px-6 py-8">
                {/* Meta Fields */}
                <div className="space-y-4 mb-8">
                    <input
                        type="text"
                        value={title}
                        onChange={handleTitleChange}
                        placeholder="Note Title"
                        className="w-full bg-transparent text-4xl md:text-5xl font-bold text-white placeholder:text-zinc-800 focus:outline-none tracking-tight"
                    />
                    <div className="flex items-center gap-4 text-xs font-mono text-zinc-600 uppercase tracking-widest">
                        <div className="flex items-center gap-2">
                            <span>SLUG:</span>
                            <input
                                type="text"
                                value={slug}
                                onChange={(e) => setSlug(e.target.value)}
                                className="bg-zinc-900/50 px-2 py-1 rounded border border-zinc-800 focus:border-zinc-700 outline-none text-zinc-400"
                            />
                        </div>
                        <span>•</span>
                        <span>DATE: {new Date().toISOString().split('T')[0]}</span>
                    </div>
                </div>

                {/* Markdown Area */}
                <div className="flex-1 min-h-0">
                    {mode === 'edit' ? (
                        <textarea
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            placeholder="Start writing..."
                            className="w-full h-full bg-transparent text-zinc-300 text-lg leading-relaxed font-serif resize-none focus:outline-none placeholder:text-zinc-800"
                            spellCheck={false}
                        />
                    ) : (
                        <div
                            className="prose prose-invert prose-zinc max-w-none prose-headings:font-sans prose-p:font-serif prose-p:text-lg prose-p:leading-relaxed overflow-y-auto h-full"
                            dangerouslySetInnerHTML={{ __html: marked(content) }}
                        />
                    )}
                </div>
            </div>
        </div>
    );
};
