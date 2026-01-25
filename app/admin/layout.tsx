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
        <div className="min-h-screen bg-white text-neutral-900 selection:bg-neutral-900 selection:text-white flex">
            {/* Sidebar */}
            <motion.aside
                initial={false}
                animate={{ width: isCollapsed ? 100 : 300 }}
                className="h-screen bg-white border-r-[3px] border-neutral-900 flex flex-col sticky top-0 z-50"
            >
                {/* Brand Logo */}
                <div className="h-24 flex items-center px-8 border-b-[3px] border-neutral-900 overflow-hidden shrink-0">
                    <Link href="/admin/dashboard" className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-neutral-900 border-[2px] border-neutral-900 flex items-center justify-center text-white shrink-0 shadow-[3px_3px_0px_0px_rgba(0,0,0,0.2)]">
                            <Zap className="w-5 h-5 fill-current text-primary-400" />
                        </div>
                        {!isCollapsed && (
                            <motion.span
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="font-black text-2xl tracking-tighter text-neutral-900 uppercase"
                            >
                                Tech<span className="text-primary-400 text-border">Nest</span>
                            </motion.span>
                        )}
                    </Link>
                </div>

                {/* Nav Section */}
                <div className="flex-1 py-10 px-6 space-y-2 overflow-y-auto custom-scrollbar">
                    {/* Search Trigger */}
                    <button
                        onClick={() => setIsSearchOpen(true)}
                        className={cn(
                            "w-full flex items-center gap-4 px-4 py-3 bg-neutral-50 border-[2px] border-neutral-900 transition-all hover:bg-neutral-100 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] mb-8",
                            isCollapsed && "justify-center"
                        )}
                    >
                        <Search className="w-5 h-5 text-neutral-900" />
                        {!isCollapsed && (
                            <div className="flex-1 flex items-center justify-between">
                                <span className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Search Core</span>
                                <span className="text-[9px] font-black bg-white border border-neutral-900 px-1.5 py-0.5 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">⌘K</span>
                            </div>
                        )}
                    </button>

                    <div className="space-y-2">
                        {!isCollapsed && <p className="px-4 text-[10px] font-black uppercase tracking-[0.3em] text-neutral-400 mb-6">Operations</p>}
                        {navItems.map((item) => {
                            const Icon = item.icon;
                            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');

                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    title={isCollapsed ? item.name : undefined}
                                    className={cn(
                                        "group flex items-center gap-4 px-4 py-3.5 border-[2px] border-transparent transition-all relative",
                                        isActive
                                            ? "bg-neutral-900 text-white border-neutral-900 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.3)]"
                                            : "text-neutral-500 hover:text-neutral-900 hover:bg-neutral-50 hover:border-neutral-900"
                                    )}
                                >
                                    <Icon className={cn("w-5 h-5 shrink-0", isActive ? "text-primary-400" : "group-hover:scale-110 transition-transform")} />
                                    {!isCollapsed && <span className="text-[11px] font-black uppercase tracking-widest leading-none">{item.name}</span>}
                                </Link>
                            );
                        })}
                    </div>

                    <div className="pt-10">
                        {!isCollapsed && <p className="px-4 text-[10px] font-black uppercase tracking-[0.3em] text-neutral-400 mb-6">Archive View</p>}
                        <Link
                            href="/"
                            target="_blank"
                            className={cn(
                                "group flex items-center gap-4 px-4 py-3.5 border-[2px] border-neutral-900 bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all",
                                isCollapsed && "justify-center"
                            )}
                        >
                            <ExternalLink className="w-5 h-5 shrink-0 text-neutral-900" />
                            {!isCollapsed && <span className="text-[11px] font-black uppercase tracking-widest leading-none text-neutral-900">Go Public</span>}
                        </Link>
                    </div>
                </div>

                {/* Sidebar Footer */}
                <div className="p-6 border-t-[3px] border-neutral-900 space-y-6">
                    <button
                        onClick={() => setIsCollapsed(!isCollapsed)}
                        className="w-full h-12 flex items-center justify-center border-[2px] border-neutral-900 bg-neutral-50 hover:bg-neutral-100 transition-all shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[1.5px] hover:translate-y-[1.5px]"
                    >
                        <ChevronLeft className={cn("w-5 h-5 text-neutral-900 transition-transform duration-300", isCollapsed && "rotate-180")} />
                    </button>

                    {!isCollapsed && (
                        <div className="bg-neutral-900 p-6 border-[2px] border-neutral-900 flex flex-col gap-4 shadow-[6px_6px_0px_0px_rgba(0,0,0,0.2)]">
                            <div className="min-w-0">
                                <p className="text-[9px] font-black uppercase tracking-[0.2em] text-neutral-500 mb-1">Authenticated Operator</p>
                                <p className="text-[11px] font-bold text-white truncate uppercase tracking-tighter">{user.email}</p>
                            </div>
                            <button
                                onClick={handleLogout}
                                className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-red-400 border-[2px] border-neutral-900 text-neutral-900 hover:bg-red-500 transition-all text-[10px] font-black uppercase tracking-widest shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[1.5px] hover:translate-y-[1.5px]"
                            >
                                <LogOut className="w-3.5 h-3.5" />
                                Abort
                            </button>
                        </div>
                    )}
                </div>
            </motion.aside>

            {/* Main Content Area */}
            <main className="flex-1 h-screen overflow-hidden flex flex-col relative bg-white">
                {/* Global Search / Command Palette Overlay */}
                <AnimatePresence>
                    {isSearchOpen && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-neutral-900/60 backdrop-blur-md z-[100] flex items-start justify-center pt-32 px-4"
                            onClick={() => setIsSearchOpen(false)}
                        >
                            <motion.div
                                initial={{ scale: 0.9, opacity: 0, y: -20 }}
                                animate={{ scale: 1, opacity: 1, y: 0 }}
                                exit={{ scale: 0.9, opacity: 0, y: -20 }}
                                className="w-full max-w-2xl bg-white border-[4px] border-neutral-900 shadow-[20px_20px_0px_0px_rgba(0,0,0,0.3)] overflow-hidden"
                                onClick={e => e.stopPropagation()}
                            >
                                <div className="p-6 border-b-[3px] border-neutral-900 flex items-center gap-4 bg-primary-400">
                                    <Search className="w-6 h-6 text-neutral-900" />
                                    <input
                                        autoFocus
                                        placeholder="SEARCH ARCHIVE ACTIONS..."
                                        className="flex-1 bg-transparent border-none outline-none text-neutral-900 font-black placeholder:text-neutral-900/40 uppercase tracking-widest"
                                    />
                                    <kbd className="px-3 py-1.5 bg-neutral-900 text-white border-[2px] border-neutral-900 text-[10px] font-black shadow-[3px_3px_0px_0px_rgba(255,255,255,0.2)]">ESC</kbd>
                                </div>
                                <div className="p-20 text-center bg-white">
                                    <div className="w-20 h-20 bg-neutral-100 border-[3px] border-neutral-900 flex items-center justify-center mx-auto mb-10 rotate-3 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                                        <Search className="w-10 h-10 text-neutral-900" />
                                    </div>
                                    <p className="text-xl font-black text-neutral-900 uppercase tracking-tighter mb-2 italic">Archive Index Ready.</p>
                                    <p className="text-[10px] font-black text-neutral-400 uppercase tracking-[0.3em]">Initialize query for intelligence.</p>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="flex-1 overflow-y-auto custom-scrollbar">
                    <div className="max-w-[1600px] mx-auto p-12 lg:p-24 bg-white">
                        {children}
                    </div>
                </div>
            </main>
        </div>
    );
}
