import { useState, useEffect, useCallback } from 'react';
import { Message, ChatSession, UserProfile } from '../types';
import { AGENTS } from '../constants';
import { dbService, STORES_ENUM } from '../services/db';

const PRISM_INTRO = "Hello. I am Prism, your Meta Agent and Workspace Architect. My mission is to translate your goals into specialized AI architectures. Whether you need a single expert agent or a coordinated team of specialists to handle a complex project, I am here to design and deploy them for you.\n\nHow can I help you build your workspace today? Tell me about a project, a workflow, or a specific problem you're looking to solve.";

export const useChatSessions = (currentUser: UserProfile | null) => {
    const [chatHistory, setChatHistory] = useState<{ [key: string]: Message[] }>({});
    const [activeChatId, setActiveChatId] = useState<string>('prism-core');
    const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
    const [activeSessionId, setActiveSessionId] = useState<string | null>(null);

    // Auto-save chat history when it changes
    useEffect(() => {
        if (currentUser && activeSessionId) {
            const chatKey = `chat_${activeSessionId}`;
            const messages = chatHistory[activeChatId] || [];
            dbService.put(STORES_ENUM.CHATS, messages, chatKey);

            setChatSessions(prev => prev.map(s =>
                s.id === activeSessionId ? { ...s, updatedAt: Date.now(), messageCount: messages.length } : s
            ));
        }
    }, [chatHistory, currentUser, activeSessionId, activeChatId]);

    const loadSessions = useCallback(async (userId: string) => {
        const allSessions = await dbService.getAll<ChatSession>(STORES_ENUM.SESSIONS);
        const userSessions = allSessions.filter(s => s.userId === userId);
        setChatSessions(userSessions);

        const prismSessions = userSessions.filter(s => s.entityId === 'prism-core').sort((a, b) => b.updatedAt - a.updatedAt);
        const latestSession = prismSessions.find(s => s.isActive) || prismSessions[0];

        if (latestSession) {
            const sessionChatKey = `chat_${latestSession.id}`;
            const msgs = await dbService.get<Message[]>(STORES_ENUM.CHATS, sessionChatKey) || [];
            setChatHistory({ 'prism-core': msgs });
            setActiveSessionId(latestSession.id);
        } else {
            const newSession: ChatSession = {
                id: `session-${Date.now()}`,
                entityId: 'prism-core',
                userId,
                title: 'New Chat',
                createdAt: Date.now(),
                updatedAt: Date.now(),
                messageCount: 1,
                isActive: true
            };
            setChatSessions([newSession]);
            setActiveSessionId(newSession.id);
            dbService.put(STORES_ENUM.SESSIONS, newSession);
            setChatHistory({
                'prism-core': [{
                    id: `msg-prism-init`,
                    agent: AGENTS.PRISM,
                    content: { type: 'text', text: PRISM_INTRO },
                    type: 'agent'
                }]
            });
        }
    }, []);

    const addMessage = useCallback((chatId: string, message: Message) => {
        setChatHistory(prev => ({ ...prev, [chatId]: [...(prev[chatId] || []), message] }));
    }, []);

    const clearChat = useCallback((chatId: string) => {
        setChatHistory(prev => ({ ...prev, [chatId]: [] }));
    }, []);

    const loadChatHistory = useCallback((chatId: string, messages: Message[]) => {
        setChatHistory(prev => ({ ...prev, [chatId]: messages }));
    }, []);

    const startNewSession = useCallback(async (entityId: string) => {
        if (!currentUser) return;
        setChatSessions(prev => {
            const updated = prev.map(s =>
                s.entityId === entityId && s.isActive ? { ...s, isActive: false } : s
            );
            updated.filter(s => s.entityId === entityId && !s.isActive).forEach(s => dbService.put(STORES_ENUM.SESSIONS, s));
            return updated;
        });

        const newSession: ChatSession = {
            id: `session-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
            entityId,
            userId: currentUser.id,
            title: 'New Chat',
            createdAt: Date.now(),
            updatedAt: Date.now(),
            messageCount: 0,
            isActive: true
        };
        setChatSessions(prev => [...prev, newSession]);
        setActiveSessionId(newSession.id);
        dbService.put(STORES_ENUM.SESSIONS, newSession);
        setChatHistory(prev => ({ ...prev, [entityId]: [] }));
    }, [currentUser]);

    const resumeSession = useCallback(async (session: ChatSession) => {
        const chatKey = `chat_${session.id}`;
        const msgs = await dbService.get<Message[]>(STORES_ENUM.CHATS, chatKey) || [];
        setActiveSessionId(session.id);
        setChatHistory(prev => ({ ...prev, [session.entityId]: msgs }));
        setActiveChatId(session.entityId);
    }, []);

    const getSessionsForEntity = useCallback((entityId: string) => {
        return chatSessions.filter(s => s.entityId === entityId).sort((a, b) => b.updatedAt - a.updatedAt);
    }, [chatSessions]);

    const switchChat = useCallback(async (entityId: string) => {
        setActiveChatId(entityId);
        if (!currentUser) return;

        const entitySessions = chatSessions.filter(s => s.entityId === entityId).sort((a, b) => b.updatedAt - a.updatedAt);
        const activeSession = entitySessions.find(s => s.isActive) || entitySessions[0];

        if (activeSession) {
            const chatKey = `chat_${activeSession.id}`;
            const msgs = await dbService.get<Message[]>(STORES_ENUM.CHATS, chatKey) || [];
            setChatHistory(prev => ({ ...prev, [entityId]: prev[entityId]?.length ? prev[entityId] : msgs }));
            setActiveSessionId(activeSession.id);
        } else {
            const newSession: ChatSession = {
                id: `session-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
                entityId,
                userId: currentUser.id,
                title: 'New Chat',
                createdAt: Date.now(),
                updatedAt: Date.now(),
                messageCount: 0,
                isActive: true
            };
            setChatSessions(prev => [...prev, newSession]);
            setActiveSessionId(newSession.id);
            dbService.put(STORES_ENUM.SESSIONS, newSession);
            setChatHistory(prev => ({ ...prev, [entityId]: prev[entityId] || [] }));
        }
    }, [currentUser, chatSessions]);

    return {
        chatHistory, setChatHistory,
        activeChatId, setActiveChatId: switchChat,
        chatSessions, activeSessionId,
        loadSessions, addMessage, clearChat, loadChatHistory,
        startNewSession, resumeSession, getSessionsForEntity
    };
};
