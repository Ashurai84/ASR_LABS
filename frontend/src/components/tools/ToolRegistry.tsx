import React from 'react';
import type { Tool } from '../../types/lab-state';
import { Database, ExternalLink, Code2 } from 'lucide-react';

interface ToolRegistryProps {
    tools: Tool[];
}

const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
        case 'active':
            return 'bg-[#22c55e]/10 border-[#22c55e]/20 text-[#22c55e]';
        case 'experimental':
            return 'bg-[#f97316]/10 border-[#f97316]/20 text-[#f97316]';
        case 'deprecated':
            return 'bg-[#3f3f46]/20 border-[#27272a] text-[#85858b]';
        default:
            return 'bg-[#18181b] border-[#27272a] text-[#a1a1aa]';
    }
};

export const ToolRegistry: React.FC<ToolRegistryProps> = ({ tools = [] }) => {
    if (tools.length === 0) {
        return (
            <div className="pt-32 pb-32 flex flex-col items-center justify-center text-[#6b7280] space-y-4 animate-fade-in">
                <div className="p-4 bg-zinc-900/50 rounded-full border border-zinc-800/50">
                    <Database className="w-8 h-8 opacity-20" />
                </div>
                <p className="font-mono text-sm tracking-widest uppercase text-[#a1a1aa]">No tools built yet.</p>
                <p className="text-[13px] font-sans max-w-sm text-center text-[#6b7280]">
                    Start experimenting. Artifacts, scripts, and internal systems will appear here.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-12 pb-32 animate-fade-in">
            {/* Header */}
            <div className="pt-4 pb-4 border-b border-[#27272a]">
                <h1 className="text-xl md:text-2xl font-serif text-[#ffffff] tracking-tight mb-2">
                    Artifacts & Tools
                </h1>
                <p className="text-[13px] md:text-[14px] text-[#85858b] max-w-2xl leading-relaxed font-sans">
                    A registry of internal engineering tools, custom scripts, and experimental prototypes built for the lab.
                </p>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-slide-up">
                {tools.map((tool) => (
                    <div
                        key={tool.id || tool.name}
                        className="group relative flex flex-col bg-[#18181b] border border-[#27272a] rounded-md p-5 hover:-translate-y-1 hover:shadow-elevated hover:bg-[#18181b]/80 hover:border-[#3f3f46] transition-all duration-300 ease-out"
                    >
                        <div className="flex justify-between items-start mb-4">
                            <h3 className="text-[16px] font-bold text-[#ffffff] font-sans tracking-tight leading-tight pr-4">
                                {tool.name}
                            </h3>
                            {tool.status && (
                                <span className={`text-[9px] font-mono uppercase tracking-widest px-2 py-0.5 rounded border whitespace-nowrap ${getStatusColor(tool.status)}`}>
                                    {tool.status}
                                </span>
                            )}
                        </div>

                        <p className="text-[14px] text-[#a1a1aa] font-sans leading-relaxed line-clamp-3 mb-6 flex-1">
                            {tool.description}
                        </p>

                        <div className="mt-auto pt-4 border-t border-[#27272a]/50 flex items-center justify-between gap-4">
                            <div className="flex flex-wrap gap-2 truncate">
                                {tool.tech_stack?.slice(0, 3).map(tech => (
                                    <span key={tech} className="flex items-center gap-1 text-[10px] font-mono text-[#6b7280] bg-[#000000] px-1.5 py-0.5 border border-[#27272a] rounded">
                                        <Code2 className="w-3 h-3 opacity-50" />
                                        {tech}
                                    </span>
                                ))}
                                {tool.tech_stack && tool.tech_stack.length > 3 && (
                                    <span className="text-[10px] font-mono text-[#6b7280] px-1.5 py-0.5 border border-[#27272a] rounded bg-[#000000]">+{tool.tech_stack.length - 3}</span>
                                )}
                            </div>

                            {tool.url && (
                                <a
                                    href={tool.url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="p-1.5 text-[#6b7280] hover:text-[#ededed] bg-[#000000] border border-[#27272a] rounded shadow-subtle hover:border-[#3f3f46] transition-all duration-200"
                                >
                                    <ExternalLink className="w-3.5 h-3.5" />
                                </a>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
