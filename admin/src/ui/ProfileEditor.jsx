import React, { useState, useEffect } from 'react';
import { Save, User, Github, Linkedin, Twitter, Globe } from 'lucide-react';

export const ProfileEditor = ({ profile, onSave }) => {
    const [data, setData] = useState({
        name: '',
        bio: '',
        github: '',
        linkedin: '',
        twitter: '',
        email: ''
    });

    useEffect(() => {
        console.log("[ProfileEditor] Received profile data:", profile);
        if (profile && Object.keys(profile).length > 0) {
            setData(prev => ({
                ...prev,
                ...profile
            }));
        }
    }, [profile]);

    const handleSave = () => {
        console.log("[ProfileEditor] Saving data:", data);
        onSave(data);
    };

    return (
        <div className="p-8 max-w-4xl">
            <div className="flex justify-between items-center mb-10">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-blue-500/10 rounded-xl border border-blue-500/20">
                        <User className="w-6 h-6 text-blue-500" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-white tracking-tight">Identity</h1>
                        <p className="text-zinc-500 text-sm">Update your public presence across the lab.</p>
                    </div>
                </div>

                <div className="flex gap-3">
                    <button
                        onClick={async () => {
                            await handleSave();
                            const res = await fetch('/api/publish', { method: 'POST' });
                            if (res.ok) alert("Profile Published Live!");
                        }}
                        className="bg-blue-600 text-white px-8 py-2.5 rounded-lg text-sm font-bold hover:bg-blue-500 shadow-lg shadow-blue-900/40 flex items-center gap-2 transition-all active:scale-95"
                    >
                        <Save className="w-4 h-4" /> Save & Publish
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-[10px] font-mono text-zinc-600 uppercase tracking-widest">Full Name</label>
                        <input
                            type="text"
                            value={data.name || ''}
                            onChange={e => setData({ ...data, name: e.target.value })}
                            className="w-full bg-zinc-900/50 border border-zinc-900 rounded-lg px-4 py-2.5 text-white focus:border-blue-500/50 outline-none transition-all"
                            placeholder="Engineering Name"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-mono text-zinc-600 uppercase tracking-widest">Brief Bio</label>
                        <textarea
                            value={data.bio || ''}
                            onChange={e => setData({ ...data, bio: e.target.value })}
                            className="w-full bg-zinc-900/50 border border-zinc-900 rounded-lg px-4 py-2.5 text-zinc-400 focus:border-blue-500/50 outline-none h-32 resize-none transition-all"
                            placeholder="Architectural philosophy or current focus..."
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-mono text-zinc-600 uppercase tracking-widest">Contact Email</label>
                        <input
                            type="email"
                            value={data.email || ''}
                            onChange={e => setData({ ...data, email: e.target.value })}
                            className="w-full bg-zinc-900/50 border border-zinc-900 rounded-lg px-4 py-2.5 text-zinc-400 focus:border-blue-500/50 outline-none transition-all"
                            placeholder="email@example.com"
                        />
                    </div>
                </div>

                <div className="bg-zinc-900/20 border border-zinc-900 rounded-2xl p-6 space-y-6">
                    <h3 className="text-xs font-mono text-zinc-500 uppercase tracking-[0.3em]">Social Infrastructure</h3>

                    <div className="space-y-4">
                        <div className="flex items-center gap-4 bg-zinc-950 p-2.5 rounded-xl border border-zinc-900">
                            <Github className="w-4 h-4 text-zinc-700" />
                            <input
                                type="text"
                                value={data?.github || ''}
                                onChange={e => setData({ ...data, github: e.target.value })}
                                placeholder="github.com/username"
                                className="flex-1 bg-transparent border-none outline-none text-xs text-zinc-400 font-mono"
                            />
                        </div>
                        <div className="flex items-center gap-4 bg-zinc-950 p-2.5 rounded-xl border border-zinc-900">
                            <Linkedin className="w-4 h-4 text-zinc-700" />
                            <input
                                type="text"
                                value={data?.linkedin || ''}
                                onChange={e => setData({ ...data, linkedin: e.target.value })}
                                placeholder="linkedin.com/in/username"
                                className="flex-1 bg-transparent border-none outline-none text-xs text-zinc-400 font-mono"
                            />
                        </div>
                        <div className="flex items-center gap-4 bg-zinc-950 p-2.5 rounded-xl border border-zinc-900">
                            <Twitter className="w-4 h-4 text-zinc-700" />
                            <input
                                type="text"
                                value={data?.twitter || ''}
                                onChange={e => setData({ ...data, twitter: e.target.value })}
                                placeholder="twitter.com/handle"
                                className="flex-1 bg-transparent border-none outline-none text-xs text-zinc-400 font-mono"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div >
    );
};
