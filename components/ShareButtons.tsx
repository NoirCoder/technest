'use client';

import { Twitter, Facebook, Linkedin, Link as LinkIcon, Share2 } from 'lucide-react';
import { useState } from 'react';

interface ShareButtonsProps {
    title: string;
    slug: string;
}

export default function ShareButtons({ title, slug }: ShareButtonsProps) {
    const [copied, setCopied] = useState(false);

    // In a real app, use the actual domain
    const url = `https://technest.com/blog/${slug}`;
    const encodedUrl = encodeURIComponent(url);
    const encodedTitle = encodeURIComponent(title);

    const copyToClipboard = () => {
        navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="flex flex-col gap-4 sticky top-24">
            <div className="text-xs font-semibold text-neutral-400 uppercase tracking-wider text-center lg:text-left">
                Share
            </div>

            <div className="flex lg:flex-col gap-3 justify-center lg:justify-start">
                <a
                    href={`https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 rounded-full bg-neutral-100 text-neutral-600 hover:bg-[#1DA1F2] hover:text-white transition-all duration-300"
                    title="Share on Twitter"
                >
                    <Twitter className="w-5 h-5" />
                </a>

                <a
                    href={`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 rounded-full bg-neutral-100 text-neutral-600 hover:bg-[#4267B2] hover:text-white transition-all duration-300"
                    title="Share on Facebook"
                >
                    <Facebook className="w-5 h-5" />
                </a>

                <a
                    href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 rounded-full bg-neutral-100 text-neutral-600 hover:bg-[#0077b5] hover:text-white transition-all duration-300"
                    title="Share on LinkedIn"
                >
                    <Linkedin className="w-5 h-5" />
                </a>

                <button
                    onClick={copyToClipboard}
                    className={`p-3 rounded-full transition-all duration-300 relative group ${copied ? 'bg-green-500 text-white' : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                        }`}
                    title="Copy Link"
                >
                    {copied ? <Share2 className="w-5 h-5" /> : <LinkIcon className="w-5 h-5" />}

                    {/* Tooltip */}
                    <span className={`absolute left-full ml-2 top-1/2 -translate-y-1/2 px-2 py-1 bg-neutral-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none lg:block hidden ${copied ? 'opacity-100' : ''}`}>
                        {copied ? 'Copied!' : 'Copy Link'}
                    </span>
                </button>
            </div>
        </div>
    );
}
