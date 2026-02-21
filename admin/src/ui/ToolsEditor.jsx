import React, { useState, useEffect } from 'react';
import { Save, Plus, Trash2, Wrench, ChevronLeft, Edit2 } from 'lucide-react';

export const ToolsEditor = ({ tools, onSave }) => {
    const [list, setList] = useState([]);
    const [editingIndex, setEditingIndex] = useState(null);
    const [formData, setFormData] = useState(null);
    const [techStackStr, setTechStackStr] = useState('');

    useEffect(() => {
        setList(tools || []);
    }, [tools]);

    const handleSaveList = (newList) => {
        setList(newList);
        onSave(newList);
    };

    const startNewTool = () => {
        setFormData({
            id: '',
            name: '',
            type: 'BACKEND',
            status: 'ACTIVE',
            version: '',
            work_context: { company: '', team: '', timeline: '' },
            description: '',
            my_role: { title: '', contributions: [''] },
            tags: [],
            links: { github: '', demo: '' },
            deprecation: { reason: '' }
        });
        setTechStackStr('');
        setEditingIndex(-1);
    };

    const editTool = (idx) => {
        const tool = list[idx];
        const copy = JSON.parse(JSON.stringify(tool));
        // Normalize nested fields
        if (!copy.work_context) copy.work_context = { company: '', team: '', timeline: '' };
        if (!copy.my_role) copy.my_role = { title: '', contributions: [''] };
        if (!copy.my_role.contributions || copy.my_role.contributions.length === 0) copy.my_role.contributions = [''];
        if (!copy.links) copy.links = { github: '', demo: '' };
        if (!copy.deprecation) copy.deprecation = { reason: '' };

        setFormData(copy);

        // Convert tech stack/tags back to a comma separated string
        let tags = copy.tags || [];
        if (copy.tech_stack) {
            tags = [...tags, ...(copy.tech_stack.frontend || []), ...(copy.tech_stack.backend || []), ...(copy.tech_stack.devops || []), ...(copy.tech_stack.other || [])];
        }
        setTechStackStr(tags.join(', '));
        setEditingIndex(idx);
    };

    const saveForm = () => {
        if (!formData.name || !formData.work_context?.company || !formData.work_context?.timeline) {
            alert('Tool Name, Company/Project, and Timeline are required fields.');
            return;
        }

        const cleaned = { ...formData };
        cleaned.slug = cleaned.slug || cleaned.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        cleaned.id = cleaned.id || cleaned.slug;

        // Convert comma string back to array
        cleaned.tags = techStackStr.split(',').map(s => s.trim()).filter(Boolean);
        // Remove nested tech_stack to keep this editor simple, fallback to tags
        delete cleaned.tech_stack;

        cleaned.my_role.contributions = cleaned.my_role.contributions.filter(c => c.trim() !== '');

        cleaned.updated_at = new Date().toISOString();
        if (!cleaned.created_at) cleaned.created_at = cleaned.updated_at;

        const newList = [...list];
        if (editingIndex === -1) {
            newList.push(cleaned);
        } else {
            newList[editingIndex] = cleaned;
        }

        handleSaveList(newList);
        setEditingIndex(null);
    };

    const updateField = (path, value) => {
        const parts = path.split('.');
        setFormData(prev => {
            const next = { ...prev };
            let current = next;
            for (let i = 0; i < parts.length - 1; i++) {
                if (!current[parts[i]]) current[parts[i]] = {};
                current = current[parts[i]];
            }
            current[parts[parts.length - 1]] = value;
            return next;
        });
    };

    const updateContribution = (idx, val) => {
        const newCont = [...formData.my_role.contributions];
        newCont[idx] = val;
        updateField('my_role.contributions', newCont);
    };

    const addContribution = () => {
        updateField('my_role.contributions', [...formData.my_role.contributions, '']);
    };

    const removeContribution = (idx) => {
        const newCont = formData.my_role.contributions.filter((_, i) => i !== idx);
        updateField('my_role.contributions', newCont);
    };

    const deleteTool = (idx) => {
        const newList = list.filter((_, i) => i !== idx);
        handleSaveList(newList);
    };

    // --- LIST VIEW ---
    if (editingIndex === null) {
        return (
            <div className="p-8 max-w-5xl">
                <div className="flex justify-between items-center mb-10">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-orange-500/10 rounded-xl border border-orange-500/20">
                            <Wrench className="w-6 h-6 text-orange-500" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-white tracking-tight">Your Tools ({list.length})</h1>
                            <p className="text-zinc-500 text-sm">Professional portfolio of your systems and experiments.</p>
                        </div>
                    </div>
                    <button
                        onClick={startNewTool}
                        className="bg-white text-black px-4 py-2 rounded-lg text-sm font-bold hover:bg-zinc-200 flex items-center gap-2"
                    >
                        <Plus className="w-4 h-4" /> Add New Tool
                    </button>
                </div>

                <div className="space-y-4">
                    {list.map((tool, idx) => (
                        <div key={idx} className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 bg-zinc-900/40 rounded-xl border border-zinc-900 hover:border-zinc-800 transition-all group">
                            <div>
                                <h3 className="text-lg font-bold text-white mb-1 flex items-center gap-2">
                                    {tool.type === 'BACKEND' ? '🔧' : tool.type === 'FRONTEND' ? '⚛️' : tool.type === 'DEVOPS' ? '🐳' : tool.type === 'AI_ML' ? '🤖' : tool.type === 'MOBILE' ? '📱' : '⚡'}
                                    {tool.name}
                                </h3>
                                <div className="text-sm font-mono text-zinc-500">
                                    {tool.type || 'UNKNOWN'} • {tool.status || 'ACTIVE'} • {tool.work_context?.company || 'Unknown context'}
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => editTool(idx)}
                                    className="px-3 py-1.5 bg-zinc-800 text-white rounded hover:bg-zinc-700 text-sm font-medium flex items-center gap-2"
                                >
                                    <Edit2 className="w-4 h-4" /> Edit
                                </button>
                                <button
                                    onClick={() => {
                                        if (confirm(`Delete ${tool.name}?`)) deleteTool(idx);
                                    }}
                                    className="px-3 py-1.5 bg-red-500/10 text-red-500 rounded hover:bg-red-500/20 text-sm font-medium flex items-center gap-2"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ))}
                    {list.length === 0 && (
                        <div className="py-20 text-center border border-dashed border-zinc-900 rounded-2xl">
                            <p className="text-zinc-600 font-mono text-sm uppercase tracking-widest">No tools listed.</p>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    // --- EDIT VIEW ---
    return (
        <div className="p-8 max-w-3xl mx-auto">
            <button
                onClick={() => setEditingIndex(null)}
                className="mb-6 flex items-center gap-2 text-zinc-500 hover:text-white transition-colors text-sm font-medium"
            >
                <ChevronLeft className="w-4 h-4" /> Back to Tools
            </button>

            <div className="bg-zinc-900/40 border border-zinc-900 rounded-xl p-8 shadow-xl">
                <h2 className="text-xl font-bold text-white mb-6 border-b border-zinc-800 pb-4">
                    {editingIndex === -1 ? 'Add New Tool' : 'Edit Tool'}
                </h2>

                <div className="space-y-6">
                    <div>
                        <label className="block text-xs font-mono text-zinc-500 mb-2 uppercase tracking-wider">Tool Name *</label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => updateField('name', e.target.value)}
                            className="w-full bg-zinc-950 border border-zinc-800 rounded p-2.5 text-sm text-white focus:border-orange-500 focus:outline-none placeholder:text-zinc-700"
                            placeholder="e.g. REST API Gateway"
                        />
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                        <div>
                            <label className="block text-xs font-mono text-zinc-500 mb-2 uppercase tracking-wider">Type</label>
                            <select
                                value={formData.type || 'BACKEND'}
                                onChange={(e) => updateField('type', e.target.value)}
                                className="w-full bg-zinc-950 border border-zinc-800 rounded p-2.5 text-sm text-white focus:border-orange-500 focus:outline-none"
                            >
                                <option value="BACKEND">Backend</option>
                                <option value="FRONTEND">Frontend</option>
                                <option value="FULLSTACK">Full-Stack</option>
                                <option value="DEVOPS">DevOps</option>
                                <option value="MOBILE">Mobile</option>
                                <option value="AI_ML">AI/ML</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-mono text-zinc-500 mb-2 uppercase tracking-wider">Status</label>
                            <select
                                value={formData.status || 'ACTIVE'}
                                onChange={(e) => updateField('status', e.target.value)}
                                className="w-full bg-zinc-950 border border-zinc-800 rounded p-2.5 text-sm text-white focus:border-orange-500 focus:outline-none"
                            >
                                <option value="ACTIVE">Active</option>
                                <option value="EXPERIMENTAL">Experimental</option>
                                <option value="DEPRECATED">Deprecated</option>
                                <option value="ARCHIVED">Archived</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-mono text-zinc-500 mb-2 uppercase tracking-wider">Version</label>
                            <input
                                type="text"
                                value={formData.version || ''}
                                onChange={(e) => updateField('version', e.target.value)}
                                className="w-full bg-zinc-950 border border-zinc-800 rounded p-2.5 text-sm text-white focus:border-orange-500 focus:outline-none placeholder:text-zinc-700"
                                placeholder="e.g. v2.1.0"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2">
                            <label className="block text-xs font-mono text-zinc-500 mb-2 uppercase tracking-wider">Company / Project *</label>
                            <input
                                type="text"
                                value={formData.work_context?.company || ''}
                                onChange={(e) => updateField('work_context.company', e.target.value)}
                                className="w-full bg-zinc-950 border border-zinc-800 rounded p-2.5 text-sm text-white focus:border-orange-500 focus:outline-none placeholder:text-zinc-700"
                                placeholder="e.g. Startup XYZ"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-mono text-zinc-500 mb-2 uppercase tracking-wider">Team</label>
                            <input
                                type="text"
                                value={formData.work_context?.team || ''}
                                onChange={(e) => updateField('work_context.team', e.target.value)}
                                className="w-full bg-zinc-950 border border-zinc-800 rounded p-2.5 text-sm text-white focus:border-orange-500 focus:outline-none placeholder:text-zinc-700"
                                placeholder="e.g. Backend Team"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-mono text-zinc-500 mb-2 uppercase tracking-wider">Timeline *</label>
                            <input
                                type="text"
                                value={formData.work_context?.timeline || ''}
                                onChange={(e) => updateField('work_context.timeline', e.target.value)}
                                className="w-full bg-zinc-950 border border-zinc-800 rounded p-2.5 text-sm text-white focus:border-orange-500 focus:outline-none placeholder:text-zinc-700"
                                placeholder="e.g. 2024-Present"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-mono text-zinc-500 mb-2 uppercase tracking-wider">Description</label>
                        <textarea
                            value={formData.description || ''}
                            onChange={(e) => updateField('description', e.target.value)}
                            className="w-full bg-zinc-950 border border-zinc-800 rounded p-2.5 text-sm text-white focus:border-orange-500 focus:outline-none placeholder:text-zinc-700 min-h-[80px]"
                            placeholder="What does it do? What problem does it solve?"
                        />
                    </div>

                    <div className="border border-zinc-800 rounded-lg p-5 bg-zinc-950/50">
                        <label className="block text-xs font-mono text-zinc-500 mb-4 uppercase tracking-wider">Your Role & Contributions</label>
                        <input
                            type="text"
                            value={formData.my_role?.title || ''}
                            onChange={(e) => updateField('my_role.title', e.target.value)}
                            className="w-full bg-zinc-900 border border-zinc-800 rounded p-2.5 text-sm text-white focus:border-orange-500 focus:outline-none placeholder:text-zinc-700 mb-4"
                            placeholder="Your Title (e.g. Lead Backend Engineer)"
                        />

                        <div className="space-y-3">
                            {(formData.my_role?.contributions || []).map((cont, i) => (
                                <div key={i} className="flex gap-2">
                                    <input
                                        type="text"
                                        value={cont}
                                        onChange={(e) => updateContribution(i, e.target.value)}
                                        className="flex-1 bg-zinc-900 border border-zinc-800 rounded p-2.5 text-sm text-white focus:border-orange-500 focus:outline-none placeholder:text-zinc-700"
                                        placeholder="What did you specifically do?"
                                    />
                                    <button onClick={() => removeContribution(i)} className="p-2.5 text-zinc-500 hover:text-red-500 transition-colors bg-zinc-900 rounded border border-zinc-800">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                            <button onClick={addContribution} className="text-sm text-orange-500 hover:text-orange-400 font-medium flex items-center gap-1 mt-2">
                                <Plus className="w-4 h-4" /> Add another contribution
                            </button>
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-mono text-zinc-500 mb-2 uppercase tracking-wider">Tech Stack (comma-separated)</label>
                        <input
                            type="text"
                            value={techStackStr}
                            onChange={(e) => setTechStackStr(e.target.value)}
                            className="w-full bg-zinc-950 border border-zinc-800 rounded p-2.5 text-sm text-white focus:border-orange-500 focus:outline-none placeholder:text-zinc-700"
                            placeholder="Node.js, Express, TypeScript, Redis"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-mono text-zinc-500 mb-2 uppercase tracking-wider">GitHub Link</label>
                            <input
                                type="text"
                                value={formData.links?.github || ''}
                                onChange={(e) => updateField('links.github', e.target.value)}
                                className="w-full bg-zinc-950 border border-zinc-800 rounded p-2.5 text-sm text-white focus:border-orange-500 focus:outline-none placeholder:text-zinc-700"
                                placeholder="https://..."
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-mono text-zinc-500 mb-2 uppercase tracking-wider">Demo / Docs Link</label>
                            <input
                                type="text"
                                value={formData.links?.demo || formData.links?.docs || ''}
                                onChange={(e) => {
                                    updateField('links.demo', e.target.value);
                                }}
                                className="w-full bg-zinc-950 border border-zinc-800 rounded p-2.5 text-sm text-white focus:border-orange-500 focus:outline-none placeholder:text-zinc-700"
                                placeholder="https://..."
                            />
                        </div>
                    </div>

                    {formData.status === 'DEPRECATED' && (
                        <div className="border border-red-500/20 rounded-lg p-5 bg-red-500/5 mt-4">
                            <label className="block text-xs font-mono text-red-500 mb-2 uppercase tracking-wider">Why Deprecated?</label>
                            <textarea
                                value={formData.deprecation?.reason || ''}
                                onChange={(e) => updateField('deprecation.reason', e.target.value)}
                                className="w-full bg-zinc-950 border border-red-500/30 rounded p-2.5 text-sm text-white focus:border-red-500 focus:outline-none placeholder:text-red-500/50 min-h-[60px]"
                                placeholder="Migrated to PostgreSQL for better transaction support..."
                            />
                        </div>
                    )}

                    <div className="flex gap-3 pt-6 border-t border-zinc-800">
                        <button
                            onClick={() => setEditingIndex(null)}
                            className="px-6 py-2.5 rounded-lg text-sm font-bold bg-zinc-800 text-white hover:bg-zinc-700 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={saveForm}
                            className="flex-1 bg-white text-black px-6 py-2.5 rounded-lg text-sm font-bold hover:bg-zinc-200 transition-colors flex items-center justify-center gap-2"
                        >
                            <Save className="w-4 h-4" /> Save Tool
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
