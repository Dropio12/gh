import express from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";

const db = new Database("cache.db");

// Initialize cache table
db.exec(`
  CREATE TABLE IF NOT EXISTS form_cache (
    hash TEXT,
    language TEXT,
    schema TEXT,
    PRIMARY KEY (hash, language)
  )
`);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '50mb' }));

  // API Routes
  app.get("/api/cache/:hash/:language", (req, res) => {
    const { hash, language } = req.params;
    try {
      const stmt = db.prepare("SELECT schema FROM form_cache WHERE hash = ? AND language = ?");
      const row = stmt.get(hash, language) as { schema: string } | undefined;
      
      if (row) {
        res.json({ found: true, schema: JSON.parse(row.schema) });
      } else {
        res.json({ found: false });
      }
    } catch (error) {
      console.error("Cache read error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/cache", (req, res) => {
    const { hash, language, schema } = req.body;
    if (!hash || !language || !schema) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    try {
      const stmt = db.prepare("INSERT OR REPLACE INTO form_cache (hash, language, schema) VALUES (?, ?, ?)");
      stmt.run(hash, language, JSON.stringify(schema));
      res.json({ success: true });
    } catch (error) {
      console.error("Cache write error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static("dist"));
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
