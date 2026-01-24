'use client';

import { supabase, Post } from '@/lib/supabase';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus, FileText, Eye, EyeOff } from 'lucide-react';
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
        return <div>Loading...</div>;
    }

    return (
        <div>
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold font-serif text-neutral-900">Dashboard</h1>
                    <p className="text-neutral-600 mt-1">Welcome back to TechNest</p>
                </div>
                <Link href="/admin/posts/new" className="btn-primary">
                    <Plus className="w-4 h-4 mr-2" />
                    New Post
                </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="card p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-neutral-600 mb-1">Total Posts</p>
                            <p className="text-3xl font-bold text-neutral-900">{stats.totalPosts}</p>
                        </div>
                        <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                            <FileText className="w-6 h-6 text-primary-600" />
                        </div>
                    </div>
                </div>

                <div className="card p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-neutral-600 mb-1">Published</p>
                            <p className="text-3xl font-bold text-green-600">{stats.publishedPosts}</p>
                        </div>
                        <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                            <Eye className="w-6 h-6 text-green-600" />
                        </div>
                    </div>
                </div>

                <div className="card p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-neutral-600 mb-1">Drafts</p>
                            <p className="text-3xl font-bold text-amber-600">{stats.draftPosts}</p>
                        </div>
                        <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
                            <EyeOff className="w-6 h-6 text-amber-600" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Recent Posts */}
            <div className="card p-6">
                <h2 className="text-xl font-bold text-neutral-900 mb-4">Recent Posts</h2>
                <div className="space-y-3">
                    {recentPosts.map((post) => (
                        <Link
                            key={post.id}
                            href={`/admin/posts/edit/${post.id}`}
                            className="block p-4 rounded-lg hover:bg-neutral-50 transition-colors border border-neutral-100"
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <h3 className="font-semibold text-neutral-900 mb-1">{post.title}</h3>
                                    <p className="text-sm text-neutral-600">
                                        Updated {formatDate(post.updated_at)}
                                    </p>
                                </div>
                                <span
                                    className={`px-3 py-1 text-xs font-semibold rounded-full ${post.published
                                        ? 'bg-green-100 text-green-700'
                                        : 'bg-amber-100 text-amber-700'
                                        }`}
                                >
                                    {post.published ? 'Published' : 'Draft'}
                                </span>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
}
