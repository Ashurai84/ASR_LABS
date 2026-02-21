import React from 'react';
import type { Tool } from '../../types/lab-state';
import { ExternalLink, Database, Globe, Network, Smartphone, BrainCircuit, Terminal, Github, Code2 } from 'lucide-react';

interface ToolCardProps {
    tool: Tool;
}

const getTypeIcon = (type?: string) => {
    switch (type?.toUpperCase()) {
        case 'BACKEND': return <Database className="w-5 h-5 text-[#85858b] group-hover:text-white transition-colors" />;
        case 'FRONTEND': return <Globe className="w-5 h-5 text-[#85858b] group-hover:text-white transition-colors" />;
        case 'FULLSTACK': return <Network className="w-5 h-5 text-[#85858b] group-hover:text-white transition-colors" />;
        case 'MOBILE': return <Smartphone className="w-5 h-5 text-[#85858b] group-hover:text-white transition-colors" />;
        case 'AI_ML': return <BrainCircuit className="w-5 h-5 text-[#85858b] group-hover:text-white transition-colors" />;
        case 'DEVOPS': return <Terminal className="w-5 h-5 text-[#85858b] group-hover:text-white transition-colors" />;
        default: return <Code2 className="w-5 h-5 text-[#85858b] group-hover:text-white transition-colors" />;
    }
};

const getStatusColor = (status: string) => {
    switch (status?.toUpperCase()) {
        case 'ACTIVE': return 'text-[#22c55e] border-[#22c55e]/20 bg-[#22c55e]/5';
        case 'EXPERIMENTAL': return 'text-[#f97316] border-[#f97316]/20 bg-[#f97316]/5';
        case 'DEPRECATED': return 'text-[#ef4444] border-[#ef4444]/20 bg-[#ef4444]/5';
        default: return 'text-[#a1a1aa] border-[#27272a] bg-[#18181b]';
    }
};

export const ToolCard: React.FC<ToolCardProps> = ({ tool }) => {
    const statusColor = getStatusColor(tool.status);
    
    // Aggregate Tags
    let displayTags: string[] = [];
    if (tool.tech_stack) {
        Object.values(tool.tech_stack).forEach(arr => {
            if (Array.isArray(arr)) displayTags = [...displayTags, ...arr];
        });
    } else if (Array.isArray(tool.tags)) {
        displayTags = [...tool.tags];
    }
    const visibleTags = displayTags.slice(0, 3);
    const hiddenCount = displayTags.length > 3 ? displayTags.length - 3 : 0;
    
    return (
        <div className="group flex flex-col h-[320px] w-full bg-[#0a0a0a] border border-[#27272a]/50 rounded-2xl p-6 transition-all duration-300 hover:border-[#3f3f46] hover:bg-[#111] cursor-pointer relative shadow-sm hover:shadow-[0_8px_30px_rgba(0,0,0,0.4)] hover:-translate-y-1 overflow-hidden">
            
            {/* Ambient Background Mesh on hover */}
            <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-white/[0.015] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

            {/* 1. Header Area */}
            <div className="flex flex-col gap-4 w-full z-10 relative">
                
                {/* Top Row: Icon + Meta */}
                <div className="flex justify-between items-center w-full">
                    <div className="p-3 bg-[#18181b] rounded-xl border border-[#27272a] shadow-inner shrink-0 group-hover:bg-[#27272a] transition-colors">
                        {getTypeIcon(tool.type)}
                    </div>
                    <div className="flex flex-col items-end gap-1 text-right mt-1">
                        <span className={`px-2 py-0.5 text-[9px] font-mono tracking-widest uppercase rounded border ${statusColor}`}>
                            {tool.status}
                        </span>
                    </div>
                </div>

                {/* Middle Row: Title + Context */}
                <div>
                    <h3 className="text-[20px] sm:text-[22px] font-bold font-serif text-[#ffffff] tracking-tight leading-none group-hover:text-white transition-colors mb-2.5 truncate">
                        {tool.name}
                    </h3>
                    <div className="text-[11px] font-mono text-[#6b7280] flex items-center gap-1.5 flex-wrap">
                        {tool.type && <span className="text-[#a1a1aa] uppercase tracking-wide">{tool.type}</span>}
                        {(tool.work_context?.company) && (
                            <>
                                <span>·</span>
                                <span className="truncate max-w-[150px]">@ {tool.work_context.company}</span>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* 2. Text Content (takes up empty center space) */}
            <div className="flex-grow z-10 relative flex flex-col justify-center my-4">
                <p className="text-[14px] text-[#a1a1aa] font-sans leading-relaxed line-clamp-3 group-hover:text-[#d4d4d8] transition-colors">
                    {tool.description || "No description provided."}
                </p>
            </div>

            {/* 3. Bottom Action Row pinned to bottom */}
            <div className="flex flex-wrap items-center justify-between gap-4 pt-5 border-t border-[#27272a]/60 relative z-10 shrink-0 mt-auto bg-transparent transition-colors">
                {/* Tech Pills */}
                <div className="flex gap-1.5 shrink-1 overflow-hidden">
                    {visibleTags.map((tech, i) => (
                        <span key={i} className="px-2 py-0.5 text-[10px] font-mono text-[#85858b] bg-[#18181b] border border-[#27272a] rounded shrink-0 whitespace-nowrap">
                            {tech}
                        </span>
                    ))}
                    {hiddenCount > 0 && (
                        <span className="px-1.5 py-0.5 text-[10px] font-mono text-[#6b7280] font-medium tracking-wide">
                            +{hiddenCount}
                        </span>
                    )}
                </div>

                <div className="flex items-center gap-2 shrink-0">
                     {tool.links?.github && (
                        <a href={tool.links.github} target="_blank" rel="noreferrer" className="text-[10px] font-mono p-1.5 bg-[#18181b] border border-[#27272a] hover:border-[#3f3f46] hover:bg-[#27272a] rounded transition-all text-[#85858b] hover:text-[#e5e5e5] shadow-sm z-10">
                            <Github className="w-4 h-4" />
                        </a>
                     )}
                     {tool.links?.demo && (
                        <a href={tool.links.demo} target="_blank" rel="noreferrer" className="text-[11px] font-mono px-3 py-1.5 bg-[#e5e5e5] hover:bg-[#ffffff] text-[#111] hover:text-black rounded transition-all shadow-sm font-bold flex items-center gap-1.5 z-10">
                            Demo <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                     )}
                </div>
            </div>
            
             <div className="absolute top-0 right-0 w-64 h-64 bg-[#ffffff]/[0.012] rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none z-0 transform translate-x-1/3 -translate-y-1/3" />
        </div>
    );
};
