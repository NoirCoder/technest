'use client';

import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';

interface BreadcrumbItem {
    label: string;
    href: string;
}

interface BreadcrumbsProps {
    items: BreadcrumbItem[];
}

export default function Breadcrumbs({ items }: BreadcrumbsProps) {
    // Generate JSON-LD for Search Engines
    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: items.map((item, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            name: item.label,
            item: `https://technest.vercel.app${item.href}`, // Replace with responsive domain in prod
        })),
    };

    return (
        <nav aria-label="Breadcrumb" className="mb-4">
            {/* Schema for Google */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />

            <ol className="flex flex-wrap items-center gap-1 text-[9px] font-black uppercase tracking-widest text-neutral-400">
                <li>
                    <Link
                        href="/"
                        className="flex items-center hover:text-neutral-900 transition-colors"
                        title="Home"
                    >
                        HOME
                    </Link>
                </li>

                {items.map((item, index) => (
                    <li key={item.href} className="flex items-center gap-1">
                        <span className="text-neutral-300">/</span>
                        <Link
                            href={item.href}
                            className={`transition-colors ${index === items.length - 1
                                ? 'text-neutral-900 pointer-events-none'
                                : 'hover:text-neutral-900'
                                }`}
                            aria-current={index === items.length - 1 ? 'page' : undefined}
                        >
                            {item.label}
                        </Link>
                    </li>
                ))}
            </ol>
        </nav>
    );
}
