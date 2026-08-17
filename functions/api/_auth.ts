// functions/api/_auth.ts

export async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
}

export async function hashPasswordWithSalt(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + "salt");
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
}

export function createToken(user: { id: string; username: string; role: string }): string {
  const header = btoa(JSON.stringify({ alg: "HS256", typ: "JWT" }))
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
  const payload = btoa(JSON.stringify({
    userId: user.id,
    username: user.username,
    role: user.role,
    iat: Math.floor(Date.now() / 1000)
  }))
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
  return `${header}.${payload}.cf_sig`;
}

export async function getUserFromRequest(
  request: Request,
  db: any
): Promise<{ userId: string; username: string; role: string } | null> {
  const authHeader = request.headers.get("Authorization");
  if (!authHeader) return null;

  let userId: string | null = null;
  const token = authHeader.replace(/^Bearer\s+/i, "").trim();

  if (token.startsWith("cf-token-")) {
    userId = token.replace("cf-token-", "");
  } else if (token.includes(".")) {
    try {
      const parts = token.split(".");
      if (parts.length >= 2) {
        let base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
        while (base64.length % 4) base64 += "=";
        const decoded = JSON.parse(atob(base64));
        if (decoded && decoded.userId) {
          userId = decoded.userId;
        }
      }
    } catch (e) {
      // Ignored
    }
  }

  if (!userId) return null;

  try {
    const user = await db
      .prepare("SELECT id, username, role FROM users WHERE id = ?")
      .bind(userId)
      .first();
    if (user) {
      return {
        userId: user.id,
        username: user.username,
        role: user.role || "user"
      };
    }
  } catch (e) {
    console.error("DB error in getUserFromRequest:", e);
  }

  return null;
}

export const jsonResponse = (data: any, status = 200) => {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization"
    }
  });
};
