import React from 'react';
import type { Project, TimelineEvent } from '../../types/lab-state';
import { formatDistanceToNow } from 'date-fns';
import { ChevronRight, Target } from 'lucide-react';
import { ProjectDetail } from './ProjectDetail';

interface ProjectExplorerProps {
    projects: Project[];
    timeline: Record<string, TimelineEvent>;
    onSelectProject: (id: string) => void;
    selectedProjectId: string | null;
}

export const ProjectExplorer: React.FC<ProjectExplorerProps> = ({ projects, timeline, onSelectProject, selectedProjectId }) => {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* List */}
            <div className="lg:col-span-1 border-r border-zinc-800 pr-0 lg:pr-8 space-y-2 max-h-[calc(100vh-200px)] overflow-y-auto scrollbar-thin scrollbar-thumb-zinc-800">
                <h3 className="text-xs uppercase tracking-widest text-zinc-500 mb-4 px-2 font-mono">Registry</h3>
                {projects.map((project) => (
                    <button
                        key={project.id}
                        onClick={() => onSelectProject(project.id)}
                        className={`w-full text-left p-3 rounded-lg flex items-center justify-between transition-all duration-200 group relative
              ${selectedProjectId === project.id
                                ? 'bg-zinc-900 border border-zinc-700 shadow-md ring-1 ring-zinc-700'
                                : 'hover:bg-zinc-900/50 border border-transparent hover:border-zinc-800/50 text-zinc-500 hover:text-zinc-200'}`}
                    >
                        <div>
                            <div className="flex items-center gap-2 mb-1.5">
                                <span className={`w-2 h-2 rounded-full ${project.health.score > 70 ? 'bg-emerald-500' : 'bg-yellow-500'}`} />
                                <span className={`font-semibold text-sm ${selectedProjectId === project.id ? 'text-white' : 'text-zinc-400 group-hover:text-zinc-200'}`}>
                                    {project.name}
                                </span>

                                {/* Status dot */}
                                {selectedProjectId === project.id && (
                                    <span className={`ml-2 w-1.5 h-1.5 rounded-full ${project.status === 'build' ? 'bg-emerald-400 animate-pulse' : 'bg-zinc-600'}`} />
                                )}
                            </div>
                            <p className="text-xs text-zinc-500 truncate max-w-[140px] font-mono">
                                Updated {formatDistanceToNow(new Date(project.derived.last_event_date), { addSuffix: true })}
                            </p>
                        </div>

                        {/* Arrow */}
                        <ChevronRight className={`w-4 h-4 transition-transform ${selectedProjectId === project.id ? 'text-emerald-500 translate-x-1' : 'text-zinc-600 group-hover:text-zinc-400'}`} />
                    </button>
                ))}
            </div>

            {/* Details / Timeline */}
            <div className="lg:col-span-3 min-h-[600px] pl-0 lg:pl-8 border-l border-zinc-800/50 lg:border-none">
                {selectedProjectId ? (
                    <ProjectDetail
                        project={projects.find(p => p.id === selectedProjectId)!}
                        events={projects.find(p => p.id === selectedProjectId)!.timeline_event_ids.map(id => timeline[id]).filter(Boolean)}
                    />
                ) : (
                    <div className="h-full flex flex-col items-center justify-center text-zinc-600 select-none">
                        <div className="p-6 bg-zinc-900/30 rounded-full mb-6 border border-zinc-800/50">
                            <Target className="w-12 h-12 opacity-30 animate-pulse" />
                        </div>
                        <p className="text-sm font-mono tracking-wide uppercase text-zinc-500">Select a module to examine.</p>
                    </div>
                )}
            </div>
        </div>
    );
};
