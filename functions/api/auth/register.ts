import { hashPassword, createToken, jsonResponse } from "../_auth";

export interface Env {
  DB: any;
}

export const onRequestPost = async (context: { request: Request; env: Env }) => {
  try {
    const { username, password } = (await context.request.json()) as any;

    if (!username || !password) {
      return jsonResponse({ error: "请输入用户名和密码" }, 400);
    }

    if (username.length < 2 || password.length < 4) {
      return jsonResponse({ error: "用户名至少2个字符，密码至少4个字符" }, 400);
    }

    // Standard SHA-256 hash
    const passwordHash = await hashPassword(password);
    
    // Generate UUID
    const id = crypto.randomUUID();

    // Check if user exists
    const existing = await context.env.DB.prepare(
      "SELECT id FROM users WHERE username = ?"
    ).bind(username).first();

    if (existing) {
      return jsonResponse({ error: "该用户名已存在" }, 400);
    }

    // Insert user into D1
    const { success, error } = await context.env.DB.prepare(
      "INSERT INTO users (id, username, password_hash, role) VALUES (?, ?, ?, 'user')"
    ).bind(id, username, passwordHash).run();

    if (!success) {
      return jsonResponse({ error: "数据库写入失败", details: error }, 500);
    }

    const newUser = { id, username, role: "user" };
    const token = createToken(newUser);

    return jsonResponse({ 
      message: "注册成功", 
      token,
      user: {
        userId: id,
        username,
        role: "user"
      }
    });
  } catch (err) {
    return jsonResponse({ error: String(err) }, 500);
  }
};
