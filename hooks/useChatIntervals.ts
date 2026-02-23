
import { useState, useEffect, useCallback } from 'react';
import { ChatInterval, Message } from '../types';
import { dbService, STORES_ENUM } from '../services/db';

export const useChatIntervals = () => {
    const [intervals, setIntervals] = useState<ChatInterval[]>([]);

    const loadIntervals = useCallback(async () => {
        try {
            const all = await dbService.getAll<ChatInterval>(STORES_ENUM.INTERVALS);
            setIntervals(all);
        } catch (e) {
            console.error("Interval Load Error:", e);
        }
    }, []);

    useEffect(() => {
        loadIntervals();
    }, [loadIntervals]);

    const saveInterval = useCallback(async (targetId: string, name: string, messages: Message[]) => {
        const newInterval: ChatInterval = {
            id: `int-${Date.now()}`,
            targetId,
            name,
            messages,
            createdAt: Date.now()
        };
        await dbService.put(STORES_ENUM.INTERVALS, newInterval);
        await loadIntervals();
        return newInterval;
    }, [loadIntervals]);

    const deleteInterval = useCallback(async (id: string) => {
        await dbService.delete(STORES_ENUM.INTERVALS, id);
        await loadIntervals();
    }, [loadIntervals]);

    return { intervals, saveInterval, deleteInterval, loadIntervals };
};
