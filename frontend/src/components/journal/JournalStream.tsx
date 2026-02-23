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
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    className="pt-2 md:pt-0 pb-10 border-b border-[#27272a]"
                >
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.8, ease: "easeOut", delay: 0.1 }}
                        className="mb-6 w-12 h-12 rounded-xl bg-[#18181b] border border-[#27272a] shadow-subtle flex items-center justify-center overflow-hidden"
                    >
                        {/* Animated Terminal Outline SVG */}
                        <motion.svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-emerald-500/80">
                            <motion.path
                                initial={{ pathLength: 0, opacity: 0 }}
                                animate={{ pathLength: 1, opacity: 1 }}
                                transition={{ duration: 1.5, ease: "easeInOut", delay: 0.2 }}
                                d="M4 17l6-6-6-6"
                            />
                            <motion.path
                                initial={{ pathLength: 0, opacity: 0 }}
                                animate={{ pathLength: 1, opacity: 1 }}
                                transition={{ duration: 0.5, ease: "easeOut", delay: 1.2 }}
                                d="M12 19h8"
                            />
                        </motion.svg>
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.3 }}
                        className="text-2xl md:text-3xl font-serif text-white tracking-tight leading-tight mb-3"
                    >
                        Engineering Log
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.4 }}
                        className="text-[14px] md:text-[15px] text-[#85858b] max-w-2xl leading-relaxed font-sans"
                    >
                        A living record of architectural decisions, technical failures, and shipped code.
                    </motion.p>
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
