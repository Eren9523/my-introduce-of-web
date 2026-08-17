import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Calculator, 
  TrendingUp, 
  ShoppingCart, 
  BarChart4, 
  Globe2, 
  Truck, 
  DollarSign, 
  ArrowLeft,
  Info,
  RefreshCw,
  PieChart,
  Percent,
  CheckCircle2,
  Copy
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface Formula {
  id: string;
  name: string;
  desc: string;
  formula: string;
  inputs: { key: string; label: string; unit: string; placeholder: string; defaultValue: string }[];
  calculate: (vals: Record<string, number>) => number;
  resultUnit: string;
  isCrossBorder?: boolean;
}

const FORMULAS: Formula[] = [
  {
    id: 'gmv',
    name: 'GMV (成交总额)',
    desc: '衡量电商规模的核心指标。',
    formula: '访客数 (Traffic) × 转化率 (CVR) × 客单价 (AUR)',
    inputs: [
      { key: 'traffic', label: '访客数 (Traffic)', unit: '人', placeholder: '10000', defaultValue: '10000' },
      { key: 'cvr', label: '转化率 (CVR)', unit: '%', placeholder: '2.5', defaultValue: '2.5' },
      { key: 'aur', label: '客单价 (AUR)', unit: '元', placeholder: '150', defaultValue: '150' },
    ],
    calculate: (v) => v.traffic * (v.cvr / 100) * v.aur,
    resultUnit: '元'
  },
  {
    id: 'roi',
    name: 'ROI (投资回报率)',
    desc: '电商广告投放效果的最佳指标。',
    formula: '销售收入 / 广告成本',
    inputs: [
      { key: 'revenue', label: '销售收入', unit: '元', placeholder: '50000', defaultValue: '50000' },
      { key: 'cost', label: '广告成本', unit: '元', placeholder: '10000', defaultValue: '10000' },
    ],
    calculate: (v) => v.revenue / (v.cost || 1),
    resultUnit: ':1'
  },
  {
    id: 'roas',
    name: 'ROAS (广告支出回报率)',
    desc: '直接衡量广告投放产生的即时收入。',
    formula: '广告产生的 GMV / 广告费',
    inputs: [
      { key: 'gmv', label: '广告产生的 GMV', unit: '元', placeholder: '20000', defaultValue: '20000' },
      { key: 'spend', label: '广告费支出', unit: '元', placeholder: '5000', defaultValue: '5000' },
    ],
    calculate: (v) => v.gmv / (v.spend || 1),
    resultUnit: ':1'
  },
  {
    id: 'cvr',
    name: 'CVR (转化率)',
    desc: '流量变现能力的体现。',
    formula: '下单订单量 / 访客数',
    inputs: [
      { key: 'orders', label: '下单订单量', unit: '单', placeholder: '250', defaultValue: '250' },
      { key: 'traffic', label: '访客数', unit: '人', placeholder: '10000', defaultValue: '10000' },
    ],
    calculate: (v) => (v.orders / (v.traffic || 1)) * 100,
    resultUnit: '%'
  },
  {
    id: 'profit-marginal',
    name: '跨境边际利润',
    desc: '考虑回款、退货及汇率后的实际利润。',
    formula: '(售价 - 采购 - 物流 - 手续费) / 汇率',
    isCrossBorder: true,
    inputs: [
      { key: 'price', label: '销售单价', unit: '外币/USD', placeholder: '50', defaultValue: '50' },
      { key: 'buy', label: '采购单价', unit: 'RMB', placeholder: '100', defaultValue: '100' },
      { key: 'ship', label: '头程/尾程物流', unit: 'RMB', placeholder: '50', defaultValue: '50' },
      { key: 'fee', label: '平台手续费', unit: '%', placeholder: '15', defaultValue: '15' },
      { key: 'rate', label: '实时汇率', unit: 'USD/CNY', placeholder: '7.2', defaultValue: '7.2' },
    ],
    calculate: (v) => {
      const revenueRmb = v.price * v.rate;
      const platformFeeRmb = revenueRmb * (v.fee / 100);
      return revenueRmb - v.buy - v.ship - platformFeeRmb;
    },
    resultUnit: 'RMB'
  },
  {
    id: 'shipping-vol',
    name: '跨境体积重计算',
    desc: '计算空运/国际物流的计费重量。',
    isCrossBorder: true,
    formula: '(长 × 宽 × 高) / 6000 (或 5000)',
    inputs: [
      { key: 'l', label: '长 (Length)', unit: 'cm', placeholder: '30', defaultValue: '30' },
      { key: 'w', label: '宽 (Width)', unit: 'cm', placeholder: '20', defaultValue: '20' },
      { key: 'h', label: '高 (Height)', unit: 'cm', placeholder: '15', defaultValue: '15' },
      { key: 'factor', label: '体积系数', unit: 'Ratio', placeholder: '6000', defaultValue: '6000' },
    ],
    calculate: (v) => (v.l * v.w * v.h) / (v.factor || 6000),
    resultUnit: 'kg'
  }
];

