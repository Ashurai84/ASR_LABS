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
        case 'ACTIVE': return 'bg-[#18181b] text-emerald-500 border-zinc-800';
        case 'EXPERIMENTAL': return 'bg-[#18181b] text-[#f97316] border-[#3f3f46] shadow-sm';
        case 'DEPRECATED': return 'bg-[#18181b] text-red-500 border-zinc-800';
        default: return 'bg-zinc-800 text-zinc-400 border-zinc-700';
    }
};

export const ToolCard: React.FC<ToolCardProps> = ({ tool }) => {
    const statusColor = getStatusColor(tool.status);
    
    // Safely aggregate tags and limit to exactly 3 or less
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
        <div className="group transition-all h-full bg-[#18181b] border border-[#27272a] rounded-lg p-6 hover:-translate-y-1 hover:shadow-elevated hover:bg-[#18181b]/90 duration-200 cursor-pointer min-h-[360px] flex flex-col relative overflow-hidden">
            
            {/* 1. Header (Icon, Title, Version) */}
            <div className="flex items-start justify-between min-h-[48px] mb-4 relative z-10">
                <div className="flex gap-3 items-center">
                    <div className="p-2 bg-[#000000] border border-[#27272a] rounded-md shrink-0">
                        {getTypeIcon(tool.type)}
                    </div>
                    <h3 className="text-[18px] font-bold text-[#ffffff] font-sans tracking-tight leading-none group-hover:text-white max-w-[150px] sm:max-w-full truncate">
                        {tool.name}
                    </h3>
                </div>
                
                {/* Meta Badge Top Right */}
                <div className="flex shrink-0">
                    <span className={`px-2 py-0.5 text-[10px] font-mono tracking-widest uppercase rounded border whitespace-nowrap ${statusColor}`}>
                        {tool.status}
                    </span>
                </div>
            </div>
            
            {/* Context Line underneath header */}
            {tool.work_context && (tool.work_context.company || tool.work_context.timeline || tool.version) && (
                <div className="flex items-center flex-wrap gap-1 text-[11px] font-mono text-zinc-500 mb-6 border-b border-[#27272a]/50 pb-4 relative z-10">
                   {tool.work_context.company && (
                        <span>@ {tool.work_context.company}</span>
                    )}
                    {(tool.work_context.company && tool.work_context.timeline) && (
                        <span>·</span>
                    )}
                    {tool.work_context.timeline && (
                        <span>{tool.work_context.timeline}</span>
                    )}
                     {(tool.version) && (
                         <>
                            <span>·</span>
                            <span className="text-[#a1a1aa] bg-[#27272a] px-1 py-0.5 rounded text-[9px] leading-none">{tool.version}</span>
                         </>
                    )}
                </div>
            )}

            {/* 2. Text Content container */}
            <div className="flex-grow z-10 relative">
                {/* Fixed height box showing 3 lines max originally */}
                <p className="text-[14px] text-[#e5e5e5] font-sans leading-relaxed line-clamp-3 group-hover:line-clamp-none transition-all duration-[400ms] w-full">
                    {tool.description}
                </p>

                {/* Secret expanding compartment for Contributions */}
                <div className="max-h-0 opacity-0 group-hover:max-h-[300px] group-hover:opacity-100 group-hover:mt-6 overflow-hidden transition-all duration-[400ms] ease-in-out">
                    {tool.my_role?.contributions && tool.my_role.contributions.length > 0 && (
                        <div className="bg-[#000000]/40 rounded p-4 border border-[#27272a]/30 mt-2">
                            <h4 className="text-[10px] font-mono text-[#a1a1aa] uppercase tracking-widest mb-3 pb-2 border-b border-[#27272a]/50">
                                {tool.my_role.title ? `Role: ${tool.my_role.title}` : 'Contributions'}
                            </h4>
                            <ul className="space-y-1.5 list-none m-0 p-0 text-[12px] text-zinc-400 font-sans">
                                {tool.my_role.contributions.map((contribution, idx) => (
                                    <li key={idx} className="flex gap-2">
                                        <span className="text-[#a1a1aa] shrink-0 mt-[1px]">•</span> 
                                        <span className="leading-snug">{contribution}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            </div>

            {/* 3. Footer pinned to bottom (links + stack) */}
            <div className="mt-8 flex justify-between items-center gap-4 pt-4 border-t border-[#27272a]/50 relative z-10 shrink-0">
                <div className="flex gap-2">
                    {visibleTags.map((tech, i) => (
                        <span key={i} className="px-2 py-0.5 text-[10px] font-mono text-[#85858b] bg-[#18181b] border border-[#27272a] rounded whitespace-nowrap">
                            {tech}
                        </span>
                    ))}
                    {hiddenCount > 0 && (
                        <span className="px-1.5 py-0.5 text-[10px] font-mono text-[#6b7280] flex items-center bg-transparent">
                            +{hiddenCount}
                        </span>
                    )}
                </div>

                <div className="flex items-center gap-2 shrink-0">
                   {tool.links?.github && (
                        <a href={tool.links.github} target="_blank" rel="noreferrer" className="text-[11px] font-mono px-2 py-1.5 bg-[#000000] border border-[#27272a] rounded hover:border-[#3f3f46] hover:text-[#ededed] transition-colors text-zinc-500 flex items-center gap-1.5 shadow-sm">
                            <Github className="w-3.5 h-3.5" /> Code
                        </a>
                    )}
                    {tool.links?.demo && (
                        <a href={tool.links.demo} target="_blank" rel="noreferrer" className="text-[11px] font-mono px-3 py-1.5 bg-[#ffffff] text-[#000000] border border-[#ffffff] rounded hover:bg-zinc-200 transition-colors flex items-center justify-center gap-1.5 font-bold shadow-sm">
                            Demo <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                    )}
                </div>
            </div>

            {/* Subtle decorative mesh gradient on hover so card isn't completely flat */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/[0.015] rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none z-0 mix-blend-screen transform translate-x-1/3 -translate-y-1/3" />
        </div>
    );
};
