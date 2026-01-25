'use client';

import { supabase, Category } from '@/lib/supabase';
import { slugify } from '@/lib/slugify';
import { useState, useEffect, useRef } from 'react';
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
    Loader2,
    Zap,
    Sparkles
} from 'lucide-react';
import Link from 'next/link';
import { uploadImage } from '@/lib/storage';
import { revalidateBlog } from '@/lib/revalidate';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export default function NewPostPage() {
    const router = useRouter();
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(false);
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
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        const { data } = await supabase.from('categories').select('*').order('name');
        if (data) setCategories(data);
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
                await supabase.from('post_categories').insert(categoryLinks);
            }

            // Sync with production cache
            await revalidateBlog(formData.slug);

            router.push('/admin/posts');
        } catch (error) {
            alert('Error creating publication.');
        } finally {
            setLoading(false);
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

    return (
        <div className="space-y-16">
            {/* Studio Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-12 border-b-[4px] border-neutral-900 pb-16">
                <div className="space-y-6">
                    <Link
                        href="/admin/posts"
                        className="inline-flex items-center text-[11px] font-black uppercase tracking-[0.4em] text-neutral-400 hover:text-neutral-900 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4 mr-3 text-neutral-900" />
                        Library Index
                    </Link>
                    <h1 className="text-6xl font-black tracking-tighter text-neutral-900 uppercase leading-none">Initialize Archive</h1>
                </div>

                <div className="flex flex-wrap items-center gap-6">
                    <button
                        onClick={() => router.push('/admin/posts')}
                        className="brutalist-button h-16 px-10 bg-white"
                    >
                        ABORT MISSION
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="brutalist-button-primary h-16 px-12"
                    >
                        {loading ? <Loader2 className="w-5 h-5 animate-spin mr-3" /> : <Globe className="w-5 h-5 mr-3" />}
                        DEPLOYY TO CORE
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
                <div className="lg:col-span-8 space-y-16">
                    {/* Primary Details */}
                    <div className="brutalist-card bg-white p-12 border-neutral-900 space-y-12">
                        <div className="space-y-4">
                            <label className="text-[10px] font-black uppercase tracking-[0.3em] text-neutral-400">Editorial Intel Title</label>
                            <input
                                type="text"
                                value={formData.title}
                                onChange={(e) => {
                                    const title = e.target.value;
                                    handleUpdate({ title, slug: slugify(title) });
                                }}
                                className="w-full text-5xl font-black bg-transparent border-none outline-none focus:ring-0 placeholder:text-neutral-100 text-neutral-900 leading-none uppercase tracking-tighter"
                                placeholder="INTEL HEADLINE..."
                            />
                        </div>

                        <div className="space-y-6">
                            <label className="text-[10px] font-black uppercase tracking-[0.3em] text-neutral-400">Visual Identity Protocol (Hero)</label>
                            <div className="group relative aspect-[21/9] overflow-hidden border-[3px] border-neutral-900 bg-neutral-50 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                                {formData.featured_image ? (
                                    <>
                                        <Image src={formData.featured_image} alt="Hero" fill className="object-cover" />
                                        <div className="absolute inset-0 bg-neutral-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                                            <button
                                                onClick={() => heroInputRef.current?.click()}
                                                className="brutalist-button bg-white text-neutral-900 h-12 px-8"
                                            >
                                                RE-SYNC ASSET
                                            </button>
                                        </div>
                                    </>
                                ) : (
                                    <button
                                        onClick={() => heroInputRef.current?.click()}
                                        disabled={isUploadingHero}
                                        className="absolute inset-0 flex flex-col items-center justify-center gap-6 text-neutral-900 hover:bg-neutral-100 transition-all"
                                    >
                                        {isUploadingHero ? <Loader2 className="w-10 h-10 animate-spin" /> : (
                                            <>
                                                <div className="w-16 h-16 bg-white border-[2.5px] border-neutral-900 flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                                                    <ImageIcon className="w-8 h-8" />
                                                </div>
                                                <span className="text-[11px] font-black uppercase tracking-[0.4em]">Initialize Hero Asset</span>
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

                        <div className="space-y-4 pt-4">
                            <label className="text-[10px] font-black uppercase tracking-[0.3em] text-neutral-400">Tactical Abstract (Excerpt)</label>
                            <textarea
                                value={formData.excerpt}
                                onChange={(e) => handleUpdate({ excerpt: e.target.value })}
                                rows={2}
                                className="w-full bg-transparent border-none outline-none focus:ring-0 text-neutral-600 font-bold italic placeholder:text-neutral-200 resize-none leading-relaxed text-xl"
                                placeholder="BRIEF INTEL SUMMARY..."
                            />
                        </div>
                    </div>

                    {/* Studio Editor Integration */}
                    <div className="space-y-6">
                        <div className="flex items-center justify-between px-6 border-b-[3px] border-neutral-900 pb-6">
                            <h3 className="text-3xl font-black text-neutral-900 uppercase tracking-tighter">Manuscript Editor</h3>
                            <div className="flex items-center gap-3">
                                <Sparkles className="w-4 h-4 text-primary-400" />
                                <span className="text-[10px] font-black text-neutral-400 uppercase tracking-[0.3em]">STUDIO 2.0 ACTIVE</span>
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

                <div className="lg:col-span-4 space-y-16">
                    {/* Publishing Status */}
                    <div className="brutalist-card p-10 bg-white border-neutral-900 space-y-10">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-neutral-900 text-white shadow-[3px_3px_0px_0px_rgba(0,0,0,0.1)]">
                                <Globe className="w-5 h-5 text-primary-400" />
                            </div>
                            <h3 className="text-xl font-black text-neutral-900 uppercase tracking-tighter">Deployment</h3>
                        </div>

                        <div className="space-y-6">
                            <label className="flex items-center justify-between p-6 bg-neutral-50 border-[2px] border-neutral-900 cursor-pointer shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all">
                                <div>
                                    <span className="text-[11px] font-black uppercase tracking-widest text-neutral-900">Live Release</span>
                                    <p className="text-[9px] font-black text-neutral-400 uppercase tracking-widest mt-1">Publicly Accessible</p>
                                </div>
                                <div className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={formData.published}
                                        onChange={(e) => handleUpdate({ published: e.target.checked })}
                                        className="sr-only peer"
                                    />
                                    <div className="w-12 h-7 bg-neutral-100 border-[2px] border-neutral-900 peer-focus:outline-none peer-checked:bg-neutral-900 transition-colors after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-neutral-900 after:border-[2px] after:border-neutral-900 after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-5 peer-checked:after:bg-white peer-checked:after:border-white"></div>
                                </div>
                            </label>

                            <label className="flex items-center justify-between p-6 bg-neutral-50 border-[2px] border-neutral-900 cursor-pointer shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all">
                                <div>
                                    <span className="text-[11px] font-black uppercase tracking-widest text-neutral-900">Spotlight</span>
                                    <p className="text-[9px] font-black text-neutral-400 uppercase tracking-widest mt-1">Featured Section</p>
                                </div>
                                <div className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={formData.featured}
                                        onChange={(e) => handleUpdate({ featured: e.target.checked })}
                                        className="sr-only peer"
                                    />
                                    <div className="w-12 h-7 bg-neutral-100 border-[2px] border-neutral-900 peer-focus:outline-none peer-checked:bg-primary-400 transition-colors after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-neutral-900 after:border-[2px] after:border-neutral-900 after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-5 peer-checked:after:bg-neutral-900 peer-checked:after:border-neutral-900"></div>
                                </div>
                            </label>
                        </div>
                    </div>

                    {/* Taxonomy Selection */}
                    <div className="brutalist-card p-10 bg-white border-neutral-900 space-y-8">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-neutral-100 border-[2px] border-neutral-900 text-neutral-900 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
                                <Zap className="w-5 h-5" />
                            </div>
                            <h3 className="text-xl font-black text-neutral-900 uppercase tracking-tighter">Classification</h3>
                        </div>

                        <div className="flex flex-wrap gap-3">
                            {categories.map((category) => {
                                const isSelected = formData.selectedCategories.includes(category.id);
                                return (
                                    <button
                                        key={category.id}
                                        type="button"
                                        onClick={() => handleCategoryToggle(category.id)}
                                        className={cn(
                                            "px-4 py-2 border-[2px] text-[10px] font-black uppercase tracking-widest transition-all shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[1.5px] hover:translate-y-[1.5px]",
                                            isSelected
                                                ? 'bg-neutral-900 text-white border-neutral-900'
                                                : 'bg-white text-neutral-400 border-neutral-200 hover:border-neutral-900 hover:text-neutral-900'
                                        )}
                                    >
                                        {category.name}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* SEO Sidebar Integration */}
                    <SEOSidebar formData={formData} onChange={handleUpdate} />
                </div>
            </div>
        </div>
    );
}
