import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand, GetCommand } from '@aws-sdk/lib-dynamodb';
import * as crypto from 'crypto';

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

// Hash password
function hashPassword(password: string, salt: string): string {
    return crypto.scryptSync(password, salt, 64).toString('hex');
}

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    // Handle CORS preflight
    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers: corsHeaders, body: '' };
    }

    try {
        const reqContext = event.requestContext as any;
        const path = reqContext?.http?.path || event.path;

        if (event.httpMethod === 'POST') {
            if (path.endsWith('/register')) {
                return await handleRegister(event);
            } else if (path.endsWith('/login')) {
                return await handleLogin(event);
            }
        }

        return apiError(404, 'Not Found');
    } catch (error: any) {
        console.error('Auth Error:', error);
        return apiError(500, error.message || 'Internal Server Error');
    }
};

async function handleRegister(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
    const body = JSON.parse(event.body || '{}');
    const { password, name } = body;
    const email = (body.email || '').toLowerCase().trim();

    if (!email || !password || !name) {
        return apiError(400, 'Missing email, password, or name');
    }

    // Check if user already exists
    const pk = `USER#${email}`;
    const sk = `PROFILE`;

    const existingUser = await docClient.send(new GetCommand({
        TableName: TABLE_NAME,
        Key: { PK: pk, SK: sk }
    }));

    if (existingUser.Item) {
        return apiError(400, 'User already exists');
    }

    const salt = crypto.randomBytes(16).toString('hex');
    const hashedPassword = hashPassword(password, salt);

    const userId = `user-${Date.now()}`;
    const token = crypto.randomBytes(32).toString('hex');

    const userProfile = {
        id: userId,
        email,
        name,
        passwordHash: hashedPassword,
        salt,
        createdAt: new Date().toISOString()
    };

    const params = {
        TableName: TABLE_NAME,
        Item: {
            PK: pk,
            SK: sk,
            storeName: 'users',
            originalId: userId,
            data: userProfile,
            updatedAt: new Date().toISOString()
        }
    };

    await docClient.send(new PutCommand(params));

    return apiSuccess({
        success: true,
        user: { id: userId, email, name },
        token: `ramn-jwt-${token}`
    });
}

async function handleLogin(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
    const body = JSON.parse(event.body || '{}');
    const { password } = body;
    const email = (body.email || '').toLowerCase().trim();

    if (!email || !password) {
        return apiError(400, 'Missing email or password');
    }

    const pk = `USER#${email}`;
    const sk = `PROFILE`;

    const response = await docClient.send(new GetCommand({
        TableName: TABLE_NAME,
        Key: { PK: pk, SK: sk }
    }));

    const userProfile = response.Item ? response.Item.data : null;

    if (!userProfile) {
        return apiError(401, 'Invalid email or password');
    }

    const hashedPassword = hashPassword(password, userProfile.salt);

    if (hashedPassword !== userProfile.passwordHash) {
        return apiError(401, 'Invalid email or password');
    }

    const token = crypto.randomBytes(32).toString('hex');

    return apiSuccess({
        success: true,
        user: { id: userProfile.id, email: userProfile.email, name: userProfile.name },
        token: `ramn-jwt-${token}` // Mock JWT for now
    });
}
