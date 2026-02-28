import { describe, it, expect, vi } from 'vitest';
import { handler } from '../backend/src/db';
import { APIGatewayProxyEvent } from 'aws-lambda';

// Mock DynamoDB
vi.mock('@aws-sdk/lib-dynamodb', () => {
    return {
        DynamoDBDocumentClient: {
            from: vi.fn(() => ({
                send: vi.fn().mockResolvedValue({})
            }))
        },
        PutCommand: vi.fn(),
        GetCommand: vi.fn(),
        DeleteCommand: vi.fn(),
        QueryCommand: vi.fn(),
    };
});

vi.mock('@aws-sdk/client-dynamodb', () => {
    return {
        DynamoDBClient: vi.fn(),
    };
});

describe('DB Security Authorization Tests', () => {
    const mockEvent = (method: string, queryParams: any = {}, body: any = null, headers: any = {}): APIGatewayProxyEvent => ({
        httpMethod: method,
        queryStringParameters: queryParams,
        body: body ? JSON.stringify(body) : null,
        headers: headers,
        path: '/api/db',
        requestContext: {} as any,
        multiValueHeaders: {},
        isBase64Encoded: false,
        multiValueQueryStringParameters: null,
        pathParameters: null,
        stageVariables: null,
        resource: ''
    });

    const VALID_TOKEN = 'Bearer ramn-mock-jwt-user-123';
    const INVALID_TOKEN = 'Bearer ramn-mock-jwt-other-user';

    it('denies handleGet without token', async () => {
        const event = mockEvent('GET', { store: 'agents', userId: 'user-123' });
        const result = await handler(event);
        expect(result.statusCode).toBe(403);
    });

    it('denies handleGet with wrong token', async () => {
        const event = mockEvent('GET', { store: 'agents', userId: 'user-123' }, null, { 'Authorization': INVALID_TOKEN });
        const result = await handler(event);
        expect(result.statusCode).toBe(403);
    });

    it('allows handleGet with valid token', async () => {
        const event = mockEvent('GET', { store: 'agents', userId: 'user-123' }, null, { 'Authorization': VALID_TOKEN });
        const result = await handler(event);
        expect(result.statusCode).toBe(200);
    });

    it('denies handleDelete without token', async () => {
        const event = mockEvent('DELETE', { store: 'agents', id: 'agent-123', userId: 'user-123' });
        const result = await handler(event);
        expect(result.statusCode).toBe(403);
    });

    it('denies handleDelete with wrong token', async () => {
        const event = mockEvent('DELETE', { store: 'agents', id: 'agent-123', userId: 'user-123' }, null, { 'Authorization': INVALID_TOKEN });
        const result = await handler(event);
        expect(result.statusCode).toBe(403);
    });

    it('allows handleDelete with valid token', async () => {
        const event = mockEvent('DELETE', { store: 'agents', id: 'agent-123', userId: 'user-123' }, null, { 'Authorization': VALID_TOKEN });
        const result = await handler(event);
        expect(result.statusCode).toBe(200);
    });

    it('denies handlePut without token', async () => {
        const event = mockEvent('POST', {}, { store: 'agents', item: { id: 'agent-123', userId: 'user-123' } });
        const result = await handler(event);
        expect(result.statusCode).toBe(403);
    });

    it('denies handlePut with wrong token', async () => {
        const event = mockEvent('POST', {}, { store: 'agents', item: { id: 'agent-123', userId: 'user-123' } }, { 'Authorization': INVALID_TOKEN });
        const result = await handler(event);
        expect(result.statusCode).toBe(403);
    });

    it('allows handlePut with valid token', async () => {
        const event = mockEvent('POST', {}, { store: 'agents', item: { id: 'agent-123', userId: 'user-123' } }, { 'Authorization': VALID_TOKEN });
        const result = await handler(event);
        expect(result.statusCode).toBe(200);
    });
});
