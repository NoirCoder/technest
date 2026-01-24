'use client';

import { supabase } from '@/lib/supabase';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { LayoutDashboard, FileText, FolderOpen, LogOut, Loader2 } from 'lucide-react';

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const router = useRouter();
    const pathname = usePathname();
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        const { data: { user } } = await supabase.auth.getUser();

        if (!user && pathname !== '/admin/login') {
            router.push('/admin/login');
        } else {
            setUser(user);
        }

        setLoading(false);
    };

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
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
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
        <div className="min-h-screen bg-neutral-50">
            {/* Sidebar */}
            <div className="fixed inset-y-0 left-0 w-64 bg-white border-r border-neutral-200">
                <div className="flex flex-col h-full">
                    {/* Logo */}
                    <div className="p-6 border-b border-neutral-200">
                        <Link href="/admin/dashboard">
                            <h1 className="text-2xl font-bold font-serif text-neutral-900">
                                Tech<span className="text-primary-600">Nest</span>
                            </h1>
                            <p className="text-sm text-neutral-500 mt-1">Admin Panel</p>
                        </Link>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 p-4 space-y-1">
                        {navigation.map((item) => {
                            const Icon = item.icon;
                            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');

                            return (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive
                                            ? 'bg-primary-50 text-primary-700 font-medium'
                                            : 'text-neutral-600 hover:bg-neutral-100'
                                        }`}
                                >
                                    <Icon className="w-5 h-5" />
                                    {item.name}
                                </Link>
                            );
                        })}
                    </nav>

                    {/* User & Logout */}
                    <div className="p-4 border-t border-neutral-200">
                        <div className="mb-3 px-4">
                            <p className="text-sm text-neutral-500">Logged in as</p>
                            <p className="text-sm font-medium text-neutral-900 truncate">{user.email}</p>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-neutral-600 hover:bg-neutral-100 transition-colors"
                        >
                            <LogOut className="w-5 h-5" />
                            Logout
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="ml-64">
                <main className="p-8">
                    {children}
                </main>
            </div>
        </div>
    );
}
