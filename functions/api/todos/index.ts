import { getUserFromRequest, jsonResponse } from "../_auth";

export interface Env {
  DB: any;
}

export const onRequestGet = async (context: { env: Env }) => {
  try {
    const { results } = await context.env.DB.prepare(`
      SELECT 
        t.id, 
        t.user_id as author_id, 
        t.title as content, 
        t.completed as is_completed, 
        t.created_at, 
        u.username, 
        COALESCE(u.role, 'user') as authorRole 
      FROM todos t 
      LEFT JOIN users u ON t.user_id = u.id 
      ORDER BY t.created_at DESC
    `).all();

    return jsonResponse(results || []);
  } catch (err: any) {
    return jsonResponse({ error: String(err) }, 500);
  }
};

export const onRequestPost = async (context: { request: Request; env: Env }) => {
  try {
    const user = await getUserFromRequest(context.request, context.env.DB);
    if (!user) {
      return jsonResponse({ error: "未授权：请先登录" }, 401);
    }

    const reqBody = (await context.request.json()) as any;
    const content = reqBody.content || reqBody.title;

    if (!content || !content.trim()) {
      return jsonResponse({ error: "便签内容不能为空" }, 400);
    }

    const { success, error, meta } = await context.env.DB.prepare(
      "INSERT INTO todos (user_id, title, completed, created_at) VALUES (?, ?, 0, datetime('now'))"
    ).bind(user.userId, content.trim()).run();

    if (!success) {
      return jsonResponse({ error: "数据库写入失败", details: error }, 500);
    }

    const insertId = meta?.last_row_id;

    const newTodo = await context.env.DB.prepare(`
      SELECT 
        t.id, 
        t.user_id as author_id, 
        t.title as content, 
        t.completed as is_completed, 
        t.created_at, 
        u.username, 
        COALESCE(u.role, 'user') as authorRole 
      FROM todos t 
      LEFT JOIN users u ON t.user_id = u.id 
      WHERE t.id = ?
    `).bind(insertId).first();

    return jsonResponse(newTodo || { 
      id: insertId, 
      author_id: user.userId, 
      content: content.trim(), 
      is_completed: 0, 
      created_at: new Date().toISOString(),
      username: user.username,
      authorRole: user.role
    });
  } catch (err: any) {
    if (err.message && err.message.includes('FOREIGN KEY constraint failed')) {
      return jsonResponse({ error: "用户不存在或失效，请重新登录" }, 401);
    }
    return jsonResponse({ error: String(err) }, 500);
  }
};
