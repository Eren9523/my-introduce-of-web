import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { formatDistanceToNow, format } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { 
  Gamepad2, 
  Users, 
  Newspaper, 
  MessageSquare, 
  ArrowLeft, 
  Plus, 
  ExternalLink, 
  Globe, 
  Headphones,
  CheckCircle2,
  Send,
  Trash2,
  Reply,
  Swords,
  Target,
  Box,
  Heart,
  Coffee,
  Sparkles
} from 'lucide-react';
import { Link } from 'react-router-dom';

const PLATFORMS = [
  { name: 'Steam', icon: 'https://api.iconify.design/simple-icons:steam.svg?color=%231b2838', url: 'https://store.steampowered.com/' },
  { name: 'PlayStation', icon: 'https://api.iconify.design/simple-icons:playstation.svg?color=%23003745', url: 'https://www.playstation.com/' },
  { name: 'Nintendo', icon: 'https://api.iconify.design/simple-icons:nintendoswitch.svg?color=%23e60012', url: 'https://www.nintendo.com/' },
  { name: 'Xbox', icon: 'https://api.iconify.design/simple-icons:xbox.svg?color=%23107c10', url: 'https://www.xbox.com/' }
];

const SOCIAL_INFOS = [
  { name: '邱鹏 (Owner)', bio: '深度游戏迷 / 平台开发者 / 游戏摄影师', steam: 'Eren9523', psn: 'Eren9523', switch: '0401-4279-6811', color: 'indigo', verified: true },
  { name: '刘程旭', bio: '守望先锋500强玩家，英雄不朽！独游、恐怖游戏、小众游戏爱好者。', steam: 'Chengxu_Sang', psn: 'CX_Liu_99', switch: '2548-7319-4802', color: 'green', verified: false },
  { name: '张任云飞', bio: '三角洲行动粑粑宗弟子，机密绝密KD3.5~，”飞溅的粑~   到！！！！！！“', steam: 'ChiChi', psn: 'ChiChi_Zero', switch: '6193-8402-5716', color: 'purple', verified: false }
];

const NEWS_SITES = [
  { name: '游民星空', url: 'https://www.gamersky.com/', desc: 'GameSky - 领先门户', icon: 'https://www.gamersky.com/favicon.ico' },
  { name: '3DM游戏网', url: 'https://www.3dmgame.com/', desc: '3DM - 汉化圣地', icon: 'https://www.3dmgame.com/favicon.ico' },
  { name: '游侠网', url: 'https://www.ali213.net/', desc: 'Ali213 - 资深平台', icon: 'https://www.ali213.net/favicon.ico' },
  { name: '小黑盒', url: 'https://www.xiaoheihe.cn/', desc: 'HeyBox - 核心玩家', icon: 'https://www.xiaoheihe.cn/favicon.ico' }
];

interface Comment {
  id: string | number;
  author: string;
  content: string;
  created_at: number;
}

interface Message {
  id: string | number;
  author: string;
  content: string;
  created_at: number;
  comments: Comment[];
}



