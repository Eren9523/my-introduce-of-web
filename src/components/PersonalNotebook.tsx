import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from 'motion/react';
import { Brain, Lock, User, UserPlus, LogOut, Code, Send, Trash2, MessageSquare, X, CheckCircle2, Circle, Clock, StickyNote, Image as ImageIcon, Pin } from 'lucide-react';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import TideBackground from './TideBackground';

const compressImage = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        // 最大宽度 800px 以节省存储空间
        const MAX_WIDTH = 800;
        if (width > MAX_WIDTH) {
          height *= MAX_WIDTH / width;
          width = MAX_WIDTH;
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Canvas ctx not available'));
          return;
        }
        
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, width, height);

        // 输出 jpeg 并且降低质量以满足 SQLite 大小
        const dataUrl = canvas.toDataURL('image/jpeg', 0.6);
        resolve(dataUrl);
      };
      img.onerror = (err) => reject(err);
    };
    reader.onerror = (err) => reject(err);
  });
};

const NotebookHeader = () => {
  return (
    <div 
      className="relative w-full h-[320px] md:h-[400px] flex items-center justify-center overflow-hidden mb-12 rounded-[2.5rem] bg-slate-950 border border-slate-800 shadow-[0_0_60px_rgba(139,92,246,0.1)] group cursor-crosshair"
    >
      <TideBackground />
      
      {/* Background decorations removed, replaced with TideBackground */}
      
      {/* Text Layer */}
      <div className="z-10 flex flex-col items-center justify-center pointer-events-none drop-shadow-2xl mix-blend-lighten">
        {/* Changed network notebook text to be large and prominent */}
        <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-br from-cyan-400 via-blue-500 to-purple-500 tracking-tight drop-shadow-[0_0_15px_rgba(255,255,255,0.7)] uppercase mb-2" translate="no">
          CYBER NOTEBOOK
        </h2>
        <h3 className="text-2xl md:text-3xl text-center font-bold tracking-widest text-slate-100">
          网络笔记
        </h3>
        
        {/* Changed mind space text to be small subtitle underneath */}
        <div className="flex items-center gap-2 mt-4 px-4 py-1.5 rounded-full bg-slate-900/50 border border-pink-500/30 backdrop-blur-md">
          <div className="w-2 h-2 rounded-full bg-pink-500 animate-pulse" />
          <p className="text-[10px] md:text-xs text-pink-400 font-bold tracking-[0.2em] uppercase">脑内空间</p>
          <div className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse" style={{ animationDelay: '500ms' }} />
        </div>
      </div>
    </div>
  );
};

interface UserPayload {
  userId: string;
  username: string;
  role: string;
}

interface LogComment {
  id: string;
  post_id: string;
  author_id: string;
  content: string;
  created_at: string;
  username: string;
  authorRole: string;
}

interface Post {
  id: string;
  author_id: string;
  title: string | null;
  content: string;
  created_at: string;
  username: string;
  authorRole: string;
  is_pinned?: number;
  comments?: LogComment[];
}

interface Todo {
  id: string;
  author_id: string;
  content: string;
  is_completed: number;
  created_at: string;
  username: string;
  authorRole: string;
}

const formatToBeijingTime = (timeStr: string) => {
  if (!timeStr) return '';
  const isoStr = timeStr.includes('T') ? timeStr : timeStr.replace(' ', 'T') + 'Z';
  return new Date(isoStr).toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' });
};

const formatToBeijingTimeShort = (timeStr: string) => {
  if (!timeStr) return '';
  const isoStr = timeStr.includes('T') ? timeStr : timeStr.replace(' ', 'T') + 'Z';
  return new Date(isoStr).toLocaleTimeString('zh-CN', { timeZone: 'Asia/Shanghai', hour: '2-digit', minute:'2-digit' });
};

const formatToBeijingDateShort = (timeStr: string) => {
  if (!timeStr) return '';
  const isoStr = timeStr.includes('T') ? timeStr : timeStr.replace(' ', 'T') + 'Z';
  return new Date(isoStr).toLocaleDateString('zh-CN', { timeZone: 'Asia/Shanghai' });
};

