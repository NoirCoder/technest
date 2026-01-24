import { supabase } from '@/lib/supabase';
import { DEMO_CATEGORIES, DEMO_POSTS } from '@/lib/demo-data';
import PostCard from '@/components/PostCard';
import { notFound } from 'next/navigation';
import { generateMetadata as generateSEOMetadata } from '@/lib/seo';
import { Metadata } from 'next';

export const revalidate = 3600; // Revalidate every hour

interface CategoryPageProps {
    params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
    const { data: categories } = await supabase
        .from('categories')
        .select('slug');

    // Fallback if no specific categories in DB
    if (!categories || categories.length === 0) {
        return DEMO_CATEGORIES.map(category => ({
            slug: category.slug
        }));
    }

    return categories?.map((category) => ({
        slug: category.slug,
    })) || [];
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
    const { slug } = await params;

    // Try DB first
    let { data: category } = await supabase
        .from('categories')
        .select('*')
        .eq('slug', slug)
        .single();

    // Fallback to demo data
    if (!category) {
        category = DEMO_CATEGORIES.find(c => c.slug === slug) || null;
    }

    if (!category) {
        return {};
    }

    return generateSEOMetadata({
        title: category.name,
        description: category.description || `Browse all ${category.name} reviews and recommendations`,
    });
}

export default async function CategoryPage({ params }: CategoryPageProps) {
    const { slug } = await params;

    // 1. Try to fetch category from DB
    let { data: category, error: categoryError } = await supabase
        .from('categories')
        .select('*')
        .eq('slug', slug)
        .single();

    // 2. Fallback to demo category
    if (!category) {
        category = DEMO_CATEGORIES.find(c => c.slug === slug) || null;
    }

    if (!category) {
        notFound();
    }

    // 3. Try to fetch posts from DB
    let postsWithCategories: any[] = [];

    const { data: postCategories } = await supabase
        .from('post_categories')
        .select(`
      post:posts(*)
    `)
        .eq('category_id', category.id);

    if (postCategories && postCategories.length > 0) {
        const postIds = postCategories.map((pc: any) => pc.post.id).filter(Boolean);
        const { data: posts } = await supabase
            .from('posts')
            .select(`
        *,
        categories:post_categories(category:categories(*))
      `)
            .in('id', postIds)
            .eq('published', true)
            .order('published_at', { ascending: false });

        if (posts) {
            postsWithCategories = posts.map(post => ({
                ...post,
                categories: post.categories?.map((pc: any) => pc.category) || [],
            }));
        }
    }

    // 4. Fallback to demo posts if no DB posts found
    if (postsWithCategories.length === 0) {
        postsWithCategories = DEMO_POSTS.filter(post =>
            post.categories.some(c => c.slug === slug)
        );
    }

    return (
        <div className="py-12 md:py-16">
            <div className="container-custom">
                {/* Header */}
                <div className="mb-12">
                    <h1 className="text-4xl md:text-5xl font-bold font-serif text-neutral-900 mb-4">
                        {category.name}
                    </h1>
                    {category.description && (
                        <p className="text-lg text-neutral-600 max-w-3xl">{category.description}</p>
                    )}
                </div>

                {/* Posts Grid */}
                {postsWithCategories.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {postsWithCategories.map((post) => (
                            <PostCard key={post.id} post={post} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <p className="text-neutral-500 text-lg">
                            No posts in this category yet. Check back soon!
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
