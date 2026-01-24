import { supabase } from '@/lib/supabase';
import { DEMO_POSTS } from '@/lib/demo-data';
import PostCard from '@/components/PostCard';
import Newsletter from '@/components/Newsletter';
import { ArrowRight, BookOpen, ShieldCheck, Zap, Keyboard, Mouse, Headphones, Monitor, Lamp } from 'lucide-react';
import Link from 'next/link';

export const revalidate = 3600; // Revalidate every hour

async function getLatestPosts() {
    try {
        const { data, error } = await supabase
            .from('posts')
            .select(`
        *,
        categories:post_categories(category:categories(*))
      `)
            .eq('published', true)
            .order('published_at', { ascending: false })
            .limit(6);

        if (error || !data || data.length === 0) {
            console.log('Using demo data for homepage');
            return DEMO_POSTS;
        }

        return data.map(post => ({
            ...post,
            categories: post.categories?.map((pc: any) => pc.category) || [],
        }));
    } catch (e) {
        console.log('Error fetching posts, using demo data', e);
        return DEMO_POSTS;
    }
}

export default async function HomePage() {
    const latestPosts = await getLatestPosts();

    return (
        <div>
            {/* Hero Section - Blog/Storytelling Focus */}
            <section className="bg-white pt-20 pb-16 md:pt-32 md:pb-24">
                <div className="container-custom">
                    <div className="max-w-4xl mx-auto text-center">
                        <h1 className="text-5xl md:text-7xl font-bold font-serif text-neutral-900 mb-6 tracking-tight text-balance">
                            Smart tech picks for <span className="text-primary-600 relative">
                                modern work
                                <svg className="absolute w-full h-3 -bottom-1 left-0 text-primary-200 -z-10" viewBox="0 0 100 10" preserveAspectRatio="none">
                                    <path d="M0 5 Q 50 10 100 5" stroke="currentColor" strokeWidth="8" fill="none" />
                                </svg>
                            </span>
                        </h1>
                        <p className="text-lg md:text-xl text-neutral-600 mb-10 max-w-2xl mx-auto leading-relaxed">
                            We scour the market to find the best productivity gear for your setup. curated guides, detailed comparisons, and top-rated recommendations for 2026.
                        </p>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <Link href="#latest" className="btn-primary w-full sm:w-auto text-base px-8 py-4">
                                View Top Picks
                                <ArrowRight className="ml-2 w-4 h-4" />
                            </Link>
                            <Link href="/about" className="btn-secondary w-full sm:w-auto text-base px-8 py-4 border-neutral-200">
                                How We Choose
                            </Link>
                        </div>

                        {/* Trust Signals */}
                        <div className="mt-16 pt-8 border-t border-neutral-100 flex flex-wrap justify-center gap-8 md:gap-16 text-neutral-500 text-sm font-medium">
                            <div className="flex items-center gap-2">
                                <ShieldCheck className="w-5 h-5 text-primary-600" />
                                <span>Top Rated Gear</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <BookOpen className="w-5 h-5 text-primary-600" />
                                <span>Detailed Specs</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Zap className="w-5 h-5 text-primary-600" />
                                <span>Value Focused</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Latest Blog Posts */}
            <section id="latest" className="py-20 bg-neutral-50">
                <div className="container-custom">
                    <div className="flex items-end justify-between mb-10">
                        <div>
                            <h2 className="text-3xl font-bold font-serif text-neutral-900 mb-2">Latest Guides & Picks</h2>
                            <p className="text-neutral-600">Discover the most useful tech for your workspace</p>
                        </div>
                        <Link href="/blog" className="hidden md:flex items-center text-primary-600 font-medium hover:text-primary-700 transition-colors">
                            View all guides
                            <ArrowRight className="ml-2 w-4 h-4" />
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {latestPosts.map((post) => (
                            <PostCard key={post.id} post={post} />
                        ))}

                        {/* Empty State / Skeleton if no posts */}
                        {latestPosts.length === 0 && Array.from({ length: 3 }).map((_, i) => (
                            <div key={i} className="card p-6 h-96 flex items-center justify-center text-neutral-400 bg-white border border-dashed border-neutral-200">
                                <div className="text-center">
                                    <div className="w-16 h-16 bg-neutral-50 rounded-full mx-auto mb-4 flex items-center justify-center">
                                        <BookOpen className="w-6 h-6 text-neutral-300" />
                                    </div>
                                    <p>Coming Soon</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="md:hidden mt-8 text-center">
                        <Link href="/blog" className="btn-secondary w-full">
                            View all guides
                        </Link>
                    </div>
                </div>
            </section>

            {/* Featured Categories (Secondary) */}
            <section className="py-20 bg-white">
                <div className="container-custom">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold font-serif text-neutral-900 mb-4">Explore by Topic</h2>
                        <p className="text-neutral-600 max-w-2xl mx-auto">
                            Find exactly what you need to upgrade your setup. We've organized the best products into these core categories.
                        </p>
                    </div>



                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6">
                        <Link
                            href="/category/keyboards"
                            className="group flex flex-col items-center justify-center p-6 rounded-2xl bg-neutral-50 border border-transparent hover:border-primary-100 hover:bg-white hover:shadow-soft-lg transition-all duration-300 text-center"
                        >
                            <Keyboard className="w-8 h-8 mb-3 text-neutral-400 group-hover:text-primary-600 group-hover:scale-110 transition-all duration-300" />
                            <span className="font-semibold text-neutral-900 group-hover:text-primary-600 transition-colors">
                                Keyboards
                            </span>
                        </Link>

                        <Link
                            href="/category/mice"
                            className="group flex flex-col items-center justify-center p-6 rounded-2xl bg-neutral-50 border border-transparent hover:border-primary-100 hover:bg-white hover:shadow-soft-lg transition-all duration-300 text-center"
                        >
                            <Mouse className="w-8 h-8 mb-3 text-neutral-400 group-hover:text-primary-600 group-hover:scale-110 transition-all duration-300" />
                            <span className="font-semibold text-neutral-900 group-hover:text-primary-600 transition-colors">
                                Mice
                            </span>
                        </Link>

                        <Link
                            href="/category/headphones"
                            className="group flex flex-col items-center justify-center p-6 rounded-2xl bg-neutral-50 border border-transparent hover:border-primary-100 hover:bg-white hover:shadow-soft-lg transition-all duration-300 text-center"
                        >
                            <Headphones className="w-8 h-8 mb-3 text-neutral-400 group-hover:text-primary-600 group-hover:scale-110 transition-all duration-300" />
                            <span className="font-semibold text-neutral-900 group-hover:text-primary-600 transition-colors">
                                Headphones
                            </span>
                        </Link>

                        <Link
                            href="/category/monitors"
                            className="group flex flex-col items-center justify-center p-6 rounded-2xl bg-neutral-50 border border-transparent hover:border-primary-100 hover:bg-white hover:shadow-soft-lg transition-all duration-300 text-center"
                        >
                            <Monitor className="w-8 h-8 mb-3 text-neutral-400 group-hover:text-primary-600 group-hover:scale-110 transition-all duration-300" />
                            <span className="font-semibold text-neutral-900 group-hover:text-primary-600 transition-colors">
                                Monitors
                            </span>
                        </Link>

                        <Link
                            href="/category/desk-accessories"
                            className="group flex flex-col items-center justify-center p-6 rounded-2xl bg-neutral-50 border border-transparent hover:border-primary-100 hover:bg-white hover:shadow-soft-lg transition-all duration-300 text-center"
                        >
                            <Lamp className="w-8 h-8 mb-3 text-neutral-400 group-hover:text-primary-600 group-hover:scale-110 transition-all duration-300" />
                            <span className="font-semibold text-neutral-900 group-hover:text-primary-600 transition-colors">
                                Desk Accessories
                            </span>
                        </Link>
                    </div>
                </div>
            </section>

            {/* About / Mission Section */}
            <section className="py-20 bg-neutral-900 text-white">
                <div className="container-custom">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                        <div>
                            <h2 className="text-3xl md:text-5xl font-bold font-serif mb-6">
                                Why use <span className="text-primary-400">TechNest</span>?
                            </h2>
                            <div className="prose prose-lg prose-invert text-neutral-300">
                                <p>
                                    Finding the right gear can be overwhelming. There are thousands of options,
                                    confusing specs, and endless reviews to read.
                                </p>
                                <p>
                                    We do the heavy lifting for you. We analyze the market, compare specifications,
                                    and curate only the most useful, high-rated products that actually improve your workflow.
                                    No clutter, just great recommendations.
                                </p>
                            </div>
                            <div className="mt-8">
                                <Link href="/about" className="text-white border-b border-primary-500 pb-1 hover:text-primary-400 transition-colors inline-flex items-center">
                                    See our selection process
                                    <ArrowRight className="ml-2 w-4 h-4" />
                                </Link>
                            </div>
                        </div>
                        <div className="relative">
                            <div className="absolute inset-0 bg-gradient-to-tr from-primary-600/20 to-blue-500/20 rounded-2xl transform rotate-3"></div>
                            <div className="relative bg-neutral-800 p-8 rounded-2xl border border-neutral-700 shadow-2xl">
                                <div className="flex items-start gap-4 mb-6">
                                    <div className="w-12 h-12 rounded-full bg-neutral-700 flex items-center justify-center font-serif font-bold text-xl text-primary-400">TN</div>
                                    <div>
                                        <h3 className="font-bold text-lg">Our Standard</h3>
                                        <p className="text-sm text-neutral-400">What we look for</p>
                                    </div>
                                </div>
                                <ul className="space-y-4">
                                    {[
                                        'High user satisfaction & ratings',
                                        'Practical utility for work & productivity',
                                        'Excellent build quality & aesthetics',
                                        'Best value for price'
                                    ].map((item, i) => (
                                        <li key={i} className="flex items-center gap-3 text-neutral-300">
                                            <div className="w-6 h-6 rounded-full bg-primary-900/50 text-primary-400 flex items-center justify-center flex-shrink-0 text-xs">✓</div>
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Newsletter */}
            <Newsletter />
        </div>
    );
}
