import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { VAULT } from '../constants';
import { v4 as uuidv4 } from 'uuid';

const s3Client = new S3Client({
    region: VAULT.AWS.REGION,
    credentials: {
        accessKeyId: VAULT.AWS.ACCESS_KEY_ID,
        secretAccessKey: VAULT.AWS.SECRET_ACCESS_KEY
    }
});

export const s3Service = {
    /**
     * Uploads a document or image to AWS S3.
     * @param file The File object from an input element.
     * @param agentId The ID of the agent this knowledge belongs to.
     * @returns The public URL of the uploaded file.
     */
    async uploadKnowledgeDocument(file: File, agentId: string): Promise<{ url: string, key: string }> {
        if (!VAULT.AWS.S3_BUCKET_NAME) {
            console.warn("S3 Bucket Name is missing from config. Mocking S3 Upload.");
            // Mock upload for local development without proper AWS keys
            return new Promise((resolve) => {
                setTimeout(() => {
                    resolve({
                        url: URL.createObjectURL(file), // Local mock URL
                        key: `mock-key-${uuidv4()}`
                    });
                }, 1000);
            });
        }

        try {
            const fileExtension = file.name.split('.').pop();
            const key = `knowledge-base/${agentId}/${uuidv4()}.${fileExtension}`;

            const arrayBuffer = await file.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);

            const command = new PutObjectCommand({
                Bucket: VAULT.AWS.S3_BUCKET_NAME,
                Key: key,
                Body: buffer,
                ContentType: file.type,
                // In production, configure bucket policies for public read or use signed URLs
                // ACL: 'public-read' 
            });

            await s3Client.send(command);

            const url = `https://${VAULT.AWS.S3_BUCKET_NAME}.s3.${VAULT.AWS.REGION}.amazonaws.com/${key}`;

            return { url, key };
        } catch (error) {
            console.error("AWS S3 Upload Error:", error);
            throw new Error(`Failed to upload document: ${(error as Error).message}`);
        }
    }
};
