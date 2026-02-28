import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand, QueryCommand } from '@aws-sdk/lib-dynamodb';

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);
const TABLE_NAME = process.env.TABLE_NAME || 'RamN-Entities';

// Standard CORS headers
const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type,Authorization,X-Requested-With',
    'Access-Control-Allow-Methods': 'OPTIONS,POST',
};

function apiError(statusCode: number, message: string): APIGatewayProxyResult {
    return {
        statusCode,
        headers: corsHeaders,
        body: JSON.stringify({ error: message }),
    };
}

function apiSuccess(data: any): APIGatewayProxyResult {
    return {
        statusCode: 200,
        headers: corsHeaders,
        body: JSON.stringify(data),
    };
}

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers: corsHeaders, body: '' };
    }

    if (event.httpMethod !== 'POST') {
        return apiError(405, 'Method Not Allowed');
    }

    try {
        const path = event.path;

        if (path === '/api/memory/add') {
            return await handleAddMemory(event);
        } else if (path === '/api/memory/search') {
            return await handleSearchMemory(event);
        } else {
            return apiError(404, 'Endpoint Not Found');
        }
    } catch (error: any) {
        console.error('Memory API Error:', error);
        return apiError(500, error.message || 'Internal Server Error');
    }
};

function extractUserIdFromToken(event: APIGatewayProxyEvent): string | null {
    const authHeader = event.headers['Authorization'] || event.headers['authorization'];
    if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
    const token = authHeader.replace('Bearer ', '');
    // In our beta, the mock JWT encodes the ID directly
    if (token.startsWith('ramn-mock-jwt-')) {
        return token.replace('ramn-mock-jwt-', '');
    }
    return null;
}

/**
 * Perform Cosine Similarity between vector A and vector B
 */
function cosineSimilarity(A: number[], B: number[]): number {
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;
    for (let i = 0; i < A.length; i++) {
        dotProduct += A[i] * B[i];
        normA += A[i] * A[i];
        normB += B[i] * B[i];
    }
    if (normA === 0 || normB === 0) return 0;
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

/**
 * Fetch embedding from Gemini using the provided API Key with Exponential Backoff
 */
async function fetchGeminiEmbedding(text: string, apiKey: string, retries = 3): Promise<number[]> {
    const targetUrl = `https://generativelanguage.googleapis.com/v1beta/models/text-embedding-004:embedContent?key=${apiKey}`;

    let lastError;
    for (let i = 0; i < retries; i++) {
        try {
            const res = await fetch(targetUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    model: 'models/text-embedding-004',
                    content: { parts: [{ text }] }
                })
            });

            if (!res.ok) {
                const err = await res.text();
                // If Rate Limited or Server Error, retry with exponential backoff
                if (res.status === 429 || res.status >= 500) {
                    lastError = new Error(`Embedding generation retryable error: ${res.status} ${err}`);
                    const backoff = Math.random() * 1000 + Math.pow(2, i) * 1000;
                    console.warn(`[MemoryAPI] Embedding fetch failed (attempt ${i + 1}/${retries}). Retrying in ${Math.round(backoff)}ms...`);
                    await new Promise(r => setTimeout(r, backoff));
                    continue;
                }
                throw new Error(`Embedding generation fatal error: ${res.status} ${err}`);
            }

            const data: any = await res.json();
            return data.embedding?.values || [];
        } catch (error) {
            lastError = error;
            console.error(`[MemoryAPI] Unexpected error during embedding fetch:`, error);
        }
    }
    throw lastError;
}

/**
 * POST /api/memory/add
 * Expects: { userId, agentId (optional), content, apiKey }
 */
async function handleAddMemory(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
    const { userId, agentId, content, apiKey } = JSON.parse(event.body || '{}');

    if (!userId || !content || !apiKey) {
        return apiError(400, 'Missing userId, content, or apiKey');
    }

    const authenticatedId = extractUserIdFromToken(event);
    if (!authenticatedId || authenticatedId !== userId) {
        console.warn(`[Security] Unauthorized memory add attempt for user ${userId}`);
        return apiError(403, 'Forbidden: Invalid or missing authorization token for this user');
    }

    // 1. Generate text embedding
    const embedding = await fetchGeminiEmbedding(content, apiKey);
    if (!embedding.length) {
        return apiError(500, 'Failed to generate embedding');
    }

    // 2. Store in DynamoDB (PK: USER#userId, SK: MEMORY#<timestamp_rand>)
    const pk = `USER#${userId}`;
    const id = `mem-${Date.now()}-${Math.random().toString(36).substr(2, 8)}`;
    const sk = `MEMORY#${id}`;

    const memoryItem = {
        id,
        userId,
        agentId: agentId || null,
        content,
        embedding, // Store vector directly in DynamoDB array format
        createdAt: new Date().toISOString()
    };

    const params = {
        TableName: TABLE_NAME,
        Item: {
            PK: pk,
            SK: sk,
            data: memoryItem
        }
    };

    await docClient.send(new PutCommand(params));
    return apiSuccess({ success: true, memory: memoryItem });
}

/**
 * POST /api/memory/search
 * Expects: { userId, agentId (optional), query, limit (default=5), apiKey }
 */
async function handleSearchMemory(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
    const { userId, agentId, query, limit = 5, apiKey } = JSON.parse(event.body || '{}');

    if (!userId || !query || !apiKey) {
        return apiError(400, 'Missing userId, query, or apiKey');
    }

    const authenticatedId = extractUserIdFromToken(event);
    if (!authenticatedId || authenticatedId !== userId) {
        console.warn(`[Security] Unauthorized memory search attempt for user ${userId}`);
        return apiError(403, 'Forbidden: Invalid or missing authorization token for this user');
    }

    // 1. Generate text embedding of the query
    const queryEmbedding = await fetchGeminiEmbedding(query, apiKey);
    if (!queryEmbedding.length) {
        return apiError(500, 'Failed to generate query embedding');
    }

    // 2. Load all memories for user from DynamoDB
    const pk = `USER#${userId}`;
    const response = await docClient.send(new QueryCommand({
        TableName: TABLE_NAME,
        KeyConditionExpression: 'PK = :pk AND begins_with(SK, :skPrefix)',
        ExpressionAttributeValues: {
            ':pk': pk,
            ':skPrefix': 'MEMORY#'
        }
    }));

    const allMemories = response.Items ? response.Items.map(i => i.data) : [];

    if (!allMemories.length) {
        return apiSuccess({ results: [] });
    }

    // 3. Perform in-memory Cosine Similarity matching
    const scoredMemories = allMemories.map((mem: any) => {
        // Skip if wrong agent context
        if (agentId && mem.agentId && mem.agentId !== agentId) {
            return { memory: mem, score: -1 };
        }

        const score = mem.embedding && mem.embedding.length
            ? cosineSimilarity(queryEmbedding, mem.embedding)
            : 0;

        return { memory: mem, score };
    });

    // 4. Sort by highest score and take top K
    const results = scoredMemories
        .filter(m => m.score > 0.3) // Minimum relevance threshold
        .sort((a, b) => b.score - a.score)
        .slice(0, limit)
        .map(m => m.memory);

    return apiSuccess({ results });
}
