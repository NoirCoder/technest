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
            (isMaximized || studioMode)
                ? "fixed inset-0 z-[100] h-screen w-full"
                : "border-[3px] border-neutral-900 shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] min-h-[700px]"
        )}>
            {/* Toolbar */}
            <div className={cn(
                "px-8 py-4 flex items-center justify-between border-b-[3px] border-neutral-900 shrink-0 bg-white",
            )}>
                <div className="flex items-center gap-8">
                    {toolbarGroups.map((group, gIdx) => (
                        <div key={group.name} className="flex items-center gap-2">
                            {group.items.map((item) => {
                                const Icon = item.icon;
                                return (
                                    <button
                                        key={item.label}
                                        type="button"
                                        onClick={item.action}
                                        title={item.label}
                                        disabled={isUploading && item.label === 'Image'}
                                        className="p-2.5 text-neutral-400 hover:bg-neutral-900 hover:text-white border-[1.5px] border-transparent hover:border-neutral-900 transition-all disabled:opacity-50"
                                    >
                                        {isUploading && item.label === 'Image' ? (
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                        ) : (
                                            <Icon className="w-4.5 h-4.5" />
                                        )}
                                    </button>
                                );
                            })}
                            {gIdx < toolbarGroups.length - 1 && <div className="w-[2px] h-6 bg-neutral-900 mx-4" />}
                        </div>
                    ))}

                    <button
                        type="button"
                        className="flex items-center gap-3 px-4 py-2 bg-primary-400 text-neutral-900 border-[2px] border-neutral-900 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[1.5px] hover:translate-y-[1.5px] transition-all text-[10px] font-black uppercase tracking-widest"
                    >
                        <Zap className="w-4 h-4 fill-current" />
                        Affiliates
                    </button>
                </div>

                <div className="flex items-center gap-6">
                    <button
                        type="button"
                        onClick={() => setShowPreview(!showPreview)}
                        className={cn(
                            "flex items-center gap-3 px-6 py-2 border-[2px] border-neutral-900 text-[10px] font-black uppercase tracking-widest transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px]",
                            showPreview ? "bg-neutral-900 text-white shadow-none translate-x-[2px] translate-y-[2px]" : "bg-white text-neutral-900"
                        )}
                    >
                        {showPreview ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        {showPreview ? 'EDITOR' : 'SPLIT'}
                    </button>
                    <div className="w-[2px] h-6 bg-neutral-900" />
                    <button
                        type="button"
                        onClick={() => onToggleStudio ? onToggleStudio() : setIsMaximized(!isMaximized)}
                        className="p-3 bg-neutral-100 border-[2px] border-neutral-900 text-neutral-900 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[1.5px] hover:translate-y-[1.5px] transition-all"
                    >
                        {(isMaximized || studioMode) ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
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
                            "w-full h-full p-16 lg:p-28 font-mono text-[16px] leading-[1.8] resize-none focus:outline-none bg-transparent placeholder:text-neutral-200 font-bold",
                            (isMaximized || studioMode) ? "max-w-5xl mx-auto" : ""
                        )}
                        placeholder={placeholder}
                    />
                </div>

                {/* Preview Plane */}
                <AnimatePresence>
                    {showPreview && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="w-1/2 h-full bg-neutral-50/50 border-l-[3px] border-neutral-900 overflow-y-auto px-16 lg:px-28 py-28"
                        >
                            <div className="prose prose-xl prose-neutral max-w-none 
                                prose-headings:font-black prose-headings:text-neutral-900 prose-headings:uppercase prose-headings:tracking-tighter
                                prose-h1:text-6xl prose-h2:text-4xl prose-h3:text-2xl prose-h2:border-b-[3px] prose-h2:border-neutral-900 prose-h2:pb-4
                                prose-p:leading-[1.6] prose-p:text-neutral-700 prose-p:font-bold
                                prose-img:rounded-none prose-img:border-[4px] prose-img:border-neutral-900 prose-img:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] prose-img:my-20
                                prose-blockquote:border-l-[8px] prose-blockquote:border-l-primary-400 prose-blockquote:bg-neutral-900 prose-blockquote:text-white prose-blockquote:font-black prose-blockquote:px-10 prose-blockquote:py-8 prose-blockquote:not-italic prose-blockquote:shadow-[8px_8px_0px_0px_rgba(0,0,0,0.2)]
                                prose-table:border-[3px] prose-table:border-neutral-900 prose-table:shadow-[10px_10px_0px_0px_rgba(0,0,0,0.1)]
                                prose-th:bg-neutral-900 prose-th:text-white prose-th:px-4 prose-th:py-2
                            ">
                                <ReactMarkdown remarkPlugins={[remarkGfm, remarkBreaks]}>
                                    {value || '*INTEL ARCHIVE PREVIEW IN PROGRESS...*'}
                                </ReactMarkdown>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Footer / Word Count */}
            {(isMaximized || studioMode) && (
                <div className="px-10 py-6 bg-neutral-900 border-t-[3px] border-neutral-900 flex items-center justify-between shrink-0 text-white">
                    <div className="flex items-center gap-10">
                        <div className="flex items-center gap-3">
                            <div className="w-2.5 h-2.5 bg-green-500 rounded-full shadow-[0_0_10px_rgba(34,197,94,0.5)]" />
                            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-neutral-400">SYNC PROTOCOL: STABLE</span>
                        </div>
                        <span className="text-[10px] font-black text-white uppercase tracking-[0.3em]">
                            METRICS: {value.split(/\s+/).filter(Boolean).length} WORDS
                        </span>
                    </div>
                    <p className="text-[10px] font-black text-neutral-500 uppercase tracking-[0.4em]">TECHNEST STUDIO ACCESS // V.2026.04</p>
                </div>
            )}
        </div>
    );
}
