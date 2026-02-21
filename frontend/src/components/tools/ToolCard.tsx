import React from 'react';
import type { Tool } from '../../types/lab-state';
import { ExternalLink, Database, Globe, Network, Smartphone, BrainCircuit, Terminal, ArrowUpRight, Github } from 'lucide-react';
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
        default: return <Database className="w-5 h-5 text-[#85858b] group-hover:text-white transition-colors" />;
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
    
    const updatedTime = tool.updated_at
        ? formatDistanceToNow(new Date(tool.updated_at), { addSuffix: true })
        : 'Unknown';

    return (
        <div className="group block no-underline h-full min-h-[360px]">
            <div className="relative h-full p-6 lg:p-7 bg-[#111111] border border-[#27272a] group-hover:border-[#3f3f46] rounded-xl transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-[0_8px_30px_rgba(0,0,0,0.6)] flex flex-col justify-between overflow-hidden cursor-default">
                
                {/* 1. Ultra Minimal Header */}
                <div className="flex items-start justify-between mb-6 z-10 relative">
                    <div className="flex gap-4 items-center">
                        <div className="p-2.5 bg-[#18181b] rounded-lg border border-[#27272a] shadow-inner shrink-0 group-hover:bg-[#27272a] transition-colors">
                            {getTypeIcon(tool.type)}
                        </div>
                        <div>
                            <h3 className="text-xl font-serif font-medium text-[#e5e5e5] tracking-tight leading-none group-hover:text-white transition-colors">
                                {tool.name}
                            </h3>
                            {tool.work_context && (
                                <div className="text-[11px] font-mono text-[#6b7280] mt-1.5 flex items-center gap-1.5 flex-wrap">
                                    {tool.work_context.company && (
                                        <span className="text-[#a1a1aa]">{tool.work_context.company}</span>
                                    )}
                                    {tool.work_context.company && tool.work_context.timeline && <span>·</span>}
                                    {tool.work_context.timeline && <span>{tool.work_context.timeline}</span>}
                                    {tool.version && (
                                        <>
                                            <span>·</span>
                                            <span className="px-1.5 py-0.5 bg-[#27272a] text-[#85858b] rounded-sm text-[9px]">{tool.version}</span>
                                        </>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Status Badge pulled into body to reduce header clutter */}
                 <div className="mb-4 flex z-10 relative">
                        <span className={`px-2 py-0.5 text-[9px] font-mono font-bold tracking-[0.15em] uppercase rounded-sm border ${statusColor}`}>
                            {tool.status}
                        </span>
                </div>

                {/* 2. Body Text Area */}
                <div className="space-y-4 mb-4 flex-grow z-10 relative">
                    <div className="relative">
                       <p className="text-[14px] text-[#85858b] font-sans leading-relaxed line-clamp-3 group-hover:line-clamp-none transition-all duration-500 group-hover:text-[#a1a1aa] max-w-[95%]">
                            {tool.description || "No description provided."}
                        </p>
                    </div>
                    
                    {/* Hover Expanding Area */}
                    <div className="max-h-0 opacity-0 group-hover:max-h-[300px] group-hover:opacity-100 group-hover:mt-4 overflow-hidden transition-all duration-500 ease-in-out">
                        {tool.my_role?.contributions && tool.my_role.contributions.length > 0 && (
                            <div className="pt-4 border-t border-[#27272a]/50">
                                <span className="text-[10px] font-mono tracking-widest text-[#6b7280] uppercase block mb-3">Role & Contributions</span>
                                <ul className="space-y-2">
                                    {tool.my_role.contributions.map((cont, i) => (
                                        <li key={i} className="text-[12px] text-[#a1a1aa] flex items-start gap-2 max-w-[95%]">
                                            <span className="text-orange-500/50 mt-1 text-[10px] shrink-0">■</span> 
                                            <span className="leading-snug">{cont}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                </div>

                {/* 3. Footer Area */}
                <div className="mt-8 flex flex-wrap items-center justify-between gap-4 pt-5 border-t border-[#27272a] group-hover:border-[#3f3f46] transition-colors z-10 relative shrink-0">
                    
                    {/* Tech Pills */}
                    <div className="flex flex-wrap gap-1.5 max-w-[60%]">
                        {visibleTags.map((tech, i) => (
                            <span key={i} className="px-2 py-1 text-[10px] font-mono text-[#85858b] bg-[#18181b] border border-[#27272a] rounded-sm truncate max-w-[100px]" title={tech}>
                                {tech}
                            </span>
                        ))}
                        {hiddenCount > 0 && (
                            <span className="px-2 py-1 text-[10px] font-mono text-[#6b7280] bg-transparent rounded-sm flex items-center">
                                +{hiddenCount}
                            </span>
                        )}
                    </div>

                    {/* Action Links */}
                    <div className="flex items-center gap-2">
                        {tool.links?.github && (
                            <a href={tool.links.github} target="_blank" rel="noreferrer" className="p-2 text-[#85858b] hover:text-white bg-[#18181b] border border-[#27272a] hover:border-[#3f3f46] hover:bg-[#27272a] rounded-md transition-all shadow-sm">
                                <Github className="w-4 h-4" />
                            </a>
                        )}
                        {tool.links?.demo && (
                            <a href={tool.links.demo} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-mono font-bold text-[#111] bg-[#e5e5e5] hover:bg-white rounded-md transition-all shadow-sm">
                                Demo <ArrowUpRight className="w-3.5 h-3.5" />
                            </a>
                        )}
                    </div>
                </div>

                {/* Secret Glow Effect */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-[#ffffff]/[0.015] rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none z-0 transform translate-x-1/2 -translate-y-1/2" />
            </div>
        </div>
    );
};
