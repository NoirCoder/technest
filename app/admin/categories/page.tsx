'use client';

import { supabase, Category } from '@/lib/supabase';
import { slugify } from '@/lib/slugify';
import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2 } from 'lucide-react';

export default function CategoriesPage() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [showForm, setShowForm] = useState(false);
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);
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

        if (data) {
            setCategories(data);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (editingCategory) {
            // Update existing category
            const { error } = await supabase
                .from('categories')
                .update({
                    name: formData.name,
                    slug: formData.slug,
                    description: formData.description || null,
                })
                .eq('id', editingCategory.id);

            if (!error) {
                resetForm();
                fetchCategories();
            }
        } else {
            // Create new category
            const { error } = await supabase
                .from('categories')
                .insert({
                    name: formData.name,
                    slug: formData.slug,
                    description: formData.description || null,
                });

            if (!error) {
                resetForm();
                fetchCategories();
            }
        }
    };

    const handleEdit = (category: Category) => {
        setEditingCategory(category);
        setFormData({
            name: category.name,
            slug: category.slug,
            description: category.description || '',
        });
        setShowForm(true);
    };

    const handleDelete = async (categoryId: string) => {
        if (!confirm('Are you sure you want to delete this category?')) return;

        const { error } = await supabase
            .from('categories')
            .delete()
            .eq('id', categoryId);

        if (!error) {
            fetchCategories();
        }
    };

    const resetForm = () => {
        setFormData({ name: '', slug: '', description: '' });
        setEditingCategory(null);
        setShowForm(false);
    };

    const handleNameChange = (name: string) => {
        setFormData({
            ...formData,
            name,
            slug: slugify(name),
        });
    };

    return (
        <div>
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold font-serif text-neutral-900">Categories</h1>
                    <p className="text-neutral-600 mt-1">Manage post categories</p>
                </div>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="btn-primary"
                >
                    <Plus className="w-4 h-4 mr-2" />
                    {showForm ? 'Cancel' : 'New Category'}
                </button>
            </div>

            {/* Form */}
            {showForm && (
                <div className="card p-6 mb-6">
                    <h2 className="text-lg font-semibold text-neutral-900 mb-4">
                        {editingCategory ? 'Edit Category' : 'New Category'}
                    </h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-neutral-700 mb-2">
                                Name *
                            </label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => handleNameChange(e.target.value)}
                                required
                                className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                placeholder="e.g., Keyboards"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-neutral-700 mb-2">
                                Slug *
                            </label>
                            <input
                                type="text"
                                value={formData.slug}
                                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                                required
                                className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent font-mono text-sm"
                                placeholder="keyboards"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-neutral-700 mb-2">
                                Description
                            </label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                rows={2}
                                className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                placeholder="Brief description for SEO"
                            />
                        </div>

                        <div className="flex gap-3">
                            <button type="submit" className="btn-primary">
                                {editingCategory ? 'Update' : 'Create'} Category
                            </button>
                            <button
                                type="button"
                                onClick={resetForm}
                                className="btn-secondary"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Categories List */}
            <div className="card overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-neutral-50 border-b border-neutral-200">
                            <tr>
                                <th className="text-left px-6 py-3 text-xs font-semibold text-neutral-600 uppercase">
                                    Name
                                </th>
                                <th className="text-left px-6 py-3 text-xs font-semibold text-neutral-600 uppercase">
                                    Slug
                                </th>
                                <th className="text-left px-6 py-3 text-xs font-semibold text-neutral-600 uppercase">
                                    Description
                                </th>
                                <th className="text-right px-6 py-3 text-xs font-semibold text-neutral-600 uppercase">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-200">
                            {categories.map((category) => (
                                <tr key={category.id} className="hover:bg-neutral-50">
                                    <td className="px-6 py-4 font-semibold text-neutral-900">
                                        {category.name}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-neutral-600 font-mono">
                                        {category.slug}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-neutral-600">
                                        {category.description || '-'}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                onClick={() => handleEdit(category)}
                                                className="p-2 text-neutral-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg"
                                            >
                                                <Edit className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(category.id)}
                                                className="p-2 text-neutral-600 hover:text-red-600 hover:bg-red-50 rounded-lg"
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
            </div>
        </div>
    );
}
