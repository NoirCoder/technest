import { ExternalLink } from 'lucide-react';
import Image from 'next/image';

interface AffiliateProductBlockProps {
    productName: string;
    productImage: string;
    amazonLink: string;
    price?: string;
    features?: string[];
}

export default function AffiliateBlock({
    productName,
    productImage,
    amazonLink,
    price,
    features,
}: AffiliateProductBlockProps) {
    return (
        <div className="not-prose my-8">
            <div className="card p-6 bg-gradient-to-br from-primary-50/50 to-white border border-primary-100">
                <div className="flex flex-col md:flex-row gap-6">
                    {/* Product Image */}
                    <div className="md:w-48 flex-shrink-0">
                        <div className="relative aspect-square bg-white rounded-lg overflow-hidden">
                            <Image
                                src={productImage}
                                alt={productName}
                                fill
                                className="object-contain p-4"
                            />
                        </div>
                    </div>

                    {/* Product Info */}
                    <div className="flex-1 flex flex-col">
                        <h3 className="text-xl font-bold text-neutral-900 mb-2">{productName}</h3>

                        {price && (
                            <p className="text-2xl font-bold text-primary-600 mb-4">{price}</p>
                        )}

                        {features && features.length > 0 && (
                            <ul className="space-y-2 mb-4 flex-1">
                                {features.map((feature, index) => (
                                    <li key={index} className="flex items-start gap-2 text-neutral-700">
                                        <span className="text-primary-500 mt-1">✓</span>
                                        <span className="text-sm">{feature}</span>
                                    </li>
                                ))}
                            </ul>
                        )}

                        <a
                            href={amazonLink}
                            target="_blank"
                            rel="nofollow noopener noreferrer"
                            className="btn-primary inline-flex w-full md:w-auto"
                        >
                            Check Price on Amazon
                            <ExternalLink className="ml-2 w-4 h-4" />
                        </a>
                    </div>
                </div>

                {/* Disclosure */}
                <p className="text-xs text-neutral-500 mt-4 pt-4 border-t border-neutral-200">
                    * As an Amazon Associate, we earn from qualifying purchases at no extra cost to you.
                </p>
            </div>
        </div>
    );
}
