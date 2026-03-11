# RamN AI — Copilot Instructions

## Project Overview
RamN AI is a No-Code, Multi-Agent Chat Interface with Tasks. It uses a React/TypeScript frontend with an AWS Serverless backend (API Gateway, Lambda, DynamoDB) and integrates with Google Vertex AI (Gemini) and AWS Bedrock (Claude).

## Critical Rules (MUST follow)
1. DO NOT simulate, mock, or hardcode ANY responses
2. DO NOT use setTimeout to fake loading
3. DO NOT return example/dummy/placeholder data
4. ALL data must come from real DynamoDB calls
5. ALL AI responses must come from real Vertex AI calls
6. If a database table is empty, return empty array []
7. If an API call fails, return real error message
8. DO NOT put business logic in frontend code
9. DO NOT create UI components unless specifically asked
10. Test every function with real data before moving on

## Architecture
- **Frontend:** React + TypeScript + Vite + TailwindCSS
- **Backend (TypeScript):** `backend/src/*.ts` — compiled to `dist/` for Lambda (db, auth, security, ai-proxy, proxy, uploads, memory, health, tools)
- **Backend (JavaScript):** `backend/functions/*/index.js` — standalone Lambda functions (agent-create, agent-list, agent-delete, agent-run, prism-chat, usermap-store, usermap-consolidate, memory-extract, documents, special-agents, model-registry, tool-registry)
- **Shared modules:** `backend/shared/*.js` — dynamo.js, auth.js, vertex-ai.js, rate-limit.js, cors.js, tool-ids.js
- **Infrastructure:** `backend/template.yaml` (AWS SAM)

## Security Rules
- Never hardcode AWS credentials, Cognito pool IDs, or API keys
- Always use environment variables for secrets; fail-fast if missing
- All endpoints MUST use `validateToken()` or `requireAuth()` for authentication
- Extract `userId` from verified JWT only — never trust client-provided userId
- Never expose `error.message` in production API responses — use generic error text
- CORS must use dynamic origin resolution via `backend/shared/cors.js` or `backend/src/security.ts`
- Never log PII (userId, email) to CloudWatch

## Code Conventions
- Backend JS Lambda functions use the `respond(statusCode, body, eventHeaders)` pattern with shared CORS
- Backend TS Lambda functions use `buildCorsHeaders(event.headers, methods)` from `security.ts`
- DynamoDB operations go through `backend/shared/dynamo.js`
- AI calls go through `backend/shared/vertex-ai.js`
- Frontend API calls go through `services/apiV2.ts`
