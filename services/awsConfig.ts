import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import { VAULT } from '../constants';

// AWS DynamoDB Client Setup
const ddbClient = new DynamoDBClient({
    region: VAULT.AWS.REGION,
    credentials: {
        accessKeyId: VAULT.AWS.ACCESS_KEY_ID,
        secretAccessKey: VAULT.AWS.SECRET_ACCESS_KEY
    }
});

// Create DocumentClient for easier unmarshalling
export const dynamoDb = DynamoDBDocumentClient.from(ddbClient, {
    marshallOptions: {
        removeUndefinedValues: true,
    }
});
