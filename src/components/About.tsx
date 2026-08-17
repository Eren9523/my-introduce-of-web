import { motion } from 'motion/react';
import { User, GraduationCap, Star, ExternalLink } from 'lucide-react';
import { EDUCATION } from '../constants';

export default function About() {
  const skills = [
    { category: '设计类', items: ['PPT', 'PS', '视觉设计'] },
    { category: '数据分析', items: ['SQL', 'SPSS', 'Excel'] },
    { category: '思维与办公', items: ['X-mind', 'Visio', '飞书/钉钉'] },
    { category: '技术栈', items: ['React', 'TypeScript', 'Node.js', 'Python'] }
  ];

  return (
    <section id="about" className="py-24 bg-transparent overflow-hidden">
      <div className="container mx-auto px-6 max-w-6xl">
        <div className="grid md:grid-cols-2 gap-16 items-start">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            <div className="flex items-center gap-4">
              <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
                <User className="w-6 h-6" />
              </div>
              <h2 className="text-3xl font-bold tracking-tight">个人简介</h2>
            </div>
            
            <p className="text-lg text-slate-600 leading-relaxed">
              我是中南财经政法大学的一名硕士研究生，拥有电子商务专业背景。
              我的职业路径融合了平台运营、产品策略以及对 AI 技术日益增长的热情。我喜欢通过数据驱动决策，并结合 AI 工具提升业务效率。
            </p>
            
            <div className="space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">核心技能</h3>
              <div className="flex flex-wrap gap-3">
                {skills.map((skill, index) => (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    viewport={{ once: true }}
                    key={skill.category} 
                    className="p-4 bg-slate-50 rounded-xl border border-slate-100 w-full sm:w-[calc(50%-0.75rem)]"
                  >
                    <p className="font-bold text-slate-900 mb-2 text-sm">{skill.category}</p>
                    <div className="flex flex-wrap gap-2">
                      {skill.items.map(item => (
                        <span key={item} className="text-xs text-slate-500 font-medium px-2 py-1 bg-white border border-slate-200 rounded-md hover:bg-indigo-50 hover:text-indigo-600 transition-colors">
                          {item}
                        </span>
                      ))}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            <div className="flex items-center gap-4">
              <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
                <GraduationCap className="w-6 h-6" />
              </div>
              <h2 className="text-3xl font-bold tracking-tight">教育背景</h2>
            </div>

            <div className="space-y-6">
              {EDUCATION.map((edu, index) => (
                <motion.div 
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.15 }}
                  viewport={{ once: true }}
                  key={edu.school} 
                  className="relative pl-6 border-l-2 border-indigo-100 hover:border-indigo-500 transition-colors pb-2"
                >
                   <div className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-white border-2 border-indigo-500" />
                   <p className="text-sm font-semibold text-indigo-600 mb-1">{edu.period}</p>
                   {edu.url ? (
                     <a 
                       href={edu.url} 
                       target="_blank" 
                       rel="noopener noreferrer"
                       className="group/edu flex items-center gap-1.5"
                     >
                       <h4 className="text-xl font-bold text-slate-900 group-hover/edu:text-indigo-600 transition-colors uppercase">
                         {edu.school}
                       </h4>
                       <ExternalLink className="w-4 h-4 text-slate-300 group-hover/edu:text-indigo-600 transition-all opacity-0 group-hover/edu:opacity-100" />
                     </a>
                   ) : (
                     <h4 className="text-xl font-bold text-slate-900 uppercase">
                       {edu.school}
                     </h4>
                   )}
                   <p className="text-slate-600 font-medium mb-2">{edu.degree} · {edu.major} · GPA: {edu.gpa}</p>
                   <div className="flex flex-wrap gap-2">
                     {edu.details.map((detail, i) => (
                       <span key={i} className="text-xs bg-slate-50 text-slate-500 px-3 py-1 rounded-full border border-slate-100 hover:bg-white hover:shadow-sm transition-all">
                         {detail}
                       </span>
                     ))}
                   </div>
                </motion.div>
              ))}
            </div>

            <div className="p-6 bg-indigo-600 rounded-2xl text-white relative overflow-hidden group">
               <div className="relative z-10">
                 <div className="flex items-center gap-2 mb-2">
                   <Star className="w-5 h-5 fill-indigo-400 text-indigo-400" />
                   <h4 className="font-bold">兴趣与生活</h4>
                 </div>
                 <p className="text-indigo-100 text-sm leading-relaxed">
                   在学习和工作之余，我热爱弹吉他、登山和野外露营。我深信好奇心的力量，并乐于亲手实践——无论是编写代码还是在野外烹饪，都能让我感受到探索的乐趣。
                 </p>
               </div>
               <div className="absolute top-0 right-0 p-8 transform translate-x-4 -translate-y-4 opacity-10 group-hover:scale-110 transition-transform duration-500">
                  <Star className="w-24 h-24" />
               </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
