
import React, { useState } from 'react';
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
    const [avatar, setAvatar] = useState(user.avatar || '');

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({ ...user, name, avatar });
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center p-4">
            <div className="bg-[#1A1A1A] w-full max-w-md rounded-2xl shadow-2xl border border-white/10 overflow-hidden flex flex-col max-h-[90vh]">

                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-white/10 flex-shrink-0">
                    <h2 className="text-sm font-black text-white uppercase tracking-widest">Profile</h2>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition text-white/40 hover:text-white">
                        <XMarkIcon />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar p-8">
                    <form onSubmit={handleSubmit} className="space-y-8">

                        {/* Avatar */}
                        <div className="flex flex-col items-center space-y-3">
                            <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center text-3xl relative overflow-hidden ring-1 ring-white/10">
                                {avatar ? (
                                    <img src={avatar} alt="Profile" className="w-full h-full object-cover" />
                                ) : (
                                    <span className="text-white/20">👤</span>
                                )}
                            </div>
                            <input
                                type="url"
                                value={avatar}
                                onChange={e => setAvatar(e.target.value)}
                                placeholder="Avatar image URL..."
                                className="w-full bg-black/20 border border-white/5 rounded-lg p-2 text-[10px] font-mono text-white/50 placeholder-white/10 outline-none focus:border-white/20 transition-all text-center"
                            />
                        </div>

                        {/* Identity Fields */}
                        <div className="space-y-4">
                            <div>
                                <label className="block text-[9px] font-black text-white/30 uppercase tracking-widest mb-2">Email Address</label>
                                <div className="bg-black/20 border border-white/5 rounded-xl px-4 py-3">
                                    <p className="text-xs text-white/50 font-mono">{user.email}</p>
                                </div>
                            </div>
                            <div>
                                <label className="block text-[9px] font-black text-white/30 uppercase tracking-widest mb-2">Display Name</label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={e => setName(e.target.value)}
                                    className="w-full bg-[#1A1A1A] border border-white/10 rounded-xl p-3 text-sm text-white focus:border-white outline-none transition-all"
                                    required
                                />
                            </div>
                        </div>

                        {/* Platform Info Tile */}
                        <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-5">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-8 h-8 bg-white/5 rounded-lg flex items-center justify-center text-sm">🧠</div>
                                <div>
                                    <p className="text-[10px] font-black text-white/60 uppercase tracking-widest">RamN AI Platform</p>
                                    <p className="text-[9px] text-white/25">Managed Infrastructure</p>
                                </div>
                                <span className="ml-auto text-[8px] font-black text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full uppercase tracking-widest">Beta</span>
                            </div>
                            <div className="grid grid-cols-3 gap-2">
                                {[
                                    { label: 'AI Engine', value: 'Gemini 2.0' },
                                    { label: 'Memory', value: 'Firestore' },
                                    { label: 'Storage', value: 'AWS S3' },
                                ].map(item => (
                                    <div key={item.label} className="text-center p-2 bg-black/20 rounded-lg">
                                        <p className="text-[9px] text-white/20 uppercase tracking-widest mb-0.5">{item.label}</p>
                                        <p className="text-[10px] font-black text-white/60">{item.value}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col gap-3">
                            <button
                                type="submit"
                                className="w-full py-4 bg-white text-black text-[11px] font-black uppercase tracking-widest rounded-xl transition-all active:scale-[0.98]"
                            >
                                Save Changes
                            </button>
                            {onLogout && (
                                <button
                                    type="button"
                                    onClick={onLogout}
                                    className="w-full py-3 text-red-500/70 hover:text-red-500 text-[10px] font-black uppercase tracking-widest transition-all"
                                >
                                    Sign Out
                                </button>
                            )}
                        </div>

                    </form>
                </div>
            </div>
        </div>
    );
};
