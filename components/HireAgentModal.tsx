
import React, { useState } from 'react';
import { Agent } from '../types';
import { XMarkIcon } from './icons/XMarkIcon';
import { AI_RESUMES } from '../constants';

interface HireAgentModalProps {
    onClose: () => void;
    onHire: (agent: Omit<Agent, 'id' | 'type'>) => void;
}

const GOOGLE_PROVIDERS = AI_RESUMES.filter(p => p.provider === 'google');

export const HireAgentModal: React.FC<HireAgentModalProps> = ({ onClose, onHire }) => {
    const [step, setStep] = useState<'select' | 'configure'>('select');
    const [selectedProfile, setSelectedProfile] = useState<typeof GOOGLE_PROVIDERS[0] | null>(null);
    
    const [role, setRole] = useState('');
    const [jobDescription, setJobDescription] = useState('');
    const [apiKey, setApiKey] = useState('');

    const handleSelect = (profile: typeof GOOGLE_PROVIDERS[0]) => {
        setSelectedProfile(profile);
        setApiKey(profile.defaultApiKey || '');
        setStep('configure');
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (role && jobDescription && selectedProfile) {
            onHire({
                name: role, 
                role,
                jobDescription,
                icon: selectedProfile.icon,
                provider: 'google',
                model: selectedProfile.modelId,
                apiKey: apiKey, 
                isDeletable: true
            });
        }
    };

    return (
        <div className="fixed inset-0 bg-black/80 z-[60] flex items-center justify-center p-4">
            <div className="bg-[#202123] w-full max-w-4xl h-[85vh] rounded-2xl shadow-2xl border border-gray-700 flex flex-col overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-700 bg-[#2a2b32]">
                    <div>
                        <h2 className="text-2xl font-bold text-white">Manual Recruitment</h2>
                        <p className="text-gray-400 text-sm mt-1">Configure a custom Google agent architecture.</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-700 rounded-full transition">
                        <XMarkIcon />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 bg-[#343541]">
                    {step === 'select' ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {GOOGLE_PROVIDERS.map((profile, idx) => (
                                <button 
                                    key={idx}
                                    onClick={() => handleSelect(profile)}
                                    className="bg-[#202123] border border-gray-700 hover:border-indigo-500 hover:bg-gray-700/20 rounded-xl p-5 flex flex-col text-left transition shadow-lg group"
                                >
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="text-3xl bg-gray-800 w-12 h-12 flex items-center justify-center rounded-lg group-hover:scale-110 transition-transform">{profile.icon}</div>
                                        <div>
                                            <h3 className="font-bold text-white">{profile.name}</h3>
                                            <p className="text-xs text-indigo-300 truncate w-32">{profile.modelId}</p>
                                        </div>
                                    </div>
                                    <p className="text-sm text-gray-400 mt-auto">{profile.tagline}</p>
                                </button>
                            ))}
                        </div>
                    ) : (
                        <div className="max-w-2xl mx-auto">
                            <button onClick={() => setStep('select')} className="text-indigo-400 hover:text-indigo-300 text-sm mb-4 flex items-center gap-1">
                                ← Back to Spectrum
                            </button>
                            <div className="bg-[#202123] p-8 rounded-xl border border-gray-700 shadow-xl">
                                <div className="flex items-center gap-4 mb-6 border-b border-gray-700 pb-6">
                                    <div className="text-4xl">{selectedProfile?.icon}</div>
                                    <div>
                                        <h3 className="text-xl font-bold text-white">Recruit {selectedProfile?.name}</h3>
                                        <p className="text-sm text-gray-400">Configure Role & Responsibilities</p>
                                    </div>
                                </div>

                                <form onSubmit={handleSubmit} className="space-y-5">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-1">Role (Title)</label>
                                        <input 
                                            type="text" 
                                            value={role} 
                                            onChange={e => setRole(e.target.value)} 
                                            className="w-full bg-gray-700 rounded-lg border border-gray-600 p-3 text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent" 
                                            placeholder="e.g. Senior Copywriter" 
                                            required 
                                        />
                                    </div>
                                    
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-1">
                                            Operational Instructions
                                        </label>
                                        <textarea 
                                            value={jobDescription} 
                                            onChange={e => setJobDescription(e.target.value)} 
                                            rows={6} 
                                            className="w-full bg-gray-700 rounded-lg border border-gray-600 p-3 text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent" 
                                            placeholder="Define the behavior and constraints..." 
                                            required 
                                        />
                                    </div>

                                    <div className="pt-4 border-t border-gray-700">
                                        <label className="block text-sm font-medium text-gray-300 mb-1">Project API Key (Optional)</label>
                                        <input 
                                            type="password" 
                                            value={apiKey} 
                                            onChange={e => setApiKey(e.target.value)} 
                                            className="w-full bg-gray-700 rounded-lg border border-gray-600 p-3 text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent font-mono text-sm" 
                                            placeholder="Leave empty to use global key" 
                                        />
                                    </div>

                                    <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 rounded-lg transition mt-4">
                                        Confirm Recruitment
                                    </button>
                                </form>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
