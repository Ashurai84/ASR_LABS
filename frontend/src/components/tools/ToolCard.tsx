import React, { useState } from 'react';
import type { Tool } from '../../types/lab-state';
import { ExternalLink, Database, Globe, Network, Smartphone, BrainCircuit, Terminal, AlertTriangle, Code2, ChevronDown, ChevronUp } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface ToolCardProps {
    tool: Tool;
}

const getTypeIcon = (type?: string) => {
    switch (type?.toUpperCase()) {
        case 'BACKEND': return <Database className="w-5 h-5" />;
        case 'FRONTEND': return <Globe className="w-5 h-5" />;
        case 'FULLSTACK': return <Network className="w-5 h-5" />;
        case 'MOBILE': return <Smartphone className="w-5 h-5" />;
        case 'AI_ML': return <BrainCircuit className="w-5 h-5" />;
        case 'DEVOPS': return <Terminal className="w-5 h-5" />;
        default: return <Database className="w-5 h-5" />;
    }
};

const getStatusStyles = (status: string) => {
    switch (status?.toUpperCase()) {
        case 'ACTIVE':
            return { badge: 'bg-[#22c55e]/10 border-[#22c55e]/20 text-[#22c55e]' };
        case 'EXPERIMENTAL':
            return { badge: 'bg-[#f97316]/10 border-[#f97316]/20 text-[#f97316]' };
        case 'DEPRECATED':
            return { badge: 'bg-[#ef4444]/10 border-[#ef4444]/20 text-[#ef4444]' };
        case 'ARCHIVED':
            return { badge: 'bg-[#3f3f46]/20 border-[#27272a] text-[#85858b]' };
        default:
            return { badge: 'bg-[#18181b] border-[#27272a] text-[#a1a1aa]' };
    }
};

