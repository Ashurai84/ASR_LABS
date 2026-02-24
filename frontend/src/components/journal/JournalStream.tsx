import React, { useMemo } from 'react';
import type { TimelineEvent, Project } from '../../types/lab-state';
import { format, isSameDay } from 'date-fns';
import { MajorEntry, MinorEntry } from './Entry';
import { GitCommit } from 'lucide-react';
import { ProjectHeader } from '../project/ProjectHeader';
import { motion } from 'framer-motion';

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

    return (
        <div className="space-y-6 pb-32">
            {/* Conditional Header Rendering */}
            {selectedProjectId && currentProject ? (
                <ProjectHeader project={currentProject} />
            ) : (
                <motion.div
                    initial={{ opacity: 0, scale: 0.98, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    className="bg-zinc-900/30 w-full rounded-xl px-6 py-5 md:py-6 border border-zinc-800/50 mb-10 mt-2 md:mt-4 relative overflow-hidden group shadow-subtle"
                >
                    {/* Background subtle glow */}
                    <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />

                    <div className="flex flex-col gap-3 relative z-10">
                        <div className="flex items-center gap-2.5">
                            {/* Pulsing Dot */}
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                            </span>
                            <h1 className="text-xs md:text-sm font-mono text-zinc-300 font-semibold tracking-wider uppercase">
                                ASR Lab Workspace
                            </h1>
                        </div>

                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.6, delay: 0.3 }}
                            className="text-[14px] md:text-[15px] text-zinc-400 leading-relaxed font-sans max-w-2xl"
                        >
                            A live engineering journal documenting real-time architectural decisions, codebase evolution, and technical learning across all active projects.
                        </motion.p>
                    </div>
                </motion.div>
            )}

            {/* Timeline Stream - Compressed Rhythm */}
            {groupedEvents.length > 0 ? (
                <div className="relative border-l border-[#27272a] ml-4 md:ml-4 pl-4 md:pl-5 space-y-8 mt-6">
                    {groupedEvents.map((group, groupIdx) => (
                        <motion.div
                            key={groupIdx}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-10%" }}
                            transition={{ duration: 0.5, ease: "easeOut" }}
                            className="relative group/day"
                        >
                            {/* Day Marker - Centered on Spine */}
                            <div className="absolute left-0 translate-x-[-50%] top-0 flex items-center justify-center h-5 px-2 bg-[#18181b] border border-[#27272a] rounded-md z-10 text-[9px] font-mono text-[#a1a1aa] shadow-subtle uppercase tracking-wider transition-colors duration-300 group-hover/day:border-[#3f3f46] group-hover/day:text-[#ededed]">
                                {format(group.date, 'MMM d')}
                            </div>

                            {/* Events in Day */}
                            <div className="space-y-6 pt-6">
                                {group.events.map((event, idx) => {
                                    const isMajor = ['decision', 'ship', 'milestone', 'incident'].includes(event.type);

                                    return isMajor ? (
                                        <MajorEntry key={event.id} event={event} showProject={!selectedProjectId} />
                                    ) : (
                                        <MinorEntry key={event.id} event={event} isLastInGroup={idx === group.events.length - 1} showProject={!selectedProjectId} />
                                    );
                                })}
                            </div>
                        </motion.div>
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
