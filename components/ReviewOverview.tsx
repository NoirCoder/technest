'use client';

import { Check, X, ShoppingCart, Star } from 'lucide-react';

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
        if (r >= 9) return 'bg-emerald-500';
        if (r >= 7) return 'bg-blue-500';
        if (r >= 5) return 'bg-yellow-500';
        return 'bg-red-500';
    };

    return (
        <div className="my-10 bg-white rounded-2xl border border-neutral-200 shadow-soft-lg overflow-hidden">
            {/* Header */}
            <div className="bg-neutral-900 text-white p-6 flex flex-col md:flex-row items-center justify-between gap-4">
                <div>
                    <h3 className="text-xl font-bold font-serif mb-1">The TechNest Verdict</h3>
                    <p className="text-neutral-400 text-sm opacity-90">{productName}</p>
                </div>
                <div className={`flex items-center justify-center w-16 h-16 rounded-2xl ${getRatingColor(rating)} text-white font-bold text-2xl shadow-lg`}>
                    {rating}
                </div>
            </div>

            <div className="p-6 md:p-8">
                {/* Pros & Cons Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                    {/* Pros */}
                    <div>
                        <h4 className="flex items-center gap-2 font-bold text-emerald-700 mb-4 uppercase tracking-wider text-xs">
                            <span className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center">
                                <Check className="w-4 h-4" />
                            </span>
                            The Good
                        </h4>
                        <ul className="space-y-3">
                            {pros.map((pro, i) => (
                                <li key={i} className="flex items-start gap-3 text-sm text-neutral-700">
                                    <Check className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                                    <span>{pro}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Cons */}
                    <div>
                        <h4 className="flex items-center gap-2 font-bold text-red-700 mb-4 uppercase tracking-wider text-xs">
                            <span className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center">
                                <X className="w-4 h-4" />
                            </span>
                            The Bad
                        </h4>
                        <ul className="space-y-3">
                            {cons.map((con, i) => (
                                <li key={i} className="flex items-start gap-3 text-sm text-neutral-700">
                                    <X className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
                                    <span>{con}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* Bottom Line & CTA */}
                <div className="pt-6 border-t border-neutral-100">
                    <h4 className="font-bold text-neutral-900 mb-2">Bottom Line</h4>
                    <p className="text-neutral-600 mb-6 leading-relaxed">
                        {verdict}
                    </p>

                    <a
                        href={affiliateLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-primary w-full md:w-auto flex items-center justify-center gap-2 group"
                    >
                        <ShoppingCart className="w-4 h-4" />
                        Check Price on Amazon
                        <Star className="w-4 h-4 text-yellow-300 fill-current group-hover:animate-pulse" />
                    </a>
                    <p className="text-xs text-neutral-400 mt-3 text-center md:text-left">
                        When you buy through our links, we may earn a commission.
                    </p>
                </div>
            </div>
        </div>
    );
}
