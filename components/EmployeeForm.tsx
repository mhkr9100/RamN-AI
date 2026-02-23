
import React, { useState } from 'react';
import { Agent } from '../types';

interface EmployeeFormProps {
  onSubmit: (employeeData: Omit<Agent, 'id' | 'type'>) => void;
}

export const EmployeeForm: React.FC<EmployeeFormProps> = ({ onSubmit }) => {
    const [role, setRole] = useState('');
    const [jobDescription, setJobDescription] = useState('');
    const [icon, setIcon] = useState('🤖');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (role.trim() && jobDescription.trim() && icon.trim()) {
            onSubmit({ 
                name: role, // Name is Role
                role, 
                jobDescription, 
                icon, 
                provider: 'google', 
                // Updated to recommended model for text tasks
                model: 'gemini-3-flash-preview' 
            });
        }
    };
    
    const isFormValid = role.trim() && jobDescription.trim() && icon.trim();

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
             <div>
                <label htmlFor="employee-role" className="block text-sm font-medium text-gray-300 mb-1">Role Title</label>
                <input
                    type="text"
                    id="employee-role"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    placeholder="e.g., Marketing Manager"
                    className="w-full bg-gray-600 rounded-md border-gray-500 p-2 text-sm focus:ring-indigo-500 focus:border-indigo-500"
                />
            </div>
             <div>
                <label htmlFor="employee-jd" className="block text-sm font-medium text-gray-300 mb-1">Job Description</label>
                <textarea
                    id="employee-jd"
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                    placeholder="Describe the specific tasks and behavior for this agent..."
                    rows={3}
                    className="w-full bg-gray-600 rounded-md border-gray-500 p-2 text-sm focus:ring-indigo-500 focus:border-indigo-500 resize-none"
                />
            </div>
             <div>
                <label htmlFor="employee-icon" className="block text-sm font-medium text-gray-300 mb-1">Icon (Emoji)</label>
                <input
                    type="text"
                    id="employee-icon"
                    value={icon}
                    onChange={(e) => setIcon(e.target.value)}
                    maxLength={2}
                    className="w-full bg-gray-600 rounded-md border-gray-500 p-2 text-sm focus:ring-indigo-500 focus:border-indigo-500"
                />
            </div>
            <button
                type="submit"
                disabled={!isFormValid}
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2 px-4 rounded-lg transition disabled:bg-gray-500 disabled:cursor-not-allowed"
            >
                Hire Agent
            </button>
        </form>
    );
};