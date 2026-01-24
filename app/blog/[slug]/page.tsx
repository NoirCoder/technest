import { supabase } from '@/lib/supabase';
import { DEMO_POSTS } from '@/lib/demo-data'; // Import demo data
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { generateMetadata as generateSEOMetadata, generateArticleSchema, siteConfig } from '@/lib/seo';
import { estimateReadTime, formatDate, extractHeadings } from '@/lib/markdown';
import TableOfContents from '@/components/TableOfContents';
import PostCard from '@/components/PostCard';
import ReviewOverview from '@/components/ReviewOverview';
import ReadingProgress from '@/components/ReadingProgress';
import Breadcrumbs from '@/components/Breadcrumbs';
import ShareButtons from '@/components/ShareButtons';
import { Clock, Calendar } from 'lucide-react';
import { Metadata } from 'next';

export const revalidate = 3600; // Revalidate every hour

interface BlogPostPageProps {
    params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
    const { data: posts } = await supabase
        .from('posts')
        .select('slug')
        .eq('published', true);

    // Fallback for demo
    if (!posts || posts.length === 0) {
        return DEMO_POSTS.map(post => ({ slug: post.slug }));
    }

    return posts?.map((post) => ({
        slug: post.slug,
    })) || [];
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
    const { slug } = await params;

    // Try DB
    let { data: post } = await supabase
        .from('posts')
        .select('*')
        .eq('slug', slug)
        .eq('published', true)
        .single();

    // Fallback
    if (!post) {
        post = DEMO_POSTS.find(p => p.slug === slug) as any || null;
    }

    if (!post) {
        return {};
    }

    return generateSEOMetadata({
        title: post.meta_title || post.title,
        description: post.meta_description || post.excerpt || '',
        image: post.featured_image || undefined,
        url: `${siteConfig.url}/blog/${post.slug}`,
    });
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
    const { slug } = await params;

    // 1. Try DB
    let { data: post, error } = await supabase
        .from('posts')
        .select(`
      *,
      categories:post_categories(category:categories(*))
    `)
        .eq('slug', slug)
        .eq('published', true)
        .single();

    // 2. Fallback to demo
    if (!post) {
        post = DEMO_POSTS.find(p => p.slug === slug) as any || null;
    }

    if (!post) {
        notFound();
    }

    const categories = post.categories?.map((c: any) => c.category || c).filter((c: any) => c && c.name) || [];
    const readTime = estimateReadTime(post.content);
    const headings = extractHeadings(post.content);

    // Fetch related posts (same category)
    let relatedPosts: any[] = [];
    if (categories.length > 0) {
        // Try DB for related
        const { data: relatedPostCategories } = await supabase
            .from('post_categories')
            .select('post_id')
            .eq('category_id', categories[0].id)
            .neq('post_id', post.id)
            .limit(3);

        if (relatedPostCategories && relatedPostCategories.length > 0) {
            const postIds = relatedPostCategories.map(pc => pc.post_id);
            const { data } = await supabase
                .from('posts')
                .select(`
          *,
          categories:post_categories(category:categories(*))
        `)
                .in('id', postIds)
                .eq('published', true)
                .limit(3);

            relatedPosts = data?.map(p => ({
                ...p,
                categories: p.categories?.map((pc: any) => pc.category) || [],
            })) || [];
        }

        // Fallback logic requires checking if relatedPosts is still empty
        if (relatedPosts.length === 0) {
            relatedPosts = DEMO_POSTS
                .filter(p => p.id !== post.id && p.categories.some(c => c.id === categories[0].id))
                .slice(0, 3);
        }
    }

    const articleSchema = generateArticleSchema({
        title: post.title,
        description: post.excerpt || '',
        image: post.featured_image || '',
        datePublished: post.published_at || post.created_at,
        dateModified: post.updated_at,
        url: `${siteConfig.url}/blog/${post.slug}`,
    });

