
import React, { useState, useEffect } from 'react';
import { ChatInterface } from './ChatInterface';
import { InputBar } from './InputBar';
import { ScatterBottleVisual } from './ScatterBottleVisual';
import { LiveSpace } from './LiveSpace/LiveSpace';
import { Message, Agent as AgentType, CustomGroupSuggestion, ToolCall, Team, GlobalTask } from '../types';

interface ChatViewProps {
  messages: Message[];
  isLoading: boolean;
  typingAgent?: AgentType | null;
  typingAgents?: { agent: AgentType; tasks: any[] }[];
  onSubmit: (prompt: string, steps: number, file?: { data: string, mimeType: string }, searchEnabled?: boolean, routeEnabled?: boolean, createEnabled?: boolean) => void;
  onOpenTaskModal?: () => void;
  onSaveInterval?: () => void;
  onContinueIntervals?: () => void;
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
}

export const ChatView: React.FC<ChatViewProps> = ({
  messages, isLoading, typingAgent, typingAgents = [], onSubmit, onOpenTaskModal, onSaveInterval, onContinueIntervals, onAddAgent, onCreateTeam, onExecuteCommand, onExpandMessage, onSaveToTasks, onInjectSystemMessage, mentionCandidates, onConfigureNewAgent, onDeployCustomTeam, prismStatus, isGroup = false, orchestrationWeights = {}, agentModes = {}, activeChatId, activeAgent, activeTeam
}) => {
  const [isLiveSpaceOpen, setIsLiveSpaceOpen] = useState(false);

  useEffect(() => {
    setIsLiveSpaceOpen(false);
  }, [activeChatId]);

  const isDispatching = prismStatus !== "";
  const activatedIds = typingAgents.length > 0 ? typingAgents.map(a => a.agent.id) : (typingAgent ? [typingAgent.id] : []);

  const canOpenLiveSpace = (activeAgent?.isLiveSpaceEnabled) || (activeTeam?.isLiveSpaceEnabled);
  const isPrism = activeChatId === 'prism-core';

  const handleOpenLiveSpace = () => {
    setIsLiveSpaceOpen(true);
    onInjectSystemMessage?.("LiveTasking initialized. Workspace synchronization complete.");
  };

  const handleCloseLiveSpace = () => {
    setIsLiveSpaceOpen(false);
    onInjectSystemMessage?.("LiveTasking session terminated. All operational logs archived.");
  };

  return (
    <div className="flex flex-col h-full w-full relative">
      <ScatterBottleVisual
        isRolling={isDispatching}
        activeAgents={mentionCandidates}
        selectedIds={activatedIds}
        weights={orchestrationWeights}
        agentModes={agentModes}
      />

      {isLiveSpaceOpen && (
        <LiveSpace
          isOpen={isLiveSpaceOpen}
          onClose={handleCloseLiveSpace}
          onSaveToTasks={onSaveToTasks}
          agents={activeTeam ? activeTeam.agents : (activeAgent ? [activeAgent] : [])}
          isGroup={!!activeTeam}
        />
      )}

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

      <div className="relative w-full">
        <InputBar
          onSubmit={onSubmit}
          onOpenTaskModal={onOpenTaskModal}
          onSaveInterval={onSaveInterval}
          onOpenLiveSpace={handleOpenLiveSpace}
          canOpenLiveSpace={canOpenLiveSpace && !isLiveSpaceOpen}
          isLoading={isLoading}
          mentionCandidates={mentionCandidates}
          isGroup={isGroup}
          isPrism={isPrism}
        />
      </div>
    </div>
  );
};
