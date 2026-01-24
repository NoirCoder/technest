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
        <nav aria-label="Breadcrumb" className="mb-6">
            {/* Schema for Google */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />

            <ol className="flex flex-wrap items-center gap-2 text-sm text-neutral-500">
                <li>
                    <Link
                        href="/"
                        className="flex items-center hover:text-primary-600 transition-colors"
                        title="Home"
                    >
                        <Home className="w-4 h-4" />
                    </Link>
                </li>

                {items.map((item, index) => (
                    <li key={item.href} className="flex items-center gap-2">
                        <ChevronRight className="w-3 h-3 text-neutral-400" />
                        <Link
                            href={item.href}
                            className={`hover:text-primary-600 transition-colors ${index === items.length - 1
                                ? 'font-medium text-neutral-900 pointer-events-none'
                                : ''
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