export default function GamePlatform() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newName, setNewName] = useState('');
  const [newContent, setNewContent] = useState('');
  const [replyTarget, setReplyTarget] = useState<string | number | null>(null);
  const [replyName, setReplyName] = useState('');
  const [replyContent, setReplyContent] = useState('');

  // Update timestamps every minute
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 60000);
    return () => clearInterval(timer);
  }, []);

  const renderTime = (utcTimeString: string | number) => {
    if (!utcTimeString) return "";
    let dateJson: Date;
    if (typeof utcTimeString === 'number' || !String(utcTimeString).includes(' ')) {
       // fallback for old millisecond timestamps
       dateJson = new Date(Number(utcTimeString) > 10000000000 ? Number(utcTimeString) : utcTimeString);
    } else {
      const isoString = String(utcTimeString).replace(" ", "T") + "Z";
      dateJson = new Date(isoString);
    }
    
    if (isNaN(dateJson.getTime())) return "";

    return dateJson.toLocaleString("zh-CN", {
      timeZone: "Asia/Shanghai",
      hour12: false,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit"
    });
  };

  const fetchComments = async () => {
    try {
      const res = await fetch('/api/comments');
      if (!res.ok) throw new Error('API failed');
      const text = await res.text();
      if (text.startsWith('<')) throw new Error('HTML fallback returned');
      
      const data = JSON.parse(text);
      if (!Array.isArray(data)) {
         setMessages([]);
      } else {
         const topLevel = data.filter((d: any) => !d.parent_id);
         const comments = data.filter((d: any) => d.parent_id);

         const combined: Message[] = topLevel.map((msg: any) => {
           const msgComments = comments.filter((c: any) => {
             const parentIdStr = String(c.parent_id).replace(/\.0$/, '');
             const msgIdStr = String(msg.id).replace(/\.0$/, '');
             return parentIdStr === msgIdStr;
           });
           msgComments.sort((a, b) => {
             const getMs = (val: any) => {
               if (!val) return 0;
               if (typeof val === 'number') return val;
               const str = String(val);
               if (str.includes(' ')) return new Date(str.replace(' ', 'T') + 'Z').getTime();
               return new Date(str).getTime() || Number(str);
             };
             return getMs(a.created_at) - getMs(b.created_at);
           });
           return { ...msg, comments: msgComments } as Message;
         });
         setMessages(combined);
      }
    } catch (err) {
      console.warn('API fetch failed:', err);
      // Let it be empty if API fails
    }
  };

  useEffect(() => {
    fetchComments();
  }, []);

  const handlePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newContent.trim()) return;
    
    const newMsg: Message = {
      id: crypto.randomUUID(),
      author: newName,
      content: newContent,
      created_at: Date.now(),
      comments: []
    };

    try {
      const res = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ author: newName, content: newContent })
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(`POST failed: ${text}`);
      }
      const d = await res.json() as any;
      if (d.id) newMsg.id = d.id;
      
      // Fetch fresh data
      await fetchComments();
      setNewName('');
      setNewContent('');
    } catch (err) {
      console.error(err);
      alert('留言失败，请重试');
    }
  };

  const handleDelete = async (id: string | number) => {
    try {
      await fetch(`/api/comments?id=${id}`, { method: 'DELETE' });
      await fetchComments();
    } catch (err) {
      console.error(err);
    }
  };

  const handleReply = async (msgId: string | number) => {
    if (!replyName.trim() || !replyContent.trim()) return;
    
    const newComment: Comment = {
      id: crypto.randomUUID(),
      author: replyName,
      content: replyContent,
      created_at: Date.now()
    };

    try {
      const res = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ author: replyName, content: replyContent, parent_id: msgId })
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(`POST failed: ${text}`);
      }
      const d = await res.json() as any;
      
      await fetchComments();
      setReplyTarget(null);
      setReplyName('');
      setReplyContent('');
    } catch (err) {
      console.error(err);
      alert('回复失败，请重试');
    }
  };

  const handleDeleteComment = async (msgId: string | number, commentId: string | number) => {
    try {
      await fetch(`/api/comments?id=${commentId}`, { method: 'DELETE' });
      await fetchComments();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-[#fcfdfe] text-slate-900 font-sans selection:bg-cyan-100/50 overflow-x-hidden">
      {/* Sci-fi Background Elements */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#e5e7eb_1px,transparent_1px),linear-gradient(to_bottom,#e5e7eb_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-20" />
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-cyan-200/20 blur-[100px] rounded-full" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-indigo-200/20 blur-[100px] rounded-full" />
      </div>

      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 bg-white/60 backdrop-blur-xl border-b border-slate-200/50">
        <div className="container mx-auto px-6 h-20 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-slate-600 font-bold hover:text-indigo-600 transition-all hover:-translate-x-1">
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">返回主页</span>
          </Link>
          <div className="flex items-center gap-3">
            <div className="relative group">
              <div className="absolute inset-0 bg-cyan-400 blur-lg rounded-full opacity-0 group-hover:opacity-40 transition-opacity" />
              <Gamepad2 className="w-8 h-8 text-cyan-600 relative z-10" />
            </div>
            <span className="font-black text-2xl tracking-tighter text-slate-900">THE 9TH SPACE.</span>
          </div>
          <div className="hidden lg:flex gap-8 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
            <a href="#social" className="hover:text-cyan-600 transition-colors">Digital Identity</a>
            <a href="#news" className="hover:text-cyan-600 transition-colors">Information Hub</a>
            <a href="#board" className="hover:text-cyan-600 transition-colors">Timeline</a>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-48 pb-32">
        <div className="container mx-auto px-6 max-w-6xl text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-50 border border-cyan-100 text-[10px] font-black text-cyan-700 mb-8 uppercase tracking-widest">
              Level 09 · Digital Entertainment Hub
            </div>
            
            <h1 className="text-6xl md:text-8xl font-black mb-8 tracking-tighter leading-tight text-slate-900">
              第九空间 <br/> <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-600 to-indigo-600">WORKSPACE.</span>
            </h1>
            
            <p className="text-slate-500 text-lg md:text-xl max-w-2xl mx-auto mb-16 leading-relaxed font-medium">
              欢迎进入高度集成的数字娱乐中枢。连接全维度游戏平台，监控实时产业资讯，在这里定义您的第九艺术生活。
            </p>

            <div className="flex flex-wrap justify-center gap-8 md:gap-16 p-10 rounded-[3rem] bg-white border border-slate-200 shadow-xl shadow-slate-200/50 relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-50/50 via-transparent to-indigo-50/50 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
              {PLATFORMS.map((p, i) => (
                <motion.a 
                  key={p.name}
                  href={p.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + (i * 0.1) }}
                  className="flex flex-col items-center gap-3 grayscale hover:grayscale-0 transition-all cursor-pointer hover:scale-110 group/icon"
                >
                  <img src={p.icon} alt={p.name} className="w-10 h-10 object-contain opacity-70 group-hover/icon:opacity-100 transition-opacity" />
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 group-hover/icon:text-slate-600">{p.name}</span>
                </motion.a>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Social / Gamer Cards */}
      <section id="social" className="py-32 relative overflow-hidden">
        <div className="absolute top-1/2 left-0 w-full h-[1px] bg-slate-200 -z-10" />
        <div className="container mx-auto px-6 max-w-6xl relative z-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-20 px-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Users className="w-8 h-8 text-cyan-600" />
                <h2 className="text-3xl font-black uppercase tracking-tighter">玩家数据</h2>
              </div>
              <p className="text-slate-400 font-bold uppercase text-[10px] tracking-[0.3em]">Player Identity Matrix</p>
            </div>
            
            <div className="hidden lg:flex items-center gap-4">
              <span className="flex items-center gap-2 px-4 py-2 rounded-full border border-slate-200 text-[10px] font-black text-slate-400 uppercase tracking-widest bg-white">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                System Online
              </span>
            </div>
          </div>

          {/* Pier Server Module */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-16 p-8 md:p-10 bg-white border border-slate-200 rounded-[3rem] shadow-2xl shadow-slate-200/50 flex flex-col md:flex-row items-center gap-10 group relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-50/50 via-transparent to-indigo-50/50 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
            
            <div className="w-32 h-32 rounded-[2.5rem] overflow-hidden bg-slate-50 border border-slate-100 flex-shrink-0 relative group-hover:scale-105 transition-transform duration-500 shadow-lg">
              <img 
                src="https://img.icons8.com/fluency/200/seagull.png" 
                alt="海鸥吉祥物图标"
                className="w-full h-full object-contain p-4"
              />
              <div className="absolute inset-0 bg-cyan-600/5 mix-blend-overlay pointer-events-none" />
            </div>

            <div className="flex-1 text-center md:text-left relative z-10">
              <div className="flex flex-wrap items-center gap-3 mb-4 justify-center md:justify-start">
                <h3 className="text-3xl font-black text-slate-900 tracking-tighter">码头 <span className="text-cyan-600">PIER.</span></h3>
                <span className="px-4 py-1.5 bg-cyan-50 text-cyan-700 text-[10px] font-black rounded-full uppercase tracking-widest border border-cyan-100">Main Hub</span>
              </div>
              <p className="text-slate-500 text-sm md:text-base mb-6 font-medium max-w-xl leading-relaxed">
                这是我们的核心数字避难所。深度集成的跨平台语音枢纽，搭载高保真语音技术与智能管理机器人，为您的游戏生活增添无限可能。
              </p>
              <div className="flex flex-wrap items-center gap-8 justify-center md:justify-start">
                <div className="flex items-center gap-3 py-2 px-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <Users className="w-5 h-5 text-emerald-500" />
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Activity</span>
                    <span className="text-xs font-black text-slate-700">8 用户在线</span>
                  </div>
                </div>
                <div className="flex items-center gap-3 py-2 px-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <Headphones className="w-5 h-5 text-indigo-500" />
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Channel</span>
                    <span className="text-xs font-black text-slate-700">语音通道 (HQ)</span>
                  </div>
                </div>
                <div className="flex items-center gap-3 py-2 px-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <Globe className="w-5 h-5 text-cyan-500" />
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Type</span>
                    <span className="text-xs font-black text-slate-700">公共社区</span>
                  </div>
                </div>
              </div>
            </div>

            <motion.a 
              href="https://www.kookapp.cn/app/channels/2483114585343964/8702582545717234" 
              target="_blank" 
              rel="noopener noreferrer"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-10 py-6 bg-slate-900 text-white rounded-[2rem] font-black flex items-center gap-3 shadow-2xl shadow-slate-900/20 hover:bg-cyan-600 transition-all group shrink-0"
            >
              立即传输
              <ExternalLink className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
            </motion.a>
          </motion.div>

          <div className="grid lg:grid-cols-3 gap-10">
            {SOCIAL_INFOS.map((info, idx) => (
              <motion.div
                key={info.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                viewport={{ once: true }}
                className="bg-white border border-slate-200 rounded-[2.5rem] p-10 hover:shadow-2xl hover:shadow-cyan-200/50 transition-all group relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-slate-50 -mr-12 -mt-12 rounded-full border border-slate-100 group-hover:bg-cyan-50 transition-colors" />
                
                <div className={`w-16 h-16 rounded-3xl mb-8 flex items-center justify-center font-black text-2xl text-white shadow-lg transform -rotate-3 group-hover:rotate-0 transition-transform ${
                  info.color === 'indigo' ? 'bg-indigo-600 shadow-indigo-600/30' : 
                  info.color === 'green' ? 'bg-emerald-600 shadow-emerald-600/30' : 'bg-cyan-600 shadow-cyan-600/30'
                }`}>
                  {info.name[0]}
                </div>
                <h3 className="text-2xl font-black mb-2 flex items-center gap-2">
                  {info.name}
                  {info.verified && <CheckCircle2 className="w-4 h-4 text-cyan-500" />}
                </h3>
                <p className="text-slate-400 text-sm mb-10 font-medium leading-relaxed">{info.bio}</p>
                
                <div className="space-y-4">
                  {[
                     { label: 'Steam', val: info.steam, color: 'text-slate-700', icon: 'https://api.iconify.design/simple-icons:steam.svg?color=%231b2838' },
                     { label: 'PSN', val: info.psn, color: 'text-slate-700', icon: 'https://api.iconify.design/simple-icons:playstation.svg?color=%23003745' },
                     { label: 'Switch', val: info.switch, color: 'text-slate-700', icon: 'https://api.iconify.design/simple-icons:nintendoswitch.svg?color=%23e60012' }
                  ].map(platform => (
                    <div key={platform.label} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:bg-white transition-colors">
                      <div className="flex items-center gap-3">
                        <img src={platform.icon} className="w-4 h-4 opacity-70" alt="" />
                        <span className="text-[10px] uppercase font-black tracking-widest text-slate-400">{platform.label}</span>
                      </div>
                      <span className={`text-sm font-mono font-bold ${platform.color}`}>{platform.val}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* News Portal */}
      <section id="news" className="py-32 bg-slate-100/50">
        <div className="container mx-auto px-6 max-w-6xl">
          <div className="text-center mb-24">
            <h2 className="text-4xl font-black mb-4 uppercase tracking-[0.2em] text-slate-400">Hub Central</h2>
            <div className="h-1 w-20 bg-cyan-600 mx-auto rounded-full" />
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {NEWS_SITES.map((site, i) => (
              <motion.a 
                key={site.name}
                href={site.url}
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.1 }}
                className="group relative p-10 bg-white border border-slate-200 rounded-[3rem] overflow-hidden hover:shadow-xl hover:-translate-y-2 transition-all flex flex-col items-center"
              >
                <div className="w-16 h-16 bg-slate-50 flex items-center justify-center mb-8 transition-all duration-500 overflow-hidden">
                  <img src={site.icon} alt={site.name} className="w-8 h-8 rounded-lg outline outline-1 outline-slate-200/50 group-hover:scale-110 transition-transform bg-white" />
                </div>
                <h3 className="text-xl font-black mb-2 text-slate-800 uppercase tracking-tighter">{site.name}</h3>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{site.desc}</p>
                <div className="mt-8 p-2 rounded-full border border-slate-100 group-hover:bg-cyan-50 transition-colors">
                  <ExternalLink className="w-4 h-4 text-slate-300 group-hover:text-cyan-600 transition-colors" />
                </div>
              </motion.a>
            ))}
          </div>
        </div>
      </section>

      {/* Message Board */}
      <section id="board" className="py-32">
        <div className="container mx-auto px-6 max-w-4xl">
          <div className="text-center mb-20">
            <h2 className="text-4xl font-black mb-4 tracking-tighter uppercase">时空交互</h2>
            <p className="text-slate-400 font-bold uppercase text-[10px] tracking-[0.2em]">Asynchronous Communication</p>
          </div>

          <div className="bg-white border border-slate-200 p-12 rounded-[3.5rem] shadow-2xl shadow-slate-200/50 mb-20 relative">
            <div className="absolute top-10 left-[-1.5rem] w-12 h-12 bg-cyan-600 rounded-2xl rotate-12 flex items-center justify-center shadow-lg">
              <MessageSquare className="w-6 h-6 text-white" />
            </div>
            
            <form onSubmit={handlePost} className="space-y-8">
              <div>
                <label className="block text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-4 px-2">Operator ID</label>
                <input 
                  type="text" 
                  placeholder="IDENTITY..." 
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-8 py-5 focus:outline-none focus:border-cyan-500 focus:bg-white transition-all font-black text-slate-800 placeholder:text-slate-300"
                  required
                />
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-4 px-2">Transmission Data</label>
                <textarea 
                  placeholder="TRANSMIT MESSAGE..." 
                  value={newContent}
                  onChange={e => setNewContent(e.target.value)}
                  className="w-full h-40 bg-slate-50 border border-slate-200 rounded-2xl px-8 py-5 focus:outline-none focus:border-cyan-500 focus:bg-white transition-all font-medium text-slate-700 resize-none placeholder:text-slate-300"
                  required
                />
              </div>
              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full py-6 bg-slate-900 text-white rounded-[2rem] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-3 shadow-xl hover:bg-cyan-600 transition-colors"
              >
                <Send className="w-5 h-5" />
                Broadcast Transmission
              </motion.button>
            </form>
          </div>

          <div className="space-y-6">
            <AnimatePresence initial={false}>
              {messages.map((msg, i) => (
                <div key={msg.id}>
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="group bg-white border border-slate-200 p-8 rounded-[2.5rem] flex items-start gap-8 hover:shadow-lg transition-shadow"
                  >
                    <div className="w-16 h-16 rounded-2xl bg-cyan-50 flex items-center justify-center font-black text-2xl text-cyan-600 shrink-0 border border-cyan-100 group-hover:rotate-6 transition-transform">
                      {msg.author && msg.author[0] ? msg.author[0] : '?'}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-center mb-3">
                        <h4 className="text-xl font-black text-slate-900 uppercase tracking-tighter">{msg.author}</h4>
                        <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest bg-slate-50 px-3 py-1 rounded-full whitespace-nowrap">{renderTime(msg.created_at)}</span>
                      </div>
                      <p className="text-slate-500 font-medium leading-relaxed mb-6 whitespace-pre-wrap">{msg.content}</p>
                      
                      <div className="flex items-center gap-4 border-t border-slate-100 pt-4">
                        <button 
                          onClick={() => setReplyTarget(replyTarget === msg.id ? null : msg.id)}
                          className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-cyan-600 transition-colors"
                        >
                          <Reply className="w-3 h-3" />
                          Reply
                        </button>
                        <button 
                          onClick={() => handleDelete(msg.id)}
                          className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-rose-500 transition-colors"
                        >
                          <Trash2 className="w-3 h-3" />
                          Delete
                        </button>
                      </div>
                    </div>
                  </motion.div>

                  {/* Reply Form */}
                  <AnimatePresence>
                    {replyTarget === msg.id && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="ml-24 mt-4 overflow-hidden"
                      >
                        <div className="bg-slate-50 border border-slate-200 p-6 rounded-3xl">
                          <input 
                            type="text" 
                            placeholder="回复 ID..." 
                            value={replyName}
                            onChange={e => setReplyName(e.target.value)}
                            className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 mb-3 text-xs font-bold focus:outline-none focus:border-cyan-500"
                          />
                          <textarea 
                            placeholder="输入评论..." 
                            value={replyContent}
                            onChange={e => setReplyContent(e.target.value)}
                            className="w-full h-20 bg-white border border-slate-200 rounded-xl px-4 py-2 mb-3 text-xs font-medium focus:outline-none focus:border-cyan-500 resize-none"
                          />
                          <button 
                            onClick={() => handleReply(msg.id)}
                            className="w-full py-3 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-cyan-600 transition-colors"
                          >
                            发送评论
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Comments List */}
                  <div className="ml-24 mt-4 space-y-4">
                    {(msg.comments || []).map(comment => (
                      <motion.div 
                        key={comment.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="bg-slate-50/50 border border-slate-100 p-6 rounded-3xl flex items-start gap-4 group/comment"
                      >
                        <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center font-black text-slate-400 text-sm">
                          {comment.author && comment.author[0] ? comment.author[0] : '?'}
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-sm font-black text-slate-900 uppercase tracking-tighter">{comment.author}</span>
                            <div className="flex items-center gap-3">
                              <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">{renderTime(comment.created_at)}</span>
                              <button 
                                onClick={() => handleDeleteComment(msg.id, comment.id)}
                                className="opacity-0 group-hover/comment:opacity-100 text-slate-300 hover:text-rose-500 transition-all"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                          <p className="text-xs text-slate-500 font-medium whitespace-pre-wrap">{comment.content}</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </section>



      {/* Master Footer */}
      <footer className="py-32 border-t border-slate-200 relative z-10 bg-white">
        <div className="container mx-auto px-6 text-center">
          <div className="inline-flex items-center justify-center gap-3 mb-10 px-6 py-2 rounded-full border border-slate-200">
             <Gamepad2 className="w-5 h-5 text-cyan-600" />
             <span className="font-black text-xl tracking-tighter text-slate-900">THE 9TH SPACE.</span>
          </div>
          <p className="text-slate-400 text-sm max-w-sm mx-auto leading-relaxed font-bold uppercase tracking-[0.2em] mb-12">
            第九艺术梦工厂 · 建立您的数字主权
          </p>
          <div className="flex justify-center gap-12 text-[10px] font-black text-slate-300 uppercase tracking-[0.5em]">
            <span className="hover:text-cyan-600 cursor-pointer transition-colors">Protocol</span>
             <span className="hover:text-cyan-600 cursor-pointer transition-colors">Manifesto</span>
             <span className="hover:text-cyan-600 cursor-pointer transition-colors">Archive</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