export const ToolCard: React.FC<ToolCardProps> = ({ tool }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const statusStyle = getStatusStyles(tool.status);

    // Safety check for dates
    const updatedTime = tool.updated_at
        ? formatDistanceToNow(new Date(tool.updated_at), { addSuffix: true })
        : 'Unknown';

    // Highlight numbers/metrics in description safely
    const highlightMetrics = (text: string) => {
        if (!text) return text;
        // Simple regex to find numbers (e.g. 50K, 500+, 99%)
        const parts = text.split(/(\b\d+[KkMmBb+]?%?\b)/g);
        return parts.map((part, i) => {
            if (/^\d+[KkMmBb+]?%?$/.test(part)) {
                return <strong key={i} className="text-[#f97316] font-bold">{part}</strong>;
            }
            return <React.Fragment key={i}>{part}</React.Fragment>;
        });
    };

    return (
        <div className="group flex flex-col bg-[#18181b] border border-[#27272a] rounded-xl p-6 hover:border-[#3f3f46] hover:shadow-[0_8px_24px_rgba(0,0,0,0.5)] hover:-translate-y-1 transition-all duration-200 ease-out h-[max-content] min-h-[380px]">

            {/* 1. Header Section */}
            <div className="flex items-start justify-between mb-5 gap-4">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-400">
                        {getTypeIcon(tool.type)}
                    </div>
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-[19px] font-bold text-white tracking-tight leading-none">
                                {tool.name}
                            </h3>
                            {tool.version && (
                                <span className="bg-zinc-800 text-zinc-300 px-1.5 py-0.5 rounded text-[10px] font-mono font-medium tracking-wide">
                                    {tool.version}
                                </span>
                            )}
                        </div>
                        <span className={`inline-block text-[10px] font-mono uppercase tracking-widest px-2 py-0.5 rounded border whitespace-nowrap ${statusStyle.badge}`}>
                            {tool.status}
                        </span>
                    </div>
                </div>
            </div>

            {/* 2. Context Bar */}
            {tool.work_context && (
                <div className="bg-zinc-900/50 rounded-lg p-3 mb-5 border border-zinc-800/50 flex flex-wrap gap-x-2 gap-y-1 text-xs font-mono text-zinc-400 items-center">
                    <span className="text-zinc-300">@ {tool.work_context.company || 'Independent'}</span>
                    {tool.work_context.team && (
                        <>
                            <span className="text-zinc-600">|</span>
                            <span>{tool.work_context.team}</span>
                        </>
                    )}
                    {tool.work_context.timeline && (
                        <>
                            <span className="text-zinc-600">|</span>
                            <span>{tool.work_context.timeline}</span>
                        </>
                    )}
                </div>
            )}

            {/* 3. Description (Truncated unless expanded) */}
            <div className={`text-sm text-zinc-300 font-sans leading-relaxed mb-5 ${!isExpanded ? 'line-clamp-3 overflow-hidden text-ellipsis' : ''}`}>
                {highlightMetrics(tool.description)}
            </div>

            {/* 4. EXPANDABLE SECTION */}
            {isExpanded && (
                <div className="animate-in fade-in slide-in-from-top-2 duration-300 ease-out space-y-6 mb-6">

                    {/* Role & Contributions */}
                    {tool.my_role && tool.my_role.contributions && tool.my_role.contributions.length > 0 && (
                        <div className="bg-black/40 rounded-lg p-4 border border-zinc-800/50">
                            <div className="inline-block px-2 py-1 bg-zinc-800/80 text-zinc-300 text-[10px] font-mono uppercase tracking-widest rounded mb-4">
                                {tool.my_role.title ? `Role: ${tool.my_role.title}` : 'My Contributions'}
                            </div>
                            <ul className="space-y-2.5 list-none m-0 p-0">
                                {tool.my_role.contributions.map((contribution, idx) => (
                                    <li key={idx} className="flex gap-2.5 text-[13px] text-zinc-400 font-sans leading-snug">
                                        <span className="text-orange-500 mt-1 flex-shrink-0">•</span>
                                        <span>{highlightMetrics(contribution)}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Tech Stack */}
                    {(tool.tech_stack || (tool.tags && tool.tags.length > 0)) && (
                        <div className="space-y-2.5 text-xs font-mono text-zinc-500 bg-zinc-900/40 p-4 rounded-lg border border-zinc-800/40">
                            <div className="text-[10px] uppercase tracking-widest text-zinc-600 mb-2 border-b border-zinc-800/50 pb-2">Technical Stack</div>

                            {tool.tech_stack?.frontend && tool.tech_stack.frontend.length > 0 && (
                                <div className="flex flex-wrap gap-2 items-center">
                                    <span className="text-zinc-400 w-16">FRONT:</span>
                                    {tool.tech_stack.frontend.map((t: string) => <span key={t} className="px-1.5 py-0.5 bg-zinc-800 text-zinc-300 rounded">{t}</span>)}
                                </div>
                            )}

                            {tool.tech_stack?.backend && tool.tech_stack.backend.length > 0 && (
                                <div className="flex flex-wrap gap-2 items-center">
                                    <span className="text-zinc-400 w-16">BACK:</span>
                                    {tool.tech_stack.backend.map((t: string) => <span key={t} className="px-1.5 py-0.5 bg-zinc-800 text-zinc-300 rounded">{t}</span>)}
                                </div>
                            )}

                            {tool.tech_stack?.devops && tool.tech_stack.devops.length > 0 && (
                                <div className="flex flex-wrap gap-2 items-center">
                                    <span className="text-zinc-400 w-16">OPS:</span>
                                    {tool.tech_stack.devops.map((t: string) => <span key={t} className="px-1.5 py-0.5 bg-zinc-800 text-zinc-300 rounded">{t}</span>)}
                                </div>
                            )}

                            {/* Fallback for plain array or other */}
                            {(!tool.tech_stack?.frontend && !tool.tech_stack?.backend && !tool.tech_stack?.devops) && (
                                <div className="flex flex-wrap gap-2 items-center">
                                    {(tool.tech_stack?.other || tool.tags || []).map((t: string) => (
                                        <span key={t} className="px-1.5 py-0.5 bg-zinc-800 text-zinc-300 rounded">{t}</span>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Deprecation Warning */}
                    {tool.status?.toUpperCase() === 'DEPRECATED' && tool.deprecation && (
                        <div className="bg-red-500/5 border border-red-500/20 rounded-lg p-4">
                            <div className="flex items-center gap-2 text-red-500 font-bold text-[11px] font-mono uppercase tracking-widest mb-2.5">
                                <AlertTriangle className="w-3.5 h-3.5" />
                                Why Deprecated
                            </div>
                            <p className="text-[13px] text-zinc-300 leading-snug">
                                {tool.deprecation.reason}
                            </p>
                            {tool.deprecation.replacement && (
                                <p className="text-[11px] text-zinc-500 mt-3 font-mono">
                                    Replaced by: <span className="text-zinc-300 underline decoration-zinc-700 underline-offset-2">{tool.deprecation.replacement}</span>
                                </p>
                            )}
                        </div>
                    )}

                    {/* Links */}
                    {tool.links && Object.keys(tool.links).length > 0 && (
                        <div className="flex items-center gap-3 pt-2">
                            {tool.links.github && (
                                <a href={tool.links.github} target="_blank" rel="noreferrer" className="flex-1 text-center text-[12px] font-mono px-4 py-2 bg-zinc-900 border border-zinc-800 rounded outline-none hover:bg-zinc-800 hover:border-zinc-700 hover:text-white transition-all cursor-pointer text-zinc-300 shadow-sm">
                                    View Source
                                </a>
                            )}
                            {tool.links.demo && (
                                <a href={tool.links.demo} target="_blank" rel="noreferrer" className="flex-1 text-center text-[12px] font-mono px-4 py-2 bg-orange-500/10 border border-orange-500/20 rounded hover:bg-orange-500/20 hover:border-orange-500/40 text-orange-500 transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-sm">
                                    Live Demo <ExternalLink className="w-3.5 h-3.5" />
                                </a>
                            )}
                        </div>
                    )}
                </div>
            )}

            <div className="flex-grow" />

            {/* 5. Footer with Expand toggle and Meta */}
            <div className="pt-4 border-t border-zinc-800/50 flex flex-wrap lg:flex-nowrap items-center justify-between gap-3 mt-auto">

                <button
                    onClick={(e) => { e.stopPropagation(); setIsExpanded(!isExpanded); }}
                    className="flex items-center gap-1.5 text-[11px] font-mono font-medium text-zinc-400 hover:text-white transition-colors bg-zinc-900/50 px-3 py-1.5 rounded-md border border-zinc-800/50 hover:bg-zinc-800"
                >
                    {isExpanded ? (
                        <><ChevronUp className="w-3.5 h-3.5" /> Hide Details</>
                    ) : (
                        <><ChevronDown className="w-3.5 h-3.5" /> View Details</>
                    )}
                </button>

                <div className="flex items-center gap-2.5 text-[10px] font-mono text-zinc-600 bg-zinc-900/30 px-2 py-1.5 rounded-md">
                    <span className="uppercase tracking-widest text-zinc-500">{tool.type || 'TOOL'}</span>

                    {tool.metrics?.lines_of_code && (
                        <>
                            <span>•</span>
                            <span title={`${tool.metrics.lines_of_code} LOC`}>
                                {tool.metrics.lines_of_code > 1000 ? `${(tool.metrics.lines_of_code / 1000).toFixed(1)}K LOC` : tool.metrics.lines_of_code}
                            </span>
                        </>
                    )}

                    <span>•</span>
                    <span className="truncate max-w-[80px]" title={`Last updated: ${tool.updated_at}`}>Up: {updatedTime}</span>
                </div>
            </div>

        </div>
    );
};
