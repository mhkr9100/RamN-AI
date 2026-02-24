import { Amplify } from 'aws-amplify';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import { VAULT } from '../constants';

const cognitoConfig: any = {
    userPoolId: VAULT.AWS.COGNITO_USER_POOL_ID,
    userPoolClientId: VAULT.AWS.COGNITO_CLIENT_ID,
    loginWith: {
        email: true,
    },
    signUpVerificationMethod: 'code',
};

if (VAULT.AWS.COGNITO_IDENTITY_POOL_ID) {
    cognitoConfig.identityPoolId = VAULT.AWS.COGNITO_IDENTITY_POOL_ID;
}

if (!VAULT.AWS.COGNITO_USER_POOL_ID) {
    console.error("Missing AWS Cognito User Pool ID! Check your .env file and restart the dev server.");
}

// AWS Amplify Configuration for Cognito
Amplify.configure({
    Auth: {
        Cognito: cognitoConfig
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
