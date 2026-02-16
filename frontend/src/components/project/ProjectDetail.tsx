import React from 'react';
import type { Project, TimelineEvent, EventType } from '../../types/lab-state';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { GitCommit, Target, Rocket, AlertTriangle, Activity } from 'lucide-react';

const STATUS_COLORS: Record<string, string> = {
    idea: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
    build: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
    shipped: 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20',
    paused: 'bg-zinc-500/10 text-zinc-500 border-zinc-500/20',
};

const getEventIcon = (type: EventType) => {
    switch (type) {
        case 'decision': return <Target className="w-4 h-4 text-orange-400" />;
        case 'milestone': return <Activity className="w-4 h-4 text-blue-400" />;
        case 'ship': return <Rocket className="w-4 h-4 text-emerald-400" />;
        case 'incident': return <AlertTriangle className="w-4 h-4 text-red-500" />;
        case 'pulse': return <GitCommit className="w-4 h-4 text-zinc-500" />;
        default: return <Activity className="w-4 h-4" />;
    }
};

interface ProjectDetailProps {
    project: Project;
    events: TimelineEvent[];
}

export const ProjectDetail: React.FC<ProjectDetailProps> = ({ project, events }) => {
    return (
        <AnimatePresence mode="wait">
            <motion.div
                key={project.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="space-y-8"
            >
                {/* Header */}
                <div className="border-b border-zinc-800 pb-6">
                    <div className="flex items-center gap-3 mb-3">
                        <span className={`px-2 py-0.5 text-xs rounded-full border ${STATUS_COLORS[project.status] || STATUS_COLORS.idea} font-medium tracking-wide uppercase`}>
                            {project.status}
                        </span>
                        <span className="text-xs text-zinc-500 font-mono">
                            Health Score: <span className={project.health.score > 70 ? 'text-emerald-500' : 'text-yellow-500'}>{project.health.score}</span>
                        </span>
                    </div>
                    <h1 className="text-4xl font-bold text-white mb-3 tracking-tight">{project.name}</h1>
                    <p className="text-zinc-400 max-w-2xl leading-relaxed text-lg">{project.description || "No description provided."}</p>
                </div>

                {/* Timeline Feed */}
                <div className="relative border-l border-zinc-800 ml-3 space-y-10 pl-8 py-2">
                    {events.map((event) => (
                        <div key={event.id} className="relative group">
                            <div className="absolute -left-[39px] top-1 p-1 bg-zinc-950 border border-zinc-800 rounded-full group-hover:border-zinc-600 transition-colors z-10">
                                {getEventIcon(event.type)}
                            </div>

                            <div className="mb-1 flex items-baseline gap-3 flex-wrap">
                                <span className="text-base font-semibold text-zinc-200 group-hover:text-emerald-400 transition-colors">
                                    {event.title}
                                </span>
                                <span className="text-xs text-zinc-500 whitespace-nowrap font-mono">
                                    {format(new Date(event.date), 'MMM d, yyyy')}
                                </span>
                            </div>

                            {event.derived.summary_text && (
                                <p className="text-zinc-400 mb-3 leading-relaxed text-sm">
                                    {event.derived.summary_text}
                                </p>
                            )}

                            {/* Decision Rationale */}
                            {event.type === 'decision' && event.details?.rationale && (
                                <div className="mt-3 text-sm bg-zinc-900/50 p-4 rounded-lg border border-zinc-800/50">
                                    <div className="mb-2">
                                        <span className="text-orange-400/90 font-medium uppercase text-xs tracking-wider block mb-1">Rationale</span>
                                        <span className="text-zinc-300">{event.details.rationale}</span>
                                    </div>
                                    {event.details?.outcome && (
                                        <div className="mt-3 pt-3 border-t border-zinc-800/50">
                                            <span className="text-emerald-400/90 font-medium uppercase text-xs tracking-wider block mb-1">Outcome</span>
                                            <span className="text-zinc-300">{event.details.outcome}</span>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    ))}

                    {events.length === 0 && (
                        <div className="py-12 text-center border border-dashed border-zinc-800 rounded-lg">
                            <p className="text-zinc-500 italic">No timeline activity recorded.</p>
                        </div>
                    )}
                </div>
            </motion.div>
        </AnimatePresence>
    );
};
