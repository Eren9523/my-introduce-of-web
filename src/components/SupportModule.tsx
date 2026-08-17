import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Heart, Coffee, Sparkles } from 'lucide-react';

export const SupportModule = () => {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const containerRef = React.useRef<HTMLAnchorElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setMousePos({ x, y });
  };

  return (
    <section className="py-24 relative overflow-hidden bg-transparent">
      <div className="container mx-auto px-6 max-w-5xl relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-black mb-4 uppercase tracking-[0.2em] text-indigo-600">Sponsorship</h2>
          <div className="h-1 w-20 bg-indigo-600 mx-auto rounded-full" />
        </div>
        
        <motion.a
          ref={containerRef}
          href="https://www.ifdian.net/a/eren9523/plan"
          target="_blank"
          rel="noopener noreferrer"
          onMouseMove={handleMouseMove}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => { setIsHovered(false); setMousePos({ x: 0, y: 0 }); }}
          animate={{
            rotateY: isHovered ? mousePos.x * 15 : 0,
            rotateX: isHovered ? -mousePos.y * 15 : 0,
          }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          style={{ perspective: 2000, transformStyle: "preserve-3d" }}
          className="group block relative rounded-[3rem] bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden cursor-pointer p-[1px]"
        >
          {/* Animated Border Gradient */}
          <div className="absolute inset-0 rounded-[3rem] bg-gradient-to-r from-cyan-500 via-indigo-500 to-purple-500 opacity-30 group-hover:opacity-100 transition-opacity duration-700" />
          
          <div className="relative h-full w-full bg-slate-900/90 backdrop-blur-3xl rounded-[calc(3rem-1px)] p-10 md:p-14 overflow-hidden flex flex-col md:flex-row items-center gap-12" style={{ transformStyle: "preserve-3d" }}>
            {/* Background elements inside the card */}
            <motion.div 
              className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-10 mix-blend-lighten pointer-events-none" 
              animate={{ 
                x: isHovered ? -mousePos.x * 20 : 0,
                y: isHovered ? -mousePos.y * 20 : 0,
                scale: isHovered ? 1.05 : 1
              }}
              transition={{ type: "spring", stiffness: 200, damping: 30 }}
            />
            <div className="absolute -inset-20 bg-gradient-to-r from-cyan-500/20 to-indigo-500/20 opacity-0 group-hover:opacity-100 blur-[80px] transition-opacity duration-1000 pointer-events-none" />

            {/* Left Image / Mascot */}
            <div 
              className="w-48 h-48 md:w-64 md:h-64 shrink-0 rounded-[2.5rem] overflow-hidden border border-white/10 shadow-[0_0_30px_rgba(6,182,212,0.15)] group-hover:shadow-[0_0_50px_rgba(6,182,212,0.3)] transition-all duration-700 relative z-20"
              style={{ transform: "translateZ(80px)" }}
            >
              <img 
                src="https://pic3.zhimg.com/v2-e565882eceff512e2eb853fd97be9cda_r.jpg" 
                alt="Afdian Support" 
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                onError={(e) => { e.currentTarget.src = "https://images.unsplash.com/photo-1614729939124-032f0b56c9ce?q=80&w=1000&auto=format&fit=crop"; }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent" />
              <div className="absolute bottom-5 left-0 w-full flex justify-center">
                 <div className="inline-flex items-center gap-1.5 text-indigo-300 font-black tracking-widest text-[10px] uppercase bg-slate-900/60 p-1 pr-3 pl-2 rounded-full backdrop-blur-md border border-white/10 shadow-lg">
                   <div className="w-5 h-5 rounded-full bg-rose-500/20 flex items-center justify-center">
                     <Heart className="w-3 h-3 text-rose-500" fill="currentColor" />
                   </div>
                   POWER UP
                 </div>
              </div>
            </div>
            
            {/* Right Content */}
            <div 
              className="flex-1 text-center md:text-left relative z-20"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-[10px] font-black uppercase tracking-widest text-indigo-400 mb-6 backdrop-blur-sm">
                <Sparkles className="w-3.5 h-3.5" />
                Creator Support Protocol
              </div>
              <h3 className="text-3xl md:text-4xl font-black tracking-tighter leading-tight mb-5 text-white group-hover:text-indigo-50 transition-colors">
                为热爱充电，<br />点亮创意的<span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">赛博星火。</span>
              </h3>
              <p className="text-slate-400 font-medium text-sm md:text-base max-w-xl leading-relaxed mb-10 mx-auto md:mx-0">
                如果这个网站为您提供了帮助和灵感，或者您单纯喜欢我的作品，您可以考虑发起一次“资源空投”。一杯咖啡的支持，也将化作强大算力，助推我的创作持续闪耀！
              </p>
              
              <div className="inline-flex items-center gap-3 px-8 py-4 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest text-sm hover:bg-indigo-500 transition-colors shadow-lg shadow-indigo-600/30 group-hover:shadow-indigo-500/50 group-hover:-translate-y-1 duration-300">
                <Coffee className="w-4 h-4" /> 前往爱发电 (Afdian) 赞助
              </div>
            </div>
          </div>
          
          {/* Decorative Glare */}
          <div 
            className="absolute inset-0 rounded-[3rem] pointer-events-none mix-blend-screen transition-opacity duration-500 opacity-0 group-hover:opacity-100 z-30"
            style={{
              background: `radial-gradient(circle 600px at ${mousePos.x * 1200 + 600}px ${mousePos.y * 1200 + 600}px, rgba(255,255,255,0.1), transparent 40%)`
            }}
          />
        </motion.a>
      </div>
    </section>
  );
};
