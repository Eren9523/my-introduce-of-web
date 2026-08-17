import { hashPassword, hashPasswordWithSalt, createToken, jsonResponse } from "../_auth";

export interface Env {
  DB: any;
}

export const onRequestPost = async (context: { request: Request; env: Env }) => {
  try {
    const { username, password } = (await context.request.json()) as any;

    if (!username || !password) {
      return jsonResponse({ error: "请输入用户名和密码" }, 400);
    }

    // Query user by username
    const user = await context.env.DB.prepare(
      "SELECT id, username, password_hash, role FROM users WHERE username = ?"
    ).bind(username).first();

    if (!user) {
      return jsonResponse({ error: "用户名或密码错误" }, 401);
    }

    const standardHash = await hashPassword(password);
    const saltedHash = await hashPasswordWithSalt(password);

    // Verify hash against standard SHA-256, with fallback to legacy salted hash
    if (user.password_hash !== standardHash && user.password_hash !== saltedHash) {
      return jsonResponse({ error: "用户名或密码错误" }, 401);
    }

    const token = createToken(user);

    return jsonResponse({
      message: "登录成功",
      token,
      user: {
        userId: user.id,
        username: user.username,
        role: user.role || "user"
      }
    });

  } catch (err) {
    return jsonResponse({ error: String(err) }, 500);
  }
};
