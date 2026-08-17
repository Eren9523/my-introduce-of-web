import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Github, ExternalLink, Code, X } from 'lucide-react';
import { PROJECTS } from '../constants';

export default function Projects() {
  const [showWebAgentTip, setShowWebAgentTip] = useState(true);
  const [hasEnteredView, setHasEnteredView] = useState(false);

  useEffect(() => {
    if (hasEnteredView && showWebAgentTip) {
      const timer = setTimeout(() => {
        setShowWebAgentTip(false);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [hasEnteredView, showWebAgentTip]);

  return (
    <section id="projects" className="py-24 bg-transparent">
      <div className="container mx-auto px-6 max-w-6xl">
        <div className="flex items-center gap-4 mb-12">
          <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
            <Code className="w-6 h-6" />
          </div>
          <h2 className="text-3xl font-bold tracking-tight">精选项目</h2>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-8">
          {PROJECTS.map((project, index) => {
            const isInternal = project.link?.startsWith('/');
            const targetUrl = project.link || project.github;
            
            const CardWrapper = ({ children }: { children: React.ReactNode }) => {
              if (isInternal && project.link) {
                return (
                  <Link to={project.link} className="block h-full group">
                    {children}
                  </Link>
                );
              }
              return (
                <a 
                  href={targetUrl} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="block h-full group"
                >
                  {children}
                </a>
              );
            };

            return (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
                onViewportEnter={() => {
                  if (project.id === 'web-agent') {
                    setHasEnteredView(true);
                  }
                }}
                className="h-full relative"
              >
                <CardWrapper>
                  <div className="flex flex-col h-full border border-slate-200 rounded-2xl overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                    <div className="aspect-video relative overflow-hidden bg-slate-100 shrink-0">
                      <img 
                        src={project.imageUrl} 
                        alt={project.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-6">
                        <div className="flex items-center gap-2 text-white font-bold text-sm">
                          <span>查看详情</span>
                          <ExternalLink className="w-4 h-4" />
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-6 flex flex-col flex-1">
                      <h3 className="text-xl font-bold mb-2 group-hover:text-indigo-600 transition-colors">
                        {project.title}
                      </h3>
                      <p className="text-slate-600 mb-6 line-clamp-3 leading-relaxed">
                        {project.description}
                      </p>
                      <div className="flex flex-wrap gap-2 mt-auto">
                        {project.tags.map(tag => (
                          <span key={tag} className="px-3 py-1 bg-slate-100 text-slate-600 text-xs font-medium rounded-full">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardWrapper>

                <AnimatePresence>
                  {project.id === 'web-agent' && showWebAgentTip && (
                    <div className="absolute -top-16 left-0 right-0 flex justify-center z-20 pointer-events-none">
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1, y: [0, -8, 0] }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={{ 
                          opacity: { duration: 0.3 }, 
                          scale: { duration: 0.3 },
                          y: { duration: 1.5, repeat: Infinity, ease: "easeInOut" }
                        }}
                        className="relative bg-white/90 backdrop-blur-md shadow-xl rounded-2xl py-2 pl-2 pr-9 border border-indigo-100/50 flex items-center shadow-indigo-100/50 max-w-max pointer-events-auto"
                      >
                        {/* Downward pointing arrow */}
                        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white/90 backdrop-blur-md border-b border-r border-indigo-100/50 rotate-45" />
                        
                        {/* Q version pet */}
                        <span className="text-3xl mr-2 drop-shadow-md leading-none">🥳</span>
                        
                        <span className="text-sm font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-500 whitespace-nowrap">
                          快来点击，试用一下项目吧~
                        </span>
                        
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setShowWebAgentTip(false);
                          }}
                          className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-300 hover:text-red-500 transition-colors p-1 rounded-full hover:bg-slate-50"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </motion.div>
                    </div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
          
          {/* Placeholder for future projects */}
          <div className="border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center p-12 text-slate-400 group hover:border-indigo-200 hover:text-slate-500 transition-colors">
             <Code className="w-12 h-12 mb-4 opacity-20 group-hover:opacity-40 transition-opacity" />
             <p className="font-medium">更多项目正在开发中...</p>
          </div>
        </div>
      </div>
    </section>
  );
}
