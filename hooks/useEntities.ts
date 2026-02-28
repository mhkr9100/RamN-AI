import { useState, useCallback } from 'react';
import { Agent, Team, UserProfile } from '../types';
import { AGENTS, SYSTEM_TEAMS } from '../constants';
import { dbService, STORES_ENUM } from '../services/db';

export const useEntities = (currentUser: UserProfile | null) => {
    const [agents, setAgents] = useState<Agent[]>([]);
    const [teams, setTeams] = useState<Team[]>([]);

    const loadEntities = useCallback(async (userId: string) => {
        const allAgents = await dbService.getAll<Agent>(STORES_ENUM.AGENTS);
        const systemAgents = Object.values(AGENTS).filter(a => a.isSystem && a.id !== 'prism-core');
        const userAgents = allAgents.filter(a => a.userId === userId && !a.isSystem);

        const allTeams = await dbService.getAll<Team>(STORES_ENUM.GROUPS);
        const userTeams = allTeams.filter(g => g.userId === userId && !g.isSystem);

        setAgents([...systemAgents, ...userAgents]);
        setTeams([...SYSTEM_TEAMS, ...userTeams]);
    }, []);

    const recruitAgent = useCallback((data: any) => {
        // Prevent duplicate recruitment if ID already exists
        if (data.id) {
            const existing = agents.find(a => a.id === data.id);
            if (existing) return existing;
        }

        const newAgent: Agent = {
            ...data,
            id: data.id || `agent-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
            type: 'agent',
            userId: currentUser?.id,
            model: data.modelId || 'gemini-2.0-flash',
            provider: 'google',
            isDeletable: !data.isSystem,
            isSystem: !!data.isSystem
        };
        setAgents(prev => {
            if (prev.find(a => a.id === newAgent.id)) return prev;
            return [...prev, newAgent];
        });
        dbService.put(STORES_ENUM.AGENTS, newAgent);
        return newAgent;
    }, [currentUser, agents]);

    const deleteAgent = useCallback((id: string) => {
        setAgents(prev => prev.filter(a => a.id !== id));
        dbService.delete(STORES_ENUM.AGENTS, id);
    }, []);

    const deleteTeam = useCallback((id: string) => {
        setTeams(prev => prev.filter(t => t.id !== id));
        dbService.delete(STORES_ENUM.GROUPS, id);
    }, []);

    const createTeam = useCallback((data: any, switchChatFn: (id: string) => void) => {
        const newTeam = {
            ...data,
            id: `team-${Date.now()}`,
            userId: currentUser?.id,
            agents: agents.filter(a => data.agentIds.includes(a.id)),
            isSystem: false
        };
        setTeams(prev => [...prev, newTeam]);
        dbService.put(STORES_ENUM.GROUPS, newTeam);
        switchChatFn(newTeam.id);
    }, [currentUser, agents]);

    return {
        agents, setAgents,
        teams, setTeams,
        loadEntities, recruitAgent, deleteAgent, deleteTeam, createTeam
    };
};
