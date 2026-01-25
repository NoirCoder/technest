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
        } catch (error: any) {
            console.error('Upload process error:', error);
            alert(`Upload failed: ${error.message || 'Unknown error'}. Please ensure the "images" bucket and "media" table exist in Supabase.`);
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
            <div className="flex flex-col items-center justify-center h-[50vh] space-y-6">
                <div className="w-12 h-12 border-[4px] border-neutral-100 border-t-neutral-900 rounded-none animate-spin shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"></div>
                <p className="text-neutral-400 font-black text-[10px] uppercase tracking-[0.4em] animate-pulse">Synchronizing Asset Vault...</p>
            </div>
        );
    }

    return (
        <div className="space-y-16">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-12 border-b-[4px] border-neutral-900 pb-16">
                <div>
                    <div className="flex items-center gap-3 mb-6">
                        <ImageIcon className="w-4 h-4 text-neutral-900" />
                        <span className="text-[11px] font-black uppercase tracking-[0.4em] text-neutral-400">Media Asset Management</span>
                    </div>
                    <h1 className="text-6xl font-black tracking-tighter text-neutral-900 uppercase leading-none mb-4">The Vault</h1>
                    <p className="text-lg font-bold text-neutral-400 uppercase tracking-widest">Coordinate visual intelligence protocols.</p>
                </div>
                <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className="brutalist-button-primary h-16 px-10"
                >
                    {isUploading ? <Loader2 className="w-5 h-5 animate-spin mr-3" /> : <UploadCloud className="w-5 h-5 mr-3" />}
                    BATCH UPLOAD
                </button>
                <input type="file" ref={fileInputRef} onChange={handleUpload} className="hidden" accept="image/*" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
                <div className="lg:col-span-8 space-y-12">
                    <div className="relative group brutalist-card border-neutral-900">
                        <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-neutral-900" />
                        <input
                            type="text"
                            placeholder="FILTER ASSET REGISTRY..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-16 pr-8 py-5 bg-transparent border-none focus:ring-0 text-[11px] font-black uppercase tracking-[0.3em] outline-none placeholder:text-neutral-300"
                        />
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
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
                                        "group aspect-square border-[3px] transition-all cursor-pointer relative overflow-hidden",
                                        selectedItem?.id === item.id
                                            ? "border-neutral-900 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] scale-[1.02] z-10"
                                            : "border-neutral-200 grayscale-0 hover:border-neutral-900 hover:grayscale-0"
                                    )}
                                >
                                    <Image
                                        src={item.url}
                                        alt={item.alt_text}
                                        fill
                                        sizes="(max-width: 768px) 50vw, 25vw"
                                        className="object-cover transition-transform duration-700 group-hover:scale-110"
                                    />
                                    <div className="absolute inset-x-0 bottom-0 p-3 bg-neutral-900 text-white translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                                        <p className="text-[9px] font-black uppercase tracking-widest truncate">{item.filename}</p>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>

                        {filteredMedia.length === 0 && (
                            <div className="col-span-full py-40 text-center brutalist-card border-dashed border-neutral-900 bg-neutral-50 grayscale opacity-40">
                                <ImageIcon className="w-16 h-16 text-neutral-900 mx-auto mb-8 rotate-6 bg-white p-3 border-[3px] border-neutral-900 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]" />
                                <h3 className="text-2xl font-black text-neutral-900 uppercase tracking-tighter mb-4 italic">The Vault is Void</h3>
                                <p className="text-[11px] font-black uppercase tracking-[0.4em] text-neutral-400 max-w-sm mx-auto">No assets detected for current query module. Initialize new uploads or reset filters.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Inspector Sidebar */}
                <div className="lg:col-span-4 sticky top-12">
                    <AnimatePresence mode="wait">
                        {selectedItem ? (
                            <motion.div
                                key={selectedItem.id}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                className="brutalist-card bg-white border-neutral-900 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] overflow-hidden flex flex-col"
                            >
                                <div className="aspect-[4/3] relative bg-neutral-100 border-b-[3px] border-neutral-900">
                                    <Image src={selectedItem.url} alt="Preview" fill className="object-contain" />
                                    <button
                                        onClick={() => setSelectedItem(null)}
                                        className="absolute top-5 right-5 p-2.5 bg-white border-[2px] border-neutral-900 text-neutral-900 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
                                    >
                                        <X className="w-5 h-5 font-black" />
                                    </button>
                                </div>
                                <div className="p-10 space-y-10">
                                    <div className="space-y-6">
                                        <div className="flex justify-between items-start">
                                            <div className="min-w-0">
                                                <h3 className="text-xl font-black text-neutral-900 truncate mb-2 uppercase tracking-tighter">{selectedItem.filename}</h3>
                                                <div className="flex items-center gap-3 text-[10px] font-black text-neutral-400 uppercase tracking-widest bg-neutral-50 px-3 py-1 border-[1.5px] border-neutral-200">
                                                    {(selectedItem.size / 1024).toFixed(1)} KB • {new Date(selectedItem.created_at).toLocaleDateString()}
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => {
                                                    navigator.clipboard.writeText(selectedItem.url);
                                                }}
                                                className="p-3 bg-white border-[2px] border-neutral-900 text-neutral-900 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
                                            >
                                                <Copy className="w-5 h-5" />
                                            </button>
                                        </div>

                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Tactical Alt Text</label>
                                            <input
                                                type="text"
                                                defaultValue={selectedItem.alt_text}
                                                className="brutalist-input h-14"
                                            />
                                        </div>
                                    </div>

                                    <div className="flex gap-4">
                                        <button className="brutalist-button-primary flex-1 h-14 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)]">
                                            <Check className="w-5 h-5 mr-3" />
                                            SYNC INTEL
                                        </button>
                                        <button
                                            onClick={() => handleDelete(selectedItem.id)}
                                            className="brutalist-button px-4 bg-red-400 border-neutral-900"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        ) : (
                            <div className="brutalist-card bg-neutral-50 border-dashed border-neutral-900 p-12 text-center text-neutral-400 min-h-[500px] flex flex-col justify-center items-center grayscale opacity-40">
                                <div className="w-16 h-16 bg-white border-[3px] border-neutral-900 flex items-center justify-center text-neutral-900 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] mb-10">
                                    <ImageIcon className="w-8 h-8" />
                                </div>
                                <h3 className="text-xl font-black text-neutral-900 mb-4 uppercase tracking-tighter italic">No Selection</h3>
                                <p className="text-[11px] font-black uppercase tracking-[0.4em] max-w-[240px] leading-relaxed">Select an asset from the vault to inspect and revise metadata.</p>
                            </div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}

