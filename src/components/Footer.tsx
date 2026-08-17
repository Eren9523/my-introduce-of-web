import { motion } from 'motion/react';
import { Mail, MessageSquare, Phone, MapPin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="py-12 border-t border-slate-200 bg-transparent mt-20">
      <div className="container mx-auto px-6 max-w-6xl">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
          <div className="space-y-4">
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">联系方式</h2>
            <div className="flex flex-col gap-2">
              <a 
                href="mailto:eren9523@foxmail.com" 
                className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors"
              >
                <Mail className="w-4 h-4" />
                eren9523@foxmail.com
              </a>
              <span className="flex items-center gap-2 text-slate-600">
                <Phone className="w-4 h-4" />
                (+86) 186-7162-0511
              </span>
              <span className="flex items-center gap-2 text-slate-600">
                <MessageSquare className="w-4 h-4" />
                微信: ln1114645867
              </span>
            </div>
          </div>
          
          <div className="text-left md:text-right">
            <p className="text-sm font-medium text-slate-500">© 2026 邱鹏 (Qiu Peng)</p>
            <p className="text-xs text-slate-400 mt-1 italic">为成长、探索以及创造更酷的事物而努力。</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
