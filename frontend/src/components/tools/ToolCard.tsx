import React from 'react';
import type { Tool } from '../../types/lab-state';
import { ExternalLink, Database, Globe, Network, Smartphone, BrainCircuit, Terminal, ArrowUpRight, Github } from 'lucide-react';

interface ToolCardProps {
    tool: Tool;
}

const getTypeIcon = (type?: string) => {
    switch (type?.toUpperCase()) {
        case 'BACKEND': return <Database className="w-5 h-5 text-zinc-400 group-hover:text-white transition-colors" />;
        case 'FRONTEND': return <Globe className="w-5 h-5 text-zinc-400 group-hover:text-white transition-colors" />;
        case 'FULLSTACK': return <Network className="w-5 h-5 text-zinc-400 group-hover:text-white transition-colors" />;
        case 'MOBILE': return <Smartphone className="w-5 h-5 text-zinc-400 group-hover:text-white transition-colors" />;
        case 'AI_ML': return <BrainCircuit className="w-5 h-5 text-zinc-400 group-hover:text-white transition-colors" />;
        case 'DEVOPS': return <Terminal className="w-5 h-5 text-zinc-400 group-hover:text-white transition-colors" />;
        default: return <Database className="w-5 h-5 text-zinc-400 group-hover:text-white transition-colors" />;
    }
};

const getStatusColor = (status: string) => {
    switch (status?.toUpperCase()) {
        case 'ACTIVE': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
        case 'EXPERIMENTAL': return 'bg-amber-500/10 text-amber-500 border-amber-500/20 shadow-sm';
        case 'DEPRECATED': return 'bg-red-500/10 text-red-500 border-red-500/20';
        default: return 'bg-zinc-800 text-zinc-400 border-zinc-700';
    }
};

