
import React, { useState, useEffect } from 'react';
import { UserProfile } from '../types';
import { XMarkIcon } from './icons/XMarkIcon';

interface UserProfileModalProps {
    user: UserProfile;
    isOpen: boolean;
    onClose: () => void;
    onSave: (user: UserProfile) => void;
    onLogout?: () => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({ user, isOpen, onClose, onSave, onLogout }) => {
    const [name, setName] = useState(user.name);
    const [email, setEmail] = useState(user.email);
    const [avatar, setAvatar] = useState(user.avatar || '');

    // Multi-Provider API Keys
    const [openAiKey, setOpenAiKey] = useState(user.openAiKey || '');
    const [anthropicKey, setAnthropicKey] = useState(user.anthropicKey || '');
    const [geminiKey, setGeminiKey] = useState(user.geminiKey || '');

    const [activeTab, setActiveTab] = useState<'identity' | 'keys'>('identity');
    const [keyStatus, setKeyStatus] = useState<Record<string, 'valid' | 'invalid' | 'testing' | undefined>>({});

    const validateKey = async (provider: string, key: string) => {
        if (!key.trim()) return;
        setKeyStatus(s => ({ ...s, [provider]: 'testing' }));
        try {
            if (provider === 'gemini') {
                const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${key}`);
                setKeyStatus(s => ({ ...s, gemini: res.ok ? 'valid' : 'invalid' }));
            } else if (provider === 'openai') {
                const res = await fetch('https://api.openai.com/v1/models', {
                    headers: { 'Authorization': `Bearer ${key}` }
                });
                setKeyStatus(s => ({ ...s, openai: res.ok ? 'valid' : 'invalid' }));
            } else if (provider === 'anthropic') {
                // Anthropic doesn't have a lightweight /models endpoint; just validate format
                const valid = key.startsWith('sk-ant-');
                setKeyStatus(s => ({ ...s, anthropic: valid ? 'valid' : 'invalid' }));
            }
        } catch {
            setKeyStatus(s => ({ ...s, [provider]: 'invalid' }));
        }
    };

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({
            ...user,
            name,
            email,
            avatar,
            openAiKey: openAiKey.trim(),
            anthropicKey: anthropicKey.trim(),
            geminiKey: geminiKey.trim()
        });
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center p-4">
            <div className="bg-[#1A1A1A] w-full max-w-xl rounded-2xl shadow-2xl border border-white/10 overflow-hidden flex flex-col max-h-[90vh]">
                <div className="flex items-center justify-between p-6 border-b border-white/10 bg-[#1A1A1A] flex-shrink-0">
                    <h2 className="text-xl font-bold text-white tracking-tight uppercase">User Profile</h2>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition text-white/40 hover:text-white">
                        <XMarkIcon />
                    </button>
                </div>

                <div className="flex border-b border-white/5 bg-black/20 flex-shrink-0">
                    <button
                        onClick={() => setActiveTab('identity')}
                        className={`px-6 py-3 text-[10px] font-black uppercase tracking-widest transition-all border-b-2 ${activeTab === 'identity' ? 'text-white border-white' : 'text-white/20 border-transparent hover:text-white/40'}`}
                    >
                        Identity
                    </button>
                    <button
                        onClick={() => setActiveTab('keys')}
                        className={`px-6 py-3 text-[10px] font-black uppercase tracking-widest transition-all border-b-2 ${activeTab === 'keys' ? 'text-white border-white' : 'text-white/20 border-transparent hover:text-white/40'}`}
                    >
                        API Keys
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar p-8">
                    <form onSubmit={handleSubmit} className="space-y-8">
                        {activeTab === 'identity' && (
                            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                <div className="flex flex-col items-center space-y-4">
                                    <div className="w-24 h-24 rounded-full bg-white/5 flex items-center justify-center text-4xl relative overflow-hidden ring-1 ring-white/10 border border-white/5">
                                        {avatar ? (
                                            <img src={avatar} alt="Profile" className="w-full h-full object-cover" />
                                        ) : (
                                            <span className="text-white/20">👤</span>
                                        )}
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-[10px] font-black text-white/30 uppercase tracking-widest mb-2">Account Identity</label>
                                        <div className="bg-black/20 border border-white/5 rounded-xl p-3 mb-4">
                                            <p className="text-[10px] text-white/40 uppercase tracking-widest mb-1">Email Address</p>
                                            <p className="text-sm text-white font-medium">{email}</p>
                                        </div>
                                        <label className="block text-[10px] font-black text-white/30 uppercase tracking-widest mb-2">Display Name</label>
                                        <input
                                            type="text"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            className="w-full bg-[#1A1A1A] border border-white/10 rounded-xl p-3 text-sm text-white focus:border-white outline-none transition-all"
                                            required
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'keys' && (
                            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-xl p-4">
                                    <h4 className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1">API Connectors</h4>
                                    <p className="text-[9px] text-white/40 leading-relaxed">
                                        All agents (including Prism) use your API keys. Add at least one key to get started. Click "Test" to validate.
                                    </p>
                                </div>

                                <div className="space-y-4">
                                    {/* OpenAI */}
                                    <div className="space-y-2">
                                        <div className="flex gap-4 items-center">
                                            <div className="w-1/3 text-[10px] font-black uppercase tracking-widest text-white/60">
                                                OpenAI
                                                {keyStatus.openai && <span className="ml-2">{keyStatus.openai === 'valid' ? '✅' : keyStatus.openai === 'invalid' ? '❌' : '⏳'}</span>}
                                            </div>
                                            <input
                                                type="password"
                                                value={openAiKey}
                                                onChange={e => { setOpenAiKey(e.target.value); setKeyStatus(s => ({ ...s, openai: undefined })); }}
                                                placeholder="sk-proj-..."
                                                className="flex-1 bg-black border border-white/10 rounded-xl p-3 text-xs font-mono text-white focus:border-indigo-500 outline-none transition-all"
                                            />
                                            <button type="button" onClick={() => validateKey('openai', openAiKey)} disabled={!openAiKey.trim()} className="px-3 py-2 text-[9px] font-bold uppercase bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-white/60 disabled:opacity-30 transition-all">Test</button>
                                        </div>
                                    </div>
                                    {/* Anthropic */}
                                    <div className="space-y-2">
                                        <div className="flex gap-4 items-center">
                                            <div className="w-1/3 text-[10px] font-black uppercase tracking-widest text-white/60">
                                                Anthropic
                                                {keyStatus.anthropic && <span className="ml-2">{keyStatus.anthropic === 'valid' ? '✅' : keyStatus.anthropic === 'invalid' ? '❌' : '⏳'}</span>}
                                            </div>
                                            <input
                                                type="password"
                                                value={anthropicKey}
                                                onChange={e => { setAnthropicKey(e.target.value); setKeyStatus(s => ({ ...s, anthropic: undefined })); }}
                                                placeholder="sk-ant-api03-..."
                                                className="flex-1 bg-black border border-white/10 rounded-xl p-3 text-xs font-mono text-white focus:border-indigo-500 outline-none transition-all"
                                            />
                                            <button type="button" onClick={() => validateKey('anthropic', anthropicKey)} disabled={!anthropicKey.trim()} className="px-3 py-2 text-[9px] font-bold uppercase bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-white/60 disabled:opacity-30 transition-all">Test</button>
                                        </div>
                                    </div>
                                    {/* Gemini */}
                                    <div className="space-y-2">
                                        <div className="flex gap-4 items-center">
                                            <div className="w-1/3 text-[10px] font-black uppercase tracking-widest text-white/60">
                                                Google Gemini
                                                {keyStatus.gemini && <span className="ml-2">{keyStatus.gemini === 'valid' ? '✅' : keyStatus.gemini === 'invalid' ? '❌' : '⏳'}</span>}
                                            </div>
                                            <input
                                                type="password"
                                                value={geminiKey}
                                                onChange={e => { setGeminiKey(e.target.value); setKeyStatus(s => ({ ...s, gemini: undefined })); }}
                                                placeholder="AIzaSy..."
                                                className="flex-1 bg-black border border-white/10 rounded-xl p-3 text-xs font-mono text-white focus:border-indigo-500 outline-none transition-all"
                                            />
                                            <button type="button" onClick={() => validateKey('gemini', geminiKey)} disabled={!geminiKey.trim()} className="px-3 py-2 text-[9px] font-bold uppercase bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-white/60 disabled:opacity-30 transition-all">Test</button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}



                        <div className="pt-4 flex flex-col gap-3 flex-shrink-0">
                            <button
                                type="submit"
                                className="w-full py-4 bg-white text-black text-[11px] font-black uppercase tracking-widest rounded-xl transition-all shadow-xl active:scale-[0.98]"
                            >
                                Save Profile Changes
                            </button>

                            {onLogout && (
                                <button
                                    type="button"
                                    onClick={onLogout}
                                    className="w-full py-3 text-red-500/80 hover:text-red-500 text-[10px] font-black uppercase tracking-widest transition-all"
                                >
                                    Log Out
                                </button>
                            )}
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};
