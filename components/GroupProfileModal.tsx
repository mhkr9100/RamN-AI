
import React, { useState } from 'react';
import { Team, Agent } from '../types';
import { XMarkIcon } from './icons/XMarkIcon';

interface GroupProfileModalProps {
  group: Team;
  onClose: () => void;
  onSave: (group: Team) => void;
  onEditAgent: (agent: Agent) => void;
}

export const GroupProfileModal: React.FC<GroupProfileModalProps> = ({ group, onClose, onSave, onEditAgent }) => {
    const [name, setName] = useState(group.name);
    const [description, setDescription] = useState(group.description || '');

    const handleSave = () => {
        onSave({ ...group, name, description });
    };

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
            <div className="bg-[#2a2b32] rounded-2xl shadow-xl w-full max-w-lg border border-gray-700 flex flex-col max-h-[90vh]">
                <div className="flex items-center justify-between p-4 border-b border-gray-700">
                    <h2 className="text-xl font-bold">Group Settings</h2>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-700">
                        <XMarkIcon />
                    </button>
                </div>
                
                <div className="p-6 space-y-6 overflow-y-auto custom-scrollbar">
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">Group Name</label>
                            <input 
                                type="text" 
                                value={name} 
                                onChange={(e) => setName(e.target.value)} 
                                className="w-full bg-gray-800 rounded-md p-2 text-white border border-gray-600 focus:border-indigo-500 outline-none"
                            />
                        </div>
                         <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">Objective</label>
                            <textarea 
                                value={description} 
                                onChange={(e) => setDescription(e.target.value)} 
                                rows={2}
                                className="w-full bg-gray-800 rounded-md p-2 text-white border border-gray-600 focus:border-indigo-500 text-sm outline-none"
                            />
                        </div>
                    </div>

                    <div>
                        <h3 className="text-sm font-bold text-blue-400 uppercase tracking-wide mb-3">Group Composition</h3>
                        <div className="space-y-2">
                            {group.agents.map((agent) => {
                                const isPrism = agent.id === 'prism-core-member';
                                return (
                                    <div 
                                        key={agent.id} 
                                        className={`bg-gray-800/50 border border-gray-700 rounded-xl p-3 flex items-center justify-between hover:bg-gray-800 transition ${isPrism ? 'cursor-default opacity-80' : 'cursor-pointer'} group`}
                                        onClick={() => !isPrism && onEditAgent(agent)}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="text-xl">{agent.icon}</div>
                                            <div>
                                                <p className="font-bold text-white text-sm">{agent.name} {isPrism && <span className="text-[10px] bg-blue-900/50 text-blue-400 px-1 rounded">Orchestrator</span>}</p>
                                                <p className="text-xs text-blue-300">{agent.role}</p>
                                            </div>
                                        </div>
                                        {!isPrism && (
                                            <button className="text-xs bg-gray-700 hover:bg-gray-600 px-3 py-1.5 rounded-md text-gray-300 transition">
                                                View Agent
                                            </button>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                <div className="p-4 bg-[#202123] rounded-b-2xl flex justify-end gap-2">
                     <button onClick={onClose} className="bg-black hover:bg-white/10 text-white font-bold py-2 px-4 rounded-lg transition border border-white/10">
                        Cancel
                    </button>
                    <button onClick={handleSave} className="bg-[#001f3f] hover:bg-blue-900 text-white font-bold py-2 px-4 rounded-lg transition border border-white/10 shadow-lg">
                        Save Changes
                    </button>
                </div>
            </div>
        </div>
    );
};
