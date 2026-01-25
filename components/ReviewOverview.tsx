'use client';

import { Check, X, ShoppingCart, Star, Zap } from 'lucide-react';

interface ReviewOverviewProps {
    rating: number; // 0 to 10
    pros: string[];
    cons: string[];
    verdict: string;
    productName: string;
    affiliateLink?: string;
}

export default function ReviewOverview({
    rating,
    pros,
    cons,
    verdict,
    productName,
    affiliateLink = "#"
}: ReviewOverviewProps) {

    // Color coding based on rating
    const getRatingColor = (r: number) => {
        if (r >= 9) return 'bg-primary-400';
        if (r >= 7) return 'bg-blue-400';
        if (r >= 5) return 'bg-yellow-400';
        return 'bg-red-400';
    };

    return (
        <div className="my-20 bg-white border-[4px] border-neutral-900 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] flex flex-col">
            {/* Header */}
            <div className="bg-neutral-900 text-white p-10 flex flex-col md:flex-row items-center justify-between gap-10">
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-4">
                        <Zap className="w-5 h-5 text-primary-400 fill-current" />
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-neutral-500">TechNest Intelligence</span>
                    </div>
                    <h3 className="text-4xl md:text-5xl font-black uppercase tracking-tighter mb-2 leading-none">The Verdict</h3>
                    <p className="text-neutral-400 font-bold uppercase tracking-widest text-[10px]">{productName}</p>
                </div>
                <div className={`flex flex-col items-center justify-center w-28 h-28 border-[4px] border-white ${getRatingColor(rating)} text-neutral-900 font-black shadow-[6px_6px_0px_0px_rgba(255,255,255,0.2)]`}>
                    <span className="text-4xl">{rating}</span>
                    <span className="text-[10px] uppercase tracking-widest">/ 10</span>
                </div>
            </div>

            <div className="p-8 md:p-12">
                {/* Pros & Cons Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-12">
                    {/* Pros */}
                    <div className="space-y-6">
                        <div className="inline-block bg-primary-400 border-[2px] border-neutral-900 px-4 py-1 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                            <h4 className="font-black text-neutral-900 uppercase tracking-widest text-[10px]">Strategic Advantages</h4>
                        </div>
                        <ul className="space-y-4">
                            {pros.map((pro, i) => (
                                <li key={i} className="flex items-start gap-4 text-sm font-bold text-neutral-800">
                                    <div className="mt-0.5 p-1 bg-neutral-900 text-white border-[1.5px] border-neutral-900">
                                        <Check className="w-3 h-3" />
                                    </div>
                                    <span className="leading-relaxed">{pro}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Cons */}
                    <div className="space-y-6">
                        <div className="inline-block bg-red-400 border-[2px] border-neutral-900 px-4 py-1 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                            <h4 className="font-black text-neutral-900 uppercase tracking-widest text-[10px]">Known Limitations</h4>
                        </div>
                        <ul className="space-y-4">
                            {cons.map((con, i) => (
                                <li key={i} className="flex items-start gap-4 text-sm font-bold text-neutral-800">
                                    <div className="mt-0.5 p-1 bg-white border-[1.5px] border-neutral-900">
                                        <X className="w-3 h-3 text-neutral-900" />
                                    </div>
                                    <span className="leading-relaxed">{con}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* Bottom Line & CTA */}
                <div className="pt-10 border-t-[3px] border-neutral-900">
                    <div className="flex flex-col lg:flex-row gap-10 items-start">
                        <div className="flex-1">
                            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400 mb-4">Executive Summary</h4>
                            <p className="text-xl font-bold leading-[1.6] text-neutral-900 italic">
                                "{verdict}"
                            </p>
                        </div>
                        <div className="w-full lg:w-auto shrink-0 flex flex-col gap-4">
                            <a
                                href={affiliateLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="brutalist-button-primary h-16 px-10 group"
                            >
                                <ShoppingCart className="w-5 h-5 mr-3" />
                                <span className="mr-3">SECURE AT AMAZON</span>
                                <Star className="w-5 h-5 text-white fill-current animate-pulse" />
                            </a>
                            <div className="p-4 bg-neutral-50 border-[1.5px] border-neutral-900 text-[10px] font-black text-neutral-400 text-center uppercase tracking-widest">
                                Affiliate Link: Commmission Earned
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
