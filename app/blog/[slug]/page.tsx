import { supabase, Category, PostWithCategories, Post } from '@/lib/supabase';
import { DEMO_POSTS } from '@/lib/demo-data'; // Import demo data
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';
import { generateMetadata as generateSEOMetadata, generateArticleSchema, siteConfig } from '@/lib/seo';
import { estimateReadTime, formatDate, extractHeadings } from '@/lib/markdown';
import TableOfContents from '@/components/TableOfContents';
import PostCard from '@/components/PostCard';
import ReviewOverview from '@/components/ReviewOverview';
import ReadingProgress from '@/components/ReadingProgress';
import Breadcrumbs from '@/components/Breadcrumbs';
import ShareButtons from '@/components/ShareButtons';
import { Clock } from 'lucide-react';
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
    let post: PostWithCategories | null = null;

    // First try to get it from DB
    const { data } = await supabase
        .from('posts')
        .select('*')
        .eq('slug', slug)
        .eq('published', true)
        .single();

    if (data) {
        post = data as unknown as PostWithCategories;
    }

    // Fallback
    if (!post) {
        post = DEMO_POSTS.find(p => p.slug === slug) as unknown as PostWithCategories || null;
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

    let post: PostWithCategories | null = null;

    // 1. Try DB
    const { data: dbPost } = await supabase
        .from('posts')
        .select(`
      *,
      categories:post_categories(category:categories(*))
    `)
        .eq('slug', slug)
        .eq('published', true)
        .single();

    if (dbPost) {
        // Correctly cast the Supabase join result
        type DBPostResult = Post & { categories: { category: Category }[] };
        const typedDbPost = dbPost as unknown as DBPostResult;

        post = {
            ...typedDbPost,
            categories: typedDbPost.categories.map(c => c.category)
        };
    }

    // 2. Fallback to demo
    if (!post) {
        post = DEMO_POSTS.find(p => p.slug === slug) as unknown as PostWithCategories || null;
    }

    if (!post) {
        notFound();
    }

    // 3. Fetch Affiliates to parse shorthands
    const { data: affiliates } = await supabase.from('affiliates').select('*');

    // Parse shorthands [[affiliate:Amazon]] e.g.
    const parseAffiliates = (content: string) => {
        if (!affiliates || affiliates.length === 0) return content;

        let processedContent = content;
        affiliates.forEach(aff => {
            const regex = new RegExp(`\\[\\[affiliate:${aff.name}\\]\\]`, 'g');
            // Create a professional link or block
            const trackedLink = `[${aff.name}](${aff.base_url}?ref=${aff.affiliate_code || 'technest'})`;
            processedContent = processedContent.replace(regex, trackedLink);
        });
        return processedContent;
    };

    const processedContent = parseAffiliates(post.content);

    // categories are already mapped to Category[] in the step above or come from DEMO_POSTS
    const categories = post.categories || [];

    const readTime = estimateReadTime(processedContent);
    const headings = extractHeadings(processedContent);

    // Fetch related posts (same category)
    let relatedPosts: PostWithCategories[] = [];
    if (categories.length > 0) {
        const categoryId = categories[0].id;

        // Try DB for related
        const { data: relatedPostCategories } = await supabase
            .from('post_categories')
            .select('post_id')
            .eq('category_id', categoryId)
            .neq('post_id', post.id)
            .limit(3);

        if (relatedPostCategories && relatedPostCategories.length > 0) {
            const typedRPC = relatedPostCategories as unknown as { post_id: string }[];
            const postIds = typedRPC.map(pc => pc.post_id);
            const { data } = await supabase
                .from('posts')
                .select(`
          *,
          categories:post_categories(category:categories(*))
        `)
                .in('id', postIds)
                .eq('published', true)
                .limit(3);

            if (data) {
                type RelatedPostDBResult = Post & { categories: { category: Category }[] };
                const typedData = data as unknown as RelatedPostDBResult[];

                relatedPosts = typedData.map(p => ({
                    ...p,
                    categories: p.categories.map(c => c.category)
                }));
            }
        }

        // Fallback logic requires checking if relatedPosts is still empty
        if (relatedPosts.length === 0) {
            const demoPosts = DEMO_POSTS as unknown as PostWithCategories[];
            relatedPosts = demoPosts
                .filter(p => p.id !== post.id && p.categories.some(c => c.id === categoryId))
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
                    <div className="max-w-4xl mx-auto mb-8">
                        <Breadcrumbs items={[
                            { label: 'BLOG', href: '/blog' },
                            { label: categories[0]?.name?.toUpperCase() || 'POST', href: categories[0] ? `/category/${categories[0].slug}` : '#' },
                            { label: post.title.toUpperCase(), href: `/blog/${post.slug}` }
                        ]} />
                    </div>

                    {/* Header */}
                    <div className="max-w-4xl mx-auto mb-12 text-left">
                        {/* Categories */}
                        {categories.length > 0 && (
                            <div className="flex flex-wrap justify-start gap-3 mb-8">
                                {categories.map((category) => (
                                    <Link
                                        key={category.id}
                                        href={`/category/${category.slug}`}
                                        className="inline-block px-5 py-2 text-[10px] font-black tracking-[0.2em] text-neutral-900 bg-primary-400 border-[2px] border-neutral-900 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all uppercase"
                                    >
                                        {category.name}
                                    </Link>
                                ))}
                            </div>
                        )}

                        {/* Title */}
                        <h1 className="text-5xl md:text-6xl lg:text-7xl font-black text-neutral-900 mb-10 leading-[0.95] tracking-tighter uppercase">
                            {post.title}
                        </h1>

                        {/* Meta - Enhanced brutalist design */}
                        <div className="flex flex-wrap items-center justify-start gap-8 text-neutral-500 text-sm border-t-[3px] border-neutral-900 pt-8">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-neutral-900 text-white flex items-center justify-center font-black text-xs border-[2px] border-neutral-900">
                                    TN
                                </div>
                                <div>
                                    <span className="block text-neutral-900 font-black uppercase text-[10px] tracking-widest">TechNest Intelligence</span>
                                    <time dateTime={post.published_at || post.created_at} className="text-[10px] font-bold text-neutral-400">
                                        REVISED {formatDate(post.published_at || post.created_at).toUpperCase()}
                                    </time>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 bg-neutral-50 border-[1.5px] border-neutral-900 px-4 py-2 font-black text-[10px] uppercase tracking-widest text-neutral-900 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                                <Clock className="w-4 h-4" />
                                <span>{readTime} MIN READ</span>
                            </div>
                        </div>
                    </div>

                    {/* Featured Image - Wide */}
                    {post.featured_image && (
                        <div className="max-w-5xl mx-auto mb-20 relative px-4">
                            <div className="relative aspect-[21/9] md:aspect-[2/1] bg-neutral-100 border-[3px] border-neutral-900 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]">
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
                    <div className="max-w-7xl mx-auto px-4">
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-16">

                            {/* Left Sidebar - Social Share (Sticky) */}
                            <div className="hidden md:block md:col-span-1">
                                <ShareButtons title={post.title} slug={post.slug} />
                            </div>

                            {/* Main Content */}
                            <div className="md:col-span-8">
                                <div className="prose prose-neutral max-w-none
                                  prose-headings:font-black prose-headings:text-neutral-900 prose-headings:uppercase prose-headings:tracking-tighter
                                  prose-h1:text-6xl prose-h2:text-4xl prose-h2:border-b-[3px] prose-h2:border-neutral-900 prose-h2:pb-4 prose-h2:mb-10
                                  prose-h3:text-2xl prose-h3:bg-neutral-900 prose-h3:text-white prose-h3:inline-block prose-h3:px-4 prose-h3:py-1
                                  prose-p:leading-[1.7] prose-p:text-neutral-800 prose-p:mb-8 prose-p:font-medium prose-p:text-lg
                                  prose-a:text-neutral-900 prose-a:font-black prose-a:underline prose-a:decoration-primary-400 prose-a:decoration-[3px] hover:prose-a:bg-primary-400
                                  prose-img:border-[3px] prose-img:border-neutral-900 prose-img:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] prose-img:my-16
                                  prose-li:text-neutral-800 prose-li:mb-2 prose-li:font-bold
                                  prose-ul:list-square
                                  prose-pre:bg-neutral-900 prose-pre:border-[3px] prose-pre:border-neutral-900 prose-pre:shadow-[6px_6px_0px_0px_rgba(255,255,255,0.1)]
                                  prose-blockquote:border-l-[6px] prose-blockquote:border-l-neutral-900 prose-blockquote:bg-neutral-50 prose-blockquote:py-8 prose-blockquote:px-10 prose-blockquote:not-italic prose-blockquote:font-black prose-blockquote:text-xl prose-blockquote:my-16
                                  prose-table:border-[3px] prose-table:border-neutral-900
                                  prose-th:bg-neutral-900 prose-th:text-white prose-th:px-6 prose-th:py-4 prose-th:font-black prose-th:uppercase prose-th:text-xs
                                  prose-td:px-6 prose-td:py-4 prose-td:border-[2px] prose-td:border-neutral-900 prose-td:font-bold
                                ">
                                    <ReactMarkdown
                                        remarkPlugins={[remarkGfm, remarkBreaks]}
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
                                        {processedContent}
                                    </ReactMarkdown>

                                    {/* Verdict / Review Score (If applicable) */}
                                    {post.review && (
                                        <ReviewOverview
                                            rating={post.review.rating}
                                            pros={post.review.pros}
                                            cons={post.review.cons}
                                            verdict={post.review.verdict}
                                            productName={post.review.productName}
                                        />
                                    )}
                                </div>
                            </div>

                            {/* Sidebar with TOC (Right) */}
                            <div className="hidden lg:block lg:col-span-3">
                                <div className="sticky top-24">
                                    <div className="brutalist-card p-6 mb-8">
                                        <h4 className="text-[10px] font-black uppercase tracking-widest text-neutral-400 mb-6">Archive Navigation</h4>
                                        <TableOfContents headings={headings} />
                                    </div>

                                    {/* Optional: Add Ad space here */}
                                    <div className="p-8 bg-neutral-900 text-white border-[3px] border-neutral-900 shadow-[6px_6px_0px_0px_rgba(0,0,0,0.2)]">
                                        <div className="text-[10px] font-black uppercase tracking-widest text-neutral-500 mb-4">Space Module</div>
                                        <p className="text-xs font-bold leading-relaxed opacity-50 italic">Strategic placement for conversion assets or promotional intelligence.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </article>

            {/* Related Posts */}
            {relatedPosts.length > 0 && (
                <section className="py-24 bg-white border-t-[4px] border-neutral-900">
                    <div className="container-custom">
                        <div className="flex items-center gap-4 mb-12">
                            <h2 className="text-4xl font-black uppercase tracking-tighter">Related Archive</h2>
                            <div className="h-[3px] flex-1 bg-neutral-900" />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
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
