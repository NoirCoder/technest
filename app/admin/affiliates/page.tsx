'use client';

import { supabase } from '@/lib/supabase';
import { useEffect, useState } from 'react';
import {
    Plus,
    Search,
    Zap,
    ExternalLink,
    Copy,
    Trash2,
    Edit2,
    Link as LinkIcon,
    DollarSign,
    MousePointer2,
    ShieldCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface Affiliate {
    id: string;
    name: string;
    base_url: string;
    affiliate_code: string;
    description: string;
    created_at: string;
}

export default function AffiliatesPage() {
    const [affiliates, setAffiliates] = useState<Affiliate[]>([]);
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [formData, setFormData] = useState({
        name: '',
        base_url: '',
        affiliate_code: '',
        description: '',
    });

    useEffect(() => {
        fetchAffiliates();
    }, []);

    const fetchAffiliates = async () => {
        try {
            const { data, error } = await supabase
                .from('affiliates')
                .select('*')
                .order('name');

            if (error) {
                if (error.code === 'PGRST116') {
                    // Table might not exist yet
                    console.warn('Affiliates table not found. Please run the SQL migration.');
                }
                throw error;
            }
            if (data) setAffiliates(data);
        } catch (error) {
            console.error('Error fetching affiliates:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);

        try {
            if (editingId) {
                const { error } = await supabase
                    .from('affiliates')
                    .update(formData)
                    .eq('id', editingId);
                if (error) throw error;
            } else {
                const { error } = await supabase
                    .from('affiliates')
                    .insert(formData);
                if (error) throw error;
            }

            setFormData({ name: '', base_url: '', affiliate_code: '', description: '' });
            setEditingId(null);
            fetchAffiliates();
        } catch (error: any) {
            alert('Error saving partner: ' + error.message);
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to terminate this affiliate partnership?')) return;
        const { error } = await supabase.from('affiliates').delete().eq('id', id);
        if (!error) setAffiliates(affiliates.filter(a => a.id !== id));
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        // Could add a toast here
    };

    const filteredAffiliates = affiliates.filter(a =>
        a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.base_url.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-[50vh] space-y-4">
                <Loader2 className="w-8 h-8 animate-spin text-neutral-200" />
                <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest animate-pulse">Syncing Partners...</p>
            </div>
        );
    }

    return (
        <div className="space-y-12">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 border-b border-neutral-100 pb-10">
                <div>
                    <div className="flex items-center gap-2 mb-3">
                        <DollarSign className="w-4 h-4 text-neutral-400" />
                        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-400">Monetization Hub</span>
                    </div>
                    <h1 className="text-4xl font-bold tracking-tight text-neutral-900 mb-2">Affiliate Manager</h1>
                    <p className="text-neutral-500 font-medium">Coordinate partnerships and optimize your referral pipeline.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
                {/* Form Module */}
                <div className="lg:col-span-4 sticky top-6">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white rounded-[2rem] border border-neutral-100 p-8 shadow-sm"
                    >
                        <div className="flex items-center gap-3 mb-8">
                            <div className="p-2.5 bg-[#09090B] rounded-xl text-white">
                                <Zap className="w-4 h-4" />
                            </div>
                            <h2 className="font-bold text-neutral-900 tracking-tight">Partner Definition</h2>
                        </div>

                        <form onSubmit={handleSave} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">Partner Name</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    required
                                    className="w-full px-4 py-3.5 bg-neutral-50 rounded-xl border border-transparent focus:bg-white focus:border-neutral-200 transition-all text-xs font-bold text-neutral-900 outline-none shadow-inner"
                                    placeholder="e.g. Amazon, Keychron"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">Base Tracking URL</label>
                                <div className="relative group">
                                    <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-300" />
                                    <input
                                        type="url"
                                        value={formData.base_url}
                                        onChange={(e) => setFormData({ ...formData, base_url: e.target.value })}
                                        required
                                        className="w-full pl-10 pr-4 py-3.5 bg-neutral-50 rounded-xl border border-transparent focus:bg-white focus:border-neutral-200 transition-all text-xs font-mono text-neutral-500 outline-none shadow-inner"
                                        placeholder="https://amzn.to/..."
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">Affiliate Code (Optional)</label>
                                <input
                                    type="text"
                                    value={formData.affiliate_code}
                                    onChange={(e) => setFormData({ ...formData, affiliate_code: e.target.value })}
                                    className="w-full px-4 py-3.5 bg-neutral-50 rounded-xl border border-transparent focus:bg-white focus:border-neutral-200 transition-all text-xs font-mono text-neutral-500 outline-none shadow-inner"
                                    placeholder="TRACKING-ID-2026"
                                />
                            </div>

                            <div className="space-y-2 text-center py-4 bg-primary-50/30 rounded-2xl border border-dashed border-primary-100">
                                <p className="text-[9px] font-bold text-primary-600 uppercase tracking-widest mb-1">In-Post Shortcode</p>
                                <p className="text-xs font-mono text-neutral-900">{`[[affiliate:${formData.name || 'id'}]]`}</p>
                            </div>

                            <button
                                type="submit"
                                disabled={isSaving}
                                className="w-full h-12 rounded-xl bg-[#09090B] text-white hover:bg-neutral-800 font-bold text-sm transition-all shadow-xl shadow-neutral-100 disabled:opacity-50"
                            >
                                {isSaving ? <Loader2 className="w-4 h-4 animate-spin text-white" /> : (editingId ? 'Update Partner' : 'Onboard Partner')}
                            </button>
                        </form>
                    </motion.div>
                </div>

                {/* List Module */}
                <div className="lg:col-span-8 space-y-8">
                    <div className="relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-neutral-300 group-focus-within:text-neutral-900 transition-colors" />
                        <input
                            type="text"
                            placeholder="Filter 2026 partner network..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-12 pr-4 py-4 bg-white rounded-2xl border border-neutral-100 focus:ring-4 focus:ring-neutral-50 transition-all text-sm font-medium outline-none"
                        />
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                        <AnimatePresence mode="popLayout">
                            {filteredAffiliates.map((affiliate) => (
                                <motion.div
                                    layout
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    key={affiliate.id}
                                    className="group bg-white p-6 rounded-[1.5rem] border border-neutral-100 hover:border-neutral-200 hover:shadow-xl hover:shadow-neutral-100/50 transition-all flex flex-col md:flex-row items-center justify-between gap-6"
                                >
                                    <div className="flex items-center gap-6 flex-1 w-full">
                                        <div className="w-14 h-14 bg-neutral-50 rounded-2xl flex items-center justify-center text-neutral-400 group-hover:bg-[#09090B] group-hover:text-white transition-all shrink-0">
                                            <ShieldCheck className="w-6 h-6" />
                                        </div>
                                        <div className="min-w-0">
                                            <h4 className="text-lg font-bold text-neutral-900 group-hover:text-primary-700 transition-colors">{affiliate.name}</h4>
                                            <p className="text-[10px] font-mono text-neutral-300 truncate max-w-xs">{affiliate.base_url}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <div className="px-4 py-1.5 bg-neutral-50 rounded-xl text-[10px] font-bold text-neutral-500 uppercase tracking-widest border border-neutral-100">
                                            {affiliate.affiliate_code || 'Direct Link'}
                                        </div>
                                        <button
                                            onClick={() => copyToClipboard(affiliate.base_url)}
                                            className="p-3 bg-neutral-50 text-neutral-400 hover:text-neutral-900 rounded-xl transition-all"
                                            title="Copy Tracking Link"
                                        >
                                            <Copy className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => setEditingId(affiliate.id)}
                                            className="p-3 bg-neutral-50 text-neutral-400 hover:text-primary-600 rounded-xl transition-all"
                                        >
                                            <Edit2 className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(affiliate.id)}
                                            className="p-3 bg-neutral-50 text-neutral-400 hover:text-red-600 rounded-xl transition-all"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>

                    {filteredAffiliates.length === 0 && (
                        <div className="py-32 text-center bg-white rounded-[3rem] border-2 border-dashed border-neutral-100">
                            <Zap className="w-12 h-12 text-neutral-100 mx-auto mb-4" />
                            <h3 className="text-xl font-bold text-neutral-900 mb-2 font-serif italic">Partner Network Offline</h3>
                            <p className="text-neutral-400 font-medium max-w-xs mx-auto">No affiliates detected. Onboard your first partner to begin monetization tracking.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function Loader2({ className }: { className?: string }) {
    return (
        <svg className={cn("animate-spin", className)} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
    );
}
