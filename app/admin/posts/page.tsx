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
import { revalidateBlog } from '@/lib/revalidate';
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
            // Force production sync
            await revalidateBlog();
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
            <div className="flex flex-col items-center justify-center h-[50vh] space-y-6">
                <div className="w-12 h-12 border-[4px] border-neutral-100 border-t-neutral-900 rounded-none animate-spin shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"></div>
                <p className="text-neutral-400 font-black text-[10px] uppercase tracking-[0.4em] animate-pulse">Scanning Intel Library...</p>
            </div>
        );
    }

    return (
        <div className="space-y-16">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-12 border-b-[4px] border-neutral-900 pb-16">
                <div>
                    <div className="flex items-center gap-3 mb-6">
                        <Archive className="w-4 h-4 text-neutral-900" />
                        <span className="text-[11px] font-black uppercase tracking-[0.4em] text-neutral-400">Tactical Content Repository</span>
                    </div>
                    <h1 className="text-6xl font-black tracking-tighter text-neutral-900 uppercase leading-none mb-4">Publications</h1>
                    <p className="text-lg font-bold text-neutral-400 uppercase tracking-widest">Scale your editorial intelligence.</p>
                </div>
                <Link href="/admin/posts/new" className="brutalist-button-primary h-16 px-10">
                    <Plus className="w-5 h-5 mr-3" />
                    <span className="text-[10px] font-black">INITIALIZE NEW ARCHIVE</span>
                </Link>
            </div>

            {/* Controls Bar */}
            <div className="bg-white border-[3px] border-neutral-900 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-3 flex flex-col lg:flex-row items-center gap-6">
                {/* Tabs */}
                <div className="flex items-center bg-neutral-100 border-[2.5px] border-neutral-900 p-1 w-full lg:w-auto">
                    {[
                        { id: 'all', label: 'ALL ARCHIVES' },
                        { id: 'published', label: 'STABLE' },
                        { id: 'draft', label: 'INCUBATING' },
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={cn(
                                "flex-1 lg:flex-none px-6 py-2 text-[10px] font-black transition-all",
                                activeTab === tab.id
                                    ? "bg-neutral-900 text-white shadow-[2px_2px_0px_0px_rgba(255,255,255,0.2)]"
                                    : "text-neutral-400 hover:text-neutral-900"
                            )}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Search */}
                <div className="relative flex-1 w-full group">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400 group-hover:text-neutral-900 transition-colors" />
                    <input
                        type="text"
                        placeholder="FILTER BY INTEL HEADLINE OR KEYWORDS..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-16 pr-6 py-4 bg-neutral-50 border-[2.5px] border-neutral-900 font-black text-[11px] uppercase tracking-widest placeholder:text-neutral-300 focus:bg-white transition-all outline-none"
                    />
                </div>

                {/* View Switcher */}
                <div className="flex items-center gap-4 w-full lg:w-auto justify-end">
                    <div className="flex border-[2px] border-neutral-900">
                        <button
                            onClick={() => setViewMode('table')}
                            className={cn("p-3 transition-all", viewMode === 'table' ? "bg-neutral-900 text-white" : "bg-white text-neutral-400 hover:bg-neutral-50")}
                        >
                            <List className="w-5 h-5" />
                        </button>
                        <button
                            onClick={() => setViewMode('grid')}
                            className={cn("p-3 border-l-[2px] border-neutral-900 transition-all", viewMode === 'grid' ? "bg-neutral-900 text-white" : "bg-white text-neutral-400 hover:bg-neutral-50")}
                        >
                            <LayoutGrid className="w-5 h-5" />
                        </button>
                    </div>
                    <button className="h-12 flex items-center gap-3 px-6 bg-neutral-900 text-primary-400 font-black text-[10px] uppercase tracking-widest border-[2.5px] border-neutral-900 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)]">
                        <Filter className="w-4 h-4" />
                        LATEST
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
                        className="bg-white border-[3px] border-neutral-900 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] overflow-hidden"
                    >
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-neutral-900 border-b-[3px] border-neutral-900">
                                        <th className="px-10 py-6 text-[11px] font-black uppercase tracking-[0.3em] text-neutral-500">Archive/Intel</th>
                                        <th className="px-10 py-6 text-[11px] font-black uppercase tracking-[0.3em] text-neutral-500">Classification</th>
                                        <th className="px-10 py-6 text-[11px] font-black uppercase tracking-[0.3em] text-neutral-500">Protocol</th>
                                        <th className="px-10 py-6 text-[11px] font-black uppercase tracking-[0.3em] text-neutral-500">Record Date</th>
                                        <th className="px-10 py-6 text-[11px] font-black uppercase tracking-[0.3em] text-neutral-500 text-right">Commands</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y-[2px] divide-neutral-900">
                                    {filteredPosts.map((post) => (
                                        <tr key={post.id} className="group hover:bg-neutral-50 transition-all">
                                            <td className="px-10 py-8">
                                                <div className="flex items-center gap-6">
                                                    <div className="w-14 h-14 bg-white border-[2px] border-neutral-900 flex items-center justify-center text-neutral-900 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] group-hover:shadow-none translate-x-[-2px] group-hover:translate-x-0 group-hover:translate-y-0 translate-y-[-2px] transition-all shrink-0">
                                                        <FileText className="w-6 h-6" />
                                                    </div>
                                                    <div className="min-w-0">
                                                        <h4 className="text-lg font-black text-neutral-900 uppercase tracking-tighter mb-2 group-hover:text-primary-400 transition-colors truncate max-w-[400px]">{post.title}</h4>
                                                        <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest truncate">ARCHIVE://{post.slug}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-10 py-8">
                                                <div className="flex flex-wrap gap-2">
                                                    {post.categories.map(cat => (
                                                        <span key={cat.id} className="text-[9px] font-black px-3 py-1 bg-neutral-900 text-white border border-neutral-900 shadow-[2px_2px_0px_0px_rgba(0,0,0,0.2)] uppercase tracking-widest">
                                                            {cat.name}
                                                        </span>
                                                    ))}
                                                </div>
                                            </td>
                                            <td className="px-10 py-8">
                                                <div className={cn(
                                                    "inline-flex items-center gap-2 px-4 py-1.5 border-[2px] text-[10px] font-black uppercase tracking-[0.2em] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]",
                                                    post.published ? "bg-primary-400 border-neutral-900 text-neutral-900" : "bg-white border-neutral-900 text-neutral-400 grayscale shadow-none"
                                                )}>
                                                    <div className={cn("w-2 h-2", post.published ? "bg-neutral-900 animate-pulse" : "bg-neutral-200")} />
                                                    {post.published ? 'STABLE' : 'DRAFT'}
                                                </div>
                                            </td>
                                            <td className="px-10 py-8">
                                                <p className="text-[11px] font-black text-neutral-900">{formatDate(post.updated_at).toUpperCase()}</p>
                                                <p className="text-[9px] font-black text-neutral-400 uppercase tracking-widest mt-1">INTEL HUB 2.0</p>
                                            </td>
                                            <td className="px-10 py-8 text-right">
                                                <div className="flex items-center justify-end gap-3 translate-x-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-0 transition-all">
                                                    <Link
                                                        href={`/blog/${post.slug}`}
                                                        target="_blank"
                                                        className="p-3 bg-white border-[2px] border-neutral-900 text-neutral-900 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[1.5px] hover:translate-y-[1.5px] transition-all"
                                                    >
                                                        <ExternalLink className="w-4.5 h-4.5" />
                                                    </Link>
                                                    <Link
                                                        href={`/admin/posts/edit/${post.id}`}
                                                        className="p-3 bg-white border-[2px] border-neutral-900 text-neutral-900 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[1.5px] hover:translate-y-[1.5px] transition-all"
                                                    >
                                                        <Edit2 className="w-4.5 h-4.5" />
                                                    </Link>
                                                    <button
                                                        onClick={() => handleDelete(post.id)}
                                                        className="p-3 bg-red-400 border-[2px] border-neutral-900 text-neutral-900 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[1.5px] hover:translate-y-[1.5px] transition-all"
                                                    >
                                                        <Trash2 className="w-4.5 h-4.5" />
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
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10"
                    >
                        {filteredPosts.map((post) => (
                            <div key={post.id} className="group brutalist-card bg-white p-10 flex flex-col justify-between h-[360px] border-neutral-900">
                                <div>
                                    <div className="flex justify-between items-start mb-8">
                                        <div className="w-14 h-14 bg-neutral-900 border-[2px] border-neutral-900 flex items-center justify-center text-primary-400 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)] group-hover:rotate-6 transition-all">
                                            <FileText className="w-6 h-6" />
                                        </div>
                                        <div className={cn(
                                            "px-4 py-1.5 border-[2px] text-[9px] font-black uppercase tracking-[0.2em] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]",
                                            post.published ? "bg-primary-400 border-neutral-900 text-neutral-900" : "bg-neutral-50 text-neutral-400 border-neutral-200 shadow-none border-dashed"
                                        )}>
                                            {post.published ? 'STABLE' : 'DRAFT'}
                                        </div>
                                    </div>
                                    <h3 className="text-2xl font-black text-neutral-900 uppercase tracking-tighter line-clamp-2 mb-4 group-hover:text-primary-400 transition-colors">{post.title}</h3>
                                    <p className="text-[10px] font-black text-neutral-400 uppercase tracking-[0.3em]">{formatDate(post.updated_at).toUpperCase()}</p>
                                </div>

                                <div className="flex items-center justify-between pt-8 border-t-[3px] border-neutral-900">
                                    <div className="flex -space-x-3">
                                        {post.categories.slice(0, 3).map((cat, i) => (
                                            <div key={cat.id} className="w-10 h-10 border-[2px] border-neutral-900 bg-white flex items-center justify-center text-[10px] font-black text-neutral-900 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] group-hover:translate-x-[-4px] transition-transform" style={{ zIndex: 10 - i }}>
                                                {cat.name[0].toUpperCase()}
                                            </div>
                                        ))}
                                        {post.categories.length > 3 && (
                                            <div className="w-10 h-10 border-[2px] border-neutral-900 bg-neutral-900 text-white flex items-center justify-center text-[10px] font-black z-0">
                                                +{post.categories.length - 3}
                                            </div>
                                        )}
                                    </div>
                                    <Link
                                        href={`/admin/posts/edit/${post.id}`}
                                        className="brutalist-button h-12 px-6 bg-neutral-900 text-white text-[10px] font-black"
                                    >
                                        OPEN MISSION
                                        <ArrowUpRight className="ml-2 w-4 h-4 text-primary-400" />
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Empty State */}
            {filteredPosts.length === 0 && (
                <div className="brutalist-card py-40 text-center bg-neutral-50 grayscale opacity-40 border-dashed border-neutral-900">
                    <div className="w-24 h-24 bg-white border-[3px] border-neutral-900 flex items-center justify-center mx-auto mb-10 rotate-6 shadow-[10px_10px_0px_0px_rgba(0,0,0,1)]">
                        <Archive className="w-10 h-10 text-neutral-900" />
                    </div>
                    <h3 className="text-2xl font-black text-neutral-900 uppercase tracking-tighter mb-4 italic">Library Archive Neutralized</h3>
                    <p className="text-[11px] font-black uppercase tracking-[0.4em] text-neutral-400 max-w-sm mx-auto">No publication patterns detected for current query module. Reset protocols or initialize new entry.</p>
                </div>
            )}
        </div>
    );
}
