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
    USERMAP: 'usermap'
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
    }
}

const db = new RamNDatabase();

// ==========================================
// DBService — Same API, backed by IndexedDB
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

            await this.getTable(storeName).put(item);
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

    async delete(storeName: StoreName, key: string) {
        try {
            await this.getTable(storeName).delete(key);
        } catch (error) {
            console.error(`IndexedDB Delete Error [${storeName}]:`, error);
        }
    }
}

export const dbService = new DBService();
