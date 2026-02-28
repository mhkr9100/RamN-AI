import { useState, useEffect, useCallback } from 'react';
import { UserProfile } from '../types';
import { dbService, STORES_ENUM } from '../services/db';

export interface PageNode {
    id: string;
    label: string;
    value?: string;
    source?: string;
    children: PageNode[];
}

const EMPTY_TREE: PageNode = {
    id: 'root',
    label: 'UserMap',
    children: []
};

export const useUserMap = (currentUser: UserProfile | null) => {
    const [userMapTree, setUserMapTree] = useState<PageNode>(EMPTY_TREE);
    const [isLoading, setIsLoading] = useState(false);
    const [isConsolidating, setIsConsolidating] = useState(false);

    // Load UserMap from local DB on mount
    useEffect(() => {
        if (!currentUser) return;
        const load = async () => {
            const saved = await dbService.get<PageNode>(STORES_ENUM.USERMAP, `usermap_${currentUser.id}`);
            if (saved) setUserMapTree(saved);
        };
        load();
    }, [currentUser]);

    // Save to local DB whenever tree changes
    const saveTree = useCallback(async (tree: PageNode) => {
        if (!currentUser) return;
        setUserMapTree(tree);
        await dbService.put(STORES_ENUM.USERMAP, tree, `usermap_${currentUser.id}`);
    }, [currentUser]);

    // Update a specific node
    const updateNode = useCallback((nodeId: string, updates: Partial<PageNode>) => {
        const updateInTree = (node: PageNode): PageNode => {
            if (node.id === nodeId) {
                return { ...node, ...updates };
            }
            return { ...node, children: node.children.map(updateInTree) };
        };
        const updated = updateInTree(userMapTree);
        saveTree(updated);
    }, [userMapTree, saveTree]);

    // Delete a node
    const deleteNode = useCallback((nodeId: string) => {
        const removeFromTree = (node: PageNode): PageNode => {
            return {
                ...node,
                children: node.children
                    .filter(c => c.id !== nodeId)
                    .map(removeFromTree)
            };
        };
        const updated = removeFromTree(userMapTree);
        saveTree(updated);
    }, [userMapTree, saveTree]);

    // Add a child node
    const addNode = useCallback((parentId: string, newNode: PageNode) => {
        const addToTree = (node: PageNode): PageNode => {
            if (node.id === parentId) {
                return { ...node, children: [...node.children, newNode] };
            }
            return { ...node, children: node.children.map(addToTree) };
        };
        const updated = addToTree(userMapTree);
        saveTree(updated);
    }, [userMapTree, saveTree]);

    // Consolidate: pull chat memories from IndexedDB, structure into tree client-side
    const consolidate = useCallback(async (userKeys?: { openAiKey?: string, anthropicKey?: string, geminiKey?: string }) => {
        if (!currentUser) {
            throw new Error('Not logged in.');
        }
        setIsConsolidating(true);
        try {
            // Get all stored memories from IndexedDB
            const stored = await dbService.getAll<{ id: string; content: string }>(STORES_ENUM.MEMORIES);
            const memoryStrings = stored.map(m => m.content || m.id).filter(Boolean);

            if (memoryStrings.length === 0) {
                throw new Error('No memories to consolidate. Chat with agents first to build your memory.');
            }

            // Use pageIndexService to structure into tree
            const { pageIndexService } = await import('../services/pageIndexService');
            const tree = await pageIndexService.consolidate(memoryStrings, userMapTree.children.length > 0 ? userMapTree : undefined, userKeys);
            await saveTree(tree);
        } finally {
            setIsConsolidating(false);
        }
    }, [currentUser, userMapTree, saveTree]);

    // Ingest current chat session into memory — extract facts client-side, store in IndexedDB
    const ingestSession = useCallback(async (messages: Array<{ role: string; content: string }>, agentId?: string, userKeys?: { openAiKey?: string, anthropicKey?: string, geminiKey?: string }) => {
        if (!currentUser) return;
        if (messages.length < 2) return; // Need at least a user+agent exchange
        try {
            const { hybridGenerateContent, resolvePrismModel } = await import('../services/aiService');
            const { model } = resolvePrismModel(userKeys);

            const chatText = messages.map(m => `${m.role}: ${m.content}`).join('\n');
            const res = await hybridGenerateContent({
                model,
                contents: [{ role: 'user', parts: [{ text: chatText }] }],
                config: {
                    systemInstruction: `Extract key facts about the user from this conversation. Return a JSON array of short fact strings. Example: ["User works on a startup called RamN AI", "User prefers React over Vue"]. Extract ONLY user-specific facts. Output ONLY the JSON array.`
                }
            }, userKeys);

            const text = res.text || '';
            const match = text.match(/\[[\s\S]*\]/);
            if (match) {
                const facts: string[] = JSON.parse(match[0]);
                const timestamp = Date.now();
                const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || '';
                const apiKey = userKeys?.geminiKey || '';

                for (const fact of facts) {
                    const id = `mem_${timestamp}_${Math.random().toString(36).slice(2, 8)}`;

                    // 1. Store locally
                    await dbService.put(STORES_ENUM.MEMORIES, {
                        id,
                        userId: currentUser.id,
                        agentId,
                        content: fact,
                        createdAt: new Date().toISOString()
                    });

                    // 2. Push to AWS Long-Term Memory (vector DB)
                    if (BACKEND_URL && apiKey) {
                        const token = localStorage.getItem('auth_token');
                        const headers: any = { 'Content-Type': 'application/json' };
                        if (token) headers['Authorization'] = `Bearer ${token}`;

                        fetch(`${BACKEND_URL}/api/memory/add`, {
                            method: 'POST',
                            headers,
                            body: JSON.stringify({
                                userId: currentUser.id,
                                agentId,
                                content: fact,
                                apiKey
                            })
                        }).catch(e => console.error('[AWS Memory Sync Error]', e));
                    }
                }
            }
        } catch (e) {
            console.error('Memory ingestion failed:', e);
        }
    }, [currentUser]);

    return {
        userMapTree, setUserMapTree: saveTree,
        isLoading, isConsolidating,
        updateNode, deleteNode, addNode,
        consolidate, ingestSession
    };
};
