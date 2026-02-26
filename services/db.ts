import { PutCommand, GetCommand, ScanCommand, DeleteCommand } from '@aws-sdk/lib-dynamodb';
import { dynamoDb } from './awsConfig';

export const STORES_ENUM = {
    AGENTS: 'agents',
    GROUPS: 'groups',
    CHATS: 'chats',
    TASKS: 'tasks',
    FEEDBACK: 'feedback'
} as const;

type StoreName = typeof STORES_ENUM[keyof typeof STORES_ENUM];

// Map local store names to DynamoDB Table Names
const getTableName = (store: StoreName) => {
    const prefix = 'RamN_';
    switch (store) {
        case STORES_ENUM.AGENTS: return `${prefix}Agents`;
        case STORES_ENUM.GROUPS: return `${prefix}Groups`;
        case STORES_ENUM.CHATS: return `${prefix}Chats`;
        case STORES_ENUM.TASKS: return `${prefix}Tasks`;
        case STORES_ENUM.FEEDBACK: return `${prefix}Feedback`;
        default: return `${prefix}Store`;
    }
};

class DBService {
    async put(storeName: StoreName, value: any, explicitKey?: string) {
        try {
            const key = explicitKey || (value && value.id ? value.id : undefined);
            if (!key) throw new Error(`No key provided for store ${storeName}`);

            const item = { ...value, id: key }; // Ensure 'id' is always the partition key

            await dynamoDb.send(new PutCommand({
                TableName: getTableName(storeName),
                Item: item
            }));

        } catch (error) {
            console.error(`DynamoDB Put Error [${storeName}]:`, error);
            // Fallback to localStorage for development resilience
            try {
                const key = explicitKey || value.id;
                localStorage.setItem(`ramn_${storeName}_${key}`, JSON.stringify(value));
            } catch (e) { }
        }
    }

    async get<T>(storeName: StoreName, key: string): Promise<T | null> {
        try {
            const response = await dynamoDb.send(new GetCommand({
                TableName: getTableName(storeName),
                Key: { id: key }
            }));

            if (response.Item) return response.Item as T;
            return null;
        } catch (error) {
            console.error(`DynamoDB Get Error [${storeName}]:`, error);
            // Fallback Check
            const localData = localStorage.getItem(`ramn_${storeName}_${key}`);
            return localData ? JSON.parse(localData) as T : null;
        }
    }

    async getAll<T>(storeName: StoreName): Promise<T[]> {
        try {
            const response = await dynamoDb.send(new ScanCommand({
                TableName: getTableName(storeName)
            }));
            return (response.Items as T[]) || [];
        } catch (error) {
            console.error(`DynamoDB Scan Error [${storeName}]:`, error);
            // Fallback Check
            const results: T[] = [];
            for (let i = 0; i < localStorage.length; i++) {
                const k = localStorage.key(i);
                if (k && k.startsWith(`ramn_${storeName}_`)) {
                    results.push(JSON.parse(localStorage.getItem(k) || '{}'));
                }
            }
            return results;
        }
    }

    async delete(storeName: StoreName, key: string) {
        try {
            await dynamoDb.send(new DeleteCommand({
                TableName: getTableName(storeName),
                Key: { id: key }
            }));
        } catch (error) {
            console.error(`DynamoDB Delete Error [${storeName}]:`, error);
            localStorage.removeItem(`ramn_${storeName}_${key}`);
        }
    }
}

export const dbService = new DBService();
