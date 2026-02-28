
import React, { useState, useCallback } from 'react';
import { SideBar } from './components/SideBar';
import { ChatView } from './components/ChatView';
import { UserProfileModal } from './components/UserProfileModal';
import { CreateEntityModal } from './components/CreateEntityModal';
import { SpectrumView } from './components/SpectrumView';
import { ProfileSidebar } from './components/ProfileSidebar';
import { LoginScreen } from './components/LoginScreen';
import { HomeView } from './components/HomeView';
import { UserMapView } from './components/UserMapView';
import { useScatter } from './hooks/useScatter';
import { useTasks } from './hooks/useTasks';
import { useUserMap } from './hooks/useUserMap';
import { Agent, GlobalTask, Message, UserProfile } from './types';
import { AGENTS } from './constants';
import { ErrorBoundary } from './components/ErrorBoundary';
import { OnboardingModal } from './components/OnboardingModal';

const App: React.FC = () => {
  const {
    currentUser, isInitializing, login, logout, userProfile, setUserProfile, agents, setAgents, teams, setTeams,
    activeChatId, setActiveChatId, chatHistory, setChatHistory, isProcessing, typingAgent, typingAgents, prismStatus, orchestrationWeights, agentModes,
    handleSendMessage, handleExecuteCommand, handleExpandMessage, injectOutputToChat, clearChat, loadChatHistory, recruitAgent, createTeam, deleteAgent, deleteTeam, processSilentDirective,
    chatSessions, activeSessionId, startNewSession, resumeSession, getSessionsForEntity
  } = useScatter();

  const { globalTasks, updateTaskStatus, deleteTask, updateTask, handleAddGlobalTask } = useTasks(processSilentDirective);
  const { userMapTree, updateNode, deleteNode, addNode, consolidate, isConsolidating } = useUserMap(currentUser as UserProfile);

  const [activeView, setActiveView] = useState<'home' | 'prism' | 'spectrum' | 'chats' | 'usermap'>('home');
  const [createModalType, setCreateModalType] = useState<'agent' | 'project' | null>(null);
  const [createModalInitialValues, setCreateModalInitialValues] = useState<any>(undefined);

  const [isUserProfileOpen, setIsUserProfileOpen] = useState(false);
  const [isProfileSidebarOpen, setIsProfileSidebarOpen] = useState(false);

  // Show onboarding for first-time users (no API keys set)
  const [showOnboarding, setShowOnboarding] = useState(() => {
    if (typeof localStorage === 'undefined') return false;
    const done = localStorage.getItem('onboarding_done');
    if (done) return false;
    const profile = localStorage.getItem('user_profile');
    if (!profile) return true;
    try {
      const p = JSON.parse(profile);
      return !p.geminiKey && !p.openAiKey && !p.anthropicKey;
    } catch { return true; }
  });

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
      case 'usermap':
        return <UserMapView tree={userMapTree} isConsolidating={isConsolidating} onUpdateNode={updateNode} onDeleteNode={deleteNode} onAddNode={addNode} onConsolidate={consolidate} />;

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
                <div className="ml-10 md:ml-0 flex items-center gap-4">
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">
                    {activeTeam && prismStatus ? <span className="text-white animate-pulse">{prismStatus}</span> : (isPrism ? "Prism Chat" : "Synchronized")}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {/* Session Controls */}
                  <div className="flex items-center gap-1">
                    {getSessionsForEntity(activeChatId).length > 1 && (
                      <select
                        value={activeSessionId || ''}
                        onChange={(e) => {
                          const session = chatSessions.find(s => s.id === e.target.value);
                          if (session) resumeSession(session);
                        }}
                        className="bg-transparent border border-white/10 rounded-lg px-2 py-1.5 text-[9px] font-bold text-white/60 uppercase tracking-wider outline-none cursor-pointer hover:border-white/20 transition-all appearance-none"
                      >
                        {getSessionsForEntity(activeChatId).map((s, i) => (
                          <option key={s.id} value={s.id} className="bg-[#1A1A1A] text-white">
                            {s.title === 'New Chat' ? `Session ${getSessionsForEntity(activeChatId).length - i}` : s.title} — {new Date(s.updatedAt).toLocaleDateString()}
                          </option>
                        ))}
                      </select>
                    )}
                    <button
                      onClick={() => startNewSession(activeChatId)}
                      title="Start new chat interval"
                      className="p-1.5 rounded-lg border border-white/10 text-white/30 hover:text-white hover:border-white/30 hover:bg-white/5 transition-all"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
                    </button>
                  </div>
                  <button onClick={() => setIsProfileSidebarOpen(!isProfileSidebarOpen)} className={`p-2 rounded-lg border transition-all ${isProfileSidebarOpen ? 'bg-white border-white text-black' : 'text-white/40 border-white/10 hover:bg-white/5'}`}>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 1 1.063.852l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z" /></svg>
                  </button>
                </div>
              </header>

              <div className="flex-1 overflow-hidden relative">
                <ChatView
                  messages={chatHistory[activeChatId] || []} isLoading={isProcessing} typingAgent={typingAgent} typingAgents={typingAgents as any}
                  onSubmit={handleSendMessage}
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
                isOpen={isProfileSidebarOpen} type={profileData.type} data={profileData.data as any} globalTasks={[]}
                onUpdateUserProfile={(p) => setUserProfile({ ...userProfile, ...p })}
                userProfile={userProfile}
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
        <ErrorBoundary fallback={
          <div className="flex-1 flex items-center justify-center p-8 text-center bg-[#1A1A1A]">
            <div>
              <div className="w-16 h-16 bg-red-500/10 rounded-2xl mx-auto mb-4 flex items-center justify-center border border-red-500/20">⚠️</div>
              <h2 className="text-xl font-bold bg-gradient-to-r from-red-400 to-rose-400 bg-clip-text text-transparent mb-2">Workspace Render Error</h2>
              <p className="text-white/40 max-w-sm mb-6">A component failure occurred while rendering the active view.</p>
              <button onClick={() => window.location.reload()} className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 text-sm">Force Reload</button>
            </div>
          </div>
        }>
          {renderContent()}
        </ErrorBoundary>
      </main>

      {createModalType && (
        <CreateEntityModal isOpen={!!createModalType} type={createModalType === 'agent' ? 'employee' : 'project'} employees={agents} initialValues={createModalInitialValues} onClose={() => { setCreateModalType(null); setCreateModalInitialValues(undefined); }} onCreateEmployee={recruitAgent} onCreateGroup={createTeam} />
      )}

      {isUserProfileOpen && (
        <UserProfileModal user={userProfile} isOpen={isUserProfileOpen} onClose={() => setIsUserProfileOpen(false)} onSave={setUserProfile} onLogout={logout} />
      )}

      <OnboardingModal
        isOpen={showOnboarding}
        onClose={() => { setShowOnboarding(false); localStorage.setItem('onboarding_done', 'true'); }}
        onOpenProfile={() => setIsUserProfileOpen(true)}
      />
    </div>
  );
};

export default App;
