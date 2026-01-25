'use client';

import { motion } from 'framer-motion';
import {
    Search,
    Share2,
    AlertCircle,
    CheckCircle2,
    Info,
    BarChart,
    ChevronDown,
    Globe,
    Zap,
    Sparkles,
    Loader2
} from 'lucide-react';
import { generateSEOContent } from '@/lib/gemini';
import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';

interface SEOSidebarProps {
    formData: {
        title: string;
        slug: string;
        meta_title: string;
        meta_description: string;
        excerpt: string;
        content: string;
    };
    onChange: (updates: any) => void;
}

export default function SEOSidebar({ formData, onChange }: SEOSidebarProps) {
    const [error, setError] = useState<string | null>(null);
    const [score, setScore] = useState(0);
    const [loading, setLoading] = useState(false);

    // Basic SEO Scoring Logic
    useEffect(() => {
        let total = 0;
        if (formData.meta_title.length >= 30 && formData.meta_title.length <= 60) total += 25;
        if (formData.meta_description.length >= 120 && formData.meta_description.length <= 160) total += 25;
        if (formData.slug.length > 5) total += 25;
        if (formData.excerpt.length > 50) total += 25;
        setScore(total);
    }, [formData]);

    const handleAIGenerate = async () => {
        if (!formData.content || formData.content.length < 100) {
            setError("Draft needs more content (min 100 chars) for tactical AI analysis.");
            return;
        }

        setLoading(true);
        setError(null);
        try {
            const result = await generateSEOContent(formData.content);
            if (result.success && result.data) {
                onChange({
                    meta_title: result.data.title,
                    meta_description: result.data.description,
                    excerpt: result.data.excerpt
                });
            } else {
                setError(result.error || "Tactical bypass failed.");
            }
        } catch (err: any) {
            setError("Failed to connect to Gemini AI Satellite.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-10">
            {/* SEO Health Card */}
            <div className="bg-neutral-900 border-[4px] border-neutral-900 p-10 text-white relative shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]">
                <div className="relative z-10 flex flex-col gap-10">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-neutral-500 mb-2">Telemetry Analysis</p>
                            <div className={cn(
                                "inline-block px-3 py-1 border-[1.5px] text-[9px] font-black uppercase tracking-widest",
                                score > 70 ? "bg-green-500/20 text-green-400 border-green-500/40" : "bg-primary-400/20 text-primary-400 border-primary-400/40"
                            )}>
                                {score > 70 ? 'STABLE' : 'AUDIT REQUIRED'}
                            </div>
                        </div>
                        <BarChart className="w-5 h-5 text-neutral-500" />
                    </div>

                    <div className="space-y-6">
                        <div className="flex flex-col gap-2">
                            <span className="text-[10px] font-black text-neutral-500 uppercase tracking-widest">Global Intelligence Rank</span>
                            <h3 className="text-7xl font-black tracking-tighter italic leading-none">{score}%</h3>
                        </div>
                        <div className="h-2.5 bg-white/5 border-[1.5px] border-white/10 overflow-hidden p-0.5">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${score}%` }}
                                className={cn("h-full transition-colors", score > 70 ? "bg-green-500" : "bg-primary-400")}
                            />
                        </div>
                    </div>

                    <button
                        onClick={handleAIGenerate}
                        disabled={loading}
                        className="brutalist-button-primary w-full h-16 bg-white text-neutral-900 shadow-[6px_6px_0px_0px_rgba(255,255,255,0.1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px]"
                    >
                        <div className="flex items-center justify-center gap-3">
                            {loading ? <Loader2 className="w-5 h-5 animate-spin text-neutral-900" /> : <Sparkles className="w-5 h-5 text-neutral-900" />}
                            <span className="text-[11px] font-black tracking-widest">INITIALIZE GEMINI SEO</span>
                        </div>
                    </button>

                    {error && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="p-6 bg-red-400 border-[3px] border-neutral-900 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-neutral-900"
                        >
                            <div className="flex items-start gap-3 mb-3">
                                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                                <span className="text-[10px] font-black uppercase tracking-widest">Diagnostic Telemetry:</span>
                            </div>
                            <textarea
                                readOnly
                                value={error}
                                className="w-full bg-white/20 border-none outline-none text-[9px] font-mono leading-relaxed p-3 h-32 resize-none select-all"
                            />
                            <p className="mt-3 text-[8px] font-black uppercase tracking-tighter opacity-60 italic">Select text above to copy for support review</p>
                        </motion.div>
                    )}
                </div>
            </div>

            {/* Strategic Metadata */}
            <div className="brutalist-card p-10 bg-white border-neutral-900 space-y-10">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-neutral-900 flex items-center justify-center text-white shadow-[3px_3px_0px_0px_rgba(0,0,0,0.1)]">
                        <Search className="w-5 h-5 text-primary-400" />
                    </div>
                    <h3 className="text-xl font-black text-neutral-900 uppercase tracking-tighter">Strategic Metadata</h3>
                </div>

                <div className="space-y-8">
                    <div className="space-y-3">
                        <div className="flex justify-between items-center">
                            <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Search Protocol Title</label>
                            <span className={cn("text-[9px] font-black", formData.meta_title.length > 60 ? "text-red-500" : "text-neutral-300")}>
                                {formData.meta_title.length}/60
                            </span>
                        </div>
                        <input
                            type="text"
                            value={formData.meta_title}
                            onChange={(e) => onChange({ meta_title: e.target.value })}
                            className="brutalist-input h-14"
                            placeholder="PRIMARY HEADLINE..."
                        />
                    </div>

                    <div className="space-y-3">
                        <div className="flex justify-between items-center">
                            <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Search Intel Snippet</label>
                            <span className={cn("text-[9px] font-black", formData.meta_description.length > 160 ? "text-red-500" : "text-neutral-300")}>
                                {formData.meta_description.length}/160
                            </span>
                        </div>
                        <textarea
                            value={formData.meta_description}
                            onChange={(e) => onChange({ meta_description: e.target.value })}
                            rows={5}
                            className="brutalist-input p-5 resize-none leading-relaxed"
                            placeholder="META DESCRIPTION PROTOCOL..."
                        />
                    </div>

                    <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Resource URI</label>
                        <div className="relative">
                            <Globe className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-900" />
                            <input
                                type="text"
                                value={formData.slug}
                                onChange={(e) => onChange({ slug: e.target.value })}
                                className="brutalist-input h-14 pl-14 font-mono lowercase"
                                placeholder="entry-slug"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Social Intelligence */}
            <div className="brutalist-card p-10 bg-white border-neutral-900 space-y-8">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-neutral-100 border-[2px] border-neutral-900 flex items-center justify-center text-neutral-900 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
                        <Share2 className="w-5 h-5" />
                    </div>
                    <h3 className="text-xl font-black text-neutral-900 uppercase tracking-tighter">Validation</h3>
                </div>

                <div className="space-y-6">
                    {[
                        { label: 'Featured Image present', condition: formData.title !== '' },
                        { label: 'Optimal title length', condition: formData.meta_title.length >= 30 && formData.meta_title.length <= 60 },
                        { label: 'Compelling excerpt', condition: formData.excerpt.length > 50 },
                        { label: 'Canonical slug defined', condition: formData.slug.length > 3 },
                    ].map((check, idx) => (
                        <div key={idx} className="flex items-center gap-4">
                            <div className={cn(
                                "w-6 h-6 border-[2px] flex items-center justify-center transition-all",
                                check.condition ? "bg-green-500 border-neutral-900 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]" : "bg-neutral-50 border-neutral-200"
                            )}>
                                {check.condition && <CheckCircle2 className="w-3.5 h-3.5 text-neutral-900" />}
                            </div>
                            <span className={cn("text-[10px] font-black uppercase tracking-widest", check.condition ? "text-neutral-900" : "text-neutral-300")}>
                                {check.label}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
