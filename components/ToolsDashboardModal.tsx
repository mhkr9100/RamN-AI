
import React from 'react';
import { Agent } from '../types';
import { XMarkIcon } from './icons/XMarkIcon';

interface ToolsDashboardModalProps {
  employees: Agent[];
  onClose: () => void;
  onSelectEmployee: (employee: Agent) => void;
}

export const ToolsDashboardModal: React.FC<ToolsDashboardModalProps> = ({ employees, onClose, onSelectEmployee }) => {
    
    const handleEmployeeClick = (employee: Agent) => {
        onSelectEmployee(employee);
        onClose(); // Close dashboard to open profile modal
    };

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
            <div className="bg-[#2a2b32] rounded-2xl shadow-xl w-full max-w-2xl border border-gray-700 flex flex-col">
                <div className="flex items-center justify-between p-4 border-b border-gray-700 flex-shrink-0">
                    <h2 className="text-xl font-bold">Tools & Connections Dashboard</h2>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-700">
                        <XMarkIcon />
                    </button>
                </div>
                <div className="p-6 space-y-4 overflow-y-auto">
                    <ul className="divide-y divide-gray-700">
                        {employees.filter(e => e.type !== 'user').map(employee => (
                            <li key={employee.id} className="py-3 flex items-center justify-between">
                                <div className="flex items-center space-x-4">
                                    <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center text-xl flex-shrink-0">
                                         {employee.profileImage ? <img src={employee.profileImage} alt={employee.name} className="w-full h-full object-cover rounded-full"/> : employee.icon}
                                    </div>
                                    <div>
                                        <p className="font-semibold text-white">{employee.name}</p>
                                        <p className="text-sm text-gray-400">{employee.type} Agent</p>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-4">
                                    {employee.apiKey ? (
                                        <span className="inline-flex items-center rounded-full bg-green-900/50 px-2 py-1 text-xs font-medium text-green-300 ring-1 ring-inset ring-green-400/20">
                                            API Connected
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center rounded-full bg-gray-800/50 px-2 py-1 text-xs font-medium text-gray-400 ring-1 ring-inset ring-gray-400/20">
                                            No API
                                        </span>
                                    )}
                                    <button onClick={() => handleEmployeeClick(employee)} className="text-sm text-indigo-400 hover:text-indigo-300">
                                        View/Edit
                                    </button>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
                 <div className="p-4 bg-[#202123] rounded-b-2xl mt-auto text-right">
                     <button onClick={onClose} className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded-lg transition">Close</button>
                </div>
            </div>
        </div>
    );
};