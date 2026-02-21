import React from 'react';
import type { Tool } from '../../types/lab-state';
import { ExternalLink, Database, Globe, Network, Smartphone, BrainCircuit, Terminal, AlertTriangle, Code2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface ToolCardProps {
    tool: Tool;
}

const getTypeIcon = (type?: string) => {
    switch (type?.toUpperCase()) {
        case 'BACKEND': return <Database className="w-4 h-4" />;
        case 'FRONTEND': return <Globe className="w-4 h-4" />;
        case 'FULLSTACK': return <Network className="w-4 h-4" />;
        case 'MOBILE': return <Smartphone className="w-4 h-4" />;
        case 'AI_ML': return <BrainCircuit className="w-4 h-4" />;
        case 'DEVOPS': return <Terminal className="w-4 h-4" />;
        default: return <Database className="w-4 h-4" />;
    }
};

const getStatusStyles = (status: string) => {
    switch (status?.toUpperCase()) {
        case 'ACTIVE':
            return { badge: 'bg-[#22c55e]/10 border-[#22c55e]/20 text-[#22c55e]', ring: 'hover:border-[#22c55e]/50' };
        case 'EXPERIMENTAL':
            return { badge: 'bg-[#f97316]/10 border-[#f97316]/20 text-[#f97316]', ring: 'hover:border-[#f97316]/50' };
        case 'DEPRECATED':
            return { badge: 'bg-[#ef4444]/10 border-[#ef4444]/20 text-[#ef4444]', ring: 'hover:border-[#ef4444]/50' };
        case 'ARCHIVED':
            return { badge: 'bg-[#3f3f46]/20 border-[#27272a] text-[#85858b]', ring: 'hover:border-[#3f3f46]' };
        default:
            return { badge: 'bg-[#18181b] border-[#27272a] text-[#a1a1aa]', ring: 'hover:border-[#3f3f46]' };
    }
};

export const ToolCard: React.FC<ToolCardProps> = ({ tool }) => {
    const statusStyle = getStatusStyles(tool.status);

    // Safety check for dates
    const updatedTime = tool.updated_at
        ? formatDistanceToNow(new Date(tool.updated_at), { addSuffix: true })
        : 'Unknown';

    return (
        <div className={`group relative flex flex-col bg-[#18181b] border border-[#27272a] rounded-lg p-6 hover:-translate-y-1 hover:shadow-elevated hover:bg-[#18181b]/90 transition-all duration-200 ease-out cursor-pointer ${statusStyle.ring} min-h-[320px] max-w-full h-full`}>

            {/* 1. Header Section */}
            <div className="flex items-start justify-between mb-3 gap-4">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-[#000000] border border-[#27272a] rounded-md text-[#a1a1aa]">
                        {getTypeIcon(tool.type)}
                    </div>
                    <div>
                        <h3 className="text-[18px] font-bold text-[#ffffff] font-sans tracking-tight leading-tight">
                            {tool.name}
                        </h3>
                        {tool.version && (
                            <span className="text-[11px] font-mono text-[#6b7280]">
                                {tool.version}
                            </span>
                        )}
                    </div>
                </div>

                <span className={`text-[10px] font-mono uppercase tracking-widest px-2 py-0.5 rounded border whitespace-nowrap mt-1 ${statusStyle.badge}`}>
                    {tool.status}
                </span>
            </div>

            {/* 2. Context Bar */}
            {tool.work_context && (
                <div className="flex items-center gap-1.5 text-[12px] font-mono text-[#6b7280] mb-4 border-b border-[#27272a]/50 pb-4">
                    <span>@ {tool.work_context.company || 'Independent'}</span>
                    {tool.work_context.team && (
                        <>
                            <span>·</span>
                            <span>{tool.work_context.team}</span>
                        </>
                    )}
                    {tool.work_context.timeline && (
                        <>
                            <span>·</span>
                            <span>{tool.work_context.timeline}</span>
                        </>
                    )}
                </div>
            )}

            {/* 3. Description */}
            <p className="text-[14px] text-[#e5e5e5] font-sans leading-relaxed mb-5">
                {tool.description}
            </p>

            {/* 4. Your Role Section */}
            {tool.my_role && (
                <div className="mb-5 bg-[#000000]/40 rounded-md p-4 border border-[#27272a]/30">
                    <h4 className="text-[11px] font-mono text-[#a1a1aa] uppercase tracking-widest mb-2 border-b border-[#27272a]/50 pb-2">
                        {tool.my_role.title ? `MY ROLE: ${tool.my_role.title}` : 'MY CONTRIBUTIONS:'}
                    </h4>
                    {tool.my_role.contributions && tool.my_role.contributions.length > 0 && (
                        <ul className="space-y-1.5 list-disc list-inside text-[13px] text-[#a1a1aa] font-sans">
                            {tool.my_role.contributions.map((contribution, idx) => (
                                <li key={idx} className="leading-snug">{contribution}</li>
                            ))}
                        </ul>
                    )}
                </div>
            )}

            {/* 7. Deprecation Warning */}
            {tool.status === 'DEPRECATED' && tool.deprecation && (
                <div className="mb-5 bg-[#ef4444]/5 border border-[#ef4444]/20 rounded-md p-4">
                    <div className="flex items-center gap-2 text-[#ef4444] font-bold text-[11px] font-mono uppercase tracking-widest mb-1.5">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        WHY DEPRECATED
                    </div>
                    <p className="text-[13px] text-[#e5e5e5] leading-snug">
                        {tool.deprecation.reason}
                    </p>
                    {tool.deprecation.replacement && (
                        <p className="text-[12px] text-[#6b7280] mt-2 font-mono">
                            Replaced by: <span>{tool.deprecation.replacement}</span>
                        </p>
                    )}
                </div>
            )}

            <div className="flex-grow" /> {/* Push content to bottom gracefully */}

            {/* 5. Tech Stack */}
            {(tool.tech_stack || tool.tags) && (
                <div className="mb-5 space-y-2 text-[12px] font-mono text-[#85858b]">
                    {tool.tech_stack?.frontend && tool.tech_stack.frontend.length > 0 && (
                        <div><span className="text-[#a1a1aa]">Frontend:</span> {tool.tech_stack.frontend.join(' • ')}</div>
                    )}
                    {tool.tech_stack?.backend && tool.tech_stack.backend.length > 0 && (
                        <div><span className="text-[#a1a1aa]">Backend:</span> {tool.tech_stack.backend.join(' • ')}</div>
                    )}
                    {tool.tech_stack?.devops && tool.tech_stack.devops.length > 0 && (
                        <div><span className="text-[#a1a1aa]">DevOps:</span> {tool.tech_stack.devops.join(' • ')}</div>
                    )}
                    {/* Fallback for flat structure or legacy tags */}
                    {(!tool.tech_stack?.frontend && !tool.tech_stack?.backend && !tool.tech_stack?.devops) && (
                        <div className="flex flex-wrap gap-1.5 items-center">
                            <Code2 className="w-3.5 h-3.5 opacity-50 mr-1" />
                            {tool.tech_stack?.other ? tool.tech_stack.other.join(' • ') : tool.tags?.join(' • ')}
                        </div>
                    )}
                </div>
            )}

            {/* 6. Metadata Footer */}
            <div className="pt-4 border-t border-[#27272a]/50 flex flex-wrap items-center justify-between gap-4">

                {/* Meta details */}
                <div className="flex items-center gap-3 text-[11px] font-mono text-[#6b7280]">
                    {tool.type && <span className="uppercase tracking-widest text-[#a1a1aa]">{tool.type}</span>}

                    {tool.metrics?.lines_of_code && (
                        <>
                            <span>•</span>
                            <span>{tool.metrics.lines_of_code > 1000 ? `${(tool.metrics.lines_of_code / 1000).toFixed(1)}K LOC` : `${tool.metrics.lines_of_code} LOC`}</span>
                        </>
                    )}

                    <span>•</span>
                    <span className="truncate max-w-[120px]" title={tool.updated_at}>Up: {updatedTime}</span>
                </div>

                {/* 8. Action Buttons */}
                {tool.links && Object.keys(tool.links).length > 0 && (
                    <div className="flex items-center gap-2">
                        {tool.links.github && (
                            <a href={tool.links.github} target="_blank" rel="noreferrer" className="text-[11px] font-mono px-2 py-1 bg-[#000000] border border-[#27272a] rounded shadow-subtle hover:border-[#3f3f46] hover:text-[#ededed] transition-colors cursor-pointer z-10">
                                Code
                            </a>
                        )}
                        {tool.links.demo && (
                            <a href={tool.links.demo} target="_blank" rel="noreferrer" className="text-[11px] font-mono px-2 py-1 bg-[#000000] border border-[#27272a] rounded shadow-subtle hover:border-[#3f3f46] hover:text-[#ededed] transition-colors cursor-pointer z-10 flex items-center gap-1">
                                Demo <ExternalLink className="w-2.5 h-2.5" />
                            </a>
                        )}
                    </div>
                )}
            </div>

        </div>
    );
};
