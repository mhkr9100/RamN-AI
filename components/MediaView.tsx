
import React, { useState, useMemo } from 'react';
import { Message } from '../types';

interface MediaViewProps {
    chatHistory: Record<string, Message[]>;
}

export const MediaView: React.FC<MediaViewProps> = ({ chatHistory }) => {
    const [filter, setFilter] = useState<'all' | 'image' | 'video'>('all');

    const mediaItems = useMemo(() => {
        const items: { url: string; type: 'image' | 'video'; agentName: string; timestamp: number }[] = [];
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

    return (
        <div className="flex-1 flex flex-col h-full bg-[#1A1A1A] animate-in fade-in duration-500 overflow-hidden">
            <header className="h-16 border-b border-white/5 flex items-center justify-between px-8 bg-[#1A1A1A] flex-shrink-0">
                <div className="flex items-center gap-12">
                    <div className="flex bg-[#252525] border border-white/5 rounded-lg p-1">
                        {(['all', 'image', 'video'] as const).map(f => (
                            <button 
                                key={f}
                                onClick={() => setFilter(f)}
                                className={`px-4 py-1.5 text-[9px] font-black uppercase rounded-md transition-all ${filter === f ? 'bg-white text-black' : 'text-white/40 hover:text-white/60'}`}
                            >
                                {f}
                            </button>
                        ))}
                    </div>
                </div>
            </header>

            <div className="flex-1 overflow-y-auto custom-scrollbar p-8">
                <div className="max-w-6xl mx-auto">
                    {filteredItems.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-[60vh] text-white/10 uppercase tracking-[0.5em] text-xs">
                             <span className="text-4xl mb-4">🖼️</span>
                             No spectral assets found
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                            {filteredItems.map((item, idx) => (
                                <div key={idx} className="group relative aspect-square bg-black rounded-2xl overflow-hidden border border-white/5 hover:border-white transition-all shadow-xl">
                                    {item.type === 'image' ? (
                                        <img src={item.url} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                    ) : (
                                        <video src={item.url} className="w-full h-full object-cover" muted />
                                    )}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-6 flex flex-col justify-end">
                                        <p className="text-[10px] font-black text-white uppercase tracking-widest">{item.agentName}</p>
                                        <p className="text-[9px] text-white/40 font-mono mt-1">{new Date(item.timestamp).toLocaleDateString()}</p>
                                        <a href={item.url} download className="mt-4 text-[10px] bg-white text-black font-black uppercase tracking-widest py-2 rounded-lg text-center active:scale-95 transition-all">Download</a>
                                    </div>
                                    {item.type === 'video' && (
                                        <div className="absolute top-4 right-4 bg-black/60 rounded p-1.5">
                                            <span className="text-xs">🎥</span>
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
