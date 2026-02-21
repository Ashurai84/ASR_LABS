import React from 'react';
import type { Tool } from '../../types/lab-state';
import { ExternalLink, Database, Globe, Network, Smartphone, BrainCircuit, Terminal, ArrowUpRight, Github } from 'lucide-react';

interface ToolCardProps {
    tool: Tool;
}

const getTypeIcon = (type?: string) => {
    switch (type?.toUpperCase()) {
        case 'BACKEND': return <Database className="w-5 h-5 text-zinc-400" />;
        case 'FRONTEND': return <Globe className="w-5 h-5 text-zinc-400" />;
        case 'FULLSTACK': return <Network className="w-5 h-5 text-zinc-400" />;
        case 'MOBILE': return <Smartphone className="w-5 h-5 text-zinc-400" />;
        case 'AI_ML': return <BrainCircuit className="w-5 h-5 text-zinc-400" />;
        case 'DEVOPS': return <Terminal className="w-5 h-5 text-zinc-400" />;
        default: return <Database className="w-5 h-5 text-zinc-400" />;
    }
};

const getStatusColor = (status: string) => {
    switch (status?.toUpperCase()) {
        case 'ACTIVE': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
        case 'EXPERIMENTAL': return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
        case 'DEPRECATED': return 'bg-red-500/10 text-red-500 border-red-500/20';
        default: return 'bg-zinc-800 text-zinc-400 border-zinc-700';
    }
};

export const ToolCard: React.FC<ToolCardProps> = ({ tool }) => {
    const statusColor = getStatusColor(tool.status);

    return (
        <div className="group block no-underline transition-all">
            <div className="relative h-full p-6 sm:p-8 bg-[#0a0a0a] border border-zinc-800 hover:border-zinc-700 rounded-3xl transition-all duration-300 hover:shadow-2xl hover:shadow-white/[0.02] flex flex-col justify-between overflow-hidden">
                
                {/* Minimal Header */}
                <div className="flex items-start justify-between mb-8">
                    <div className="p-3 bg-zinc-900 rounded-2xl border border-zinc-800/80">
                        {getTypeIcon(tool.type)}
                    </div>
                    <div className="flex flex-col items-end gap-2">
                        <span className={`px-3 py-1 text-[10px] font-mono tracking-widest uppercase rounded-full border ${statusColor}`}>
                            {tool.status}
                        </span>
                        {tool.version && (
                            <span className="text-[11px] font-mono text-zinc-600">
                                {tool.version}
                            </span>
                        )}
                    </div>
                </div>

                {/* Body Content */}
                <div className="space-y-4 mb-10">
                    <h3 className="text-2xl sm:text-3xl font-serif text-zinc-100 tracking-tight leading-none group-hover:text-white transition-colors">
                        {tool.name}
                    </h3>
                    
                    {/* Minimal Context Bar */}
                    {tool.work_context && (
                        <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-zinc-500">
                            {tool.work_context.company && (
                                <span className="text-zinc-400">{tool.work_context.company}</span>
                            )}
                            {tool.work_context.timeline && (
                                <>
                                    <span className="opacity-50">•</span>
                                    <span>{tool.work_context.timeline}</span>
                                </>
                            )}
                        </div>
                    )}

                    <p className="text-sm sm:text-base text-zinc-400 font-sans leading-relaxed line-clamp-3 group-hover:line-clamp-none transition-all duration-500">
                        {tool.description}
                    </p>
                </div>

                {/* Footer / Meta */}
                <div className="mt-auto flex flex-col sm:flex-row sm:items-end justify-between gap-6 pt-6 border-t border-zinc-800/50">
                    
                    {/* Tech Pills */}
                    <div className="flex flex-wrap gap-2">
                        {tool.tech_stack ? (
                            Object.values(tool.tech_stack).flat().slice(0, 3).map((tech: string, i) => (
                                <span key={i} className="px-2.5 py-1 text-[11px] font-mono text-zinc-300 bg-zinc-900 border border-zinc-800 rounded-lg">
                                    {tech}
                                </span>
                            ))
                        ) : tool.tags?.slice(0, 3).map((tag, i) => (
                            <span key={i} className="px-2.5 py-1 text-[11px] font-mono text-zinc-300 bg-zinc-900 border border-zinc-800 rounded-lg">
                                {tag}
                            </span>
                        ))}
                        {(tool.tech_stack ? Object.values(tool.tech_stack).flat().length : tool.tags?.length || 0) > 3 && (
                            <span className="px-2.5 py-1 text-[11px] font-mono text-zinc-600 bg-zinc-900/50 border border-zinc-800/50 rounded-lg">
                                +{(tool.tech_stack ? Object.values(tool.tech_stack).flat().length : tool.tags?.length || 0) - 3}
                            </span>
                        )}
                    </div>

                    {/* Links */}
                    <div className="flex items-center gap-3">
                        {tool.links?.github && (
                            <a href={tool.links.github} target="_blank" rel="noreferrer" className="p-2 text-zinc-500 hover:text-white bg-zinc-900/50 hover:bg-zinc-800 rounded-full transition-colors border border-transparent hover:border-zinc-700">
                                <Github className="w-4 h-4" />
                            </a>
                        )}
                        {tool.links?.demo && (
                            <a href={tool.links.demo} target="_blank" rel="noreferrer" className="flex items-center gap-2 px-4 py-2 text-xs font-mono font-medium text-black bg-white hover:bg-zinc-200 rounded-full transition-colors">
                                Demo <ArrowUpRight className="w-3.5 h-3.5" />
                            </a>
                        )}
                    </div>
                </div>

                {/* Hover Glow Effect */}
                <div className="absolute inset-0 z-[-1] bg-gradient-to-b from-white/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 duration-300 rounded-3xl" />
            </div>
        </div>
    );
};
