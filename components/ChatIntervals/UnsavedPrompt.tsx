
import React from 'react';

interface UnsavedPromptProps {
    isOpen: boolean;
    onSave: () => void;
    onIgnore: () => void;
    onCancel: () => void;
}

export const UnsavedPrompt: React.FC<UnsavedPromptProps> = ({ isOpen, onSave, onIgnore, onCancel }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/80 z-[130] flex items-center justify-center p-4 backdrop-blur-md">
            <div className="bg-slate-900 border border-red-500/30 rounded-2xl p-6 w-full max-w-sm shadow-2xl text-center">
                <div className="text-3xl mb-4">⚠️</div>
                <h3 className="text-xl font-bold text-white mb-2">Unsaved Sequence Detected</h3>
                <p className="text-sm text-slate-400 mb-6">Your current active conversation has not been saved as an interval. Loading history will overwrite this session.</p>
                
                <div className="space-y-2">
                    <button onClick={onSave} className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition">
                        Save Current First
                    </button>
                    <button onClick={onIgnore} className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl transition">
                        Ignore & Overwrite
                    </button>
                    <button onClick={onCancel} className="w-full py-2 text-slate-500 hover:text-white text-xs font-bold transition">
                        Wait, Cancel
                    </button>
                </div>
            </div>
        </div>
    );
};
