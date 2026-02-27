import express from "express";
import { createServer as createViteServer } from "vite";
import OpenAI from "openai";
import Anthropic from "@anthropic-ai/sdk";
import 'dotenv/config';

// ==========================================
// API ROUTES
// ==========================================
async function startServer() {
  const app = express();
  const PORT = process.env.PORT || 3000;

  // Middleware to parse JSON bodies with a higher limit for chat history payloads
  app.use(express.json({ limit: '10mb' }));

  // Mock JWT Verification Middleware
  // In a real AWS Cognito setup, this would verify the token signature using JWKS.
  const requireAuth = (req: any, res: any, next: any) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized: Missing or invalid token' });
    }
    const token = authHeader.split(' ')[1];

    // For this beta, we just verify the mock token format we create in authService.ts
    if (!token.startsWith('ramn-mock-jwt-')) {
      return res.status(401).json({ error: 'Unauthorized: Invalid token signature' });
    }

    // Attach user payload (in a real app, from decoded JWT)
    req.user = { id: token.replace('ramn-mock-jwt-', '') };
    next();
  };

  // Health check endpoint - AWS Health check
  app.get("/api/health", async (req, res) => {
    res.json({
      status: "ok",
      message: "RamN AI Backend is running with AWS!",
      timestamp: new Date().toISOString()
    });
  });

  // Placeholder for AWS Cognito Auth integration
  app.post("/api/login", (req, res) => {
    res.json({ message: "Login endpoint ready to be connected to AWS Cognito" });
  });

  // Secure AI Proxy Endpoint
  app.post("/api/chat", requireAuth, async (req, res) => {
    try {
      const { model, contents, config, userKeys } = req.body;

      // 1. Determine Provider
      let provider = 'openrouter';
      if (model.includes('gemini') || model.includes('learnlm')) provider = 'google';
      else if (model.includes('gpt') || model.includes('o1') || model.includes('o3')) provider = 'openai';
      else if (model.includes('claude')) provider = 'anthropic';

      // 2. Prepare Standardized OpenAI-like Messages & Tools (works for OpenAI & OpenRouter)
      const messages: any[] = [];
      if (config?.systemInstruction && provider !== 'anthropic') {
        // Anthropic passes system prompt separately
        messages.push({ role: 'system', content: config.systemInstruction });
      }

      for (const c of (contents || [])) {
        if (c.role === 'user' && c.parts?.[0]?.functionResponse) {
          messages.push({ role: 'tool', tool_call_id: c.parts[0].functionResponse.name, content: JSON.stringify(c.parts[0].functionResponse.response) });
        } else if (c.role === 'model' && c.parts?.[0]?.functionCall) {
          messages.push({
            role: 'assistant',
            tool_calls: [{ id: c.parts[0].functionCall.name, type: 'function', function: { name: c.parts[0].functionCall.name, arguments: JSON.stringify(c.parts[0].functionCall.args) } }]
          });
        } else {
          messages.push({ role: c.role === 'model' ? 'assistant' : 'user', content: c.parts[0]?.text || "" });
        }
      }

      let tools: any[] = [];
      if (config?.tools && config.tools[0]?.functionDeclarations) {
        tools = config.tools[0].functionDeclarations.map((t: any) => ({
          type: 'function', function: { name: t.name, description: t.description, parameters: t.parameters }
        }));
      }

      // ==========================================
      // ROUTING LOGIC
      // ==========================================

      // ROUTE: GOOGLE API
      if (provider === 'google' && (userKeys?.geminiKey || process.env.VITE_GEMINI_API_KEY)) {
        const platformKey = process.env.VITE_GEMINI_API_KEY;
        // Try user key first, then fallback to platform key
        const keysToTry = [
          ...(userKeys?.geminiKey ? [{ key: userKeys.geminiKey, source: 'user' }] : []),
          ...(platformKey ? [{ key: platformKey, source: 'platform' }] : [])
        ].filter((v, i, a) => a.findIndex(x => x.key === v.key) === i); // dedupe

        let lastErr: any = null;
        for (const { key, source } of keysToTry) {
          try {
            const targetUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`;
            const payload = {
              contents,
              systemInstruction: config?.systemInstruction ? { parts: [{ text: config.systemInstruction }] } : undefined,
              tools: config?.tools,
              generationConfig: config?.thinkingConfig ? { thinkingConfig: config.thinkingConfig } : undefined
            };

            const response = await fetch(targetUrl, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(payload)
            });

            if (!response.ok) {
              const errText = await response.text();
              const isInvalidKey = errText.includes('API_KEY_INVALID') || response.status === 400;
              const isQuota = errText.includes('RESOURCE_EXHAUSTED') || response.status === 429;

              // If user key failed, try platform key as fallback
              if (isInvalidKey && source === 'user' && keysToTry.length > 1) {
                console.warn('[Proxy] User Gemini key invalid, falling back to platform key');
                continue;
              }

              lastErr = {
                status: response.status,
                error: isInvalidKey
                  ? (source === 'platform' ? 'Platform Gemini key configuration error. Contact support.' : 'Your Gemini API key is invalid. The platform key will be used instead.')
                  : isQuota ? 'Gemini API quota exceeded. Please wait a moment or upgrade your plan.'
                    : `Google API Error: ${errText}`,
                provider: 'google', code: response.status
              };
              continue;
            }

            const data = await response.json();
            const part = data.candidates?.[0]?.content?.parts?.[0];
            if (part?.functionCall) {
              return res.json({ functionCalls: [{ id: part.functionCall.name, name: part.functionCall.name, args: part.functionCall.args }] });
            }
            return res.json({ text: part?.text || "", candidates: data.candidates });
          } catch (e: any) {
            lastErr = { status: 502, error: `Google Gemini connection failed: ${e.message}`, provider: 'google', code: 502 };
          }
        }
        // All keys exhausted
        if (lastErr) return res.status(lastErr.status || 500).json(lastErr);
      }

      // ROUTE: OPENAI API
      if (provider === 'openai' && userKeys?.openAiKey) {
        try {
          const openai = new OpenAI({ apiKey: userKeys.openAiKey });
          const response = await openai.chat.completions.create({
            model: model,
            messages: messages as any,
            tools: tools.length > 0 ? tools : undefined
          });

          const choice = response.choices[0];
          if (choice.message.tool_calls && choice.message.tool_calls.length > 0) {
            const tc = choice.message.tool_calls[0] as any;
            return res.json({ functionCalls: [{ id: tc.id, name: tc.function.name, args: JSON.parse(tc.function.arguments) }] });
          }
          return res.json({ text: choice.message.content || "" });
        } catch (e: any) {
          const msg = e.message || '';
          const status = e.status || 500;
          const isAuth = msg.includes('Incorrect API key') || msg.includes('invalid_api_key') || status === 401;
          const isQuota = msg.includes('Rate limit') || msg.includes('insufficient_quota') || status === 429;
          const isModel = msg.includes('does not exist') || msg.includes('model_not_found') || status === 404;
          return res.status(status).json({
            error: isAuth ? 'Your OpenAI API key is invalid. Please update it in your User Profile.'
              : isQuota ? 'OpenAI rate limit or quota exceeded. Please wait or check your billing.'
                : isModel ? `OpenAI model "${model}" not found. Please select a valid model.`
                  : `OpenAI Error: ${msg}`,
            provider: 'openai', code: status
          });
        }
      }

      // ROUTE: ANTHROPIC API
      if (provider === 'anthropic' && userKeys?.anthropicKey) {
        try {
          const anthropic = new Anthropic({ apiKey: userKeys.anthropicKey });

          const anthropicTools = config?.tools?.[0]?.functionDeclarations?.map((t: any) => ({
            name: t.name,
            description: t.description,
            input_schema: t.parameters
          })) || undefined;

          const anthropicMessages: any[] = [];
          for (const c of (contents || [])) {
            if (c.role === 'user' && c.parts?.[0]?.functionResponse) {
              anthropicMessages.push({ role: 'user', content: [{ type: 'tool_result', tool_use_id: c.parts[0].functionResponse.name, content: JSON.stringify(c.parts[0].functionResponse.response) }] });
            } else if (c.role === 'model' && c.parts?.[0]?.functionCall) {
              anthropicMessages.push({ role: 'assistant', content: [{ type: 'tool_use', id: c.parts[0].functionCall.name, name: c.parts[0].functionCall.name, input: c.parts[0].functionCall.args }] });
            } else {
              anthropicMessages.push({ role: c.role === 'model' ? 'assistant' : 'user', content: c.parts[0]?.text || "" });
            }
          }

          const response = await anthropic.messages.create({
            model: model,
            max_tokens: 4096,
            system: config?.systemInstruction,
            messages: anthropicMessages,
            tools: anthropicTools
          });

          const toolUse = response.content.find(c => c.type === 'tool_use');
          const textContent = response.content.find(c => c.type === 'text');

          if (toolUse && toolUse.type === 'tool_use') {
            return res.json({ functionCalls: [{ id: toolUse.id, name: toolUse.name, args: toolUse.input }], text: textContent?.type === 'text' ? textContent.text : "" });
          }
          return res.json({ text: textContent?.type === 'text' ? textContent.text : "" });
        } catch (e: any) {
          const msg = e.message || '';
          const status = e.status || 500;
          const isAuth = msg.includes('invalid x-api-key') || msg.includes('authentication_error') || status === 401;
          const isQuota = msg.includes('rate_limit') || msg.includes('overloaded') || status === 429 || status === 529;
          return res.status(status).json({
            error: isAuth ? 'Your Anthropic API key is invalid. Please update it in your User Profile.'
              : isQuota ? 'Anthropic API is rate limited or overloaded. Please wait and try again.'
                : `Anthropic Error: ${msg}`,
            provider: 'anthropic', code: status
          });
        }
      }

      // FALLBACK TO OPENROUTER (If provider specific key wasn't found but global fallback exists)
      const targetUrl = 'https://openrouter.ai/api/v1/chat/completions';
      const openRouterPayload: any = { model: model.includes('/') ? model : `google/${model}`, messages };
      if (tools && tools.length > 0) openRouterPayload.tools = tools;

      const fallbackKey = process.env.VITE_GEMINI_API_KEY; // Used as OpenRouter fallback in this legacy setup
      if (!fallbackKey) return res.status(500).json({ error: 'Server misconfiguration: No API key available for requested model.' });

      const response = await fetch(targetUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${fallbackKey}`, 'HTTP-Referer': 'https://ramnai.com', 'X-Title': 'RamN AI' },
        body: JSON.stringify(openRouterPayload)
      });
      if (!response.ok) return res.status(response.status).json({ error: `Upstream AI provider error.` });

      const data = await response.json();
      const choice = data.choices?.[0];

      if (choice?.message?.tool_calls && choice.message.tool_calls.length > 0) {
        const tc = choice.message.tool_calls[0];
        return res.json({ functionCalls: [{ id: tc.id, name: tc.function.name, args: JSON.parse(tc.function.arguments) }], text: choice.message.content });
      }
      return res.json({ text: choice?.message?.content || "" });

    } catch (error: any) {
      console.error('[AI Proxy Exception]', error);
      const msg = error.message || 'Unknown error';
      return res.status(500).json({ error: `Proxy Error: ${msg}`, provider: 'unknown', code: 500 });
    }
  });

  // ==========================================
  // MEMORY ENGINE ENDPOINTS (Self-Hosted pgvector)
  // ==========================================
  const { MemoryService } = await import('./services/memoryService');

  // Initialize server-side memory service
  const geminiKeyForMemory = process.env.VITE_GEMINI_API_KEY || '';
  const pgConfig = process.env.MEMORY_DB_HOST ? {
    host: process.env.MEMORY_DB_HOST,
    port: parseInt(process.env.MEMORY_DB_PORT || '5432'),
    database: process.env.MEMORY_DB_NAME || 'ramn_memory',
    user: process.env.MEMORY_DB_USER || 'ramn_admin',
    password: process.env.MEMORY_DB_PASSWORD || ''
  } : undefined;

  const memoryService = new MemoryService(geminiKeyForMemory, pgConfig);
  try { await memoryService.initialize(); } catch (e) { console.warn('[Server] Memory DB not available, using in-memory fallback'); }

  // Ingest chat messages — extracts facts automatically
  app.post("/api/memory/ingest", requireAuth, async (req, res) => {
    try {
      const { messages, userId, agentId } = req.body;
      if (!userId) return res.status(400).json({ error: 'userId required' });

      const facts = await memoryService.ingestMessages(messages, userId, agentId);
      return res.json({ success: true, factsExtracted: facts.length, facts });
    } catch (error: any) {
      return res.status(500).json({ error: `Memory ingestion failed: ${error.message}` });
    }
  });

  // Search memories by query
  app.post("/api/memory/search", requireAuth, async (req, res) => {
    try {
      const { query, userId, agentId } = req.body;
      if (!userId || !query) return res.status(400).json({ error: 'userId and query required' });

      const results = await memoryService.search(query, userId, agentId);
      return res.json({ results });
    } catch (error: any) {
      return res.status(500).json({ error: `Memory search failed: ${error.message}` });
    }
  });

  // Get all memories for a user
  app.get("/api/memory/all", requireAuth, async (req, res) => {
    try {
      const { userId, agentId } = req.query as any;
      if (!userId) return res.status(400).json({ error: 'userId required' });

      const memories = await memoryService.getAll(userId as string, agentId as string);
      return res.json({ memories });
    } catch (error: any) {
      return res.status(500).json({ error: `Memory retrieval failed: ${error.message}` });
    }
  });

  // In-memory UserMap storage (persisted via frontend IndexedDB — server acts as pass-through for consolidation)
  const userMaps: Record<string, any> = {};

  // Get UserMap tree
  app.get("/api/usermap", requireAuth, async (req, res) => {
    const userId = (req as any).user.id;
    return res.json({ tree: userMaps[userId] || null });
  });

  // Save UserMap tree (edited by user)
  app.put("/api/usermap", requireAuth, async (req, res) => {
    const userId = (req as any).user.id;
    const { tree } = req.body;
    userMaps[userId] = tree;
    return res.json({ success: true });
  });

  // Consolidate: pull memories and structure into PageIndex tree
  app.post("/api/usermap/consolidate", requireAuth, async (req, res) => {
    try {
      const { userId } = req.body;
      if (!userId) return res.status(400).json({ error: 'userId required' });

      const memories = await memoryService.getAll(userId);
      const memoryTexts = memories.map((m: any) => m.content || m.memory || JSON.stringify(m));

      if (memoryTexts.length === 0) {
        return res.json({ tree: userMaps[userId] || { id: 'root', label: 'UserMap', children: [] } });
      }

      // Use Gemini to structure the memories
      const structuringPrompt = `You are a Context Structurer. Given user memory facts, organize them into a hierarchical JSON tree. Output ONLY valid JSON with this schema: { "id": "root", "label": "UserMap", "children": [{ "id": "unique-id", "label": "Category", "children": [{ "id": "unique-id", "label": "Fact", "value": "info", "children": [] }] }] }`;

      const geminiKey = process.env.VITE_GEMINI_API_KEY;
      if (!geminiKey) return res.status(500).json({ error: 'Server Gemini key not configured for structuring.' });

      const targetUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiKey}`;
      const structResponse = await fetch(targetUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: `Here are the user's memory facts:\n\n${memoryTexts.map((m: string, i: number) => `${i + 1}. ${m}`).join('\n')}\n\n${userMaps[userId] ? `Merge into existing tree:\n${JSON.stringify(userMaps[userId])}` : 'Create a new UserMap tree.'}` }] }],
          systemInstruction: { parts: [{ text: structuringPrompt }] }
        })
      });

      const structData = await structResponse.json();
      const responseText = structData.candidates?.[0]?.content?.parts?.[0]?.text || '';
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);

      if (jsonMatch) {
        const tree = JSON.parse(jsonMatch[0]);
        userMaps[userId] = tree;
        return res.json({ tree });
      }

      return res.status(500).json({ error: 'Failed to structure memories into tree.' });
    } catch (error: any) {
      return res.status(500).json({ error: `Consolidation failed: ${error.message}` });
    }
  });

  // ==========================================
  // VITE MIDDLEWARE
  // ==========================================

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static('dist'));
  }

  app.listen(Number(PORT), "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
