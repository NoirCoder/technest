import Link from 'next/link';
import Image from 'next/image';
import { Clock } from 'lucide-react';
import { Post } from '@/lib/supabase';
import { estimateReadTime, formatDate } from '@/lib/markdown';

interface PostCardProps {
    post: Post & { categories?: Array<{ name: string; slug: string }> };
}

export default function PostCard({ post }: PostCardProps) {
    const readTime = estimateReadTime(post.content);

    return (
        <article className="card overflow-hidden group h-full flex flex-col">
            {/* Featured Image */}
            {post.featured_image && (
                <Link href={`/blog/${post.slug}`} className="block overflow-hidden">
                    <div className="relative aspect-[16/9] bg-neutral-100">
                        <Image
                            src={post.featured_image}
                            alt={post.title}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                    </div>
                </Link>
            )}

            {/* Content */}
            <div className="p-6 flex-1 flex flex-col">
                {/* Category Badge & Date */}
                <div className="flex items-center justify-between mb-3 text-xs">
                    {post.categories && post.categories.length > 0 && (
                        <span className="font-semibold text-primary-600 bg-primary-50 px-2 py-1 rounded-md">
                            {post.categories[0].name}
                        </span>
                    )}
                    <time dateTime={post.published_at || post.created_at} className="text-neutral-500">
                        {formatDate(post.published_at || post.created_at)}
                    </time>
                </div>

                {/* Title */}
                <Link href={`/blog/${post.slug}`} className="block mb-3">
                    <h3 className="text-xl font-bold font-serif text-neutral-900 group-hover:text-primary-600 transition-colors line-clamp-2">
                        {post.title}
                    </h3>
                </Link>

                {/* Excerpt */}
                {post.excerpt && (
                    <p className="text-neutral-600 mb-6 line-clamp-3 text-sm leading-relaxed flex-1">
                        {post.excerpt}
                    </p>
                )}

                {/* Footer with Read More */}
                <div className="flex items-center justify-between pt-4 border-t border-neutral-100 mt-auto">
                    <div className="flex items-center gap-1 text-xs text-neutral-500">
                        <Clock className="w-3 h-3" />
                        <span>{readTime} min read</span>
                    </div>
                    <Link
                        href={`/blog/${post.slug}`}
                        className="text-sm font-semibold text-neutral-900 hover:text-primary-600 transition-colors inline-flex items-center gap-1 group/btn"
                    >
                        Read more
                        <span className="transform group-hover/btn:translate-x-1 transition-transform">→</span>
                    </Link>
                </div>
            </div>
        </article>
    );
}
