import React, { useState, useMemo } from 'react';
import type { Tool, ToolType, ToolStatus } from '../../types/lab-state';
import { Database, Search, Filter } from 'lucide-react';
import { ToolCard } from './ToolCard';

interface ToolRegistryProps {
    tools: Tool[];
}

export const ToolRegistry: React.FC<ToolRegistryProps> = ({ tools = [] }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTypeFilter, setActiveTypeFilter] = useState<ToolType | 'ALL'>('ALL');
    const [activeStatusFilter, setActiveStatusFilter] = useState<ToolStatus | 'ALL'>('ALL');

    const filteredTools = useMemo(() => {
        return tools.filter(tool => {
            const matchesSearch =
                tool.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                tool.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (tool.tech_stack && Object.values(tool.tech_stack).flat().some(t => t.toLowerCase().includes(searchTerm.toLowerCase())));

            const matchesType = activeTypeFilter === 'ALL' || tool.type?.toUpperCase() === activeTypeFilter;
            const matchesStatus = activeStatusFilter === 'ALL' || tool.status?.toUpperCase() === activeStatusFilter;

            return matchesSearch && matchesType && matchesStatus;
        }).sort((a, b) => {
            // Sort by updated_at if available, otherwise fallback to id
            if (a.updated_at && b.updated_at) {
                return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
            }
            return 0;
        });
    }, [tools, searchTerm, activeTypeFilter, activeStatusFilter]);

    // Stats calculations
    const stats = useMemo(() => {
        return {
            total: tools.length,
            active: tools.filter(t => t.status?.toUpperCase() === 'ACTIVE').length,
            experimental: tools.filter(t => t.status?.toUpperCase() === 'EXPERIMENTAL').length,
            deprecated: tools.filter(t => t.status?.toUpperCase() === 'DEPRECATED').length,
        };
    }, [tools]);

    if (tools.length === 0) {
        return (
            <div className="pt-32 pb-32 flex flex-col items-center justify-center text-[#6b7280] space-y-4 animate-fade-in">
                <div className="p-4 bg-zinc-900/50 rounded-full border border-zinc-800/50">
                    <Database className="w-8 h-8 opacity-20" />
                </div>
                <p className="font-mono text-sm tracking-widest uppercase text-[#a1a1aa]">Start building your toolkit</p>
                <p className="text-[13px] font-sans max-w-sm text-center text-[#6b7280]">
                    Add your first project to the registry.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-8 pb-32 animate-fade-in">
            {/* 1. Header Section */}
            <div className="pt-4 pb-6 border-b border-[#27272a]">
                <h1 className="text-xl md:text-2xl font-serif text-[#ffffff] tracking-tight mb-2">
                    Artifacts & Tools
                </h1>
                <p className="text-[13px] md:text-[14px] text-[#85858b] max-w-2xl leading-relaxed font-sans mb-4">
                    A registry of tools, systems, and experiments I've built across companies and projects.
                </p>

                {/* Stats row */}
                <div className="flex gap-4 text-[12px] font-mono text-[#a1a1aa]">
                    <span className="text-[#ffffff]">{stats.total} Tools</span>
                    <span>•</span>
                    <span className="text-[#22c55e]">{stats.active} Active</span>
                    <span>•</span>
                    <span className="text-[#f97316]">{stats.experimental} Experimental</span>
                    <span>•</span>
                    <span className="text-[#ef4444]">{stats.deprecated} Deprecated</span>
                </div>
            </div>

            {/* 2. Filters & Search Section */}
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="relative w-full md:w-64">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-4 w-4 text-[#85858b]" />
                    </div>
                    <input
                        type="text"
                        placeholder="Search tools..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-[#18181b] border border-[#27272a] rounded-md py-1.5 pl-10 pr-3 text-[13px] font-sans text-[#e5e5e5] placeholder-[#85858b] focus:outline-none focus:border-[#3f3f46] focus:ring-1 focus:ring-[#3f3f46] transition-colors"
                    />
                </div>

                <div className="flex flex-wrap gap-2 w-full md:w-auto">
                    {/* Visual filter cue could be added here if desired. Relying on simple buttons for now to match minimal aesthetic */}
                    <Filter className="h-4 w-4 text-[#85858b] mt-1 hidden md:block" />
                    <div className="flex flex-wrap gap-2">
                        {['ALL', 'BACKEND', 'FRONTEND', 'FULLSTACK', 'DEVOPS', 'AI_ML'].map((type) => (
                            <button
                                key={type}
                                onClick={() => setActiveTypeFilter(type as ToolType | 'ALL')}
                                className={`text-[10px] font-mono tracking-widest uppercase px-2 py-1 rounded border transition-colors ${activeTypeFilter === type
                                        ? 'bg-[#ffffff] text-[#000000] border-[#ffffff]'
                                        : 'bg-[#18181b] text-[#a1a1aa] border-[#27272a] hover:border-[#3f3f46]'
                                    }`}
                            >
                                {type === 'ALL' ? 'ALL TYPES' : type}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* 3. Grid View */}
            {filteredTools.length > 0 ? (
                // 3 columns desktop, 2 columns tablet, 1 column mobile
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-slide-up">
                    {filteredTools.map(tool => (
                        <ToolCard key={tool.id} tool={tool} />
                    ))}
                </div>
            ) : (
                <div className="pt-24 pb-24 flex flex-col items-center justify-center text-[#6b7280] space-y-4 bg-[#18181b]/50 border border-[#27272a] border-dashed rounded-lg">
                    <Search className="w-6 h-6 opacity-30" />
                    <p className="font-mono text-[12px] tracking-widest uppercase text-[#a1a1aa]">No tools found</p>
                    <p className="text-[13px] font-sans max-w-sm text-center text-[#6b7280]">
                        Try adjusting your search or filters.
                    </p>
                    <button
                        onClick={() => { setSearchTerm(''); setActiveTypeFilter('ALL'); setActiveStatusFilter('ALL'); }}
                        className="text-[11px] font-mono px-3 py-1.5 bg-[#27272a] text-[#e5e5e5] rounded mt-2 hover:bg-[#3f3f46] transition-colors"
                    >
                        Clear Filters
                    </button>
                </div>
            )}
        </div>
    );
};
