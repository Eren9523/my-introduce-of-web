import { motion } from 'motion/react';
import { Briefcase } from 'lucide-react';
import { EXPERIENCES } from '../constants';

export default function Experience() {
  return (
    <section id="experience" className="py-24 bg-transparent">
      <div className="container mx-auto px-6 max-w-6xl">
        <div className="flex items-center gap-4 mb-16">
          <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
            <Briefcase className="w-6 h-6" />
          </div>
          <h2 className="text-3xl font-bold tracking-tight">工作与实习经历</h2>
        </div>

        <div className="space-y-12 relative before:absolute before:left-0 md:before:left-1/2 before:top-0 before:bottom-0 before:w-px before:bg-slate-200">
          {EXPERIENCES.map((exp, index) => (
            <motion.div
              key={exp.company + exp.period}
              initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              viewport={{ once: true }}
              className={`relative flex flex-col md:flex-row gap-8 ${
                index % 2 === 0 ? 'md:flex-row-reverse' : ''
              }`}
            >
              {/* Dot mapping to the line */}
              <div className="absolute left-0 md:left-1/2 top-0 w-4 h-4 bg-white border-2 border-indigo-500 rounded-full -translate-x-[7px] z-10 hidden md:block" />

              <div className="md:w-1/2 space-y-4">
                <div className={`p-6 bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow ${
                  index % 2 === 0 ? 'md:text-right' : 'md:text-left'
                }`}>
                  <span className="inline-block text-sm font-semibold text-indigo-600 mb-2 px-3 py-1 bg-indigo-50 rounded-full">
                    {exp.period}
                  </span>
                  <h3 className="text-xl font-bold text-slate-900">{exp.company}</h3>
                  <p className="text-slate-500 font-medium mb-4">{exp.role}</p>
                  <ul className={`space-y-2 text-slate-600 ${
                    index % 2 === 0 ? 'md:items-end' : 'md:items-start'
                  } flex flex-col`}>
                    {exp.description.map((item, i) => (
                      <li key={i} className="flex items-start gap-2 leading-relaxed">
                        <span className="mt-2 w-1.5 h-1.5 rounded-full bg-slate-300 shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
