import React from 'react';
import type { Project } from '../../types/lab-state';
import { Github, Terminal } from 'lucide-react';

interface ToolRegistryProps {
    projects: Project[];
    onSelectProject: (id: string) => void;
}

const getStatusColor = (score: number) => {
    if (score > 80) return 'bg-emerald-500/50';
    if (score > 50) return 'bg-orange-500/50';
    return 'bg-zinc-700';
};

export const ToolRegistry: React.FC<ToolRegistryProps> = ({ projects, onSelectProject }) => {
    return (
        <div className="space-y-12 pb-32">
            {/* Header */}
            <div className="pt-12 pb-6 border-b border-zinc-800/50">
                <h1 className="text-2xl md:text-3xl font-serif text-zinc-100 tracking-tight mb-2">
                    Tool Registry
                </h1>
                <p className="text-base text-zinc-500 font-light max-w-2xl leading-relaxed">
                    A catalog of engineering artifacts, experiments, and systems built in the lab.
                </p>
            </div>

            {/* Project Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {projects.map(project => (
                    <div key={project.id} className="group relative border border-zinc-900 bg-zinc-950/50 p-6 hover:bg-zinc-900 transition-colors">
                        <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center gap-3">
                                <Terminal className="w-5 h-5 text-zinc-600 group-hover:text-zinc-400 transition-colors" />
                                <h3 className="text-lg font-bold text-zinc-200 font-mono tracking-tight group-hover:text-white">
                                    {project.name}
                                </h3>
                            </div>
                            <div className={`w-2 h-2 rounded-full ${getStatusColor(project.health.score)}`} />
                        </div>

                        <p className="text-sm text-zinc-400 leading-relaxed mb-6 font-serif opacity-80 h-10 line-clamp-2">
                            {project.description}
                        </p>

                        <div className="flex items-center justify-between mt-auto pt-4 border-t border-zinc-900">
                            <div className="flex gap-2 text-[10px] font-mono uppercase tracking-widest text-zinc-600">
                                {/* Tags could go here if we had them */}
                                <span>v{project.health.breakdown.decision_velocity > 0 ? 'Active' : 'Stable'}</span>
                            </div>

                            <div className="flex items-center gap-4">
                                {project.repository_url && (
                                    <a href={project.repository_url} target="_blank" rel="noopener noreferrer" className="text-zinc-600 hover:text-white transition-colors">
                                        <Github className="w-4 h-4" />
                                    </a>
                                )}
                                <button
                                    onClick={() => onSelectProject(project.id)}
                                    className="text-xs font-mono text-zinc-500 hover:text-orange-400 transition-colors flex items-center gap-1"
                                >
                                    Journal <ArrowRight className="w-3 h-3" />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

const ArrowRight = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>
);
