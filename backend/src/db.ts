import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand, GetCommand, DeleteCommand, QueryCommand } from '@aws-sdk/lib-dynamodb';

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);
const TABLE_NAME = process.env.TABLE_NAME || 'RamN-Entities';

// Standard CORS headers
const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type,Authorization,X-Requested-With',
    'Access-Control-Allow-Methods': 'OPTIONS,POST,GET,PUT,DELETE',
};

// Return a structured API error
function apiError(statusCode: number, message: string): APIGatewayProxyResult {
    return {
        statusCode,
        headers: corsHeaders,
        body: JSON.stringify({ error: message }),
    };
}

// Return a structured API success response
function apiSuccess(data: any): APIGatewayProxyResult {
    return {
        statusCode: 200,
        headers: corsHeaders,
        body: JSON.stringify(data),
    };
}

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    // Handle CORS preflight
    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers: corsHeaders, body: '' };
    }

    try {
        switch (event.httpMethod) {
            case 'POST':
            case 'PUT':
                return await handlePut(event);
            case 'GET':
                return await handleGet(event);
            case 'DELETE':
                return await handleDelete(event);
            default:
                return apiError(405, 'Method Not Allowed');
        }
    } catch (error: any) {
        console.error('DB Error:', error);
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
 * Handle POST / PUT
 * Expects { store: string, item: object }
 * Constructs PK = "USER#<userId>" (if available) or "STORE#<store>"
 * Constructs SK = "<store>#<id>"
 */
async function handlePut(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
    const body = JSON.parse(event.body || '{}');
    const { store, item } = body;

    if (!store || !item || !item.id) {
        return apiError(400, 'Missing store, item, or item.id');
    }

    // Security: Verify user identity if userId is provided
    if (item.userId) {
        const authenticatedId = extractUserIdFromToken(event);
        if (!authenticatedId || authenticatedId !== item.userId) {
            console.warn(`[Security] Unauthorized DB put attempt for user ${item.userId}`);
            return apiError(403, 'Forbidden: Invalid or missing authorization token for this user');
        }
    }

    // Partition key strategy: Group by user if possible
    const pk = item.userId ? `USER#${item.userId}` : `STORE#${store}`;
    const sk = `${store}#${item.id}`;

    const params = {
        TableName: TABLE_NAME,
        Item: {
            PK: pk,
            SK: sk,
            storeName: store,
            originalId: item.id,
            data: item,     // Keep entire original document inside 'data'
            updatedAt: new Date().toISOString()
        }
    };

    await docClient.send(new PutCommand(params));
    return apiSuccess({ success: true, PK: pk, SK: sk });
}

/**
 * Handle GET
 * Expects ?store=xyz&userId=abc (Fetch all for user)
 * Or ?store=xyz&id=123 (Fetch specific item - usually userId needs to be provided too for PK)
 */
async function handleGet(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
    const params = event.queryStringParameters || {};
    const { store, userId, id } = params;

    if (!store) {
        return apiError(400, 'Missing store query parameter');
    }

    // Security: Verify user identity if userId is provided
    if (userId) {
        const authenticatedId = extractUserIdFromToken(event);
        if (!authenticatedId || authenticatedId !== userId) {
            console.warn(`[Security] Unauthorized DB get attempt for user ${userId}`);
            return apiError(403, 'Forbidden: Invalid or missing authorization token for this user');
        }
    }

    if (id) {
        // Fetch specific item
        const pk = userId ? `USER#${userId}` : `STORE#${store}`;
        const sk = `${store}#${id}`;

        const response = await docClient.send(new GetCommand({
            TableName: TABLE_NAME,
            Key: { PK: pk, SK: sk }
        }));

        return apiSuccess({ item: response.Item ? response.Item.data : null });
    } else {
        // Fetch all items within a store for a user
        const pk = userId ? `USER#${userId}` : `STORE#${store}`;

        const response = await docClient.send(new QueryCommand({
            TableName: TABLE_NAME,
            KeyConditionExpression: 'PK = :pk AND begins_with(SK, :skPrefix)',
            ExpressionAttributeValues: {
                ':pk': pk,
                ':skPrefix': `${store}#`
            }
        }));

        const items = response.Items ? response.Items.map(i => i.data) : [];
        return apiSuccess({ items });
    }
}

/**
 * Handle DELETE
 * Expects ?store=xyz&id=123&userId=abc
 */
async function handleDelete(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
    const params = event.queryStringParameters || {};
    const { store, id, userId } = params;

    if (!store || !id) {
        return apiError(400, 'Missing store or id query parameter');
    }

    // Security: Verify user identity if userId is provided
    if (userId) {
        const authenticatedId = extractUserIdFromToken(event);
        if (!authenticatedId || authenticatedId !== userId) {
            console.warn(`[Security] Unauthorized DB delete attempt for user ${userId}`);
            return apiError(403, 'Forbidden: Invalid or missing authorization token for this user');
        }
    }

    const pk = userId ? `USER#${userId}` : `STORE#${store}`;
    const sk = `${store}#${id}`;

    await docClient.send(new DeleteCommand({
        TableName: TABLE_NAME,
        Key: { PK: pk, SK: sk }
    }));

    return apiSuccess({ success: true });
}
