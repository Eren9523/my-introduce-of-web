import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Send, Bot, User, ArrowLeft, RefreshCw, Sparkles, MessageSquare, Lock, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface Message {
  role: 'user' | 'model';
  parts: { text: string }[];
}

export default function WebAgentChat() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [modelName, setModelName] = useState('deepseek-v4-pro');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authInput, setAuthInput] = useState('');
  const [authKey, setAuthKey] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const PROMPT_POOL = [
      "帮我生成一段朋友圈营销文案",
      "解释一下用大白话解释量子纠缠",
      "制定一份新手一周减脂健身计划",
      "帮我翻译这封商务开发邮件",
      "用 Python 写一个贪吃蛇小游戏",
      "今天有什么重要的国际新闻吗？",
      "有什么适合周末去的小众旅游目的地推荐？",
      "我是独游爱好者，推荐几部独立小游戏",
      "推荐几部豆瓣高分的悬疑电影",
      "如何向老板提出加薪的请求？",
      "请用鲁迅的语气写一篇关于现代人天天看手机的文章",
      "解释一下前端的虚拟 DOM 是怎么工作的",
      "帮我写一段快手带货直播的开场白",
      "帮我规划一下去日本京都的三天两夜行程",
      "怎么在面试中回答“你最大的缺点是什么”？",
      "帮我写一段闺蜜生日走心朋友圈文案",
      "用大白话解释什么是元宇宙",
      "制定一份办公室久坐人群拉伸计划",
      "帮我翻译一封英文求职邮件",
      "帮我写一段离职告别朋友圈文案",
      "今天有什么值得关注的科技新闻",
      "推荐几个适合露营的小众湖边营地",
      "我是猫奴，推荐几款治愈系独立游戏",
      "推荐几部豆瓣高分的科幻纪录片",
      "如何优雅地拒绝同事的不合理请求",
      "请用李白的语气写一篇关于加班的诗",
      "解释一下后端的微服务架构是什么",
      "帮我写一段抖音美妆带货开场白",
      "帮我规划一下去西安的两天一夜行程",
      "怎么在面试中回答\"你的职业规划是什么\"",
      "帮我生成一段小红书探店文案模板",
      "用大白话解释什么是人工智能大模型",
      "制定一份零基础学游泳的一周计划",
      "帮我翻译一段产品说明书成日语",
      "帮我写一段公司年会主持人开场白",
      "今天有什么重要的财经新闻",
      "推荐几个适合拍照的小众古镇",
      "我喜欢解谜，推荐几款烧脑独立游戏",
      "推荐几部豆瓣高分的治愈系电影",
      "如何向老板申请远程办公",
      "请用老舍的语气写一篇关于外卖的文章",
      "解释一下什么是区块链技术",
      "帮我写一段淘宝直播服装带货话术",
      "帮我规划一下去成都的三天两夜行程",
      "怎么在面试中回答\"为什么选择我们公司\"",
      "帮我写一段婚礼伴娘致辞",
      "用大白话解释什么是碳中和",
      "制定一份产后恢复的一个月健身计划",
      "帮我翻译一封商务邀请函成法语",
      "帮我写一段闺蜜婚礼祝福语",
      "今天有什么精彩的体育赛事",
      "推荐几个适合徒步的小众山林路线",
      "我喜欢剧情，推荐几款叙事类独立游戏",
      "推荐几部豆瓣高分的悬疑剧",
      "如何委婉地向客户催款",
      "请用苏轼的语气写一篇关于奶茶的词",
      "解释一下什么是云计算",
      "帮我写一段视频号农产品带货开场白",
      "帮我规划一下去杭州的两天一夜行程",
      "怎么在面试中回答\"你期望的薪资是多少\"",
      "帮我写一段升职感谢朋友圈文案",
      "用大白话解释什么是基因编辑",
      "制定一份考研英语单词背诵计划",
      "帮我翻译一封客户投诉邮件",
      "帮我写一段宝宝百天宴邀请函文案",
      "帮我写一段乔迁新居朋友圈文案",
      "用大白话解释什么是暗物质",
      "制定一份零基础学瑜伽的一周计划",
      "帮我翻译一封英文留学推荐信",
      "帮我写一段离职告别同事的话术",
      "今天有什么值得关注的娱乐新闻",
      "推荐几个适合自驾游的小众海岛",
      "我喜欢恐怖，推荐几款惊悚独立游戏",
      "推荐几部豆瓣高分的犯罪电影",
      "如何得体地向领导提离职",
      "请用鲁迅的语气写一篇关于内卷的文章",
      "解释一下什么是大数据技术",
      "帮我写一段抖音美食带货开场白",
      "帮我规划一下去大理的三天两夜行程",
      "怎么在面试中回答\"你为什么离开上一家公司\"",
      "帮我生成一段小红书护肤文案模板",
      "用大白话解释什么是引力波",
      "制定一份上班族一周减脂餐计划",
      "帮我翻译一段商务合同成韩语",
      "帮我写一段公司团建活动开场白",
      "今天有什么重要的国内新闻",
      "推荐几个适合亲子游的小众农场",
      "我喜欢策略，推荐几款战棋类独立游戏",
      "推荐几部豆瓣高分的自然纪录片",
      "如何应对职场中的不合理加班",
      "请用汪曾祺的语气写一篇关于火锅的文章",
      "解释一下什么是5G技术",
      "帮我写一段拼多多家居带货话术",
      "帮我规划一下去厦门的两天一夜行程",
      "怎么在面试中回答\"你能给我们带来什么\"",
      "帮我写一段宝宝满月宴邀请函",
      "用大白话解释什么是碳达峰",
      "制定一份一个月硬笔书法练习计划",
      "帮我翻译一封英文商务感谢信",
      "帮我写一段结婚周年纪念日文案",
      "今天有什么热门的社会话题",
      "推荐几个适合看星空的小众山顶",
      "我喜欢像素风，推荐几款复古独立游戏",
      "推荐几部豆瓣高分的英剧",
      "如何委婉地拒绝别人的借钱请求",
      "请用张爱玲的语气写一篇关于失恋的短文",
      "解释一下什么是机器学习",
      "帮我写一段视频号珠宝带货开场白",
      "帮我规划一下去苏州的两天一夜行程",
      "怎么在面试中回答\"你如何处理工作压力\"",
      "帮我写一段给老师的教师节感谢信",
      "用大白话解释什么是NFT",
      "制定一份大学英语四级备考计划",
      "帮我翻译一封英文客户询价邮件",
      "帮我写一段公司年会获奖感言"
    ];
    const shuffled = [...PROMPT_POOL].sort(() => 0.5 - Math.random());
    setSuggestions(shuffled.slice(0, 4));
  }, []);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessageCount = messages.filter(m => m.role === 'user').length;
    if (userMessageCount >= 3 && !authKey) {
      setShowAuthModal(true);
      return;
    }

    const userMessage = input.trim();
    setInput('');
    setError(null);

    const newUserMessage: Message = {
      role: 'user',
      parts: [{ text: userMessage }]
    };

    setMessages(prev => [...prev, newUserMessage]);
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage,
          history: messages,
          authKey,
          model: modelName
        }),
      });

      if (!response.ok) {
        const errorData = await response.json() as any;
        if (errorData.needsAuth) {
          setShowAuthModal(true);
          // 撤回刚添加的 userMessage，因为后端拒绝了
          setMessages(prev => prev.slice(0, -1));
          throw new Error('需要授权码才能继续使用');
        }
        throw new Error(errorData.error || '发送失败');
      }

      const data = await response.json() as any;
      const modelMessage: Message = {
        role: 'model',
        parts: [{ text: data.text }]
      };

      setMessages(prev => [...prev, modelMessage]);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const verifyAuthCode = async () => {
    if (!authInput.trim()) return;
    setIsVerifying(true);
    setAuthError(null);
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ verifyKey: authInput.trim() }),
      });
      if (!response.ok) {
        const errorData = await response.json() as any;
        throw new Error(errorData.error || '验证失败');
      }
      setAuthKey(authInput.trim());
      setShowAuthModal(false);
      setAuthInput('');
    } catch (err: any) {
      setAuthError(err.message);
    } finally {
      setIsVerifying(false);
    }
  };

  const resetChat = () => {
    setMessages([]);
    setError(null);
  };

  return (
    <div className="flex flex-col h-screen bg-slate-50 font-sans">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-100">
              <Bot className="w-6 h-6" />
            </div>
            <div>
              <h1 className="font-bold text-slate-900">Web Agent</h1>
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                <span className="text-xs text-slate-500 font-medium">在线 | AI 助手</span>
              </div>
            </div>
          </div>
        </div>
        <button 
          onClick={resetChat}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors border border-slate-200"
        >
          <RefreshCw className="w-4 h-4" />
          <span>清除记录</span>
        </button>
      </header>

      {/* Messages */}
      <main className="flex-1 overflow-y-auto p-6 space-y-6">
        <div className="max-w-3xl mx-auto space-y-6 pb-12">
          {messages.length === 0 && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center justify-center py-20 text-center space-y-4"
            >
              <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center text-indigo-500 mb-2">
                <Sparkles className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900">你好！我是您的 Web Agent</h2>
              <p className="text-slate-500 max-w-sm">
                我可以协助您完成信息查询、文案创作、代码编写及多种自动化任务。
              </p>
              <div className="grid grid-cols-2 gap-3 w-full max-w-md pt-4">
                {suggestions.map(suggestion => (
                  <button 
                    key={suggestion}
                    onClick={() => {
                      setInput(suggestion);
                    }}
                    className="p-3 text-sm text-left bg-white border border-slate-200 rounded-xl hover:border-indigo-300 hover:text-indigo-600 transition-all text-slate-600 shadow-sm"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          <AnimatePresence initial={false}>
            {messages.map((msg, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
              >
                <div className={`w-8 h-8 shrink-0 rounded-lg flex items-center justify-center shadow-sm ${
                  msg.role === 'user' ? 'bg-white text-slate-600' : 'bg-indigo-600 text-white'
                }`}>
                  {msg.role === 'user' ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
                </div>
                <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm shadow-sm ${
                  msg.role === 'user' 
                    ? 'bg-indigo-600 text-white rounded-tr-none' 
                    : 'bg-white text-slate-800 rounded-tl-none border border-slate-100'
                }`}>
                  {msg.role === 'user' ? (
                    <p className="whitespace-pre-wrap leading-relaxed">{msg.parts[0].text}</p>
                  ) : (
                    <div className="prose prose-sm prose-slate max-w-none">
                      <Markdown remarkPlugins={[remarkGfm]}>{msg.parts[0].text}</Markdown>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {isLoading && (
            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-sm">
                <Bot className="w-5 h-5" />
              </div>
              <div className="bg-white border border-slate-100 rounded-2xl rounded-tl-none px-4 py-3 shadow-sm">
                <div className="flex gap-1">
                  <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" />
                  <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
                  <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-red-500" />
              {error}
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </main>

      {/* Auth Modal */}
      <AnimatePresence>
        {showAuthModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-slate-900/40 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-sm bg-white rounded-3xl shadow-xl overflow-hidden relative"
            >
              <div className="p-6">
                <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mb-6">
                  <Lock className="w-6 h-6" />
                </div>
                
                <h3 className="text-lg font-bold text-slate-900 mb-2">
                  您的体验次数已结束，如需申请授权码请联系管理者
                </h3>
                
                <div className="mt-6 space-y-4">
                  <input
                    type="password"
                    value={authInput}
                    onChange={(e) => setAuthInput(e.target.value)}
                    placeholder="输入授权码..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-mono"
                    onKeyDown={(e) => e.key === 'Enter' && verifyAuthCode()}
                  />
                  {authError && (
                    <p className="text-red-500 text-sm font-medium">{authError}</p>
                  )}
                  <div className="flex gap-3">
                    <button
                      onClick={() => setShowAuthModal(false)}
                      className="flex-1 px-4 py-3 bg-slate-100 text-slate-600 font-medium rounded-xl hover:bg-slate-200 transition-colors"
                    >
                      取消
                    </button>
                    <button
                      onClick={verifyAuthCode}
                      disabled={isVerifying || !authInput.trim()}
                      className="flex-1 px-4 py-3 bg-indigo-600 text-white font-medium rounded-xl hover:bg-indigo-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
                    >
                      {isVerifying ? (
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        "确认"
                      )}
                    </button>
                  </div>
                </div>

                <p className="mt-6 text-center text-xs text-slate-400 font-medium tracking-wide">
                  保护钱包人人有责~
                </p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Input */}
      <footer className="p-6 bg-white border-t border-slate-200">
        <div className="max-w-3xl mx-auto flex gap-3">
          <div className="flex-1 relative">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="问点什么..."
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all resize-none h-[52px] max-h-32"
              rows={1}
            />
            <div className="absolute right-3 top-3 text-slate-300">
              <MessageSquare className="w-5 h-5" />
            </div>
          </div>
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="w-12 h-[52px] bg-indigo-600 text-white rounded-2xl flex items-center justify-center hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-indigo-100 active:scale-95"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
        <p className="text-center text-[10px] text-slate-400 mt-4 font-medium uppercase tracking-wider">
          Powered by {modelName}
        </p>
      </footer>
    </div>
  );
}
