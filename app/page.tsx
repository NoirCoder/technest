import { supabase, PostWithCategories, Category } from '@/lib/supabase';
import { DEMO_POSTS } from '@/lib/demo-data';
import PostCard from '@/components/PostCard';
import Newsletter from '@/components/Newsletter';
import { ArrowRight, BookOpen, ShieldCheck, Zap, Keyboard, Mouse, Headphones, Monitor, Lamp } from 'lucide-react';
import Link from 'next/link';

export const revalidate = 3600; // Revalidate every hour

async function getLatestPosts(): Promise<PostWithCategories[]> {
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

        return data.map(post => {
            const typedPost = post as unknown as {
                categories: { category: Category }[]
            } & PostWithCategories;

            return {
                ...typedPost,
                categories: typedPost.categories?.map(pc => pc.category) || [],
            };
        }) as PostWithCategories[];
    } catch (e) {
        console.log('Error fetching posts, using demo data', e);
        return DEMO_POSTS;
    }
}

export default async function HomePage() {
    const latestPosts = await getLatestPosts();

    return (
        <div className="bg-white">
            {/* Hero Section - Bold Neo-Brutalist */}
            <section className="pt-32 pb-24 border-b-[4px] border-neutral-900 overflow-hidden relative">
                <div className="container-custom relative z-10">
                    <div className="max-w-5xl">
                        <div className="flex items-center gap-3 mb-8">
                            <span className="bg-neutral-900 text-white px-4 py-1 text-[11px] font-black uppercase tracking-[0.3em]">INTELLIGENCE 2026</span>
                            <div className="h-[2px] w-20 bg-neutral-900" />
                        </div>

                        <h1 className="heading-xl font-black text-neutral-900 mb-12 tracking-tighter">
                            TECHNEST <br />
                            <span className="text-primary-400 text-border">AUTHORITY</span>
                        </h1>

                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-end">
                            <div className="lg:col-span-7">
                                <p className="text-2xl md:text-3xl font-bold text-neutral-900 leading-[1.2] tracking-tight mb-12">
                                    Strategic picks for high-velocity work. Curated guides, industrial comparisons, and technical intelligence for the modern workspace.
                                </p>
                                <div className="flex flex-wrap gap-6">
                                    <Link href="#latest" className="brutalist-button-primary h-16 px-10">
                                        ACCESS PICK ARCHIVE
                                    </Link>
                                    <Link href="/about" className="brutalist-button h-16 px-10">
                                        PROTOCOL
                                    </Link>
                                </div>
                            </div>
                            <div className="lg:col-span-5 hidden lg:block">
                                <div className="brutalist-card p-10 bg-neutral-50 rotate-2">
                                    <div className="flex items-start gap-4 mb-4">
                                        <ShieldCheck className="w-8 h-8 text-neutral-900" />
                                        <h3 className="text-lg font-black uppercase">Verified Status</h3>
                                    </div>
                                    <p className="text-xs font-bold text-neutral-500 uppercase leading-loose">
                                        ALL GEAR IS SUBJECTED TO SPECIFICATION AUDITS AND LONG-TERM RELIABILITY TESTING BEFORE LISTING.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Background Pattern */}
                <div className="absolute top-0 right-0 w-1/3 h-full bg-neutral-900 -z-0 translate-x-32 skew-x-12 hidden md:block" />
            </section>

            {/* Classification Module */}
            <section className="py-12 bg-neutral-900 text-white overflow-hidden">
                <div className="container-custom">
                    <div className="flex flex-wrap items-center justify-between gap-10">
                        <div className="flex items-center gap-4">
                            <Zap className="w-6 h-6 text-primary-400 fill-current" />
                            <span className="text-xs font-black uppercase tracking-[0.4em]">Active Categories</span>
                        </div>
                        <div className="flex flex-wrap gap-4 overflow-x-auto pb-4 md:pb-0 no-scrollbar">
                            {[
                                { name: 'KEYBOARDS', icon: Keyboard, href: '/category/keyboards' },
                                { name: 'MICE', icon: Mouse, href: '/category/mice' },
                                { name: 'HEADPHONES', icon: Headphones, href: '/category/headphones' },
                                { name: 'MONITORS', icon: Monitor, href: '/category/monitors' },
                                { name: 'ACCESSORIES', icon: Lamp, href: '/category/desk-accessories' },
                            ].map((cat) => (
                                <Link
                                    key={cat.name}
                                    href={cat.href}
                                    className="flex items-center gap-3 px-6 py-3 border-[1.5px] border-white/20 hover:border-white hover:bg-white hover:text-neutral-900 transition-all text-[10px] font-black tracking-widest uppercase"
                                >
                                    <cat.icon className="w-4 h-4" />
                                    {cat.name}
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Latest Blog Posts */}
            <section id="latest" className="py-32 bg-white">
                <div className="container-custom">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-20 pb-12 border-b-[3px] border-neutral-900">
                        <div>
                            <p className="text-[11px] font-black uppercase tracking-[0.3em] text-neutral-400 mb-4">LATEST ARCHIVE ENTRIES</p>
                            <h2 className="text-5xl md:text-6xl font-black uppercase tracking-tighter">Strategic Guides</h2>
                        </div>
                        <Link href="/blog" className="brutalist-button h-12 px-6">
                            VIEW FULL INDEX
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
                        {latestPosts.map((post) => (
                            <PostCard key={post.id} post={post} />
                        ))}

                        {/* Empty State */}
                        {latestPosts.length === 0 && Array.from({ length: 3 }).map((_, i) => (
                            <div key={i} className="brutalist-card p-10 h-80 flex items-center justify-center text-neutral-300 bg-neutral-50 grayscale opacity-50">
                                <div className="text-center">
                                    <BookOpen className="w-12 h-12 mx-auto mb-4" />
                                    <p className="text-[10px] font-black uppercase tracking-widest">Awaiting Publication</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Mission Section - High Impact */}
            <section className="py-32 bg-white border-t-[4px] border-neutral-900">
                <div className="container-custom">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
                        <div>
                            <div className="p-4 bg-primary-400 border-[3px] border-neutral-900 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] inline-block mb-10 translate-x-[-10px] rotate-[-2deg]">
                                <h3 className="text-xl font-black uppercase tracking-tight">The TechNest Standard</h3>
                            </div>
                            <h2 className="text-6xl font-black uppercase tracking-tighter mb-10 leading-[0.9]">
                                ZERO NOISE. <br />
                                JUST INTEL.
                            </h2>
                            <div className="prose prose-xl max-w-none text-neutral-600 font-bold leading-relaxed mb-12">
                                <p>
                                    Technical blogging has become cluttered with filler. We operate differently.
                                </p>
                                <p>
                                    Every pick in our archive is subjected to an industrial auditing protocol. We analyze specs, compare benchmarks, and verify long-term reliability so you don't have to.
                                </p>
                            </div>
                            <Link href="/about" className="brutalist-button-primary h-16 px-10">
                                OUR PROCESS
                            </Link>
                        </div>
                        <div className="relative">
                            <div className="brutalist-card p-12 bg-neutral-900 text-white translate-x-4 translate-y-4">
                                <div className="space-y-12">
                                    {[
                                        { title: 'Audited Reliability', desc: 'No gear enters without verified long-term stability.' },
                                        { title: 'Technical Spacing', desc: 'Minimal interfaces, maximized information density.' },
                                        { title: 'Authority Value', desc: 'Unbiased intelligence focused on utility over hype.' }
                                    ].map((item, i) => (
                                        <div key={i} className="flex gap-6 items-start">
                                            <div className="w-10 h-10 border-[3px] border-white flex items-center justify-center font-black text-xs shrink-0 bg-primary-400 text-neutral-900 shadow-[4px_4px_0px_0px_rgba(255,255,255,0.2)]">
                                                0{i + 1}
                                            </div>
                                            <div>
                                                <h4 className="font-black uppercase tracking-widest text-sm mb-2">{item.title}</h4>
                                                <p className="text-xs text-neutral-400 font-bold leading-loose">{item.desc}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <Newsletter />
        </div>
    );
}
