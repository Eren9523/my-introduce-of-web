import { createToken, jsonResponse } from "../_auth";

export interface Env {
  DB: any;
}

export const onRequestPost = async (context: { request: Request; env: Env }) => {
  try {
    const id = crypto.randomUUID();
    const guestUsername = "guest_" + id.substring(0, 8);
    
    // Create a guest user
    const { success, error } = await context.env.DB.prepare(
      "INSERT INTO users (id, username, password_hash, role) VALUES (?, ?, ?, 'guest')"
    ).bind(id, guestUsername, "guest_hash").run();

    if (!success) {
      return jsonResponse({ error: "创建访客失败", details: error }, 500);
    }

    const guestUser = { id, username: guestUsername, role: "guest" };
    const token = createToken(guestUser);

    return jsonResponse({
      message: "访客登录成功",
      token,
      user: {
        userId: id,
        username: guestUsername,
        role: "guest"
      }
    });

  } catch (err) {
    return jsonResponse({ error: String(err) }, 500);
  }
};
