
import React, { useState } from 'react';
import { GlobalTask, Agent, Team } from '../types';
import { XMarkIcon } from './icons/XMarkIcon';

interface WorkDashboardProps {
  isOpen: boolean;
  onClose: () => void;
  tasks: GlobalTask[];
  agents: Agent[];
  teams: Team[];
  onUpdateStatus: (taskId: string, status: GlobalTask['status']) => void;
  onDelete: (taskId: string) => void;
}

export const WorkDashboard: React.FC<WorkDashboardProps> = ({ 
  isOpen, 
  onClose, 
  tasks, 
  agents, 
  teams, 
  onUpdateStatus,
  onDelete
}) => {
  const [filterStatus, setFilterStatus] = useState<GlobalTask['status'] | 'all'>('all');
  const [filterSource, setFilterSource] = useState<string>('all');

  if (!isOpen) return null;

  const filteredTasks = tasks.filter(t => {
    const statusMatch = filterStatus === 'all' || t.status === filterStatus;
    const sourceMatch = filterSource === 'all' || t.agentId === filterSource || t.teamId === filterSource;
    return statusMatch && sourceMatch;
  });

  const getAgentName = (id: string) => agents.find(a => a.id === id)?.name || 'Unknown Agent';
  const getTeamName = (id?: string) => teams.find(t => t.id === id)?.name || 'Direct Chat';

  return (
    <div className="fixed inset-0 bg-black/90 z-[100] flex items-center justify-center p-4">
      <div className="bg-black w-full max-w-4xl h-[85vh] rounded-2xl shadow-2xl border border-white/20 flex flex-col overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-white/10 bg-[#050505]">
          <div>
            <h2 className="text-2xl font-bold text-white tracking-tight">Work</h2>
            <p className="text-[10px] text-slate-500 font-mono tracking-widest uppercase mt-1">Tracking directives across the spectrum</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition text-slate-400 hover:text-white">
            <XMarkIcon />
          </button>
        </div>

        <div className="p-6 border-b border-white/5 bg-[#0a0a0a] flex flex-wrap gap-4">
          <div>
            <label className="block text-[9px] font-bold text-slate-500 uppercase mb-1">Status Filter</label>
            <select 
              value={filterStatus} 
              onChange={e => setFilterStatus(e.target.value as any)}
              className="bg-black border border-white/10 rounded px-2 py-1 text-xs text-white outline-none focus:border-blue-500"
            >
              <option value="all">All Statuses</option>
              <option value="scheduled">Scheduled</option>
              <option value="done">Done</option>
              <option value="not-done">Cancelled</option>
            </select>
          </div>
          <div>
            <label className="block text-[9px] font-bold text-slate-500 uppercase mb-1">Source Filter</label>
            <select 
              value={filterSource} 
              onChange={e => setFilterSource(e.target.value)}
              className="bg-black border border-white/10 rounded px-2 py-1 text-xs text-white outline-none focus:border-blue-500"
            >
              <option value="all">All Agents/Groups</option>
              {agents.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
              {teams.map(t => <option key={t.id} value={t.id}>{t.name} (Group)</option>)}
            </select>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar space-y-4">
          {filteredTasks.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-slate-500 space-y-4">
              <span className="text-4xl opacity-20">📂</span>
              <p className="text-sm font-mono uppercase tracking-widest">No matching directives found</p>
            </div>
          ) : (
            filteredTasks.sort((a,b) => b.createdAt - a.createdAt).map(task => (
              <div key={task.id} className="bg-white/[0.02] border border-white/5 rounded-xl p-4 flex items-center justify-between gap-4 group">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded border uppercase ${
                      task.status === 'done' ? 'bg-green-900/20 border-green-500/30 text-green-400' :
                      task.status === 'not-done' ? 'bg-red-900/20 border-red-500/30 text-red-400' :
                      'bg-blue-900/20 border-blue-500/30 text-blue-400'
                    }`}>
                      {task.status}
                    </span>
                    <span className="text-[10px] text-slate-600 font-mono">
                      {task.scheduledTime ? new Date(task.scheduledTime).toLocaleString() : new Date(task.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-white mb-1">{task.label}</h4>
                  <p className="text-[10px] text-slate-500">
                    Target: <span className="text-blue-400">{getAgentName(task.agentId)}</span> • Context: <span className="text-slate-400">{getTeamName(task.teamId)}</span>
                  </p>
                </div>
                
                <div className="flex items-center gap-2">
                  {task.status === 'scheduled' && (
                    <button 
                      onClick={() => onUpdateStatus(task.id, 'not-done')}
                      className="px-3 py-1 bg-red-900/20 border border-red-500/30 text-red-400 text-[10px] font-bold rounded hover:bg-red-900/40 transition"
                    >
                      Cancel
                    </button>
                  )}
                  <button 
                    onClick={() => onDelete(task.id)}
                    className="p-2 text-slate-600 hover:text-red-400 transition"
                    title="Remove Record"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                      <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                    </svg>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