    return (
        <>
            {/* Schema Markup */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
            />

            {/* UX Enhancements */}
            <ReadingProgress />

            <article className="py-8 md:py-12">
                <div className="container-custom">
                    {/* Breadcrumbs for SEO & Navigation */}
                    <div className="max-w-4xl mx-auto mb-6">
                        <Breadcrumbs items={[
                            { label: 'Blog', href: '/blog' },
                            { label: categories[0]?.name || 'Post', href: categories[0] ? `/category/${categories[0].slug}` : '#' },
                            { label: post.title, href: `/blog/${post.slug}` }
                        ]} />
                    </div>

                    {/* Header */}
                    <div className="max-w-4xl mx-auto mb-10 text-center md:text-left">
                        {/* Categories */}
                        {categories.length > 0 && (
                            <div className="flex flex-wrap justify-center md:justify-start gap-2 mb-6">
                                {categories.map((category: any) => (
                                    <Link
                                        key={category.id}
                                        href={`/category/${category.slug}`}
                                        className="inline-block px-4 py-1.5 text-xs font-bold tracking-wide text-primary-700 bg-primary-50 rounded-full hover:bg-primary-100 transition-colors uppercase"
                                    >
                                        {category.name}
                                    </Link>
                                ))}
                            </div>
                        )}

                        {/* Title */}
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold font-serif text-neutral-900 mb-8 text-balance leading-tight">
                            {post.title}
                        </h1>

                        {/* Meta - Enhanced design */}
                        <div className="flex flex-wrap items-center justify-center md:justify-start gap-6 text-neutral-500 text-sm border-b border-neutral-100 pb-8">
                            <div className="flex items-center gap-2">
                                <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold">
                                    TN
                                </div>
                                <div>
                                    <span className="block text-neutral-900 font-semibold">TechNest Editor</span>
                                    <time dateTime={post.published_at || post.created_at}>
                                        Updated {formatDate(post.published_at || post.created_at)}
                                    </time>
                                </div>
                            </div>
                            <div className="h-8 w-px bg-neutral-200 hidden md:block"></div>
                            <div className="flex items-center gap-2">
                                <Clock className="w-5 h-5" />
                                <span>{readTime} min read</span>
                            </div>
                        </div>
                    </div>

                    {/* Featured Image - Wide */}
                    {post.featured_image && (
                        <div className="max-w-5xl mx-auto mb-16">
                            <div className="relative aspect-[21/9] md:aspect-[2/1] rounded-3xl overflow-hidden shadow-2xl ring-1 ring-black/5">
                                <Image
                                    src={post.featured_image}
                                    alt={post.title}
                                    fill
                                    className="object-cover"
                                    priority
                                />
                            </div>
                        </div>
                    )}

                    {/* Main Layout */}
                    <div className="max-w-7xl mx-auto">
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-12">

                            {/* Left Sidebar - Social Share (Sticky) */}
                            <div className="hidden md:block md:col-span-1">
                                <ShareButtons title={post.title} slug={post.slug} />
                            </div>

                            {/* Main Content */}
                            <div className="md:col-span-8">
                                <div className="prose prose-lg prose-neutral max-w-none
                  prose-headings:font-serif prose-headings:font-bold prose-headings:text-neutral-900
                  prose-h1:text-4xl prose-h2:text-3xl prose-h3:text-2xl
                  prose-p:leading-relaxed prose-p:text-neutral-700
                  prose-a:text-primary-600 prose-a:no-underline hover:prose-a:underline hover:prose-a:text-primary-700
                  prose-img:rounded-2xl prose-img:shadow-soft-lg
                  prose-li:text-neutral-700
                  prose-pre:bg-neutral-900 prose-pre:rounded-xl prose-pre:shadow-lg
                  prose-blockquote:border-l-primary-500 prose-blockquote:bg-primary-50/30 prose-blockquote:py-2 prose-blockquote:px-6 prose-blockquote:rounded-r-lg prose-blockquote:not-italic
                ">
                                    <ReactMarkdown
                                        remarkPlugins={[remarkGfm]}
                                        components={{
                                            h1: ({ children, ...props }) => {
                                                const id = String(children).toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-');
                                                return <h1 id={id} {...props}>{children}</h1>;
                                            },
                                            h2: ({ children, ...props }) => {
                                                const id = String(children).toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-');
                                                return <h2 id={id} {...props}>{children}</h2>;
                                            },
                                            h3: ({ children, ...props }) => {
                                                const id = String(children).toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-');
                                                return <h3 id={id} {...props}>{children}</h3>;
                                            },
                                        }}
                                    >
                                        {post.content}
                                    </ReactMarkdown>

                                    {/* Verdict / Review Score (If applicable) */}
                                    {(post as any).review && (
                                        <ReviewOverview
                                            rating={(post as any).review.rating}
                                            pros={(post as any).review.pros}
                                            cons={(post as any).review.cons}
                                            verdict={(post as any).review.verdict}
                                            productName={(post as any).review.productName}
                                        />
                                    )}
                                </div>
                            </div>

                            {/* Sidebar with TOC (Right) */}
                            <div className="hidden lg:block lg:col-span-3">
                                <div className="sticky top-24">
                                    <TableOfContents headings={headings} />

                                    {/* Optional: Add Ad space here */}
                                    <div className="mt-8 p-6 bg-neutral-50 rounded-xl text-center text-sm text-neutral-400 border border-neutral-100">
                                        <p>Ad Space</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </article>

            {/* Related Posts */}
            {relatedPosts.length > 0 && (
                <section className="py-16 bg-neutral-50/50">
                    <div className="container-custom">
                        <h2 className="text-3xl font-bold font-serif text-neutral-900 mb-8">Related Reviews</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {relatedPosts.map((relatedPost) => (
                                <PostCard key={relatedPost.id} post={relatedPost} />
                            ))}
                        </div>
                    </div>
                </section>
            )}
        </>
    );
}
