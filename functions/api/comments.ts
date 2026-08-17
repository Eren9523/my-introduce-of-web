export interface Env {
  DB: any;
}

export const onRequestGet = async (context: { env: Env }) => {
  try {
    const { results } = await context.env.DB.prepare(
      "SELECT id, author, content, parent_id, created_at FROM comments ORDER BY created_at DESC"
    ).all();
    return Response.json(results || []);
  } catch (err: any) {
    return Response.json({ error: String(err) }, { status: 500 });
  }
};

export const onRequestPost = async (context: { request: Request; env: Env }) => {
  try {
    const reqBody = (await context.request.json()) as any;
    const { author, content, parent_id } = reqBody;
    
    if (!author || !content) {
      return Response.json({ error: "昵称与内容不能为空" }, { status: 400 });
    }

    const { meta, success, error } = await context.env.DB.prepare(
      "INSERT INTO comments (content, author, created_at, parent_id) VALUES (?, ?, datetime('now'), ?)"
    ).bind(content.trim(), author.trim(), parent_id || null).run();
    
    if (!success) {
      return Response.json({ error: "留言保存失败", details: error }, { status: 500 });
    }
    
    return Response.json({ success: true, id: meta?.last_row_id });
  } catch (err: any) {
    return Response.json({ error: String(err) }, { status: 500 });
  }
};

export const onRequestDelete = async (context: { request: Request; env: Env }) => {
  try {
    const url = new URL(context.request.url);
    const id = url.searchParams.get('id');
    if (!id) {
      return Response.json({ error: "Missing comment id" }, { status: 400 });
    }
    
    await context.env.DB.prepare("DELETE FROM comments WHERE id = ? OR parent_id = ?").bind(id, id).run();
    return Response.json({ success: true });
  } catch (err: any) {
    return Response.json({ error: String(err) }, { status: 500 });
  }
};
