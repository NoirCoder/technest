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
            <div className="flex flex-col items-center justify-center h-[50vh] space-y-6">
                <div className="w-12 h-12 border-[4px] border-neutral-100 border-t-neutral-900 rounded-none animate-spin shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"></div>
                <p className="text-neutral-400 font-black text-[10px] uppercase tracking-[0.4em] animate-pulse">Synchronizing Partner Network...</p>
            </div>
        );
    }

    return (
        <div className="space-y-16">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-12 border-b-[4px] border-neutral-900 pb-16">
                <div>
                    <div className="flex items-center gap-3 mb-6">
                        <DollarSign className="w-4 h-4 text-neutral-900" />
                        <span className="text-[11px] font-black uppercase tracking-[0.4em] text-neutral-400">Monetization Control Hub</span>
                    </div>
                    <h1 className="text-6xl font-black tracking-tighter text-neutral-900 uppercase leading-none mb-4">The Bridge</h1>
                    <p className="text-lg font-bold text-neutral-400 uppercase tracking-widest">Coordinate and optimize the referral pipeline.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
                {/* Form Module */}
                <div className="lg:col-span-4 sticky top-12">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="brutalist-card bg-white p-10 border-neutral-900 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]"
                    >
                        <div className="flex items-center gap-4 mb-10">
                            <div className="w-12 h-12 bg-neutral-900 flex items-center justify-center text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)]">
                                <Zap className="w-6 h-6 text-primary-400" />
                            </div>
                            <h2 className="text-xl font-black text-neutral-900 uppercase tracking-tighter">Partner Definition</h2>
                        </div>

                        <form onSubmit={handleSave} className="space-y-8">
                            <div className="space-y-3">
                                <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Tactical Partner Name</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    required
                                    className="brutalist-input h-14"
                                    placeholder="ETERNAL ASSET..."
                                />
                            </div>

                            <div className="space-y-3">
                                <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Base Tracking URI</label>
                                <div className="relative group">
                                    <LinkIcon className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-900 group-focus-within:text-primary-400 transition-colors" />
                                    <input
                                        type="url"
                                        value={formData.base_url}
                                        onChange={(e) => setFormData({ ...formData, base_url: e.target.value })}
                                        required
                                        className="brutalist-input h-14 pl-14 font-mono lowercase"
                                        placeholder="https://referral.io/..."
                                    />
                                </div>
                            </div>

                            <div className="space-y-3">
                                <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Tactical Affiliate Code</label>
                                <input
                                    type="text"
                                    value={formData.affiliate_code}
                                    onChange={(e) => setFormData({ ...formData, affiliate_code: e.target.value })}
                                    className="brutalist-input h-14 font-mono text-neutral-500"
                                    placeholder="TRACK-ID-00X"
                                />
                            </div>

                            <div className="p-6 bg-neutral-900 text-white border-[3px] border-neutral-900 shadow-[6px_6px_0px_0px_rgba(0,0,0,0.1)]">
                                <p className="text-[9px] font-black text-primary-400 uppercase tracking-widest mb-3">Live Shortcode Protocol</p>
                                <div className="p-3 bg-white/5 border border-white/10 text-center">
                                    <p className="text-xs font-mono font-black">{`[[affiliate:${formData.name || 'ID'}]]`}</p>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={isSaving}
                                className="brutalist-button-primary h-14 w-full"
                            >
                                {isSaving ? <Loader2 className="w-5 h-5 animate-spin mr-3" /> : (editingId ? 'COMMIT REVISION' : 'INITIALIZE PARTNER')}
                            </button>
                        </form>
                    </motion.div>
                </div>

                {/* List Module */}
                <div className="lg:col-span-8 space-y-12">
                    <div className="relative group brutalist-card border-neutral-900">
                        <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-neutral-900" />
                        <input
                            type="text"
                            placeholder="FILTER PARTNER NETWORK..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-16 pr-8 py-5 bg-transparent border-none focus:ring-0 text-[11px] font-black uppercase tracking-[0.3em] outline-none placeholder:text-neutral-300"
                        />
                    </div>

                    <div className="grid grid-cols-1 gap-6">
                        <AnimatePresence mode="popLayout">
                            {filteredAffiliates.map((affiliate) => (
                                <motion.div
                                    layout
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    key={affiliate.id}
                                    className="group brutalist-card bg-white p-8 border-neutral-900 hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all flex flex-col md:flex-row items-center justify-between gap-8"
                                >
                                    <div className="flex items-center gap-8 flex-1 w-full">
                                        <div className="w-16 h-16 bg-neutral-900 border-[3px] border-neutral-900 flex items-center justify-center text-primary-400 shadow-[6px_6px_0px_0px_rgba(0,0,0,0.2)] group-hover:rotate-6 transition-all shrink-0">
                                            <ShieldCheck className="w-8 h-8" />
                                        </div>
                                        <div className="min-w-0">
                                            <h4 className="text-2xl font-black text-neutral-900 uppercase tracking-tighter group-hover:text-primary-500 transition-colors leading-none mb-2">{affiliate.name}</h4>
                                            <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest truncate max-w-sm italic">{affiliate.base_url}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <div className="px-5 py-2 bg-neutral-100 border-[2px] border-neutral-900 text-[10px] font-black text-neutral-900 uppercase tracking-widest">
                                            {affiliate.affiliate_code || 'DIRECT_LINK'}
                                        </div>
                                        <button
                                            onClick={() => copyToClipboard(affiliate.base_url)}
                                            className="p-3 bg-white border-[2px] border-neutral-900 text-neutral-900 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
                                            title="Copy Tracking Link"
                                        >
                                            <Copy className="w-5 h-5" />
                                        </button>
                                        <button
                                            onClick={() => {
                                                setEditingId(affiliate.id);
                                                setFormData({
                                                    name: affiliate.name,
                                                    base_url: affiliate.base_url,
                                                    affiliate_code: affiliate.affiliate_code || '',
                                                    description: affiliate.description || '',
                                                });
                                            }}
                                            className="p-3 bg-white border-[2px] border-neutral-900 text-neutral-900 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
                                        >
                                            <Edit2 className="w-5 h-5" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(affiliate.id)}
                                            className="p-3 bg-red-400 border-[2px] border-neutral-900 text-neutral-900 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>

                    {filteredAffiliates.length === 0 && (
                        <div className="brutalist-card py-40 text-center bg-neutral-50 grayscale opacity-40 border-dashed border-neutral-900">
                            <Zap className="w-16 h-16 text-neutral-900 mx-auto mb-10 rotate-6 bg-white p-3 border-[3px] border-neutral-900 shadow-[10px_10px_0px_0px_rgba(0,0,0,1)]" />
                            <h3 className="text-2xl font-black text-neutral-900 uppercase tracking-tighter mb-4 italic">Network Bridge Offline</h3>
                            <p className="text-[11px] font-black uppercase tracking-[0.4em] text-neutral-400 max-w-sm mx-auto">No partners detected for current registry module. Adjust filters or initialize new onboardings.</p>
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
