import { getUserFromRequest, jsonResponse } from "../_auth";

export interface Env {
  DB: any;
}

export const onRequestGet = async (context: { request: Request; env: Env }) => {
  try {
    const url = new URL(context.request.url);
    const postId = url.searchParams.get("post_id");

    let query = `
      SELECT 
        c.id, 
        c.post_id, 
        c.author_id, 
        c.content, 
        c.created_at, 
        c.parent_id, 
        u.username, 
        COALESCE(u.role, 'user') as authorRole 
      FROM log_comments c 
      LEFT JOIN users u ON c.author_id = u.id
    `;
    const params: any[] = [];

    if (postId) {
      query += ` WHERE c.post_id = ?`;
      params.push(postId);
    }
    
    query += ` ORDER BY c.created_at ASC`;

    const { results } = await context.env.DB.prepare(query).bind(...params).all();
    return jsonResponse(results || []);
  } catch (err) {
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
    const { post_id, content, parent_id } = reqBody;

    if (!post_id || !content || !content.trim()) {
      return jsonResponse({ error: "评论内容与对应文章不能为空" }, 400);
    }

    const { success, error, meta } = await context.env.DB.prepare(
      "INSERT INTO log_comments (post_id, author_id, content, parent_id, created_at) VALUES (?, ?, ?, ?, datetime('now'))"
    ).bind(post_id, user.userId, content.trim(), parent_id || null).run();

    if (!success) {
      return jsonResponse({ error: "评论发表失败", details: error }, 500);
    }

    const insertId = meta?.last_row_id;
    
    // Fetch newly created comment
    const newComment = await context.env.DB.prepare(`
      SELECT 
        c.id, 
        c.post_id, 
        c.author_id, 
        c.content, 
        c.created_at, 
        c.parent_id, 
        u.username, 
        COALESCE(u.role, 'user') as authorRole 
      FROM log_comments c 
      LEFT JOIN users u ON c.author_id = u.id 
      WHERE c.id = ?
    `).bind(insertId).first();

    return jsonResponse(newComment || { 
      id: insertId, 
      post_id, 
      author_id: user.userId, 
      content: content.trim(), 
      parent_id: parent_id || null, 
      created_at: new Date().toISOString(),
      username: user.username,
      authorRole: user.role 
    });
  } catch (err: any) {
    if (err.message && err.message.includes('FOREIGN KEY constraint failed')) {
      return jsonResponse({ error: "由于外键约束（用户失效或相关帖子被删），保存失败。请重新登录。" }, 401);
    }
    return jsonResponse({ error: String(err) }, 500);
  }
};
