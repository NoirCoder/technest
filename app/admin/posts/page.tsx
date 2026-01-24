'use client';

import { supabase, PostWithCategories } from '@/lib/supabase';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus, Search, Filter, Edit2, Trash2, ExternalLink, MoreVertical, FileText, Clock } from 'lucide-react';
import { formatDate } from '@/lib/markdown';

export default function PostsPage() {
    const [posts, setPosts] = useState<PostWithCategories[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        fetchPosts();
    }, []);

    const fetchPosts = async () => {
        const { data } = await supabase
            .from('posts')
            .select(`
        *,
        categories:post_categories(category:categories(*))
      `)
            .order('updated_at', { ascending: false });

        if (data) {
            const mappedPosts = data.map(post => ({
                ...post,
                categories: post.categories.map((c: any) => c.category)
            })) as PostWithCategories[];
            setPosts(mappedPosts);
        }
        setLoading(false);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this post?')) return;

        const { error } = await supabase
            .from('posts')
            .delete()
            .eq('id', id);

        if (error) {
            alert('Error deleting post');
        } else {
            setPosts(posts.filter(p => p.id !== id));
        }
    };

    const filteredPosts = posts.filter(post =>
        post.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[50vh]">
                <div className="w-10 h-10 border-4 border-primary-100 border-t-primary-600 rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-8 h-1 bg-primary-600 rounded-full"></div>
                        <span className="text-[11px] font-bold uppercase tracking-[0.3em] text-primary-600">Archive</span>
                    </div>
                    <h1 className="text-4xl font-bold font-serif text-neutral-900 tracking-tight">Content Library</h1>
                    <p className="text-neutral-500 mt-2 text-lg">Manage your reviews, guides, and strategic content.</p>
                </div>
                <Link href="/admin/posts/new" className="btn-primary px-8 py-4 shadow-xl shadow-primary-100">
                    <Plus className="w-5 h-5 mr-3" />
                    New Publication
                </Link>
            </div>

            {/* Filters / Search */}
            <div className="bg-white p-6 rounded-[2rem] border border-neutral-100 shadow-sm flex flex-col md:flex-row items-center gap-4 mb-8">
                <div className="relative flex-1 w-full">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                    <input
                        type="text"
                        placeholder="Search publications by title..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-neutral-50 rounded-xl border-none focus:ring-2 focus:ring-primary-100 transition-all text-sm"
                    />
                </div>
                <div className="flex items-center gap-2 w-full md:w-auto">
                    <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-neutral-50 rounded-xl text-neutral-600 hover:bg-neutral-100 transition-all text-sm font-bold border border-neutral-100/50">
                        <Filter className="w-4 h-4" />
                        Status
                    </button>
                    <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-neutral-50 rounded-xl text-neutral-600 hover:bg-neutral-100 transition-all text-sm font-bold border border-neutral-100/50">
                        Date Range
                    </button>
                </div>
            </div>

            {/* Posts Grid */}
            <div className="grid grid-cols-1 gap-4">
                {filteredPosts.length > 0 ? (
                    filteredPosts.map((post) => (
                        <div
                            key={post.id}
                            className="group bg-white p-6 rounded-[2rem] border border-neutral-100 hover:border-primary-100 hover:shadow-xl hover:shadow-primary-50 transition-all duration-300 flex flex-col md:flex-row items-center justify-between gap-6"
                        >
                            <div className="flex items-center gap-6 flex-1 w-full">
                                <div className="w-16 h-16 bg-neutral-50 rounded-[1.25rem] flex items-center justify-center text-neutral-400 group-hover:bg-primary-50 group-hover:text-primary-600 transition-colors flex-shrink-0">
                                    <FileText className="w-7 h-7" />
                                </div>
                                <div className="min-w-0">
                                    <div className="flex items-center gap-3 mb-1 flex-wrap">
                                        <h3 className="text-xl font-bold text-neutral-900 group-hover:text-primary-700 transition-colors truncate">{post.title}</h3>
                                        <span
                                            className={`px-3 py-1 text-[9px] font-bold uppercase tracking-widest rounded-full ${post.published
                                                ? 'bg-green-50 text-green-700 border border-green-100'
                                                : 'bg-amber-50 text-amber-700 border border-amber-100'
                                                }`}
                                        >
                                            {post.published ? 'Live' : 'Draft'}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-4 text-xs font-medium text-neutral-400">
                                        <div className="flex items-center gap-1.5">
                                            <Clock className="w-3.5 h-3.5" />
                                            {formatDate(post.updated_at)}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {post.categories.map(cat => (
                                                <span key={cat.id} className="text-primary-600/60 font-bold uppercase tracking-tighter">#{cat.name.replace(/\s+/g, '')}</span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 w-full md:w-auto">
                                <Link
                                    href={`/blog/${post.slug}`}
                                    target="_blank"
                                    className="p-3 bg-neutral-50 text-neutral-400 hover:text-primary-600 rounded-xl transition-all"
                                    title="View Public Link"
                                >
                                    <ExternalLink className="w-5 h-5" />
                                </Link>
                                <Link
                                    href={`/admin/posts/edit/${post.id}`}
                                    className="p-3 bg-neutral-50 text-neutral-400 hover:text-primary-600 rounded-xl transition-all"
                                    title="Edit Publication"
                                >
                                    <Edit2 className="w-5 h-5" />
                                </Link>
                                <button
                                    onClick={() => handleDelete(post.id)}
                                    className="p-3 bg-neutral-50 text-neutral-400 hover:text-red-600 rounded-xl transition-all"
                                    title="Delete Forever"
                                >
                                    <Trash2 className="w-5 h-5" />
                                </button>
                                <div className="md:hidden">
                                    <button className="p-3 text-neutral-400"><MoreVertical className="w-5 h-5" /></button>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="py-32 text-center bg-white rounded-[3rem] border-2 border-dashed border-neutral-100">
                        <div className="w-20 h-20 bg-neutral-50 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Search className="w-8 h-8 text-neutral-200" />
                        </div>
                        <h3 className="text-xl font-bold text-neutral-900 mb-2 font-serif italic">The Library is Empty</h3>
                        <p className="text-neutral-400 max-w-sm mx-auto">Adjust your search parameters or manifest a new publication to begin.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
