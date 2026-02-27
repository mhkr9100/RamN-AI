import { useState, useEffect, useCallback } from 'react';
import { UserProfile } from '../types';
import { dbService, STORES_ENUM } from '../services/db';
import { authService } from '../services/auth';

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

    // Consolidate: call server to pull memories and structure into tree
    const consolidate = useCallback(async () => {
        if (!currentUser) {
            throw new Error('Not logged in.');
        }
        setIsConsolidating(true);
        try {
            const token = authService.getToken();
            const res = await fetch('/api/usermap/consolidate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': token ? `Bearer ${token}` : ''
                },
                body: JSON.stringify({
                    userId: currentUser.id
                })
            });

            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.error || `Consolidation failed: ${res.status}`);
            }

            const data = await res.json();
            if (data.tree) {
                await saveTree(data.tree);
            }
        } finally {
            setIsConsolidating(false);
        }
    }, [currentUser, saveTree]);

    // Ingest current chat session into memory
    const ingestSession = useCallback(async (messages: Array<{ role: string; content: string }>, agentId?: string) => {
        if (!currentUser) return;
        try {
            const token = authService.getToken();
            await fetch('/api/memory/ingest', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': token ? `Bearer ${token}` : ''
                },
                body: JSON.stringify({
                    messages,
                    userId: currentUser.id,
                    agentId
                })
            });
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
