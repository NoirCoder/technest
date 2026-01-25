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
            className="space-y-16"
        >
            {/* Context & Welcome */}
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-12 border-b-[4px] border-neutral-900 pb-16">
                <div>
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-3 h-3 bg-primary-400 border-[1.5px] border-neutral-900 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]" />
                        <span className="text-[11px] font-black uppercase tracking-[0.4em] text-neutral-400">System Protocol: Active</span>
                    </div>
                    <h1 className="text-6xl font-black tracking-tighter text-neutral-900 uppercase leading-none mb-4">Workspace</h1>
                    <p className="text-lg font-bold text-neutral-400 uppercase tracking-widest">Analytics & Publication Audit</p>
                </div>
                <div className="flex flex-wrap items-center gap-6">
                    <button className="brutalist-button h-14 px-8 bg-neutral-50">
                        <Calendar className="w-4.5 h-4.5 mr-3" />
                        <span className="text-[10px] font-black">JANUARY // 2026</span>
                    </button>
                    <Link href="/admin/posts/new" className="brutalist-button-primary h-14 px-10">
                        <Plus className="w-5 h-5 mr-3" />
                        <span className="text-[10px] font-black">INITIALIZE NEW ENTRY</span>
                    </Link>
                </div>
            </div>

            {/* KPI Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
                {[
                    { label: 'Total Content', value: stats.totalPosts, icon: FileText, color: 'bg-neutral-900 text-white' },
                    { label: 'Live Sites', value: stats.publishedPosts, icon: Zap, color: 'bg-primary-400 text-neutral-900' },
                    { label: 'Incubating', value: stats.draftPosts, icon: EyeOff, color: 'bg-white text-neutral-900' },
                    { label: 'Projected Reach', value: '1.2M', icon: TrendingUp, color: 'bg-neutral-900 text-white' },
                ].map((kpi, idx) => (
                    <div key={idx} className="brutalist-card p-10 flex flex-col justify-between h-56 group border-neutral-900">
                        <div className="flex justify-between items-start">
                            <div className={cn("w-12 h-12 border-[2px] border-neutral-900 flex items-center justify-center shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]", kpi.color)}>
                                <kpi.icon className="w-5 h-5" />
                            </div>
                            <div className="text-right">
                                <p className="text-[9px] font-black uppercase tracking-[0.3em] text-neutral-400 mb-2">{kpi.label}</p>
                                <h3 className="text-5xl font-black text-neutral-900 tracking-tighter">{kpi.value}</h3>
                            </div>
                        </div>
                        <div className="mt-auto h-2 bg-neutral-100 border-[1.5px] border-neutral-900" />
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
                {/* Recent Activity List */}
                <div className="lg:col-span-8 space-y-10">
                    <div className="flex items-center justify-between pb-6 border-b-[3px] border-neutral-900">
                        <h2 className="text-3xl font-black text-neutral-900 uppercase tracking-tighter">Modification Log</h2>
                        <Link href="/admin/posts" className="brutalist-button h-10 px-6 text-[9px] font-black">
                            FULL LIBRARY <ArrowUpRight className="ml-2 w-3.5 h-3.5" />
                        </Link>
                    </div>
                    <div className="grid grid-cols-1 gap-6">
                        {recentPosts.length > 0 ? (
                            recentPosts.map((post) => (
                                <Link
                                    key={post.id}
                                    href={`/admin/posts/edit/${post.id}`}
                                    className="brutalist-card bg-white p-8 flex flex-col sm:flex-row sm:items-center justify-between transition-all gap-8 border-neutral-900"
                                >
                                    <div className="flex items-center gap-8">
                                        <div className="w-16 h-16 bg-neutral-50 border-[2px] border-neutral-900 flex items-center justify-center text-neutral-900 shrink-0 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] group-hover:shadow-none translate-x-[-2px] group-hover:translate-x-0 group-hover:translate-y-0 translate-y-[-2px]">
                                            <FileText className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h4 className="text-xl font-black text-neutral-900 uppercase tracking-tighter mb-2 line-clamp-1">{post.title}</h4>
                                            <div className="flex items-center gap-3">
                                                <span className="text-[9px] font-black text-neutral-300 uppercase tracking-widest">Update Recorded:</span>
                                                <span className="text-[9px] font-black text-neutral-900 uppercase tracking-widest">{formatDate(post.updated_at).toUpperCase()}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-6 shrink-0 sm:justify-end">
                                        <div className={cn(
                                            "px-4 py-1 border-[2px] text-[10px] font-black uppercase tracking-[0.2em] shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]",
                                            post.published ? "bg-primary-400 border-neutral-900 text-neutral-900" : "bg-white border-neutral-900 text-neutral-400 shadow-none grayscale"
                                        )}>
                                            {post.published ? 'STABLE' : 'DRAFT'}
                                        </div>
                                        <ArrowUpRight className="w-6 h-6 text-neutral-200 group-hover:text-neutral-900 transition-all" />
                                    </div>
                                </Link>
                            ))
                        ) : (
                            <div className="brutalist-card p-32 text-center bg-neutral-50 grayscale opacity-40 border-dashed border-neutral-900">
                                <FileText className="w-16 h-16 text-neutral-900 mx-auto mb-6" />
                                <p className="text-[11px] font-black uppercase tracking-[0.4em]">Protocol Awaiting Entry Deployment</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Panel: Analytics Preview */}
                <div className="lg:col-span-4 space-y-10">
                    <h2 className="text-3xl font-black text-neutral-900 uppercase tracking-tighter pb-6 border-b-[3px] border-neutral-900">Intensity</h2>
                    <div className="bg-neutral-900 p-12 text-white border-[4px] border-neutral-900 shadow-[16px_16px_0px_0px_rgba(0,0,0,0.1)] flex flex-col gap-12">
                        <div className="space-y-4">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-green-500 rounded-full animate-ping" />
                                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-neutral-500">Live Telemetry</span>
                            </div>
                            <div className="flex items-baseline gap-4">
                                <h3 className="text-7xl font-black text-white tracking-tighter italic">142</h3>
                                <div className="p-1 px-2 border-[1.5px] border-green-500 bg-green-500/10 text-green-500 text-[9px] font-black tracking-widest shadow-[3px_3px_0px_0px_rgba(34,197,94,0.1)]">
                                    +12%
                                </div>
                            </div>
                        </div>

                        <div className="space-y-8">
                            <div className="space-y-4">
                                <div className="flex justify-between text-[10px] font-black text-neutral-500 uppercase tracking-[0.3em]">
                                    <span>Strategic Direct</span>
                                    <span className="text-white">65%</span>
                                </div>
                                <div className="h-4 bg-white/5 border-[1.5px] border-white/10 overflow-hidden p-0.5">
                                    <motion.div initial={{ width: 0 }} animate={{ width: '65%' }} className="h-full bg-primary-400" />
                                </div>
                            </div>
                            <div className="space-y-4">
                                <div className="flex justify-between text-[10px] font-black text-neutral-500 uppercase tracking-[0.3em]">
                                    <span>Organic Intel</span>
                                    <span className="text-white">35%</span>
                                </div>
                                <div className="h-4 bg-white/5 border-[1.5px] border-white/10 overflow-hidden p-0.5">
                                    <motion.div initial={{ width: 0 }} animate={{ width: '35%' }} className="h-full bg-white" />
                                </div>
                            </div>
                        </div>

                        <button className="h-14 bg-white text-neutral-900 font-black text-[10px] uppercase tracking-widest border-[2px] border-neutral-900 shadow-[4px_4px_0px_0px_rgba(255,255,255,0.2)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all">
                            FULL TELEMETRY HUB
                        </button>
                    </div>

                    {/* Quick Access */}
                    <div className="grid grid-cols-2 gap-6 pt-6">
                        <button className="brutalist-card p-6 bg-white text-left space-y-4 border-neutral-900">
                            <Users className="w-5 h-5 text-neutral-900" />
                            <p className="text-[10px] font-black uppercase tracking-widest text-neutral-900">Operator Flow</p>
                        </button>
                        <button className="brutalist-card p-6 bg-white text-left space-y-4 border-neutral-900 rotate-1">
                            <MousePointer2 className="w-5 h-5 text-neutral-900" />
                            <p className="text-[10px] font-black uppercase tracking-widest text-neutral-900">Interaction Map</p>
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
