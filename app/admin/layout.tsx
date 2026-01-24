'use client';

import { supabase } from '@/lib/supabase';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { LayoutDashboard, FileText, FolderOpen, LogOut, Loader2, Home } from 'lucide-react';
import { User } from '@supabase/supabase-js';

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const router = useRouter();
    const pathname = usePathname();
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<User | null>(null);

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

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push('/admin/login');
        router.refresh();
    };

    // Don't protect login page
    if (pathname === '/admin/login') {
        return children;
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white">
                <Loader2 className="w-10 h-10 animate-spin text-primary-600" />
            </div>
        );
    }

    if (!user) {
        return null;
    }

    const navigation = [
        { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
        { name: 'Posts', href: '/admin/posts', icon: FileText },
        { name: 'Categories', href: '/admin/categories', icon: FolderOpen },
    ];

    return (
        <div className="min-h-screen bg-[#FDFDFD] flex overflow-hidden font-sans">
            {/* Sidebar */}
            <aside className="w-72 bg-white border-r border-neutral-100 flex-shrink-0 flex flex-col shadow-[4px_0_24px_rgba(0,0,0,0.02)] z-20">
                {/* Logo Area */}
                <div className="h-24 flex items-center px-10 border-b border-neutral-50">
                    <Link href="/admin/dashboard" className="flex flex-col">
                        <span className="text-2xl font-bold font-serif tracking-tight text-neutral-900">
                            Tech<span className="text-primary-600">Nest</span>
                        </span>
                        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-400 mt-1">
                            Management Workspace
                        </span>
                    </Link>
                </div>

                {/* Main Navigation */}
                <nav className="flex-1 px-6 py-10 space-y-2 overflow-y-auto">
                    {navigation.map((item) => {
                        const Icon = item.icon;
                        const isActive = pathname === item.href || pathname.startsWith(item.href + '/');

                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={`group flex items-center gap-4 px-5 py-3.5 rounded-xl transition-all duration-300 ${isActive
                                    ? 'bg-primary-600 text-white shadow-lg shadow-primary-200'
                                    : 'text-neutral-500 hover:bg-neutral-50 hover:text-neutral-900'
                                    }`}
                            >
                                <Icon className={`w-5 h-5 transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`} />
                                <span className="font-bold text-sm">{item.name}</span>
                            </Link>
                        );
                    })}

                    <div className="pt-10 pb-4">
                        <p className="px-5 text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-300 mb-4">
                            External
                        </p>
                        <Link
                            href="/"
                            target="_blank"
                            className="group flex items-center gap-4 px-5 py-3.5 rounded-xl text-neutral-500 hover:bg-neutral-50 hover:text-neutral-900 transition-all duration-300"
                        >
                            <Home className="w-5 h-5 transition-transform duration-300 group-hover:scale-110" />
                            <span className="font-bold text-sm">View Website</span>
                        </Link>
                    </div>
                </nav>

                {/* Footer User Area */}
                <div className="p-6 border-t border-neutral-50 bg-neutral-50/10">
                    <div className="bg-white p-4 rounded-2xl border border-neutral-100 shadow-soft-sm">
                        <div className="mb-4">
                            <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 mb-1">
                                Moderator
                            </p>
                            <p className="text-sm font-bold text-neutral-900 truncate">{user.email}</p>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-neutral-100 text-neutral-600 hover:bg-neutral-50 hover:text-red-600 transition-all text-sm font-bold"
                        >
                            <LogOut className="w-4 h-4" />
                            Logout
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col h-screen overflow-hidden">
                <main className="flex-1 overflow-y-auto custom-scrollbar">
                    <div className="max-w-[1400px] mx-auto p-12">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
