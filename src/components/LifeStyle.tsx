import React, { useRef, useState, useEffect } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'motion/react';
import { MapPin, ExternalLink, Play, Sparkles } from 'lucide-react';
import { SiXiaohongshu, SiBilibili, SiTiktok } from 'react-icons/si';

const socialLinks = [
  {
    name: '小红书',
    icon: <SiXiaohongshu className="w-8 h-8" />,
    url: 'https://www.xiaohongshu.com/',
    color: 'from-[#ff2442] to-[#ff2442]',
    hoverColor: 'group-hover:shadow-[#ff2442]/30',
    desc: '随手记录，分享生活碎片与思考',
    idText: '我的小红书：2939341558',
    platformId: '2939341558',
    hasTooltip: true,
    tooltipText: '由于平台设置无法跳转\n个人ID已粘贴至剪切板'
  },
  {
    name: 'Bilibili',
    icon: <SiBilibili className="w-8 h-8" />,
    url: 'https://space.bilibili.com/412339816',
    color: 'from-[#00A1D6] to-[#00A1D6]',
    hoverColor: 'group-hover:shadow-cyan-500/50',
    desc: '长视频分享，深度解析与日常vlog',
    idText: '点击直达主页探索更多硬核内容',
    hasTooltip: true,
    tooltipText: '此平台拥有专属用户URL\n点击卡片即可直达主页'
  },
  {
    name: '抖音',
    icon: <SiTiktok className="w-8 h-8" />,
    url: 'https://www.douyin.com/',
    color: 'from-slate-800 to-black',
    hoverColor: 'group-hover:shadow-purple-500/50',
    desc: '捕捉瞬间的精彩，用镜头表达态度',
    idText: '我的抖音：123081390',
    platformId: '123081390',
    hasTooltip: true,
    tooltipText: '由于平台设置无法跳转\n个人ID已粘贴至剪切板'
  }
];

const lifeImages = [
  {
    src: 'https://images.unsplash.com/photo-1516961642265-531546e84af2?auto=format&fit=crop&q=80&w=600',
    alt: 'Travel',
    tag: 'EXPLORE',
    span: 'col-span-12 md:col-span-8 row-span-2'
  },
  {
    src: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&q=80&w=600',
    alt: 'Photography',
    tag: 'MOMENTS',
    span: 'col-span-12 md:col-span-4 row-span-1'
  },
  {
    src: 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?auto=format&fit=crop&q=80&w=600',
    alt: 'Cityscape',
    tag: 'NIGHT WALK',
    span: 'col-span-12 md:col-span-4 row-span-1'
  }
];

function SocialCard({ link, i }: { link: any, i: number }) {
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isHovered && link.hasTooltip) {
      timer = setTimeout(() => {
        setIsHovered(false);
      }, 4000);
    }
    return () => clearTimeout(timer);
  }, [isHovered, link.hasTooltip]);

  const handleClick = (e: React.MouseEvent) => {
    if (link.platformId) {
      navigator.clipboard.writeText(link.platformId).catch(() => {});
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: i * 0.1 + 0.3 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="relative"
    >
      <a
        href={link.url}
        target="_blank"
        rel="noopener noreferrer"
        onClick={handleClick}
        className={`block h-full group p-8 rounded-3xl bg-white border border-slate-100 shadow-xl shadow-slate-200/20 hover:-translate-y-2 transition-all duration-300 ${link.hoverColor}`}
      >
        <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${link.color} text-white justify-center flex items-center mb-6 shadow-lg transform group-hover:rotate-6 transition-transform duration-300`}>
          {link.icon}
        </div>
        <h3 className="text-xl font-bold text-slate-900 mb-2 flex items-center gap-2">
          {link.name}
          <ExternalLink className="w-4 h-4 text-slate-300 group-hover:text-slate-900 transition-colors" />
        </h3>
        <p className="text-slate-500 text-sm leading-relaxed mb-4">
          {link.desc}
        </p>
        
        {link.idText && (
          <p className="text-indigo-600/80 font-medium text-xs rounded-xl bg-indigo-50 px-3 py-2 border border-indigo-100">
            {link.idText}
          </p>
        )}
        
        <div className="absolute top-8 right-8 w-8 h-8 rounded-full border border-slate-100 flex items-center justify-center group-hover:bg-slate-50 group-hover:scale-110 transition-all duration-300">
          <Play className="w-3 h-3 text-slate-400 group-hover:text-slate-900" />
        </div>
      </a>

      <AnimatePresence>
        {isHovered && link.hasTooltip && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 5, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute -top-12 left-1/2 -translate-x-1/2 z-50 pointer-events-none w-max"
          >
            <div className="bg-slate-800 text-white text-xs px-4 py-2.5 rounded-xl shadow-xl text-center leading-relaxed whitespace-pre-line relative z-10">
              {link.tooltipText}
              <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-3 h-3 bg-slate-800 rotate-45 rounded-[2px]" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function LifeStyle() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  const y = useTransform(scrollYProgress, [0, 1], [100, -100]);
  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0]);

  return (
    <section 
      ref={containerRef}
      className="py-32 relative bg-transparent overflow-hidden"
      id="life"
    >
      {/* Background decorations */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent" />
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-indigo-100 rounded-full blur-[100px] opacity-50" />
      <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-cyan-100 rounded-full blur-[100px] opacity-50" />

      <div className="container mx-auto px-6 max-w-7xl relative z-10">
        <motion.div 
          style={{ opacity, y }}
          className="text-center mb-20"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-100 border border-slate-200 text-sm font-semibold tracking-wider text-slate-600 mb-6 uppercase">
            <Sparkles className="w-4 h-4 text-indigo-500" />
            Beyond The Code
          </div>
          <h2 className="text-4xl md:text-5xl font-black mb-6 tracking-tight text-slate-900">
            Life & Explore
          </h2>
          <p className="text-slate-500 max-w-2xl mx-auto text-lg leading-relaxed">
            生活不只有代码与工作，还有在镜头下捕捉的每一个瞬间。
            <br />去感受世界，体验未知，保持热爱与好奇。
          </p>
        </motion.div>

        {/* Bento Grid Gallery */}
        <div className="grid grid-cols-12 auto-rows-[240px] gap-4 mb-20">
          {lifeImages.map((img, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ delay: i * 0.1, duration: 0.6 }}
              className={`relative rounded-3xl overflow-hidden group ${img.span}`}
            >
              <img 
                src={img.src} 
                alt={img.alt} 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="absolute bottom-6 left-6 inline-flex items-center gap-2 text-white font-bold tracking-widest text-xs uppercase opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                <MapPin className="w-4 h-4" />
                {img.tag}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Social Links Cards */}
        <div className="grid md:grid-cols-3 gap-6">
          {socialLinks.map((link, i) => (
            <SocialCard key={link.name} link={link} i={i} />
          ))}
        </div>
        
        <motion.p 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center text-sm font-medium text-slate-400 mt-16"
        >
          部分平台受限制需通过ID检索，点击卡片即可复制平台ID。
        </motion.p>
      </div>
    </section>
  );
}
