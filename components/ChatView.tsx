
import React, { useState, useEffect } from 'react';
import { ChatInterface } from './ChatInterface';
import { InputBar } from './InputBar';
import { ScatterBottleVisual } from './ScatterBottleVisual';
import { Message, Agent as AgentType, CustomGroupSuggestion, ToolCall, Team, GlobalTask } from '../types';
import { RateLimitInfo } from '../hooks/useScatter';

interface ChatSession {
  id: string;
  title: string;
  updatedAt: number;
}

interface ChatViewProps {
  messages: Message[];
  isLoading: boolean;
  typingAgent?: AgentType | null;
  typingAgents?: { agent: AgentType; tasks: any[] }[];
  onSubmit: (prompt: string, steps: number, file?: { data: string, mimeType: string }, searchEnabled?: boolean, createEnabled?: boolean) => void;
  onAddAgent: (agentData: Omit<AgentType, 'id' | 'type'>) => void;
  onCreateTeam: (teamData: { name: string, agentIds: string[] }) => void;
  onExecuteCommand?: (messageId: string, toolCall: ToolCall) => void;
  onExpandMessage?: (messageId: string) => void;
  onSaveToTasks?: (task: Omit<GlobalTask, 'id' | 'createdAt'>) => void;
  onInjectSystemMessage?: (text: string) => void;
  mentionCandidates: AgentType[];
  onConfigureNewAgent?: (profileId?: string, role?: string, jd?: string) => void;
  onDeployCustomTeam?: (suggestion: CustomGroupSuggestion) => void;
  prismStatus: string;
  isGroup?: boolean;
  orchestrationWeights?: Record<string, number>;
  agentModes?: Record<string, 'CHAT' | 'SOLUTION' | 'TASK' | 'VOID'>;
  activeChatId?: string;
  activeAgent?: AgentType;
  activeTeam?: Team;
  rateLimitInfo?: RateLimitInfo;
  // Session controls
  sessions?: ChatSession[];
  activeSessionId?: string;
  onResumeSession?: (sessionId: string) => void;
  onStartNewSession?: () => void;
}

export const ChatView: React.FC<ChatViewProps> = ({
  messages, isLoading, typingAgent, typingAgents = [], onSubmit, onAddAgent, onCreateTeam, onExecuteCommand, onExpandMessage, onSaveToTasks, onInjectSystemMessage, mentionCandidates, onConfigureNewAgent, onDeployCustomTeam, prismStatus, isGroup = false, orchestrationWeights = {}, agentModes = {}, activeChatId, activeAgent, activeTeam,
  rateLimitInfo,
  sessions = [], activeSessionId = '', onResumeSession, onStartNewSession
}) => {
  const isDispatching = prismStatus !== "";
  const activatedIds = typingAgents.length > 0 ? typingAgents.map(a => a.agent.id) : (typingAgent ? [typingAgent.id] : []);

  const canOpenLiveSpace = (activeAgent?.isLiveSpaceEnabled) || (activeTeam?.isLiveSpaceEnabled);
  const isPrism = activeChatId === 'prism-core';
  const isRateLimited = rateLimitInfo?.blocked ?? false;

  return (
    <div className="flex flex-col h-full w-full relative">
      <ScatterBottleVisual
        isRolling={isDispatching}
        activeAgents={mentionCandidates}
        selectedIds={activatedIds}
        weights={orchestrationWeights}
        agentModes={agentModes}
      />

      <div className="flex-1 overflow-hidden flex flex-col relative">
        <ChatInterface
          messages={messages}
          isLoading={isLoading}
          typingAgent={typingAgent}
          typingAgents={typingAgents}
          onAddEmployee={onAddAgent}
          /* Fix: Renamed onCreateTeam to onCreateGroup to match ChatInterfaceProps */
          onCreateGroup={onCreateTeam}
          onConfigureNewAgent={onConfigureNewAgent}
          onDeployCustomGroup={onDeployCustomTeam}
          onExecuteCommand={onExecuteCommand}
          onExpandMessage={onExpandMessage}
          isPrism={isPrism}
        />
      </div>

      {/* Session Controls — above InputBar */}
      {(sessions.length > 1 || onStartNewSession) && (
        <div className="flex items-center justify-center gap-2 px-4 py-2 border-t border-white/5">
          {sessions.length > 1 && onResumeSession && (
            <select
              value={activeSessionId}
              onChange={(e) => onResumeSession(e.target.value)}
              className="bg-transparent border border-white/10 rounded-lg px-2 py-1.5 text-[9px] font-bold text-white/40 uppercase tracking-wider outline-none cursor-pointer hover:border-white/20 transition-all appearance-none"
            >
              {sessions.map((s, i) => (
                <option key={s.id} value={s.id} className="bg-[#1A1A1A] text-white">
                  {s.title === 'New Chat' ? `Session ${sessions.length - i}` : s.title} — {new Date(s.updatedAt).toLocaleDateString()}
                </option>
              ))}
            </select>
          )}
          {onStartNewSession && (
            <button
              onClick={onStartNewSession}
              title="New session"
              className="p-1.5 rounded-lg border border-white/10 text-white/20 hover:text-white/60 hover:border-white/20 hover:bg-white/5 transition-all"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3.5 h-3.5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
            </button>
          )}
        </div>
      )}

      {/* Rate Limit Banner */}
      {isRateLimited && rateLimitInfo && (
        <div className="mx-4 mb-2 px-4 py-3 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-center gap-3">
          <span className="text-lg">⏳</span>
          <div className="flex-1">
            <p className="text-[11px] font-bold text-amber-300/90 uppercase tracking-wider">
              Rate Limit Reached — {rateLimitInfo.limit - rateLimitInfo.remaining}/{rateLimitInfo.limit} Requests Used
            </p>
            <p className="text-[10px] text-amber-200/50 mt-0.5">
              {rateLimitInfo.resetTimeFormatted
                ? `Your limit resets at ${rateLimitInfo.resetTimeFormatted}. Check back then.`
                : 'Your limit will reset in about an hour.'}
            </p>
          </div>
        </div>
      )}

      {/* Usage Counter (when not blocked but usage > 0) */}
      {!isRateLimited && rateLimitInfo && rateLimitInfo.remaining < rateLimitInfo.limit && (
        <div className="flex justify-center pb-1">
          <span className="text-[8px] font-bold text-white/15 uppercase tracking-widest">
            {rateLimitInfo.remaining}/{rateLimitInfo.limit} requests remaining
          </span>
        </div>
      )}

      <div className="relative w-full">
        <InputBar
          onSubmit={onSubmit}
          isLoading={isLoading || isRateLimited}
          mentionCandidates={mentionCandidates}
          isGroup={isGroup}
          isPrism={isPrism}
        />
      </div>
    </div>
  );
};
