'use client';

import { useState, useRef, useEffect } from 'react';
import {
    Eye,
    EyeOff,
    Bold,
    Italic,
    Link as LinkIcon,
    Image as ImageIcon,
    Code,
    Quote,
    Type,
    List,
    Loader2,
    Maximize2,
    Minimize2,
    Zap,
    Heading1,
    Heading2,
    Heading3,
    CornerDownLeft,
    Monitor
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';
import { uploadImage } from '@/lib/storage';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface MarkdownEditorProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    studioMode?: boolean;
    onToggleStudio?: () => void;
}

export default function MarkdownEditor({
    value,
    onChange,
    placeholder = "Start drafting your report...",
    studioMode = false,
    onToggleStudio
}: MarkdownEditorProps) {
    const [showPreview, setShowPreview] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [isMaximized, setIsMaximized] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const insertMarkdown = (before: string, after: string = '') => {
        const textarea = textareaRef.current;
        if (!textarea) return;

        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const selectedText = value.substring(start, end);
        const newText = value.substring(0, start) + before + selectedText + after + value.substring(end);

        onChange(newText);

        setTimeout(() => {
            textarea.focus();
            textarea.setSelectionRange(
                start + before.length,
                start + before.length + selectedText.length
            );
        }, 0);
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        try {
            const url = await uploadImage(file);
            insertMarkdown(`![${file.name}](${url})`, '');
        } catch (error) {
            console.error('Upload failed:', error);
            alert('Upload failed. Verify storage configuration.');
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const toolbarGroups = [
        {
            name: 'Blocks',
            items: [
                { label: 'H1', icon: Heading1, action: () => insertMarkdown('# ', '') },
                { label: 'H2', icon: Heading2, action: () => insertMarkdown('## ', '') },
                { label: 'H3', icon: Heading3, action: () => insertMarkdown('### ', '') },
            ]
        },
        {
            name: 'Formatting',
            items: [
                { label: 'Bold', icon: Bold, action: () => insertMarkdown('**', '**') },
                { label: 'Italic', icon: Italic, action: () => insertMarkdown('*', '*') },
                { label: 'List', icon: List, action: () => insertMarkdown('- ', '') },
            ]
        },
        {
            name: 'Insert',
            items: [
                { label: 'Link', icon: LinkIcon, action: () => insertMarkdown('[', '](url)') },
                { label: 'Image', icon: ImageIcon, action: () => fileInputRef.current?.click() },
                { label: 'Code', icon: Code, action: () => insertMarkdown('`', '`') },
                { label: 'Quote', icon: Quote, action: () => insertMarkdown('> ', '') },
            ]
        }
    ];

    return (
        <div className={cn(
            "flex flex-col bg-white transition-all duration-500",
            (isMaximized || studioMode) ? "fixed inset-0 z-[100] h-screen w-full" : "border border-neutral-100 rounded-[2rem] overflow-hidden shadow-sm min-h-[600px]"
        )}>
            {/* Toolbar */}
            <div className={cn(
                "px-6 py-3 flex items-center justify-between border-b border-neutral-50 shrink-0",
                (isMaximized || studioMode) ? "bg-white/80 backdrop-blur-xl" : "bg-neutral-50/30"
            )}>
                <div className="flex items-center gap-6">
                    {toolbarGroups.map((group, gIdx) => (
                        <div key={group.name} className="flex items-center gap-1.5">
                            {group.items.map((item) => {
                                const Icon = item.icon;
                                return (
                                    <button
                                        key={item.label}
                                        type="button"
                                        onClick={item.action}
                                        title={item.label}
                                        disabled={isUploading && item.label === 'Image'}
                                        className="p-2 text-neutral-400 hover:bg-white hover:text-neutral-900 hover:shadow-soft rounded-xl transition-all disabled:opacity-50"
                                    >
                                        {isUploading && item.label === 'Image' ? (
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                        ) : (
                                            <Icon className="w-4 h-4" />
                                        )}
                                    </button>
                                );
                            })}
                            {gIdx < toolbarGroups.length - 1 && <div className="w-px h-4 bg-neutral-200 mx-2" />}
                        </div>
                    ))}

                    {/* Affiliate Bridge Placeholder */}
                    <button
                        type="button"
                        className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-primary-50 text-primary-600 hover:bg-primary-100 transition-all text-[10px] font-bold uppercase tracking-widest"
                    >
                        <Zap className="w-3.5 h-3.5 fill-current" />
                        Affiliates
                    </button>
                </div>

                <div className="flex items-center gap-4">
                    <button
                        type="button"
                        onClick={() => setShowPreview(!showPreview)}
                        className={cn(
                            "flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all",
                            showPreview ? "bg-[#09090B] text-white" : "text-neutral-500 hover:bg-neutral-100"
                        )}
                    >
                        {showPreview ? <CornerDownLeft className="w-3.5 h-3.5" /> : <Monitor className="w-3.5 h-3.5" />}
                        {showPreview ? 'Exit Preview' : 'Split View'}
                    </button>
                    <div className="w-px h-4 bg-neutral-200" />
                    <button
                        type="button"
                        onClick={() => onToggleStudio ? onToggleStudio() : setIsMaximized(!isMaximized)}
                        className="p-2.5 rounded-xl text-neutral-400 hover:bg-neutral-100 hover:text-neutral-900 transition-all"
                    >
                        {(isMaximized || studioMode) ? <Minimize2 className="w-4.5 h-4.5" /> : <Maximize2 className="w-4.5 h-4.5" />}
                    </button>
                </div>
            </div>

            <input type="file" ref={fileInputRef} onChange={handleImageUpload} className="hidden" accept="image/*" />

            {/* Content Area */}
            <div className="flex-1 flex overflow-hidden">
                {/* Editor Surface */}
                <div className={cn(
                    "flex-1 flex flex-col transition-all duration-300",
                    showPreview ? "w-1/2" : "w-full"
                )}>
                    <textarea
                        ref={textareaRef}
                        id="markdown-editor"
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        className={cn(
                            "w-full h-full p-12 lg:p-20 font-mono text-[15px] leading-[1.8] resize-none focus:outline-none bg-transparent placeholder:text-neutral-200",
                            (isMaximized || studioMode) ? "max-w-4xl mx-auto" : ""
                        )}
                        placeholder={placeholder}
                    />
                </div>

                {/* Preview Plane */}
                <AnimatePresence>
                    {showPreview && (
                        <motion.div
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="w-1/2 h-full bg-neutral-50/50 border-l border-neutral-100 overflow-y-auto px-12 lg:px-20 py-20"
                        >
                            <div className="prose prose-lg md:prose-xl prose-neutral max-w-none 
                                prose-headings:font-serif prose-headings:font-bold prose-headings:text-neutral-900
                                prose-h1:text-5xl prose-h2:text-4xl prose-h3:text-2xl
                                prose-p:leading-[1.8] prose-p:text-neutral-700 prose-p:mb-8
                                prose-img:rounded-[2rem] prose-img:shadow-2xl prose-img:my-16
                                prose-blockquote:border-l-4 prose-blockquote:border-l-primary-500 prose-blockquote:bg-primary-50/30 prose-blockquote:px-8 prose-blockquote:py-4 prose-blockquote:rounded-r-2xl prose-blockquote:not-italic
                                prose-table:border prose-table:border-neutral-200 prose-table:rounded-2xl
                            ">
                                <ReactMarkdown remarkPlugins={[remarkGfm, remarkBreaks]}>
                                    {value || '*Publication preview in progress...*'}
                                </ReactMarkdown>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Footer / Word Count */}
            {(isMaximized || studioMode) && (
                <div className="px-10 py-4 bg-white border-t border-neutral-50 flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-green-500" />
                            <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Auto-Saving enabled</span>
                        </div>
                        <span className="text-[10px] font-bold text-neutral-300 uppercase tracking-widest leading-none">
                            {value.split(/\s+/).filter(Boolean).length} Words
                        </span>
                    </div>
                    <p className="text-[10px] font-bold text-neutral-200 uppercase tracking-[0.2em]">TechNest Publication Studio v2 — 2026</p>
                </div>
            )}
        </div>
    );
}
