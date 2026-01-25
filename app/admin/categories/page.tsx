'use client';

import { supabase, Category } from '@/lib/supabase';
import { slugify } from '@/lib/slugify';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
    Plus,
    Tag,
    Edit2,
    Trash2,
    FolderOpen,
    AlignLeft,
    Globe,
    ChevronRight,
    Search,
    Hash,
    Layers,
    ExternalLink,
    Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

export default function CategoriesPage() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [formData, setFormData] = useState({
        name: '',
        slug: '',
        description: '',
    });

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        const { data } = await supabase
            .from('categories')
            .select('*')
            .order('name');

        if (data) setCategories(data);
        setLoading(false);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);

        try {
            const payload = {
                name: formData.name,
                slug: formData.slug || slugify(formData.name),
                description: formData.description,
            };

            if (editingId) {
                const { error } = await supabase
                    .from('categories')
                    .update(payload)
                    .eq('id', editingId);

                if (error) throw error;
            } else {
                const { error } = await supabase
                    .from('categories')
                    .insert(payload);

                if (error) throw error;
            }

            setFormData({ name: '', slug: '', description: '' });
            setEditingId(null);
            fetchCategories();
        } catch (error: any) {
            alert('Error saving category: ' + error.message);
        } finally {
            setIsSaving(false);
        }
    };

    const handleEdit = (category: Category) => {
        setEditingId(category.id);
        setFormData({
            name: category.name,
            slug: category.slug,
            description: category.description || '',
        });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure? This action will disconnect this category from all assigned publications.')) return;

        const { error } = await supabase
            .from('categories')
            .delete()
            .eq('id', id);

        if (error) {
            alert('Error deleting category');
        } else {
            setCategories(categories.filter(c => c.id !== id));
        }
    };

    const filteredCategories = categories.filter(cat =>
        cat.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-[50vh] space-y-4">
                <div className="w-8 h-8 border-2 border-neutral-100 border-t-neutral-900 rounded-full animate-spin"></div>
                <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest animate-pulse">Mapping Taxonomy...</p>
            </div>
        );
    }

    return (
        <div className="space-y-12">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 border-b border-neutral-100 pb-10">
                <div>
                    <div className="flex items-center gap-2 mb-3">
                        <Layers className="w-4 h-4 text-neutral-400" />
                        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-400">Taxonomic Archive</span>
                    </div>
                    <h1 className="text-4xl font-bold tracking-tight text-neutral-900 mb-2">Category Architecture</h1>
                    <p className="text-neutral-500 font-medium">Define the core pillars and structural hierarchy of TechNest.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
                <div className="lg:col-span-4 sticky top-6">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white rounded-[2rem] border border-neutral-100 p-8 shadow-sm"
                    >
                        <div className="flex items-center gap-3 mb-8">
                            <div className="p-2.5 bg-neutral-900 rounded-xl text-white">
                                {editingId ? <Edit2 className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                            </div>
                            <h2 className="font-bold text-neutral-900 tracking-tight">
                                {editingId ? 'Revision Module' : 'Definition Module'}
                            </h2>
                        </div>

                        <form onSubmit={handleSave} className="space-y-6">
                            <div className="space-y-2">
                                <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-400">Identity</label>
                                <div className="group relative">
                                    <Tag className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-300 group-focus-within:text-neutral-900 transition-colors" />
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        required
                                        className="w-full pl-11 pr-4 py-3.5 bg-neutral-50 rounded-xl border border-transparent focus:border-neutral-200 focus:bg-white transition-all text-sm font-bold text-neutral-900 placeholder:text-neutral-300 outline-none shadow-inner"
                                        placeholder="Category name..."
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-400">System Slug</label>
                                <div className="group relative">
                                    <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-300 group-focus-within:text-neutral-900 transition-colors" />
                                    <input
                                        type="text"
                                        value={formData.slug}
                                        onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                                        className="w-full pl-10 pr-4 py-3.5 bg-neutral-50 rounded-xl border border-transparent focus:border-neutral-200 focus:bg-white transition-all text-sm font-mono text-neutral-500 placeholder:text-neutral-300 outline-none shadow-inner"
                                        placeholder="custom-url-path"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-400">Mission Statement</label>
                                <div className="group relative">
                                    <AlignLeft className="absolute left-4 top-4 w-4 h-4 text-neutral-300 group-focus-within:text-neutral-900 transition-colors" />
                                    <textarea
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        rows={4}
                                        className="w-full pl-11 pr-4 py-3.5 bg-neutral-50 rounded-xl border border-transparent focus:border-neutral-200 focus:bg-white transition-all text-sm text-neutral-700 placeholder:text-neutral-300 outline-none shadow-inner resize-none leading-relaxed"
                                        placeholder="Describe the scope of this classification..."
                                    />
                                </div>
                            </div>

                            <div className="pt-4 flex flex-col gap-3">
                                <button
                                    type="submit"
                                    disabled={isSaving}
                                    className="w-full h-12 rounded-xl bg-[#09090B] text-white hover:bg-neutral-800 font-bold text-sm transition-all shadow-xl shadow-neutral-100 disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {isSaving ? <Loader2 className="w-4 h-4 animate-spin text-white" /> : (editingId ? 'Update Definition' : 'Commit Taxonomy')}
                                </button>
                                {editingId && (
                                    <button
                                        type="button"
                                        onClick={() => { setEditingId(null); setFormData({ name: '', slug: '', description: '' }); }}
                                        className="w-full h-12 rounded-xl border border-neutral-200 text-neutral-500 hover:bg-neutral-50 font-bold text-sm transition-all shadow-sm"
                                    >
                                        Discard Changes
                                    </button>
                                )}
                            </div>
                        </form>
                    </motion.div>
                </div>

                <div className="lg:col-span-8 space-y-8">
                    <div className="relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-neutral-300 group-focus-within:text-neutral-900 transition-colors" />
                        <input
                            type="text"
                            placeholder="Filter taxonomic index..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-12 pr-4 py-4 bg-white rounded-2xl border border-neutral-100 focus:ring-4 focus:ring-neutral-50 transition-all text-sm font-medium outline-none"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <AnimatePresence mode="popLayout">
                            {filteredCategories.map((category) => (
                                <motion.div
                                    layout
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    key={category.id}
                                    className={cn(
                                        "group bg-white p-8 rounded-[2rem] border transition-all duration-500 flex flex-col justify-between shadow-sm relative overflow-hidden",
                                        editingId === category.id ? "border-primary-200 ring-4 ring-primary-50 shadow-lg" : "border-neutral-100 hover:border-neutral-200 hover:shadow-xl hover:shadow-neutral-100"
                                    )}
                                >
                                    <div className="absolute -top-4 -right-4 w-24 h-24 bg-neutral-50 rounded-full opacity-50 blur-2xl group-hover:bg-primary-50/50 transition-colors" />

                                    <div className="mb-6 relative z-10">
                                        <div className="flex justify-between items-start mb-6">
                                            <div className="w-12 h-12 bg-neutral-50 rounded-2xl flex items-center justify-center text-neutral-400 group-hover:bg-white group-hover:shadow-sm group-hover:text-primary-600 transition-all">
                                                <Hash className="w-5 h-5" />
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => handleEdit(category)}
                                                    className="p-2.5 rounded-xl bg-neutral-50 text-neutral-400 hover:text-primary-600 hover:bg-white hover:shadow-sm transition-all"
                                                >
                                                    <Edit2 className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(category.id)}
                                                    className="p-2.5 rounded-xl bg-neutral-50 text-neutral-400 hover:text-red-600 hover:bg-white hover:shadow-sm transition-all"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                        <h3 className="text-xl font-bold text-neutral-900 mb-1 group-hover:text-primary-900 transition-colors">{category.name}</h3>
                                        <div className="flex items-center gap-1.5 text-[10px] font-mono font-bold text-neutral-300 uppercase tracking-widest mb-5">
                                            <Globe className="w-3 h-3" />
                                            /{category.slug}
                                        </div>
                                        <p className="text-sm text-neutral-500 font-medium line-clamp-3 leading-relaxed">
                                            {category.description || 'A primary classification pillar with no specialized description defined.'}
                                        </p>
                                    </div>

                                    <div className="pt-6 border-t border-neutral-50 flex items-center justify-between relative z-10">
                                        <div className="flex items-center gap-2 text-[10px] font-bold text-neutral-400 bg-neutral-50 px-3 py-1.5 rounded-full">
                                            <span>Active Cluster</span>
                                            <ChevronRight className="w-3 h-3" />
                                        </div>
                                        <Link href={`/category/${category.slug}`} target="_blank" className="p-2 border border-neutral-100 rounded-lg text-neutral-300 hover:text-primary-600 hover:border-primary-100 transition-all">
                                            <ExternalLink className="w-3.5 h-3.5" />
                                        </Link>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>

                    {filteredCategories.length === 0 && (
                        <div className="py-32 text-center bg-white rounded-[3rem] border-2 border-dashed border-neutral-100">
                            <FolderOpen className="w-12 h-12 text-neutral-100 mx-auto mb-4" />
                            <h3 className="text-xl font-bold text-neutral-900 mb-2 font-serif italic">No Classifications Found</h3>
                            <p className="text-neutral-400 font-medium max-w-xs mx-auto">Either your search is too specific or the archive is awaiting new definitions.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
