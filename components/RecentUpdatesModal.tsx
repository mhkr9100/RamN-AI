
import React from 'react';
import { XMarkIcon } from './icons/XMarkIcon';

interface RecentUpdatesModalProps {
  onClose: () => void;
}

interface UpdateItem {
    version: string;
    date: string;
    title: string;
    features: string[];
}

const UPDATES: UpdateItem[] = [
    {
        version: "v2.1.0",
        date: "Just Now",
        title: "Scatter AI Refined",
        features: [
            "Simplified Nomenclature: 'Employees' are now 'Agents', 'Groups' are now 'Teams'.",
            "Spectral Branding: Entire workspace unified under the Scatter AI identity.",
            "Scatter Dispatcher: Enhanced bottle-rolling logic for multi-agent tasks.",
            "Vault Updates: Updated high-performance model keys."
        ]
    },
    {
        version: "v2.0.0",
        date: "Legacy",
        title: "The Spectral Shift",
        features: [
            "Deep Void theme with Spectral accents.",
            "Logic Shift: Teams are now 'Passive/Void' by default.",
            "Tabula Rasa: Secure client-side laboratory."
        ]
    }
];

export const RecentUpdatesModal: React.FC<RecentUpdatesModalProps> = ({ onClose }) => {
    return (
        <div className="fixed inset-0 bg-black/70 z-[80] flex items-center justify-center p-4">
            <div className="bg-[#1E293B] w-full max-w-lg rounded-2xl shadow-2xl border border-slate-700 flex flex-col max-h-[85vh] overflow-hidden">
                <div className="flex items-center justify-between p-5 border-b border-slate-700 bg-[#0F172A]">
                    <div className="flex items-center gap-2">
                        <span className="text-2xl">✨</span>
                        <h2 className="text-xl font-bold text-white">What's New</h2>
                    </div>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-slate-700 transition">
                        <XMarkIcon />
                    </button>
                </div>
                
                <div className="p-6 overflow-y-auto custom-scrollbar space-y-8">
                    {UPDATES.map((update, idx) => (
                        <div key={idx} className="relative pl-6 border-l-2 border-slate-700 last:border-0 pb-1">
                            <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-slate-800 border-2 border-cyan-500"></div>
                            <div className="flex items-center gap-3 mb-2">
                                <span className="bg-cyan-900/50 text-cyan-300 text-xs font-mono px-2 py-0.5 rounded border border-cyan-500/20">
                                    {update.version}
                                </span>
                                <span className="text-slate-500 text-xs">{update.date}</span>
                            </div>
                            <h3 className="font-bold text-white text-lg mb-2">{update.title}</h3>
                            <ul className="space-y-2">
                                {update.features.map((feat, fIdx) => (
                                    <li key={fIdx} className="text-slate-300 text-sm flex items-start gap-2">
                                        <span className="text-cyan-500 mt-1">•</span>
                                        <span>{feat}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                <div className="p-4 bg-[#0F172A] border-t border-slate-700 text-center">
                    <button 
                        onClick={onClose} 
                        className="text-slate-400 hover:text-white text-sm font-medium transition"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};
