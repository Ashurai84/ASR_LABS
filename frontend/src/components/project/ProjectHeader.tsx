import React from 'react';
import type { Project } from '../../types/lab-state';
import { Github, Tag, Terminal } from 'lucide-react';

interface ProjectHeaderProps {
    project: Project;
}

export const ProjectHeader: React.FC<ProjectHeaderProps> = ({ project }) => {
    return (
        <div className="pt-8 pb-6 border-b border-zinc-900/50">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-6">
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <Terminal className="w-5 h-5 text-orange-500/50" />
                        <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight font-sans">
                            {project.name}
                        </h1>
                    </div>

                    <p className="text-zinc-400 text-sm md:text-base leading-relaxed font-serif italic max-w-2xl">
                        {project.description || "A deep dive into the project's evolution and technical decisions."}
                    </p>

                    <div className="flex flex-wrap items-center gap-3">
                        <span className={`text-[10px] font-mono uppercase tracking-[0.2em] px-2 py-0.5 rounded border border-zinc-900 ${project.status === 'shipped' ? 'text-emerald-500 bg-emerald-500/5' : 'text-orange-500 bg-orange-500/5'
                            }`}>
                            {project.status}
                        </span>

                        {project.repository_url && (
                            <a
                                href={project.repository_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1.5 text-[10px] font-mono text-zinc-500 hover:text-zinc-300 transition-colors bg-zinc-900/40 px-2 py-0.5 rounded border border-zinc-800/50"
                            >
                                <Github className="w-3 h-3" />
                                REPOSITORY
                            </a>
                        )}

                        <div className="flex items-center gap-1.5 text-[10px] font-mono text-zinc-500 bg-zinc-900/40 px-2 py-0.5 rounded border border-zinc-800/50">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500/50" />
                            HEALTH {project.health.score}%
                        </div>
                    </div>
                </div>
            </div>

            {project.tags?.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-2">
                    {project.tags.map(tag => (
                        <div key={tag} className="flex items-center gap-1 text-[9px] font-mono text-zinc-600 uppercase tracking-widest">
                            <Tag className="w-2.5 h-2.5 opacity-30" />
                            {tag}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
