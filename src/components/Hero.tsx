import { motion } from 'motion/react';
import { ArrowRight, Github, Mail, ChevronRight } from 'lucide-react';

export default function Hero() {
  return (
    <section className="relative pt-32 pb-20 overflow-hidden bg-transparent">
      {/* Background patterns */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none -z-10">
        <motion.div 
          animate={{ x: [0, 50, 0], y: [0, 30, 0] }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-indigo-50 rounded-full blur-3xl opacity-30" 
        />
        <motion.div 
          animate={{ x: [0, -40, 0], y: [0, -20, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="absolute top-[20%] -right-[5%] w-[30%] h-[30%] bg-blue-50 rounded-full blur-3xl opacity-20" 
        />
      </div>

      <div className="container mx-auto px-6 max-w-6xl">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600 text-xs font-bold uppercase tracking-wider mb-6">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
              </span>
              正在寻找实习机会
            </div>
            
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-slate-900 mb-6 font-sans">
              你好, 我是 <span className="text-indigo-600">邱鹏</span>.
            </h1>
            
            <p className="text-xl text-slate-600 mb-10 leading-relaxed max-w-xl">
              中南财经政法大学硕士在读，深耕平台运营、用户增长、电商运营及游戏运营/策划领域，同时对 AI 系列产品开发充满热情。目前正积极寻找 {new Date().getFullYear()} 年度相关实习机会，期待与您交流。
            </p>
            
            <div className="flex flex-wrap gap-4">
              <motion.a
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                href="#projects"
                className="px-8 py-4 bg-slate-900 text-white rounded-xl font-bold flex items-center gap-2 hover:bg-slate-800 transition-colors"
              >
                查看我的项目
                <ArrowRight className="w-5 h-5" />
              </motion.a>
              <motion.a
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                href="mailto:eren9523@foxmail.com"
                className="px-8 py-4 bg-white text-slate-900 border border-slate-200 rounded-xl font-bold flex items-center gap-2 hover:bg-slate-50 transition-colors shadow-sm"
              >
                联系我
                <Mail className="w-5 h-5" />
              </motion.a>
            </div>

            <div className="mt-12 flex items-center gap-8 border-t border-slate-100 pt-8 text-slate-400">
               <div className="flex flex-col">
                 <span className="text-2xl font-bold text-slate-900">3+</span>
                 <span className="text-xs uppercase font-bold tracking-widest text-slate-500 mt-1">实习经历</span>
               </div>
               <div className="flex flex-col border-l border-slate-100 pl-8">
                 <span className="text-2xl font-bold text-slate-900">2+</span>
                 <span className="text-xs uppercase font-bold tracking-widest text-slate-500 mt-1">AI 落地项目</span>
               </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative"
          >
            <div className="relative z-10 rounded-2xl overflow-hidden shadow-2xl border-8 border-white group">
              <img 
                src="https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&q=80&w=1000" 
                alt="Workspace" 
                className="w-full aspect-[4/5] object-cover group-hover:scale-110 transition-transform duration-1000"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-indigo-600/10 mix-blend-multiply group-hover:bg-transparent transition-colors duration-500"></div>
              
              <div className="absolute bottom-6 right-6 p-4 bg-white/90 backdrop-blur-md rounded-xl shadow-lg flex items-center gap-4 border border-white/20">
                 <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white">
                    <ChevronRight className="w-6 h-6" />
                 </div>
                 <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Main Pursuit</p>
                    <p className="text-sm font-bold text-slate-900">Growth & AI Products</p>
                 </div>
              </div>
            </div>
            
            {/* Geometric accents */}
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="absolute -top-4 -right-4 w-24 h-24 bg-indigo-100 rounded-full -z-10 blur-xl origin-bottom-left"
            ></motion.div>
            <motion.div 
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -bottom-10 -left-10 w-48 h-48 bg-slate-100 rounded-2xl -z-10 blur-2xl"
            ></motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
