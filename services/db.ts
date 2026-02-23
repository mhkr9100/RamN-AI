/**
 * db.ts
 * Re-implemented Local IndexedDB Service for RamN AI Beta
 * Replaces the previously deleted db wrapper to allow local state persistence.
 */

export const STORES_ENUM = {
    INTERVALS: 'intervals',
    AGENTS: 'agents',
    GROUPS: 'groups',
    CHATS: 'chats',
    TASKS: 'tasks'
} as const;

type StoreName = typeof STORES_ENUM[keyof typeof STORES_ENUM];

class DBService {
    private dbName = 'RamNAI_LocalDB';
    private dbVersion = 1;

    private async getDB(): Promise<IDBDatabase> {
        return new Promise((resolve, reject) => {
            const req = indexedDB.open(this.dbName, this.dbVersion);

            req.onupgradeneeded = () => {
                const db = req.result;
                Object.values(STORES_ENUM).forEach(store => {
                    if (!db.objectStoreNames.contains(store)) {
                        // Create object stores without keyPath so we can store arrays or objects mapping to explicit keys
                        db.createObjectStore(store);
                    }
                });
            };

            req.onsuccess = () => resolve(req.result);
            req.onerror = () => reject(req.error);
        });
    }

    async put(storeName: StoreName, value: any, explicitKey?: string) {
        try {
            const db = await this.getDB();
            return new Promise((resolve, reject) => {
                const tx = db.transaction(storeName, 'readwrite');
                const store = tx.objectStore(storeName);
                const key = explicitKey || (value && value.id ? value.id : undefined);

                if (!key) {
                    return reject(new Error(`No key provided for store ${storeName}`));
                }

                const req = store.put(value, key);
                req.onsuccess = () => resolve(req.result);
                req.onerror = () => reject(req.error);
            });
        } catch (error) {
            console.error(`Error putting into ${storeName}:`, error);
        }
    }

    async get<T>(storeName: StoreName, key: string): Promise<T | null> {
        try {
            const db = await this.getDB();
            return new Promise((resolve, reject) => {
                const tx = db.transaction(storeName, 'readonly');
                const store = tx.objectStore(storeName);
                const req = store.get(key);
                req.onsuccess = () => resolve(req.result !== undefined ? (req.result as T) : null);
                req.onerror = () => reject(req.error);
            });
        } catch (error) {
            console.error(`Error getting from ${storeName}:`, error);
            return null;
        }
    }

    async getAll<T>(storeName: StoreName): Promise<T[]> {
        try {
            const db = await this.getDB();
            return new Promise((resolve, reject) => {
                const tx = db.transaction(storeName, 'readonly');
                const store = tx.objectStore(storeName);
                const req = store.getAll();
                req.onsuccess = () => resolve((req.result as T[]) || []);
                req.onerror = () => reject(req.error);
            });
        } catch (error) {
            console.error(`Error getting all from ${storeName}:`, error);
            return [];
        }
    }

    async delete(storeName: StoreName, key: string) {
        try {
            const db = await this.getDB();
            return new Promise((resolve, reject) => {
                const tx = db.transaction(storeName, 'readwrite');
                const store = tx.objectStore(storeName);
                const req = store.delete(key);
                req.onsuccess = () => resolve(req.result);
                req.onerror = () => reject(req.error);
            });
        } catch (error) {
            console.error(`Error deleting from ${storeName}:`, error);
        }
    }
}

export const dbService = new DBService();
