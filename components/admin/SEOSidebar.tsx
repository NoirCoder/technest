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
    Zap
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';

interface SEOSidebarProps {
    formData: {
        title: string;
        slug: string;
        meta_title: string;
        meta_description: string;
        excerpt: string;
    };
    onChange: (updates: any) => void;
}

export default function SEOSidebar({ formData, onChange }: SEOSidebarProps) {
    const [score, setScore] = useState(0);

    // Basic SEO Scoring Logic
    useEffect(() => {
        let total = 0;
        if (formData.meta_title.length >= 30 && formData.meta_title.length <= 60) total += 25;
        if (formData.meta_description.length >= 120 && formData.meta_description.length <= 160) total += 25;
        if (formData.slug.length > 5) total += 25;
        if (formData.excerpt.length > 50) total += 25;
        setScore(total);
    }, [formData]);

    return (
        <div className="space-y-8">
            {/* SEO Health Card */}
            <div className="bg-[#09090B] rounded-[2rem] p-8 text-white relative overflow-hidden shadow-2xl">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary-600/20 blur-[64px] rounded-full" />

                <div className="relative z-10 flex flex-col gap-6">
                    <div className="flex justify-between items-center">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-500">Search Intelligence</p>
                        <div className={cn(
                            "px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest",
                            score > 70 ? "bg-green-500/20 text-green-400" : "bg-amber-500/20 text-amber-400"
                        )}>
                            {score > 70 ? 'Optimized' : 'Needs Review'}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <div className="flex justify-between items-baseline">
                            <h3 className="text-4xl font-bold tracking-tight">{score}%</h3>
                            <span className="text-xs font-bold text-neutral-400">SEO Score</span>
                        </div>
                        <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${score}%` }}
                                className={cn("h-full transition-colors", score > 70 ? "bg-green-500" : "bg-amber-500")}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Strategic Metadata */}
            <div className="bg-white rounded-[2rem] border border-neutral-100 p-8 shadow-sm space-y-8">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-neutral-50 rounded-lg text-neutral-900 border border-neutral-100">
                        <Search className="w-4 h-4" />
                    </div>
                    <h3 className="font-bold text-neutral-900 tracking-tight text-sm">Target Metadata</h3>
                </div>

                <div className="space-y-6">
                    <div className="space-y-2">
                        <div className="flex justify-between items-center">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">SEO Title</label>
                            <span className={cn("text-[9px] font-bold", formData.meta_title.length > 60 ? "text-red-500" : "text-neutral-300")}>
                                {formData.meta_title.length}/60
                            </span>
                        </div>
                        <input
                            type="text"
                            value={formData.meta_title}
                            onChange={(e) => onChange({ meta_title: e.target.value })}
                            className="w-full px-4 py-3 bg-neutral-50 rounded-xl border border-transparent focus:bg-white focus:border-neutral-200 transition-all text-xs font-bold text-neutral-900 outline-none shadow-inner"
                            placeholder="Primary search title..."
                        />
                    </div>

                    <div className="space-y-2">
                        <div className="flex justify-between items-center">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">Meta Description</label>
                            <span className={cn("text-[9px] font-bold", formData.meta_description.length > 160 ? "text-red-500" : "text-neutral-300")}>
                                {formData.meta_description.length}/160
                            </span>
                        </div>
                        <textarea
                            value={formData.meta_description}
                            onChange={(e) => onChange({ meta_description: e.target.value })}
                            rows={4}
                            className="w-full px-4 py-3 bg-neutral-50 rounded-xl border border-transparent focus:bg-white focus:border-neutral-200 transition-all text-xs text-neutral-600 outline-none shadow-inner resize-none leading-relaxed"
                            placeholder="Meta snippet for search result..."
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">System Slug</label>
                        <div className="relative group">
                            <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-300 group-focus-within:text-neutral-900 transition-all" />
                            <input
                                type="text"
                                value={formData.slug}
                                onChange={(e) => onChange({ slug: e.target.value })}
                                className="w-full pl-10 pr-4 py-3 bg-neutral-50 rounded-xl border border-transparent focus:bg-white focus:border-neutral-200 transition-all text-xs font-mono text-neutral-500 outline-none shadow-inner"
                                placeholder="publication-slug"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Social Intelligence */}
            <div className="bg-white rounded-[2rem] border border-neutral-100 p-8 shadow-sm space-y-6">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-neutral-50 rounded-lg text-neutral-900 border border-neutral-100">
                        <Share2 className="w-4 h-4" />
                    </div>
                    <h3 className="font-bold text-neutral-900 tracking-tight text-sm">Optimization Check</h3>
                </div>

                <div className="space-y-4">
                    {[
                        { label: 'Featured Image present', condition: formData.meta_title !== '' }, // Placeholder condition
                        { label: 'Optimal title length', condition: formData.meta_title.length >= 30 && formData.meta_title.length <= 60 },
                        { label: 'Compelling excerpt', condition: formData.excerpt.length > 50 },
                        { label: 'Canonical slug defined', condition: formData.slug.length > 3 },
                    ].map((check, idx) => (
                        <div key={idx} className="flex items-center gap-3">
                            {check.condition ? (
                                <CheckCircle2 className="w-4 h-4 text-green-500" />
                            ) : (
                                <AlertCircle className="w-4 h-4 text-neutral-200" />
                            )}
                            <span className={cn("text-xs font-medium", check.condition ? "text-neutral-900" : "text-neutral-400")}>
                                {check.label}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
