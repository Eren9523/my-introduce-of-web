import { getUserFromRequest, jsonResponse } from "../_auth";

export interface Env {
  DB: any;
}

export const onRequestGet = async (context: { request: Request; env: Env; params: any }) => {
  try {
    const { id } = context.params;
    if (!id) return jsonResponse({ error: "Missing id" }, 400);

    const post = await context.env.DB.prepare(`
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
    `).bind(id).first();

    if (!post) return jsonResponse({ error: "Not found" }, 404);

    const { results: comments } = await context.env.DB.prepare(`
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
      WHERE c.post_id = ? 
      ORDER BY c.created_at ASC
    `).bind(id).all();

    return jsonResponse({ ...post, comments: comments || [] });
  } catch (err) {
    return jsonResponse({ error: String(err) }, 500);
  }
};

export const onRequestDelete = async (context: { request: Request; env: Env; params: any }) => {
  try {
    const { id } = context.params;
    if (!id) return jsonResponse({ error: "Missing id" }, 400);

    const user = await getUserFromRequest(context.request, context.env.DB);
    if (!user) {
      return jsonResponse({ error: "未授权：请先登录" }, 401);
    }

    const post = await context.env.DB.prepare(
      "SELECT author_id FROM posts WHERE id = ?"
    ).bind(id).first();

    if (!post) {
      return jsonResponse({ error: "文章不存在" }, 404);
    }

    if (user.role !== 'admin' && user.userId !== post.author_id) {
      return jsonResponse({ error: "无权删除他人文章" }, 403);
    }

    // Delete associated comments
    try {
      await context.env.DB.prepare("DELETE FROM log_comments WHERE post_id = ?").bind(id).run();
    } catch (e) {}

    const { success, error } = await context.env.DB.prepare(
      "DELETE FROM posts WHERE id = ?"
    ).bind(id).run();

    if (!success) {
      return jsonResponse({ error: "删除失败", details: error }, 500);
    }

    return jsonResponse({ success: true, message: "Deleted" });
  } catch (err) {
    return jsonResponse({ error: String(err) }, 500);
  }
};
