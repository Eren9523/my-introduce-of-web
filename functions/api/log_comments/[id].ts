import { getUserFromRequest, jsonResponse } from "../_auth";

export interface Env {
  DB: any;
}

export const onRequestDelete = async (context: { request: Request; env: Env; params: any }) => {
  try {
    const { id } = context.params;
    if (!id) return jsonResponse({ error: "Missing id" }, 400);

    const user = await getUserFromRequest(context.request, context.env.DB);
    if (!user) {
      return jsonResponse({ error: "未授权：请先登录" }, 401);
    }

    const comment = await context.env.DB.prepare(
      "SELECT author_id FROM log_comments WHERE id = ?"
    ).bind(id).first();

    if (!comment) {
      return jsonResponse({ error: "评论不存在" }, 404);
    }

    if (user.role !== 'admin' && user.userId !== comment.author_id) {
      return jsonResponse({ error: "无权删除他人评论" }, 403);
    }

    // Delete sub-comments/replies if any
    try {
      await context.env.DB.prepare("DELETE FROM log_comments WHERE parent_id = ?").bind(id).run();
    } catch (e) {}

    const { success, error } = await context.env.DB.prepare(
      "DELETE FROM log_comments WHERE id = ?"
    ).bind(id).run();

    if (!success) {
      return jsonResponse({ error: "删除失败", details: error }, 500);
    }

    return jsonResponse({ success: true, message: "Deleted" });
  } catch (err) {
    return jsonResponse({ error: String(err) }, 500);
  }
};
