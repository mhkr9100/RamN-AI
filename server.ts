import express from "express";
import { createServer as createViteServer } from "vite";

// ==========================================
// API ROUTES
// ==========================================
async function startServer() {
  const app = express();
  const PORT = process.env.PORT || 3000;

  // Middleware to parse JSON bodies
  app.use(express.json());

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

  // LEANN Vector DB search endpoint
  app.post("/api/leann/search", async (req, res) => {
    const { query, indexDir = './demo.leann', topK = 3 } = req.body;
    try {
      const { exec } = await import('child_process');
      const util = await import('util');
      const execAsync = util.promisify(exec);

      const command = `python -m apps.document_rag --index-dir "${indexDir}" --query "${query}" --top-k ${topK}`;
      const { stdout } = await execAsync(command, { cwd: './LEANN' });

      const resultsMarker = "Here are the top results:";
      const startIndex = stdout.indexOf(resultsMarker);
      if (startIndex !== -1) {
        res.json({ result: stdout.substring(startIndex + resultsMarker.length).trim() });
      } else {
        res.json({ result: stdout.trim() || "[LEANN]: No relevant context found." });
      }
    } catch (error: any) {
      console.error("[LEANN Error] Search failed:", error);
      res.status(500).json({ error: "[LEANN]: Local RAG service unavailable or failed to execute." });
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
