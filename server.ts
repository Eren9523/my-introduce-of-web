import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";

const app = express();
const PORT = 3000;

// Production Cloudflare Pages URL for unified D1 & Cloudflare Functions
const PROD_API_ORIGIN = process.env.CLOUDFLARE_API_URL || "https://eren9523.fun";

app.use(express.json());

// Proxy all /api calls directly to Cloudflare Pages Functions
app.use("/api", async (req, res) => {
  try {
    const targetUrl = `${PROD_API_ORIGIN}/api${req.url}`;
    const headers: Record<string, string> = {};
    
    if (req.headers["authorization"]) {
      headers["authorization"] = req.headers["authorization"] as string;
    }
    if (req.headers["content-type"]) {
      headers["content-type"] = req.headers["content-type"] as string;
    }

    const fetchOptions: RequestInit = {
      method: req.method,
      headers
    };

    if (["POST", "PUT", "PATCH", "DELETE"].includes(req.method) && req.body && Object.keys(req.body).length > 0) {
      fetchOptions.body = JSON.stringify(req.body);
    }

    const response = await fetch(targetUrl, fetchOptions);
    const contentType = response.headers.get("content-type");

    res.status(response.status);
    if (contentType) {
      res.setHeader("content-type", contentType);
    }

    if (contentType && contentType.includes("application/json")) {
      const data = await response.json();
      return res.json(data);
    } else {
      const text = await response.text();
      return res.send(text);
    }
  } catch (err: any) {
    console.error("Proxy error to Cloudflare Pages:", err);
    return res.status(502).json({ error: "无法连接到 Cloudflare Pages API", details: err.message });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*all', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`Unified Cloudflare Proxy configured to: ${PROD_API_ORIGIN}`);
  });
}

startServer();
