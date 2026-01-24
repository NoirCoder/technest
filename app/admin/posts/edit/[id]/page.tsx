'use client';

import { supabase, Category } from '@/lib/supabase';
import { slugify } from '@/lib/slugify';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import MarkdownEditor from '@/components/admin/MarkdownEditor';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import Link from 'next/link';

interface EditPostPageProps {
    params: Promise<{ id: string }>;
}

export default function EditPostPage({ params }: EditPostPageProps) {
    const router = useRouter();
    const [postId, setPostId] = useState<string | null>(null);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
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
        const fetchCategories = async () => {
            const { data } = await supabase
                .from('categories')
                .select('*')
                .order('name');

            if (data) {
                setCategories(data);
            }
        };

        const fetchPost = async (id: string) => {
            const { data: post, error } = await supabase
                .from('posts')
                .select(`
            *,
            post_categories(category_id)
          `)
                .eq('id', id)
                .single();

            if (error || !post) {
                router.push('/admin/posts');
                return;
            }

            // Fix implicit any on post categories map
            const postCats = post.post_categories as unknown as { category_id: string }[] | null;

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
                selectedCategories: postCats?.map(pc => pc.category_id) || [],
            });

            setLoading(false);
        };

        params.then(p => {
            setPostId(p.id);
            fetchCategories();
            fetchPost(p.id);
        });
    }, [params, router]);

    const handleTitleChange = (title: string) => {
        setFormData({
            ...formData,
            title,
            slug: slugify(title),
        });
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
        if (!postId) return;

        setSaving(true);

        try {
            // Update post
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
                })
                .eq('id', postId);

            if (postError) throw postError;

            // Update categories - delete old ones and insert new ones
            await supabase.from('post_categories').delete().eq('post_id', postId);

            if (formData.selectedCategories.length > 0) {
                const categoryLinks = formData.selectedCategories.map(categoryId => ({
                    post_id: postId,
                    category_id: categoryId,
                }));

                const { error: categoryError } = await supabase
                    .from('post_categories')
                    .insert(categoryLinks);

                if (categoryError) throw categoryError;
            }

            router.push('/admin/posts');
        } catch (error: unknown) {
            alert('Error updating post: ' + (error instanceof Error ? error.message : 'Unknown error'));
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
            </div>
        );
    }

    return (
        <div>
            <div className="mb-8">
                <Link
                    href="/admin/posts"
                    className="inline-flex items-center text-neutral-600 hover:text-neutral-900 mb-4"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Posts
                </Link>
                <h1 className="text-3xl font-bold font-serif text-neutral-900">Edit Post</h1>
            </div>

            <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Title */}
                        <div className="card p-6">
                            <label className="block text-sm font-medium text-neutral-700 mb-2">
                                Title *
                            </label>
                            <input
                                type="text"
                                value={formData.title}
                                onChange={(e) => handleTitleChange(e.target.value)}
                                required
                                className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-lg"
                            />
                        </div>

                        {/* Slug */}
                        <div className="card p-6">
                            <label className="block text-sm font-medium text-neutral-700 mb-2">
                                URL Slug *
                            </label>
                            <input
                                type="text"
                                value={formData.slug}
                                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                                required
                                className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent font-mono text-sm"
                            />
                        </div>

                        {/* Excerpt */}
                        <div className="card p-6">
                            <label className="block text-sm font-medium text-neutral-700 mb-2">
                                Excerpt
                            </label>
                            <textarea
                                value={formData.excerpt}
                                onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                                rows={3}
                                className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            />
                        </div>

                        {/* Content */}
                        <div className="card p-6">
                            <label className="block text-sm font-medium text-neutral-700 mb-4">
                                Content * (Markdown)
                            </label>
                            <MarkdownEditor
                                value={formData.content}
                                onChange={(content) => setFormData({ ...formData, content })}
                            />
                        </div>
                    </div>

                    {/* Sidebar - Same as new post */}
                    <div className="space-y-6">
                        <div className="card p-6">
                            <h3 className="font-semibold text-neutral-900 mb-4">Publish</h3>
                            <div className="space-y-3">
                                <label className="flex items-center gap-3 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={formData.published}
                                        onChange={(e) => setFormData({ ...formData, published: e.target.checked })}
                                        className="w-4 h-4 text-primary-600 rounded"
                                    />
                                    <span className="text-sm text-neutral-700">Published</span>
                                </label>
                                <label className="flex items-center gap-3 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={formData.featured}
                                        onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                                        className="w-4 h-4 text-primary-600 rounded"
                                    />
                                    <span className="text-sm text-neutral-700">Featured on Homepage</span>
                                </label>
                            </div>
                            <button
                                type="submit"
                                disabled={saving}
                                className="w-full btn-primary mt-4 disabled:opacity-50"
                            >
                                <Save className="w-4 h-4 mr-2" />
                                {saving ? 'Saving...' : 'Update Post'}
                            </button>
                        </div>

                        <div className="card p-6">
                            <h3 className="font-semibold text-neutral-900 mb-4">Categories</h3>
                            <div className="space-y-2">
                                {categories.map((category) => (
                                    <label key={category.id} className="flex items-center gap-3 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={formData.selectedCategories.includes(category.id)}
                                            onChange={() => handleCategoryToggle(category.id)}
                                            className="w-4 h-4 text-primary-600 rounded"
                                        />
                                        <span className="text-sm text-neutral-700">{category.name}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div className="card p-6">
                            <label className="block text-sm font-medium text-neutral-700 mb-2">
                                Featured Image URL
                            </label>
                            <input
                                type="url"
                                value={formData.featured_image}
                                onChange={(e) => setFormData({ ...formData, featured_image: e.target.value })}
                                className="w-full px-4 py-2 border border-neutral-300 rounded-lg text-sm"
                            />
                        </div>

                        <div className="card p-6">
                            <h3 className="font-semibold text-neutral-900 mb-4">SEO</h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                                        Meta Title
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.meta_title}
                                        onChange={(e) => setFormData({ ...formData, meta_title: e.target.value })}
                                        className="w-full px-4 py-2 border border-neutral-300 rounded-lg text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                                        Meta Description
                                    </label>
                                    <textarea
                                        value={formData.meta_description}
                                        onChange={(e) => setFormData({ ...formData, meta_description: e.target.value })}
                                        rows={3}
                                        className="w-full px-4 py-2 border border-neutral-300 rounded-lg text-sm"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
}
