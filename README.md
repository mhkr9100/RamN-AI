# RamN AI

**RamN AI** is a production-ready, multi-agent orchestrator built with React, Vite, and the Gemini API. It allows users to orchestrate specialized AI agents—such as Researchers, Content Producers, and Data Analysts—into dynamic teams to accomplish complex workflows.

> **Note:** This project is a monolithic repository prepared for deployment on **AWS Amplify**. 

## Core Features

- **Prism Orchestrator (Meta-Agent):** Prism automatically analyzes your objective and deploys customized, role-playing agents in seconds using **Route Mode**.
- **Multi-Agent Squads:** Group specialized agents together in a cohesive workspace.
- **Spectrum Model Roster:** Easily swap between Gemini models (Flash, Pro, Image) per agent for specific capabilities.
- **Persistent Local Memory:** Every chat and task is securely archived in your local browser using IndexedDB.
- **Semantic Prompt Caching:** Identical queries are instantly retrieved from cache, saving API costs and reducing latency.
- **Local RAG (LEANN Integration):** Vector database capabilities integrated directly into the orchestrator backend for grounding AI responses in local datasets without exposing your data to third-party endpoints.

## Project Structure

This is a monolithic structure optimized for modern cloud deployments:
- `server.ts` - An Express backend that acts as a proxy for the LEANN python processes and serves health-checks.
- `index.html` & `src/` - The React frontend powered by Vite and Tailwind CSS.
- `LEANN/` - The embedded lightweight Python Retrieval-Augmented Generation (RAG) engine.
- `amplify.yml` - Custom build configurations to ensure SPA routing works seamlessly on AWS.

## Quick Start (Local Development)

### 1. Prerequisites
- Node.js (v18+)
- Python 3.10+ (for LEANN RAG features)
- Google Gemini API Key

### 2. Installation
```bash
npm install
```

### 3. Start the Development Server
```bash
npm run dev
```
The application will be available at `http://localhost:3000`.

### 4. Configuration
Once the app loads, open your **User Profile** (bottom left corner) and insert your Gemini API Key. This key is securely stored in your browser's local storage and used directly for inference.

## Deployment (AWS Amplify)

This repository is pre-configured for **AWS Amplify Hosting**. Simply connect this GitHub repository to your Amplify app. The included `amplify.yml` will automatically:
1. Build the production React assets via Vite.
2. Set up SPA redirection rules (`/<*> → /index.html`) to prevent 404 routing errors.

## Architecture & Privacy
RamN AI prioritizes edge-based execution. 
- All conversational history remains in your browser (`IndexedDB`).
- All vector search logic runs locally via the embedded LEANN engine.
- API keys are injected at runtime directly to the Gemini API provider.
