'use client';

import { supabase, Category } from '@/lib/supabase';
import { slugify } from '@/lib/slugify';
import { useState, useEffect, use, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import MarkdownEditor from '@/components/admin/MarkdownEditor';
import SEOSidebar from '@/components/admin/SEOSidebar';
import {
    ArrowLeft,
    Save,
    Globe,
    Eye,
    Settings,
    Image as ImageIcon,
    Trash2,
    Loader2,
    Zap,
    History,
    ChevronRight,
    Sparkles
} from 'lucide-react';
import Link from 'next/link';
import { uploadImage } from '@/lib/storage';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface EditPostPageProps {
    params: Promise<{ id: string }>;
}

export default function EditPostPage({ params }: EditPostPageProps) {
    const { id } = use(params);
    const router = useRouter();
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [studioMode, setStudioMode] = useState(false);
    const [isUploadingHero, setIsUploadingHero] = useState(false);
    const heroInputRef = useRef<HTMLInputElement>(null);

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
        fetchData();
    }, [id]);

    const fetchData = async () => {
        try {
            const { data: categoriesData } = await supabase.from('categories').select('*').order('name');
            if (categoriesData) setCategories(categoriesData);

            const { data: post, error } = await supabase
                .from('posts')
                .select(`*, categories:post_categories(category_id)`)
                .eq('id', id)
                .single();

            if (error) throw error;

            if (post) {
                setFormData({
                    title: post.title,
                    slug: post.slug,
                    excerpt: post.excerpt || '',
                    content: post.content,
                    featured_image: post.featured_image || '',
                    meta_title: post.meta_title || '',
                    meta_description: post.meta_description || '',
                    published: post.published,
                    featured: post.featured,
                    selectedCategories: post.categories.map((c: any) => c.category_id),
                });
            }
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdate = (updates: Partial<typeof formData>) => {
        setFormData(prev => ({ ...prev, ...updates }));
    };

    const handleHeroUpload = async (file: File) => {
        setIsUploadingHero(true);
        try {
            const url = await uploadImage(file);
            setFormData(prev => ({ ...prev, featured_image: url }));
        } catch (error: any) {
            console.error('Hero upload error:', error);
            alert(`Hero image upload failed: ${error.message || 'Unknown error'}`);
        } finally {
            setIsUploadingHero(false);
        }
    };

    const handleSubmit = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        setSaving(true);

        try {
            const { error: postError } = await supabase
                .from('posts')
                .update({
                    title: formData.title,
                    slug: formData.slug,
                    excerpt: formData.excerpt || null,
                    content: formData.content,
                    featured_image: formData.featured_image || null,
                    meta_title: formData.meta_title || formData.title,
                    meta_description: formData.meta_description || formData.excerpt || null,
                    published: formData.published,
                    featured: formData.featured,
                    published_at: formData.published ? new Date().toISOString() : null,
                    updated_at: new Date().toISOString(),
                })
                .eq('id', id);

            if (postError) throw postError;

            await supabase.from('post_categories').delete().eq('post_id', id);

            if (formData.selectedCategories.length > 0) {
                const categoryLinks = formData.selectedCategories.map(categoryId => ({
                    post_id: id,
                    category_id: categoryId,
                }));
                await supabase.from('post_categories').insert(categoryLinks);
            }

            if (!e) return; // Silent save
            router.push('/admin/posts');
            router.refresh();
        } catch (error) {
            alert('Error updating publication.');
        } finally {
            setSaving(false);
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

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-[50vh] space-y-4">
                <Loader2 className="w-8 h-8 animate-spin text-neutral-200" />
                <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest animate-pulse">Retrieving Manuscript...</p>
            </div>
        );
    }

    return (
        <div className="space-y-12">
            {/* Studio Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 border-b border-neutral-100 pb-10">
                <div className="space-y-3">
                    <Link
                        href="/admin/posts"
                        className="inline-flex items-center text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-400 hover:text-neutral-900 transition-colors"
                    >
                        <ArrowLeft className="w-3 h-3 mr-2" />
                        Library Index
                    </Link>
                    <div className="flex items-center gap-4">
                        <h1 className="text-4xl font-bold tracking-tight text-neutral-900">Revise Publication</h1>
                        <div className={cn(
                            "px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest border",
                            formData.published ? "bg-green-50 text-green-700 border-green-100" : "bg-neutral-50 text-neutral-400 border-neutral-100"
                        )}>
                            {formData.published ? 'Stable' : 'Draft Mode'}
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button className="p-3 rounded-xl border border-neutral-100 text-neutral-400 hover:text-red-600 hover:bg-red-50 transition-all">
                        <Trash2 className="w-5 h-5" />
                    </button>
                    <div className="w-px h-6 bg-neutral-100 mx-1" />
                    <button
                        onClick={() => handleSubmit()}
                        disabled={saving}
                        className="h-12 px-8 rounded-xl bg-[#09090B] text-white hover:bg-neutral-800 font-bold text-sm transition-all flex items-center gap-2 shadow-xl shadow-neutral-100 disabled:opacity-50"
                    >
                        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Globe className="w-4 h-4" />}
                        Commit Changes
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
                {/* Main Manuscript Area */}
                <div className="lg:col-span-8 space-y-10">
                    {/* Primary Identity Card */}
                    <div className="bg-white rounded-[2.5rem] border border-neutral-100 p-10 shadow-sm space-y-10 focus-within:ring-4 focus-within:ring-neutral-50 transition-all">
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-400">Editorial Title</label>
                            <input
                                type="text"
                                value={formData.title}
                                onChange={(e) => {
                                    const title = e.target.value;
                                    handleUpdate({ title, slug: slugify(title) });
                                }}
                                className="w-full text-4xl font-bold font-serif bg-transparent border-none outline-none focus:ring-0 placeholder:text-neutral-100 text-neutral-900 leading-tight"
                                placeholder="The story starts here..."
                            />
                        </div>

                        <div className="space-y-4">
                            <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-400">Main Visual (Hero)</label>
                            <div className="group relative aspect-[21/9] rounded-[2rem] overflow-hidden border border-neutral-100 bg-neutral-50">
                                {formData.featured_image ? (
                                    <>
                                        <Image src={formData.featured_image} alt="Hero" fill className="object-cover" />
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                            <button
                                                onClick={() => heroInputRef.current?.click()}
                                                className="px-6 py-2.5 bg-white rounded-full text-xs font-bold text-neutral-900 shadow-xl scale-90 group-hover:scale-100 transition-all"
                                            >
                                                Switch Image
                                            </button>
                                        </div>
                                    </>
                                ) : (
                                    <button
                                        onClick={() => heroInputRef.current?.click()}
                                        disabled={isUploadingHero}
                                        className="absolute inset-0 flex flex-col items-center justify-center gap-4 text-neutral-400 hover:text-neutral-900 transition-colors"
                                    >
                                        {isUploadingHero ? <Loader2 className="w-8 h-8 animate-spin" /> : (
                                            <>
                                                <div className="w-12 h-12 rounded-2xl bg-white border border-neutral-100 flex items-center justify-center shadow-soft">
                                                    <ImageIcon className="w-6 h-6" />
                                                </div>
                                                <span className="text-xs font-bold uppercase tracking-widest">Select Hero Asset</span>
                                            </>
                                        )}
                                    </button>
                                )}
                                <input
                                    type="file"
                                    ref={heroInputRef}
                                    className="hidden"
                                    accept="image/*"
                                    onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) handleHeroUpload(file);
                                    }}
                                />
                            </div>
                        </div>

                        <div className="space-y-2 pt-4">
                            <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-400">Structural Abstract</label>
                            <textarea
                                value={formData.excerpt}
                                onChange={(e) => handleUpdate({ excerpt: e.target.value })}
                                rows={2}
                                className="w-full bg-transparent border-none outline-none focus:ring-0 text-neutral-600 font-medium italic placeholder:text-neutral-200 resize-none leading-relaxed"
                                placeholder="..."
                            />
                        </div>
                    </div>

                    {/* Studio Editor Integration */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between px-4">
                            <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-400">Publication Manuscript</h3>
                            <div className="flex items-center gap-2 text-[10px] font-bold text-neutral-300">
                                <Sparkles className="w-3 h-3" />
                                2026 Studio Active
                            </div>
                        </div>
                        <MarkdownEditor
                            value={formData.content}
                            onChange={(content) => handleUpdate({ content })}
                            studioMode={studioMode}
                            onToggleStudio={() => setStudioMode(!studioMode)}
                        />
                    </div>
                </div>

                {/* Growth & Sidebar Controls */}
                <div className="lg:col-span-4 space-y-10">
                    {/* Publishing Status */}
                    <div className="bg-white rounded-[2rem] border border-neutral-100 p-8 shadow-sm space-y-8">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-neutral-900 rounded-lg text-white">
                                <Globe className="w-4 h-4" />
                            </div>
                            <h3 className="font-bold text-neutral-900 tracking-tight text-sm">Deployment</h3>
                        </div>

                        <div className="space-y-4">
                            <label className="flex items-center justify-between p-4 bg-neutral-50 hover:bg-neutral-100 transition-all rounded-2xl cursor-pointer group border border-transparent hover:border-neutral-100">
                                <div className="space-y-0.5">
                                    <span className="text-xs font-bold text-neutral-900">Live Release</span>
                                    <p className="text-[9px] font-medium text-neutral-400 uppercase tracking-widest">Publicly Accessible</p>
                                </div>
                                <div className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={formData.published}
                                        onChange={(e) => handleUpdate({ published: e.target.checked })}
                                        className="sr-only peer"
                                    />
                                    <div className="w-10 h-6 bg-neutral-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#09090B]"></div>
                                </div>
                            </label>

                            <label className="flex items-center justify-between p-4 bg-neutral-50 hover:bg-neutral-100 transition-all rounded-2xl cursor-pointer group border border-transparent hover:border-neutral-100">
                                <div className="space-y-0.5">
                                    <span className="text-xs font-bold text-neutral-900">Feature Lock</span>
                                    <p className="text-[9px] font-medium text-neutral-400 uppercase tracking-widest">Homepage Spotlight</p>
                                </div>
                                <div className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={formData.featured}
                                        onChange={(e) => handleUpdate({ featured: e.target.checked })}
                                        className="sr-only peer"
                                    />
                                    <div className="w-10 h-6 bg-neutral-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                                </div>
                            </label>
                        </div>
                    </div>

                    {/* Taxonomy Archive */}
                    <div className="bg-white rounded-[2rem] border border-neutral-100 p-8 shadow-sm space-y-6">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-neutral-50 rounded-lg text-neutral-900 border border-neutral-100">
                                <Zap className="w-4 h-4" />
                            </div>
                            <h3 className="font-bold text-neutral-900 tracking-tight text-sm">Classification</h3>
                        </div>

                        <div className="flex flex-wrap gap-2">
                            {categories.map((category) => {
                                const isSelected = formData.selectedCategories.includes(category.id);
                                return (
                                    <button
                                        key={category.id}
                                        type="button"
                                        onClick={() => handleCategoryToggle(category.id)}
                                        className={cn(
                                            "px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all border shadow-sm",
                                            isSelected
                                                ? 'bg-[#09090B] text-white border-[#09090B] shadow-neutral-200'
                                                : 'bg-white text-neutral-400 border-neutral-100 hover:border-neutral-200'
                                        )}
                                    >
                                        {category.name}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* SEO Real-time Intelligence */}
                    <SEOSidebar formData={formData} onChange={handleUpdate} />
                </div>
            </div>
        </div>
    );
}
