import React from 'react';
import type { TimelineEvent } from '../../types/lab-state';
import { format } from 'date-fns';
import { Activity } from 'lucide-react';

interface EntryProps {
    event: TimelineEvent;
    isLastInGroup?: boolean;
    showProject?: boolean;
}

const getEventIcon = (type: string) => {
    switch (type) {
        case 'decision': return <span className="text-sm">🎯</span>;
        case 'ship': return <span className="text-sm">🚀</span>;
        case 'incident': return <span className="text-sm">🚨</span>;
        case 'note': return <span className="text-sm">📝</span>;
        case 'pulse': return <span className="text-sm">💻</span>;
        case 'milestone': return <Activity className="w-3 h-3 text-zinc-500" />;
        default: return <span className="text-sm">📝</span>;
    }
};

export const MajorEntry: React.FC<EntryProps> = ({ event, showProject }) => {
    return (
        <div className="relative py-2 group transition-all duration-300 ease-out hover:translate-x-1">
            {/* Timeline Connector - Subtle */}
            <div className="absolute left-0 translate-x-[-50%] top-6 bottom-[-16px] w-px bg-[#27272a] group-last:hidden transition-colors duration-300 group-hover:bg-[#3f3f46]" />

            {/* Icon Marker */}
            <div className="absolute left-0 translate-x-[-50%] top-2 p-1.5 bg-black z-10 box-content rounded-full ring-4 ring-black shadow-subtle group-hover:scale-110 transition-transform duration-300">
                {getEventIcon(event.type)}
            </div>

            {/* Content Container (Pulled closer to spine) */}
            <div className="space-y-1.5 pt-0.5 ml-4 p-3 -mt-2 rounded-lg border border-transparent hover:bg-[#18181b] hover:border-[#27272a] hover:shadow-subtle transition-all duration-300 ease-out">
                <div className="flex flex-col gap-0.5">
                    <div className="flex items-center gap-3">
                        <h3 className="text-[17px] font-bold text-[#ffffff] font-serif tracking-tight leading-snug">
                            {event.title}
                        </h3>
                        {showProject && (
                            <span className="text-[9px] font-mono text-[#6b7280] bg-[#18181b] border border-[#27272a] px-1.5 py-0.5 rounded uppercase tracking-widest leading-none">
                                {event.project_id}
                            </span>
                        )}
                    </div>
                    <span className="text-[10px] text-[#6b7280] font-mono tracking-widest uppercase">
                        {format(new Date(event.date), 'HH:mm')} • {event.type}
                    </span>
                </div>

                {/* Narrative Body */}
                <div className="max-w-2xl">
                    {event.derived.summary_text && !event.details?.rationale && (
                        <p className="text-[#6b7280] text-[14px] md:text-[15px] leading-relaxed mb-1 font-sans">
                            {event.derived.summary_text}
                        </p>
                    )}

                    {/* Decision Specifics */}
                    {event.type === 'decision' && event.details?.rationale && (
                        <div className="mt-2 space-y-1.5 pt-1">
                            <p className="text-[#a1a1aa] text-[14px] leading-relaxed font-sans border-l-2 border-[#3f3f46] pl-4 py-0.5">
                                {event.details.rationale}
                            </p>

                            {event.details?.outcome && (
                                <div className="flex items-start gap-2 pl-4 text-[13px] mt-1 font-sans">
                                    <span className="text-[#22c55e] mt-[2px]">↳</span>
                                    <span className="text-[#22c55e] leading-relaxed">{event.details.outcome}</span>
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
        <div className="relative py-1 group transition-all duration-300 ease-out hover:translate-x-1 cursor-default">
            {/* Timeline Connector */}
            {!isLastInGroup && (
                <div className="absolute left-0 translate-x-[-50%] top-2 bottom-[-12px] w-px bg-[#27272a] transition-colors duration-300 group-hover:bg-[#3f3f46]" />
            )}

            {/* Icon Marker - Minimal Emoji */}
            <div className="absolute left-0 translate-x-[-50%] top-1.5 p-1 bg-black z-10 box-content rounded-full ring-4 ring-black leading-none shadow-subtle group-hover:scale-110 transition-transform duration-300">
                {getEventIcon(event.type)}
            </div>

            {/* Content Container */}
            <div className="flex items-baseline gap-3 opacity-70 hover:opacity-100 transition-opacity duration-300 ml-4 p-1.5 rounded-md hover:bg-[#18181b]">
                {showProject && (
                    <span className="text-[9px] font-mono text-[#6b7280] uppercase tracking-widest border-r border-[#27272a] pr-2 shrink-0">
                        {event.project_id}
                    </span>
                )}
                <div className="flex flex-col min-w-0 flex-1 justify-center">
                    <div className="flex items-center gap-2">
                        <span className="text-[13px] text-[#a1a1aa] group-hover:text-[#ededed] font-medium leading-none transition-colors duration-300">
                            {event.title}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};
