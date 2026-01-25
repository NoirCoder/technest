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
            <div className="flex flex-col items-center justify-center h-[50vh] space-y-6">
                <div className="w-12 h-12 border-[4px] border-neutral-100 border-t-neutral-900 rounded-none animate-spin shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"></div>
                <p className="text-neutral-400 font-black text-[10px] uppercase tracking-[0.4em] animate-pulse">Mapping Taxonomy Architecture...</p>
            </div>
        );
    }

    return (
        <div className="space-y-16">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-12 border-b-[4px] border-neutral-900 pb-16">
                <div>
                    <div className="flex items-center gap-3 mb-6">
                        <Layers className="w-4 h-4 text-neutral-900" />
                        <span className="text-[11px] font-black uppercase tracking-[0.4em] text-neutral-400">Classified Taxonomic Index</span>
                    </div>
                    <h1 className="text-6xl font-black tracking-tighter text-neutral-900 uppercase leading-none mb-4">Architecture</h1>
                    <p className="text-lg font-bold text-neutral-400 uppercase tracking-widest">Define structural pillars for editorial intelligence.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
                <div className="lg:col-span-4 sticky top-12">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="brutalist-card bg-white p-10 border-neutral-900 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]"
                    >
                        <div className="flex items-center gap-4 mb-10">
                            <div className="w-12 h-12 bg-neutral-900 flex items-center justify-center text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)]">
                                {editingId ? <Edit2 className="w-5 h-5 text-primary-400" /> : <Plus className="w-5 h-5 text-primary-400" />}
                            </div>
                            <h2 className="text-xl font-black text-neutral-900 uppercase tracking-tighter">
                                {editingId ? 'Revision Protocol' : 'Definition Module'}
                            </h2>
                        </div>

                        <form onSubmit={handleSave} className="space-y-8">
                            <div className="space-y-3">
                                <label className="block text-[10px] font-black uppercase tracking-widest text-neutral-400">Tactical Identity</label>
                                <div className="relative group">
                                    <Tag className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-900 group-focus-within:text-primary-400 transition-colors" />
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        required
                                        className="brutalist-input h-14 pl-14 uppercase"
                                        placeholder="CATEGORY CODE..."
                                    />
                                </div>
                            </div>

                            <div className="space-y-3">
                                <label className="block text-[10px] font-black uppercase tracking-widest text-neutral-400">Resource URI (Slug)</label>
                                <div className="relative group">
                                    <Globe className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-900 group-focus-within:text-primary-400 transition-colors" />
                                    <input
                                        type="text"
                                        value={formData.slug}
                                        onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                                        className="brutalist-input h-14 pl-14 font-mono lowercase"
                                        placeholder="custom-path"
                                    />
                                </div>
                            </div>

                            <div className="space-y-3">
                                <label className="block text-[10px] font-black uppercase tracking-widest text-neutral-400">Mission Statement</label>
                                <div className="relative group">
                                    <AlignLeft className="absolute left-5 top-5 w-4 h-4 text-neutral-900 group-focus-within:text-primary-400 transition-colors" />
                                    <textarea
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        rows={4}
                                        className="brutalist-input pl-14 pr-6 py-5 resize-none leading-relaxed font-bold"
                                        placeholder="CLASSIFICATION PARAMETERS..."
                                    />
                                </div>
                            </div>

                            <div className="pt-6 flex flex-col gap-4">
                                <button
                                    type="submit"
                                    disabled={isSaving}
                                    className="brutalist-button-primary h-14 w-full"
                                >
                                    {isSaving ? <Loader2 className="w-5 h-5 animate-spin mr-3" /> : (editingId ? 'COMMIT REVISION' : 'INITIALIZE PILLAR')}
                                </button>
                                {editingId && (
                                    <button
                                        type="button"
                                        onClick={() => { setEditingId(null); setFormData({ name: '', slug: '', description: '' }); }}
                                        className="brutalist-button h-14 w-full bg-white border-neutral-900"
                                    >
                                        ABORT REVISION
                                    </button>
                                )}
                            </div>
                        </form>
                    </motion.div>
                </div>

                <div className="lg:col-span-8 space-y-12">
                    <div className="relative group brutalist-card border-neutral-900">
                        <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-neutral-900" />
                        <input
                            type="text"
                            placeholder="FILTER TAXONOMIC REGISTRY..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-16 pr-8 py-5 bg-transparent border-none focus:ring-0 text-[11px] font-black uppercase tracking-[0.3em] outline-none placeholder:text-neutral-300"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                        <AnimatePresence mode="popLayout">
                            {filteredCategories.map((category) => (
                                <motion.div
                                    layout
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    key={category.id}
                                    className={cn(
                                        "group brutalist-card bg-white p-10 flex flex-col justify-between border-neutral-900 transition-all duration-500",
                                        editingId === category.id ? "bg-primary-50 ring-[4px] ring-neutral-900" : "hover:shadow-[16px_16px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-4px] hover:translate-y-[-4px]"
                                    )}
                                >
                                    <div className="mb-8">
                                        <div className="flex justify-between items-start mb-8">
                                            <div className="w-14 h-14 bg-neutral-900 border-[2px] border-neutral-900 flex items-center justify-center text-primary-400 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)] group-hover:rotate-6 transition-all">
                                                <Hash className="w-6 h-6" />
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <button
                                                    onClick={() => handleEdit(category)}
                                                    className="p-3 bg-white border-[2px] border-neutral-900 text-neutral-900 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[1.5px] hover:translate-y-[1.5px] transition-all"
                                                >
                                                    <Edit2 className="w-4.5 h-4.5" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(category.id)}
                                                    className="p-3 bg-red-400 border-[2px] border-neutral-900 text-neutral-900 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[1.5px] hover:translate-y-[1.5px] transition-all"
                                                >
                                                    <Trash2 className="w-4.5 h-4.5" />
                                                </button>
                                            </div>
                                        </div>
                                        <h3 className="text-2xl font-black text-neutral-900 mb-2 uppercase tracking-tighter group-hover:text-primary-500 transition-colors">{category.name}</h3>
                                        <div className="inline-flex items-center gap-2 text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-6 px-3 py-1 bg-neutral-50 border-[1.5px] border-neutral-200">
                                            <Globe className="w-3 h-3 text-neutral-900" />
                                            /{category.slug}
                                        </div>
                                        <p className="text-sm text-neutral-600 font-bold leading-relaxed line-clamp-3 italic">
                                            "{category.description || 'A primary classification pillar with no specialized description defined.'}"
                                        </p>
                                    </div>

                                    <div className="pt-8 border-t-[3px] border-neutral-900 flex items-center justify-between">
                                        <div className="flex items-center gap-3 text-[10px] font-black text-neutral-900 uppercase tracking-widest bg-neutral-100 px-4 py-1.5 border-[2px] border-neutral-900">
                                            <span>ACTIVE CLUSTER</span>
                                            <ChevronRight className="w-4 h-4 text-primary-500" />
                                        </div>
                                        <Link href={`/category/${category.slug}`} target="_blank" className="p-3 bg-white border-[2px] border-neutral-900 text-neutral-900 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[1.5px] hover:translate-y-[1.5px] transition-all">
                                            <ExternalLink className="w-4.5 h-4.5" />
                                        </Link>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>

                    {filteredCategories.length === 0 && (
                        <div className="brutalist-card py-40 text-center bg-neutral-50 grayscale opacity-40 border-dashed border-neutral-900">
                            <FolderOpen className="w-16 h-16 text-neutral-900 mx-auto mb-10 rotate-6 shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] bg-white p-3 border-[3px] border-neutral-900" />
                            <h3 className="text-2xl font-black text-neutral-900 uppercase tracking-tighter mb-4 italic">Taxonomy Void Detected</h3>
                            <p className="text-[11px] font-black uppercase tracking-[0.4em] text-neutral-400 max-w-sm mx-auto">No classifications matching current parameters. Adjust module filters or initialize new definition.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
