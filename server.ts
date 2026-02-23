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
