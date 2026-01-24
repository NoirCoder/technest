'use client';

import { supabase, Category } from '@/lib/supabase';
import { slugify } from '@/lib/slugify';
import { useEffect, useState } from 'react';
import { Plus, Tag, Edit2, Trash2, FolderOpen, AlignLeft, Globe } from 'lucide-react';

export default function CategoriesPage() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
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
            if (editingId) {
                const { error } = await supabase
                    .from('categories')
                    .update({
                        name: formData.name,
                        slug: formData.slug || slugify(formData.name),
                        description: formData.description,
                    })
                    .eq('id', editingId);

                if (error) throw error;
            } else {
                const { error } = await supabase
                    .from('categories')
                    .insert({
                        name: formData.name,
                        slug: formData.slug || slugify(formData.name),
                        description: formData.description,
                    });

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
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure? This may affect posts currently in this category.')) return;

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
                        <span className="text-[11px] font-bold uppercase tracking-[0.3em] text-primary-600">Taxonomy</span>
                    </div>
                    <h1 className="text-4xl font-bold font-serif text-neutral-900 tracking-tight">Library Categories</h1>
                    <p className="text-neutral-500 mt-2 text-lg">Organize your publications and define the architecture of your site.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                {/* Form Module */}
                <div className="lg:col-span-4">
                    <div className="bg-white rounded-[2.5rem] border border-neutral-100 p-8 shadow-sm">
                        <div className="flex items-center gap-3 mb-8">
                            <div className="p-2 bg-primary-50 rounded-lg text-primary-600">
                                <Plus className="w-4 h-4" />
                            </div>
                            <h2 className="font-bold text-neutral-900 tracking-tight">{editingId ? 'Edit Perspective' : 'Definiton Module'}</h2>
                        </div>

                        <form onSubmit={handleSave} className="space-y-6">
                            <div>
                                <label className="block text-[11px] font-bold uppercase tracking-[0.2em] text-neutral-400 mb-2">Category Identity</label>
                                <div className="flex items-center px-4 py-3.5 bg-neutral-50 rounded-xl border border-neutral-100 focus-within:border-primary-200 transition-all">
                                    <Tag className="w-4 h-4 text-neutral-400 mr-3" />
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        required
                                        className="bg-transparent text-sm font-bold text-neutral-900 focus:outline-none flex-1"
                                        placeholder="e.g. Mechanical Keyboards"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-[11px] font-bold uppercase tracking-[0.2em] text-neutral-400 mb-2">System Slug</label>
                                <div className="flex items-center px-4 py-3.5 bg-neutral-50 rounded-xl border border-neutral-100 focus-within:border-primary-200 transition-all">
                                    <Globe className="w-4 h-4 text-neutral-400 mr-3" />
                                    <input
                                        type="text"
                                        value={formData.slug}
                                        onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                                        className="bg-transparent text-sm font-mono text-neutral-500 focus:outline-none flex-1"
                                        placeholder="custom-slug"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-[11px] font-bold uppercase tracking-[0.2em] text-neutral-400 mb-2">Scope Description</label>
                                <div className="flex items-start px-4 py-3.5 bg-neutral-50 rounded-xl border border-neutral-100 focus-within:border-primary-200 transition-all">
                                    <AlignLeft className="w-4 h-4 text-neutral-400 mr-3 mt-1" />
                                    <textarea
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        rows={3}
                                        className="bg-transparent text-sm text-neutral-700 focus:outline-none flex-1 resize-none"
                                        placeholder="What kind of gear fits here?"
                                    />
                                </div>
                            </div>

                            <div className="pt-4 flex items-center gap-3">
                                {editingId && (
                                    <button
                                        type="button"
                                        onClick={() => { setEditingId(null); setFormData({ name: '', slug: '', description: '' }); }}
                                        className="flex-1 py-4 rounded-xl border border-neutral-100 font-bold text-sm text-neutral-500 hover:bg-neutral-50"
                                    >
                                        Cancel
                                    </button>
                                )}
                                <button
                                    type="submit"
                                    disabled={isSaving}
                                    className="flex-[2] btn-primary py-4 shadow-xl shadow-primary-50 font-bold text-sm disabled:opacity-50"
                                >
                                    {isSaving ? 'Processing...' : (editingId ? 'Update Taxonomy' : 'Create Category')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>

                {/* List Module */}
                <div className="lg:col-span-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {categories.map((category) => (
                            <div
                                key={category.id}
                                className="group bg-white p-8 rounded-[2.5rem] border border-neutral-100 hover:border-primary-100 hover:shadow-xl hover:shadow-primary-50/20 transition-all duration-500 flex flex-col justify-between"
                            >
                                <div className="mb-6">
                                    <div className="w-12 h-12 bg-neutral-50 rounded-2xl flex items-center justify-center text-neutral-400 group-hover:bg-primary-50 group-hover:text-primary-600 transition-colors mb-6">
                                        <FolderOpen className="w-6 h-6" />
                                    </div>
                                    <h3 className="text-xl font-bold text-neutral-900 group-hover:text-primary-800 transition-colors mb-2">{category.name}</h3>
                                    <p className="text-[10px] font-mono font-bold text-neutral-300 uppercase tracking-widest mb-4">/category/{category.slug}</p>
                                    <p className="text-sm text-neutral-400 line-clamp-2 leading-relaxed">
                                        {category.description || 'No specialized scope defined for this category.'}
                                    </p>
                                </div>
                                <div className="flex items-center justify-end gap-3 pt-6 border-t border-neutral-50">
                                    <button
                                        onClick={() => handleEdit(category)}
                                        className="p-3 bg-neutral-50 text-neutral-400 hover:text-primary-600 rounded-xl transition-all"
                                    >
                                        <Edit2 className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(category.id)}
                                        className="p-3 bg-neutral-50 text-neutral-400 hover:text-red-600 rounded-xl transition-all"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
