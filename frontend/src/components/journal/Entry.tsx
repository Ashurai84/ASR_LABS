import React from 'react';
import type { TimelineEvent } from '../../types/lab-state';
import { format } from 'date-fns';
import { Target, GitCommit, Rocket, Activity, AlertTriangle } from 'lucide-react';

interface EntryProps {
    event: TimelineEvent;
    isLastInGroup?: boolean;
    showProject?: boolean;
}

const getEventIcon = (type: string) => {
    switch (type) {
        case 'decision': return <Target className="w-4 h-4 text-orange-400" />;
        case 'milestone': return <Activity className="w-4 h-4 text-zinc-400" />;
        case 'ship': return <Rocket className="w-4 h-4 text-emerald-400" />;
        case 'incident': return <AlertTriangle className="w-4 h-4 text-red-500" />;
        case 'pulse': return <GitCommit className="w-3 h-3 text-zinc-600" />;
        default: return <Activity className="w-3 h-3 text-zinc-600" />;
    }
};

export const MajorEntry: React.FC<EntryProps> = ({ event, showProject }) => {
    return (
        <div className="relative py-2 group">
            {/* Timeline Connector - Centered on Spine */}
            <div className="absolute left-0 translate-x-[-50%] top-6 bottom-[-24px] w-px bg-zinc-900 group-last:hidden" />

            {/* Icon Marker - Centered on Spine */}
            <div className="absolute left-0 translate-x-[-50%] top-3 p-1 bg-zinc-950 border border-zinc-900 rounded-full z-10 box-content">
                {getEventIcon(event.type)}
            </div>

            {/* Content */}
            <div className="space-y-2 pt-0">
                <div className="flex flex-col gap-0.5">
                    <div className="flex items-center gap-3">
                        <h3 className="text-base md:text-lg font-bold text-zinc-100 font-sans tracking-tight leading-snug group-hover:text-white transition-colors">
                            {event.title}
                        </h3>
                        {showProject && (
                            <span className="text-[9px] font-mono text-zinc-600 bg-zinc-900 border border-zinc-800 px-1.5 py-0.5 rounded uppercase tracking-widest">
                                {event.project_id}
                            </span>
                        )}
                    </div>
                    <span className="text-[10px] text-zinc-600 font-mono tracking-widest uppercase opacity-70">
                        {format(new Date(event.date), 'HH:mm')} • {event.type}
                    </span>
                </div>

                {/* Narrative Body - Editorial Support */}
                <div className="max-w-2xl">
                    {event.derived.summary_text && !event.details?.rationale && (
                        <p className="text-zinc-500 text-sm leading-relaxed mb-2 font-serif opacity-90">
                            {event.derived.summary_text}
                        </p>
                    )}

                    {/* Decision Specifics - Primary Content */}
                    {event.type === 'decision' && event.details?.rationale && (
                        <div className="mt-2 space-y-2">
                            <p className="text-zinc-400 text-[14px] leading-6 font-serif border-l border-zinc-900 pl-4 py-0.5">
                                {event.details.rationale}
                            </p>

                            {event.details?.outcome && (
                                <div className="flex items-start gap-2 pl-4 text-[11px] text-zinc-600 mt-1">
                                    <span className="text-emerald-500/30 mt-[2px]">↳</span>
                                    <span className="opacity-80 leading-relaxed font-mono italic">{event.details.outcome}</span>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export const MinorEntry: React.FC<EntryProps> = ({ event, isLastInGroup, showProject }) => {
    return (
        <div className="relative py-1 group">
            {/* Timeline Connector */}
            {!isLastInGroup && (
                <div className="absolute left-0 translate-x-[-50%] top-2 bottom-[-10px] w-px bg-zinc-900/50" />
            )}

            {/* Icon Marker - Minimal Dot */}
            <div className="absolute left-0 translate-x-[-50%] top-2.5 w-1 h-1 bg-zinc-900 rounded-full z-10 ring-[6px] ring-black" />

            {/* Content - Compact Line */}
            <div className="flex items-baseline gap-3 opacity-40 hover:opacity-100 transition-opacity duration-200">
                {showProject && (
                    <span className="text-[9px] font-mono text-zinc-700 uppercase tracking-widest border-r border-zinc-800 pr-2">
                        {event.project_id}
                    </span>
                )}
                <div className="flex flex-col min-w-0 flex-1">
                    <div className="flex items-baseline gap-2">
                        <span className={`text-[11px] font-mono truncate transition-colors ${event.type === 'pulse' ? 'text-zinc-500 font-bold' : 'text-zinc-500'}`}>
                            {event.title}
                        </span>
                        <span className="text-[9px] text-zinc-800 font-mono whitespace-nowrap">
                            {format(new Date(event.date), 'HH:mm')}
                        </span>
                    </div>
                    {event.type === 'pulse' && event.details?.messages && event.details.messages.length > 0 && (
                        <p className="text-[10px] text-zinc-700 font-mono truncate italic opacity-60">
                            → {event.details.messages[0]}
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};
