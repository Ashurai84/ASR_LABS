import React, { useState, useEffect } from 'react';
import type { Tool } from '../../types/lab-state';
import { ExternalLink, Database, Globe, Network, Smartphone, BrainCircuit, Terminal, Github, Code2, X } from 'lucide-react';

interface ToolCardProps {
    tool: Tool;
}

const getTypeIcon = (type?: string, className?: string) => {
    switch (type?.toUpperCase()) {
        case 'BACKEND': return <Database className={className || "w-5 h-5"} />;
        case 'FRONTEND': return <Globe className={className || "w-5 h-5"} />;
        case 'FULLSTACK': return <Network className={className || "w-5 h-5"} />;
        case 'MOBILE': return <Smartphone className={className || "w-5 h-5"} />;
        case 'AI_ML': return <BrainCircuit className={className || "w-5 h-5"} />;
        case 'DEVOPS': return <Terminal className={className || "w-5 h-5"} />;
        default: return <Code2 className={className || "w-5 h-5"} />;
    }
};

const getStatusInfo = (status: string) => {
    switch (status?.toUpperCase()) {
        case 'ACTIVE': return { color: 'text-emerald-500', dot: 'bg-emerald-500' };
        case 'EXPERIMENTAL': return { color: 'text-amber-500', dot: 'bg-amber-500' };
        case 'DEPRECATED': return { color: 'text-red-500', dot: 'bg-red-500' };
        default: return { color: 'text-zinc-500', dot: 'bg-zinc-600' };
    }
};

