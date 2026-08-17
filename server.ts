import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";

const app = express();
const PORT = 3000;

// Production Cloudflare Pages URL for unified D1 data source
const PROD_API_ORIGIN = process.env.CLOUDFLARE_API_URL || "https://eren9523.fun";

app.use(express.json());

// Handle AI Chat endpoint locally or with key fallback
async function handleChat(req: express.Request, res: express.Response) {
  try {
    const { message, history, verifyKey, authKey, model } = req.body;
    const validKey = process.env.WEB_AGENT_KEY || "888888";

    if (verifyKey !== undefined) {
      if (verifyKey === validKey) {
        return res.json({ success: true });
      } else {
        return res.status(401).json({ error: "授权码错误" });
      }
    }

    const userMessageCount = (history || []).filter((m: any) => m.role === 'user').length;
    if (userMessageCount >= 3 && authKey !== validKey) {
      return res.status(403).json({ error: "您的体验次数已结束，如需申请授权码请联系管理者", needsAuth: true });
    }

    const deepseekApiKey = process.env.DEEPSEEK_API_KEY;
    if (!deepseekApiKey) {
      return res.status(500).json({ error: "云端未配置 DEEPSEEK_API_KEY" });
    }

    const messages = (history || []).map((msg: any) => ({
      role: msg.role === 'model' ? 'assistant' : msg.role,
      content: msg.parts?.[0]?.text || ''
    }));

    messages.push({ role: 'user', content: message });
    messages.unshift({ 
      role: 'system', 
      content: "You are a helpful AI assistant. Be concise and friendly." 
    });

    const deepseekResponse = await fetch("https://api.deepseek.com/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${deepseekApiKey}`
      },
      body: JSON.stringify({
        model: model || "deepseek-v4-pro",
        messages: messages,
        temperature: 0.7
      })
    });

    if (!deepseekResponse.ok) {
      const errorData = await deepseekResponse.json().catch(() => ({})) as any;
      throw new Error(errorData.error?.message || `DeepSeek API 请求失败 (${deepseekResponse.status})`);
    }

    const data = await deepseekResponse.json() as any;
    const replyText = data.choices?.[0]?.message?.content || "";

    res.json({ text: replyText });
  } catch (error: any) {
    console.error("Chat error:", error);
    res.status(500).json({ error: error.message || "Internal server error" });
  }
}

// Proxy all other /api calls to Cloudflare Pages API (connecting directly to D1)
app.use("/api", async (req, res) => {
  if (req.path === "/chat") {
    return handleChat(req, res);
  }

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
    console.log(`Unified D1 Proxy configured to: ${PROD_API_ORIGIN}`);
  });
}

startServer();
