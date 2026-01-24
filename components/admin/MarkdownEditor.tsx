'use client';

import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface MarkdownEditorProps {
    value: string;
    onChange: (value: string) => void;
}

export default function MarkdownEditor({ value, onChange }: MarkdownEditorProps) {
    const [showPreview, setShowPreview] = useState(false);

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

    const toolbar = [
        { label: 'H1', action: () => insertMarkdown('# ', '') },
        { label: 'H2', action: () => insertMarkdown('## ', '') },
        { label: 'H3', action: () => insertMarkdown('### ', '') },
        { label: 'Bold', action: () => insertMarkdown('**', '**') },
        { label: 'Italic', action: () => insertMarkdown('*', '*') },
        { label: 'Link', action: () => insertMarkdown('[', '](url)') },
        { label: 'Image', action: () => insertMarkdown('![alt](', ')') },
        { label: 'Code', action: () => insertMarkdown('`', '`') },
        { label: 'Quote', action: () => insertMarkdown('> ', '') },
    ];

    return (
        <div className="border border-neutral-300 rounded-lg overflow-hidden">
            {/* Toolbar */}
            <div className="bg-neutral-50 border-b border-neutral-300 p-2 flex flex-wrap items-center gap-2">
                {toolbar.map((item) => (
                    <button
                        key={item.label}
                        type="button"
                        onClick={item.action}
                        className="px-3 py-1 text-sm font-medium text-neutral-700 hover:bg-neutral-200 rounded transition-colors"
                    >
                        {item.label}
                    </button>
                ))}
                <div className="ml-auto">
                    <button
                        type="button"
                        onClick={() => setShowPreview(!showPreview)}
                        className="flex items-center gap-2 px-3 py-1 text-sm font-medium text-neutral-700 hover:bg-neutral-200 rounded transition-colors"
                    >
                        {showPreview ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        {showPreview ? 'Edit' : 'Preview'}
                    </button>
                </div>
            </div>

            {/* Editor/Preview */}
            <div className="grid grid-cols-1 md:grid-cols-2 divide-x divide-neutral-300 min-h-[500px]">
                {/* Editor */}
                <div className={showPreview ? 'hidden md:block' : ''}>
                    <textarea
                        id="markdown-editor"
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        className="w-full h-full p-4 font-mono text-sm resize-none focus:outline-none"
                        placeholder="Write your content in Markdown..."
                    />
                </div>

                {/* Preview */}
                <div className={`p-4 overflow-auto ${!showPreview && 'hidden md:block'}`}>
                    <div className="prose prose-neutral max-w-none prose-headings:font-serif">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {value || '*Preview will appear here*'}
                        </ReactMarkdown>
                    </div>
                </div>
            </div>
        </div>
    );
}