export default function PersonalNotebook({ preview = false }: { preview?: boolean }) {
  const [user, setUser] = useState<UserPayload | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [todos, setTodos] = useState<Todo[]>([]);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  
  // Auth Form State
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');

  // New Post State
  const [newPostContent, setNewPostContent] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  
  // Comment State
  const [activeCommentPost, setActiveCommentPost] = useState<string | null>(null);
  const [newCommentContent, setNewCommentContent] = useState('');

  // Todo State
  const [newTodoContent, setNewTodoContent] = useState('');

  useEffect(() => {
    // Check local storage for user and token on mount
    const storedUser = localStorage.getItem('log_user');
    const storedToken = localStorage.getItem('log_token');

    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        localStorage.removeItem('log_user');
      }
    } else if (storedToken && storedToken.includes('.')) {
      try {
        let base64 = storedToken.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
        while (base64.length % 4) base64 += '=';
        const payloadStr = atob(base64);
        const payload = JSON.parse(payloadStr);
        if (payload && payload.userId) {
          setUser(payload);
          localStorage.setItem('log_user', JSON.stringify(payload));
        }
      } catch (e) {
        // Token was not decodable
      }
    }

    fetchPosts();
    fetchTodos();
  }, []);

  const fetchPosts = async () => {
    try {
      const res = await fetch('/api/posts');
      const text = await res.text();
      try {
        const data = JSON.parse(text);
        if (res.ok) setPosts(data);
      } catch (err) {
        console.error('API Error (HTML returned instead of JSON):', text);
      }
    } catch (e) {
      console.error('Failed to fetch posts');
    }
  };

  const fetchTodos = async () => {
    try {
      const res = await fetch('/api/todos');
      const text = await res.text();
      try {
        const data = JSON.parse(text);
        if (res.ok) setTodos(data);
      } catch (err) {
        console.error('API Error (HTML returned instead of JSON):', text);
      }
    } catch (e) {
      console.error('Failed to fetch todos');
    }
  };

  const getToken = () => localStorage.getItem('log_token');

  const requireAuth = (callback: () => void) => {
    if (!user) {
      setIsAuthModalOpen(true);
      return;
    }
    callback();
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data: any = await res.json().catch(() => ({ error: "网络响应异常，无法解析" }));
      if (!res.ok) throw new Error(data.error || "请求失败");
      
      localStorage.setItem('log_token', data.token);
      if (data.user) {
        localStorage.setItem('log_user', JSON.stringify(data.user));
        setUser(data.user);
      }
      setIsAuthModalOpen(false);
      setUsername('');
      setPassword('');
    } catch (err: any) {
      setAuthError(err.message);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data: any = await res.json().catch(() => ({ error: "网络响应异常，无法解析" }));
      if (!res.ok) throw new Error(data.error || "请求失败");

      localStorage.setItem('log_token', data.token);
      if (data.user) {
        localStorage.setItem('log_user', JSON.stringify(data.user));
        setUser(data.user);
      }
      setIsAuthModalOpen(false);
      setUsername('');
      setPassword('');
    } catch (err: any) {
      setAuthError(err.message);
    }
  };

  const handleGuestLogin = async () => {
    try {
      const res = await fetch('/api/auth/guest', { method: 'POST' });
      let data: any = {};
      try {
        data = await res.json();
      } catch (err) {
        data = { error: "网络响应异常" };
      }
      if (!res.ok) throw new Error(data.error);

      localStorage.setItem('log_token', data.token);
      if (data.user) {
        localStorage.setItem('log_user', JSON.stringify(data.user));
        setUser(data.user);
      }
      setIsAuthModalOpen(false);
    } catch (err: any) {
      console.error(err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('log_token');
    localStorage.removeItem('log_user');
    setUser(null);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('请选择图片文件');
      return;
    }

    try {
      setIsUploadingImage(true);
      const dataUrl = await compressImage(file);
      const imageName = file.name || 'image';
      
      // 添加到内容中
      setNewPostContent(prev => prev + (prev.length > 0 && !prev.endsWith('\n') ? '\n' : '') + `![${imageName}](${dataUrl})\n`);
    } catch (err) {
      console.error('Image upload failed', err);
      alert('图片处理失败');
    } finally {
      setIsUploadingImage(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleSubmitPost = async () => {
    if (!newPostContent.trim()) return;
    
    try {
      const res = await fetch('/api/posts', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getToken()}`
        },
        body: JSON.stringify({ content: newPostContent })
      });
      const text = await res.text();
      try {
        const data = JSON.parse(text);
        if (res.ok) {
          setPosts([data, ...posts]);
          setNewPostContent('');
        } else if (res.status === 401 || res.status === 403) {
          handleLogout();
          setIsAuthModalOpen(true);
        } else {
          alert(data.error || "请求失败");
        }
      } catch (err) {
        console.error("API Error:", text);
        alert("网络响应异常，请重试");
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeletePost = async (id: string) => {
    try {
      const res = await fetch(`/api/posts/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${getToken()}` }
      });
      if (res.ok) {
        setPosts(posts.filter(p => p.id !== id));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleTogglePin = async (id: string, currentPinStatus?: number) => {
    try {
      const res = await fetch(`/api/posts/${id}/pin`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getToken()}` 
        },
        body: JSON.stringify({ is_pinned: currentPinStatus === 1 ? 0 : 1 })
      });
      if (res.ok) {
        const data = await res.json() as Post;
        setPosts(prev => prev.map(p => p.id === id ? { ...p, is_pinned: data.is_pinned } : p).sort((a, b) => {
          const pinA = a.is_pinned || 0;
          const pinB = b.is_pinned || 0;
          if (pinA !== pinB) return pinB - pinA;
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        }));
      } else {
        const err = await res.json() as any;
        alert(err.error || "操作失败，可能需要初始化数据库表");
      }
    } catch (e) {
      console.error(e);
    }
  };

  const toggleComments = async (postId: string) => {
    if (activeCommentPost === postId) {
      setActiveCommentPost(null);
      return;
    }
    
    try {
      const res = await fetch(`/api/posts/${postId}`);
      const text = await res.text();
      let data: any = {};
      try {
        data = JSON.parse(text);
      } catch (e) {
        console.error("Failed to parse comments JSON:", text);
      }
      
      if (res.ok && data.comments) {
        setPosts(posts.map(p => p.id === postId ? { ...p, comments: data.comments } : p));
        setActiveCommentPost(postId);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSubmitComment = async (postId: string) => {
    if (!newCommentContent.trim()) return;
    
    try {
      const res = await fetch('/api/log_comments', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getToken()}`
        },
        body: JSON.stringify({ post_id: postId, content: newCommentContent })
      });
      const text = await res.text();
      try {
        const data = JSON.parse(text);
        if (res.ok) {
          setPosts(posts.map(p => {
            if (p.id === postId) {
              return { ...p, comments: [...(p.comments || []), data] };
            }
            return p;
          }));
          setNewCommentContent('');
        } else if (res.status === 401 || res.status === 403) {
          handleLogout();
          setIsAuthModalOpen(true);
        } else {
          alert(data.error || "请求失败");
        }
      } catch (err) {
         console.error("API Error:", text);
         alert("网络响应异常，请重试");
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteComment = async (postId: string, commentId: string) => {
    try {
      const res = await fetch(`/api/log_comments/${commentId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${getToken()}` }
      });
      if (res.ok) {
        setPosts(posts.map(p => {
          if (p.id === postId) {
            return { ...p, comments: p.comments?.filter(c => c.id !== commentId) };
          }
          return p;
        }));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSubmitTodo = async () => {
    if (!newTodoContent.trim()) return;
    
    try {
      const res = await fetch('/api/todos', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getToken()}`
        },
        body: JSON.stringify({ content: newTodoContent })
      });
      const text = await res.text();
      try {
        const data = JSON.parse(text);
        if (res.ok) {
          setTodos([data, ...todos]);
          setNewTodoContent('');
        } else if (res.status === 401 || res.status === 403) {
          handleLogout();
          setIsAuthModalOpen(true);
        } else {
          alert(data.error || "请求失败");
        }
      } catch (err) {
        console.error("API Error:", text);
        alert("网络响应异常，请重试");
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleToggleTodo = async (id: string) => {
    try {
      const res = await fetch(`/api/todos/${id}/toggle`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${getToken()}` }
      });
      const data: any = await res.json();
      if (res.ok) {
        setTodos(todos.map(t => t.id === id ? { ...t, is_completed: data.is_completed } : t));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteTodo = async (id: string) => {
    try {
      const res = await fetch(`/api/todos/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${getToken()}` }
      });
      if (res.ok) {
        setTodos(todos.filter(t => t.id !== id));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const canDelete = (authorId: string) => {
    return user && (user.role === 'admin' || user.userId === authorId);
  };

  const displayPosts = preview ? posts.slice(0, 3) : posts;
  const displayTodos = preview ? todos.slice(0, 5) : todos;

  return (
    <section id="notebook" className={`min-h-screen ${preview ? 'py-24 border-t border-slate-200' : 'pt-24 pb-12'} bg-transparent text-slate-800 font-sans selection:bg-indigo-500/30 selection:text-indigo-900`}>
      
      {!preview && (
        <motion.a 
          href="/"
          initial={{ opacity: 0, y: -20, rotate: -5 }}
          animate={{ opacity: 1, y: 0, rotate: 0 }}
          whileHover={{ scale: 1.05, y: -2 }}
          whileTap={{ scale: 0.95 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          className="fixed top-6 left-6 sm:top-8 sm:left-10 z-[100] flex items-center justify-center px-4 py-2.5 rounded-2xl bg-white/80 backdrop-blur-md border border-white/80 shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:shadow-[0_15px_40px_rgba(99,102,241,0.2)] transition-colors group cursor-pointer"
        >
          <div className="bg-slate-100/80 text-slate-600 p-1.5 rounded-full mr-2.5 group-hover:-translate-x-1 group-hover:bg-indigo-500 group-hover:text-white transition-all duration-300 border border-slate-200/50 shadow-inner">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
          </div>
          <span className="font-bold tracking-wider text-xs text-slate-700 bg-clip-text">返回主页</span>
        </motion.a>
      )}

      <div className="container mx-auto px-6 max-w-6xl relative z-0">
        
        <NotebookHeader />

        {/* Auth Bar */}
        <div className="flex justify-between items-center bg-white border border-slate-200 p-4 rounded-2xl shadow-sm mb-8">
          <div className="font-bold text-slate-700 flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Brain className="w-5 h-5 text-indigo-500" />
              <span>个人空间</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <User className="w-4 h-4" />
                  <span className="font-medium">{user.username}</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full border ${user.role === 'admin' ? 'bg-rose-50 text-rose-600 border-rose-200' : user.role === 'guest' ? 'bg-slate-100 text-slate-600 border-slate-200' : 'bg-indigo-50 text-indigo-600 border-indigo-200'}`}>
                    {user.role}
                  </span>
                </div>
                <button 
                  onClick={handleLogout}
                  className="p-1.5 text-slate-500 hover:text-rose-500 hover:bg-rose-50 rounded-md transition-colors"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button 
                onClick={() => setIsAuthModalOpen(true)}
                className="flex items-center gap-2 text-sm font-bold text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 px-4 py-1.5 rounded-md transition-all border border-indigo-200"
              >
                <Lock className="w-4 h-4" />
                <span>授权登录</span>
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Main Content: Thoughts / Records */}
          <div className="lg:col-span-8 space-y-6">
            {/* Input Area */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm relative overflow-hidden group focus-within:border-indigo-300 focus-within:shadow-md transition-all">
              <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500 rounded-l-2xl opacity-50 group-focus-within:opacity-100 transition-opacity" />
              <textarea 
                id="new-post-content"
                name="newPostContent"
                onClick={() => requireAuth(() => {})}
                value={newPostContent}
                onChange={(e) => setNewPostContent(e.target.value)}
                placeholder={user ? "记录此刻的想法... (支持 Markdown 格式)" : "登录后即可分享你的想法..."}
                className="w-full bg-transparent border-none outline-none resize-none min-h-[100px] text-slate-700 placeholder:text-slate-400 focus:ring-0 leading-relaxed"
              ></textarea>
              <div className="flex justify-between items-center mt-4 pt-4 border-t border-slate-100">
                <div className="flex items-center gap-4">
                  <div className="text-xs text-slate-500 flex items-center gap-2 font-medium">
                    <Code className="w-3.5 h-3.5" /> 支持 Markdown
                  </div>
                  <input 
                    type="file" 
                    accept="image/*" 
                    className="hidden" 
                    ref={fileInputRef} 
                    onChange={handleImageUpload} 
                  />
                  <button 
                    onClick={() => requireAuth(() => fileInputRef.current?.click())}
                    className="text-xs text-slate-500 hover:text-indigo-600 flex items-center gap-2 font-medium transition-colors"
                    disabled={isUploadingImage}
                  >
                    <ImageIcon className="w-3.5 h-3.5" /> 
                    {isUploadingImage ? '处理中...' : '插入图片'}
                  </button>
                </div>
                <button
                  onClick={() => requireAuth(handleSubmitPost)}
                  className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-xl text-sm font-bold transition-all shadow-sm hover:shadow"
                >
                  <Send className="w-4 h-4" />
                  <span>发布想法</span>
                </button>
              </div>
            </div>

            {/* Log Stream */}
            <div className="space-y-6">
              {displayPosts.map(post => (
                <motion.div 
                  key={post.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all relative group"
                >
                  {/* Post Header */}
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 border border-indigo-200 flex items-center justify-center text-indigo-700 font-bold uppercase overflow-hidden shadow-sm">
                        {post.username.substring(0, 1)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-800">{post.username}</span>
                          <span className={`text-[10px] px-1.5 py-0.5 rounded border ${post.authorRole === 'admin' ? 'bg-rose-50 text-rose-600 border-rose-200' : post.authorRole === 'guest' ? 'bg-slate-100 text-slate-600 border-slate-200' : 'bg-indigo-50 text-indigo-600 border-indigo-200'}`}>
                            {post.authorRole}
                          </span>
                        </div>
                        <div className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
                          {post.is_pinned === 1 && <Pin className="w-3 h-3 text-amber-500 fill-amber-500" />}
                          {formatToBeijingTime(post.created_at)}
                        </div>
                      </div>
                    </div>
                    
                    {canDelete(post.author_id) && (
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => handleTogglePin(post.id, post.is_pinned)}
                          className={`p-1.5 rounded-lg transition-colors ${post.is_pinned === 1 ? 'text-amber-500 hover:bg-amber-50' : 'text-slate-400 hover:text-amber-500 hover:bg-amber-50'}`}
                          title={post.is_pinned === 1 ? "取消置顶" : "置顶"}
                        >
                          <Pin className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDeletePost(post.id)}
                          className="text-slate-400 hover:text-rose-500 p-1.5 hover:bg-rose-50 rounded-lg transition-colors"
                          title="删除"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Post Content */}
                  <div className="text-slate-700 leading-relaxed mb-5 text-[15px] prose prose-slate max-w-none prose-img:rounded-xl prose-img:shadow-sm">
                    <Markdown 
                      remarkPlugins={[remarkGfm]} 
                      urlTransform={(value) => value}
                    >
                      {post.content}
                    </Markdown>
                  </div>

                  {/* Action Bar */}
                  <div className="flex items-center gap-4 text-sm mt-5 pt-4 border-t border-slate-100">
                    <button 
                      onClick={() => toggleComments(post.id)}
                      className="flex items-center gap-1.5 text-slate-500 hover:text-indigo-600 transition-colors font-medium"
                    >
                      <MessageSquare className="w-4 h-4" />
                      <span>评论 {post.comments ? `(${post.comments.length})` : ''}</span>
                    </button>
                  </div>

                  {/* Comments Section */}
                  <AnimatePresence>
                    {activeCommentPost === post.id && (
                      <motion.div 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="mt-5 pt-5 space-y-5 border-t border-slate-100 bg-slate-50/50 -mx-6 px-6 -mb-6 pb-6 rounded-b-2xl">
                          {post.comments?.map(comment => (
                            <div key={comment.id} className="flex gap-3 group/comment">
                              <div className="w-8 h-8 rounded-full bg-slate-200 border border-slate-300 flex items-center justify-center text-xs text-slate-600 font-bold shrink-0">
                                {comment.username.substring(0, 1)}
                              </div>
                              <div className="flex-1 bg-white border border-slate-200 rounded-2xl rounded-tl-none p-3 shadow-sm relative">
                                <div className="flex items-center justify-between mb-1">
                                  <div className="flex items-center gap-2">
                                    <span className="text-sm font-bold text-slate-700">{comment.username}</span>
                                    <span className="text-[11px] text-slate-400">{formatToBeijingTimeShort(comment.created_at)}</span>
                                  </div>
                                  {canDelete(comment.author_id) && (
                                    <button 
                                      onClick={() => handleDeleteComment(post.id, comment.id)}
                                      className="text-slate-400 hover:text-rose-500 opacity-0 group-hover/comment:opacity-100 transition-opacity"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  )}
                                </div>
                                <div className="text-sm text-slate-600 leading-relaxed">
                                  {comment.content}
                                </div>
                              </div>
                            </div>
                          ))}

                          {/* Comment Input */}
                          <div className="flex gap-3 pt-2">
                            <div className="w-8 h-8 rounded-full bg-indigo-100 border border-indigo-200 flex items-center justify-center text-xs text-indigo-600 font-bold shrink-0">
                              {user ? user.username.substring(0, 1).toUpperCase() : '?'}
                            </div>
                            <div className="flex-1 flex gap-2">
                              <input
                                id="new-comment"
                                name="new-comment"
                                type="text"
                                value={newCommentContent}
                                onChange={(e) => setNewCommentContent(e.target.value)}
                                onFocus={() => requireAuth(() => {})}
                                placeholder={user ? "添加评论..." : "登录后即可评论..."}
                                className="flex-1 bg-white border border-slate-300 rounded-xl px-4 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all shadow-sm"
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') requireAuth(() => handleSubmitComment(post.id));
                                }}
                              />
                              <button
                                onClick={() => requireAuth(() => handleSubmitComment(post.id))}
                                className="bg-slate-900 hover:bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors shadow-sm"
                              >
                                发送
                              </button>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
              {displayPosts.length === 0 && (
                <div className="text-center py-24 text-slate-400 bg-white border border-slate-200 border-dashed rounded-2xl">
                  <div className="flex justify-center mb-4"><Brain className="w-12 h-12 text-slate-200" /></div>
                  <p>目前还没有任何记录，来发布你的第一条灵感吧。</p>
                </div>
              )}
            </div>

          </div>

          {/* Sidebar: Sticky Notes / Todos */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-amber-50/80 border border-amber-200/60 rounded-2xl p-5 shadow-sm sticky top-24">
              <h3 className="text-lg font-black text-amber-900 mb-4 flex items-center gap-2">
                <StickyNote className="w-5 h-5 text-amber-500" /> 
                日常便签 / 计划
              </h3>

              {/* Add Todo UI */}
              <div className="mb-6 flex gap-2">
                <input
                  id="new-todo"
                  name="new-todo"
                  type="text"
                  value={newTodoContent}
                  onChange={(e) => setNewTodoContent(e.target.value)}
                  onFocus={() => requireAuth(() => {})}
                  placeholder={user ? "添加日常计划或便签..." : "登录后即可添加便签..."}
                  className="flex-1 bg-white border border-amber-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-all placeholder:text-amber-300"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') requireAuth(handleSubmitTodo);
                  }}
                />
                <button
                  onClick={() => requireAuth(handleSubmitTodo)}
                  className="bg-amber-400 hover:bg-amber-500 text-amber-900 px-4 py-2.5 rounded-xl text-sm font-bold transition-colors shadow-sm flex items-center justify-center"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>

              {/* Todo List */}
              <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1 pb-2">
                {displayTodos.map(todo => (
                  <motion.div 
                    key={todo.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className={`group flex gap-3 p-3 rounded-xl border ${todo.is_completed ? 'bg-amber-100/50 border-amber-200 text-amber-800/60' : 'bg-white border-amber-200/80 text-amber-900'} shadow-sm relative transition-all`}
                  >
                    <button 
                      onClick={() => requireAuth(() => handleToggleTodo(todo.id))}
                      className={`shrink-0 mt-0.5 ${todo.is_completed ? 'text-amber-500' : 'text-amber-300 hover:text-amber-400'}`}
                    >
                      {todo.is_completed ? <CheckCircle2 className="w-5 h-5" /> : <Circle className="w-5 h-5" />}
                    </button>
                    
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm break-words ${todo.is_completed ? 'line-through' : ''}`}>
                        {todo.content}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <div className="flex items-center gap-1 text-[10px] text-amber-500/70">
                          <User className="w-3 h-3" />
                          {todo.username}
                        </div>
                        <div className="flex items-center gap-1 text-[10px] text-amber-500/70">
                          <Clock className="w-3 h-3" />
                          {formatToBeijingDateShort(todo.created_at)} {formatToBeijingTimeShort(todo.created_at)}
                        </div>
                      </div>
                    </div>

                    {canDelete(todo.author_id) && (
                      <button 
                        onClick={() => handleDeleteTodo(todo.id)}
                        className="absolute -top-2 -right-2 bg-white text-rose-400 hover:text-rose-600 hover:bg-rose-50 p-1.5 rounded-full shadow-sm border border-slate-100 opacity-0 group-hover:opacity-100 transition-all"
                        title="删除"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </motion.div>
                ))}
                {displayTodos.length === 0 && (
                  <div className="text-center py-12 text-amber-600/50 text-sm">
                    暂无便签，写点什么吧~
                  </div>
                )}
              </div>

            </div>
          </div>
        </div>

        {/* Enter Notebook Button (Bottom on Mobile) */}
        {preview && posts.length > 0 && (
          <div className="mt-8 pt-4 flex justify-center relative z-10 w-full">
            <a 
              href="/notebook"
              className="bg-white border border-slate-200 text-slate-600 hover:text-indigo-600 hover:border-indigo-600 font-medium text-sm px-8 py-3 rounded-xl transition-all shadow-sm hover:shadow-md inline-flex items-center gap-2 group"
            >
              <MessageSquare className="w-4 h-4" />
              进入个人空间
              <span className="opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all">-&gt;</span>
            </a>
          </div>
        )}
      </div>

      {/* Auth Modal */}
      <AnimatePresence>
        {isAuthModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.95, y: 10 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 10 }}
              className="w-full max-w-md bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-hidden"
            >
              <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <div className="font-bold text-slate-800 text-lg flex items-center gap-2">
                  <Brain className="w-5 h-5 text-indigo-600" /> 身份认证
                </div>
                <button onClick={() => setIsAuthModalOpen(false)} className="text-slate-400 hover:text-slate-800 transition-colors cursor-pointer bg-slate-100 hover:bg-slate-200 rounded-full p-1.5">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-8">
                {/* Tabs */}
                <div className="flex gap-2 p-1.5 bg-slate-100 rounded-xl mb-8">
                  <button 
                    onClick={() => setAuthMode('login')}
                    className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${authMode === 'login' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                  >
                    登录
                  </button>
                  <button 
                    onClick={() => setAuthMode('register')}
                    className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${authMode === 'register' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                  >
                    注册
                  </button>
                </div>

                {authError && (
                  <div className="mb-6 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-600 text-sm font-medium">
                    {authError}
                  </div>
                )}

                <form onSubmit={authMode === 'login' ? handleLogin : handleRegister} className="space-y-5">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-2">用户名</label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input 
                        type="text" 
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="请输入数字、字母或中文"
                        className="w-full bg-white border border-slate-300 text-slate-800 rounded-xl py-2.5 pl-9 pr-4 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-2">密码</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input 
                        type="password" 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="请输入密码"
                        className="w-full bg-white border border-slate-300 text-slate-800 rounded-xl py-2.5 pl-9 pr-4 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                      />
                    </div>
                  </div>

                  <button 
                    type="submit"
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl transition-all mt-2 flex justify-center items-center gap-2 shadow-sm hover:shadow-md"
                  >
                    {authMode === 'login' ? <User className="w-5 h-5" /> : <UserPlus className="w-5 h-5" />}
                    {authMode === 'login' ? '立即登录' : '创建账号'}
                  </button>
                </form>

                <div className="mt-8 relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-200"></div>
                  </div>
                  <div className="relative flex justify-center text-xs">
                    <span className="px-3 bg-white text-slate-400 font-medium">其他方式</span>
                  </div>
                </div>

                <div className="mt-6 text-center">
                  <button 
                    onClick={handleGuestLogin}
                    className="text-sm font-bold text-slate-500 hover:text-indigo-600 transition-colors"
                  >
                    以游客身份快捷访问 &rarr;
                  </button>
                  <p className="text-xs text-slate-400 mt-2">
                    系统将为您分配一个随机游客ID
                  </p>
                </div>

              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
