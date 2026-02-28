import React from 'react';
import { RamanIcon } from './icons/RamanIcon';
import { motion } from 'motion/react';
import { Key, Bot, Users, MessageSquare, Sparkles, HelpCircle } from 'lucide-react';

interface HomeViewProps {
    onStartChat: () => void;
    onOpenProfile: () => void;
}

export const HomeView: React.FC<HomeViewProps> = ({ onStartChat, onOpenProfile }) => {
    return (
        <div className="flex-1 overflow-y-auto bg-[#1A1A1A] custom-scrollbar">
            <div className="max-w-5xl mx-auto px-6 py-20 md:py-32">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="flex flex-col items-center text-center space-y-12"
                >
                    <div className="text-white/30">
                        <RamanIcon size={120} />
                    </div>

                    <div className="space-y-6">
                        <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-white uppercase leading-none">
                            Refract <span className="text-white/20">Intent</span>
                            <span className="text-[12px] uppercase tracking-widest text-slate-500 font-bold ml-4 align-top border border-white/10 bg-white/5 rounded px-2 py-0.5">Beta</span>
                        </h1>
                        <p className="text-lg md:text-xl text-white/60 font-medium max-w-2xl mx-auto leading-relaxed">
                            Stop wasting time on prompt engineering. Create specialized AI Agents or entire Squads
                            with a single natural language instruction via Prism Core.
                        </p>
                    </div>

                    <div className="flex flex-col md:flex-row gap-4 pt-4">
                        <button
                            onClick={onStartChat}
                            className="px-16 py-5 bg-white text-black text-xs font-black uppercase tracking-[0.3em] rounded-2xl transition-all shadow-2xl hover:bg-slate-200 active:scale-[0.98]"
                        >
                            Launch Orchestrator
                        </button>
                    </div>

                    <div className="w-full pt-20 space-y-16">
                        <div className="space-y-4">
                            <h2 className="text-[10px] font-black text-white/30 uppercase tracking-[0.5em]">The Core Experience</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <motion.div
                                    whileHover={{ scale: 1.02 }}
                                    className="p-6 bg-white/[0.02] border border-white/5 rounded-3xl flex gap-6 text-left"
                                >
                                    <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 flex-shrink-0">
                                        <Bot size={20} />
                                    </div>
                                    <div className="space-y-2">
                                        <h3 className="text-sm font-bold text-white uppercase tracking-widest">1. Agent Fabrication</h3>
                                        <p className="text-xs text-white/40 leading-relaxed">
                                            Just give Prism a goal. It will architect the role, instructions, and tools instantly.
                                            One prompt creates your custom expert.
                                        </p>
                                    </div>
                                </motion.div>

                                <motion.div
                                    whileHover={{ scale: 1.02 }}
                                    className="p-6 bg-white/[0.02] border border-white/5 rounded-3xl flex gap-6 text-left"
                                >
                                    <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 flex-shrink-0">
                                        <Sparkles size={20} />
                                    </div>
                                    <div className="space-y-2">
                                        <h3 className="text-sm font-bold text-white uppercase tracking-widest">2. Smart Routing</h3>
                                        <p className="text-xs text-white/40 leading-relaxed">
                                            Not sure which model to use? Toggle <span className="text-white/60 font-bold">Route</span> and Prism will match your
                                            objective to the perfect brain—be it Gemini, Claude, or Llama.
                                        </p>
                                    </div>
                                </motion.div>

                                <motion.div
                                    whileHover={{ scale: 1.02 }}
                                    className="p-6 bg-white/[0.02] border border-white/5 rounded-3xl flex gap-6 text-left"
                                >
                                    <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-400 flex-shrink-0">
                                        <Users size={20} />
                                    </div>
                                    <div className="space-y-2">
                                        <h3 className="text-sm font-bold text-white uppercase tracking-widest">3. Squad Deployment</h3>
                                        <p className="text-xs text-white/40 leading-relaxed">
                                            Scale your workspace by deploying multi-agent teams. Orchestrate complex research,
                                            coding, or strategy workflows with coordinated intelligence.
                                        </p>
                                    </div>
                                </motion.div>

                                <motion.div
                                    whileHover={{ scale: 1.02 }}
                                    className="p-6 bg-white/[0.02] border border-white/5 rounded-3xl flex gap-6 text-left"
                                >
                                    <div className="w-12 h-12 rounded-2xl bg-rose-500/10 flex items-center justify-center text-rose-400 flex-shrink-0">
                                        <Sparkles size={20} />
                                    </div>
                                    <div className="space-y-2">
                                        <h3 className="text-sm font-bold text-white uppercase tracking-widest">4. Managed Precision</h3>
                                        <p className="text-xs text-white/40 leading-relaxed">
                                            Zero configuration. Zero API management. Focus solely on your output while
                                            RamN AI handles the infrastructure and reasoning layers.
                                        </p>
                                    </div>
                                </motion.div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-8 border-t border-white/5">
                            <div className="space-y-4 text-left">
                                <div className="flex items-center gap-3 text-white/20">
                                    <Bot size={16} />
                                    <span className="text-[10px] font-black uppercase tracking-widest">Specialist Roster</span>
                                </div>
                                <p className="text-[11px] text-white/40 leading-relaxed">
                                    Browse the Spectrum for pre-configured blueprints or let Prism create
                                    entirely new roles from scratch.
                                </p>
                            </div>
                            <div className="space-y-4 text-left">
                                <div className="flex items-center gap-3 text-white/20">
                                    <MessageSquare size={16} />
                                    <span className="text-[10px] font-black uppercase tracking-widest">Natural Control</span>
                                </div>
                                <p className="text-[11px] text-white/40 leading-relaxed">
                                    Talk to Prism like a colleague. Refine agent instructions on the fly and
                                    adjust goals with standard dialogue.
                                </p>
                            </div>
                            <div className="space-y-4 text-left">
                                <div className="flex items-center gap-3 text-white/20">
                                    <Sparkles size={16} />
                                    <span className="text-[10px] font-black uppercase tracking-widest">Deep Thinking</span>
                                </div>
                                <p className="text-[11px] text-white/40 leading-relaxed">
                                    Enable reasoning-first workflows with built-in Deep Thinking and
                                    Web Intelligence modules in every deployed unit.
                                </p>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

