export async function onRequestPost(context: any) {
  // context 包含 request (前端发来的请求) 和 env (云端配置的环境变量)
  const { request, env } = context;

  try {
    // 1. 获取前端传来的 JSON 数据 (保持 WebAgent.tsx 完全不变)
    const body = await request.json();
    const { message, history, verifyKey, authKey } = body;

    const validKey = env.WEB_AGENT_KEY || "888888";

    if (verifyKey !== undefined) {
      if (verifyKey === validKey) {
        return new Response(JSON.stringify({ success: true }), {
          status: 200,
          headers: { "Content-Type": "application/json" }
        });
      } else {
        return new Response(JSON.stringify({ error: "授权码错误" }), {
          status: 401,
          headers: { "Content-Type": "application/json" }
        });
      }
    }

    const userMessageCount = (history || []).filter((m: any) => m.role === 'user').length;
    if (userMessageCount >= 3 && authKey !== validKey) {
      return new Response(JSON.stringify({ error: "您的体验次数已结束，如需申请授权码请联系管理者", needsAuth: true }), {
        status: 403,
        headers: { "Content-Type": "application/json" }
      });
    }

    // 2. 检查 DeepSeek 密钥是否配置
    if (!env.DEEPSEEK_API_KEY) {
      return new Response(JSON.stringify({ error: "云端未配置 DEEPSEEK_API_KEY" }), {
        status: 500,
        headers: { "Content-Type": "application/json" }
      });
    }

    // 3. 数据格式翻译 (核心逻辑)
    // 将前端的 Gemini 格式翻译成 DeepSeek (OpenAI 标准) 格式
    const messages = (history || []).map((msg: any) => ({
      role: msg.role === 'model' ? 'assistant' : msg.role,
      content: msg.parts[0].text
    }));

    // 把当前用户的新消息加到数组最后
    messages.push({ role: 'user', content: message });

    // 可以在最前面插入一个系统提示词，给你的 AI 定基调
    messages.unshift({ 
      role: 'system', 
      content: "You are a helpful AI assistant. Be concise and friendly." 
    });

    // 4. 发送请求给 DeepSeek 官方接口
    const deepseekResponse = await fetch("https://api.deepseek.com/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${env.DEEPSEEK_API_KEY}`
      },
      body: JSON.stringify({
        model: body.model || "deepseek-v4-pro", // 这里的 model 字段是你要调用的模型名称
        messages: messages,
        temperature: 0.7
      })
    });

    // 5. 错误捕获
    if (!deepseekResponse.ok) {
       const errorData = await deepseekResponse.json() as any;
       throw new Error(errorData.error?.message || "DeepSeek API 请求失败");
    }

    // 6. 解析 DeepSeek 的返回结果
    const data = await deepseekResponse.json() as any;
    // DeepSeek 返回的文本藏在 choices[0].message.content 里
    const replyText = data.choices[0].message.content;

    // 7. 按照前端期待的格式原样返回
    return new Response(JSON.stringify({ text: replyText }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });

  } catch (error: any) {
    // 捕获异常并返回标准格式
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
