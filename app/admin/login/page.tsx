'use client';

import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function AdminLoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) throw error;

            router.push('/admin/dashboard');
            router.refresh();
        } catch (error: unknown) {
            setError(error instanceof Error ? error.message : 'An error occurred during login');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-white relative overflow-hidden flex items-center justify-center p-6">
            {/* Background Grid Protocol */}
            <div className="absolute inset-0 z-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(#000 1.5px, transparent 0)', backgroundSize: '32px 32px' }}></div>

            <div className="w-full max-w-md relative z-10">
                <div className="brutalist-card bg-white p-12 border-neutral-900 shadow-[16px_16px_0px_0px_rgba(0,0,0,1)]">
                    <div className="text-center mb-12">
                        <div className="inline-block px-4 py-1.5 bg-neutral-900 text-white text-[10px] font-black uppercase tracking-[0.4em] mb-8">
                            SECURE ACCESS PROTOCOL
                        </div>
                        <h1 className="text-5xl font-black tracking-tighter text-neutral-900 uppercase leading-none">
                            Tech<span className="text-primary-400">Nest</span>
                        </h1>
                        <p className="text-[11px] font-black text-neutral-400 uppercase tracking-[0.4em] mt-4 italic">Management Studio 2.0</p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-8">
                        {error && (
                            <div className="bg-red-400 border-[3px] border-neutral-900 text-neutral-900 px-6 py-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-[10px] font-black uppercase tracking-widest leading-relaxed">
                                ERROR: {error}
                            </div>
                        )}

                        <div className="space-y-3">
                            <label htmlFor="email" className="block text-[10px] font-black uppercase tracking-widest text-neutral-400">Tactical Identifier (Email)</label>
                            <input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="brutalist-input h-14"
                                placeholder="PROTOCOLID@NEST.CO"
                            />
                        </div>

                        <div className="space-y-3">
                            <label htmlFor="password" title="Access Key" className="block text-[10px] font-black uppercase tracking-widest text-neutral-400">Authorization Key</label>
                            <input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="brutalist-input h-14"
                                placeholder="••••••••"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="brutalist-button-primary h-16 w-full shadow-[8px_8px_0px_0px_rgba(0,0,0,0.1)]"
                        >
                            {loading ? 'SYNCHRONIZING...' : 'INITIALIZE SESSION'}
                        </button>
                    </form>

                    <div className="mt-12 pt-8 border-t-[3px] border-neutral-900 flex justify-between items-center text-[9px] font-black text-neutral-300 uppercase tracking-widest">
                        <span>SYS_STATUS: READY</span>
                        <span>v2.0.4.6_STABLE</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
