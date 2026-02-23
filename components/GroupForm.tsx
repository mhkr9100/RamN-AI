
import React, { useState } from 'react';
import { Agent } from '../types';

interface GroupFormProps {
  employees: Agent[];
  onSubmit: (groupData: { name: string, agentIds: string[] }) => void;
}

export const GroupForm: React.FC<GroupFormProps> = ({ employees, onSubmit }) => {
    const [name, setName] = useState('');
    const [selectedAgents, setSelectedAgents] = useState<Set<string>>(new Set());

    const handleSelectAgent = (agentId: string) => {
        const newSelection = new Set(selectedAgents);
        if (newSelection.has(agentId)) {
            newSelection.delete(agentId);
        } else {
            newSelection.add(agentId);
        }
        setSelectedAgents(newSelection);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (name.trim() && selectedAgents.size > 0) {
            onSubmit({ name, agentIds: Array.from(selectedAgents) });
        }
    };
    
    const isFormValid = name.trim() && selectedAgents.size > 0;

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label htmlFor="group-name" className="block text-sm font-medium text-gray-300 mb-1">Group Name</label>
                <input
                    type="text"
                    id="group-name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g., Q3 Marketing Campaign"
                    className="w-full bg-gray-600 rounded-md border-gray-500 p-2 text-sm focus:ring-indigo-500 focus:border-indigo-500"
                />
            </div>
            <div>
                 <label className="block text-sm font-medium text-gray-300 mb-2">Select Members</label>
                 <div className="max-h-40 overflow-y-auto space-y-2 bg-gray-600/50 p-3 rounded-md">
                    {employees.map(agent => (
                        <div key={agent.id} className="flex items-center">
                            <input
                                id={`agent-${agent.id}`}
                                type="checkbox"
                                checked={selectedAgents.has(agent.id as string)}
                                onChange={() => handleSelectAgent(agent.id as string)}
                                className="h-4 w-4 rounded border-gray-500 bg-gray-800 text-indigo-600 focus:ring-indigo-500"
                            />
                            <label htmlFor={`agent-${agent.id}`} className="ml-3 flex items-center text-sm text-gray-200">
                               <span className='mr-2 text-lg'>{agent.icon}</span> {agent.name}
                            </label>
                        </div>
                    ))}
                 </div>
            </div>
            <button
                type="submit"
                disabled={!isFormValid}
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2 px-4 rounded-lg transition disabled:bg-gray-500 disabled:cursor-not-allowed"
            >
                Create Group
            </button>
        </form>
    );
};
