import { getUserFromRequest, jsonResponse } from "../_auth";

export interface Env {
  DB: any;
}

export const onRequestGet = async (context: { env: Env }) => {
  try {
    const { results } = await context.env.DB.prepare(`
      SELECT 
        p.id, 
        p.author_id, 
        p.title, 
        p.content, 
        p.created_at, 
        COALESCE(p.is_pinned, 0) as is_pinned, 
        u.username, 
        COALESCE(u.role, 'user') as authorRole 
      FROM posts p 
      LEFT JOIN users u ON p.author_id = u.id 
      ORDER BY COALESCE(p.is_pinned, 0) DESC, p.created_at DESC
    `).all();

    return jsonResponse(results || []);
  } catch (err: any) {
    // If is_pinned column is missing in legacy schema
    if (err.message && err.message.includes('is_pinned')) {
      try {
        const { results } = await context.env.DB.prepare(`
          SELECT 
            p.id, 
            p.author_id, 
            p.title, 
            p.content, 
            p.created_at, 
            0 as is_pinned, 
            u.username, 
            COALESCE(u.role, 'user') as authorRole 
          FROM posts p 
          LEFT JOIN users u ON p.author_id = u.id 
          ORDER BY p.created_at DESC
        `).all();
        return jsonResponse(results || []);
      } catch (innerErr) {
        return jsonResponse({ error: String(innerErr) }, 500);
      }
    }
    return jsonResponse({ error: String(err) }, 500);
  }
};

export const onRequestPost = async (context: { request: Request; env: Env }) => {
  try {
    const user = await getUserFromRequest(context.request, context.env.DB);
    if (!user) {
      return jsonResponse({ error: "未授权：请先登录后再发表" }, 401);
    }

    const reqBody = (await context.request.json()) as any;
    const { title, content } = reqBody;

    if (!content || !content.trim()) {
      return jsonResponse({ error: "内容不能为空" }, 400);
    }

    const { success, error, meta } = await context.env.DB.prepare(
      "INSERT INTO posts (author_id, title, content, is_pinned, created_at) VALUES (?, ?, ?, 0, datetime('now'))"
    ).bind(user.userId, title || '', content.trim()).run();

    if (!success) {
      return jsonResponse({ error: "数据库写入失败", details: error }, 500);
    }

    const insertId = meta?.last_row_id;
    
    // Query the newly created post with author info
    const newPost = await context.env.DB.prepare(`
      SELECT 
        p.id, 
        p.author_id, 
        p.title, 
        p.content, 
        p.created_at, 
        COALESCE(p.is_pinned, 0) as is_pinned, 
        u.username, 
        COALESCE(u.role, 'user') as authorRole 
      FROM posts p 
      LEFT JOIN users u ON p.author_id = u.id 
      WHERE p.id = ?
    `).bind(insertId).first();

    return jsonResponse(newPost || { 
      id: insertId, 
      author_id: user.userId, 
      title: title || '', 
      content: content.trim(), 
      is_pinned: 0, 
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
