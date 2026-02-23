
import React, { useState } from 'react';
import { Agent } from '../types';
import { XMarkIcon } from './icons/XMarkIcon';
import { ConfirmationModal } from './ConfirmationModal';
import { AI_RESUMES } from '../constants';

interface EmployeeProfileModalProps {
  employee: Agent;
  onClose: () => void;
  onSave: (employee: Agent) => void;
  onDelete: (employeeId: string) => void;
}

export const EmployeeProfileModal: React.FC<EmployeeProfileModalProps> = ({ employee, onClose, onSave, onDelete }) => {
    const [name, setName] = useState(employee.name || '');
    const [jobDescription, setJobDescription] = useState(employee.jobDescription || '');
    const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);

    const brainProfile = AI_RESUMES.find(p => p.modelId === employee.model || p.provider === employee.provider) || AI_RESUMES[0];
    const brainName = brainProfile ? brainProfile.name : employee.model;

    const handleSave = () => {
        if (jobDescription.trim() && name.trim()) {
            onSave({ 
                ...employee, 
                name: name.trim(),
                role: name.trim(),
                jobDescription: jobDescription.trim()
            });
        }
    };
    
    const handleDeleteConfirmed = () => {
        onDelete(employee.id as string);
    };

    return (
        <>
            <div className="fixed inset-0 bg-black/80 z-[60] flex items-center justify-center p-4 backdrop-blur-sm">
                <div className="bg-[#1A1A1A] rounded-2xl shadow-2xl w-full max-w-lg border border-white/10 overflow-hidden animate-in zoom-in-95 duration-200">
                    <div className="flex items-center justify-between p-6 border-b border-white/10 bg-black/50">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-2xl">
                                {employee.icon}
                            </div>
                            <h2 className="text-xl font-bold text-white tracking-tight uppercase">Agent Settings</h2>
                        </div>
                        <button onClick={onClose} className="p-2 rounded-full hover:bg-white/10 text-white/40 hover:text-white transition">
                            <XMarkIcon />
                        </button>
                    </div>
                    
                    <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
                        <div>
                            <label className="block text-[10px] font-black text-white/40 uppercase tracking-widest mb-2">Agent Name</label>
                            <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full bg-black rounded-xl border border-white/10 p-3 text-white focus:border-white outline-none transition-all" />
                        </div>

                        <div>
                            <label className="block text-[10px] font-black text-white/40 uppercase tracking-widest mb-2">AI Model</label>
                            <div className="text-sm text-white/60 bg-white/5 border border-white/10 px-4 py-3 rounded-xl font-mono">
                                {brainName}
                            </div>
                        </div>

                        <div>
                            <label className="block text-[10px] font-black text-white/40 uppercase tracking-widest mb-2">System Instructions</label>
                            <textarea 
                                value={jobDescription} 
                                onChange={(e) => setJobDescription(e.target.value)} 
                                rows={8} 
                                className="w-full bg-black rounded-xl border border-white/10 p-4 text-[12px] text-white focus:border-white outline-none resize-none font-mono leading-relaxed"
                            />
                        </div>
                    </div>
                    
                    <div className="flex items-center justify-between p-6 bg-black/40 border-t border-white/10">
                        <button 
                            onClick={() => setIsConfirmingDelete(true)} 
                            disabled={!employee.isDeletable} 
                            className="text-red-500/60 hover:text-red-500 text-[10px] font-black uppercase tracking-[0.2em] transition-all disabled:opacity-0"
                        >
                            Delete Agent
                        </button>
                        <div className="flex gap-3">
                            <button onClick={onClose} className="px-6 py-2.5 bg-black hover:bg-white/5 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-xl transition border border-white/10">Cancel</button>
                            <button onClick={handleSave} disabled={!name.trim() || !jobDescription.trim()} className="px-8 py-2.5 bg-white text-black text-[10px] font-black uppercase tracking-[0.2em] rounded-xl transition-all shadow-xl disabled:opacity-30">Save Changes</button>
                        </div>
                    </div>
                </div>
            </div>
            {isConfirmingDelete && (
                <ConfirmationModal 
                    isOpen={isConfirmingDelete}
                    onClose={() => setIsConfirmingDelete(false)}
                    onConfirm={handleDeleteConfirmed}
                    title="Confirm Deletion"
                    message={`Are you sure you want to delete ${employee.name}? This action cannot be undone.`}
                    confirmText="Delete"
                />
            )}
        </>
    );
};
