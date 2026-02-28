import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand, QueryCommand } from '@aws-sdk/lib-dynamodb';

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);
const TABLE_NAME = process.env.TABLE_NAME || 'RamN-Entities';
const GCP_PROJECT_ID = process.env.GCP_PROJECT_ID || 'ramn-ai';
const GCP_LOCATION = process.env.GCP_LOCATION || 'us-central1';

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type,Authorization,X-Requested-With',
    'Access-Control-Allow-Methods': 'OPTIONS,POST',
};

function apiError(statusCode: number, message: string): APIGatewayProxyResult {
    return { statusCode, headers: corsHeaders, body: JSON.stringify({ error: message }) };
}

function apiSuccess(data: any): APIGatewayProxyResult {
    return { statusCode: 200, headers: corsHeaders, body: JSON.stringify(data) };
}

/**
 * Generate text embedding using Vertex AI textembedding-gecko
 * Uses the REST API directly (no SDK dependency needed)
 */
async function getEmbedding(text: string): Promise<number[]> {
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';

    // Use Gemini's embedding endpoint (simpler than Vertex for Beta)
    const url = `https://generativelanguage.googleapis.com/v1beta/models/text-embedding-004:embedContent?key=${GEMINI_API_KEY}`;

    const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            model: 'models/text-embedding-004',
            content: { parts: [{ text }] }
        })
    });

    if (!response.ok) {
        const err = await response.text();
        console.error('[Embedding Error]', err);
        throw new Error(`Embedding API error: ${response.status}`);
    }

    const data = await response.json();
    return data.embedding?.values || [];
}

/**
 * Cosine similarity between two vectors
 */
function cosineSimilarity(a: number[], b: number[]): number {
    if (a.length !== b.length || a.length === 0) return 0;
    let dot = 0, normA = 0, normB = 0;
    for (let i = 0; i < a.length; i++) {
        dot += a[i] * b[i];
        normA += a[i] * a[i];
        normB += b[i] * b[i];
    }
    return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers: corsHeaders, body: '' };
    }

    try {
        const reqContext = event.requestContext as any;
        const path = reqContext?.http?.path || event.path;

        if (event.httpMethod === 'POST') {
            if (path.endsWith('/add')) return await handleAdd(event);
            if (path.endsWith('/search')) return await handleSearch(event);
        }

        return apiError(404, 'Not Found');
    } catch (error: any) {
        console.error('Memory Error:', error);
        return apiError(500, error.message || 'Internal Server Error');
    }
};

/**
 * POST /api/memory/add
 * { userId, content, agentId?, category? }
 * Embeds the content using Vertex AI and stores with embedding in DynamoDB
 */
async function handleAdd(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
    const body = JSON.parse(event.body || '{}');
    const { userId, content, agentId, category } = body;

    if (!userId || !content) {
        return apiError(400, 'Missing userId or content');
    }

    // Generate embedding
    let embedding: number[] = [];
    try {
        embedding = await getEmbedding(content);
    } catch (e: any) {
        console.error('[Embedding failed, storing without]', e.message);
    }

    const memoryId = `mem_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const pk = `USER#${userId}`;
    const sk = `memories#${memoryId}`;

    await docClient.send(new PutCommand({
        TableName: TABLE_NAME,
        Item: {
            PK: pk,
            SK: sk,
            storeName: 'memories',
            originalId: memoryId,
            data: {
                id: memoryId,
                userId,
                agentId: agentId || null,
                content,
                category: category || 'general',
                embedding,
                createdAt: new Date().toISOString()
            },
            updatedAt: new Date().toISOString()
        }
    }));

    return apiSuccess({ success: true, memoryId, hasEmbedding: embedding.length > 0 });
}

/**
 * POST /api/memory/search
 * { userId, query, limit? }
 * Embeds the query, fetches all user memories, does cosine similarity, returns top K
 */
async function handleSearch(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
    const body = JSON.parse((event as any).body || '{}');
    const { userId, query, limit = 5 } = body;

    if (!userId || !query) {
        return apiError(400, 'Missing userId or query');
    }

    // Embed the query
    let queryEmbedding: number[] = [];
    try {
        queryEmbedding = await getEmbedding(query);
    } catch (e: any) {
        console.error('[Query embedding failed]', e.message);
        return apiError(500, 'Failed to embed query');
    }

    // Fetch all user memories
    const pk = `USER#${userId}`;
    const response = await docClient.send(new QueryCommand({
        TableName: TABLE_NAME,
        KeyConditionExpression: 'PK = :pk AND begins_with(SK, :skPrefix)',
        ExpressionAttributeValues: {
            ':pk': pk,
            ':skPrefix': 'memories#'
        }
    }));

    const items = response.Items || [];
    if (items.length === 0) {
        return apiSuccess({ results: [], count: 0 });
    }

    // Compute similarity and rank
    const scored = items
        .filter(item => item.data?.embedding?.length > 0)
        .map(item => ({
            content: item.data.content,
            category: item.data.category,
            score: cosineSimilarity(queryEmbedding, item.data.embedding),
            createdAt: item.data.createdAt
        }))
        .sort((a, b) => b.score - a.score)
        .slice(0, limit);

    // Also include recent items without embeddings (fallback)
    const noEmbedding = items
        .filter(item => !item.data?.embedding?.length)
        .sort((a, b) => (b.data?.createdAt || '').localeCompare(a.data?.createdAt || ''))
        .slice(0, 3)
        .map(item => ({
            content: item.data.content,
            category: item.data.category,
            score: 0,
            createdAt: item.data.createdAt
        }));

    return apiSuccess({
        results: [...scored, ...noEmbedding].slice(0, limit),
        count: items.length
    });
}
