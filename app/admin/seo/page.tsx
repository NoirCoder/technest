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
            <div className="flex flex-col items-center justify-center h-[50vh] space-y-6">
                <div className="w-12 h-12 border-[4px] border-neutral-100 border-t-neutral-900 rounded-none animate-spin shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"></div>
                <p className="text-neutral-400 font-black text-[10px] uppercase tracking-[0.4em] animate-pulse">Syncing Global Intelligence Protocols...</p>
            </div>
        );
    }

    return (
        <div className="space-y-16 max-w-6xl">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-12 border-b-[4px] border-neutral-900 pb-16">
                <div>
                    <div className="flex items-center gap-3 mb-6">
                        <Globe2 className="w-4 h-4 text-neutral-900" />
                        <span className="text-[11px] font-black uppercase tracking-[0.4em] text-neutral-400">Global Search Intelligence</span>
                    </div>
                    <h1 className="text-6xl font-black tracking-tighter text-neutral-900 uppercase leading-none mb-4">Command Center</h1>
                    <p className="text-lg font-bold text-neutral-400 uppercase tracking-widest">Calibrate global visibility and indexing protocols.</p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="brutalist-button-primary h-16 px-10"
                >
                    {saving ? <Loader2 className="w-5 h-5 animate-spin mr-3" /> : <Save className="w-5 h-5 mr-3" />}
                    BROADCAST GLOBALLY
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                {/* Site Identity */}
                <div className="brutalist-card bg-white p-12 border-neutral-900 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] space-y-12">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-neutral-900 flex items-center justify-center text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)]">
                            <SettingsIcon className="w-6 h-6 text-primary-400" />
                        </div>
                        <h3 className="text-2xl font-black text-neutral-900 uppercase tracking-tighter">Core Architecture</h3>
                    </div>

                    <div className="space-y-8">
                        <div className="space-y-3">
                            <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Public Site Identity</label>
                            <input
                                type="text"
                                value={settings.site_title}
                                onChange={e => setSettings({ ...settings, site_title: e.target.value })}
                                className="brutalist-input h-14"
                            />
                        </div>

                        <div className="space-y-3">
                            <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Baseline Abstract</label>
                            <textarea
                                value={settings.site_description}
                                onChange={e => setSettings({ ...settings, site_description: e.target.value })}
                                rows={4}
                                className="brutalist-input p-5 resize-none leading-relaxed font-bold"
                            />
                        </div>

                        <div className="space-y-3">
                            <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Canonical Resource URI</label>
                            <div className="relative">
                                <Globe className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-900" />
                                <input
                                    type="url"
                                    value={settings.site_url}
                                    onChange={e => setSettings({ ...settings, site_url: e.target.value })}
                                    className="brutalist-input h-14 pl-14 font-mono lowercase"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Indexing Intelligence */}
                <div className="bg-neutral-900 border-[4px] border-neutral-900 p-12 text-white space-y-12 shadow-[12px_12px_0px_0px_rgba(0,0,0,0.1)] relative">
                    <div className="flex items-center gap-4 relative z-10">
                        <div className="w-12 h-12 bg-white/5 border-[1.5px] border-white/10 flex items-center justify-center text-white">
                            <ShieldCheck className="w-6 h-6 text-primary-400" />
                        </div>
                        <h3 className="text-2xl font-black text-white uppercase tracking-tighter">Indexing Engine</h3>
                    </div>

                    <div className="space-y-10 relative z-10">
                        <label className="flex items-center justify-between p-8 bg-white/5 border-[2px] border-white/10 cursor-pointer hover:bg-white/[0.08] transition-all group shadow-[4px_4px_0px_0px_rgba(255,255,255,0.05)]">
                            <div className="space-y-1">
                                <span className="text-[11px] font-black uppercase tracking-widest text-white">Global Search Indexing</span>
                                <p className="text-[9px] font-black text-neutral-500 uppercase tracking-[0.3em]">MASTER SWITCH: ACTIVE_INDEX</p>
                            </div>
                            <div className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={settings.indexing_active}
                                    onChange={e => setSettings({ ...settings, indexing_active: e.target.checked })}
                                    className="sr-only peer"
                                />
                                <div className="w-12 h-7 bg-white/10 border-[2px] border-white/20 peer-focus:outline-none peer-checked:bg-primary-400 transition-colors after:content-[''] after:absolute after:top-[5px] after:left-[5px] after:bg-white after:h-3.5 after:w-3.5 after:transition-all peer-checked:after:translate-x-5 peer-checked:after:bg-neutral-900 peer-checked:after:border-neutral-900"></div>
                            </div>
                        </label>

                        <div className="space-y-3">
                            <label className="text-[10px] font-black uppercase tracking-widest text-neutral-500">Presentation Template</label>
                            <input
                                type="text"
                                value={settings.meta_title_template}
                                onChange={e => setSettings({ ...settings, meta_title_template: e.target.value })}
                                className="w-full h-14 px-5 bg-white/5 border-[2px] border-white/10 focus:bg-white focus:text-neutral-900 transition-all text-sm font-black text-white outline-none"
                                placeholder="%TITLE% | TECHNEST"
                            />
                        </div>

                        <div className="pt-10 border-t border-white/10 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-3 h-3 bg-primary-400 shadow-[0_0_15px_rgba(250,204,21,0.5)] animate-pulse" />
                                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-neutral-500">METADATA SYNC: OK</span>
                            </div>
                            <button className="brutalist-button h-10 px-6 bg-white/[0.05] border-white/10 text-white hover:bg-white hover:text-neutral-900 text-[9px] font-black tracking-widest uppercase">
                                RE-SYNC XML
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Strategic Analytics Interface */}
            <div className="brutalist-card bg-white p-12 border-neutral-900 space-y-12 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-neutral-100 border-[2px] border-neutral-900 flex items-center justify-center text-neutral-900 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                        <Activity className="w-6 h-6" />
                    </div>
                    <h3 className="text-2xl font-black text-neutral-900 uppercase tracking-tighter">Strategic Intelligence</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                    <div className="space-y-3">
                        <p className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Google G-Analytics Protocol</p>
                        <input
                            type="text"
                            value={settings.google_analytics_id}
                            onChange={e => setSettings({ ...settings, google_analytics_id: e.target.value })}
                            className="brutalist-input h-14 font-mono uppercase"
                            placeholder="G-XXXXXXX"
                        />
                    </div>
                    <div className="space-y-3">
                        <p className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Sitemap Refresh Frequency</p>
                        <select
                            value={settings.sitemap_frequency}
                            onChange={e => setSettings({ ...settings, sitemap_frequency: e.target.value })}
                            className="brutalist-input h-14 appearance-none cursor-pointer"
                        >
                            <option value="daily">PROTOCOL: DAILY SCAN</option>
                            <option value="weekly">PROTOCOL: WEEKLY SCAN</option>
                            <option value="monthly">PROTOCOL: MONTHLY SCAN</option>
                        </select>
                    </div>
                    <div className="bg-primary-50 border-[3px] border-neutral-900 p-8 flex items-center gap-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
                        <TrendingUp className="w-10 h-10 text-neutral-900 shrink-0 italic" />
                        <div>
                            <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-1">Status</p>
                            <h4 className="text-lg font-black text-neutral-900 uppercase italic leading-none">Protocols Locked</h4>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