export const ToolCard: React.FC<ToolCardProps> = ({ tool }) => {
    const statusColor = getStatusColor(tool.status);
    
    // Safely aggregate max 3 tags from the nested tech_stack object or fallback tags
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
        <div className="group block no-underline transition-all h-full min-h-[380px]">
            <div className="relative h-full p-6 sm:p-8 bg-[#0a0a0a] border border-zinc-900 group-hover:border-zinc-800 rounded-2xl transition-all duration-300 group-hover:shadow-[0_8px_30px_rgba(0,0,0,0.8)] flex flex-col justify-between overflow-hidden cursor-default group-hover:-translate-y-1">
                
                {/* 1. Header (Icon Top Left, Pills Top Right) */}
                <div className="flex items-start justify-between mb-8">
                    <div className="p-3 bg-[#111] rounded-xl border border-zinc-800/80 shadow-inner">
                        {getTypeIcon(tool.type)}
                    </div>
                    <div className="flex flex-col items-end gap-2 text-right">
                        <span className={`px-2.5 py-1 text-[9px] font-mono font-bold tracking-[0.2em] uppercase rounded-md border ${statusColor}`}>
                            {tool.status}
                        </span>
                        {tool.version && (
                            <span className="text-[10px] font-mono text-zinc-600 bg-zinc-900/50 px-2 py-0.5 rounded">
                                {tool.version}
                            </span>
                        )}
                    </div>
                </div>

                {/* 2. Body (Title, Context, Description) */}
                <div className="space-y-4 mb-4 flex-grow z-10">
                    <h3 className="text-2xl font-sans font-bold text-zinc-200 tracking-tight leading-tight group-hover:text-white transition-colors">
                        {tool.name}
                    </h3>
                    
                    {/* The Work Context Line */}
                    {tool.work_context && (tool.work_context.company || tool.work_context.timeline) && (
                        <div className="flex flex-wrap items-center gap-2 text-[11px] font-mono text-zinc-500 tracking-wide uppercase">
                            {tool.work_context.company && (
                                <span className="text-zinc-400 bg-zinc-900 px-2 py-1 rounded-sm border border-zinc-800/50">
                                    @ {tool.work_context.company}
                                </span>
                            )}
                            {tool.work_context.timeline && (
                                <span className="text-zinc-600 border-l border-zinc-800 pl-2">
                                    {tool.work_context.timeline}
                                </span>
                            )}
                        </div>
                    )}

                    {/* Smooth fading text block */}
                    <div className="relative mt-4 group-hover:h-auto h-[75px] overflow-hidden transition-all duration-500 ease-in-out">
                        <p className="text-sm text-zinc-400 font-sans leading-relaxed group-hover:text-zinc-300 transition-colors">
                            {tool.description || "No description provided."}
                        </p>
                        {/* Gradient map to hide cutoff text gently when not hovering */}
                        <div className="absolute bottom-0 left-0 right-0 h-10 bg-gradient-to-t from-[#0a0a0a] to-transparent opacity-100 group-hover:opacity-0 transition-opacity duration-300" />
                    </div>
                    
                    {/* Hidden Roles/Contributions expanding on hover */}
                    <div className="max-h-0 opacity-0 group-hover:max-h-[300px] group-hover:opacity-100 group-hover:mt-2 overflow-hidden transition-all duration-500 ease-in-out">
                        {tool.my_role?.contributions && tool.my_role.contributions.length > 0 && (
                            <div className="pt-2">
                                <span className="text-[10px] font-mono tracking-widest text-zinc-500 uppercase block mb-3 border-t border-zinc-800/50 pt-4">Contributions</span>
                                <ul className="space-y-2 pb-2">
                                    {tool.my_role.contributions.map((cont, i) => (
                                        <li key={i} className="text-xs text-zinc-400 flex items-start gap-2">
                                            <span className="text-orange-500/70 mt-0.5 text-[10px]">▶</span> 
                                            <span className="leading-snug">{cont}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                </div>

                {/* 3. Footer (Tags, Links) */}
                <div className="mt-8 flex flex-col sm:flex-row sm:items-end justify-between gap-6 pt-6 border-t border-zinc-900 group-hover:border-zinc-800 transition-colors z-10 relative">
                    
                    {/* Clean Tech stack Pills */}
                    <div className="flex flex-wrap gap-1.5 max-w-[70%]">
                        {visibleTags.map((tech, i) => (
                            <span key={i} className="px-2 py-1 text-[10px] font-mono text-zinc-400 bg-zinc-900 border border-zinc-800 rounded-md">
                                {tech}
                            </span>
                        ))}
                        {hiddenCount > 0 && (
                            <span className="px-2 py-1 text-[10px] font-mono text-zinc-600 bg-transparent rounded-md border border-dashed border-zinc-800 hidden sm:inline-flex">
                                +{hiddenCount}
                            </span>
                        )}
                    </div>

                    {/* Highly polished minimal buttons */}
                    <div className="flex items-center gap-2">
                        {tool.links?.github && (
                            <a href={tool.links.github} target="_blank" rel="noreferrer" className="p-2 text-zinc-500 hover:text-white bg-zinc-900 border border-zinc-800 hover:border-zinc-700 hover:bg-zinc-800 rounded-lg transition-all shadow-sm">
                                <Github className="w-3.5 h-3.5" />
                            </a>
                        )}
                        {tool.links?.demo && (
                            <a href={tool.links.demo} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 px-3 py-2 text-[11px] font-mono font-bold text-black bg-zinc-200 hover:bg-white rounded-lg transition-all shadow-sm">
                                Demo <ArrowUpRight className="w-3 h-3" />
                            </a>
                        )}
                    </div>
                </div>

                {/* Lighting effects */}
                <div className="absolute inset-0 z-[1] bg-gradient-to-b from-white/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl pointer-events-none" />
                <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-white/[0.015] blur-3xl rounded-full group-hover:bg-white/[0.04] transition-all duration-700 pointer-events-none z-[0]" />
            </div>
        </div>
    );
};
