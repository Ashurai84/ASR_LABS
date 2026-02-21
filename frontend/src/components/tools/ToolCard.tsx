import React from 'react';
import type { Tool } from '../../types/lab-state';
import { ExternalLink, Database, Globe, Network, Smartphone, BrainCircuit, Terminal, Github, Code2 } from 'lucide-react';

interface ToolCardProps {
    tool: Tool;
}

const getTypeIcon = (type?: string) => {
    switch (type?.toUpperCase()) {
        case 'BACKEND': return <Database className="w-5 h-5 text-zinc-500 group-hover:text-zinc-300 transition-colors" />;
        case 'FRONTEND': return <Globe className="w-5 h-5 text-zinc-500 group-hover:text-zinc-300 transition-colors" />;
        case 'FULLSTACK': return <Network className="w-5 h-5 text-zinc-500 group-hover:text-zinc-300 transition-colors" />;
        case 'MOBILE': return <Smartphone className="w-5 h-5 text-zinc-500 group-hover:text-zinc-300 transition-colors" />;
        case 'AI_ML': return <BrainCircuit className="w-5 h-5 text-zinc-500 group-hover:text-zinc-300 transition-colors" />;
        case 'DEVOPS': return <Terminal className="w-5 h-5 text-zinc-500 group-hover:text-zinc-300 transition-colors" />;
        default: return <Code2 className="w-5 h-5 text-zinc-500 group-hover:text-zinc-300 transition-colors" />;
    }
};

const getStatusColor = (status: string) => {
    switch (status?.toUpperCase()) {
        case 'ACTIVE': return 'text-emerald-500/80 bg-emerald-500/10 border-emerald-500/20';
        case 'EXPERIMENTAL': return 'text-amber-500/80 bg-amber-500/10 border-amber-500/20';
        case 'DEPRECATED': return 'text-red-500/80 bg-red-500/10 border-red-500/20';
        default: return 'text-zinc-400 bg-zinc-800/50 border-zinc-700/50';
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
        <div className="group block no-underline h-[340px] w-full bg-[#111] border border-zinc-800/80 rounded-2xl p-6 transition-all duration-300 hover:border-zinc-700 hover:bg-[#141414] relative overflow-hidden">
            
            {/* Ambient Lighting Map */}
            <div className="absolute inset-0 bg-gradient-to-b from-white/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
            <div className="absolute -inset-x-6 top-1/2 -bottom-6 bg-gradient-to-t from-black via-transparent to-transparent opacity-80 z-0 pointer-events-none" />
            
            <div className="flex flex-col h-full relative z-10">
                {/* 1. Ultra-Clean Header Row */}
                <div className="flex justify-between items-start mb-6">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-black/40 rounded-xl border border-zinc-800/50 shadow-inner shrink-0 group-hover:bg-zinc-900 group-hover:border-zinc-700/50 transition-colors">
                            {getTypeIcon(tool.type)}
                        </div>
                        <div className="flex flex-col">
                            <h3 className="text-[19px] sm:text-[21px] font-medium font-sans text-zinc-200 tracking-tight leading-none group-hover:text-white transition-colors mb-1.5 line-clamp-1">
                                {tool.name}
                            </h3>
                            <div className="flex items-center gap-2">
                                <span className={`px-2 py-[2px] text-[9px] font-mono tracking-widest uppercase rounded flex items-center border ${statusColor}`}>
                                    {tool.status}
                                </span>
                                {tool.work_context?.company && (
                                    <>
                                        <span className="text-zinc-600 font-mono text-[10px]">·</span>
                                        <span className="text-zinc-500 font-mono text-[10px] tracking-wide uppercase">
                                            @ {tool.work_context.company}
                                        </span>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* 2. Text Content  */}
                <div className="flex-grow z-10 flex flex-col pt-2">
                    <p className="text-[14px] text-zinc-400 font-sans leading-[1.6] line-clamp-3 group-hover:text-zinc-300 transition-colors">
                        {tool.description || "No description provided."}
                    </p>
                </div>

                {/* 3. Footer Bar */}
                <div className="flex flex-wrap items-center justify-between gap-4 pt-5 border-t border-zinc-800/50 mt-auto shrink-0 group-hover:border-zinc-700/50 transition-colors">
                    
                    {/* Tags Container */}
                    <div className="flex gap-1.5 shrink-1 overflow-hidden">
                        {visibleTags.map((tech, i) => (
                            <span key={i} className="px-2 py-1 text-[10px] font-mono text-zinc-400 bg-black/40 border border-zinc-800/50 rounded-md shrink-0 whitespace-nowrap group-hover:border-zinc-700/50 transition-colors">
                                {tech}
                            </span>
                        ))}
                        {hiddenCount > 0 && (
                            <span className="px-1.5 py-1 text-[10px] font-mono text-zinc-600 font-medium tracking-wide">
                                +{hiddenCount}
                            </span>
                        )}
                    </div>

                    {/* Links */}
                    <div className="flex items-center gap-2 shrink-0">
                         {tool.links?.github && (
                            <a href={tool.links.github} target="_blank" rel="noreferrer" className="p-2 bg-black/40 border border-zinc-800/50 hover:border-zinc-600  rounded-lg transition-all text-zinc-500 hover:text-white shadow-sm z-10">
                                <Github className="w-3.5 h-3.5" />
                            </a>
                         )}
                         {tool.links?.demo && (
                            <a href={tool.links.demo} target="_blank" rel="noreferrer" className="px-3 py-1.5 text-[11px] font-mono font-bold text-black bg-zinc-200 hover:bg-white rounded-lg transition-all shadow-sm flex items-center gap-1.5 z-10">
                                Demo <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                         )}
                    </div>
                </div>
            </div>
            
             <div className="absolute -top-12 -right-12 w-48 h-48 bg-white/[0.015] rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none z-0 mix-blend-screen" />
        </div>
    );
};
