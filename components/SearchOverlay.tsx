'use client';

import { useState, useEffect, useRef } from 'react';
import { Search, X, Loader } from 'lucide-react';
import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';
import { DEMO_POSTS } from '@/lib/demo-data';

// Initialize Supabase client for search (using anon key for public search)
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder'
);

interface SearchOverlayProps {
    isOpen: boolean;
    onClose: () => void;
}

interface SearchResult {
    title: string;
    slug: string;
    excerpt?: string | null;
}

export default function SearchOverlay({ isOpen, onClose }: SearchOverlayProps) {
    const [query, setQuery] = useState('');
    const [typedResults, setTypedResults] = useState<SearchResult[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    // Focus input when open
    useEffect(() => {
        if (isOpen) {
            setTimeout(() => inputRef.current?.focus(), 100);
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'auto';
        }
    }, [isOpen]);

    // Handle Search
    useEffect(() => {
        const handleSearch = async () => {
            if (!query.trim()) {
                setTypedResults([]);
                return;
            }

            setIsSearching(true);

            try {
                // 1. Try Supabase Search
                const { data } = await supabase
                    .from('posts')
                    .select('title, slug, excerpt, published_at')
                    .eq('published', true)
                    .ilike('title', `%${query}%`)
                    .limit(5);

                if (data && data.length > 0) {
                    setTypedResults(data);
                } else {
                    // 2. Fallback to Demo Data search
                    const demoResults = DEMO_POSTS.filter(post =>
                        post.title.toLowerCase().includes(query.toLowerCase()) ||
                        post.excerpt?.toLowerCase().includes(query.toLowerCase())
                    ).slice(0, 5);
                    setTypedResults(demoResults);
                }
            } catch (e) {
                console.error('Search error', e);
                // Fallback catch
                const demoResults = DEMO_POSTS.filter(post =>
                    post.title.toLowerCase().includes(query.toLowerCase())
                ).slice(0, 5);
                setTypedResults(demoResults);
            } finally {
                setIsSearching(false);
            }
        };

        const debounce = setTimeout(handleSearch, 300);
        return () => clearTimeout(debounce);
    }, [query]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 bg-neutral-900/60 backdrop-blur-sm transition-opacity">
            <div
                className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4"
                onClick={onClose}
            >
                <div
                    className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="flex items-center border-b border-neutral-100 p-4">
                        <Search className="w-5 h-5 text-neutral-400 mr-3" />
                        <input
                            ref={inputRef}
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Search reviews, guides, and gear..."
                            className="flex-1 text-lg outline-none placeholder:text-neutral-400 text-neutral-900"
                        />
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-neutral-100 rounded-full transition-colors"
                        >
                            <X className="w-5 h-5 text-neutral-400" />
                        </button>
                    </div>

                    {/* Results */}
                    <div className="max-h-[60vh] overflow-y-auto">
                        {isSearching ? (
                            <div className="p-8 text-center text-neutral-400">
                                <Loader className="w-6 h-6 animate-spin mx-auto mb-2" />
                                <p className="text-sm">Searching...</p>
                            </div>
                        ) : typedResults.length > 0 ? (
                            <ul className="py-2">
                                {typedResults.map((result) => (
                                    <li key={result.slug}>
                                        <Link
                                            href={`/blog/${result.slug}`}
                                            onClick={onClose}
                                            className="block px-6 py-4 hover:bg-neutral-50 transition-colors group border-b border-neutral-50 last:border-0"
                                        >
                                            <h4 className="text-lg font-semibold text-neutral-900 group-hover:text-primary-600 transition-colors mb-1">
                                                {result.title}
                                            </h4>
                                            {result.excerpt && (
                                                <p className="text-sm text-neutral-500 line-clamp-1">{result.excerpt}</p>
                                            )}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        ) : query ? (
                            <div className="p-8 text-center text-neutral-500">
                                <p>No results found for &quot;{query}&quot;</p>
                            </div>
                        ) : (
                            <div className="p-8 text-center text-neutral-400">
                                <p className="text-sm">Type to search widely across TechNest</p>
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="bg-neutral-50 px-6 py-3 text-xs text-neutral-400 flex justify-between items-center border-t border-neutral-100">
                        <span>Press <kbd className="font-mono bg-white border border-neutral-200 rounded px-1 min-w-[20px] inline-block text-center">ESC</kbd> to close</span>
                        <span className="text-primary-600 font-medium">TechNest Search</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
