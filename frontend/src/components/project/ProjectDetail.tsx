import React, { useState } from 'react';
import type { Project, TimelineEvent, EventType, ProjectImage } from '../../types/lab-state';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { Target, Rocket, AlertTriangle, Activity, Github, ExternalLink, BookOpen, X, ChevronLeft, ChevronRight, ImageOff } from 'lucide-react';

// ─── Status Config ───────────────────────────────────────
const STATUS_CONFIG: Record<string, { label: string; color: string; dot: string }> = {
    idea: { label: 'Idea', color: 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20', dot: 'bg-yellow-500' },
    build: { label: 'In Build', color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20', dot: 'bg-emerald-500' },
    shipped: { label: 'Shipped', color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20', dot: 'bg-indigo-400' },
    paused: { label: 'Paused', color: 'text-zinc-500 bg-zinc-500/10 border-zinc-500/20', dot: 'bg-zinc-500' },
};

// ─── Timeline Event Icons ─────────────────────────────────
const getEventIcon = (type: EventType) => {
    switch (type) {
        case 'decision': return <Target className="w-3.5 h-3.5 text-orange-400" />;
        case 'milestone': return <Activity className="w-3.5 h-3.5 text-blue-400" />;
        case 'ship': return <Rocket className="w-3.5 h-3.5 text-emerald-400" />;
        case 'incident': return <AlertTriangle className="w-3.5 h-3.5 text-red-500" />;
        default: return <Activity className="w-3.5 h-3.5 text-zinc-500" />;
    }
};

const EVENT_TYPE_COLOR: Partial<Record<EventType, string>> = {
    decision: 'text-orange-400',
    milestone: 'text-blue-400',
    ship: 'text-emerald-400',
    incident: 'text-red-500',
};

// ─── Image Lightbox ───────────────────────────────────────
const Lightbox: React.FC<{ images: ProjectImage[]; startIndex: number; onClose: () => void }> = ({ images, startIndex, onClose }) => {
    const [current, setCurrent] = useState(startIndex);
    const prev = () => setCurrent(i => (i - 1 + images.length) % images.length);
    const next = () => setCurrent(i => (i + 1) % images.length);

    return (
        <div
            className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-md flex items-center justify-center p-4"
            onClick={onClose}
        >
            <button onClick={onClose} className="absolute top-5 right-5 p-2 text-zinc-400 hover:text-white bg-white/5 rounded-full transition-colors z-10">
                <X className="w-5 h-5" />
            </button>

            {images.length > 1 && (
                <>
                    <button onClick={(e) => { e.stopPropagation(); prev(); }} className="absolute left-4 p-3 text-zinc-400 hover:text-white bg-white/5 rounded-full transition-colors z-10">
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); next(); }} className="absolute right-4 p-3 text-zinc-400 hover:text-white bg-white/5 rounded-full transition-colors z-10">
                        <ChevronRight className="w-5 h-5" />
                    </button>
                </>
            )}

            <div className="flex flex-col items-center gap-4 max-w-5xl w-full" onClick={e => e.stopPropagation()}>
                <img
                    src={images[current].url}
                    alt={images[current].caption || `Image ${current + 1}`}
                    className="max-h-[80vh] max-w-full rounded-xl object-contain shadow-2xl"
                />
                {images[current].caption && (
                    <p className="text-zinc-400 text-sm font-sans text-center">{images[current].caption}</p>
                )}
                {images.length > 1 && (
                    <div className="flex gap-1.5 mt-1">
                        {images.map((_, i) => (
                            <button key={i} onClick={() => setCurrent(i)} className={`w-1.5 h-1.5 rounded-full transition-colors ${i === current ? 'bg-white' : 'bg-zinc-600 hover:bg-zinc-400'}`} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

// ─── Image Gallery ─────────────────────────────────────────
const ImageGallery: React.FC<{ images: ProjectImage[]; coverImage?: string }> = ({ images, coverImage }) => {
    const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

    // Merge cover_image at the front if not already in gallery
    const allImages: ProjectImage[] = [];
    if (coverImage && !images.find(img => img.url === coverImage)) {
        allImages.push({ url: coverImage, caption: 'Cover', type: 'screenshot' });
    }
    allImages.push(...images);

    if (allImages.length === 0) return null;

    return (
        <>
            {lightboxIndex !== null && (
                <Lightbox images={allImages} startIndex={lightboxIndex} onClose={() => setLightboxIndex(null)} />
            )}

            <div className="space-y-4">
                <h3 className="text-[11px] font-mono text-zinc-500 tracking-[0.2em] uppercase pb-2 border-b border-zinc-800/50">
                    Gallery · {allImages.length} {allImages.length === 1 ? 'Image' : 'Images'}
                </h3>

                {/* Masonry-style: first image is wide, rest are 2-col */}
                <div className="space-y-2">
                    {allImages[0] && (
                        <div
                            className="relative rounded-xl overflow-hidden cursor-zoom-in group w-full aspect-video bg-zinc-900 border border-zinc-800/50"
                            onClick={() => setLightboxIndex(0)}
                        >
                            <img
                                src={allImages[0].url}
                                alt={allImages[0].caption || 'Project image 1'}
                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                            />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
                                <ExternalLink className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-lg" />
                            </div>
                            {allImages[0].caption && (
                                <div className="absolute bottom-0 left-0 right-0 px-4 py-2.5 bg-gradient-to-t from-black/80 to-transparent">
                                    <p className="text-white text-[12px] font-sans">{allImages[0].caption}</p>
                                </div>
                            )}
                        </div>
                    )}

                    {allImages.length > 1 && (
                        <div className="grid grid-cols-2 gap-2">
                            {allImages.slice(1).map((img, idx) => (
                                <div
                                    key={idx + 1}
                                    className="relative rounded-xl overflow-hidden cursor-zoom-in group aspect-video bg-zinc-900 border border-zinc-800/50"
                                    onClick={() => setLightboxIndex(idx + 1)}
                                >
                                    <img
                                        src={img.url}
                                        alt={img.caption || `Project image ${idx + 2}`}
                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                                        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                                    />
                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
                                        <ExternalLink className="w-5 h-5 text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-lg" />
                                    </div>
                                    {img.caption && (
                                        <div className="absolute bottom-0 left-0 right-0 px-3 py-2 bg-gradient-to-t from-black/80 to-transparent">
                                            <p className="text-white text-[11px] font-sans truncate">{img.caption}</p>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

// ─── Main Component ────────────────────────────────────────
interface ProjectDetailProps {
    project: Project;
    events: TimelineEvent[];
}

export const ProjectDetail: React.FC<ProjectDetailProps> = ({ project, events }) => {
    const statusCfg = STATUS_CONFIG[project.status] || STATUS_CONFIG.idea;

    // Only show story-level events — filter out raw commit pulse events
    const storyEvents = events.filter(e => e.type !== 'pulse').sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    const hasTechStack = project.tech_stack && Object.values(project.tech_stack).some(arr => arr && arr.length > 0);
    const hasImages = (project.images && project.images.length > 0) || !!project.cover_image;
    const hasLinks = project.links?.github || project.links?.demo || project.links?.docs || project.repository_url;

    return (
        <AnimatePresence mode="wait">
            <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
                className="space-y-10 pb-24"
            >
                {/* ── Hero Cover Image ── */}
                {project.cover_image && (
                    <div className="w-full aspect-video rounded-2xl overflow-hidden border border-zinc-800/50 bg-zinc-900 -mt-2">
                        <img
                            src={project.cover_image}
                            alt={`${project.name} cover`}
                            className="w-full h-full object-cover"
                            onError={(e) => { (e.target as HTMLImageElement).parentElement!.style.display = 'none'; }}
                        />
                    </div>
                )}

                {/* ── Header ── */}
                <div className="space-y-4 border-b border-zinc-800/50 pb-8">
                    <div className="flex items-center gap-3 flex-wrap">
                        <span className={`flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-mono tracking-widest uppercase rounded-full border ${statusCfg.color}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${statusCfg.dot} inline-block`} />
                            {statusCfg.label}
                        </span>
                        <span className="text-[11px] font-mono text-zinc-600">
                            Health <span className={project.health.score > 70 ? 'text-emerald-500' : 'text-yellow-500'}>{project.health.score}/100</span>
                        </span>
                        {project.tags?.slice(0, 3).map(tag => (
                            <span key={tag} className="px-2 py-0.5 text-[10px] font-mono text-zinc-500 bg-zinc-900 border border-zinc-800 rounded-md">
                                {tag}
                            </span>
                        ))}
                    </div>

                    <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight leading-none">
                        {project.name}
                    </h1>

                    {project.outcome && (
                        <p className="text-lg text-emerald-400/80 font-sans leading-snug font-medium max-w-2xl">
                            {project.outcome}
                        </p>
                    )}

                    <p className="text-[15px] text-zinc-400 leading-relaxed max-w-2xl font-sans">
                        {project.description || 'No description provided.'}
                    </p>
                </div>

                {/* ── Quick Stats Row ── */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                        { label: 'Activity', value: project.derived.activity_level, upper: true },
                        { label: 'Focus Score', value: `${project.derived.focus_score}/100` },
                        { label: 'Last Event', value: project.derived.last_event_date ? format(new Date(project.derived.last_event_date), 'MMM d, yyyy') : '—' },
                        { label: 'Events', value: `${storyEvents.length} logged` },
                    ].map(stat => (
                        <div key={stat.label} className="bg-[#0a0a0a] border border-zinc-800/50 rounded-xl p-4">
                            <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest mb-1">{stat.label}</p>
                            <p className="text-[15px] font-semibold text-zinc-200 font-sans">{stat.upper ? String(stat.value).toUpperCase() : stat.value}</p>
                        </div>
                    ))}
                </div>

                {/* ── Role + Contributions & Tech Stack ── */}
                {(project.my_role || project.contributions || hasTechStack) && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                        {/* My Role */}
                        {(project.my_role || project.contributions) && (
                            <div className="bg-[#0a0a0a] border border-zinc-800/50 rounded-xl p-5 space-y-4">
                                <h3 className="text-[11px] font-mono text-zinc-500 tracking-[0.2em] uppercase">My Role</h3>
                                {project.my_role && (
                                    <p className="text-[15px] font-medium text-zinc-200 font-sans">{project.my_role}</p>
                                )}
                                {project.contributions && project.contributions.length > 0 && (
                                    <ul className="space-y-2.5 mt-2">
                                        {project.contributions.map((c, i) => (
                                            <li key={i} className="flex items-start gap-3 text-[13px] text-zinc-400 font-sans leading-snug">
                                                <span className="text-orange-500/80 mt-[4px] text-[8px] shrink-0">▶</span>
                                                <span>{c}</span>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        )}

                        {/* Tech Stack */}
                        {hasTechStack && (
                            <div className="bg-[#0a0a0a] border border-zinc-800/50 rounded-xl p-5 space-y-4">
                                <h3 className="text-[11px] font-mono text-zinc-500 tracking-[0.2em] uppercase">Tech Stack</h3>
                                <div className="space-y-3">
                                    {(['frontend', 'backend', 'devops', 'other'] as const).map(layer => {
                                        const techs = project.tech_stack?.[layer];
                                        if (!techs || techs.length === 0) return null;
                                        return (
                                            <div key={layer} className="grid grid-cols-[70px_1fr] gap-2 items-start">
                                                <span className="text-[10px] font-mono text-zinc-600 uppercase tracking-widest mt-1.5">{layer}</span>
                                                <div className="flex flex-wrap gap-1.5">
                                                    {techs.map(t => (
                                                        <span key={t} className="px-2 py-1 text-[11px] font-mono text-zinc-300 bg-zinc-800/80 border border-zinc-700/50 rounded-md">
                                                            {t}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* ── Image Gallery ── */}
                {hasImages && (
                    <ImageGallery
                        images={project.images || []}
                        coverImage={project.cover_image}
                    />
                )}

                {/* ── No Images Placeholder ── */}
                {!hasImages && (
                    <div className="flex flex-col items-center justify-center py-10 border border-dashed border-zinc-800/60 rounded-xl text-zinc-700 gap-2">
                        <ImageOff className="w-6 h-6" />
                        <p className="text-[12px] font-mono tracking-widest uppercase">No gallery images set</p>
                        <p className="text-[11px] text-zinc-700 font-sans">Add images via the admin panel to showcase this project</p>
                    </div>
                )}

                {/* ── Links ── */}
                {hasLinks && (
                    <div className="flex flex-wrap gap-3">
                        {(project.links?.github || project.repository_url) && (
                            <a href={project.links?.github || project.repository_url} target="_blank" rel="noreferrer"
                                className="flex items-center gap-2 px-4 py-2.5 bg-zinc-900 border border-zinc-800 hover:border-zinc-600 hover:bg-zinc-800 text-zinc-300 hover:text-white rounded-lg transition-all font-mono text-[12px] font-medium">
                                <Github className="w-4 h-4" /> Source Code
                            </a>
                        )}
                        {project.links?.demo && (
                            <a href={project.links.demo} target="_blank" rel="noreferrer"
                                className="flex items-center gap-2 px-4 py-2.5 bg-zinc-200 hover:bg-white text-black rounded-lg transition-all font-sans font-bold text-[13px] shadow-sm">
                                Live Demo <ExternalLink className="w-4 h-4" />
                            </a>
                        )}
                        {project.links?.docs && (
                            <a href={project.links.docs} target="_blank" rel="noreferrer"
                                className="flex items-center gap-2 px-4 py-2.5 bg-zinc-900 border border-zinc-800 hover:border-zinc-600 hover:bg-zinc-800 text-zinc-300 hover:text-white rounded-lg transition-all font-mono text-[12px]">
                                <BookOpen className="w-4 h-4" /> Docs
                            </a>
                        )}
                    </div>
                )}

                {/* ── Key Timeline Events (no pulse) ── */}
                <div className="space-y-4">
                    <h3 className="text-[11px] font-mono text-zinc-500 tracking-[0.2em] uppercase border-b border-zinc-800/50 pb-3">
                        Key Events · {storyEvents.length} entries
                    </h3>

                    {storyEvents.length > 0 ? (
                        <div className="relative border-l border-zinc-800 ml-3 space-y-8 pl-7 py-2">
                            {storyEvents.map(event => (
                                <div key={event.id} className="relative group">
                                    <div className="absolute -left-[31px] top-0.5 p-1.5 bg-[#050505] border border-zinc-800 rounded-full group-hover:border-zinc-700 transition-colors">
                                        {getEventIcon(event.type)}
                                    </div>

                                    <div className="flex items-baseline gap-3 flex-wrap mb-1">
                                        <span className={`text-[13px] font-semibold ${EVENT_TYPE_COLOR[event.type] || 'text-zinc-200'} group-hover:opacity-80 transition-opacity`}>
                                            {event.title}
                                        </span>
                                        <span className="text-[11px] text-zinc-600 whitespace-nowrap font-mono">
                                            {format(new Date(event.date), 'MMM d, yyyy')}
                                        </span>
                                    </div>

                                    {event.derived.summary_text && (
                                        <p className="text-[13px] text-zinc-500 leading-relaxed">
                                            {event.derived.summary_text}
                                        </p>
                                    )}

                                    {event.type === 'decision' && event.details?.rationale && (
                                        <div className="mt-3 text-[13px] bg-zinc-900/50 p-4 rounded-lg border border-zinc-800/50 space-y-2">
                                            <div>
                                                <span className="text-orange-400/90 font-mono uppercase text-[10px] tracking-wider block mb-1">Rationale</span>
                                                <span className="text-zinc-300">{event.details.rationale}</span>
                                            </div>
                                            {event.details?.outcome && (
                                                <div className="pt-2 border-t border-zinc-800/50">
                                                    <span className="text-emerald-400/90 font-mono uppercase text-[10px] tracking-wider block mb-1">Outcome</span>
                                                    <span className="text-zinc-300">{event.details.outcome}</span>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="py-12 text-center border border-dashed border-zinc-800/50 rounded-xl">
                            <p className="text-zinc-600 font-mono text-[12px] uppercase tracking-widest">No key events recorded yet</p>
                            <p className="text-zinc-700 text-[12px] font-sans mt-1">Add decisions, milestones & ships via the admin panel</p>
                        </div>
                    )}
                </div>

            </motion.div>
        </AnimatePresence>
    );
};
