import { motion } from 'motion/react';
import { School, Trophy, Calendar, Award as AwardIcon } from 'lucide-react';
import { CAMPUS_EXPERIENCES, AWARDS } from '../constants';

export default function CampusAwards() {
  return (
    <section id="campus-awards" className="py-24 bg-transparent">
      <div className="container mx-auto px-6 max-w-6xl">
        <div className="grid md:grid-cols-2 gap-16">
          {/* Campus Experience */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="space-y-12"
          >
            <div className="flex items-center gap-4">
              <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                <School className="w-6 h-6" />
              </div>
              <h2 className="text-3xl font-bold tracking-tight">校园经历</h2>
            </div>

            <div className="space-y-8">
              {CAMPUS_EXPERIENCES.map((exp, index) => (
                <div key={exp.organization} className="relative pl-8 before:absolute before:left-0 before:top-2 before:bottom-0 before:w-px before:bg-slate-100">
                  <div className="absolute left-[-4px] top-2 w-2 h-2 rounded-full bg-blue-500" />
                  <div className="space-y-2">
                    <span className="text-sm font-semibold text-blue-600 px-2 py-0.5 bg-blue-50 rounded-md">
                      {exp.period}
                    </span>
                    <h3 className="text-xl font-bold text-slate-900">{exp.organization}</h3>
                    <p className="text-slate-500 font-medium">{exp.role}</p>
                    <ul className="space-y-2 pt-2">
                      {exp.description.map((item, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-slate-600 leading-relaxed">
                          <div className="mt-1.5 w-1 h-1 rounded-full bg-slate-300 shrink-0" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Awards */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="space-y-12"
          >
            <div className="flex items-center gap-4">
              <div className="p-2 bg-amber-50 rounded-lg text-amber-600">
                <Trophy className="w-6 h-6" />
              </div>
              <h2 className="text-3xl font-bold tracking-tight">获得奖项</h2>
            </div>

            <div className="grid gap-4">
              {AWARDS.map((award, index) => (
                <motion.div
                  key={award.title}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                  viewport={{ once: true }}
                  className="p-5 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between group hover:border-amber-200 hover:bg-amber-50/30 transition-all"
                >
                  <div className="flex items-start gap-4">
                    <div className="mt-1 p-2 bg-white rounded-xl shadow-sm text-amber-500 group-hover:scale-110 transition-transform">
                      <AwardIcon className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 group-hover:text-amber-700 transition-colors">
                        {award.title}
                      </h4>
                      <p className="text-sm font-medium text-amber-600">{award.level}</p>
                    </div>
                  </div>
                  <div className="text-right hidden sm:block">
                    <div className="flex items-center gap-1 text-xs font-medium text-slate-400 bg-white px-2 py-1 rounded-lg border border-slate-100 shadow-sm">
                      <Calendar className="w-3 h-3" />
                      {award.date}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="p-6 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl text-white shadow-lg shadow-indigo-200 overflow-hidden relative">
              <div className="relative z-10">
                <h4 className="font-bold mb-2">不断进取</h4>
                <p className="text-indigo-100 text-sm leading-relaxed">
                  每一次奖项都是过去努力的见证，也是未来探索的动力。我始终保持学习的心态，在实践中不断突破自我。
                </p>
              </div>
              <AwardIcon className="absolute -right-4 -bottom-4 w-32 h-32 text-white/10 rotate-12" />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
