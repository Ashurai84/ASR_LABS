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

const getStatusColor = (status: string) => {
    switch (status?.toUpperCase()) {
        case 'ACTIVE': return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20';
        case 'EXPERIMENTAL': return 'text-amber-500 bg-amber-500/10 border-amber-500/20';
        case 'DEPRECATED': return 'text-red-500 bg-red-500/10 border-red-500/20';
        default: return 'text-zinc-400 bg-zinc-800/50 border-zinc-700/50';
    }
};

export const ToolCard: React.FC<ToolCardProps> = ({ tool }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const statusColor = getStatusColor(tool.status);

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
        <>
            {/* The Card */}
            <div
                onClick={() => setIsModalOpen(true)}
                className="group block no-underline h-[280px] w-full bg-[#111] border border-zinc-800/80 rounded-2xl p-6 transition-all duration-300 hover:border-zinc-700 hover:bg-[#141414] relative overflow-hidden flex flex-col cursor-pointer hover:shadow-[0_8px_30px_rgba(0,0,0,0.4)] hover:-translate-y-1"
            >

                <div className="flex-grow z-10 flex flex-col justify-start pointer-events-none">

                    {/* 1. Ultra-Clean Header Row */}
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 bg-black/40 rounded-xl border border-zinc-800/50 shadow-inner shrink-0 group-hover:bg-zinc-900 group-hover:border-zinc-700/50 transition-colors">
                            {getTypeIcon(tool.type, "w-5 h-5 text-zinc-500 group-hover:text-zinc-300 transition-colors")}
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
                                        <span className="text-zinc-500 font-mono text-[10px] tracking-wide uppercase truncate max-w-[120px]">
                                            @ {tool.work_context.company}
                                        </span>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* 2. Text Content  */}
                    <div className="flex-grow z-10 flex flex-col mt-2">
                        <p className="text-[14px] text-zinc-400 font-sans leading-[1.6] line-clamp-3 group-hover:text-zinc-300 transition-colors">
                            {tool.description || "No description provided."}
                        </p>
                    </div>

                </div>

                {/* 3. Footer Bar - Pinned to bottom */}
                <div className="flex flex-wrap items-center justify-between gap-4 pt-5 border-t border-zinc-800/50 shrink-0 group-hover:border-zinc-700/50 transition-colors mt-auto z-10 relative pointer-events-auto">

                    {/* Tags Container */}
                    <div className="flex gap-1.5 shrink-1 overflow-hidden">
                        {visibleTags.map((tech, i) => (
                            <span key={i} className="px-2 py-1 text-[10px] font-mono text-zinc-400 bg-black/40 border border-zinc-800/50 rounded-md shrink-0 whitespace-nowrap group-hover:border-zinc-700/50 transition-colors pointer-events-none">
                                {tech}
                            </span>
                        ))}
                        {hiddenCount > 0 && (
                            <span className="px-1.5 py-1 text-[10px] font-mono text-zinc-600 font-medium tracking-wide pointer-events-none">
                                +{hiddenCount}
                            </span>
                        )}
                    </div>

                    {/* Links */}
                    <div className="flex items-center gap-2 shrink-0">
                        {tool.links?.github && (
                            <a href={tool.links.github} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()} className="p-2 bg-black/40 border border-zinc-800/50 hover:border-zinc-600  rounded-lg transition-all text-zinc-500 hover:text-white shadow-sm z-10">
                                <Github className="w-3.5 h-3.5" />
                            </a>
                        )}
                        {tool.links?.demo && (
                            <a href={tool.links.demo} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()} className="px-3 py-1.5 text-[11px] font-mono font-bold text-black bg-zinc-200 hover:bg-white rounded-lg transition-all shadow-sm flex items-center gap-1.5 z-10">
                                Demo <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                        )}
                    </div>
                </div>

                <div className="absolute -top-12 -right-12 w-48 h-48 bg-white/[0.015] rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none z-0 mix-blend-screen" />
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
EOF
