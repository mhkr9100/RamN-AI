
import React, { useState, useEffect } from 'react';
import { UserProfile, ApiKeyEntry, UserMapNode } from '../types';
import { XMarkIcon } from './icons/XMarkIcon';
import { UserMapEditor } from './UserMap/UserMapEditor';

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
    const [localApiKeys, setLocalApiKeys] = useState<ApiKeyEntry[]>([{service: '', key: ''}]);
    const [localUserMap, setLocalUserMap] = useState<UserMapNode>(user.userMap || { id: 'root', label: 'My Ecosystem', children: [] });
    const [activeTab, setActiveTab] = useState<'identity' | 'keys' | 'map'>('identity');

    useEffect(() => {
        if (user.apiKeys && user.apiKeys.length > 0) {
            setLocalApiKeys([...user.apiKeys, {service: '', key: ''}]);
        } else {
            setLocalApiKeys([{service: '', key: ''}]);
        }
    }, [user.apiKeys]);

    if (!isOpen) return null;

    const handleKeyChange = (index: number, field: 'service' | 'key', value: string) => {
        const newKeys = [...localApiKeys];
        newKeys[index] = { ...newKeys[index], [field]: value };
        
        // If the last key is being filled, add a new empty one
        if (index === newKeys.length - 1 && value.trim() !== '') {
            newKeys.push({service: '', key: ''});
        }
        setLocalApiKeys(newKeys);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const filteredKeys = localApiKeys.filter(k => k.key.trim() !== '' && k.service.trim() !== '');
        onSave({ ...user, name, email, avatar, apiKeys: filteredKeys, userMap: localUserMap });
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
                    <button 
                        onClick={() => setActiveTab('map')}
                        className={`px-6 py-3 text-[10px] font-black uppercase tracking-widest transition-all border-b-2 ${activeTab === 'map' ? 'text-white border-white' : 'text-white/20 border-transparent hover:text-white/40'}`}
                    >
                        UserMap
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
                                    <h4 className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1">Operational Connectors</h4>
                                    <p className="text-[9px] text-white/40 leading-relaxed">
                                        Prism Core uses platform-provided keys. All other agents require your own API keys to function.
                                    </p>
                                </div>
                                
                                <div className="space-y-3">
                                    {localApiKeys.map((entry, idx) => (
                                        <div key={idx} className="flex gap-2">
                                            <input 
                                                type="text"
                                                value={entry.service}
                                                onChange={e => handleKeyChange(idx, 'service', e.target.value)}
                                                placeholder="Service (e.g. Gemini, OpenAI)"
                                                className="w-1/3 bg-black border border-white/10 rounded-xl p-3 text-[10px] font-mono text-white focus:border-indigo-500 outline-none transition-all"
                                            />
                                            <input 
                                                type="password"
                                                value={entry.key}
                                                onChange={e => handleKeyChange(idx, 'key', e.target.value)}
                                                placeholder="API Key (sk-...)"
                                                className="flex-1 bg-black border border-white/10 rounded-xl p-3 text-xs font-mono text-white focus:border-indigo-500 outline-none transition-all"
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {activeTab === 'map' && (
                            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4">
                                    <h4 className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-1">Ecosystem UserMap</h4>
                                    <p className="text-[9px] text-white/40 leading-relaxed">
                                        Define the hierarchical structure of your AI workforce. Map out teams, projects, and agent relationships.
                                    </p>
                                </div>

                                <div className="bg-black/40 rounded-2xl p-6 border border-white/5 min-h-[300px]">
                                    <UserMapEditor 
                                        node={localUserMap} 
                                        onUpdate={setLocalUserMap} 
                                    />
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
