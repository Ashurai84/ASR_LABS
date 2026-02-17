import React, { useState, useEffect } from 'react';
import { Save, Plus, Trash2, Cpu, Wrench } from 'lucide-react';

export const ToolsEditor = ({ tools, onSave }) => {
    const [list, setList] = useState([]);

    useEffect(() => {
        console.log("[ToolsEditor] Received tools:", tools);
        setList(tools || []);
    }, [tools]);

    const handleSave = () => {
        console.log("[ToolsEditor] Saving tools:", list);
        onSave(list);
    };

    const addTool = () => {
        setList([...list, { name: '', category: 'core', version: '', status: 'active' }]);
    };

    const updateTool = (idx, field, val) => {
        const newList = [...list];
        newList[idx][field] = val;
        setList(newList);
    };

    const removeTool = (idx) => {
        setList(list.filter((_, i) => i !== idx));
    };

    return (
        <div className="p-8 max-w-5xl">
            <div className="flex justify-between items-center mb-10">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-orange-500/10 rounded-xl border border-orange-500/20">
                        <Wrench className="w-6 h-6 text-orange-500" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-white tracking-tight">Technical Stack</h1>
                        <p className="text-zinc-500 text-sm">Manage core tools, languages and infrastructure.</p>
                    </div>
                </div>

                <div className="flex gap-3">
                    <button
                        onClick={addTool}
                        className="bg-zinc-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-zinc-800 border border-zinc-800 shadow-sm flex items-center gap-2"
                    >
                        <Plus className="w-4 h-4" /> Add Tool
                    </button>
                    <button
                        onClick={handleSave}
                        className="bg-zinc-100 text-zinc-950 px-6 py-2 rounded-lg text-sm font-bold hover:bg-white shadow-lg flex items-center gap-2"
                    >
                        <Save className="w-4 h-4" /> Save Stack
                    </button>
                </div>
            </div>

            <div className="space-y-3">
                {list.map((tool, idx) => (
                    <div key={idx} className="flex items-center gap-4 bg-zinc-900/40 p-3 rounded-xl border border-zinc-900 group hover:border-zinc-800 transition-all">
                        <div className="w-10 h-10 bg-zinc-950 rounded-lg border border-zinc-900 flex items-center justify-center">
                            <Cpu className="w-4 h-4 text-zinc-700" />
                        </div>

                        <div className="flex-1 grid grid-cols-4 gap-4">
                            <input
                                type="text"
                                value={tool.name}
                                onChange={e => updateTool(idx, 'name', e.target.value)}
                                placeholder="Tool Name (e.g. Rust)"
                                className="bg-transparent border-none outline-none text-sm text-white placeholder:text-zinc-800 font-medium"
                            />
                            <select
                                value={tool.category}
                                onChange={e => updateTool(idx, 'category', e.target.value)}
                                className="bg-zinc-950 border border-zinc-900 rounded px-2 py-1 text-xs font-mono text-zinc-500 uppercase appearance-none cursor-pointer"
                            >
                                <option value="core">CORE</option>
                                <option value="language">LANGUAGE</option>
                                <option value="frontend">FRONTEND</option>
                                <option value="backend">BACKEND</option>
                                <option value="devops">DEVOPS</option>
                            </select>
                            <input
                                type="text"
                                value={tool.version}
                                onChange={e => updateTool(idx, 'version', e.target.value)}
                                placeholder="v1.0"
                                className="bg-transparent border-none outline-none text-xs font-mono text-zinc-600"
                            />
                            <select
                                value={tool.status}
                                onChange={e => updateTool(idx, 'status', e.target.value)}
                                className={`bg-transparent border-none outline-none text-xs font-mono font-bold uppercase ${tool.status === 'active' ? 'text-emerald-500' : 'text-zinc-700'}`}
                            >
                                <option value="active">ACTIVE</option>
                                <option value="deprecated">DEPRECATED</option>
                            </select>
                        </div>

                        <button
                            onClick={() => removeTool(idx)}
                            className="p-2 opacity-0 group-hover:opacity-100 hover:text-red-500 text-zinc-700 transition-all"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
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
};
