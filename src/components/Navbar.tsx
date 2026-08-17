import { motion, useScroll, useSpring } from 'motion/react';
import { useState, useEffect } from 'react';
import { Mail, Github, Menu, X } from 'lucide-react';
import { Link } from 'react-router-dom';

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: '关于我', href: '#about' },
    { name: '个人项目', href: '#projects' },
    { name: '实习经历', href: '#experience' },
    { name: '探索生活', href: '#life' },
    { name: '个人笔记本', href: '#notebook' }
  ];

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-white/80 backdrop-blur-md border-b border-slate-200 py-4' : 'bg-transparent py-6'
      }`}
    >
      <div className="container mx-auto px-6 max-w-6xl flex justify-between items-center">
        <motion.a 
          href="/" 
          className="text-2xl font-black tracking-tighter text-slate-900 hover:text-indigo-600 transition-colors"
          whileHover={{ scale: 1.05 }}
        >
          QP.
        </motion.a>

        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map(link => (
              <a 
                key={link.name} 
                href={link.href}
                className="text-sm font-bold text-slate-600 hover:text-indigo-600 transition-colors tracking-tight"
              >
                {link.name}
              </a>
          ))}
          <a 
            href="mailto:eren9523@foxmail.com"
            className="px-5 py-2.5 bg-slate-900 text-white text-sm font-bold rounded-full hover:bg-slate-700 transition-colors shadow-sm"
          >
            联系我
          </a>
        </nav>

        <button className="md:hidden p-2 text-slate-900">
          <Menu className="w-6 h-6" />
        </button>
      </div>

      <motion.div 
        className="absolute bottom-0 left-0 right-0 h-[2px] bg-indigo-600 origin-left"
        style={{ scaleX }}
      />
    </header>
  );
}
