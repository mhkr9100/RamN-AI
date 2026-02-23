import { Amplify } from 'aws-amplify';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import { VAULT } from '../constants';

// AWS Amplify Configuration for Cognito
Amplify.configure({
    Auth: {
        Cognito: {
            userPoolId: VAULT.AWS.COGNITO_USER_POOL_ID,
            userPoolClientId: VAULT.AWS.COGNITO_CLIENT_ID,
            identityPoolId: VAULT.AWS.COGNITO_IDENTITY_POOL_ID,
            loginWith: {
                email: true,
            },
            signUpVerificationMethod: 'code',
        }
    }
});

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
