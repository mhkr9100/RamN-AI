import React, { useState } from 'react';
import { AGENT_TEMPLATES } from '../constants';
import { AIModelProfile, AgentTemplate } from '../types';
import { XMarkIcon } from './icons/XMarkIcon';

interface AIResumeStackProps {
    onClose: () => void;
    onHire: (profile: AIModelProfile | AgentTemplate) => void;
}

export const AIResumeStack: React.FC<AIResumeStackProps> = ({ onClose, onHire }) => {
    const [expandedProfile, setExpandedProfile] = useState<string | null>(null);

    const toggleExpand = (id: string) => {
        if (expandedProfile === id) {
            setExpandedProfile(null);
        } else {
            setExpandedProfile(id);
        }
    };

    // Define the sections for the Spectrum
    const sections = [
        { 
            title: 'Sample Agents', 
            categories: ['Intelligence', 'Operations'],
            description: 'Core operational units for research, logic, and workflow automation.'
        },
        { 
            title: 'Sample Social Media Agents', 
            categories: ['Social Media'],
            description: 'Specialized content creators and growth hackers for social platforms.'
        }
    ];

    return (
        <div className="fixed inset-0 bg-black/90 z-[70] flex items-center justify-center p-4">
            <div className="bg-black w-full max-w-6xl h-[90vh] rounded-2xl shadow-2xl border border-white/20 flex flex-col overflow-hidden relative">
                <div className="flex items-center justify-between p-6 border-b border-white/10 bg-[#050505]">
                    <div>
                        <h2 className="text-2xl font-bold text-white tracking-tight">Spectrum: Specialized Units</h2>
                        <div className="text-[10px] text-slate-500 font-mono tracking-widest uppercase mt-1">
                            Deploy ready-to-work autonomous specialists
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition text-slate-400 hover:text-white">
                        <XMarkIcon />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 bg-black custom-scrollbar">
                    <div className="space-y-16">
                        {sections.map(section => {
                            const items = AGENT_TEMPLATES.filter(t => section.categories.includes(t.category));
                            if (items.length === 0) return null;
                            return (
                                <section key={section.title}>
                                    <div className="mb-8">
                                        <h3 className="text-xl font-bold text-white mb-1">{section.title}</h3>
                                        <p className="text-[10px] text-slate-500 font-mono uppercase tracking-widest">{section.description}</p>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {items.map((template, idx) => (
                                            <TemplateCard 
                                                key={template.id}
                                                index={idx + 1}
                                                template={template}
                                                onAdd={() => onHire(template)}
                                                isExpanded={expandedProfile === template.id}
                                                onToggle={() => toggleExpand(template.id)}
                                            />
                                        ))}
                                    </div>
                                </section>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};

const TemplateCard: React.FC<{ 
    template: AgentTemplate, 
    index: number, 
    onAdd: () => void,
    isExpanded: boolean,
    onToggle: () => void 
}> = ({ template, index, onAdd, isExpanded, onToggle }) => {
    return (
        <div className="bg-[#0a0a0a] border border-white/10 hover:border-blue-500/40 rounded-xl transition-all duration-300 flex flex-col p-5 group hover:shadow-lg hover:shadow-blue-900/10 relative">
            <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-lg bg-[#001f3f] border border-white/10 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                    {template.icon}
                </div>
                <div>
                    <h4 className="font-bold text-white text-sm leading-none mb-1">{template.name}</h4>
                    <span className="text-[10px] text-blue-400 font-mono uppercase tracking-wider">{template.role}</span>
                </div>
            </div>
            
            <p className="text-xs text-slate-400 italic mb-4 flex-grow leading-relaxed">"{template.tagline}"</p>
            
            <div className="space-y-3">
                <div className="text-[10px] text-slate-600 line-clamp-2">{template.jobDescription}</div>
                <div className="flex items-center gap-2">
                    <button 
                        onClick={onAdd}
                        className="flex-1 bg-[#001f3f] hover:bg-blue-900 text-white py-2 px-3 rounded-lg text-xs font-bold transition border border-white/10 shadow-lg"
                    >
                        Deploy Agent
                    </button>
                    <button 
                        onClick={onToggle} 
                        className="p-2 text-slate-400 hover:text-white bg-black hover:bg-white/5 border border-white/10 rounded-lg transition" 
                        title="View Details"
                    >
                         <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                        </svg>
                    </button>
                </div>
            </div>

            {isExpanded && (
                <div className="absolute inset-0 bg-black border border-white/30 shadow-2xl rounded-xl z-50 p-6 flex flex-col animate-in fade-in zoom-in-95 duration-200">
                    <div className="flex justify-between items-start mb-4 border-b border-white/10 pb-3">
                        <div>
                           <h4 className="font-bold text-white text-lg leading-none">{template.name}</h4>
                           <span className="text-[10px] text-blue-400 font-mono mt-1 block uppercase tracking-wider">{template.role}</span>
                        </div>
                        <button onClick={onToggle} className="text-slate-500 hover:text-white"><XMarkIcon /></button>
                    </div>
                    <div className="flex-1 overflow-y-auto space-y-4 text-xs custom-scrollbar">
                        <div>
                            <span className="block text-slate-500 font-bold uppercase text-[10px] mb-1">Mission Strategy</span>
                            <p className="text-slate-300 leading-relaxed italic">"{template.tagline}"</p>
                        </div>
                        <div>
                            <span className="block text-slate-500 font-bold uppercase text-[10px] mb-1">Operational Parameters</span>
                            <p className="text-slate-300 leading-relaxed">{template.jobDescription}</p>
                        </div>
                        <div className="bg-[#050505] p-3 rounded-lg border border-white/5">
                            <span className="block text-blue-400 font-bold uppercase text-[10px] mb-1">Architecture</span>
                            <p className="text-slate-300">Default Model: {template.defaultModelId}</p>
                        </div>
                    </div>
                    <button 
                        onClick={(e) => { e.stopPropagation(); onAdd(); }}
                        className="mt-5 w-full bg-[#001f3f] hover:bg-blue-900 text-white py-3 rounded-lg text-sm font-bold shadow-lg transition border border-white/10"
                    >
                        Confirm Deployment
                    </button>
                </div>
            )}
        </div>
    );
};