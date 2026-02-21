import React, { useState, useEffect } from 'react';
import { Save, Wrench, Code } from 'lucide-react';

export const ToolsEditor = ({ tools, onSave }) => {
    const [jsonStr, setJsonStr] = useState('');
    const [error, setError] = useState(null);

    useEffect(() => {
        setJsonStr(JSON.stringify(tools || [], null, 4));
        setError(null);
    }, [tools]);

    const handleSave = () => {
        try {
            const parsed = JSON.parse(jsonStr);
            setError(null);
            onSave(parsed);
        } catch (e) {
            setError(e.message);
        }
    };

    return (
        <div className="p-8 max-w-5xl h-full flex flex-col">
            <div className="flex justify-between items-center mb-10 shrink-0">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-orange-500/10 rounded-xl border border-orange-500/20">
                        <Wrench className="w-6 h-6 text-orange-500" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-white tracking-tight">Artifacts Registry Config</h1>
                        <p className="text-zinc-500 text-sm">Edit the raw JSON payload map defining your deep professional tool context.</p>
                    </div>
                </div>

                <div className="flex gap-3">
                    <button
                        onClick={handleSave}
                        className="bg-zinc-100 text-zinc-950 px-6 py-2 rounded-lg text-sm font-bold hover:bg-white shadow-lg flex items-center gap-2"
                    >
                        <Save className="w-4 h-4" /> Save Configuration
                    </button>
                </div>
            </div>

            {error && (
                <div className="mb-4 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 font-mono text-xs">
                    JSON Syntax Error: {error}
                </div>
            )}

            <div className="flex-1 relative flex flex-col bg-zinc-900/40 rounded-xl border border-zinc-900 group focus-within:border-zinc-700 transition-all overflow-hidden h-[600px]">
                <div className="flex items-center gap-2 p-3 border-b border-zinc-900 bg-zinc-950/50">
                    <Code className="w-4 h-4 text-zinc-600" />
                    <span className="text-xs font-mono text-zinc-500 tracking-widest uppercase">application/json</span>
                </div>
                <textarea
                    value={jsonStr}
                    onChange={(e) => {
                        setJsonStr(e.target.value);
                        if (error) setError(null);
                    }}
                    className="flex-1 w-full bg-transparent p-4 text-[#e5e5e5] font-mono text-sm leading-relaxed resize-none focus:outline-none scrollbar-thin overflow-y-auto"
                    spellCheck={false}
                />
            </div>
        </div>
    );
};
