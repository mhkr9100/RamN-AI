
import React, { useState } from 'react';
import { GlobalTask, ChatInterval, Agent, Team, UserProfile } from '../types';
import { TaskItem } from './TaskFeature/TaskItem';
import { UserMapView } from './UserMapView';

interface WorkViewProps {
  tasks: GlobalTask[];
  intervals: ChatInterval[];
  userProfile: UserProfile;
  agents: Agent[];
  teams: Team[];
  onUpdateProfile: (p: UserProfile) => void;
  onUpdateTaskStatus: (id: string, s: GlobalTask['status']) => void;
  onDeleteTask: (id: string) => void;
  onEditTask: (t: GlobalTask) => void;
  onViewTask: (t: GlobalTask) => void;
  onRestoreInterval: (i: ChatInterval) => void;
  onDeleteInterval: (id: string) => void;
}

export const WorkView: React.FC<WorkViewProps> = ({ 
    tasks, intervals, userProfile, agents, teams, onUpdateProfile, onUpdateTaskStatus, onDeleteTask, onEditTask, onViewTask, onRestoreInterval, onDeleteInterval 
}) => {
    const [activeTab, setActiveTab] = useState<'intervals' | 'tasks' | 'usermap'>('intervals');

    return (
        <div className="flex-1 flex flex-col h-full bg-[#1A1A1A] animate-in fade-in duration-500 overflow-hidden">
            <header className="h-16 border-b border-white/5 flex items-center px-8 bg-[#1A1A1A] flex-shrink-0">
                <nav className="flex gap-8 h-full">
                    {(['intervals', 'tasks', 'usermap'] as const).map(tab => (
                        <button 
                            key={tab} 
                            onClick={() => setActiveTab(tab)}
                            className={`h-full flex items-center text-[10px] font-black uppercase tracking-[0.2em] transition-all border-b-2 ${activeTab === tab ? 'text-white border-white' : 'text-white/20 border-transparent hover:text-white/40'}`}
                        >
                            {tab === 'intervals' ? 'Intervals' : tab === 'tasks' ? 'Tasks' : 'UserMap'}
                        </button>
                    ))}
                </nav>
            </header>

            <div className="flex-1 overflow-y-auto custom-scrollbar p-8">
                <div className="max-w-6xl mx-auto">
                    {activeTab === 'intervals' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in duration-300">
                            {intervals.length === 0 ? (
                                <div className="col-span-full py-20 text-center opacity-20 uppercase tracking-[0.5em] text-xs">No saved intervals</div>
                            ) : (
                                intervals.sort((a,b)=>b.createdAt-a.createdAt).map(interval => (
                                    <div key={interval.id} className="p-6 bg-[#202020] border border-white/5 rounded-2xl hover:border-white/20 transition-all group">
                                        <div className="flex justify-between items-start mb-4">
                                            <div>
                                                <h4 className="font-bold text-white text-base leading-tight">{interval.name}</h4>
                                                <p className="text-[9px] text-white/20 font-mono mt-1 uppercase tracking-widest">
                                                    Target: {agents.find(a => a.id === interval.targetId)?.name || teams.find(t => t.id === interval.targetId)?.name || 'Direct'}
                                                </p>
                                            </div>
                                            <button onClick={() => onDeleteInterval(interval.id)} className="text-white/10 hover:text-red-500 transition-colors">✕</button>
                                        </div>
                                        <div className="text-[10px] text-white/40 font-mono mb-6">{new Date(interval.createdAt).toLocaleString()}</div>
                                        <button 
                                            onClick={() => onRestoreInterval(interval)}
                                            className="w-full py-3 bg-white text-black text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-white/90 transition-all active:scale-95"
                                        >
                                            Restore Interval
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>
                    )}

                    {activeTab === 'tasks' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in duration-300">
                            {tasks.length === 0 ? (
                                <div className="col-span-full py-20 text-center opacity-20 uppercase tracking-[0.5em] text-xs">No active tasks</div>
                            ) : (
                                tasks.sort((a,b)=>b.createdAt-a.createdAt).map(task => (
                                    <TaskItem key={task.id} task={task} onUpdateStatus={onUpdateTaskStatus} onEdit={onEditTask} onView={onViewTask} onSendToChat={() => {}} />
                                ))
                            )}
                        </div>
                    )}

                    {activeTab === 'usermap' && (
                        <div className="h-[70vh] animate-in fade-in duration-300">
                             <UserMapView userProfile={userProfile} onUpdateProfile={onUpdateProfile} />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
