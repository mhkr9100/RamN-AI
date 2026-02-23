
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

                    <h1 className="font-display text-6xl md:text-8xl font-extrabold text-white tracking-[-0.04em] mb-8 leading-[0.9]">
                        RamN <span className="font-light italic opacity-40 text-slate-200">AI</span>
                    </h1>

                    <p className="text-slate-400 text-sm font-medium tracking-[0.4em] uppercase mb-16 max-w-lg leading-relaxed">
                        Beta v1.0 • <span className="text-white border-b border-white/20 pb-0.5">Multi-Agent Workspace</span>
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

                    {/* Agent Suggestion Cards */}
                    <div className="mt-8 flex flex-wrap justify-center gap-3 max-w-2xl px-4 w-full animate-in fade-in slide-in-from-bottom-16 duration-1000 delay-300">
                        {[
                            { label: "Full-Stack Developer", prompt: "Create a full-stack Next.js app with Tailwind for an e-commerce store", icon: "💻" },
                            { label: "Content Strategist", prompt: "Write a 3-month content strategy for a B2B SaaS startup", icon: "✍️" },
                            { label: "Data Analyst", prompt: "Analyze this dataset for customer churn trends", icon: "📊" }
                        ].map((suggestion, idx) => (
                            <button
                                key={idx}
                                onClick={() => onStartPrismChat(suggestion.prompt)}
                                className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.03] border border-white/10 hover:bg-white/[0.08] hover:border-white/20 transition-all text-sm text-slate-300 hover:text-white"
                            >
                                <span>{suggestion.icon}</span>
                                <span>{suggestion.label}</span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="max-w-6xl mx-auto w-full p-8 md:p-24 space-y-48">
                <div className="space-y-20">
                    <div className="flex flex-col items-center space-y-6 text-center">
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.8em]">Available Intelligence</span>
                        <h2 className="font-display text-5xl font-extrabold text-white tracking-tight">AI <span className="italic font-light text-slate-500">Models</span></h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {AI_RESUMES.map((model, idx) => (
                            <div key={model.id} className="bg-white/[0.03] border border-white/5 rounded-[3rem] p-12 group hover:bg-white/[0.06] transition-all duration-700 hover:scale-[1.02] flex flex-col h-full">
                                <div className="flex items-center justify-between mb-12">
                                    <div className="w-16 h-16 rounded-3xl bg-black border border-white/10 flex items-center justify-center text-4xl shadow-inner">
                                        <span className="grayscale opacity-40 group-hover:opacity-100 group-hover:grayscale-0 transition-all">{model.icon}</span>
                                    </div>
                                    <span className="text-[9px] font-mono border border-white/10 px-4 py-1.5 rounded-full text-slate-500 uppercase tracking-[0.4em]">
                                        MOD_{idx + 1}
                                    </span>
                                </div>
                                <h4 className="font-display font-extrabold text-white mb-4 text-xl tracking-tight uppercase">{model.name}</h4>
                                <p className="text-[14px] text-slate-400 italic mb-14 font-medium tracking-wide leading-relaxed flex-grow">"{model.tagline}"</p>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="pt-48 pb-24 border-t border-white/5 text-center flex flex-col items-center gap-10">
                    <RamanIcon size={60} className="opacity-40" />
                    <p className="text-[10px] text-slate-600 font-black tracking-[1.5em] uppercase">
                        RamN AI Protocol • v1.0-BETA
                    </p>
                </div>
            </div>
        </div>
    );
};
