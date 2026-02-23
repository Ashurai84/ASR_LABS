import React from 'react';
import type { Note } from '../../types/lab-state';
import { format } from 'date-fns';
import { PenTool } from 'lucide-react';

interface NotesListProps {
    notes: Note[];
}

export const NotesList: React.FC<NotesListProps> = ({ notes = [] }) => {
    // Sort notes by date, newest first
    const sortedNotes = [...notes].sort((a, b) =>
        new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    if (notes.length === 0) {
        return (
            <div className="pt-32 pb-32 flex flex-col items-center justify-center text-[#6b7280] space-y-4 animate-fade-in">
                <div className="p-4 bg-zinc-900/50 rounded-full border border-zinc-800/50">
                    <PenTool className="w-8 h-8 opacity-20" />
                </div>
                <p className="font-mono text-sm tracking-widest uppercase text-[#a1a1aa]">No research notes yet.</p>
                <p className="text-[13px] font-sans max-w-sm text-center text-[#6b7280]">
                    Start documenting. Raw learnings, structural patterns, and architectural thoughts belong here.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-4 pb-32 animate-fade-in">
            {/* Header */}
            <div className="pt-4 pb-4 border-b border-[#27272a]">
                <h1 className="text-xl md:text-2xl font-serif text-[#ffffff] tracking-tight mb-2">
                    Neural Vault
                </h1>
                <p className="text-[13px] md:text-[14px] text-[#85858b] max-w-2xl leading-relaxed font-sans">
                    A chronological repository of research, architecture musings, and raw reference context.
                </p>
            </div>

            {/* List */}
            <div className="border-l border-[#27272a] ml-4 pl-4 md:pl-6 space-y-0 animate-slide-up">
                {sortedNotes.map((note) => (
                    <div
                        key={note.id}
                        onClick={() => alert(`Note detail view for ${note.slug || note.id} coming soon.`)}
                        className="group relative flex flex-col pt-6 pb-6 border-b border-[#27272a]/50 last:border-b-0 cursor-pointer hover:bg-[#18181b]/40 -ml-4 pl-4 pr-4 md:-ml-6 md:pl-6 rounded-md transition-colors duration-200 ease-out"
                    >
                        <div className="flex flex-col gap-2 relative">
                            <span className="text-[11px] font-mono text-[#3f3f46] tracking-widest uppercase mb-1">
                                {format(new Date(note.date), 'MMM d, yyyy')}
                            </span>

                            <h3 className="text-[18px] font-bold text-[#f4f4f5] font-serif tracking-tight leading-snug group-hover:text-white transition-colors duration-200">
                                {note.title}
                            </h3>

                            {note.excerpt && (
                                <p className="text-[14px] text-[#6b7280] font-sans leading-relaxed line-clamp-2 mt-1 max-w-2xl">
                                    {note.excerpt}
                                </p>
                            )}

                            {note.tags && note.tags.length > 0 && (
                                <div className="flex flex-wrap gap-2 mt-3 text-[10px] font-mono uppercase tracking-widest text-[#a1a1aa]">
                                    {note.tags.map(tag => (
                                        <span key={tag} className="flex items-center gap-1 bg-[#18181b] border border-[#27272a] px-1.5 py-0.5 rounded text-[#85858b] group-hover:border-[#3f3f46] transition-colors duration-200">
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
