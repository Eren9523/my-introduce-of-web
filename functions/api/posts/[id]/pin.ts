import { getUserFromRequest, jsonResponse } from "../../_auth";

export interface Env {
  DB: any;
}

export const onRequestPut = async (context: { request: Request; env: Env; params: any }) => {
  try {
    const { id } = context.params;
    if (!id) return jsonResponse({ error: "Missing id" }, 400);

    const user = await getUserFromRequest(context.request, context.env.DB);
    if (!user) {
      return jsonResponse({ error: "未授权：请先登录" }, 401);
    }

    const post = await context.env.DB.prepare(
      "SELECT author_id, is_pinned FROM posts WHERE id = ?"
    ).bind(id).first();

    if (!post) {
      return jsonResponse({ error: "文章不存在" }, 404);
    }

    if (user.role !== 'admin' && user.userId !== post.author_id) {
      return jsonResponse({ error: "无权置顶他人文章" }, 403);
    }

    const reqBody = (await context.request.json().catch(() => ({}))) as any;
    const is_pinned = reqBody.is_pinned === 1 ? 1 : 0;

    const { success, error } = await context.env.DB.prepare(
      "UPDATE posts SET is_pinned = ? WHERE id = ?"
    ).bind(is_pinned, id).run();

    if (!success) {
      return jsonResponse({ error: "更新置顶状态失败", details: error }, 500);
    }

    // Return the updated post
    const updatedPost = await context.env.DB.prepare(`
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

    return jsonResponse(updatedPost || { id, is_pinned });
  } catch (err) {
    return jsonResponse({ error: String(err) }, 500);
  }
};
