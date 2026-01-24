'use client';

import { supabase, Post } from '@/lib/supabase';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus, FileText, Eye, EyeOff, BarChart3, Clock, ArrowUpRight } from 'lucide-react';
import { formatDate } from '@/lib/markdown';

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
        // Fetch stats
        const { count: total } = await supabase
            .from('posts')
            .select('*', { count: 'exact', head: true });

        const { count: published } = await supabase
            .from('posts')
            .select('*', { count: 'exact', head: true })
            .eq('published', true);

        const { count: draft } = await supabase
            .from('posts')
            .select('*', { count: 'exact', head: true })
            .eq('published', false);

        setStats({
            totalPosts: total || 0,
            publishedPosts: published || 0,
            draftPosts: draft || 0,
        });

        // Fetch recent posts
        const { data: posts } = await supabase
            .from('posts')
            .select('*')
            .order('updated_at', { ascending: false })
            .limit(5);

        setRecentPosts(posts || []);
        setLoading(false);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[50vh]">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-primary-100 border-t-primary-600 rounded-full animate-spin"></div>
                    <p className="text-neutral-400 font-medium animate-pulse">Synchronizing Data...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-6xl">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-8 h-1 bg-primary-600 rounded-full"></div>
                        <span className="text-[11px] font-bold uppercase tracking-[0.3em] text-primary-600">Overview</span>
                    </div>
                    <h1 className="text-4xl font-bold font-serif text-neutral-900 tracking-tight">Workspace Dashboard</h1>
                    <p className="text-neutral-500 mt-2 text-lg">Detailed insight into your publication performance.</p>
                </div>
                <Link href="/admin/posts/new" className="group btn-primary px-8 py-4 shadow-xl shadow-primary-100 hover:scale-[1.02] active:scale-95 transition-all">
                    <Plus className="w-5 h-5 mr-3 transition-transform group-hover:rotate-90" />
                    Create New Entry
                </Link>
            </div>

            {/* High Impact Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
                <div className="group bg-white p-8 rounded-[2rem] border border-neutral-100 shadow-[0_8px_30px_rgb(0,0,0,0.02)] hover:shadow-xl hover:shadow-primary-50 transition-all duration-500 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                        <BarChart3 className="w-24 h-24 -mr-4 -mt-4 text-primary-600" />
                    </div>
                    <div className="flex flex-col gap-6">
                        <div className="w-14 h-14 bg-primary-50 rounded-2xl flex items-center justify-center text-primary-600">
                            <FileText className="w-7 h-7" />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-neutral-400 uppercase tracking-widest mb-1">Total Repository</p>
                            <h3 className="text-4xl font-bold text-neutral-900">{stats.totalPosts}</h3>
                        </div>
                    </div>
                </div>

                <div className="group bg-white p-8 rounded-[2rem] border border-neutral-100 shadow-[0_8px_30px_rgb(0,0,0,0.02)] hover:shadow-xl hover:shadow-green-50 transition-all duration-500 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                        <BarChart3 className="w-24 h-24 -mr-4 -mt-4 text-green-600" />
                    </div>
                    <div className="flex flex-col gap-6">
                        <div className="w-14 h-14 bg-green-50 rounded-2xl flex items-center justify-center text-green-600">
                            <Eye className="w-7 h-7" />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-neutral-400 uppercase tracking-widest mb-1">Live Publications</p>
                            <h3 className="text-4xl font-bold text-neutral-900">{stats.publishedPosts}</h3>
                        </div>
                    </div>
                </div>

                <div className="group bg-white p-8 rounded-[2rem] border border-neutral-100 shadow-[0_8px_30px_rgb(0,0,0,0.02)] hover:shadow-xl hover:shadow-amber-50 transition-all duration-500 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                        <BarChart3 className="w-24 h-24 -mr-4 -mt-4 text-amber-600" />
                    </div>
                    <div className="flex flex-col gap-6">
                        <div className="w-14 h-14 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600">
                            <EyeOff className="w-7 h-7" />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-neutral-400 uppercase tracking-widest mb-1">Draft Entries</p>
                            <h3 className="text-4xl font-bold text-neutral-900">{stats.draftPosts}</h3>
                        </div>
                    </div>
                </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-[2rem] border border-neutral-50 shadow-sm overflow-hidden">
                <div className="p-8 border-b border-neutral-50 flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold text-neutral-900">Recent Activity</h2>
                        <p className="text-sm text-neutral-400 mt-1">Reviewing your latest modifications.</p>
                    </div>
                    <Link href="/admin/posts" className="text-primary-600 font-bold text-sm hover:underline flex items-center gap-1">
                        View All Posts
                        <ArrowUpRight className="w-4 h-4" />
                    </Link>
                </div>
                <div className="divide-y divide-neutral-50">
                    {recentPosts.length > 0 ? (
                        recentPosts.map((post) => (
                            <Link
                                key={post.id}
                                href={`/admin/posts/edit/${post.id}`}
                                className="group flex items-center justify-between p-8 hover:bg-neutral-50/50 transition-all duration-300"
                            >
                                <div className="flex items-center gap-6">
                                    <div className="w-12 h-12 bg-neutral-100 rounded-xl flex items-center justify-center text-neutral-400 group-hover:bg-primary-50 group-hover:text-primary-600 transition-colors">
                                        <Clock className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-neutral-900 group-hover:text-primary-700 transition-colors mb-1">{post.title}</h3>
                                        <p className="text-xs font-medium text-neutral-400 uppercase tracking-widest">
                                            Last Updated {formatDate(post.updated_at)}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-6">
                                    <span
                                        className={`px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest rounded-full ${post.published
                                            ? 'bg-green-50 text-green-700'
                                            : 'bg-amber-50 text-amber-700'
                                            }`}
                                    >
                                        {post.published ? 'Live' : 'Draft'}
                                    </span>
                                    <ArrowUpRight className="w-5 h-5 text-neutral-200 group-hover:text-primary-400 transition-colors" />
                                </div>
                            </Link>
                        ))
                    ) : (
                        <div className="p-20 text-center">
                            <p className="text-neutral-400 italic font-serif">No recent activity detected.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
