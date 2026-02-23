
import React, { useState, useCallback } from 'react';
import { SideBar } from './components/SideBar';
import { ChatView } from './components/ChatView';
import { UserProfileModal } from './components/UserProfileModal';
import { CreateEntityModal } from './components/CreateEntityModal';
import { SpectrumView } from './components/SpectrumView';
import { ProfileSidebar } from './components/ProfileSidebar';
import { IntervalSaveModal } from './components/ChatIntervals/IntervalSaveModal';
import { UnsavedPrompt } from './components/ChatIntervals/UnsavedPrompt';
import { WorkView } from './components/WorkView';
import { MediaView } from './components/MediaView';
import { LoginScreen } from './components/LoginScreen';
import { HomeView } from './components/HomeView';
import { useScatter } from './hooks/useScatter';
import { useChatIntervals } from './hooks/useChatIntervals';
import { useTasks } from './hooks/useTasks';
import { Agent, GlobalTask, ChatInterval, Message, UserProfile } from './types';
import { AGENTS } from './constants';

const App: React.FC = () => {
  const {
    currentUser, isInitializing, login, logout, userProfile, setUserProfile, agents, setAgents, teams, setTeams,
    activeChatId, setActiveChatId, chatHistory, setChatHistory, isProcessing, typingAgent, typingAgents, prismStatus, orchestrationWeights, agentModes,
    handleSendMessage, handleExecuteCommand, handleExpandMessage, injectOutputToChat, clearChat, loadChatHistory, recruitAgent, createTeam, deleteAgent, deleteTeam, processSilentDirective
  } = useScatter();

  const { intervals, deleteInterval, saveInterval } = useChatIntervals();
  const { globalTasks, updateTaskStatus, deleteTask, updateTask, handleAddGlobalTask } = useTasks(processSilentDirective);

  const [activeView, setActiveView] = useState<'home' | 'prism' | 'spectrum' | 'chats' | 'work' | 'media'>('home');
  const [createModalType, setCreateModalType] = useState<'agent' | 'project' | null>(null);
  const [createModalInitialValues, setCreateModalInitialValues] = useState<any>(undefined);

  const [isUserProfileOpen, setIsUserProfileOpen] = useState(false);
  const [isProfileSidebarOpen, setIsProfileSidebarOpen] = useState(false);

  const [isIntervalSaveOpen, setIsIntervalSaveOpen] = useState(false);
  const [isUnsavedPromptOpen, setIsUnsavedPromptOpen] = useState(false);
  const [pendingIntervalToLoad, setPendingIntervalToLoad] = useState<ChatInterval | null>(null);

  if (isInitializing) {
    return (
      <div className="h-screen w-screen bg-[#1A1A1A] flex items-center justify-center">
        <div className="text-white font-bold animate-pulse uppercase tracking-[0.5em] text-xs">
          Initializing RamN AI...
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return <LoginScreen onLogin={login} />;
  }

  const activeTeam = teams.find(g => g.id === activeChatId);
  const activeAgent = agents.find(e => e.id === activeChatId);
  const isPrism = activeChatId === 'prism-core';

  const handleSaveCurrentInterval = async (name: string) => {
    const currentMsgs = chatHistory[activeChatId] || [];
    if (currentMsgs.length > 0) {
      await saveInterval(activeChatId, name, currentMsgs);
      clearChat(activeChatId);
    }
    setIsIntervalSaveOpen(false);
  };

  const handleContinueInterval = (interval: ChatInterval) => {
    const currentMsgs = chatHistory[activeChatId] || [];
    const isDirty = activeChatId === 'prism-core' ? currentMsgs.length > 1 : currentMsgs.length > 0;
    if (isDirty) {
      setPendingIntervalToLoad(interval);
      setIsUnsavedPromptOpen(true);
    } else {
      performLoadInterval(interval);
    }
  };

  const performLoadInterval = (interval: ChatInterval) => {
    setActiveChatId(interval.targetId);
    loadChatHistory(interval.targetId, interval.messages);
    setIsUnsavedPromptOpen(false);
    setPendingIntervalToLoad(null);
    setIsProfileSidebarOpen(false);
    setActiveView('chats');
  };

  const handleHireFromSpectrum = (p: any) => {
    if ('modelId' in p) {
      setCreateModalInitialValues({ profileId: p.id, role: p.tags[0], jd: p.summary, isLiveSpaceEnabled: p.isLiveSpaceEnabled });
    } else {
      setCreateModalInitialValues({ profileId: p.defaultModelId, role: p.role, jd: p.jobDescription, name: p.name, isLiveSpaceEnabled: p.isLiveSpaceEnabled });
    }
    setCreateModalType('agent');
  };

  const handleInjectSystemMessage = (text: string) => {
    const sysMsg: Message = {
      id: `sys-${Date.now()}`,
      agent: AGENTS.PRISM,
      type: 'agent',
      content: { type: 'text', text: `[SYSTEM_SIGNAL]: ${text}` }
    };
    setChatHistory(prev => ({
      ...prev,
      [activeChatId]: [...(prev[activeChatId] || []), sysMsg]
    }));
  };

  const profileData = isPrism ? { type: 'prism' as const, data: AGENTS.PRISM } : (activeTeam ? { type: 'team' as const, data: activeTeam } : (activeAgent ? { type: 'agent' as const, data: activeAgent } : null));

  const renderContent = () => {
    switch (activeView) {
      case 'home':
        return <HomeView onStartChat={() => { setActiveView('prism'); setActiveChatId('prism-core'); }} onOpenProfile={() => setIsUserProfileOpen(true)} />;
      case 'spectrum':
        return <SpectrumView onHire={handleHireFromSpectrum} onFabricateAgent={() => setCreateModalType('agent')} onInitializeGroup={() => setCreateModalType('project')} agents={agents} teams={teams} userProfile={userProfile} />;
      case 'media':
        return <MediaView chatHistory={chatHistory} />;
      case 'work': // Theoretically unreachable but kept for safety
        return <div className="p-20 text-center opacity-20 uppercase tracking-[0.5em] text-xs">Work Hub Disabled in Beta</div>;
      default:
        // Automatically deselect Prism if we are supposed to be in 'chats' view and Prism is still active
        const showBlankState = activeView === 'chats' && isPrism;

        if (showBlankState) {
          return (
            <div className="flex-1 flex flex-col items-center justify-center border-r border-white/5 bg-[#1A1A1A]">
              <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mb-6 border border-white/10">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className="w-8 h-8 text-white/20">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.76c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.076-4.076a1.526 1.526 0 0 1 1.037-.443 48.282 48.282 0 0 0 5.68-.494 3.32 3.32 0 0 0 2.822-3.237V9.72m-3.22 8.4A3.32 3.32 0 0 0 21 14.885V5.115a3.32 3.32 0 0 0-2.822-3.236A48.282 48.282 0 0 0 12 1.535c-2.11 0-4.18.173-6.208.494A3.32 3.32 0 0 0 3 5.115v9.77M12 10.5h.008v.008H12V10.5Z" />
                </svg>
              </div>
              <h3 className="text-white/40 font-black uppercase tracking-[0.2em] text-xs">No Agent Selected</h3>
              <p className="text-white/20 text-[10px] mt-2 font-medium">Select an agent or team from the sidebar to begin.</p>
            </div>
          );
        }

        return (
          <div className="flex-1 flex overflow-hidden">
            <div className="flex-1 flex flex-col min-w-0 border-r border-white/5">
              <header className="h-16 border-b border-white/5 flex items-center justify-between px-4 md:px-6 bg-[#1A1A1A] z-10 flex-shrink-0">
                <div className="ml-10 md:ml-0">
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">
                    {activeTeam && prismStatus ? <span className="text-white animate-pulse">{prismStatus}</span> : (isPrism ? "Prism Chat" : "Synchronized")}
                  </span>
                </div>
                <button onClick={() => setIsProfileSidebarOpen(!isProfileSidebarOpen)} className={`p-2 rounded-lg border transition-all ${isProfileSidebarOpen ? 'bg-white border-white text-black' : 'text-white/40 border-white/10 hover:bg-white/5'}`}>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 1 1.063.852l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z" /></svg>
                </button>
              </header>

              <div className="flex-1 overflow-hidden relative">
                <ChatView
                  messages={chatHistory[activeChatId] || []} isLoading={isProcessing} typingAgent={typingAgent} typingAgents={typingAgents as any}
                  onSubmit={handleSendMessage} onOpenTaskModal={() => { }}
                  onSaveInterval={() => setIsIntervalSaveOpen(true)} onContinueIntervals={() => setIsProfileSidebarOpen(true)}
                  onAddAgent={recruitAgent} onCreateTeam={(data) => createTeam({ ...data, type: 'rouge' })}
                  onExecuteCommand={handleExecuteCommand}
                  onExpandMessage={handleExpandMessage}
                  onSaveToTasks={handleAddGlobalTask}
                  onInjectSystemMessage={handleInjectSystemMessage}
                  mentionCandidates={activeTeam ? activeTeam.agents : []} prismStatus={prismStatus} isGroup={!!activeTeam} orchestrationWeights={orchestrationWeights} agentModes={agentModes}
                  activeChatId={activeChatId}
                  activeAgent={activeAgent}
                  activeTeam={activeTeam}
                />
              </div>
            </div>
            {profileData && (
              <ProfileSidebar
                isOpen={isProfileSidebarOpen} type={profileData.type} data={profileData.data as any} globalTasks={[]} intervals={intervals}
                onUpdateUserProfile={(p) => setUserProfile({ ...userProfile, ...p })}
                userProfile={userProfile}
                onContinueInterval={handleContinueInterval} onDeleteInterval={deleteInterval}
                onClose={() => setIsProfileSidebarOpen(false)} onSaveAgent={(u) => setAgents(prev => prev.map(e => e.id === u.id ? u : e))} onSaveTeam={(u) => setTeams(prev => prev.map(g => g.id === u.id ? u : g))}
              />
            )}
          </div>
        );
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#1A1A1A] text-white font-sans selection:bg-white/10">
      <SideBar
        activeView={activeView}
        onViewChange={(view) => {
          if (view === 'work') return; // Enforce disable in logic
          setActiveView(view);
          if (view === 'prism') setActiveChatId('prism-core');
        }}
        onOpenProfile={() => setIsUserProfileOpen(true)}
        agents={agents}
        teams={teams}
        activeChatId={activeChatId}
        onSelectChat={(id) => { setActiveChatId(id); setActiveView('chats'); }}
        onDeleteTeam={deleteTeam}
        onDeleteAgent={deleteAgent}
        userProfile={userProfile}
      />

      <main className="flex-1 flex flex-col relative min-w-0 bg-[#1A1A1A]">
        {renderContent()}
      </main>

      {createModalType && (
        <CreateEntityModal isOpen={!!createModalType} type={createModalType === 'agent' ? 'employee' : 'project'} employees={agents} initialValues={createModalInitialValues} onClose={() => { setCreateModalType(null); setCreateModalInitialValues(undefined); }} onCreateEmployee={recruitAgent} onCreateGroup={createTeam} />
      )}

      {isUserProfileOpen && (
        <UserProfileModal user={userProfile} isOpen={isUserProfileOpen} onClose={() => setIsUserProfileOpen(false)} onSave={setUserProfile} onLogout={logout} />
      )}

      {isIntervalSaveOpen && (
        <IntervalSaveModal isOpen={isIntervalSaveOpen} onClose={() => setIsIntervalSaveOpen(false)} onSave={handleSaveCurrentInterval} />
      )}

      {isUnsavedPromptOpen && (
        <UnsavedPrompt
          isOpen={isUnsavedPromptOpen} onCancel={() => setIsUnsavedPromptOpen(false)}
          onSave={() => { setIsUnsavedPromptOpen(false); setIsIntervalSaveOpen(true); }}
          onIgnore={() => { if (pendingIntervalToLoad) { performLoadInterval(pendingIntervalToLoad); } }}
        />
      )}
    </div>
  );
};

export default App;
