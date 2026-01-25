import Link from 'next/link';
import Image from 'next/image';
import { Clock, ArrowUpRight } from 'lucide-react';
import { Post } from '@/lib/supabase';
import { estimateReadTime, formatDate } from '@/lib/markdown';

interface PostCardProps {
    post: Post & { categories?: Array<{ name: string; slug: string }> };
}

export default function PostCard({ post }: PostCardProps) {
    const readTime = estimateReadTime(post.content);

    return (
        <article className="brutalist-card flex flex-col h-full bg-white group overflow-hidden">
            {/* Featured Image */}
            {post.featured_image && (
                <Link href={`/blog/${post.slug}`} className="block relative aspect-[16/9] border-b-[2.5px] border-neutral-900 overflow-hidden">
                    <Image
                        src={post.featured_image}
                        alt={post.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-4 left-4 z-10">
                        {post.categories && post.categories.length > 0 && (
                            <span className="bg-primary-400 text-neutral-900 border-[1.5px] border-neutral-900 px-3 py-1 text-[10px] font-black uppercase tracking-widest shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                                {post.categories[0].name}
                            </span>
                        )}
                    </div>
                </Link>
            )}

            {/* Content */}
            <div className="p-8 flex-1 flex flex-col">
                <div className="flex items-center gap-2 mb-4">
                    <time dateTime={post.published_at || post.created_at} className="text-[10px] font-black uppercase tracking-widest text-neutral-400">
                        {formatDate(post.published_at || post.created_at)}
                    </time>
                </div>

                <Link href={`/blog/${post.slug}`} className="block mb-4">
                    <h3 className="text-2xl font-black text-neutral-900 group-hover:underline decoration-[4px] decoration-primary-400 underline-offset-4 transition-all leading-tight">
                        {post.title}
                    </h3>
                </Link>

                {post.excerpt && (
                    <p className="text-neutral-600 mb-8 line-clamp-3 text-sm font-bold leading-relaxed flex-1">
                        {post.excerpt}
                    </p>
                )}

                <div className="flex items-center justify-between pt-6 border-t-[1.5px] border-neutral-900 mt-auto">
                    <div className="flex items-center gap-2 text-[10px] font-black uppercase text-neutral-400">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{readTime} MIN READ</span>
                    </div>
                    <Link
                        href={`/blog/${post.slug}`}
                        className="p-2 border-[1.5px] border-neutral-900 bg-white hover:bg-neutral-900 hover:text-white transition-all shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px]"
                    >
                        <ArrowUpRight className="w-5 h-5" />
                    </Link>
                </div>
            </div>
        </article>
    );
}
