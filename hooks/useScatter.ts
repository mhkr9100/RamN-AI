
import { useState, useEffect, useCallback } from 'react';
import { Agent, Team, Message, UserProfile, MessageContent, Task, ToolCall, GlobalTask } from '../types';
import { AGENTS, SYSTEM_TEAMS } from '../constants';
import { generateSingleAgentResponse, generatePrismResponse, dispatchGroupTask, executeInterceptedCommand, generateExpandedSolution } from '../services/aiService';
import { dbService, STORES_ENUM } from '../services/db';
import { authService } from '../services/auth';

export interface TypingState {
    agent: Agent;
    tasks: Task[];
    weight?: number;
    mode?: 'CHAT' | 'SOLUTION' | 'TASK' | 'VOID';
}

export const useScatter = () => {
    const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
    const [isInitializing, setIsInitializing] = useState(true);
    const [agents, setAgents] = useState<Agent[]>([]);
    const [teams, setTeams] = useState<Team[]>([]);
    const [chatHistory, setChatHistory] = useState<{ [key: string]: Message[] }>({});
    const [activeChatId, setActiveChatId] = useState<string>('prism-core');

    const [activeRequests, setActiveRequests] = useState(0);
    const isProcessing = activeRequests > 0;

    const [typingAgent, setTypingAgent] = useState<Agent | null>(null);
    const [typingAgents, setTypingAgents] = useState<TypingState[]>([]);
    const [prismStatus, setPrismStatus] = useState<string>('');
    const [orchestrationWeights, setOrchestrationWeights] = useState<{ [key: string]: number }>({});
    const [agentModes, setAgentModes] = useState<{ [key: string]: 'CHAT' | 'SOLUTION' | 'TASK' | 'VOID' }>({});

    const getApiKeyForAgent = useCallback((agent: Agent) => {
        if (agent.id === 'prism-core') return undefined; // Prism uses the platform's backend key

        if (agent.apiKey) return agent.apiKey;
        if (!currentUser?.apiKeys || currentUser.apiKeys.length === 0) return null;

        // Try to find a key that matches the provider or service
        const providerKey = currentUser.apiKeys.find(k =>
            k.service.toLowerCase().includes(agent.provider.toLowerCase()) ||
            agent.provider.toLowerCase().includes(k.service.toLowerCase()) ||
            (agent.provider === 'google' && k.service.toLowerCase().includes('gemini'))
        );
        if (providerKey) return providerKey.key;

        // Fallback to the first key if it's the only one
        if (currentUser.apiKeys.length === 1) return currentUser.apiKeys[0].key;

        return null;
    }, [currentUser]);

    // Persistence Effect
    useEffect(() => {
        const loadData = async (userId: string) => {
            try {
                const allAgents = await dbService.getAll<Agent>(STORES_ENUM.AGENTS);
                const systemAgents = Object.values(AGENTS).filter(a => a.isSystem && a.id !== 'prism-core');
                let userAgents = allAgents.filter(a => a.userId === userId && !a.isSystem);

                const allTeams = await dbService.getAll<Team>(STORES_ENUM.GROUPS);
                let userTeams = allTeams.filter(g => g.userId === userId && !g.isSystem);

                const historyKey = `history_${userId}`;
                const loadedChats = await dbService.get<{ [key: string]: Message[] }>(STORES_ENUM.CHATS, historyKey) || {};

                setAgents([...systemAgents, ...userAgents]);
                setTeams([...SYSTEM_TEAMS, ...userTeams]);
                setChatHistory(loadedChats);
            } catch (e) {
                console.error(e);
            } finally {
                setIsInitializing(false);
            }
        };

        const checkSession = async () => {
            try {
                // Fetch AWS Cognito Session
                const user = await authService.getCurrentUser();
                if (user) {
                    const profile: UserProfile = {
                        id: user.id || 'aws-user-id',
                        email: user.email || user.username || '',
                        name: user.name || user.username || 'Architect',
                        avatar: ''
                    };
                    setCurrentUser(profile);
                    loadData(profile.id);
                } else {
                    setCurrentUser(null);
                    setIsInitializing(false);
                }
            } catch (err) {
                console.error("Auth session error:", err);
                setIsInitializing(false);
            }
        };
        checkSession();
    }, []);

    useEffect(() => {
        if (currentUser) {
            const historyKey = `history_${currentUser.id}`;
            dbService.put(STORES_ENUM.CHATS, chatHistory, historyKey);
        }
    }, [chatHistory, currentUser]);

    const login = useCallback(async (email: string, name: string) => {
        // This is called after successful AWS Auth
        try {
            const authUser = await authService.getCurrentUser();
            const user = {
                id: authUser?.id || `aws-${Date.now()}`,
                email,
                name,
                avatar: ''
            };
            setCurrentUser(user);
        } catch (e) {
            console.error(e);
        }
    }, []);

    const logout = useCallback(async () => {
        await authService.logout();
        setCurrentUser(null);
        setIsInitializing(false);
    }, []);

    const recruitAgent = useCallback((data: any) => {
        const newAgent: Agent = {
            ...data,
            id: `agent-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
            type: 'agent',
            userId: currentUser?.id,
            model: data.modelId || 'gemini-3-flash-preview',
            provider: 'google',
            isDeletable: !data.isSystem,
            isSystem: !!data.isSystem
        };
        setAgents(prev => [...prev, newAgent]);
        dbService.put(STORES_ENUM.AGENTS, newAgent);
        return newAgent;
    }, [currentUser]);

    const addMessage = useCallback((chatId: string, message: Message) => {
        setChatHistory(prev => ({ ...prev, [chatId]: [...(prev[chatId] || []), message] }));
    }, []);

    const clearChat = useCallback((chatId: string) => {
        setChatHistory(prev => ({ ...prev, [chatId]: [] }));
    }, []);

    const loadChatHistory = useCallback((chatId: string, messages: Message[]) => {
        setChatHistory(prev => ({ ...prev, [chatId]: messages }));
    }, []);

    const processSilentDirective = useCallback(async (task: GlobalTask) => {
        const agent = agents.find(a => a.id === task.agentId);
        if (!agent) return "Error: Agent not found.";
        const apiKey = getApiKeyForAgent(agent);
        const response = await generateSingleAgentResponse(
            [{ id: 'task-trigger', agent: { ...AGENTS.PRISM, name: currentUser?.name || 'User', type: 'user' } as Agent, content: { type: 'text', text: task.label }, type: 'user' }],
            agent,
            [],
            [],
            'SOLUTION',
            apiKey
        );
        return response && response.type === 'text' ? response.text : undefined;
    }, [agents, currentUser, getApiKeyForAgent]);

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

    const handleExpandMessage = async (messageId: string) => {
        const chatId = activeChatId;
        const history = chatHistory[chatId] || [];
        const msgIndex = history.findIndex(m => m.id === messageId);
        if (msgIndex === -1) return;

        const messageToExpand = history[msgIndex];
        if (messageToExpand.content.solution || messageToExpand.content.isExpanding) return;

        const updatedHistory = [...history];
        updatedHistory[msgIndex] = {
            ...updatedHistory[msgIndex],
            content: { ...updatedHistory[msgIndex].content, isExpanding: true }
        };
        setChatHistory(prev => ({ ...prev, [chatId]: updatedHistory }));

        const apiKey = getApiKeyForAgent(messageToExpand.agent);
        const solutionText = await generateExpandedSolution(history.slice(0, msgIndex + 1), messageToExpand.agent, apiKey);

        setChatHistory(prev => {
            const current = [...(prev[chatId] || [])];
            const idx = current.findIndex(m => m.id === messageId);
            if (idx !== -1) {
                current[idx] = {
                    ...current[idx],
                    content: { ...current[idx].content, isExpanding: false, solution: solutionText || "Unable to synthesize solution expansion." }
                };
            }
            return { ...prev, [chatId]: current };
        });
    };

    const handleExecuteCommand = async (messageId: string, toolCall: ToolCall) => {
        const chatId = activeChatId;
        const history = chatHistory[chatId] || [];
        const msgIndex = history.findIndex(m => m.id === messageId);
        if (msgIndex === -1) return;

        if (toolCall.name === 'fabricateTeam') {
            const squad = toolCall.args.specialists.map((spec: any) => recruitAgent(spec));
            const newTeam: Team = {
                id: `team-${Date.now()}`,
                userId: currentUser?.id,
                name: toolCall.args.teamName,
                description: toolCall.args.objective,
                type: 'rouge',
                agents: squad,
                isSystem: false
            };
            setTeams(prev => [...prev, newTeam]);
            dbService.put(STORES_ENUM.GROUPS, newTeam);

            const updatedHistory = [...history];
            updatedHistory[msgIndex] = {
                ...updatedHistory[msgIndex],
                content: { ...updatedHistory[msgIndex].content, text: `✅ Command Initialized: The **${newTeam.name}** squad has been deployed.`, toolCall: undefined }
            };
            setChatHistory(prev => ({ ...prev, [chatId]: updatedHistory }));
            setActiveChatId(newTeam.id);
            return;
        }

        if (toolCall.name === 'fabricateAgent') {
            const agent = recruitAgent({ ...toolCall.args, isSystem: false });
            const updatedHistory = [...history];
            updatedHistory[msgIndex] = {
                ...updatedHistory[msgIndex],
                content: { ...updatedHistory[msgIndex].content, text: `✅ Agent Fabrication Successful: ${toolCall.args.name} has been deployed.`, toolCall: undefined }
            };
            setChatHistory(prev => ({ ...prev, [chatId]: updatedHistory }));
            setActiveChatId(agent.id);
            return;
        }

        const updatedHistory = [...history];
        updatedHistory[msgIndex] = {
            ...updatedHistory[msgIndex],
            content: { ...updatedHistory[msgIndex].content, isExecuting: true }
        };
        setChatHistory(prev => ({ ...prev, [chatId]: updatedHistory }));

        const apiKey = getApiKeyForAgent(updatedHistory[msgIndex].agent);
        const result = await executeInterceptedCommand(updatedHistory[msgIndex].agent, toolCall, apiKey);

        if (result) {
            addMessage(chatId, {
                id: `res-${Date.now()}`,
                userId: currentUser?.id,
                agent: updatedHistory[msgIndex].agent,
                content: result,
                type: 'agent'
            });
            const finalHistory = [...chatHistory[chatId]];
            const idx = finalHistory.findIndex(m => m.id === messageId);
            if (idx !== -1) {
                finalHistory[idx] = { ...finalHistory[idx], content: { ...finalHistory[idx].content, isExecuting: false } };
                setChatHistory(prev => ({ ...prev, [chatId]: finalHistory }));
            }
        }
    };

    const handleRoute = async (objective: string) => {
        setPrismStatus("Routing: Formulating Specialists...");

        let availableProviders = "";
        const keys = currentUser?.apiKeys || [];
        if (keys.some(k => k.service === 'Google (Gemini)')) availableProviders += "Google Gemini (gemini-1.5-pro, gemini-1.5-flash), ";
        if (keys.some(k => k.service === 'Anthropic (Claude)')) availableProviders += "Anthropic Claude (claude-3-5-sonnet, claude-3-opus), ";
        if (keys.some(k => k.service === 'OpenAI (ChatGPT)')) availableProviders += "OpenAI (gpt-4o, gpt-4o-mini).";

        const providerContext = availableProviders
            ? `The user ONLY has access to the following AI Providers: ${availableProviders}. You MUST select a valid modelId matching one of these explicitly available providers.`
            : `The user has no external API keys configured. You MUST use 'gemini-1.5-flash-8b' as the modelId for all agents.`;

        const routePrompt = `The user wants to accomplish the following objective: "${objective}". Please output ONLY a JSON array of up to 3 highly specialized AI agents that would be perfect for this job. For each agent, provide: name (a very short catchy name like 'Architect' or 'Analyst'), role (short title), modelId (use a valid model string based on providers), and systemPrompt (a detailed prompt giving them extreme expertise). ${providerContext} The output must be valid raw JSON.`;

        try {
            const apiKey = getApiKeyForAgent(AGENTS.PRISM);
            const response = await generateSingleAgentResponse(
                [{ id: 'sys1', agent: { ...AGENTS.PRISM, name: 'User', type: 'user' } as Agent, content: { type: 'text', text: routePrompt }, type: 'user' }],
                AGENTS.PRISM,
                [], [], 'SOLUTION', apiKey || undefined
            );

            if (response && response.type === 'text') {
                let jsonStr = response.text;
                if (jsonStr.includes('```json')) {
                    jsonStr = jsonStr.split('```json')[1].split('```')[0].trim();
                } else if (jsonStr.includes('```')) {
                    jsonStr = jsonStr.split('```')[1].split('```')[0].trim();
                }
                const squadData = JSON.parse(jsonStr);
                const squad = squadData.map((spec: any) => recruitAgent({
                    name: spec.name,
                    role: spec.role,
                    systemPrompt: spec.systemPrompt,
                    modelId: spec.modelId || 'gemini-3-flash-preview',
                    icon: '🚀'
                }));
                const newTeam: Team = {
                    id: `team-${Date.now()}`,
                    userId: currentUser?.id,
                    name: "Routed Task Force",
                    description: objective,
                    type: 'rouge',
                    agents: squad,
                    isSystem: false
                };
                setTeams(prev => [...prev, newTeam]);
                dbService.put(STORES_ENUM.GROUPS, newTeam);
                setActiveChatId(newTeam.id);
            }
        } catch (err) {
            console.error("Routing failed:", err);
            addMessage(activeChatId, {
                id: `msg-${Date.now()}-err`,
                userId: currentUser?.id,
                agent: AGENTS.PRISM,
                content: { type: 'text', text: "Route Mode Failed: Could not formulate specialist team. " + err },
                type: 'agent'
            });
        } finally {
            setPrismStatus("");
        }
    };

    const handleSendMessage = useCallback(async (text: string, responseSteps: number = 1, file?: { data: string, mimeType: string }, searchEnabled?: boolean, routeEnabled?: boolean) => {
        const chatId = activeChatId;
        if (!currentUser) return;

        if (routeEnabled) {
            await handleRoute(text);
            return;
        }

        const newMessage: Message = {
            id: Date.now().toString(),
            userId: currentUser.id,
            agent: { ...AGENTS.PRISM, name: currentUser.name, type: 'user', icon: '👤' } as Agent,
            content: { type: 'text', text },
            type: 'user'
        };

        addMessage(chatId, newMessage);
        let currentSnapshot = [...(chatHistory[chatId] || []), newMessage];

        const team = teams.find(g => g.id === chatId);
        const agent = agents.find(e => e.id === chatId);
        setActiveRequests(prev => prev + 1);

        try {
            if (team) {
                // Mention-only logic for group chats. Automatic clock routing is archived.
                setPrismStatus("Scanning for Mentions...");

                // Regex to find @Name mentions
                const mentionedNames = text.match(/@(\w+)/g)?.map(m => m.slice(1).toLowerCase()) || [];
                const mentionedAgents = team.agents.filter(a => mentionedNames.includes(a.name.toLowerCase()));

                if (mentionedAgents.length > 0) {
                    setPrismStatus(`Initializing ${mentionedAgents.length} unit(s)...`);

                    // Update weights visually
                    const weights: Record<string, number> = {};
                    mentionedAgents.forEach(a => weights[a.id] = 1 / mentionedAgents.length);
                    setOrchestrationWeights(weights);

                    setTypingAgents(mentionedAgents.map(a => ({
                        agent: a,
                        tasks: [],
                        mode: 'CHAT'
                    })));

                    // Call all mentioned agents in parallel
                    await Promise.all(mentionedAgents.map(async (targetAgent) => {
                        const apiKey = getApiKeyForAgent(targetAgent);

                        if (targetAgent.id !== 'prism-core' && apiKey === null) {
                            addMessage(chatId, {
                                id: `msg-${Date.now()}-${targetAgent.id}`,
                                userId: currentUser.id,
                                agent: targetAgent,
                                content: { type: 'text', text: "⚠️ **API Key Required**: Please add your API key for this provider in your User Profile (bottom left) to use this agent." },
                                type: 'agent'
                            });
                            return;
                        }

                        const response = await generateSingleAgentResponse(currentSnapshot, targetAgent, team.agents, [], 'CHAT', apiKey || undefined);
                        if (response) {
                            addMessage(chatId, {
                                id: `msg-${Date.now()}-${targetAgent.id}`,
                                userId: currentUser.id,
                                agent: targetAgent,
                                content: response,
                                type: 'agent'
                            });
                        }
                    }));
                } else {
                    // Fallback to Prism if no specific specialist is mentioned
                    setPrismStatus("No mention detected. Consulting Core...");
                    const apiKey = getApiKeyForAgent(AGENTS.PRISM);
                    let availableProviders = "";
                    const keys = currentUser?.apiKeys || [];
                    if (keys.some(k => k.service === 'Google (Gemini)')) availableProviders += "Google Gemini (gemini-1.5-pro, gemini-1.5-flash), ";
                    if (keys.some(k => k.service === 'Anthropic (Claude)')) availableProviders += "Anthropic Claude (claude-3-5-sonnet, claude-3-opus), ";
                    if (keys.some(k => k.service === 'OpenAI (ChatGPT)')) availableProviders += "OpenAI (gpt-4o, gpt-4o-mini).";
                    const response = await generatePrismResponse(currentSnapshot, AGENTS.PRISM, setPrismStatus, apiKey || undefined, availableProviders);
                    if (response) {
                        addMessage(chatId, {
                            id: `msg-${Date.now()}`,
                            userId: currentUser.id,
                            agent: AGENTS.PRISM,
                            content: response,
                            type: 'agent'
                        });
                    }
                }
            } else if (agent || chatId === 'prism-core') {
                const target = agent || AGENTS.PRISM;
                const apiKey = getApiKeyForAgent(target);

                if (target.id !== 'prism-core' && apiKey === null) {
                    addMessage(chatId, {
                        id: `msg-${Date.now()}`,
                        userId: currentUser.id,
                        agent: target,
                        content: { type: 'text', text: "⚠️ **API Key Required**: Please add your API key for this provider in your User Profile (bottom left) to use this agent." },
                        type: 'agent'
                    });
                    setActiveRequests(prev => prev - 1);
                    return;
                }

                setTypingAgent(target);
                let response;
                if (target.id === 'prism-core') {
                    let availableProviders = "";
                    const keys = currentUser?.apiKeys || [];
                    if (keys.some(k => k.service === 'Google (Gemini)')) availableProviders += "Google Gemini (gemini-1.5-pro, gemini-1.5-flash), ";
                    if (keys.some(k => k.service === 'Anthropic (Claude)')) availableProviders += "Anthropic Claude (claude-3-5-sonnet, claude-3-opus), ";
                    if (keys.some(k => k.service === 'OpenAI (ChatGPT)')) availableProviders += "OpenAI (gpt-4o, gpt-4o-mini).";
                    response = await generatePrismResponse(currentSnapshot, target, setPrismStatus, apiKey || undefined, availableProviders);
                } else {
                    response = await generateSingleAgentResponse(currentSnapshot, target, [], [], 'CHAT', apiKey || undefined);
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
    }, [currentUser, activeChatId, agents, teams, chatHistory, addMessage, getApiKeyForAgent]);

    return {
        currentUser, isInitializing, userProfile: currentUser as UserProfile, setUserProfile: setCurrentUser,
        login, logout,
        agents, setAgents,
        teams, setTeams,
        activeChatId, setActiveChatId, chatHistory, setChatHistory,
        isProcessing, typingAgent, typingAgents, prismStatus, orchestrationWeights, agentModes,
        handleSendMessage, handleExecuteCommand, handleExpandMessage, handleRoute,
        processSilentDirective, injectOutputToChat,
        clearChat, loadChatHistory, recruitAgent,
        deleteAgent: (id: string) => { setAgents(prev => prev.filter(a => a.id !== id)); dbService.delete(STORES_ENUM.AGENTS, id); },
        deleteTeam: (id: string) => { setTeams(prev => prev.filter(t => t.id !== id)); dbService.delete(STORES_ENUM.GROUPS, id); },
        createTeam: (data: any) => {
            const newTeam = {
                ...data,
                id: `team-${Date.now()}`,
                userId: currentUser?.id,
                agents: agents.filter(a => data.agentIds.includes(a.id)),
                isSystem: false
            };
            setTeams(prev => [...prev, newTeam]);
            dbService.put(STORES_ENUM.GROUPS, newTeam);
            setActiveChatId(newTeam.id);
        }
    };
};