export default function EcomCalc() {
  const [activeFormulaId, setActiveFormulaId] = useState(FORMULAS[0].id);
  const [inputs, setInputs] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    FORMULAS[0].inputs.forEach(input => {
      initial[input.key] = input.defaultValue;
    });
    return initial;
  });

  const [isCopied, setIsCopied] = useState(false);
  const [showReport, setShowReport] = useState(false);

  const activeFormula = useMemo(() => 
    FORMULAS.find(f => f.id === activeFormulaId)!, [activeFormulaId]
  );

  const result = useMemo(() => {
    const numericInputs: Record<string, number> = {};
    Object.keys(inputs).forEach(k => {
      numericInputs[k] = parseFloat(inputs[k]) || 0;
    });
    return activeFormula.calculate(numericInputs);
  }, [activeFormula, inputs]);

  const handleFormulaChange = (id: string) => {
    setActiveFormulaId(id);
    const newFormula = FORMULAS.find(f => f.id === id)!;
    const newInputs: Record<string, string> = {};
    newFormula.inputs.forEach(input => {
      newInputs[input.key] = input.defaultValue;
    });
    setInputs(newInputs);
  };

  const handleCopy = () => {
    const textToCopy = `${activeFormula.name} 结果: ${result.toLocaleString()} ${activeFormula.resultUnit}`;
    navigator.clipboard.writeText(textToCopy);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleGenerateReport = () => {
    setShowReport(true);
  };

  return (
    <div className="min-h-screen bg-[#f1f5f9] text-slate-900 font-sans print:bg-white print:min-h-0">
      {/* Navbar */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm print:hidden">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/" className="p-2 hover:bg-slate-50 rounded-xl transition-colors">
              <ArrowLeft className="w-5 h-5 text-slate-500" />
            </Link>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-600 rounded-lg shadow-lg shadow-emerald-200">
                <Calculator className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-lg font-black tracking-tight">E-Metric <span className="text-emerald-600 text-xs uppercase ml-1">Pro</span></h1>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-2">
            <span className="px-3 py-1 bg-slate-100 text-[10px] font-black text-slate-500 rounded-full uppercase tracking-widest border border-slate-200">跨境 & 国内通用</span>
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto p-6 md:p-10 print:hidden">
        <div className="grid lg:grid-cols-12 gap-8 items-start">
          
          {/* Sidebar formulas list */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="flex items-center gap-2 mb-6">
                <BarChart4 className="w-4 h-4 text-emerald-600" />
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">分析模型库</h3>
              </div>
              <div className="space-y-1">
                {FORMULAS.map(f => (
                  <button
                    key={f.id}
                    onClick={() => handleFormulaChange(f.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all text-left group ${activeFormulaId === f.id ? 'bg-emerald-50 text-emerald-700' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'}`}
                  >
                    <div className={`p-1.5 rounded-lg transition-colors ${activeFormulaId === f.id ? 'bg-emerald-600' : 'bg-slate-100 group-hover:bg-slate-200'}`}>
                      {f.isCrossBorder ? <Globe2 className={`w-3.5 h-3.5 ${activeFormulaId === f.id ? 'text-white' : 'text-slate-500'}`} /> : <ShoppingCart className={`w-3.5 h-3.5 ${activeFormulaId === f.id ? 'text-white' : 'text-slate-500'}`} />}
                    </div>
                    {f.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-emerald-900 rounded-3xl p-8 text-white relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-800 rounded-full blur-3xl -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500" />
              <div className="relative z-10">
                <Info className="w-8 h-8 opacity-50 mb-4" />
                <h4 className="text-lg font-bold mb-2">专业版提示</h4>
                <p className="text-emerald-100/70 text-sm leading-relaxed mb-6">
                  在跨境计算时，请定期手动更新汇率参数。物流体积重默认以 6000 为系数。
                </p>
                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-emerald-400">
                  <CheckCircle2 className="w-3 h-3" /> Data Ready for 2024
                </div>
              </div>
            </div>
          </div>

          {/* Main calculator area */}
          <div className="lg:col-span-8 flex flex-col gap-6">
            
            <motion.div 
              key={activeFormulaId}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-[2.5rem] border border-slate-200 shadow-xl shadow-slate-200/50 overflow-hidden"
            >
              <div className="p-8 md:p-10 border-b border-slate-100 bg-slate-50/50">
                <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                       {activeFormula.isCrossBorder ? (
                         <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-[10px] font-black rounded-md uppercase tracking-widest border border-blue-200">Cross-Border</span>
                       ) : (
                         <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-[10px] font-black rounded-md uppercase tracking-widest border border-emerald-200">General Ops</span>
                       )}
                    </div>
                    <h2 className="text-3xl font-black tracking-tighter text-slate-900">{activeFormula.name}</h2>
                  </div>
                  <button 
                    onClick={() => {
                        const initial: Record<string, string> = {};
                        activeFormula.inputs.forEach(input => {
                        initial[input.key] = input.defaultValue;
                      });
                      setInputs(initial);
                    }}
                    className="p-3 bg-white border border-slate-200 rounded-2xl hover:bg-slate-50 transition-all hover:rotate-180 duration-500 shadow-sm"
                  >
                    <RefreshCw className="w-5 h-5 text-slate-400" />
                  </button>
                </div>
                <div className="p-6 bg-white rounded-2xl border border-slate-100 shadow-inner">
                  <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.3em] mb-2 px-1">计算逻辑 / Logic</p>
                  <code className="text-emerald-600 font-mono text-sm font-bold">{activeFormula.formula}</code>
                </div>
              </div>

              <div className="p-8 md:p-10">
                <div className="grid md:grid-cols-2 gap-8 mb-10">
                  {activeFormula.inputs.map(input => (
                    <div key={input.key} className="space-y-3">
                      <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest px-1 flex items-center justify-between">
                        {input.label}
                        <span className="text-emerald-500">{input.unit}</span>
                      </label>
                      <div className="relative group">
                        <input 
                          type="number"
                          value={inputs[input.key] || ''}
                          onChange={(e) => setInputs({...inputs, [input.key]: e.target.value})}
                          placeholder={input.placeholder}
                          className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-4 text-xl font-bold focus:outline-none focus:border-emerald-500 focus:bg-white transition-all peer [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        />
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 peer-focus:opacity-100 transition-opacity">
                          <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="bg-emerald-950 rounded-3xl p-10 text-center relative overflow-hidden group shadow-2xl shadow-emerald-900/20">
                  <div className="absolute inset-0 bg-gradient-to-br from-emerald-800 to-transparent opacity-50" />
                  <div className="relative z-10">
                    <p className="text-emerald-400/60 text-[11px] font-black uppercase tracking-[0.4em] mb-4">分析结果 / Analysis Result</p>
                    <div className="flex flex-col items-center gap-2">
                       <span className="text-xs font-black text-emerald-300 uppercase tracking-widest">{activeFormula.resultUnit}</span>
                       <motion.div 
                        key={result}
                        initial={{ scale: 0.95 }}
                        animate={{ scale: 1 }}
                        className="text-6xl md:text-7xl font-black text-white tracking-tighter"
                       >
                        {typeof result === 'number' && !isNaN(result) ? (
                          result % 1 === 0 ? result.toLocaleString() : result.toFixed(2)
                        ) : '0'}
                       </motion.div>
                    </div>
                    
                    <div className="mt-8 flex justify-center gap-4">
                      <button 
                        onClick={handleCopy}
                        className={`flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-black text-white border transition-all ${isCopied ? 'bg-emerald-600 border-emerald-500' : 'bg-white/10 hover:bg-white/20 border-white/10'}`}
                      >
                        {isCopied ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                        {isCopied ? '已复制' : '复制结果'}
                      </button>
                      <button 
                        onClick={handleGenerateReport}
                        className="flex items-center gap-2 px-6 py-3 bg-emerald-500 hover:bg-emerald-400 rounded-xl text-xs font-black text-white shadow-lg shadow-emerald-500/20 transition-all"
                      >
                        <PieChart className="w-4 h-4" /> 生成报告
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Recommendations or common knowledge section */}
            <div className="grid md:grid-cols-3 gap-4">
              {[
                { icon: TrendingUp, title: '增长模型', value: '+24%', color: 'rose' },
                { icon: Truck, title: '物流周转', value: '14 天', color: 'blue' },
                { icon: Percent, title: '平均 ROI', value: '3.5', color: 'emerald' },
              ].map(stat => (
                <div key={stat.title} className="bg-white p-6 rounded-3xl border border-slate-200 flex items-center gap-4 shadow-sm group hover:scale-105 transition-transform">
                  <div className={`p-3 bg-${stat.color}-50 rounded-2xl group-hover:bg-${stat.color}-100 transition-colors`}>
                    <stat.icon className={`w-5 h-5 text-${stat.color}-600`} />
                  </div>
                  <div>
                    <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.title}</h5>
                    <p className="text-lg font-black text-slate-700">{stat.value}</p>
                  </div>
                </div>
              ))}
            </div>

          </div>
        </div>
      </main>

      {/* Report Modal */}
      <AnimatePresence>
        {showReport && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 print:relative print:block print:bg-white print:p-0 print:inset-auto"
          >
              <motion.div 
              id="report-to-print"
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white rounded-[2.5rem] w-full max-w-lg overflow-hidden shadow-2xl print:shadow-none print:rounded-none print:max-w-none print:m-0 print:w-full print:h-auto print:static print:transform-none !print:opacity-100"
            >
              <style>{`
                @media print {
                  @page {
                    size: A4;
                    margin: 1cm;
                  }
                  /* Ensure text is dark and backgrounds are clear */
                  .bg-emerald-950 {
                    background-color: white !important;
                    color: #064e3b !important;
                    border-bottom: 2px solid #064e3b !important;
                  }
                  .text-emerald-400 {
                    color: #059669 !important;
                  }
                }
              `}</style>
              <div className="p-8 bg-emerald-950 text-white relative print:bg-white print:text-slate-900 print:border-b print:border-slate-200">
                <div className="absolute top-0 right-0 p-4 print:hidden">
                  <button 
                    onClick={() => setShowReport(false)}
                    className="p-2 hover:bg-white/10 rounded-full transition-colors"
                  >
                    <ArrowLeft className="w-5 h-5 rotate-90" />
                  </button>
                </div>
                <h3 className="text-2xl font-black tracking-tight mb-2">业务分析报告</h3>
                <p className="text-emerald-400 text-xs font-bold uppercase tracking-widest print:text-slate-500">Analysis Summary Report</p>
              </div>
              
              <div className="p-8 space-y-6">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">分析项 / Metric Name</label>
                  <p className="text-xl font-bold text-slate-900">{activeFormula.name}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {activeFormula.inputs.map(input => (
                    <div key={input.key} className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                       <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">{input.label}</label>
                       <p className="text-lg font-black text-slate-700">{inputs[input.key]} <span className="text-[10px] text-slate-400 ml-1">{input.unit}</span></p>
                    </div>
                  ))}
                </div>

                <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">关键结果 / Final Result</label>
                    <p className="text-3xl font-black text-emerald-600">{result.toLocaleString()} {activeFormula.resultUnit}</p>
                  </div>
                  <div className="w-20 h-20 bg-slate-50 rounded-2xl flex items-center justify-center border border-slate-200">
                    <CheckCircle2 className="w-10 h-10 text-emerald-500" />
                  </div>
                </div>

                <button 
                  onClick={() => window.print()}
                  className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-emerald-600 transition-all flex items-center justify-center gap-2 print:hidden"
                >
                  <RefreshCw className="w-4 h-4" /> 打印报告
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <footer className="mt-20 border-t border-slate-200 bg-white py-12 print:hidden">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-4">E-Metric Analysis Hub © 2026</p>
          <div className="flex justify-center gap-8 opacity-30 grayscale hover:grayscale-0 transition-all duration-700">
             <div className="w-12 h-12 flex items-center justify-center font-black text-slate-400 border-2 border-slate-100 rounded-full">AMZ</div>
             <div className="w-12 h-12 flex items-center justify-center font-black text-slate-400 border-2 border-slate-100 rounded-full">TEM</div>
             <div className="w-12 h-12 flex items-center justify-center font-black text-slate-400 border-2 border-slate-100 rounded-full">SHP</div>
          </div>
        </div>
      </footer>
    </div>
  );
}
