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

    const currentTodo = await context.env.DB.prepare(
      "SELECT id, completed, user_id FROM todos WHERE id = ?"
    ).bind(id).first();

    if (!currentTodo) return jsonResponse({ error: "便签不存在" }, 404);

    if (user.role !== 'admin' && user.userId !== currentTodo.user_id) {
      return jsonResponse({ error: "无权修改他人便签" }, 403);
    }

    const newCompleted = currentTodo.completed ? 0 : 1;

    const { success, error } = await context.env.DB.prepare(
      "UPDATE todos SET completed = ? WHERE id = ?"
    ).bind(newCompleted, id).run();

    if (!success) {
      return jsonResponse({ error: "更新失败", details: error }, 500);
    }

    const updatedTodo = await context.env.DB.prepare(`
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
    `).bind(id).first();

    return jsonResponse(updatedTodo || { 
      id, 
      is_completed: newCompleted,
      author_id: currentTodo.user_id 
    });
  } catch (err) {
    return jsonResponse({ error: String(err) }, 500);
  }
};
