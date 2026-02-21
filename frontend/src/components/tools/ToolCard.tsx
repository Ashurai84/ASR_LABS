import React from 'react';
import type { Tool } from '../../types/lab-state';
import { ExternalLink, Database, Globe, Network, Smartphone, BrainCircuit, Terminal, Github, Code2 } from 'lucide-react';

interface ToolCardProps {
    tool: Tool;
}

const getTypeIcon = (type?: string) => {
    switch (type?.toUpperCase()) {
        case 'BACKEND': return <Database className="w-5 h-5 text-[#85858b] group-hover:text-[#e5e5e5] transition-colors" />;
        case 'FRONTEND': return <Globe className="w-5 h-5 text-[#85858b] group-hover:text-[#e5e5e5] transition-colors" />;
        case 'FULLSTACK': return <Network className="w-5 h-5 text-[#85858b] group-hover:text-[#e5e5e5] transition-colors" />;
        case 'MOBILE': return <Smartphone className="w-5 h-5 text-[#85858b] group-hover:text-[#e5e5e5] transition-colors" />;
        case 'AI_ML': return <BrainCircuit className="w-5 h-5 text-[#85858b] group-hover:text-[#e5e5e5] transition-colors" />;
        case 'DEVOPS': return <Terminal className="w-5 h-5 text-[#85858b] group-hover:text-[#e5e5e5] transition-colors" />;
        default: return <Code2 className="w-5 h-5 text-[#85858b] group-hover:text-[#e5e5e5] transition-colors" />;
    }
};

const getStatusColor = (status: string) => {
    switch (status?.toUpperCase()) {
        case 'ACTIVE': return 'text-[#22c55e] border-[#22c55e]/20 bg-[#22c55e]/10';
        case 'EXPERIMENTAL': return 'text-[#f97316] border-[#f97316]/20 bg-[#f97316]/10';
        case 'DEPRECATED': return 'text-[#ef4444] border-[#ef4444]/20 bg-[#ef4444]/10';
        default: return 'text-[#a1a1aa] border-[#27272a] bg-[#18181b]';
    }
};

export const ToolCard: React.FC<ToolCardProps> = ({ tool }) => {
    const statusColor = getStatusColor(tool.status);
    
    // Safely aggregate tags
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
        <div className="group flex flex-col h-full min-h-[300px] w-full bg-[#18181b] border border-[#27272a] rounded-xl p-6 transition-all duration-300 hover:border-[#3f3f46] hover:bg-[#1f1f22] cursor-default relative overflow-hidden">
            
            {/* Ambient Background Mesh on hover */}
            <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-white/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

            {/* 1. Header (Icon Top Left, Pills Right side) */}
            <div className="flex justify-between items-start mb-5 z-10 relative">
                <div className="flex gap-4">
                    <div className="p-3 bg-[#111] rounded-lg border border-[#27272a] shadow-inner shrink-0 group-hover:bg-[#18181b] transition-colors">
                        {getTypeIcon(tool.type)}
                    </div>
                </div>
                <div className="flex flex-col items-end gap-1.5">
                    <span className={`px-2 py-0.5 text-[9px] font-mono tracking-widest uppercase rounded border ${statusColor}`}>
                        {tool.status}
                    </span>
                    {tool.version && (
                        <span className="text-[10px] font-mono text-[#6b7280]">
                            {tool.version}
                        </span>
                    )}
                </div>
            </div>

            {/* 2. Text Content container */}
            <div className="flex-grow z-10 relative flex flex-col gap-2">
                <h3 className="text-[20px] font-bold text-[#e5e5e5] tracking-tight leading-tight group-hover:text-white transition-colors">
                    {tool.name}
                </h3>
                
                {/* Context Line */}
                <div className="text-[12px] font-mono text-[#6b7280] flex items-center gap-1.5 flex-wrap">
                    {tool.type && <span className="text-[#a1a1aa] uppercase">{tool.type}</span>}
                    {(tool.work_context?.company) && (
                        <>
                            <span>·</span>
                            <span className="truncate max-w-[120px]">@ {tool.work_context.company}</span>
                        </>
                    )}
                </div>

                {/* Description text block */}
                <p className="text-[14px] text-[#85858b] font-sans leading-relaxed line-clamp-3 group-hover:text-[#a1a1aa] transition-colors mt-2 mb-4">
                    {tool.description || "No description provided."}
                </p>
                
                {/* Expandable Role Area */}
                {(tool.my_role?.contributions && tool.my_role.contributions.length > 0) && (
                    <div className="max-h-0 opacity-0 group-hover:max-h-[300px] group-hover:opacity-100 group-hover:mt-2 overflow-hidden transition-all duration-500 ease-in-out">
                         <div className="mt-2 pt-4 border-t border-[#27272a]/50">
                             <div className="text-[10px] uppercase font-mono tracking-widest text-[#6b7280] mb-3 border border-[#27272a] inline-block px-1.5 py-0.5 rounded bg-[#111]">
                                 {tool.my_role.title ? `Role: ${tool.my_role.title}` : 'Contributions'}
                             </div>
                             <ul className="space-y-1.5">
                                 {tool.my_role.contributions.map((cont, i) => (
                                     <li key={i} className="text-[12px] text-[#a1a1aa] font-sans flex items-start gap-2">
                                         <span className="text-[#6b7280] mt-[1px]">•</span> 
                                         <span className="leading-snug line-clamp-2">{cont}</span>
                                     </li>
                                 ))}
                             </ul>
                         </div>
                    </div>
                )}
            </div>

            {/* 3. Footer row */}
            <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-[#27272a]/50 mt-4 relative z-10 shrink-0">
                {/* Tech Pills */}
                <div className="flex gap-1.5 shrink-1 overflow-hidden">
                    {visibleTags.map((tech, i) => (
                        <span key={i} className="px-2 py-0.5 text-[10px] font-mono text-[#85858b] bg-[#111] border border-[#27272a] rounded shrink-0 whitespace-nowrap">
                            {tech}
                        </span>
                    ))}
                    {hiddenCount > 0 && (
                        <span className="px-1.5 py-0.5 text-[10px] font-mono text-[#6b7280] shrink-0 border border-transparent">
                            +{hiddenCount}
                        </span>
                    )}
                </div>

                {/* Meta Details / Actions */}
                <div className="flex items-center gap-2 shrink-0">
                     {tool.links?.github && (
                        <a href={tool.links.github} target="_blank" rel="noreferrer" className="text-[10px] font-mono px-2 py-1 bg-[#111] border border-[#27272a] hover:border-[#3f3f46] hover:bg-[#27272a] rounded transition-all text-[#85858b] hover:text-[#e5e5e5] shadow-sm font-medium z-10">
                            Code
                        </a>
                     )}
                     {tool.links?.demo && (
                        <a href={tool.links.demo} target="_blank" rel="noreferrer" className="text-[10px] font-mono px-2.5 py-1 bg-[#e5e5e5] hover:bg-[#ffffff] text-[#111] hover:text-black rounded transition-all shadow-sm font-bold flex items-center gap-1 z-10">
                            Demo <ExternalLink className="w-2.5 h-2.5" />
                        </a>
                     )}
                </div>
            </div>
        </div>
    );
};
