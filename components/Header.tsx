'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Menu, X, Search } from 'lucide-react';
import SearchOverlay from '@/components/SearchOverlay';

export default function Header() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const [isSearchOpen, setIsSearchOpen] = useState(false);

    // Handle scroll effect
    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 0);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Handle keyboard shortcut for search
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                setIsSearchOpen(true);
            }
            if (e.key === 'Escape') {
                setIsSearchOpen(false);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    const navLinks = [
        { name: 'Keyboards', href: '/category/keyboards' },
        { name: 'Mice', href: '/category/mice' },
        { name: 'Headphones', href: '/category/headphones' },
        { name: 'Monitors', href: '/category/monitors' },
        { name: 'Desk Accessories', href: '/category/desk-accessories' },
    ];

    return (
        <>
            <header
                className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${isScrolled ? 'bg-white/80 backdrop-blur-md shadow-sm border-b border-neutral-200/50' : 'bg-white border-b border-transparent'
                    }`}
            >
                <div className="container-custom h-16 md:h-20 flex items-center justify-between">

                    {/* Logo */}
                    <Link href="/" className="font-serif text-2xl font-bold text-neutral-900 tracking-tight">
                        TechNest
                    </Link>

                    {/* Desktop Nav */}
                    <nav className="hidden md:flex items-center gap-8">
                        {navLinks.map((link) => (
                            <Link
                                key={link.name}
                                href={link.href}
                                className="text-sm font-medium text-neutral-600 hover:text-primary-600 transition-colors"
                            >
                                {link.name}
                            </Link>
                        ))}

                        {/* Search Trigger */}
                        <button
                            onClick={() => setIsSearchOpen(true)}
                            className="p-2 text-neutral-500 hover:text-primary-600 hover:bg-neutral-50 rounded-full transition-colors ml-2"
                            aria-label="Search"
                        >
                            <Search className="w-5 h-5" />
                        </button>
                    </nav>

                    {/* Mobile Menu Button */}
                    <div className="flex items-center gap-4 md:hidden">
                        <button
                            onClick={() => setIsSearchOpen(true)}
                            className="p-2 text-neutral-500 hover:text-neutral-900"
                        >
                            <Search className="w-5 h-5" />
                        </button>
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="p-2 text-neutral-900"
                        >
                            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                        </button>
                    </div>
                </div>

                {/* Mobile Nav */}
                {isMenuOpen && (
                    <div className="md:hidden absolute top-full left-0 right-0 bg-white border-b border-neutral-200 p-4 shadow-lg animate-in slide-in-from-top-2">
                        <nav className="flex flex-col space-y-4">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.name}
                                    href={link.href}
                                    className="text-base font-medium text-neutral-900 py-2 border-b border-neutral-100 last:border-0"
                                    onClick={() => setIsMenuOpen(false)}
                                >
                                    {link.name}
                                </Link>
                            ))}
                        </nav>
                    </div>
                )}
            </header>

            {/* Search Overlay */}
            <SearchOverlay isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
        </>
    );
}
