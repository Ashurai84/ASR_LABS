import React from 'react';
import type { Tool } from '../../types/lab-state';
import { ExternalLink, Database, Globe, Network, Smartphone, BrainCircuit, Terminal, ArrowUpRight, Github, Code2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

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
        case 'ACTIVE': return 'text-[#22c55e] border-[#22c55e]/30 bg-[#22c55e]/10';
        case 'EXPERIMENTAL': return 'text-[#f97316] border-[#f97316]/30 bg-[#f97316]/10';
        case 'DEPRECATED': return 'text-[#ef4444] border-[#ef4444]/30 bg-[#ef4444]/10';
        default: return 'text-[#a1a1aa] border-[#27272a] bg-[#18181b]';
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
        <div className="group block no-underline h-[360px] min-h-[360px]">
             {/* Note the explicit exact height requirement so the grid doesn't wobble */}
            <div className="relative h-full p-6 bg-[#111111] border border-[#27272a] group-hover:border-[#3f3f46] rounded-2xl transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-[0_8px_30px_rgba(0,0,0,0.4)] flex flex-col justify-between overflow-hidden cursor-default">
                
                {/* 1. Header Array */}
                <div className="flex flex-col gap-4 mb-2 z-10 relative">
                    <div className="flex justify-between items-start w-full">
                        <div className="p-3 bg-[#18181b] rounded-xl border border-[#27272a] shadow-inner shrink-0 group-hover:bg-[#27272a] transition-colors">
                            {getTypeIcon(tool.type)}
                        </div>
                        <span className={`px-2 py-1 text-[10px] font-mono tracking-widest uppercase rounded flex items-center border ${statusColor}`}>
                            {tool.status}
                        </span>
                    </div>

                    <div className="mt-2">
                        <h3 className="text-[20px] font-medium text-[#e5e5e5] tracking-tight leading-tight group-hover:text-white transition-colors mb-2 line-clamp-1">
                            {tool.name}
                        </h3>
                        
                        {/* Context String */}
                        <div className="text-[11px] font-mono text-[#6b7280] flex items-center gap-1.5 flex-wrap">
                            {tool.type && <span className="text-[#85858b] uppercase">{tool.type}</span>}
                            
                            {(tool.work_context?.company) && (
                                <>
                                    <span>·</span>
                                    <span className="text-[#a1a1aa] truncate max-w-[120px]">@ {tool.work_context.company}</span>
                                </>
                            )}
                            
                            {(tool.version) && (
                                <>
                                    <span>·</span>
                                    <span className="text-[#a1a1aa] bg-[#27272a] px-1.5 rounded-sm line-clamp-1 break-all">{tool.version}</span>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {/* 2. Text Content (Takes remaining space gracefully) */}
                <div className="flex-grow flex flex-col justify-center z-10 relative mt-4">
                    <p className="text-[14px] text-[#85858b] font-sans leading-relaxed line-clamp-4 group-hover:text-[#a1a1aa] transition-colors">
                        {tool.description || "No description provided."}
                    </p>
                </div>

                {/* 3. Footer row */}
                <div className="flex flex-col gap-4 pt-5 border-t border-[#27272a] group-hover:border-[#3f3f46] transition-colors z-10 relative shrink-0 mt-4 h-auto min-h-[40px]">
                    <div className="flex justify-between items-center w-full">
                        {/* Tech Pills */}
                        <div className="flex gap-1.5 overflow-hidden">
                            {visibleTags.map((tech, i) => (
                                <span key={i} className="px-2 py-1 text-[10px] font-mono text-[#85858b] bg-[#18181b] border border-[#27272a] rounded shrink-0 whitespace-nowrap">
                                    {tech}
                                </span>
                            ))}
                            {hiddenCount > 0 && (
                                <span className="px-1.5 py-1 text-[10px] font-mono text-[#6b7280] shrink-0">
                                    +{hiddenCount}
                                </span>
                            )}
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-2 shrink-0">
                            {tool.links?.github && (
                                <a href={tool.links.github} target="_blank" rel="noreferrer" className="p-2 text-[#85858b] hover:text-white bg-[#18181b] border border-[#27272a] hover:border-[#3f3f46] hover:bg-[#27272a] rounded cursor-pointer transition-all">
                                    <Github className="w-3.5 h-3.5" />
                                </a>
                            )}
                            {tool.links?.demo && (
                                <a href={tool.links.demo} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-mono font-bold text-[#111] bg-[#e5e5e5] hover:bg-white rounded cursor-pointer transition-all">
                                    Demo <ArrowUpRight className="w-3.5 h-3.5" />
                                </a>
                            )}
                        </div>
                    </div>
                </div>

                {/* Secret Glow Effect */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-[#ffffff]/[0.015] rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none z-0 transform translate-x-1/2 -translate-y-1/2" />
            </div>
        </div>
    );
};
