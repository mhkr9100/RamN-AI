
import React, { useState, useMemo } from 'react';
import { Message, MessageContent } from '../types';
import { XMarkIcon } from './icons/XMarkIcon';

interface MediaGalleryModalProps {
    isOpen: boolean;
    onClose: () => void;
    chatHistory: Record<string, Message[]>;
}

export const MediaGalleryModal: React.FC<MediaGalleryModalProps> = ({ isOpen, onClose, chatHistory }) => {
    const [filter, setFilter] = useState<'all' | 'image' | 'video'>('all');

    const mediaItems = useMemo(() => {
        const items: { url: string; type: 'image' | 'video'; agentName: string; timestamp: number }[] = [];
        // Fixed: Explicitly cast Object.values(chatHistory) to Message[][] to avoid TypeScript 'unknown' type error during iteration
        (Object.values(chatHistory) as Message[][]).forEach(messages => {
            messages.forEach(msg => {
                if (msg.content.type === 'image') {
                    items.push({ 
                        url: msg.content.imageUrl, 
                        type: 'image', 
                        agentName: msg.agent.name, 
                        timestamp: parseInt(msg.id) || Date.now() 
                    });
                } else if (msg.content.type === 'video') {
                    items.push({ 
                        url: msg.content.videoUrl, 
                        type: 'video', 
                        agentName: msg.agent.name, 
                        timestamp: parseInt(msg.id) || Date.now() 
                    });
                }
            });
        });
        return items.sort((a, b) => b.timestamp - a.timestamp);
    }, [chatHistory]);

    const filteredItems = mediaItems.filter(item => filter === 'all' || item.type === filter);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/95 z-[100] flex items-center justify-center p-4 backdrop-blur-xl">
            <div className="bg-black w-full max-w-6xl h-[90vh] rounded-2xl shadow-2xl border border-white/20 flex flex-col overflow-hidden">
                <div className="flex items-center justify-between p-6 border-b border-white/10 bg-[#050505]">
                    <div>
                        <h2 className="text-2xl font-bold text-white tracking-tight">Spectral Media Vault</h2>
                        <p className="text-[10px] text-slate-500 font-mono tracking-widest uppercase mt-1">Archive of all generated assets</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="flex bg-[#111] border border-white/10 rounded-lg p-1">
                            {(['all', 'image', 'video'] as const).map(f => (
                                <button 
                                    key={f}
                                    onClick={() => setFilter(f)}
                                    className={`px-3 py-1 text-[10px] font-bold uppercase rounded-md transition-all ${filter === f ? 'bg-blue-600 text-white' : 'text-slate-500 hover:text-slate-300'}`}
                                >
                                    {f}
                                </button>
                            ))}
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition text-slate-400 hover:text-white">
                            <XMarkIcon />
                        </button>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                    {filteredItems.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-slate-600 space-y-4">
                            <span className="text-5xl opacity-20">🖼️</span>
                            <p className="text-sm font-mono uppercase tracking-widest">No spectral assets found</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                            {filteredItems.map((item, idx) => (
                                <div key={idx} className="group relative aspect-square bg-[#0a0a0a] rounded-xl overflow-hidden border border-white/5 hover:border-blue-500/50 transition-all shadow-xl">
                                    {item.type === 'image' ? (
                                        <img src={item.url} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                    ) : (
                                        <video src={item.url} className="w-full h-full object-cover" muted />
                                    )}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-4 flex flex-col justify-end">
                                        <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">{item.agentName}</p>
                                        <p className="text-[9px] text-slate-400">{new Date(item.timestamp).toLocaleDateString()}</p>
                                        <a href={item.url} download className="mt-2 text-[10px] bg-blue-600 hover:bg-blue-500 text-white font-bold py-1 px-2 rounded-md text-center">Download</a>
                                    </div>
                                    {item.type === 'video' && (
                                        <div className="absolute top-2 right-2 bg-black/60 rounded p-1">
                                            <span className="text-[10px]">🎥</span>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
