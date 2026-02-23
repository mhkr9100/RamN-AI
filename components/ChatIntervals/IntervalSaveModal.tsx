
import React, { useState } from 'react';
import { XMarkIcon } from '../icons/XMarkIcon';

interface IntervalSaveModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (name: string) => void;
}

export const IntervalSaveModal: React.FC<IntervalSaveModalProps> = ({ isOpen, onClose, onSave }) => {
    const [name, setName] = useState('');

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/80 z-[120] flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-[#0a0a0a] w-full max-w-sm rounded-2xl border border-white/20 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                <div className="p-5 border-b border-white/10 bg-black flex justify-between items-center">
                    <h2 className="text-lg font-bold text-white">Save Interval</h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-white transition"><XMarkIcon /></button>
                </div>
                <div className="p-6 space-y-4">
                    <p className="text-xs text-slate-400 leading-relaxed">Archiving this interval will clear the active sequence while preserving the context for future restoration.</p>
                    <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Interval Identity</label>
                        <input 
                            autoFocus
                            type="text" 
                            value={name} 
                            onChange={(e) => setName(e.target.value)}
                            placeholder="e.g., Q4 Strategy Phase 1"
                            className="w-full bg-black border border-white/10 rounded-xl p-3 text-sm text-white focus:border-blue-500 outline-none"
                        />
                    </div>
                    <button 
                        onClick={() => onSave(name || `Interval ${new Date().toLocaleTimeString()}`)}
                        className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-lg transition-all active:scale-95"
                    >
                        Save & Clear Sequence
                    </button>
                </div>
            </div>
        </div>
    );
};
