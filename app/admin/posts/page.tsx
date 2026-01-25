'use client';

import { supabase, PostWithCategories } from '@/lib/supabase';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
    Plus,
    Search,
    Filter,
    Edit2,
    Trash2,
    ExternalLink,
    MoreHorizontal,
    FileText,
    Clock,
    ChevronDown,
    LayoutGrid,
    List,
    Archive,
    ArrowUpRight
} from 'lucide-react';
import { formatDate } from '@/lib/markdown';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

export default function PostsPage() {
    const [posts, setPosts] = useState<PostWithCategories[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
    const [activeTab, setActiveTab] = useState<'all' | 'published' | 'draft'>('all');

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
        if (!confirm('Are you sure you want to permanently delete this publication?')) return;

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

    const filteredPosts = posts.filter(post => {
        const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesTab = activeTab === 'all' ||
            (activeTab === 'published' && post.published) ||
            (activeTab === 'draft' && !post.published);
        return matchesSearch && matchesTab;
    });

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-[50vh] space-y-4">
                <div className="w-10 h-10 border-4 border-neutral-100 border-t-neutral-900 rounded-full animate-spin"></div>
                <p className="text-neutral-400 font-bold text-xs uppercase tracking-widest animate-pulse">Scanning Library...</p>
            </div>
        );
    }

    return (
        <div className="space-y-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                <div>
                    <div className="flex items-center gap-2 mb-3">
                        <Archive className="w-4 h-4 text-neutral-400" />
                        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-400">Content Index</span>
                    </div>
                    <h1 className="text-4xl font-bold tracking-tight text-neutral-900 mb-2">Publications</h1>
                    <p className="text-neutral-500 font-medium">Coordinate and scale your editorial repository.</p>
                </div>
                <Link href="/admin/posts/new" className="h-12 px-8 rounded-xl bg-[#09090B] text-white hover:bg-neutral-800 font-bold text-sm transition-all flex items-center gap-2 shadow-xl shadow-neutral-200">
                    <Plus className="w-4 h-4" />
                    New Publication
                </Link>
            </div>

            {/* Controls Bar */}
            <div className="bg-white p-2 rounded-2xl border border-neutral-100 shadow-sm flex flex-col lg:flex-row items-center gap-4">
                {/* Tabs */}
                <div className="flex items-center bg-neutral-50 p-1 rounded-xl w-full lg:w-auto">
                    {[
                        { id: 'all', label: 'All Entries' },
                        { id: 'published', label: 'Published' },
                        { id: 'draft', label: 'Drafts' },
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={cn(
                                "flex-1 lg:flex-none px-6 py-2 rounded-lg text-xs font-bold transition-all",
                                activeTab === tab.id
                                    ? "bg-white text-neutral-900 shadow-sm"
                                    : "text-neutral-400 hover:text-neutral-600"
                            )}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                <div className="h-8 w-px bg-neutral-100 hidden lg:block" />

                {/* Search */}
                <div className="relative flex-1 w-full">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-300" />
                    <input
                        type="text"
                        placeholder="Filter by title or keywords..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-transparent border-none focus:ring-0 text-sm font-medium placeholder:text-neutral-300"
                    />
                </div>

                <div className="h-8 w-px bg-neutral-100 hidden lg:block" />

                {/* View Switcher */}
                <div className="flex items-center gap-2 pr-2 w-full lg:w-auto justify-end">
                    <button
                        onClick={() => setViewMode('table')}
                        className={cn("p-2.5 rounded-xl transition-all", viewMode === 'table' ? "bg-neutral-900 text-white" : "text-neutral-400 hover:bg-neutral-50")}
                    >
                        <List className="w-4.5 h-4.5" />
                    </button>
                    <button
                        onClick={() => setViewMode('grid')}
                        className={cn("p-2.5 rounded-xl transition-all", viewMode === 'grid' ? "bg-neutral-900 text-white" : "text-neutral-400 hover:bg-neutral-50")}
                    >
                        <LayoutGrid className="w-4.5 h-4.5" />
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2.5 bg-neutral-50 rounded-xl text-neutral-900 font-bold text-xs border border-neutral-100 hover:bg-neutral-100 transition-all">
                        <Filter className="w-3.5 h-3.5" />
                        Sort: Latest
                    </button>
                </div>
            </div>

            {/* Content Area */}
            <AnimatePresence mode="wait">
                {viewMode === 'table' ? (
                    <motion.div
                        key="table"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="bg-white border border-neutral-100 rounded-[2rem] overflow-hidden shadow-sm"
                    >
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-neutral-50 bg-neutral-50/30">
                                        <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-widest text-neutral-400">Publication</th>
                                        <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-widest text-neutral-400">Taxonomy</th>
                                        <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-widest text-neutral-400">Status</th>
                                        <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-widest text-neutral-400">Last Revised</th>
                                        <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-widest text-neutral-400 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-neutral-50">
                                    {filteredPosts.map((post) => (
                                        <tr key={post.id} className="group hover:bg-neutral-50/50 transition-all">
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 rounded-xl bg-neutral-50 flex items-center justify-center text-neutral-400 group-hover:bg-white group-hover:shadow-sm transition-all shrink-0">
                                                        <FileText className="w-4.5 h-4.5" />
                                                    </div>
                                                    <div className="min-w-0">
                                                        <h4 className="font-bold text-neutral-900 group-hover:text-primary-700 transition-colors truncate max-w-[300px]">{post.title}</h4>
                                                        <p className="text-[10px] font-mono text-neutral-300 truncate">/blog/{post.slug}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="flex flex-wrap gap-1.5">
                                                    {post.categories.map(cat => (
                                                        <span key={cat.id} className="text-[9px] font-bold px-2 py-0.5 bg-neutral-100 text-neutral-500 rounded-md">
                                                            {cat.name}
                                                        </span>
                                                    ))}
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className={cn(
                                                    "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest border",
                                                    post.published ? "bg-green-50 text-green-700 border-green-100" : "bg-neutral-50 text-neutral-400 border-neutral-100"
                                                )}>
                                                    <div className={cn("w-1 h-1 rounded-full", post.published ? "bg-green-600 animate-pulse" : "bg-neutral-300")} />
                                                    {post.published ? 'Stable' : 'Draft'}
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <p className="text-xs font-bold text-neutral-600">{formatDate(post.updated_at)}</p>
                                                <p className="text-[10px] font-medium text-neutral-400 uppercase tracking-tighter">via Editor</p>
                                            </td>
                                            <td className="px-8 py-6 text-right">
                                                <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <Link
                                                        href={`/blog/${post.slug}`}
                                                        target="_blank"
                                                        className="p-2.5 rounded-xl bg-white border border-neutral-100 text-neutral-400 hover:text-primary-600 hover:border-primary-100 transition-all shadow-sm"
                                                    >
                                                        <ExternalLink className="w-4 h-4" />
                                                    </Link>
                                                    <Link
                                                        href={`/admin/posts/edit/${post.id}`}
                                                        className="p-2.5 rounded-xl bg-white border border-neutral-100 text-neutral-400 hover:text-primary-600 hover:border-primary-100 transition-all shadow-sm"
                                                    >
                                                        <Edit2 className="w-4 h-4" />
                                                    </Link>
                                                    <button
                                                        onClick={() => handleDelete(post.id)}
                                                        className="p-2.5 rounded-xl bg-white border border-neutral-100 text-neutral-400 hover:text-red-600 hover:border-red-100 transition-all shadow-sm"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </motion.div>
                ) : (
                    <motion.div
                        key="grid"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                    >
                        {filteredPosts.map((post) => (
                            <div key={post.id} className="group bg-white p-6 rounded-[2rem] border border-neutral-100 hover:border-primary-100 hover:shadow-xl hover:shadow-primary-50 transition-all duration-500 relative flex flex-col justify-between h-[280px]">
                                <div>
                                    <div className="flex justify-between items-start mb-6">
                                        <div className="w-12 h-12 bg-neutral-50 rounded-2xl flex items-center justify-center text-neutral-400 group-hover:bg-primary-50 group-hover:text-primary-600 transition-all">
                                            <FileText className="w-5 h-5" />
                                        </div>
                                        <div className={cn(
                                            "px-3 py-1 rounded-full text-[8px] font-bold uppercase tracking-widest border",
                                            post.published ? "bg-green-50 text-green-700 border-green-100" : "bg-neutral-50 text-neutral-400 border-neutral-100"
                                        )}>
                                            {post.published ? 'Stable' : 'Draft'}
                                        </div>
                                    </div>
                                    <h3 className="text-lg font-bold text-neutral-900 group-hover:text-primary-800 transition-colors line-clamp-2 mb-2">{post.title}</h3>
                                    <p className="text-[10px] font-medium text-neutral-400 uppercase tracking-widest">{formatDate(post.updated_at)}</p>
                                </div>

                                <div className="flex items-center justify-between pt-6 border-t border-neutral-50">
                                    <div className="flex -space-x-2">
                                        {post.categories.slice(0, 3).map((cat, i) => (
                                            <div key={cat.id} className="w-6 h-6 rounded-full bg-white border border-neutral-100 flex items-center justify-center text-[8px] font-bold text-neutral-400 shadow-sm z-[10]" style={{ zIndex: 10 - i }}>
                                                {cat.name[0]}
                                            </div>
                                        ))}
                                        {post.categories.length > 3 && (
                                            <div className="w-6 h-6 rounded-full bg-neutral-50 border border-neutral-100 flex items-center justify-center text-[8px] font-bold text-neutral-400 z-0">
                                                +{post.categories.length - 3}
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Link href={`/admin/posts/edit/${post.id}`} className="text-xs font-bold text-neutral-900 hover:text-primary-600 transition-colors">Edit Plan</Link>
                                        <ArrowUpRight className="w-3.5 h-3.5 text-neutral-300" />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Empty State */}
            {filteredPosts.length === 0 && (
                <div className="py-40 text-center bg-white rounded-[3rem] border-2 border-dashed border-neutral-100">
                    <div className="w-20 h-20 bg-neutral-50 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Archive className="w-8 h-8 text-neutral-200" />
                    </div>
                    <h3 className="text-xl font-bold text-neutral-900 mb-2 font-serif italic">Library Archive Empty</h3>
                    <p className="text-neutral-400 max-w-sm mx-auto font-medium">No publications match your current filters. Adjust your search or draft a new entry.</p>
                </div>
            )}
        </div>
    );
}
