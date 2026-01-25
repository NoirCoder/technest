'use client';

import { supabase } from '@/lib/supabase';
import { useEffect, useState, useRef } from 'react';
import {
    Plus,
    Search,
    Image as ImageIcon,
    Copy,
    Trash2,
    Edit2,
    FileText,
    UploadCloud,
    X,
    Check,
    Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { uploadImage } from '@/lib/storage';
import Image from 'next/image';

interface MediaItem {
    id: string;
    url: string;
    filename: string;
    alt_text: string;
    size: number;
    created_at: string;
}

export default function MediaPage() {
    const [media, setMedia] = useState<MediaItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [isUploading, setIsUploading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedItem, setSelectedItem] = useState<MediaItem | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        fetchMedia();
    }, []);

    const fetchMedia = async () => {
        try {
            const { data, error } = await supabase
                .from('media')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            if (data) setMedia(data);
        } catch (error) {
            console.error('Error fetching media:', error);
            // Fallback for demo/dev if table doesn't exist
        } finally {
            setLoading(false);
        }
    };

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        try {
            const url = await uploadImage(file);

            // Insert into DB
            const { data, error } = await supabase
                .from('media')
                .insert({
                    url,
                    filename: file.name,
                    alt_text: file.name.split('.')[0],
                    size: file.size,
                })
                .select()
                .single();

            if (!error && data) {
                setMedia([data, ...media]);
            }
        } catch (error) {
            alert('Upload failed. Ensure "media" table and "images" storage exist.');
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Permanently delete this asset?')) return;
        const { error } = await supabase.from('media').delete().eq('id', id);
        if (!error) {
            setMedia(media.filter(m => m.id !== id));
            setSelectedItem(null);
        }
    };

    const filteredMedia = media.filter(m =>
        m.filename.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.alt_text.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-[50vh] space-y-4">
                <Loader2 className="w-8 h-8 animate-spin text-neutral-200" />
                <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest animate-pulse">Scanning Vault...</p>
            </div>
        );
    }

    return (
        <div className="space-y-12">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 border-b border-neutral-100 pb-10">
                <div>
                    <div className="flex items-center gap-2 mb-3">
                        <ImageIcon className="w-4 h-4 text-neutral-400" />
                        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-400">Asset Management</span>
                    </div>
                    <h1 className="text-4xl font-bold tracking-tight text-neutral-900 mb-2">Media Vault</h1>
                    <p className="text-neutral-500 font-medium">Coordinate your visual assets and optimize for high-impact content.</p>
                </div>
                <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className="h-12 px-8 rounded-xl bg-[#09090B] text-white hover:bg-neutral-800 font-bold text-sm transition-all flex items-center gap-2 shadow-xl shadow-neutral-100 disabled:opacity-50"
                >
                    {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <UploadCloud className="w-4 h-4" />}
                    Batch Upload
                </button>
                <input type="file" ref={fileInputRef} onChange={handleUpload} className="hidden" accept="image/*" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                <div className="lg:col-span-8 space-y-8">
                    <div className="relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-neutral-300 group-focus-within:text-neutral-900 transition-colors" />
                        <input
                            type="text"
                            placeholder="Filter library assets..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-12 pr-4 py-4 bg-white rounded-2xl border border-neutral-100 focus:ring-4 focus:ring-neutral-50 transition-all text-sm font-medium outline-none"
                        />
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                        <AnimatePresence mode="popLayout">
                            {filteredMedia.map((item) => (
                                <motion.div
                                    layout
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    key={item.id}
                                    onClick={() => setSelectedItem(item)}
                                    className={cn(
                                        "group aspect-square rounded-2xl overflow-hidden bg-neutral-50 border-2 transition-all cursor-pointer relative",
                                        selectedItem?.id === item.id ? "border-primary-500 ring-4 ring-primary-50 shadow-xl scale-[1.02]" : "border-transparent hover:border-neutral-200"
                                    )}
                                >
                                    <Image
                                        src={item.url}
                                        alt={item.alt_text}
                                        fill
                                        sizes="(max-width: 768px) 50vw, 25vw"
                                        className="object-cover transition-transform duration-700 group-hover:scale-110"
                                    />
                                    <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                                        <p className="text-[9px] font-bold text-white truncate">{item.filename}</p>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>

                        {filteredMedia.length === 0 && (
                            <div className="col-span-full py-40 text-center bg-white rounded-[3rem] border-2 border-dashed border-neutral-100">
                                <ImageIcon className="w-12 h-12 text-neutral-100 mx-auto mb-4" />
                                <h3 className="text-xl font-bold text-neutral-900 mb-2 font-serif italic">Vault is Empty</h3>
                                <p className="text-neutral-400 font-medium max-w-xs mx-auto">Either your search is too specific or the archive is awaiting new uploads.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Inspector Sidebar */}
                <div className="lg:col-span-4 sticky top-6">
                    <AnimatePresence mode="wait">
                        {selectedItem ? (
                            <motion.div
                                key={selectedItem.id}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                className="bg-white rounded-[2rem] border border-neutral-100 shadow-sm overflow-hidden flex flex-col"
                            >
                                <div className="aspect-[4/3] relative bg-neutral-100">
                                    <Image src={selectedItem.url} alt="Preview" fill className="object-contain" />
                                    <button
                                        onClick={() => setSelectedItem(null)}
                                        className="absolute top-4 right-4 p-2 bg-white/80 backdrop-blur rounded-full hover:bg-white transition-colors border border-black/5 shadow-sm"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                                <div className="p-8 space-y-8">
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-start">
                                            <div className="min-w-0">
                                                <h3 className="text-lg font-bold text-neutral-900 truncate mb-1">{selectedItem.filename}</h3>
                                                <p className="text-[10px] font-bold text-neutral-300 uppercase tracking-widest">
                                                    {(selectedItem.size / 1024).toFixed(1)} KB • {new Date(selectedItem.created_at).toLocaleDateString()}
                                                </p>
                                            </div>
                                            <button
                                                onClick={() => {
                                                    navigator.clipboard.writeText(selectedItem.url);
                                                    // Trigger fake toast state if needed
                                                }}
                                                className="p-2.5 bg-neutral-50 rounded-xl text-neutral-400 hover:text-neutral-900 border border-neutral-100 hover:shadow-sm transition-all"
                                            >
                                                <Copy className="w-4 h-4" />
                                            </button>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">SEO ALT TEXT</label>
                                            <input
                                                type="text"
                                                defaultValue={selectedItem.alt_text}
                                                className="w-full px-4 py-3 bg-neutral-50 rounded-xl border border-transparent focus:bg-white focus:border-neutral-200 transition-all text-xs font-bold text-neutral-900 outline-none shadow-inner"
                                            />
                                        </div>
                                    </div>

                                    <div className="flex gap-3">
                                        <button className="flex-1 h-12 rounded-xl bg-[#09090B] text-white hover:bg-neutral-800 font-bold text-xs transition-all shadow-xl shadow-neutral-100 flex items-center justify-center gap-2">
                                            <Check className="w-4 h-4" />
                                            Update Details
                                        </button>
                                        <button
                                            onClick={() => handleDelete(selectedItem.id)}
                                            className="w-12 h-12 flex items-center justify-center rounded-xl bg-red-50 text-red-400 hover:bg-red-500 hover:text-white transition-all border border-red-100"
                                        >
                                            <Trash2 className="w-4.5 h-4.5" />
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        ) : (
                            <div className="bg-neutral-50 rounded-[2rem] border-2 border-dashed border-neutral-200 p-12 text-center text-neutral-400 h-[600px] flex flex-col justify-center items-center">
                                <div className="p-4 bg-white rounded-2xl shadow-soft mb-6">
                                    <ImageIcon className="w-8 h-8 text-neutral-200" />
                                </div>
                                <h3 className="font-bold text-neutral-900 text-sm mb-2 italic">No Selection</h3>
                                <p className="text-[10px] font-bold uppercase tracking-widest max-w-[200px]">Choose an asset to inspect and broadcast its metadata.</p>
                            </div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}

