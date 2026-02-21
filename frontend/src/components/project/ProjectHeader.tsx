import React from 'react';
import type { Project } from '../../types/lab-state';
import { Github, Tag, Terminal } from 'lucide-react';

interface ProjectHeaderProps {
    project: Project;
}

export const ProjectHeader: React.FC<ProjectHeaderProps> = ({ project }) => {
    return (
        <div className="pt-4 pb-4 border-b border-[#27272a] animate-fade-in">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-4">
                <div className="space-y-3">
                    <div className="flex items-center gap-2">
                        <Terminal className="w-4 h-4 text-orange-500/50" />
                        <h1 className="text-xl md:text-2xl font-bold text-white tracking-tight font-serif">
                            {project.name}
                        </h1>
                    </div>

                    <p className="text-[#6b7280] text-[13px] md:text-[14px] leading-relaxed font-sans max-w-2xl">
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
                                className="flex items-center gap-1.5 text-[10px] font-mono text-[#a1a1aa] hover:text-[#ededed] hover:bg-[#18181b] transition-all duration-200 ease-out bg-[#18181b]/40 px-2 py-0.5 rounded border border-[#27272a]/50 hover:border-[#3f3f46]">
                                <Github className="w-3 h-3" />
                                REPOSITORY
                            </a>
                        )}

                        <div className="flex items-center gap-1.5 text-[10px] font-mono text-[#a1a1aa] bg-[#18181b]/40 px-2 py-0.5 rounded border border-[#27272a]/50">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500/50" />
                            HEALTH {project.health.score}%
                        </div>
                    </div>
                </div>
            </div>

            {Array.isArray(project.tags) && project.tags.length > 0 && (
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
