'use client';

import { supabase } from '@/lib/supabase';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
    LayoutDashboard,
    FileText,
    FolderOpen,
    LogOut,
    Loader2,
    Home,
    ChevronLeft,
    Search,
    Settings,
    Tag,
    Image as ImageIcon,
    ExternalLink,
    Zap
} from 'lucide-react';
import { User } from '@supabase/supabase-js';
import { cn } from '@/lib/utils';

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const router = useRouter();
    const pathname = usePathname();
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<User | null>(null);
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isSearchOpen, setIsSearchOpen] = useState(false);

    useEffect(() => {
        const checkAuth = async () => {
            const { data: { user } } = await supabase.auth.getUser();

            if (!user && pathname !== '/admin/login') {
                router.push('/admin/login');
            } else {
                setUser(user);
            }

            setLoading(false);
        };

        checkAuth();
    }, [pathname, router]);

    // Command Palette Keyboard Listener
    const handleKeyDown = useCallback((e: KeyboardEvent) => {
        if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
            e.preventDefault();
            setIsSearchOpen(prev => !prev);
        }
    }, []);

    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleKeyDown]);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push('/admin/login');
        router.refresh();
    };

    if (pathname === '/admin/login') {
        return children;
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#09090B]">
                <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
            </div>
        );
    }

    if (!user) return null;

    const navItems = [
        { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
        { name: 'Publications', href: '/admin/posts', icon: FileText },
        { name: 'Taxonomy', href: '/admin/categories', icon: Tag },
        { name: 'Affiliates', href: '/admin/affiliates', icon: Zap },
        { name: 'Media Vault', href: '/admin/media', icon: ImageIcon },
        { name: 'Global SEO', href: '/admin/seo', icon: Settings },
    ];

    return (
        <div className="min-h-screen bg-[#FAFAFA] text-neutral-900 selection:bg-primary-100 selection:text-primary-900 flex">
            {/* Sidebar */}
            <motion.aside
                initial={false}
                animate={{ width: isCollapsed ? 80 : 280 }}
                className="h-screen bg-white border-r border-neutral-100 flex flex-col sticky top-0 z-50 shadow-[4px_0_24px_rgba(0,0,0,0.02)]"
            >
                {/* Brand Logo */}
                <div className="h-20 flex items-center px-6 border-b border-neutral-50 overflow-hidden shrink-0">
                    <Link href="/admin/dashboard" className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-[#09090B] rounded-lg flex items-center justify-center text-white shrink-0">
                            <Zap className="w-4 h-4 fill-current" />
                        </div>
                        {!isCollapsed && (
                            <motion.span
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="font-bold text-lg tracking-tight text-neutral-900"
                            >
                                Tech<span className="text-primary-600">Nest</span>
                            </motion.span>
                        )}
                    </Link>
                </div>

                {/* Nav Section */}
                <div className="flex-1 py-10 px-4 space-y-1.5 overflow-y-auto custom-scrollbar">
                    {/* Search Trigger (Cmd+K) */}
                    <button
                        onClick={() => setIsSearchOpen(true)}
                        className={cn(
                            "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-neutral-400 hover:bg-neutral-50 transition-all border border-transparent hover:border-neutral-100 group mb-6",
                            isCollapsed && "justify-center"
                        )}
                    >
                        <Search className="w-4.5 h-4.5 group-hover:text-neutral-900 transition-colors" />
                        {!isCollapsed && (
                            <div className="flex-1 flex items-center justify-between">
                                <span className="text-sm font-medium">Search...</span>
                                <span className="text-[10px] font-bold bg-white border border-neutral-200 px-1.5 py-0.5 rounded shadow-sm">⌘K</span>
                            </div>
                        )}
                    </button>

                    <div className="space-y-1">
                        {!isCollapsed && <p className="px-3 text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-300 mb-3">Main Navigation</p>}
                        {navItems.map((item) => {
                            const Icon = item.icon;
                            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');

                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    title={isCollapsed ? item.name : undefined}
                                    className={cn(
                                        "group flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all relative overflow-hidden",
                                        isActive
                                            ? "bg-[#09090B] text-white shadow-lg shadow-neutral-200"
                                            : "text-neutral-500 hover:text-neutral-900 hover:bg-neutral-50"
                                    )}
                                >
                                    <Icon className={cn("w-5 h-5 shrink-0", isActive ? "text-white" : "group-hover:scale-110 transition-transform")} />
                                    {!isCollapsed && <span className="text-sm font-bold tracking-tight">{item.name}</span>}
                                    {isActive && !isCollapsed && (
                                        <motion.div layoutId="nav-active" className="absolute left-0 w-1 h-4 bg-primary-500 rounded-r-full" />
                                    )}
                                </Link>
                            );
                        })}
                    </div>

                    <div className="pt-10">
                        {!isCollapsed && <p className="px-3 text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-300 mb-3">Public View</p>}
                        <Link
                            href="/"
                            target="_blank"
                            className={cn(
                                "group flex items-center gap-3 px-3 py-2.5 rounded-xl text-neutral-500 hover:text-neutral-900 hover:bg-neutral-50 transition-all",
                                isCollapsed && "justify-center"
                            )}
                        >
                            <ExternalLink className="w-5 h-5 shrink-0" />
                            {!isCollapsed && <span className="text-sm font-bold tracking-tight">View Website</span>}
                        </Link>
                    </div>
                </div>

                {/* Sidebar Footer */}
                <div className="p-4 border-t border-neutral-50 space-y-4">
                    <button
                        onClick={() => setIsCollapsed(!isCollapsed)}
                        className="w-full h-10 flex items-center justify-center rounded-xl bg-neutral-50 text-neutral-400 hover:text-neutral-900 transition-all border border-neutral-100 hover:border-neutral-200"
                    >
                        <ChevronLeft className={cn("w-4 h-4 transition-transform duration-300", isCollapsed && "rotate-180")} />
                    </button>

                    {!isCollapsed && (
                        <div className="bg-[#09090B] p-4 rounded-2xl flex flex-col gap-3 shadow-2xl">
                            <div className="min-w-0">
                                <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 mb-0.5">Moderator</p>
                                <p className="text-xs font-bold text-white truncate">{user.email}</p>
                            </div>
                            <button
                                onClick={handleLogout}
                                className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-white/5 hover:bg-red-500/10 text-neutral-300 hover:text-red-400 transition-all text-[11px] font-bold border border-white/5"
                            >
                                <LogOut className="w-3.5 h-3.5" />
                                Logout Workspace
                            </button>
                        </div>
                    )}
                </div>
            </motion.aside>

            {/* Main Content Area */}
            <main className="flex-1 h-screen overflow-hidden flex flex-col relative">
                {/* Global Search / Command Palette Overlay */}
                <AnimatePresence>
                    {isSearchOpen && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-white/80 backdrop-blur-sm z-[100] flex items-start justify-center pt-32 px-4"
                            onClick={() => setIsSearchOpen(false)}
                        >
                            <motion.div
                                initial={{ scale: 0.95, opacity: 0, y: -20 }}
                                animate={{ scale: 1, opacity: 1, y: 0 }}
                                exit={{ scale: 0.95, opacity: 0, y: -20 }}
                                className="w-full max-w-2xl bg-white rounded-2xl shadow-[0_24px_48px_-12px_rgba(0,0,0,0.1)] border border-neutral-200 overflow-hidden"
                                onClick={e => e.stopPropagation()}
                            >
                                <div className="p-4 border-b border-neutral-100 flex items-center gap-3">
                                    <Search className="w-5 h-5 text-neutral-400" />
                                    <input
                                        autoFocus
                                        placeholder="Type to search publications, categories, or actions..."
                                        className="flex-1 bg-transparent border-none outline-none text-neutral-900 font-medium placeholder:text-neutral-300"
                                    />
                                    <kbd className="px-2 py-1 bg-neutral-50 border border-neutral-200 rounded text-[10px] font-bold text-neutral-400">ESC</kbd>
                                </div>
                                <div className="p-6 text-center py-20">
                                    <Search className="w-12 h-12 text-neutral-100 mx-auto mb-4" />
                                    <p className="text-neutral-400 font-medium font-serif italic">The workspace index is ready. Search anything.</p>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="flex-1 overflow-y-auto custom-scrollbar">
                    <div className="max-w-[1400px] mx-auto p-12 lg:p-16">
                        {children}
                    </div>
                </div>
            </main>
        </div>
    );
}
