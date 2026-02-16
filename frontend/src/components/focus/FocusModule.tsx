import React from 'react';
import type { Project } from '../../types/lab-state';
import { Activity, Flame, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface FocusModuleProps {
    project: Project | undefined;
    globalHealth: number;
}

export const FocusModule: React.FC<FocusModuleProps> = ({ project, globalHealth }) => {
    if (!project) {
        return (
            <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-lg flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-zinc-800 rounded-full">
                        <Clock className="w-5 h-5 text-zinc-500" />
                    </div>
                    <div>
                        <h3 className="text-sm font-medium text-zinc-400 uppercase tracking-widest">Current Focus</h3>
                        <p className="text-zinc-500">No active focus detected.</p>
                    </div>
                </div>
                <div className="text-right">
                    <span className="text-xs text-zinc-600 block">System Health</span>
                    <span className="text-lg font-mono text-zinc-400">{globalHealth}%</span>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-zinc-900 border border-zinc-700 p-6 rounded-lg shadow-lg relative overflow-hidden group">
            {/* Background Pulse Effect */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />

            <div className="flex justify-between items-start relative z-10">
                <div className="flex items-start gap-4">
                    <div className="p-3 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
                        <Flame className="w-6 h-6 text-emerald-400 animate-pulse" />
                    </div>
                    <div>
                        <h3 className="text-xs font-semibold text-emerald-500 uppercase tracking-widest mb-1">Currently Building</h3>
                        <h2 className="text-2xl font-bold text-white mb-2">{project.name}</h2>
                        <div className="flex items-center gap-3 text-sm text-zinc-400">
                            <span className="flex items-center gap-1.5">
                                <Activity className="w-4 h-4" />
                                Focus Score: <span className="text-white font-mono">{project.derived.focus_score}</span>
                            </span>
                            <span>•</span>
                            <span>
                                Last updated {formatDistanceToNow(new Date(project.derived.last_event_date), { addSuffix: true })}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="text-right hidden sm:block">
                    <div className="inline-flex flex-col items-end">
                        <span className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Global Health</span>
                        <div className="flex items-baseline gap-1">
                            <span className={`text-2xl font-mono font-bold ${globalHealth > 80 ? 'text-emerald-400' : 'text-yellow-400'}`}>
                                {globalHealth}
                            </span>
                            <span className="text-xs text-zinc-600">/ 100</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
