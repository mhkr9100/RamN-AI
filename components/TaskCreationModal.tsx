
import React, { useState, useEffect } from 'react';
import { Agent, Team, GlobalTask } from '../types';
import { XMarkIcon } from './icons/XMarkIcon';

interface TaskCreationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { label: string; scheduledTime: number; isRecurring: boolean; agentId: string; teamId?: string }) => void;
  agents: Agent[];
  activeAgent?: Agent;
  activeTeam?: Team;
  initialTask?: GlobalTask;
  isReadOnly?: boolean;
}

export const TaskCreationModal: React.FC<TaskCreationModalProps> = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  agents,
  activeAgent,
  activeTeam,
  initialTask,
  isReadOnly = false
}) => {
  const [label, setLabel] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState(new Date().toTimeString().split(' ')[0].slice(0, 5));
  const [isRecurring, setIsRecurring] = useState(false);
  
  // Default to the active agent, or the first one in the group/pool
  const pool = activeTeam ? activeTeam.agents : agents;
  const initialSelection = initialTask?.agentId || activeAgent?.id || pool[0]?.id || '';
  const [selectedAgentId, setSelectedAgentId] = useState(initialSelection);

  useEffect(() => {
    if (initialTask) {
        setLabel(initialTask.label);
        const d = new Date(initialTask.scheduledTime || initialTask.createdAt);
        setDate(d.toISOString().split('T')[0]);
        setTime(d.toTimeString().split(' ')[0].slice(0, 5));
        setIsRecurring(initialTask.isRecurring || false);
        setSelectedAgentId(initialTask.agentId);
    } else {
        setLabel('');
        setDate(new Date().toISOString().split('T')[0]);
        setTime(new Date().toTimeString().split(' ')[0].slice(0, 5));
        setIsRecurring(false);
        setSelectedAgentId(activeAgent?.id || pool[0]?.id || '');
    }
  }, [initialTask, isOpen, pool, activeAgent]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isReadOnly) return;
    const scheduledTime = new Date(`${date}T${time}`).getTime();
    onSubmit({
      label,
      scheduledTime,
      isRecurring,
      agentId: selectedAgentId,
      teamId: activeTeam?.id || initialTask?.teamId
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/80 z-[110] flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-[#050505] w-full max-w-md rounded-2xl shadow-2xl border border-white/20 flex flex-col overflow-hidden">
        <div className="flex items-center justify-between p-5 border-b border-white/10 bg-black">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <span className="text-blue-500">✓</span> 
            {isReadOnly ? 'View Directive' : initialTask ? 'Update Directive' : 'Initialize Direct Command'}
          </h2>
          <button onClick={onClose} className="hover:text-white text-slate-400 transition">
            <XMarkIcon />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Context / Objective</label>
            <textarea 
              value={label} 
              onChange={e => setLabel(e.target.value)} 
              required
              rows={3}
              disabled={isReadOnly}
              placeholder="Assign a specific task to the agent..."
              className="w-full bg-black border border-white/10 rounded-xl p-3 text-sm focus:border-blue-500 outline-none text-white resize-none disabled:opacity-50"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Schedule Date</label>
              <input 
                type="date" 
                value={date} 
                onChange={e => setDate(e.target.value)}
                disabled={isReadOnly}
                className="w-full bg-black border border-white/10 rounded-xl p-3 text-sm focus:border-blue-500 outline-none text-white disabled:opacity-50"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Time</label>
              <input 
                type="time" 
                value={time} 
                onChange={e => setTime(e.target.value)}
                disabled={isReadOnly}
                className="w-full bg-black border border-white/10 rounded-xl p-3 text-sm focus:border-blue-500 outline-none text-white disabled:opacity-50"
              />
            </div>
          </div>

          {!isReadOnly && (
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Assign Specialist</label>
              <select 
                value={selectedAgentId} 
                onChange={e => setSelectedAgentId(e.target.value)}
                className="w-full bg-black border border-white/10 rounded-xl p-3 text-sm focus:border-blue-500 outline-none text-white"
              >
                {pool.map(a => <option key={a.id} value={a.id}>{a.name} ({a.role})</option>)}
              </select>
              {activeTeam && <p className="text-[9px] text-blue-500 mt-2 italic font-mono uppercase tracking-tighter">Routing within group spectrum</p>}
            </div>
          )}

          <div className="flex items-center justify-between p-4 bg-white/[0.02] border border-white/5 rounded-xl">
            <div className="flex flex-col">
              <span className="text-xs font-bold text-slate-200">Recurring Routine</span>
              <span className="text-[10px] text-slate-500 uppercase">Automate this directive</span>
            </div>
            <button 
              type="button"
              disabled={isReadOnly}
              onClick={() => setIsRecurring(!isRecurring)}
              className={`w-12 h-6 rounded-full transition-colors relative disabled:opacity-50 ${isRecurring ? 'bg-blue-600' : 'bg-slate-800'}`}
            >
              <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${isRecurring ? 'left-7' : 'left-1'}`} />
            </button>
          </div>

          {!isReadOnly && (
            <button 
                type="submit" 
                className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-xl shadow-blue-900/20 transition-all active:scale-95"
            >
                {initialTask ? 'Save Changes' : 'Commit Directive'}
            </button>
          )}
        </form>
      </div>
    </div>
  );
};
