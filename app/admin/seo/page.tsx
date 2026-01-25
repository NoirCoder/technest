'use client';

import { supabase } from '@/lib/supabase';
import { useEffect, useState } from 'react';
import {
    Search,
    Globe,
    Settings as SettingsIcon,
    ShieldCheck,
    Zap,
    TrendingUp,
    FileCode,
    Activity,
    Save,
    RotateCcw,
    Loader2,
    Eye,
    Globe2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface Setting {
    key: string;
    value: any;
}

export default function SEOPage() {
    const [settings, setSettings] = useState<Record<string, any>>({
        site_title: 'TechNest',
        site_description: 'Professional tech reviews for 2026.',
        site_url: 'https://technest-sigma.vercel.app',
        google_analytics_id: '',
        meta_title_template: '%title% | TechNest',
        indexing_active: true,
        sitemap_frequency: 'weekly'
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const { data, error } = await supabase.from('settings').select('*');
            if (error) throw error;

            if (data && data.length > 0) {
                const mapped = data.reduce((acc, curr) => ({ ...acc, [curr.key]: curr.value }), {});
                setSettings(prev => ({ ...prev, ...mapped }));
            }
        } catch (error) {
            console.error('Error fetching settings:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const updates = Object.entries(settings).map(([key, value]) => ({
                key,
                value,
                updated_at: new Date().toISOString()
            }));

            const { error } = await supabase.from('settings').upsert(updates);
            if (error) throw error;

            alert('Global settings synchronized.');
        } catch (error) {
            alert('Error synchronizing settings. Ensure "settings" table exists in Supabase.');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-[50vh] space-y-4">
                <Loader2 className="w-8 h-8 animate-spin text-neutral-200" />
                <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest animate-pulse">Syncing Protocols...</p>
            </div>
        );
    }

    return (
        <div className="space-y-12 max-w-5xl">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 border-b border-neutral-100 pb-10">
                <div>
                    <div className="flex items-center gap-2 mb-3">
                        <Globe2 className="w-4 h-4 text-neutral-400" />
                        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-400">Growth Engine</span>
                    </div>
                    <h1 className="text-4xl font-bold tracking-tight text-neutral-900 mb-2">Global SEO & Search</h1>
                    <p className="text-neutral-500 font-medium">Calibrate your search visibility and indexing intelligence.</p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="h-12 px-8 rounded-xl bg-[#09090B] text-white hover:bg-neutral-800 font-bold text-sm transition-all flex items-center gap-2 shadow-xl shadow-neutral-100 disabled:opacity-50"
                >
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    Broadcast Settings
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Site Identity */}
                <div className="bg-white rounded-[2rem] border border-neutral-100 p-10 shadow-sm space-y-10">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-neutral-900 rounded-xl text-white shadow-lg">
                            <SettingsIcon className="w-4 h-4" />
                        </div>
                        <h3 className="font-bold text-neutral-900 tracking-tight">Core Architecture</h3>
                    </div>

                    <div className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">Public Site Title</label>
                            <input
                                type="text"
                                value={settings.site_title}
                                onChange={e => setSettings({ ...settings, site_title: e.target.value })}
                                className="w-full px-5 py-4 bg-neutral-50 rounded-2xl border border-transparent focus:bg-white focus:border-neutral-200 transition-all text-sm font-bold text-neutral-900 outline-none shadow-inner"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">Baseline Description</label>
                            <textarea
                                value={settings.site_description}
                                onChange={e => setSettings({ ...settings, site_description: e.target.value })}
                                rows={3}
                                className="w-full px-5 py-4 bg-neutral-50 rounded-2xl border border-transparent focus:bg-white focus:border-neutral-200 transition-all text-sm text-neutral-600 outline-none shadow-inner resize-none leading-relaxed"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">Canonical Base URL</label>
                            <div className="relative">
                                <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-300" />
                                <input
                                    type="url"
                                    value={settings.site_url}
                                    onChange={e => setSettings({ ...settings, site_url: e.target.value })}
                                    className="w-full pl-12 pr-5 py-4 bg-neutral-50 rounded-2xl border border-transparent focus:bg-white focus:border-neutral-200 transition-all text-sm font-mono text-neutral-500 outline-none shadow-inner"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Indexing Intelligence */}
                <div className="bg-[#09090B] rounded-[2rem] p-10 text-white space-y-10 shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary-600/10 blur-[96px] rounded-full" />

                    <div className="flex items-center gap-3 relative z-10">
                        <div className="p-2.5 bg-white/5 rounded-xl text-white border border-white/10">
                            <ShieldCheck className="w-4 h-4 text-primary-400" />
                        </div>
                        <h3 className="font-bold text-white tracking-tight">Indexing Engine</h3>
                    </div>

                    <div className="space-y-8 relative z-10">
                        <label className="flex items-center justify-between p-6 bg-white/5 border border-white/5 rounded-2xl cursor-pointer hover:bg-white/10 transition-all group">
                            <div className="space-y-1">
                                <span className="text-sm font-bold text-white">Global Search Indexing</span>
                                <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">Master Switch (INDEX/NOINDEX)</p>
                            </div>
                            <div className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={settings.indexing_active}
                                    onChange={e => setSettings({ ...settings, indexing_active: e.target.checked })}
                                    className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-white/10 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-[#09090B] after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500"></div>
                            </div>
                        </label>

                        <div className="space-y-2">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-500">Title Presentation Template</label>
                            <input
                                type="text"
                                value={settings.meta_title_template}
                                onChange={e => setSettings({ ...settings, meta_title_template: e.target.value })}
                                className="w-full px-5 py-4 bg-white/5 rounded-2xl border border-white/5 focus:bg-white focus:text-neutral-900 transition-all text-sm font-bold text-white outline-none"
                                placeholder="%title% | TechNest"
                            />
                        </div>

                        <div className="pt-6 border-t border-white/5 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-2 h-2 rounded-full bg-primary-500 animate-pulse" />
                                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-400">Robots.txt Integrated</span>
                            </div>
                            <button className="text-[10px] font-bold text-white hover:text-primary-400 transition-colors uppercase tracking-widest border border-white/10 px-4 py-1.5 rounded-lg bg-white/5">
                                Re-sync XML
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Strategic Analytics Interface */}
            <div className="bg-white rounded-[2rem] border border-neutral-100 p-10 shadow-sm space-y-10">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-neutral-50 rounded-xl text-neutral-900 border border-neutral-100">
                        <Activity className="w-4 h-4" />
                    </div>
                    <h3 className="font-bold text-neutral-900 tracking-tight">Intelligence Integration</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="space-y-2">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">Google G-Analytics</p>
                        <input
                            type="text"
                            value={settings.google_analytics_id}
                            onChange={e => setSettings({ ...settings, google_analytics_id: e.target.value })}
                            className="w-full px-5 py-4 bg-neutral-50 rounded-2xl border border-transparent focus:bg-white focus:border-neutral-200 transition-all text-xs font-mono text-neutral-500 outline-none shadow-inner"
                            placeholder="G-XXXXXXX"
                        />
                    </div>
                    <div className="space-y-2">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">Sitemap Protocol</p>
                        <select
                            value={settings.sitemap_frequency}
                            onChange={e => setSettings({ ...settings, sitemap_frequency: e.target.value })}
                            className="w-full px-5 py-4 bg-neutral-50 rounded-2xl border border-transparent focus:bg-white focus:border-neutral-200 transition-all text-[11px] font-bold text-neutral-900 outline-none shadow-inner"
                        >
                            <option value="daily">Scan: Daily</option>
                            <option value="weekly">Scan: Weekly</option>
                            <option value="monthly">Scan: Monthly</option>
                        </select>
                    </div>
                    <div className="bg-primary-50 rounded-2xl p-6 flex items-center gap-4">
                        <TrendingUp className="w-8 h-8 text-primary-600 shrink-0" />
                        <div>
                            <p className="text-[10px] font-bold text-primary-600 uppercase tracking-widest mb-1">Status</p>
                            <h4 className="text-sm font-bold text-neutral-900">Protocols Active</h4>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
