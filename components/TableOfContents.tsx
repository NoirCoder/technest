'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

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
        <nav className="hidden lg:block sticky top-24 max-h-[calc(100vh-6rem)] overflow-auto">
            <div className="card p-6">
                <h3 className="text-sm font-semibold text-neutral-900 mb-4 uppercase tracking-wide">
                    Table of Contents
                </h3>
                <ul className="space-y-2">
                    {headings.map((heading) => (
                        <li
                            key={heading.id}
                            style={{ paddingLeft: `${(heading.level - 1) * 0.75}rem` }}
                        >
                            <Link
                                href={`#${heading.id}`}
                                className={`text-sm transition-colors duration-200 block py-1 ${activeId === heading.id
                                        ? 'text-primary-600 font-medium'
                                        : 'text-neutral-600 hover:text-neutral-900'
                                    }`}
                                onClick={(e) => {
                                    e.preventDefault();
                                    document.getElementById(heading.id)?.scrollIntoView({
                                        behavior: 'smooth',
                                        block: 'start',
                                    });
                                }}
                            >
                                {heading.text}
                            </Link>
                        </li>
                    ))}
                </ul>
            </div>
        </nav>
    );
}