export const ToolCard: React.FC<ToolCardProps> = ({ tool }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const statusInfo = getStatusInfo(tool.status);

    // Lock body scroll when modal is open
    useEffect(() => {
        if (isModalOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isModalOpen]);

    // Aggregate Tags into a clean string
    let displayTags: string[] = [];
    if (tool.tech_stack) {
        Object.values(tool.tech_stack).forEach(arr => {
            if (Array.isArray(arr)) displayTags = [...displayTags, ...arr];
        });
    } else if (Array.isArray(tool.tags)) {
        displayTags = [...tool.tags];
    }
    const tagsString = displayTags.slice(0, 4).join(' • ') + (displayTags.length > 4 ? ` • +${displayTags.length - 4}` : '');

    return (
        <>
            {/* The Card - Ultra Premium Minimalist */}
            <div
                onClick={() => setIsModalOpen(true)}
                className="group block relative h-[260px] w-full bg-[#050505] border border-white/5 rounded-2xl p-6 transition-all duration-500 hover:border-white/10 hover:bg-[#0a0a0a] cursor-pointer flex flex-col justify-between hover:-translate-y-1 hover:shadow-[0_8px_30px_rgba(0,0,0,0.4)]"
            >
                <div className="flex flex-col gap-4 pointer-events-none">
                    {/* Header Sequence */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="flex items-center justify-center w-8 h-8 bg-white/[0.02] rounded-lg border border-white/5 text-zinc-400 group-hover:text-zinc-200 transition-colors">
                                {getTypeIcon(tool.type, "w-4 h-4")}
                            </div>
                            <div className="flex items-center gap-2">
                                <div className={`w-1.5 h-1.5 rounded-full ${statusInfo.dot} shadow-[0_0_8px_currentColor]`} />
                                <span className="text-[10px] font-mono tracking-widest uppercase text-zinc-500 group-hover:text-zinc-400 transition-colors">{tool.status}</span>
                            </div>
                        </div>
                    </div>

                    {/* Title and Context */}
                    <div className="mt-2 text-left">
                        <h3 className="text-[20px] font-medium font-sans text-[#ededed] tracking-tight leading-tight mb-2 line-clamp-1 group-hover:text-white transition-colors">
                            {tool.name}
                        </h3>
                        <p className="text-[13px] text-zinc-500 font-sans leading-[1.6] line-clamp-3 group-hover:text-zinc-400 transition-colors pr-2">
                            {tool.description || "No description provided."}
                        </p>
                    </div>
                </div>

                {/* Footer Sequence */}
                <div className="flex flex-col gap-3 pointer-events-none mt-auto">
                    <div className="flex items-center gap-2 text-[10px] font-mono text-zinc-600 uppercase tracking-widest truncate">
                        {tool.type && <span>{tool.type}</span>}
                        {tool.work_context?.company && (
                            <>
                                <span>·</span>
                                <span className="text-zinc-500">@ {tool.work_context.company}</span>
                            </>
                        )}
                        {tool.version && (
                            <>
                                <span>·</span>
                                <span>v{tool.version}</span>
                            </>
                        )}
                    </div>

                    <div className="w-full h-px bg-white/5 group-hover:bg-white/10 transition-colors" />

                    <div className="text-[10px] font-mono text-zinc-500 truncate group-hover:text-zinc-400 transition-colors">
                        {tagsString || 'NO ARCHITECTURE DEFINED'}
                    </div>
                </div>

                {/* Lighting effects */}
                <div className="absolute inset-0 bg-gradient-to-tr from-white/[0.04] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 rounded-2xl pointer-events-none" />
                <div className="absolute top-6 right-6 text-zinc-800 group-hover:text-zinc-600 transition-colors duration-500">
                    <ExternalLink className="w-4 h-4 opacity-0 -translate-x-2 translate-y-2 group-hover:opacity-100 group-hover:translate-x-0 group-hover:translate-y-0 transition-all duration-300" />
                </div>
            </div>

            {/* Modal Overlay */}
            {isModalOpen && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
                    onClick={() => setIsModalOpen(false)}
                >
                    <div
                        className="w-full max-w-2xl max-h-[90vh] bg-[#0a0a0a] border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col relative animate-in zoom-in-95 duration-200"
                        onClick={(e) => e.stopPropagation()} // Prevent click from closing when clicking inside
                    >

                        {/* Modal Header */}
                        <div className="flex items-start justify-between p-6 sm:p-8 border-b border-zinc-800/50 bg-[#111]">
                            <div className="flex items-center gap-4">
                                <div className="p-3.5 bg-zinc-900 border border-zinc-800 rounded-xl shadow-inner shrink-0">
                                    {getTypeIcon(tool.type, "w-6 h-6 text-zinc-300")}
                                </div>
                                <div>
                                    <h2 className="text-2xl font-serif font-bold text-white tracking-tight leading-none mb-2">
                                        {tool.name}
                                    </h2>
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <span className={`px-2 py-[2px] text-[9px] font-mono tracking-widest uppercase rounded flex items-center border ${statusColor}`}>
                                            {tool.status}
                                        </span>
                                        {tool.version && (
                                            <span className="text-zinc-400 font-mono text-[10px] bg-zinc-800 px-2 py-0.5 rounded-sm">
                                                {tool.version}
                                            </span>
                                        )}
                                        {tool.type && (
                                            <span className="text-zinc-500 font-mono text-[10px] tracking-wide uppercase ml-1">
                                                {tool.type}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="p-2 text-zinc-500 hover:text-white hover:bg-zinc-800 rounded-full transition-colors shrink-0"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-6 sm:p-8 overflow-y-auto custom-scrollbar flex-grow space-y-8">

                            {/* Context & Description */}
                            <div className="space-y-4">
                                {tool.work_context && (
                                    <div className="flex items-center gap-2 text-xs font-mono text-zinc-500">
                                        {tool.work_context.company && <span className="text-zinc-300 uppercase tracking-widest bg-zinc-800/50 px-2 py-1 rounded">@ {tool.work_context.company}</span>}
                                        {tool.work_context.team && <span>· {tool.work_context.team}</span>}
                                        {tool.work_context.timeline && <span>· {tool.work_context.timeline}</span>}
                                    </div>
                                )}
                                <p className="text-[15px] sm:text-[16px] text-zinc-300 font-sans leading-relaxed">
                                    {tool.description || "No description provided."}
                                </p>
                            </div>

                            {/* Contributions / Role */}
                            {tool.my_role?.contributions && tool.my_role.contributions.length > 0 && (
                                <div className="space-y-3 bg-zinc-900/30 border border-zinc-800/80 rounded-xl p-5">
                                    <h4 className="text-[11px] font-mono text-zinc-500 tracking-widest uppercase mb-1">
                                        {tool.my_role.title ? `Role: ${tool.my_role.title}` : 'Key Contributions'}
                                    </h4>
                                    <ul className="space-y-2">
                                        {tool.my_role.contributions.map((cont, i) => (
                                            <li key={i} className="text-[14px] text-zinc-300 font-sans flex items-start gap-3">
                                                <span className="text-orange-500/80 mt-[5px] text-[8px] shrink-0">▶</span>
                                                <span className="leading-snug">{cont}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {/* Tech Stack */}
                            {displayTags.length > 0 && (
                                <div className="space-y-3">
                                    <h4 className="text-[11px] font-mono text-zinc-500 tracking-widest uppercase border-b border-zinc-800/50 pb-2">
                                        Technology Stack
                                    </h4>

                                    {tool.tech_stack ? (
                                        <div className="space-y-3 pt-2">
                                            {tool.tech_stack.frontend && tool.tech_stack.frontend.length > 0 && (
                                                <div className="grid grid-cols-[80px_1fr] gap-2 items-start">
                                                    <span className="text-[11px] font-mono text-zinc-500 uppercase mt-1">Frontend</span>
                                                    <div className="flex flex-wrap gap-1.5">
                                                        {tool.tech_stack.frontend.map((t: string) => <span key={t} className="px-2 py-1 text-[11px] font-mono text-zinc-300 bg-zinc-800 border border-zinc-700/50 rounded-md shadow-sm">{t}</span>)}
                                                    </div>
                                                </div>
                                            )}
                                            {tool.tech_stack.backend && tool.tech_stack.backend.length > 0 && (
                                                <div className="grid grid-cols-[80px_1fr] gap-2 items-start">
                                                    <span className="text-[11px] font-mono text-zinc-500 uppercase mt-1">Backend</span>
                                                    <div className="flex flex-wrap gap-1.5">
                                                        {tool.tech_stack.backend.map((t: string) => <span key={t} className="px-2 py-1 text-[11px] font-mono text-zinc-300 bg-zinc-800 border border-zinc-700/50 rounded-md shadow-sm">{t}</span>)}
                                                    </div>
                                                </div>
                                            )}
                                            {tool.tech_stack.devops && tool.tech_stack.devops.length > 0 && (
                                                <div className="grid grid-cols-[80px_1fr] gap-2 items-start">
                                                    <span className="text-[11px] font-mono text-zinc-500 uppercase mt-1">DevOps</span>
                                                    <div className="flex flex-wrap gap-1.5">
                                                        {tool.tech_stack.devops.map((t: string) => <span key={t} className="px-2 py-1 text-[11px] font-mono text-zinc-300 bg-zinc-800 border border-zinc-700/50 rounded-md shadow-sm">{t}</span>)}
                                                    </div>
                                                </div>
                                            )}
                                            {/* Fallback for other generic tech stack objects */}
                                            {tool.tech_stack.other && tool.tech_stack.other.length > 0 && (
                                                <div className="grid grid-cols-[80px_1fr] gap-2 items-start">
                                                    <span className="text-[11px] font-mono text-zinc-500 uppercase mt-1">Other</span>
                                                    <div className="flex flex-wrap gap-1.5">
                                                        {tool.tech_stack.other.map((t: string) => <span key={t} className="px-2 py-1 text-[11px] font-mono text-zinc-300 bg-zinc-800 border border-zinc-700/50 rounded-md shadow-sm">{t}</span>)}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="flex flex-wrap gap-1.5 pt-2">
                                            {displayTags.map((tech, i) => (
                                                <span key={i} className="px-2 py-1 text-[11px] font-mono text-zinc-300 bg-zinc-800 border border-zinc-700/50 rounded-md shadow-sm">
                                                    {tech}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Deprecated Reason */}
                            {tool.status?.toUpperCase() === 'DEPRECATED' && tool.deprecation && (
                                <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
                                    <h4 className="text-[11px] font-mono text-red-500 tracking-widest uppercase mb-2">
                                        Why Deprecated?
                                    </h4>
                                    <p className="text-[14px] text-zinc-300 font-sans leading-relaxed">
                                        {tool.deprecation.reason}
                                    </p>
                                    {tool.deprecation.replacement && (
                                        <p className="text-[12px] font-mono text-zinc-500 mt-2">
                                            Replaced by: <span className="text-zinc-300">{tool.deprecation.replacement}</span>
                                        </p>
                                    )}
                                </div>
                            )}

                        </div>

                        {/* Modal Footer (Call to action links) */}
                        <div className="p-6 border-t border-zinc-800/50 bg-[#0a0a0a] flex flex-wrap gap-3">
                            {tool.links?.github && (
                                <a href={tool.links.github} target="_blank" rel="noreferrer" className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 hover:bg-zinc-800 text-zinc-300 hover:text-white rounded-lg transition-all font-mono text-[12px] font-medium">
                                    <Github className="w-4 h-4" /> View Source Code
                                </a>
                            )}
                            {tool.links?.demo && (
                                <a href={tool.links.demo} target="_blank" rel="noreferrer" className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-zinc-200 hover:bg-white text-black rounded-lg transition-all font-sans font-bold text-[13px] shadow-sm">
                                    Launch Demo <ExternalLink className="w-4 h-4" />
                                </a>
                            )}
                            {(!tool.links?.github && !tool.links?.demo) && (
                                <div className="w-full text-center text-zinc-600 text-[12px] font-mono italic">
                                    No public links available for this artifact.
                                </div>
                            )}
                        </div>

                    </div>
                </div>
            )}
        </>
    );
};
