import React from 'react';
import type { TimelineEvent } from '../../types/lab-state';
import { format } from 'date-fns';
import { Target, GitCommit, Rocket, Activity, AlertTriangle } from 'lucide-react';

interface EntryProps {
    event: TimelineEvent;
    isLastInGroup?: boolean;
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

export const MajorEntry: React.FC<EntryProps> = ({ event }) => {
    return (
        <div className="relative pl-0 md:pl-0 py-2 group">
            {/* Timeline Connector - Closer and subtler */}
            <div className="absolute -left-[24px] top-6 bottom-[-16px] w-px bg-zinc-800 -z-10 group-last:hidden" />

            {/* Icon Marker - Integrated with content flow */}
            <div className="absolute -left-[30px] top-3.5 p-1.5 bg-zinc-950 border border-zinc-800 rounded-full z-10 box-content">
                {getEventIcon(event.type)}
            </div>

            {/* Content */}
            <div className="space-y-3 pt-1">
                {/* Header - Stronger Hierarchy */}
                <div className="flex flex-col gap-1">
                    <h3 className="text-lg md:text-xl font-bold text-zinc-100 font-sans tracking-tight leading-snug">
                        {event.title}
                    </h3>
                    <span className="text-[11px] text-zinc-500 font-mono tracking-wide uppercase opacity-70">
                        {format(new Date(event.date), 'HH:mm')} • {event.type}
                    </span>
                </div>

                {/* Narrative Body - Editorial Support */}
                <div className="prose prose-invert prose-zinc max-w-2xl">
                    {event.derived.summary_text && (
                        <p className="text-zinc-400 text-base leading-relaxed mb-2 font-serif opacity-90">
                            {event.derived.summary_text}
                        </p>
                    )}

                    {/* Decision Specifics - Primary Content */}
                    {event.type === 'decision' && event.details?.rationale && (
                        <div className="mt-3 pl-0 space-y-3">
                            <p className="text-zinc-300 text-[15px] leading-7 font-serif border-l-2 border-zinc-800 pl-4 py-1">
                                {event.details.rationale}
                            </p>

                            {event.details?.outcome && (
                                <div className="flex items-start gap-2 pl-4 text-sm text-zinc-500 mt-2">
                                    <span className="text-emerald-500/50 mt-[3px]">↳</span>
                                    <span className="opacity-80 leading-relaxed font-mono text-xs">{event.details.outcome}</span>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export const MinorEntry: React.FC<EntryProps> = ({ event, isLastInGroup }) => {
    return (
        <div className="relative py-1 group">
            {/* Timeline Connector */}
            {!isLastInGroup && (
                <div className="absolute -left-[24px] top-2 bottom-[-10px] w-px bg-zinc-800/50 -z-10" />
            )}

            {/* Icon Marker - Minimal Dot */}
            <div className="absolute -left-[27px] top-2.5 w-1.5 h-1.5 bg-zinc-800 rounded-full z-10 ring-4 ring-black" />

            {/* Content - Compact Line */}
            <div className="flex items-baseline gap-3 opacity-50 hover:opacity-100 transition-opacity duration-200">
                <span className="text-xs font-mono text-zinc-400 truncate max-w-md">
                    {event.title}
                </span>
                <span className="text-[10px] text-zinc-700 font-mono whitespace-nowrap">
                    {format(new Date(event.date), 'HH:mm')}
                </span>
            </div>
        </div>
    );
};
