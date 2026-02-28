import Dexie, { Table } from 'dexie';

// ==========================================
// IndexedDB Store Names
// ==========================================
export const STORES_ENUM = {
    AGENTS: 'agents',
    GROUPS: 'groups',
    CHATS: 'chats',
    TASKS: 'tasks',
    FEEDBACK: 'feedback',
    SESSIONS: 'sessions',
    USERMAP: 'usermap',
    MEMORIES: 'memories'
} as const;

type StoreName = typeof STORES_ENUM[keyof typeof STORES_ENUM];

// ==========================================
// Dexie Database Definition
// ==========================================
class RamNDatabase extends Dexie {
    agents!: Table<any, string>;
    groups!: Table<any, string>;
    chats!: Table<any, string>;
    tasks!: Table<any, string>;
    feedback!: Table<any, string>;
    sessions!: Table<any, string>;
    usermap!: Table<any, string>;
    memories!: Table<any, string>;

    constructor() {
        super('RamN_AI');
        this.version(1).stores({
            agents: 'id, userId',
            groups: 'id, userId',
            chats: 'id',
            tasks: 'id, agentId, status',
            feedback: 'id',
            sessions: 'id, entityId, userId',
            usermap: 'id'
        });
        this.version(2).stores({
            agents: 'id, userId',
            groups: 'id, userId',
            chats: 'id',
            tasks: 'id, agentId, status',
            feedback: 'id',
            sessions: 'id, entityId, userId',
            usermap: 'id',
            memories: 'id, userId, agentId, createdAt'
        });
    }
}

const db = new RamNDatabase();

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || '';

// ==========================================
// DBService — Local-First Sync Engine
// ==========================================
class DBService {
    private getTable(storeName: StoreName): Table<any, string> {
        return db[storeName as keyof RamNDatabase] as Table<any, string>;
    }

    async put(storeName: StoreName, value: any, explicitKey?: string) {
        try {
            const key = explicitKey || (value && value.id ? value.id : undefined);
            if (!key) throw new Error(`No key provided for store ${storeName}`);

            const item = Array.isArray(value)
                ? { id: key, data: value }
                : { ...value, id: key };

            // 1. Instant local write
            await this.getTable(storeName).put(item);

            // 2. Async Cloud Sync (Fire and forget if BACKEND_URL exists)
            if (BACKEND_URL && item.userId) {
                fetch(`${BACKEND_URL}/api/db`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ store: storeName, item })
                }).catch(e => console.error(`[AWS Sync Error] Failed to push to ${storeName}:`, e));
            }
        } catch (error) {
            console.error(`IndexedDB Put Error [${storeName}]:`, error);
        }
    }

    async get<T>(storeName: StoreName, key: string): Promise<T | null> {
        try {
            const item = await this.getTable(storeName).get(key);
            if (!item) return null;
            // If stored as { id, data }, return the data array
            if (item.data && Array.isArray(item.data)) return item.data as T;
            return item as T;
        } catch (error) {
            console.error(`IndexedDB Get Error [${storeName}]:`, error);
            return null;
        }
    }

    async getAll<T>(storeName: StoreName): Promise<T[]> {
        try {
            const items = await this.getTable(storeName).toArray();
            return items as T[];
        } catch (error) {
            console.error(`IndexedDB GetAll Error [${storeName}]:`, error);
            return [];
        }
    }

    async delete(storeName: StoreName, key: string, userId?: string) {
        try {
            // 1. Instant local delete
            await this.getTable(storeName).delete(key);

            // 2. Async Cloud Sync
            if (BACKEND_URL && userId) {
                fetch(`${BACKEND_URL}/api/db?store=${storeName}&id=${key}&userId=${userId}`, {
                    method: 'DELETE'
                }).catch(e => console.error(`[AWS Sync Error] Failed to delete from ${storeName}:`, e));
            }
        } catch (error) {
            console.error(`IndexedDB Delete Error [${storeName}]:`, error);
        }
    }

    /**
     * Pulls the entire state for a specific store and user from AWS and populates local IndexedDB
     */
    async pullFromCloud<T>(storeName: StoreName, userId: string): Promise<T[]> {
        if (!BACKEND_URL) return this.getAll<T>(storeName);

        try {
            const res = await fetch(`${BACKEND_URL}/api/db?store=${storeName}&userId=${userId}`);
            if (!res.ok) throw new Error(`Cloud fetch failed: ${res.status}`);

            const data = await res.json();
            const items = data.items || [];

            // Overwrite local cache
            if (items.length > 0) {
                await this.getTable(storeName).clear();
                await this.getTable(storeName).bulkPut(items);
            }
            return items as T[];
        } catch (error) {
            console.error(`[AWS Sync Error] Failed to pull ${storeName} from cloud:`, error);
            // Fallback to local on failure
            return this.getAll<T>(storeName);
        }
    }
}

export const dbService = new DBService();
