'use client';

import { supabase, Post } from '@/lib/supabase';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
    Plus,
    FileText,
    Eye,
    EyeOff,
    BarChart3,
    Clock,
    ArrowUpRight,
    Zap,
    TrendingUp,
    Users,
    MousePointer2,
    Calendar
} from 'lucide-react';
import { formatDate } from '@/lib/markdown';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export default function AdminDashboard() {
    const [stats, setStats] = useState({
        totalPosts: 0,
        publishedPosts: 0,
        draftPosts: 0,
    });
    const [recentPosts, setRecentPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        const { count: total } = await supabase.from('posts').select('*', { count: 'exact', head: true });
        const { count: published } = await supabase.from('posts').select('*', { count: 'exact', head: true }).eq('published', true);
        const { count: draft } = await supabase.from('posts').select('*', { count: 'exact', head: true }).eq('published', false);

        setStats({
            totalPosts: total || 0,
            publishedPosts: published || 0,
            draftPosts: draft || 0,
        });

        const { data: posts } = await supabase.from('posts').select('*').order('updated_at', { ascending: false }).limit(6);
        setRecentPosts(posts || []);
        setLoading(false);
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-[50vh] space-y-4">
                <Loader2 className="w-8 h-8 animate-spin text-neutral-200" />
                <p className="text-neutral-400 font-medium animate-pulse">Syncing Workspace...</p>
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-12"
        >
            {/* Context & Welcome */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 border-b border-neutral-100 pb-10">
                <div>
                    <div className="flex items-center gap-2 mb-3">
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-400">System Live</span>
                    </div>
                    <h1 className="text-4xl font-bold tracking-tight text-neutral-900 mb-2">Workspace Overview</h1>
                    <p className="text-neutral-500 font-medium">Monitoring publication velocity and platform growth.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button className="h-11 px-6 rounded-xl border border-neutral-200 text-neutral-600 hover:bg-neutral-50 font-bold text-sm transition-all flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        Jan 2026
                    </button>
                    <Link href="/admin/posts/new" className="h-11 px-8 rounded-xl bg-[#09090B] text-white hover:bg-neutral-800 font-bold text-sm transition-all flex items-center gap-2 shadow-xl shadow-neutral-200">
                        <Plus className="w-4 h-4" />
                        Create New Entry
                    </Link>
                </div>
            </div>

            {/* KPI Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: 'Total Content', value: stats.totalPosts, icon: FileText, color: 'text-neutral-900', bg: 'bg-neutral-50' },
                    { label: 'Live Sites', value: stats.publishedPosts, icon: Zap, color: 'text-primary-600', bg: 'bg-primary-50' },
                    { label: 'Incubating', value: stats.draftPosts, icon: EyeOff, color: 'text-amber-600', bg: 'bg-amber-50' },
                    { label: 'Projected Reach', value: '1.2M', icon: TrendingUp, color: 'text-green-600', bg: 'bg-green-50' },
                ].map((kpi, idx) => (
                    <div key={idx} className="bg-white p-6 rounded-[1.5rem] border border-neutral-100 shadow-sm hover:shadow-md transition-all group overflow-hidden relative">
                        <div className="flex justify-between items-start relative z-10">
                            <div className={cn("p-2.5 rounded-xl shrink-0 transition-transform group-hover:scale-110", kpi.bg, kpi.color)}>
                                <kpi.icon className="w-5 h-5" />
                            </div>
                            <div className="text-right">
                                <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 mb-1">{kpi.label}</p>
                                <h3 className="text-3xl font-bold text-neutral-900 tracking-tight">{kpi.value}</h3>
                            </div>
                        </div>
                        {/* Sparkline Decor (Pure CSS) */}
                        <div className="absolute bottom-0 left-0 w-full h-1 bg-neutral-50 group-hover:bg-neutral-100 transition-colors" />
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                {/* Recent Activity List */}
                <div className="lg:col-span-8 space-y-6">
                    <div className="flex items-center justify-between px-2">
                        <h2 className="text-xl font-bold text-neutral-900 tracking-tight">Recent Modification</h2>
                        <Link href="/admin/posts" className="text-xs font-bold text-primary-600 hover:underline flex items-center gap-1">
                            Entire Library <ArrowUpRight className="w-3 h-3" />
                        </Link>
                    </div>
                    <div className="bg-white border border-neutral-100 rounded-[2rem] overflow-hidden shadow-sm">
                        <div className="divide-y divide-neutral-50">
                            {recentPosts.length > 0 ? (
                                recentPosts.map((post) => (
                                    <Link
                                        key={post.id}
                                        href={`/admin/posts/edit/${post.id}`}
                                        className="group flex flex-col sm:flex-row sm:items-center justify-between p-6 hover:bg-neutral-50/50 transition-all gap-4"
                                    >
                                        <div className="flex items-center gap-5">
                                            <div className="w-12 h-12 bg-neutral-50 rounded-2xl flex items-center justify-center text-neutral-400 group-hover:bg-white group-hover:shadow-soft transition-all">
                                                <FileText className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-neutral-900 group-hover:text-primary-700 transition-colors truncate max-w-[200px] sm:max-w-md">{post.title}</h4>
                                                <p className="text-[10px] font-bold text-neutral-300 uppercase tracking-widest mt-1">Edited {formatDate(post.updated_at)}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4 shrink-0 sm:justify-end">
                                            <div className={cn(
                                                "px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest border",
                                                post.published ? "bg-green-50 text-green-700 border-green-100" : "bg-neutral-50 text-neutral-500 border-neutral-100"
                                            )}>
                                                {post.published ? 'Stable' : 'Draft'}
                                            </div>
                                            <ArrowUpRight className="w-4 h-4 text-neutral-200 group-hover:text-primary-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                                        </div>
                                    </Link>
                                ))
                            ) : (
                                <div className="p-20 text-center">
                                    <FileText className="w-10 h-10 text-neutral-100 mx-auto mb-4" />
                                    <p className="text-neutral-400 italic font-serif">Awaiting publication deployment.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Panel: Analytics Preview */}
                <div className="lg:col-span-4 space-y-6">
                    <h2 className="text-xl font-bold text-neutral-900 tracking-tight px-2">Traffic Intensity</h2>
                    <div className="bg-[#09090B] rounded-[2rem] p-8 text-white space-y-8 shadow-2xl relative overflow-hidden">
                        {/* Glow Decor */}
                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary-600/20 blur-[64px] rounded-full" />

                        <div className="space-y-1 relative z-10">
                            <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-500">Live Viewers</p>
                            <div className="flex items-baseline gap-2">
                                <h3 className="text-5xl font-bold">142</h3>
                                <span className="text-green-500 text-xs font-bold">+12%</span>
                            </div>
                        </div>

                        <div className="space-y-6 relative z-10">
                            <div className="space-y-2">
                                <div className="flex justify-between text-[10px] font-bold text-neutral-500 uppercase tracking-widest">
                                    <span>Direct</span>
                                    <span>65%</span>
                                </div>
                                <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                                    <motion.div initial={{ width: 0 }} animate={{ width: '65%' }} className="h-full bg-primary-500" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <div className="flex justify-between text-[10px] font-bold text-neutral-500 uppercase tracking-widest">
                                    <span>Organic</span>
                                    <span>35%</span>
                                </div>
                                <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                                    <motion.div initial={{ width: 0 }} animate={{ width: '35%' }} className="h-full bg-green-500" />
                                </div>
                            </div>
                        </div>

                        <button className="w-full h-11 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 text-xs font-bold transition-all">
                            Full Analytics Hub
                        </button>
                    </div>

                    {/* Quick Access */}
                    <div className="grid grid-cols-2 gap-4">
                        <button className="p-5 rounded-2xl bg-white border border-neutral-100 hover:border-primary-100 transition-all text-left space-y-3 shadow-sm group">
                            <Users className="w-5 h-5 text-neutral-400 group-hover:text-primary-600 transition-colors" />
                            <p className="text-xs font-bold text-neutral-900">User Flows</p>
                        </button>
                        <button className="p-5 rounded-2xl bg-white border border-neutral-100 hover:border-primary-100 transition-all text-left space-y-3 shadow-sm group">
                            <MousePointer2 className="w-5 h-5 text-neutral-400 group-hover:text-primary-600 transition-colors" />
                            <p className="text-xs font-bold text-neutral-900">Click Map</p>
                        </button>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}

function Loader2({ className }: { className?: string }) {
    return (
        <svg
            className={cn("animate-spin", className)}
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
        >
            <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
            ></circle>
            <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
        </svg>
    );
}
