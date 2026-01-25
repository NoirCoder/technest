'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Hash } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TOCItem {
    level: number;
    text: string;
    id: string;
}

interface TableOfContentsProps {
    headings: TOCItem[];
}

export default function TableOfContents({ headings }: TableOfContentsProps) {
    const [activeId, setActiveId] = useState<string>('');

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setActiveId(entry.target.id);
                    }
                });
            },
            { rootMargin: '-100px 0px -66%' }
        );

        headings.forEach(({ id }) => {
            const element = document.getElementById(id);
            if (element) {
                observer.observe(element);
            }
        });

        return () => observer.disconnect();
    }, [headings]);

    if (headings.length === 0) return null;

    return (
        <nav className="space-y-4">
            <ul className="space-y-1">
                {headings.map((heading) => (
                    <li
                        key={heading.id}
                        className="group"
                        style={{ paddingLeft: `${(heading.level - 2) * 1}rem` }}
                    >
                        <Link
                            href={`#${heading.id}`}
                            className={cn(
                                "flex items-start gap-3 py-2 px-3 transition-all text-[11px] font-black uppercase tracking-widest leading-tight",
                                activeId === heading.id
                                    ? 'bg-neutral-900 text-white'
                                    : 'text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100'
                            )}
                            onClick={(e) => {
                                e.preventDefault();
                                document.getElementById(heading.id)?.scrollIntoView({
                                    behavior: 'smooth',
                                    block: 'start',
                                });
                            }}
                        >
                            <Hash className={cn("w-3.5 h-3.5 shrink-0 mt-0.5", activeId === heading.id ? "text-primary-400" : "text-neutral-300")} />
                            <span>{heading.text}</span>
                        </Link>
                    </li>
                ))}
            </ul>
        </nav>
    );
}
