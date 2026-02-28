import { useState, useEffect, useCallback } from 'react';
import { Agent, Team, Message, UserProfile, MessageContent, Task, ToolCall, GlobalTask } from '../types';
import { AGENTS } from '../constants';
import { generateSingleAgentResponse, generatePrismResponse } from '../services/aiService';
import { dbService, STORES_ENUM } from '../services/db';

// Composed Hooks
import { useAuth } from './useAuth';
import { useEntities } from './useEntities';
import { useChatSessions } from './useChatSessions';
import { useAgentExecution } from './useAgentExecution';

export interface TypingState {
    agent: Agent;
    tasks: Task[];
    weight?: number;
    mode?: 'CHAT' | 'SOLUTION' | 'TASK' | 'VOID';
}

export const useScatter = () => {
    // === Composed Hooks ===
    const {
        currentUser, setCurrentUser, isInitializing, setIsInitializing,
        login, logout, getUserKeys
    } = useAuth();

    const {
        agents, setAgents, teams, setTeams,
        loadEntities, recruitAgent, deleteAgent, deleteTeam, createTeam
    } = useEntities(currentUser);

    const {
        chatHistory, setChatHistory, activeChatId, setActiveChatId,
        chatSessions, activeSessionId,
        loadSessions, addMessage, clearChat, loadChatHistory,
        startNewSession, resumeSession, getSessionsForEntity
    } = useChatSessions(currentUser);

    // === Load Data on Auth ===
    useEffect(() => {
        if (currentUser) {
            const init = async () => {
                try {
                    await loadEntities(currentUser.id);
                    await loadSessions(currentUser.id);
                } catch (e) {
                    console.error(e);
                } finally {
                    setIsInitializing(false);
                }
            };
            init();
        }
    }, [currentUser]);

    // === Agent Execution ===
    const {
        isProcessing, setActiveRequests,
        typingAgent, setTypingAgent,
        typingAgents, setTypingAgents,
        prismStatus, setPrismStatus,
        orchestrationWeights, setOrchestrationWeights,
        agentModes, setAgentModes,
        handleExpandMessage, handleExecuteCommand
    } = useAgentExecution(currentUser, getUserKeys, addMessage, chatHistory, setChatHistory);

    // === Background Directives ===
    const processSilentDirective = useCallback(async (task: GlobalTask) => {
        const agent = agents.find(a => a.id === task.agentId);
        if (!agent) return "Error: Agent not found.";
        const userKeys = getUserKeys();
        const response = await generateSingleAgentResponse(
            [{ id: 'task-trigger', agent: { ...AGENTS.PRISM, name: currentUser?.name || 'User', type: 'user' } as Agent, content: { type: 'text', text: task.label }, type: 'user' }],
            agent, [], [], 'SOLUTION', userKeys, currentUser?.id
        );
        return response && response.type === 'text' ? response.text : undefined;
    }, [agents, currentUser, getUserKeys]);

    const injectOutputToChat = useCallback((task: GlobalTask) => {
        if (!task.output) return;
        const targetAgent = agents.find(a => a.id === task.agentId) || AGENTS.PRISM;
        const chatId = task.teamId || task.agentId;
        addMessage(chatId, {
            id: `output-${Date.now()}`,
            userId: currentUser?.id,
            agent: targetAgent,
            content: { type: 'text', text: task.output, mode: 'SOLUTION' },
            type: 'agent'
        });
    }, [agents, currentUser, addMessage]);

    // === Proxy Functions ===
    const _executeCmdProxy = async (messageId: string, toolCall: ToolCall) => {
        return handleExecuteCommand(activeChatId, messageId, toolCall,
            (team) => { setTeams(prev => [...prev, team]); dbService.put(STORES_ENUM.GROUPS, team); },
            recruitAgent,
            setActiveChatId
        );
    };

    const _expandMsgProxy = async (messageId: string) => {
        return handleExpandMessage(activeChatId, messageId);
    };

    // === Send Message (Core Orchestration) ===
    const handleSendMessage = useCallback(async (text: string, responseSteps: number = 1, file?: { data: string, mimeType: string }, searchEnabled?: boolean, createEnabled?: boolean) => {
        const chatId = activeChatId;
        if (!currentUser) return;

        const newMessage: Message = {
            id: Date.now().toString(),
            userId: currentUser.id,
            agent: { ...AGENTS.PRISM, name: currentUser.name, type: 'user', icon: '👤' } as Agent,
            content: { type: 'text', text },
            type: 'user'
        };

        addMessage(chatId, newMessage);
        let currentSnapshot = [...(chatHistory[chatId] || []), newMessage];

        if (createEnabled && chatId === 'prism-core') {
            const lastMsg = currentSnapshot[currentSnapshot.length - 1];
            currentSnapshot[currentSnapshot.length - 1] = {
                ...lastMsg,
                content: {
                    ...lastMsg.content, type: 'text',
                    text: `${(lastMsg.content as any).text}\n\n[SYSTEM DIRECTIVE: The user has toggled 'Create Agents'. You MUST analyze the request and immediately use your 'fabricateAgent' tool to deploy the requested specialist. Do NOT just output conversational text.]`
                }
            };
        }

        const team = teams.find(g => g.id === chatId);
        const agent = agents.find(e => e.id === chatId);
        setActiveRequests(prev => prev + 1);

        try {
            if (team) {
                setPrismStatus("Scanning for Mentions...");
                const mentionedNames = text.match(/@(\w+)/g)?.map(m => m.slice(1).toLowerCase()) || [];
                const mentionedAgents = team.agents.filter(a => mentionedNames.includes(a.name.toLowerCase()));

                if (mentionedAgents.length > 0) {
                    setPrismStatus(`Initializing ${mentionedAgents.length} unit(s)...`);
                    const weights: Record<string, number> = {};
                    mentionedAgents.forEach(a => weights[a.id] = 1 / mentionedAgents.length);
                    setOrchestrationWeights(weights);
                    setTypingAgents(mentionedAgents.map(a => ({ agent: a, tasks: [], mode: 'CHAT' as const })));

                    await Promise.all(mentionedAgents.map(async (targetAgent) => {
                        const response = await generateSingleAgentResponse(currentSnapshot, targetAgent, team.agents, [], 'CHAT', undefined, currentUser?.id);
                        if (response) addMessage(chatId, { id: `msg-${Date.now()}-${targetAgent.id}`, userId: currentUser.id, agent: targetAgent, content: response, type: 'agent' });
                    }));
                } else {
                    setPrismStatus("No mention detected. Consulting Core...");
                    const response = await generatePrismResponse(currentSnapshot, AGENTS.PRISM, setPrismStatus, undefined, undefined, currentUser?.id);
                    if (response) addMessage(chatId, { id: `msg-${Date.now()}`, userId: currentUser.id, agent: AGENTS.PRISM, content: response, type: 'agent' });
                }
            } else if (agent || chatId === 'prism-core') {
                const target = agent || AGENTS.PRISM;
                setTypingAgent(target);
                let response;
                if (target.id === 'prism-core') {
                    response = await generatePrismResponse(currentSnapshot, target, setPrismStatus, undefined, undefined, currentUser?.id);
                } else {
                    response = await generateSingleAgentResponse(currentSnapshot, target, [], [], 'CHAT', undefined, currentUser?.id);
                }

                if (response) addMessage(chatId, { id: `msg-${Date.now()}`, userId: currentUser.id, agent: target, content: response, type: 'agent' });
            }
        } finally {
            setActiveRequests(prev => prev - 1);
            setPrismStatus("");
            setTypingAgents([]);
            setTypingAgent(null);
            setOrchestrationWeights({});
        }
    }, [currentUser, activeChatId, agents, teams, chatHistory, addMessage, getUserKeys]);

    return {
        currentUser, isInitializing, userProfile: currentUser as UserProfile, setUserProfile: setCurrentUser,
        login, logout,
        agents, setAgents, teams, setTeams,
        activeChatId, setActiveChatId, chatHistory, setChatHistory,
        isProcessing, typingAgent, typingAgents, prismStatus, orchestrationWeights, agentModes,
        handleSendMessage, handleExecuteCommand: _executeCmdProxy, handleExpandMessage: _expandMsgProxy,
        processSilentDirective, injectOutputToChat,
        clearChat, loadChatHistory, recruitAgent, deleteAgent, deleteTeam,
        createTeam: (data: any) => createTeam(data, setActiveChatId),
        // Session Management
        chatSessions, activeSessionId, startNewSession, resumeSession, getSessionsForEntity
    };
};
