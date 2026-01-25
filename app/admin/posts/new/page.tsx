'use client';

import { supabase, Category } from '@/lib/supabase';
import { slugify } from '@/lib/slugify';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import MarkdownEditor from '@/components/admin/MarkdownEditor';
import { ArrowLeft, Save, Globe, Eye, Settings, Image as ImageIcon, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { uploadImage } from '@/lib/storage';
import { useRef } from 'react';

export default function NewPostPage() {
    const router = useRouter();
    const featuredImageInputRef = useRef<HTMLInputElement>(null);
    const [isUploadingFeatured, setIsUploadingFeatured] = useState(false);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        slug: '',
        excerpt: '',
        content: '',
        featured_image: '',
        meta_title: '',
        meta_description: '',
        published: false,
        featured: false,
        selectedCategories: [] as string[],
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

    const handleTitleChange = (title: string) => {
        setFormData({
            ...formData,
            title,
            slug: slugify(title),
        });
    };

    const handleFeaturedImageUpload = async (file: File) => {
        setIsUploadingFeatured(true);
        try {
            const url = await uploadImage(file);
            setFormData(prev => ({ ...prev, featured_image: url }));
        } catch (error) {
            console.error('Upload failed:', error);
            alert('Image upload failed.');
        } finally {
            setIsUploadingFeatured(false);
        }
    };

    const handleCategoryToggle = (categoryId: string) => {
        const isSelected = formData.selectedCategories.includes(categoryId);
        setFormData({
            ...formData,
            selectedCategories: isSelected
                ? formData.selectedCategories.filter(id => id !== categoryId)
                : [...formData.selectedCategories, categoryId],
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const { data: { user } } = await supabase.auth.getUser();

            const { data: post, error: postError } = await supabase
                .from('posts')
                .insert({
                    title: formData.title,
                    slug: formData.slug,
                    excerpt: formData.excerpt || null,
                    content: formData.content,
                    featured_image: formData.featured_image || null,
                    meta_title: formData.meta_title || formData.title,
                    meta_description: formData.meta_description || formData.excerpt || null,
                    author_id: user?.id,
                    published: formData.published,
                    featured: formData.featured,
                    published_at: formData.published ? new Date().toISOString() : null,
                })
                .select()
                .single();

            if (postError) throw postError;

            if (formData.selectedCategories.length > 0) {
                const categoryLinks = formData.selectedCategories.map(categoryId => ({
                    post_id: post.id,
                    category_id: categoryId,
                }));

                const { error: categoryError } = await supabase
                    .from('post_categories')
                    .insert(categoryLinks);

                if (categoryError) throw categoryError;
            }

            router.push('/admin/posts');
        } catch (error: unknown) {
            alert('Error creating post: ' + (error instanceof Error ? error.message : 'Unknown error'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-7xl mx-auto">
            {/* Context Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                <div>
                    <Link
                        href="/admin/posts"
                        className="inline-flex items-center text-[11px] font-bold uppercase tracking-[0.2em] text-neutral-400 hover:text-primary-600 transition-colors mb-3"
                    >
                        <ArrowLeft className="w-3 h-3 mr-2" />
                        Back to Library
                    </Link>
                    <h1 className="text-4xl font-bold font-serif text-neutral-900 tracking-tight text-balance">Create New Publication</h1>
                </div>
                <div className="flex items-center gap-4">
                    <button
                        type="button"
                        onClick={() => router.push('/admin/posts')}
                        className="px-6 py-3 rounded-xl border border-neutral-200 text-neutral-600 hover:bg-neutral-50 font-bold text-sm transition-all"
                    >
                        Discard
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="btn-primary px-8 py-3.5 shadow-xl shadow-primary-100 disabled:opacity-50"
                    >
                        {loading ? (
                            <span className="flex items-center gap-2">
                                <Save className="w-4 h-4 animate-pulse" />
                                Processing...
                            </span>
                        ) : (
                            <span className="flex items-center gap-2">
                                <Globe className="w-4 h-4" />
                                Publish Entry
                            </span>
                        )}
                    </button>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                {/* Main Composer Area */}
                <div className="lg:col-span-8 space-y-12">
                    {/* Primary Details Card */}
                    <div className="bg-white rounded-[2.5rem] border border-neutral-100 p-10 shadow-[0_8px_30px_rgb(0,0,0,0.02)]">
                        <div className="space-y-8">
                            <div>
                                <label className="block text-[11px] font-bold uppercase tracking-[0.2em] text-neutral-400 mb-3">
                                    Publication Title
                                </label>
                                <input
                                    type="text"
                                    value={formData.title}
                                    onChange={(e) => handleTitleChange(e.target.value)}
                                    required
                                    className="w-full text-3xl font-bold font-serif bg-transparent border-b-2 border-neutral-50 focus:border-primary-500 transition-all py-2 placeholder:text-neutral-200 focus:outline-none"
                                    placeholder="Enter a compelling title..."
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div>
                                    <label className="block text-[11px] font-bold uppercase tracking-[0.2em] text-neutral-400 mb-3">
                                        Slug Alignment
                                    </label>
                                    <div className="flex items-center px-4 py-3 bg-neutral-50 rounded-xl border border-neutral-100 group focus-within:border-primary-200">
                                        <span className="text-neutral-400 text-sm font-mono mr-1">/blog/</span>
                                        <input
                                            type="text"
                                            value={formData.slug}
                                            onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                                            required
                                            className="bg-transparent text-neutral-900 font-mono text-sm focus:outline-none flex-1"
                                            placeholder="url-path"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-[11px] font-bold uppercase tracking-[0.2em] text-neutral-400 mb-3">
                                        Visual Identifier (Image URL)
                                    </label>
                                    <div className="flex items-center px-4 py-3 bg-neutral-50 rounded-xl border border-neutral-100 focus-within:border-primary-200">
                                        <ImageIcon className="w-4 h-4 text-neutral-400 mr-3" />
                                        <input
                                            type="url"
                                            value={formData.featured_image}
                                            onChange={(e) => setFormData({ ...formData, featured_image: e.target.value })}
                                            className="bg-transparent text-neutral-900 text-sm flex-1 focus:outline-none"
                                            placeholder="https://images.unsplash.com/..."
                                        />
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-[11px] font-bold uppercase tracking-[0.2em] text-neutral-400 mb-3">
                                    Editorial Abstract (Excerpt)
                                </label>
                                <textarea
                                    value={formData.excerpt}
                                    onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                                    rows={3}
                                    className="w-full px-5 py-4 bg-neutral-50 rounded-2xl border border-neutral-100 focus:border-primary-200 focus:outline-none transition-all placeholder:text-neutral-300 italic"
                                    placeholder="Briefly describe the essence of this report..."
                                />
                            </div>
                        </div>
                    </div>

                    {/* Editor Module */}
                    <div className="space-y-6">
                        <div className="flex items-center justify-between px-4">
                            <label className="block text-[11px] font-bold uppercase tracking-[0.2em] text-neutral-400">
                                Manuscript Content (Markdown)
                            </label>
                        </div>
                        <MarkdownEditor
                            value={formData.content}
                            onChange={(content) => setFormData({ ...formData, content })}
                        />
                    </div>
                </div>

                {/* Sidebar Controls Area */}
                <div className="lg:col-span-4 space-y-8">
                    {/* Publishing Status */}
                    <div className="bg-white rounded-[2rem] border border-neutral-100 p-8 shadow-sm">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-primary-50 rounded-lg text-primary-600">
                                <Globe className="w-4 h-4" />
                            </div>
                            <h3 className="font-bold text-neutral-900 tracking-tight">Status & Visibility</h3>
                        </div>
                        <div className="space-y-4">
                            <label className="flex items-center justify-between p-4 bg-neutral-50 hover:bg-neutral-100/50 rounded-2xl cursor-pointer transition-colors group">
                                <span className="text-sm font-bold text-neutral-600 group-hover:text-neutral-900 transition-colors">Immediate Publication</span>
                                <div className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={formData.published}
                                        onChange={(e) => setFormData({ ...formData, published: e.target.checked })}
                                        className="sr-only peer"
                                    />
                                    <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-100 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                                </div>
                            </label>

                            <label className="flex items-center justify-between p-4 bg-neutral-50 hover:bg-neutral-100/50 rounded-2xl cursor-pointer transition-colors group">
                                <span className="text-sm font-bold text-neutral-600 group-hover:text-neutral-900 transition-colors">Homepage Spotlight</span>
                                <div className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={formData.featured}
                                        onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                                        className="sr-only peer"
                                    />
                                    <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-100 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                                </div>
                            </label>
                        </div>
                    </div>

                    {/* Taxonomy Selection */}
                    <div className="bg-white rounded-[2rem] border border-neutral-100 p-8 shadow-sm">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-neutral-50 rounded-lg text-neutral-600">
                                <Settings className="w-4 h-4" />
                            </div>
                            <h3 className="font-bold text-neutral-900 tracking-tight">Classification</h3>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {categories.map((category) => {
                                const isSelected = formData.selectedCategories.includes(category.id);
                                return (
                                    <button
                                        key={category.id}
                                        type="button"
                                        onClick={() => handleCategoryToggle(category.id)}
                                        className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${isSelected
                                            ? 'bg-primary-600 text-white shadow-md shadow-primary-100'
                                            : 'bg-neutral-50 text-neutral-500 hover:bg-neutral-100'
                                            }`}
                                    >
                                        {category.name}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Metadata Engineering */}
                    <div className="bg-white rounded-[2rem] border border-neutral-100 p-8 shadow-sm">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-neutral-50 rounded-lg text-neutral-600">
                                <Eye className="w-4 h-4" />
                            </div>
                            <h3 className="font-bold text-neutral-900 tracking-tight">Search Logistics (SEO)</h3>
                        </div>
                        <div className="space-y-6">
                            <div>
                                <label className="block text-[10px] font-bold uppercase tracking-widest text-neutral-400 mb-2">
                                    Strategic Title
                                </label>
                                <input
                                    type="text"
                                    value={formData.meta_title}
                                    onChange={(e) => setFormData({ ...formData, meta_title: e.target.value })}
                                    className="w-full px-4 py-3 bg-neutral-50 rounded-xl border border-neutral-100 text-sm focus:outline-none focus:border-primary-200"
                                    placeholder="Search engine optimized title..."
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold uppercase tracking-widest text-neutral-400 mb-2">
                                    Indexing Description
                                </label>
                                <textarea
                                    value={formData.meta_description}
                                    onChange={(e) => setFormData({ ...formData, meta_description: e.target.value })}
                                    rows={4}
                                    className="w-full px-4 py-3 bg-neutral-50 rounded-xl border border-neutral-100 text-sm focus:outline-none focus:border-primary-200"
                                    placeholder="Optimized snippet for search results..."
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
}
