
import React, { useState, useEffect } from 'react';
import { Agent, Team, UserProfile, ChatInterval } from '../types';
import { XMarkIcon } from './icons/XMarkIcon';
import { AI_RESUMES } from '../constants';

interface ProfileSidebarProps {
  isOpen: boolean;
  type: 'agent' | 'team' | 'prism';
  data: Agent | Team;
  globalTasks?: any[];
  intervals?: ChatInterval[];
  onClose: () => void;
  onSaveAgent?: (agent: Agent) => void;
  onSaveTeam?: (team: Team) => void;
  onUpdateUserProfile?: (p: Partial<UserProfile>) => void;
  userProfile?: UserProfile;
  onContinueInterval?: (interval: ChatInterval) => void;
  onDeleteInterval?: (id: string) => void;
}

export const ProfileSidebar: React.FC<ProfileSidebarProps> = ({ 
  isOpen, type, data, intervals = [], onClose, onSaveAgent, onSaveTeam, onUpdateUserProfile, userProfile, onContinueInterval, onDeleteInterval
}) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'history'>('profile');
  
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [jd, setJd] = useState('');
  const [teamName, setTeamName] = useState('');
  const [teamDesc, setTeamDesc] = useState('');
  
  useEffect(() => {
    if (type === 'team') {
        const team = data as Team;
        setTeamName(team.name);
        setTeamDesc(team.description || '');
    } else {
        const agent = data as Agent;
        setName(agent.name);
        setRole(agent.role);
        setJd(agent.jobDescription);
    }
  }, [data.id, type, data]);

  const handleSave = () => {
    if (type === 'team') onSaveTeam?.({ ...data as Team, name: teamName, description: teamDesc });
    else if (type === 'prism') {
        // Prism profile is now just informational, keys moved to User Profile
    }
    else onSaveAgent?.({ ...data as Agent, name, role, jobDescription: jd });
    onClose();
  };

  const filteredIntervals = intervals.filter(i => i.targetId === data.id);
  const agent = data as Agent;
  const brainProfile = AI_RESUMES.find(p => p.modelId === agent.model) || AI_RESUMES[0];

  return (
    <div className={`fixed top-0 right-0 h-full w-full max-w-sm md:max-w-md bg-[#1A1A1A] border-l border-white/5 shadow-2xl z-[50] transition-transform duration-300 transform ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
      <div className="flex flex-col h-full">
        <div className="p-6 border-b border-white/5 bg-[#1A1A1A]">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-white tracking-tight">{type === 'prism' ? 'Prism Profile' : type === 'team' ? 'Squad Profile' : 'Unit Profile'}</h2>
            <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-lg text-slate-400 transition-colors"><XMarkIcon /></button>
          </div>
          <div className="flex gap-6 border-b border-white/5 -mb-6">
            <button onClick={() => setActiveTab('profile')} className={`pb-3 text-[10px] font-black uppercase tracking-widest border-b-2 transition-all ${activeTab === 'profile' ? 'text-white border-white' : 'text-slate-600 border-transparent'}`}>Protocol</button>
            <button onClick={() => setActiveTab('history')} className={`pb-3 text-[10px] font-black uppercase tracking-widest border-b-2 transition-all ${activeTab === 'history' ? 'text-white border-white' : 'text-slate-600 border-transparent'}`}>History</button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
          {activeTab === 'profile' ? (
            <div className="animate-in fade-in duration-500">
                <div className="space-y-6 mt-8">
                    {type === 'team' ? (
                        <>
                            <div><label className="block text-[10px] font-bold text-slate-500 uppercase mb-2 tracking-[0.2em]">Squad Name</label><input value={teamName} onChange={e=>setTeamName(e.target.value)} className="w-full bg-black border border-white/10 rounded-xl p-3 text-sm text-white focus:border-white outline-none transition-colors" /></div>
                            <div><label className="block text-[10px] font-bold text-slate-500 uppercase mb-2 tracking-[0.2em]">Directive</label><textarea value={teamDesc} onChange={e=>setTeamDesc(e.target.value)} rows={3} className="w-full bg-black border border-white/10 rounded-xl p-3 text-sm text-white resize-none focus:border-white outline-none transition-colors" /></div>
                        </>
                    ) : (
                        <>
                            <div>
                                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-2 tracking-[0.2em]">Agent Name</label>
                                <input value={name} onChange={e=>setName(e.target.value)} disabled={type === 'prism'} className="w-full bg-black border border-white/10 rounded-xl p-3 text-sm text-white focus:border-white outline-none transition-colors disabled:opacity-50" />
                            </div>
                            
                            <div>
                                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-2 tracking-[0.2em]">AI Model</label>
                                <div className="w-full bg-black border border-white/10 rounded-xl p-3 text-[11px] font-mono text-white/60">
                                    {brainProfile?.name || agent.model}
                                </div>
                            </div>

                            {type !== 'prism' && (
                                <>
                                    <div>
                                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-2">System Instructions</label>
                                        <textarea value={jd} onChange={e=>setJd(e.target.value)} rows={8} className="w-full bg-black border border-white/10 rounded-xl p-3 text-[11px] font-mono leading-relaxed text-slate-300 resize-none focus:border-white outline-none transition-colors" />
                                    </div>

                                    {(agent.capabilities || []).length > 0 && (
                                        <div>
                                            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-2 tracking-[0.2em]">Tools</label>
                                            <div className="flex flex-wrap gap-2">
                                                {agent.capabilities!.map(cap => (
                                                    <span key={cap} className="px-2.5 py-1 bg-white/[0.05] border border-white/10 rounded-lg text-[9px] font-bold text-slate-400 uppercase tracking-tighter">
                                                        {cap.replace('google', '').replace('Generation', '')}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}
                        </>
                    )}
                    
                    <button onClick={handleSave} className="w-full py-4 bg-white text-black text-[11px] font-black uppercase tracking-[0.3em] rounded-xl transition-all shadow-xl active:scale-[0.98]">
                        Update {type === 'prism' ? 'Protocol' : 'Profile'}
                    </button>
                </div>
            </div>
          ) : (
            <div className="space-y-6 animate-in fade-in duration-500">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] flex items-center justify-between">Saved Intervals <span className="text-slate-600">({filteredIntervals.length})</span></h4>
                {filteredIntervals.length === 0 ? (
                    <p className="text-[10px] text-slate-600 italic uppercase tracking-widest text-center py-8">No archived sessions found</p>
                ) : (
                    <div className="space-y-4">
                        {filteredIntervals.sort((a,b)=>b.createdAt-a.createdAt).map(interval => (
                            <div key={interval.id} className="p-5 bg-white/[0.02] border border-white/10 rounded-2xl group hover:border-white/30 transition-all">
                                <div className="flex justify-between items-start mb-3">
                                    <h5 className="text-[13px] font-bold text-slate-200 tracking-tight">{interval.name}</h5>
                                    <button onClick={() => onDeleteInterval?.(interval.id)} className="text-slate-600 hover:text-red-400 transition-colors">✕</button>
                                </div>
                                <p className="text-[9px] text-slate-500 font-mono mb-4">{new Date(interval.createdAt).toLocaleString()}</p>
                                <button 
                                    onClick={() => onContinueInterval?.(interval)}
                                    className="w-full py-2.5 bg-white text-black text-[10px] font-black uppercase tracking-[0.2em] rounded-lg transition-all"
                                >
                                    Restore Session
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
