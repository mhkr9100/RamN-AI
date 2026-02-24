
import React, { useState } from 'react';
import { RamanIcon } from './icons/RamanIcon';
import { AI_RESUMES } from '../constants';

interface WelcomeScreenProps {
    onStartPrismChat: (initialPrompt: string) => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onStartPrismChat }) => {
    const [prismInput, setPrismInput] = useState('');

    const handlePrismSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (prismInput.trim()) {
            onStartPrismChat(prismInput);
        }
    };

    return (
        <div className="flex flex-col h-full bg-[#1A1A1A] overflow-y-auto custom-scrollbar">
            <div className="relative min-h-[70vh] flex-shrink-0 flex flex-col items-center justify-center border-b border-white/5 overflow-hidden px-6">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[500px] bg-white/[0.015] rounded-[100%] blur-[120px] -z-10" />
                <div className="z-10 flex flex-col items-center max-w-3xl w-full text-center animate-in fade-in slide-in-from-bottom-12 duration-1000">
                    <div className="relative mb-12 animate-float">
                        <RamanIcon size={120} className="transition-all duration-1000 hover:scale-105" />
                        <div className="absolute inset-0 blur-3xl bg-white/5 -z-10 opacity-60" />
                    </div>

                    <h1 className="font-display text-6xl md:text-8xl font-extrabold text-white tracking-[-0.04em] mb-4 leading-[0.9]">
                        RamN <span className="font-light italic opacity-40 text-slate-200">AI</span>
                        <span className="text-[12px] uppercase tracking-widest text-slate-500 font-bold ml-4 align-top border border-white/10 bg-white/5 rounded px-2 py-0.5">Beta</span>
                    </h1>

                    <p className="text-slate-400 text-sm font-medium tracking-[0.4em] uppercase mb-16 max-w-lg leading-relaxed mt-4">
                        <span className="text-white border-b border-white/20 pb-0.5">Multi-Agent Workspace</span>
                    </p>

                    <div className="w-full relative group max-w-xl">
                        <div className="absolute inset-0 -m-1 rounded-full bg-gradient-to-r from-white/10 to-transparent blur-md opacity-0 group-focus-within:opacity-100 transition-opacity duration-700" />
                        <div className="relative bg-white/[0.05] p-2 rounded-full border border-white/10 shadow-[0_30px_100px_rgba(0,0,0,0.6)] transition-all duration-500 group-focus-within:border-white/30 backdrop-blur-3xl">
                            <form onSubmit={handlePrismSubmit} className="flex items-center gap-2">
                                <input
                                    type="text"
                                    value={prismInput}
                                    onChange={(e) => setPrismInput(e.target.value)}
                                    placeholder="Describe your goal to get started..."
                                    className="flex-1 bg-transparent border-none focus:ring-0 text-white placeholder-slate-600 px-8 py-4 text-base font-light tracking-wide"
                                />
                                <button
                                    type="submit"
                                    className="bg-white hover:bg-slate-100 text-black px-10 py-4 rounded-full font-black text-[11px] uppercase tracking-[0.2em] shadow-xl transition-all hover:scale-105 active:scale-95"
                                >
                                    Initialize
                                </button>
                            </form>
                        </div>
                    </div>

                    <div className="mt-8 flex flex-col items-center max-w-2xl px-4 w-full animate-in fade-in slide-in-from-bottom-16 duration-1000 delay-300">
                        <div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-4">Quick Start Guide</div>
                        <div className="flex flex-wrap justify-center gap-3">
                            <button
                                onClick={() => onStartPrismChat("Create a full-stack Next.js app with Tailwind for an e-commerce store")}
                                className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.03] border border-white/10 hover:bg-white/[0.08] hover:border-white/20 transition-all text-sm text-slate-300 hover:text-white"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white/40"><polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline></svg>
                                <span>Create Route</span>
                            </button>
                            <button
                                onClick={() => onStartPrismChat("Write a 3-month content strategy for a B2B SaaS startup")}
                                className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.03] border border-white/10 hover:bg-white/[0.08] hover:border-white/20 transition-all text-sm text-slate-300 hover:text-white"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white/40"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
                                <span>Content Strategist</span>
                            </button>
                            <button
                                onClick={() => onStartPrismChat("Analyze this dataset for customer churn trends")}
                                className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.03] border border-white/10 hover:bg-white/[0.08] hover:border-white/20 transition-all text-sm text-slate-300 hover:text-white"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white/40"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg>
                                <span>Data Analyst</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-6xl mx-auto w-full p-8 md:p-24 space-y-48">
                <div className="space-y-20">
                    <div className="flex flex-col items-center space-y-6 text-center">
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.8em]">Available Intelligence</span>
                        <h2 className="font-display text-5xl font-extrabold text-white tracking-tight">AI <span className="italic font-light text-slate-500">Models</span></h2>
                    </div>

                    <div className="grid grid-cols-1 gap-8 place-items-center opacity-50 grayscale">
                        <div className="bg-white/[0.03] border border-white/5 rounded-[3rem] p-12 text-center max-w-md">
                            <span className="text-4xl mb-6 block">🔒</span>
                            <h4 className="font-display font-extrabold text-white mb-4 text-xl tracking-tight uppercase">Requires API Key</h4>
                            <p className="text-[14px] text-slate-400 italic font-medium tracking-wide leading-relaxed">
                                Provide your Google Gemini API Key in your User Profile to unlock the Spectrum models.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="space-y-20">
                    <div className="flex flex-col items-center space-y-6 text-center">
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.8em]">Workspace Roster</span>
                        <h2 className="font-display text-5xl font-extrabold text-white tracking-tight">Special <span className="italic font-light text-slate-500">Agents</span></h2>
                    </div>
                    <div className="text-center text-slate-500 text-sm font-bold tracking-widest uppercase border border-white/5 py-12 rounded-3xl bg-white/[0.01]">
                        Coming Soon
                    </div>
                </div>

                <div className="pt-48 pb-24 border-t border-white/5 text-center flex flex-col items-center gap-10">
                    <RamanIcon size={60} className="opacity-40" />
                    <p className="text-[10px] text-slate-600 font-black tracking-[1.5em] uppercase">
                        RamN AI
                    </p>
                </div>
            </div>
        </div>
    );
};
