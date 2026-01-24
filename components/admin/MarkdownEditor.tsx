'use client';

import { useState, useRef } from 'react';
import { Eye, EyeOff, Bold, Italic, Link as LinkIcon, Image as ImageIcon, Code, Quote, Type, List, Loader2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';
import { uploadImage } from '@/lib/storage';

interface MarkdownEditorProps {
    value: string;
    onChange: (value: string) => void;
}

export default function MarkdownEditor({ value, onChange }: MarkdownEditorProps) {
    const [showPreview, setShowPreview] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const insertMarkdown = (before: string, after: string = '') => {
        const textarea = document.getElementById('markdown-editor') as HTMLTextAreaElement;
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
            alert('Image upload failed. Please ensure the Supabase bucket "images" exists and you have permissions.');
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const toolbar = [
        { label: 'H1', icon: Type, size: 20, action: () => insertMarkdown('# ', '') },
        { label: 'H2', icon: Type, size: 18, action: () => insertMarkdown('## ', '') },
        { label: 'H3', icon: Type, size: 16, action: () => insertMarkdown('### ', '') },
        { label: 'Bold', icon: Bold, action: () => insertMarkdown('**', '**') },
        { label: 'Italic', icon: Italic, action: () => insertMarkdown('*', '*') },
        { label: 'List', icon: List, action: () => insertMarkdown('- ', '') },
        { label: 'Link', icon: LinkIcon, action: () => insertMarkdown('[', '](url)') },
        { label: 'Image', icon: ImageIcon, action: () => fileInputRef.current?.click() },
        { label: 'Code', icon: Code, action: () => insertMarkdown('`', '`') },
        { label: 'Quote', icon: Quote, action: () => insertMarkdown('> ', '') },
    ];

    return (
        <div className="border border-neutral-200 rounded-xl overflow-hidden bg-white shadow-soft-sm">
            {/* Toolbar */}
            <div className="bg-neutral-50 border-b border-neutral-200 p-2 flex flex-wrap items-center gap-1">
                {toolbar.map((item) => {
                    const Icon = item.icon;
                    return (
                        <button
                            key={item.label}
                            type="button"
                            onClick={item.action}
                            title={item.label}
                            disabled={isUploading && item.label === 'Image'}
                            className="p-2 text-neutral-600 hover:bg-neutral-200 hover:text-neutral-900 rounded-lg transition-all flex items-center justify-center disabled:opacity-50"
                        >
                            {isUploading && item.label === 'Image' ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <Icon className="w-5 h-5" />
                            )}
                            {item.label.startsWith('H') && <span className="text-[10px] font-bold ml-0.5">{item.label[1]}</span>}
                        </button>
                    );
                })}

                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImageUpload}
                    className="hidden"
                    accept="image/*"
                />

                <div className="ml-auto flex items-center gap-2">
                    <div className="h-6 w-px bg-neutral-300 mx-2 hidden md:block"></div>
                    <button
                        type="button"
                        onClick={() => setShowPreview(!showPreview)}
                        className={`flex items-center gap-2 px-4 py-1.5 text-sm font-semibold rounded-lg transition-all ${showPreview
                            ? 'bg-primary-100 text-primary-700'
                            : 'text-neutral-600 hover:bg-neutral-200'
                            }`}
                    >
                        {showPreview ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        {showPreview ? 'Editor' : 'Preview'}
                    </button>
                </div>
            </div>

            {/* Editor/Preview */}
            <div className="grid grid-cols-1 md:grid-cols-2 divide-x divide-neutral-200 min-h-[500px]">
                {/* Editor */}
                <div className={`flex flex-col ${showPreview ? 'hidden md:flex' : 'flex'}`}>
                    <textarea
                        id="markdown-editor"
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        className="w-full h-full p-6 font-mono text-[14px] leading-relaxed resize-none focus:outline-none bg-neutral-50/30"
                        placeholder="Start writing your story..."
                    />
                </div>

                {/* Preview */}
                <div className={`p-8 bg-white overflow-auto h-[600px] ${!showPreview && 'hidden md:block'}`}>
                    <div className="prose prose-neutral max-w-none prose-headings:font-serif prose-headings:font-bold prose-p:leading-relaxed prose-li:leading-relaxed">
                        <ReactMarkdown remarkPlugins={[remarkGfm, remarkBreaks]}>
                            {value || '*Live preview of your content...*'}
                        </ReactMarkdown>
                    </div>
                </div>
            </div>
        </div>
    );
}
