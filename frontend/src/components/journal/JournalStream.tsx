import React, { useMemo } from 'react';
import type { TimelineEvent, Project } from '../../types/lab-state';
import { format, isSameDay } from 'date-fns';
import { MajorEntry, MinorEntry } from './Entry';
import { GitCommit } from 'lucide-react';

interface JournalStreamProps {
    events: TimelineEvent[];
    projects: Project[];
    selectedProjectId: string | null;
}

export const JournalStream: React.FC<JournalStreamProps> = ({ events, projects, selectedProjectId }) => {
    // 1. Filter events if project selected
    const filteredEvents = useMemo(() => {
        if (!selectedProjectId) return events;
        return events.filter(e => e.project_id === selectedProjectId);
    }, [events, selectedProjectId]);

    // 2. Group by Day
    const groupedEvents = useMemo(() => {
        const groups: { date: Date; events: TimelineEvent[] }[] = [];

        // Sort reverse chronological
        const sorted = [...filteredEvents].sort((a, b) =>
            new Date(b.date).getTime() - new Date(a.date).getTime()
        );

        sorted.forEach((event) => {
            const eventDate = new Date(event.date);
            const lastGroup = groups[groups.length - 1];

            if (lastGroup && isSameDay(lastGroup.date, eventDate)) {
                lastGroup.events.push(event);
            } else {
                groups.push({ date: eventDate, events: [event] });
            }
        });

        return groups;
    }, [filteredEvents]);

    // 3. Project Data Helper
    const currentProject = useMemo(() => {
        return projects.find(p => p.id === selectedProjectId);
    }, [projects, selectedProjectId]);

    const getProjectName = (id: string) => {
        return projects.find(p => p.id === id)?.name || id;
    };

    return (
        <div className="space-y-8 pb-32">
            {/* Stream Header */}
            <div className="pt-12 pb-10 border-b border-zinc-800/50">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-4">
                    <div>
                        <h1 className="text-2xl md:text-4xl font-serif text-white tracking-tight leading-tight">
                            {selectedProjectId
                                ? getProjectName(selectedProjectId)
                                : "Engineering Log"}
                        </h1>
                        {selectedProjectId && (
                            <div className="flex items-center gap-4 mt-2">
                                <span className={`text-[10px] font-mono uppercase tracking-[0.2em] px-2 py-0.5 rounded border border-zinc-800 ${currentProject?.status === 'shipped' ? 'text-emerald-500' : 'text-orange-500'
                                    }`}>
                                    {currentProject?.status || 'active'}
                                </span>
                                <div className="flex items-center gap-1.5 text-[10px] font-mono text-zinc-500">
                                    <span className="w-1 h-1 rounded-full bg-zinc-700" />
                                    <span>HEALTH {currentProject?.health.score || 0}%</span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <p className="text-base text-zinc-500 font-light max-w-2xl leading-relaxed font-serif italic">
                    {selectedProjectId
                        ? currentProject?.description || "A deep dive into the project's evolution and technical decisions."
                        : "A living record of architectural decisions, technical failures, and shipped code."}
                </p>
            </div>

            {/* Timeline Stream - Compressed Rhythm */}
            {groupedEvents.length > 0 ? (
                <div className="relative border-l border-zinc-800 ml-3 md:ml-4 pl-6 md:pl-10 space-y-12">
                    {groupedEvents.map((group, groupIdx) => (
                        <div key={groupIdx} className="relative">
                            {/* Day Marker - Tighter */}
                            <div className="absolute -left-[37px] top-0 flex items-center justify-center w-6 h-6 bg-zinc-900 border border-zinc-700/50 rounded-full z-10 text-[10px] font-mono text-zinc-400 shadow-sm shadow-zinc-950">
                                {format(group.date, 'd')}
                            </div>
                            <span className="absolute -left-[34px] top-8 text-[9px] font-mono text-zinc-600 uppercase tracking-widest -rotate-90 origin-top-left translate-y-full w-20 text-center opacity-70">
                                {format(group.date, 'MMM yyyy')}
                            </span>

                            {/* Events in Day */}
                            <div className="space-y-4 pt-1">
                                {group.events.map((event, idx) => {
                                    const isMajor = ['decision', 'ship', 'milestone'].includes(event.type);

                                    return isMajor ? (
                                        <MajorEntry key={event.id} event={event} />
                                    ) : (
                                        <MinorEntry key={event.id} event={event} isLastInGroup={idx === group.events.length - 1} />
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-32 text-zinc-600 space-y-4 select-none">
                    <div className="p-4 bg-zinc-900/50 rounded-full border border-zinc-800/50">
                        <GitCommit className="w-8 h-8 opacity-20" />
                    </div>
                    <p className="font-mono text-sm tracking-widest uppercase opacity-50">No entries recorded.</p>
                </div>
            )}
        </div>
    );
};
