
import React, { useState, useRef } from 'react';
import { AGENT_TEMPLATES, AI_RESUMES } from '../constants';
import { AIModelProfile, AgentTemplate, Agent, Team, UserProfile } from '../types';

interface SpectrumViewProps {
    onHire: (profile: AIModelProfile | AgentTemplate) => void;
    onFabricateAgent: () => void;
    onInitializeGroup: () => void;
    agents: Agent[];
    teams: Team[];
    userProfile: UserProfile;
}

export const SpectrumView: React.FC<SpectrumViewProps> = ({ onHire, onFabricateAgent, onInitializeGroup, agents, teams, userProfile }) => {
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    const userAgents = agents.filter(a => !a.isSystem);
    const userTeams = teams.filter(t => !t.isSystem);

    const hasKeys = userProfile.apiKeys && userProfile.apiKeys.length > 0;
    const availableModels = hasKeys ? AI_RESUMES : [];

    const scrollToSection = (index: number) => {
        if (scrollContainerRef.current) {
            const sectionWidth = scrollContainerRef.current.offsetWidth;
            scrollContainerRef.current.scrollTo({
                left: index * sectionWidth,
                behavior: 'smooth'
            });
        }
    };

    return (
        <div className="flex-1 flex flex-col h-full bg-[#1A1A1A] animate-in fade-in duration-500 overflow-hidden">
            <header className="h-24 border-b border-white/5 flex flex-col justify-center px-8 bg-[#1A1A1A] flex-shrink-0">
                <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">Spectrum</span>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={() => scrollToSection(0)}
                        className="px-5 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all border border-white/10 hover:border-white/30 text-white/60 hover:text-white"
                    >
                        Available models
                    </button>
                    <button
                        onClick={() => scrollToSection(1)}
                        className="px-5 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all border border-white/10 hover:border-white/30 text-white/60 hover:text-white"
                    >
                        Your Agents & Groups
                    </button>
                    <button
                        onClick={() => scrollToSection(2)}
                        className="px-5 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all border border-white/10 hover:border-white/30 text-white/60 hover:text-white"
                    >
                        Special Agents
                    </button>
                </div>
            </header>

            <div
                ref={scrollContainerRef}
                className="flex-1 flex overflow-x-auto snap-x snap-mandatory custom-scrollbar scroll-smooth"
            >
                {/* SECTION 1: AVAILABLE MODELS */}
                <div className="min-w-full snap-start p-8 overflow-y-auto custom-scrollbar">
                    <div className="max-w-5xl mx-auto">
                        <div className="mb-8 flex items-center gap-4">
                            <h3 className="text-xs font-black text-white/40 uppercase tracking-[0.3em]">Available models (for you)</h3>
                            <div className="h-px flex-1 bg-white/5" />
                        </div>
                        {availableModels.length === 0 ? (
                            <div className="bg-white/[0.02] border border-white/5 rounded-[2rem] p-12 text-center max-w-2xl mx-auto flex flex-col items-center gap-6 saturate-0 opacity-50">
                                <span className="text-4xl block">🔑</span>
                                <h4 className="font-display font-extrabold text-white text-xl tracking-tight uppercase">API Key Required</h4>
                                <p className="text-[14px] text-slate-400 italic font-medium tracking-wide leading-relaxed">
                                    Please provide your Google Gemini API Key in your User Profile (bottom left) to unlock the Spectrum models roster.
                                </p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                                {availableModels.map(m => (
                                    <div key={m.id} className="bg-white/[0.02] border border-white/10 rounded-2xl p-8 flex flex-col items-center justify-center text-center gap-4 group hover:bg-white/[0.04] transition-all border-dashed aspect-square">
                                        <span className="text-4xl grayscale group-hover:grayscale-0 transition-all">{m.icon}</span>
                                        <div className="space-y-1">
                                            <h4 className="text-[11px] font-black text-white uppercase tracking-widest">{m.name}</h4>
                                            <p className="text-[9px] text-white/20 uppercase font-bold">{m.provider}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* SECTION 2: YOUR AGENTS & GROUPS */}
                <div className="min-w-full snap-start p-8 overflow-y-auto custom-scrollbar">
                    <div className="max-w-5xl mx-auto">
                        <div className="mb-8 flex items-center gap-4">
                            <h3 className="text-xs font-black text-white/40 uppercase tracking-[0.3em]">Your Agents & Groups</h3>
                            <div className="h-px flex-1 bg-white/5" />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                            <button
                                onClick={onFabricateAgent}
                                className="flex items-center justify-center gap-6 bg-white/[0.02] border border-dashed border-white/10 hover:border-white/20 rounded-2xl p-12 group transition-all"
                            >
                                <div className="w-12 h-12 rounded-lg bg-white/5 flex items-center justify-center text-white/40 group-hover:bg-white group-hover:text-black transition-all text-2xl font-bold">+</div>
                                <span className="text-xs font-black uppercase tracking-[0.2em] text-white/40 group-hover:text-white transition-colors">Custom Agent</span>
                            </button>

                            <button
                                onClick={onInitializeGroup}
                                className="flex items-center justify-center gap-6 bg-white/[0.02] border border-dashed border-white/10 hover:border-white/20 rounded-2xl p-12 group transition-all"
                            >
                                <div className="w-12 h-12 rounded-lg bg-white/5 flex items-center justify-center text-white/40 group-hover:bg-white group-hover:text-black transition-all text-2xl font-bold">⬡</div>
                                <span className="text-xs font-black uppercase tracking-[0.2em] text-white/40 group-hover:text-white transition-colors">Create Group</span>
                            </button>
                        </div>

                        <div className="flex flex-col gap-4">
                            {userAgents.map(agent => (
                                <ListItem
                                    key={agent.id}
                                    icon={agent.icon}
                                    name={agent.name}
                                    sub={agent.role}
                                    tagline={agent.jobDescription.slice(0, 100) + '...'}
                                    onClick={() => { }}
                                    isExpanded={expandedId === agent.id}
                                    onToggleExpand={() => setExpandedId(expandedId === agent.id ? null : agent.id)}
                                    details={agent.jobDescription}
                                />
                            ))}
                            {userTeams.map(team => (
                                <ListItem
                                    key={team.id}
                                    icon="⬡"
                                    name={team.name}
                                    sub="Group Command"
                                    tagline={team.description || "No objective defined."}
                                    onClick={() => { }}
                                    isExpanded={expandedId === team.id}
                                    onToggleExpand={() => setExpandedId(expandedId === team.id ? null : team.id)}
                                    details={`${team.agents.length} specialized units enrolled.`}
                                />
                            ))}
                        </div>
                    </div>
                </div>

                {/* SECTION 3: SPECIAL AGENTS */}
                <div className="min-w-full snap-start p-8 overflow-y-auto custom-scrollbar">
                    <div className="max-w-5xl mx-auto">
                        <div className="mb-8 flex items-center gap-4">
                            <h3 className="text-xs font-black text-white/40 uppercase tracking-[0.3em]">Special Agents</h3>
                            <div className="h-px flex-1 bg-white/5" />
                        </div>

                        <div className="flex flex-col gap-4">
                            {AGENT_TEMPLATES.map(item => (
                                <ListItem
                                    key={item.id}
                                    icon={item.icon}
                                    name={item.name}
                                    sub={item.role}
                                    tagline={item.tagline}
                                    onClick={() => onHire(item)}
                                    isExpanded={expandedId === item.id}
                                    onToggleExpand={() => setExpandedId(expandedId === item.id ? null : item.id)}
                                    details={item.jobDescription}
                                />
                            ))}
                            {AI_RESUMES.map(model => (
                                <ListItem
                                    key={model.id}
                                    icon={model.icon}
                                    name={model.name}
                                    sub={model.tagline}
                                    tagline={model.summary}
                                    onClick={() => onHire(model)}
                                    isExpanded={expandedId === model.id}
                                    onToggleExpand={() => setExpandedId(expandedId === model.id ? null : model.id)}
                                    details={model.bestFor.join(', ')}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const ListItem: React.FC<{
    icon: string;
    name: string;
    sub: string;
    tagline: string;
    onClick: () => void;
    isExpanded: boolean;
    onToggleExpand: () => void;
    details: string;
}> = ({ icon, name, sub, tagline, onClick, isExpanded, onToggleExpand, details }) => (
    <div className={`group relative bg-black/20 border border-white/10 hover:border-white/20 transition-all duration-300 rounded-2xl overflow-hidden ${isExpanded ? 'ring-1 ring-white/10' : ''}`}>
        <div className="flex items-center gap-6 p-5">
            <div className="w-14 h-14 bg-white/5 border border-white/5 rounded-xl flex items-center justify-center text-2xl flex-shrink-0 group-hover:scale-105 transition-transform grayscale opacity-60 group-hover:opacity-100 group-hover:grayscale-0">
                {icon}
            </div>

            <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-4">
                    <h4 className="font-black text-white text-base uppercase tracking-tight truncate">{name}</h4>
                    <span className="text-[10px] text-white/20 uppercase tracking-widest font-mono hidden sm:inline font-bold">{sub}</span>
                </div>
                <p className="text-xs text-white/40 italic truncate mt-1">"{tagline}"</p>
            </div>

            <div className="flex items-center gap-4 flex-shrink-0">
                <button
                    onClick={onToggleExpand}
                    className={`p-3 rounded-xl transition-all border ${isExpanded ? 'bg-white text-black border-white' : 'bg-white/5 text-white/40 hover:text-white border-white/5 hover:border-white/20'}`}
                    title="View Details"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" /></svg>
                </button>
                <button
                    onClick={onClick}
                    className="px-8 py-3 bg-white text-black text-[10px] font-black uppercase tracking-[0.2em] rounded-xl hover:bg-slate-100 transition-all active:scale-95 shadow-lg"
                >
                    Deploy
                </button>
            </div>
        </div>

        {isExpanded && (
            <div className="px-5 pb-8 pt-2 animate-in slide-in-from-top-2 duration-300">
                <div className="bg-black/40 border border-white/5 rounded-xl p-6">
                    <div className="flex items-center gap-3 mb-6 opacity-40">
                        <div className="h-px flex-1 bg-white/20" />
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.4em]">Protocol_Context</span>
                        <div className="h-px flex-1 bg-white/20" />
                    </div>
                    <div className="text-[12px] text-white/70 leading-relaxed font-mono whitespace-pre-wrap">
                        {details}
                    </div>
                    <div className="mt-8 flex justify-end">
                        <button
                            onClick={onClick}
                            className="px-10 py-3 bg-white text-black text-[11px] font-black uppercase tracking-[0.2em] rounded-xl shadow-xl hover:scale-[1.02] active:scale-95 transition-all"
                        >
                            Confirm Deployment
                        </button>
                    </div>
                </div>
            </div>
        )}
    </div>
);
