import express, { Request, Response, NextFunction } from "express";
import path from "path";
import multer from "multer";
import cors from "cors";
import fs from "fs";
import "dotenv/config";
import getDailyGoalsHandler from "./api/get_daily_goals";

// Fallback for __dirname if needed, though process.cwd() is safer
const currentDir = typeof __dirname !== "undefined" ? __dirname : process.cwd();

// Detect production mode (default to true in start script unless explicitly 'development')
const isProd = process.env.NODE_ENV !== "development";

// Robust distPath resolution
let distPath: string;
if (isProd) {
  const possiblePaths = [
    __dirname,
    path.join(process.cwd(), "dist"),
    process.cwd(), // Flattened Docker deployments
    path.join(process.cwd(), "web-build"),
    path.join(__dirname, "..", "dist"),
    path.join(__dirname, "dist"),
  ];
  
  const found = possiblePaths.find(p => fs.existsSync(path.join(p, "index.html")));
  distPath = found || path.resolve(process.cwd(), "dist");
  console.log(`[FORENSIC] Resolved distPath to: ${distPath}`);
} else {
  distPath = path.resolve(process.cwd(), "dist");
}


async function startServer() {
  const PORT = 3000;
  const app = express();

  console.log(`[FORENSIC] Booting Server...`);
  console.log(`[FORENSIC] NODE_ENV: ${process.env.NODE_ENV}`);
  console.log(`[FORENSIC] isProd: ${isProd}`);
  console.log(`[FORENSIC] process.cwd(): ${process.cwd()}`);
  console.log(`[FORENSIC] distPath: ${distPath}`);

  const indexHTMLPath = path.join(distPath, "index.html");
  const indexExists = fs.existsSync(indexHTMLPath);
  console.log(`[FORENSIC] Checking ${indexHTMLPath}: ${indexExists}`);
  
  if (isProd && !indexExists) {
    console.warn(`[WARNING] isProd is true but index.html missing at ${indexHTMLPath}`);
  }

  // 1. Leaderboard logic (Moved up to prevent ReferenceError in routes)
  const LEADS_FILE = isProd ? "/tmp/leaderboard.json" : path.join(process.cwd(), "leaderboard.json");
  let leaderboard: Record<string, { name: string, score: number, lastUpdate: string }> = {};

  const saveLeaderboard = () => {
    try {
      fs.writeFileSync(LEADS_FILE, JSON.stringify(leaderboard, null, 2));
    } catch (err) {
      console.error("[Leaderboard] Save failure:", err);
    }
  };

  try {
    if (fs.existsSync(LEADS_FILE)) {
      leaderboard = JSON.parse(fs.readFileSync(LEADS_FILE, "utf-8"));
    }
  } catch (err) {
    console.error("[Leaderboard] Load failure:", err);
  }

  // 1. TOP-LEVEL ERROR HANDLING (LOG EVERYTHING)
  process.on("uncaughtException", (err) => {
    console.error("[FATAL CRASH] Uncaught Exception:", err);
  });
  process.on("unhandledRejection", (reason) => {
    console.error("[FATAL CRASH] Unhandled Rejection:", reason);
  });

  // 2. ULTRA-FAST HEALTH CHECK (BEFORE MIDDLEWARE)
  app.all("/api/health", (req, res) => {
    res.json({ 
      status: "ok", 
      time: new Date().toISOString(),
      epoch: Date.now(),
      isProd,
      method: req.method,
      url: req.url
    });
  });

  // 3. CORE MIDDLEWARE
  app.use(cors({ origin: "*", credentials: true }));
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true }));

  // Request logger for debugging
  app.use((req, res, next) => {
    if (req.url.startsWith('/api')) {
      console.log(`[API_DEBUG] ${req.method} ${req.url} (Body keys: ${Object.keys(req.body || {})})`);
    }
    next();
  });

  // 4. DEFENSIVE API ROUTES (Direct on app to avoid router quirks)
  app.all(["/api/daily-goals", "/api/daily-goals/"], (req, res) => {
    console.log(`[API] HIT: daily-goals [${req.method}]`);
    getDailyGoalsHandler(req, res);
  });

  app.all(["/api/leads", "/api/leads/"], (req, res) => {
    const sortedLeads = Object.values(leaderboard).sort((a, b) => b.score - a.score);
    res.json(sortedLeads);
  });

  app.post(["/api/leads/update", "/api/leads/update/"], (req, res) => {
    const { userId, name, score } = req.body;
    if (!userId || !name) return res.status(400).json({ error: "Missing userId or name" });
    leaderboard[userId] = { name, score: score || 0, lastUpdate: new Date().toISOString() };
    saveLeaderboard();
    res.json({ success: true });
  });

  // 6. Gemini Proxy
  app.post("/api/ai/gemini", async (req: Request, res: Response) => {
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) return res.status(500).json({ error: "GEMINI_API_KEY missing" });

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${req.body.model || 'gemini-1.5-flash'}:generateContent?key=${apiKey}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(req.body.payload),
      });

      const data = await response.json();
      res.status(response.status).json(data);
    } catch (error) {
      res.status(500).json({ error: "Gemini error" });
    }
  });

  // 4.5 CATCH-ALL API (Prevent fallthrough to SPA index.html)
  app.all("/api/*", (req, res) => {
    console.warn(`[API_MISS] No route matched for: ${req.method} ${req.url}`);
    res.status(404).json({ 
      error: "API endpoint not found",
      method: req.method,
      path: req.url 
    });
  });

  // 7. ENVIRONMENT-SPECIFIC MIDDLEWARE
  if (!isProd) {
    console.log("[SERVER] Dev Mode: Loading Vite...");
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("[SERVER] Prod Mode: Serving static files...");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      // Don't swallow API 404s - use originalUrl to be safe
      const url = req.originalUrl || req.url;
      if (url.startsWith("/api")) {
        console.warn(`[API_404] No route matched for: ${url}`);
        return res.status(404).json({ error: "API route not found on this server" });
      }
      const indexPath = path.join(distPath, "index.html");
      if (!fs.existsSync(indexPath)) {
        console.error(`[CRITICAL] SPA fallback failed: index.html not found at ${indexPath}`);
        return res.status(500).send(`Configuration error: SPA index.html missing. Path: ${indexPath}`);
      }
      res.sendFile(indexPath);
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`\n🚀 [FORENSIC SUCCESS] Server listening on port ${PORT}`);
  });
}

startServer();
