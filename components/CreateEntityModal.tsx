
import React, { useState, useEffect } from 'react';
import { Agent, Team, AgentCapability } from '../types';
import { XMarkIcon } from './icons/XMarkIcon';
import { AI_RESUMES } from '../constants';

interface CreateEntityModalProps {
  isOpen: boolean;
  type: 'employee' | 'rouge' | 'project';
  employees: Agent[];
  onClose: () => void;
  onCreateEmployee: (data: any) => void;
  onCreateGroup: (data: any) => void;
  initialValues?: { profileId?: string, role?: string, jd?: string, name?: string, capabilities?: AgentCapability[] };
}

export const CreateEntityModal: React.FC<CreateEntityModalProps> = ({ 
    isOpen, 
    type, 
    onClose, 
    onCreateEmployee, 
    onCreateGroup, 
    initialValues, 
    employees
}) => {
    const [name, setName] = useState(initialValues?.name || ''); 
    const [jd, setJd] = useState(initialValues?.jd || ''); 
    const [description, setDescription] = useState('');
    const [selectedProfileId, setSelectedProfileId] = useState(initialValues?.profileId || AI_RESUMES[0].id);
    const [selectedCapabilities, setSelectedCapabilities] = useState<AgentCapability[]>(initialValues?.capabilities || []);

    const CAPABILITY_LIST: { id: AgentCapability, label: string, icon: string }[] = [
        { id: 'googleSearch', label: 'Search', icon: '🔍' },
        { id: 'googleMaps', label: 'Maps', icon: '📍' },
        { id: 'thinking', label: 'Deep Reason', icon: '🧠' },
        { id: 'imageGeneration', label: 'Image Gen', icon: '🎨' },
        { id: 'videoGeneration', label: 'Video Gen', icon: '🎬' },
        { id: 'fileManipulation', label: 'Files', icon: '📂' },
    ];

    useEffect(() => {
        if (initialValues) {
            if (initialValues.jd) setJd(initialValues.jd);
            if (initialValues.profileId) setSelectedProfileId(initialValues.profileId);
            if (initialValues.name) setName(initialValues.name);
            if (initialValues.capabilities) setSelectedCapabilities(initialValues.capabilities);
        }
    }, [initialValues]);

    if (!isOpen) return null;

    const toggleCapability = (capId: AgentCapability) => {
        setSelectedCapabilities(prev => 
            prev.includes(capId) ? prev.filter(c => c !== capId) : [...prev, capId]
        );
    };

    const handleSaveEmployee = () => {
        const profile = AI_RESUMES.find(p => p.id === selectedProfileId) || AI_RESUMES[0];
        onCreateEmployee({
            name: name.trim(), 
            role: name.trim(),
            jobDescription: jd,
            icon: profile.icon, 
            provider: profile.provider,
            model: profile.modelId,
            apiKey: profile.defaultApiKey,
            isDeletable: true,
            capabilities: selectedCapabilities
        });
        onClose();
    };

    const handleSaveGroup = () => {
        onCreateGroup({
            name, 
            description,
            agentIds: Array.from(selectedExistingIds),
            type: type
        });
        onClose();
    };

    const [selectedExistingIds, setSelectedExistingIds] = useState<Set<string>>(new Set());
    const toggleExistingAgent = (id: string) => {
        setSelectedExistingIds(prev => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };

    return (
        <div className="fixed inset-0 bg-black/80 z-[60] flex items-center justify-center p-4">
            <div className="bg-[#1A1A1A] w-full max-w-xl rounded-2xl shadow-2xl border border-white/10 flex flex-col overflow-hidden max-h-[90vh]">
                <div className="flex items-center justify-between p-6 border-b border-white/10">
                    <h2 className="text-xl font-bold text-white uppercase tracking-tight">
                        {type === 'employee' ? 'Create Agent' : 'Create Team'}
                    </h2>
                    <button onClick={onClose} className="hover:text-white text-white/40 transition"><XMarkIcon /></button>
                </div>
                
                <div className="p-6 space-y-6 overflow-y-auto custom-scrollbar">
                    {type === 'employee' ? (
                        <>
                            <div>
                                <label className="block text-[10px] font-black text-white/40 uppercase tracking-widest mb-2">Agent Name</label>
                                <input 
                                    type="text" 
                                    value={name} 
                                    onChange={e => setName(e.target.value)} 
                                    className="w-full bg-black border border-white/10 rounded-xl p-3 text-white focus:border-white outline-none text-sm" 
                                    placeholder="e.g. Content Strategist" 
                                />
                            </div>

                            <div>
                                <label className="block text-[10px] font-black text-white/40 uppercase tracking-widest mb-2">AI Model (Brain)</label>
                                <select 
                                    value={selectedProfileId} 
                                    onChange={e => setSelectedProfileId(e.target.value)} 
                                    className="w-full bg-black border border-white/10 rounded-xl p-3 text-white focus:border-white outline-none text-sm appearance-none"
                                >
                                    {AI_RESUMES.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                </select>
                            </div>

                            <div>
                                <label className="block text-[10px] font-black text-white/40 uppercase tracking-widest mb-2">System Instructions</label>
                                <textarea 
                                    value={jd} 
                                    onChange={e => setJd(e.target.value)} 
                                    rows={6} 
                                    className="w-full bg-black border border-white/10 rounded-xl p-4 text-white focus:border-white outline-none text-xs leading-relaxed resize-none" 
                                    placeholder="Define exactly how this agent should behave..." 
                                />
                            </div>

                            <div>
                                <label className="block text-[10px] font-black text-white/40 uppercase tracking-widest mb-3">Tools</label>
                                <div className="grid grid-cols-2 gap-2">
                                    {CAPABILITY_LIST.map(cap => (
                                        <button 
                                            key={cap.id} 
                                            type="button" 
                                            onClick={() => toggleCapability(cap.id)} 
                                            className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${selectedCapabilities.includes(cap.id) ? 'bg-white/10 border-white/40' : 'bg-black border-white/5 hover:border-white/20'}`}
                                        >
                                            <span className="text-lg">{cap.icon}</span>
                                            <span className="text-[10px] font-bold text-white uppercase">{cap.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </>
                    ) : (
                        <>
                            <div>
                                <label className="block text-[10px] font-black text-white/40 uppercase tracking-widest mb-2">Team Name</label>
                                <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full bg-black border border-white/10 rounded-xl p-3 text-white focus:border-white outline-none text-sm" placeholder="e.g. Project Alpha" />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-white/40 uppercase tracking-widest mb-2">Team Objective</label>
                                <textarea value={description} onChange={e => setDescription(e.target.value)} rows={2} className="w-full bg-black border border-white/10 rounded-xl p-3 text-white focus:border-white outline-none text-sm resize-none" placeholder="What is the goal of this team?" />
                            </div>
                            
                            <div className="bg-black border border-white/5 rounded-2xl p-4">
                                <h3 className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-4">Select Members</h3>
                                <div className="max-h-40 overflow-y-auto space-y-1 custom-scrollbar">
                                    {employees.map(agent => (
                                        <div key={agent.id} className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition ${selectedExistingIds.has(agent.id) ? 'bg-white/10' : 'hover:bg-white/5'}`} onClick={() => toggleExistingAgent(agent.id)}>
                                            <input type="checkbox" checked={selectedExistingIds.has(agent.id)} readOnly className="rounded border-white/20 bg-black text-white" />
                                            <span className="text-sm text-white/80">{agent.name}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </>
                    )}
                </div>

                <div className="p-6 border-t border-white/10 flex justify-end">
                    <button 
                        type="button" 
                        onClick={type === 'employee' ? handleSaveEmployee : handleSaveGroup} 
                        disabled={!name.trim() || (type === 'employee' ? !jd.trim() : selectedExistingIds.size === 0)}
                        className="bg-white text-black text-[10px] font-black uppercase tracking-[0.2em] py-4 px-12 rounded-xl disabled:opacity-30 transition hover:bg-white/90 active:scale-95"
                    >
                        {type === 'employee' ? 'Create Agent' : 'Create Team'}
                    </button>
                </div>
            </div>
        </div>
    );
};
