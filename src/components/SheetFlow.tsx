import React, { useState, useRef, useCallback } from 'react';
import * as XLSX from 'xlsx';
import { motion, AnimatePresence } from 'motion/react';
import { 
  FileSpreadsheet, 
  Upload, 
  Download, 
  Table as TableIcon, 
  Filter, 
  BarChart3, 
  Trash2, 
  Plus, 
  ArrowRightLeft, 
  Search,
  CheckCircle2,
  AlertCircle,
  FileText,
  ChevronRight,
  Database,
  ArrowLeft
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface SheetData {
  name: string;
  data: any[];
  columns: string[];
}

export default function SheetFlow() {
  const [sheets, setSheets] = useState<SheetData[]>([]);
  const [activeSheetIndex, setActiveSheetIndex] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<'preview' | 'vlookup' | 'analyze' | 'clean'>('preview');

  // VLOOKUP State
  const [vlookupConfig, setVlookupConfig] = useState({
    sourceSheet: '',
    targetSheet: '',
    sourceKey: '',
    targetKey: '',
    copyColumns: [] as string[]
  });

  // Analysis State
  const [analysisConfig, setAnalysisConfig] = useState({
    groupBy: '',
    calculate: [] as { col: string, op: 'sum' | 'avg' | 'count' }[]
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setError(null);

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        
        const newSheets: SheetData[] = wb.SheetNames.map(name => {
          const ws = wb.Sheets[name];
          const data = XLSX.utils.sheet_to_json(ws);
          const columns = data.length > 0 ? Object.keys(data[0] as object) : [];
          return { name, data, columns };
        });

        setSheets(newSheets);
        setActiveSheetIndex(0);
      } catch (err) {
        setError('无法解析文件，请确保它是有效的 Excel 或 CSV 文件。');
      } finally {
        setLoading(false);
      }
    };
    reader.readAsBinaryString(file);
  };

  const downloadSheet = (data: any[], filename = 'export.xlsx') => {
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Results');
    XLSX.writeFile(wb, filename);
  };

  const handleVLookup = () => {
    const { sourceSheet, targetSheet, sourceKey, targetKey, copyColumns } = vlookupConfig;
    if (!sourceSheet || !targetSheet || !sourceKey || !targetKey) return;

    const source = sheets.find(s => s.name === sourceSheet);
    const target = sheets.find(s => s.name === targetSheet);
    if (!source || !target) return;

    const mergedData = source.data.map(row => {
      const match = target.data.find(r => r[targetKey] === row[sourceKey]);
      const newRow = { ...row };
      if (match) {
        copyColumns.forEach(col => {
          newRow[`[Matches] ${col}`] = match[col];
        });
      }
      return newRow;
    });

    const newSheet: SheetData = {
      name: `VLOOKUP_${Date.now().toString().slice(-4)}`,
      data: mergedData,
      columns: Object.keys(mergedData[0] || {})
    };

    setSheets([...sheets, newSheet]);
    setActiveSheetIndex(sheets.length);
    setView('preview');
  };

  const handleAnalyze = () => {
    const { groupBy, calculate } = analysisConfig;
    const active = sheets[activeSheetIndex!];
    if (!groupBy || calculate.length === 0) return;

    const groups: Record<string, any[]> = {};
    active.data.forEach(row => {
      const key = String(row[groupBy]);
      if (!groups[key]) groups[key] = [];
      groups[key].push(row);
    });

    const analyzedData = Object.entries(groups).map(([val, rows]) => {
      const result: any = { [groupBy]: val };
      calculate.forEach(calc => {
        const key = `${calc.op}(${calc.col})`;
        if (calc.op === 'count') {
          result[key] = rows.length;
        } else if (calc.op === 'sum' || calc.op === 'avg') {
          const sum = rows.reduce((acc, r) => acc + (Number(r[calc.col]) || 0), 0);
          result[key] = calc.op === 'sum' ? sum : sum / rows.length;
        }
      });
      return result;
    });

    const newSheet: SheetData = {
      name: `分析_${Date.now().toString().slice(-4)}`,
      data: analyzedData,
      columns: Object.keys(analyzedData[0] || {})
    };

    setSheets([...sheets, newSheet]);
    setActiveSheetIndex(sheets.length);
    setView('preview');
  };

  const handleClean = () => {
    const active = sheets[activeSheetIndex!];
    // Simple deduplication
    const unique = active.data.filter((v, i, a) => a.findIndex(t => JSON.stringify(t) === JSON.stringify(v)) === i);
    
    // Fill blanks with "N/A"
    const cleaned = unique.map(row => {
      const newRow = { ...row };
      Object.keys(newRow).forEach(k => {
        if (newRow[k] === null || newRow[k] === undefined || newRow[k] === '') {
          newRow[k] = 'N/A';
        }
      });
      return newRow;
    });

    const newSheet: SheetData = {
      name: `清洗_${Date.now().toString().slice(-4)}`,
      data: cleaned,
      columns: active.columns
    };

    setSheets([...sheets, newSheet]);
    setActiveSheetIndex(sheets.length);
    setView('preview');
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 font-sans">
      {/* Header */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/" className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
              <ArrowLeft className="w-5 h-5 text-slate-600" />
            </Link>
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-indigo-600 rounded-xl">
                <FileSpreadsheet className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold tracking-tight">SheetFlow</h1>
                <p className="text-xs text-slate-400 font-medium uppercase tracking-widest">智能表格自动化处理</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 px-6 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 hover:border-indigo-600 transition-all shadow-sm"
            >
              <Upload className="w-4 h-4" />
              上传表格
            </button>
            {sheets.length > 0 && (
              <button 
                onClick={() => downloadSheet(sheets[activeSheetIndex!].data, `${sheets[activeSheetIndex!].name}_output.xlsx`)}
                className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 rounded-xl text-sm font-bold text-white hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200"
              >
                <Download className="w-4 h-4" />
                导出当前表
              </button>
            )}
          </div>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileUpload} 
            accept=".xlsx,.xls,.csv" 
            className="hidden" 
          />
        </div>
      </nav>

      <main className="max-w-7xl mx-auto p-8">
        {sheets.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-12 max-w-2xl mx-auto text-center"
          >
            <div className="aspect-[4/3] bg-white border-2 border-dashed border-slate-200 rounded-[3rem] flex flex-col items-center justify-center p-12 group hover:border-indigo-300 transition-colors cursor-pointer" onClick={() => fileInputRef.current?.click()}>
              <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                <Upload className="w-10 h-10 text-slate-300" />
              </div>
              <h2 className="text-2xl font-bold mb-4">开始处理您的数据</h2>
              <p className="text-slate-500 mb-8 leading-relaxed max-w-sm">
                支持 Excel (.xlsx, .xls) 和 CSV 格式。
                我们将为您自动匹配数据、生成透视表并清洗异常值。
              </p>
              <div className="flex gap-4">
                <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-lg border border-slate-100 text-xs text-slate-400 font-bold uppercase tracking-widest">
                  <Database className="w-3 h-3" /> 大规模匹配
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-lg border border-slate-100 text-xs text-slate-400 font-bold uppercase tracking-widest">
                  <BarChart3 className="w-3 h-3" /> 智能透视
                </div>
              </div>
            </div>
          </motion.div>
        ) : (
          <div className="grid grid-cols-12 gap-8">
            {/* Sidebar / Tools */}
            <div className="col-span-3 space-y-6">
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6">我的工作簿</h3>
                <div className="space-y-2">
                  {sheets.map((s, i) => (
                    <button 
                      key={i}
                      onClick={() => setActiveSheetIndex(i)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all ${activeSheetIndex === i ? 'bg-indigo-50 text-indigo-700 border border-indigo-100' : 'bg-transparent text-slate-500 hover:bg-slate-50'}`}
                    >
                      <FileText className="w-4 h-4 shrink-0" />
                      <span className="truncate">{s.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-white p-2 rounded-3xl border border-slate-200 shadow-sm">
                {[
                  { id: 'preview', label: '数据预览', icon: TableIcon },
                  { id: 'vlookup', label: '智能 VLOOKUP', icon: ArrowRightLeft },
                  { id: 'analyze', label: '透视分析', icon: BarChart3 },
                  { id: 'clean', label: '数据清洗', icon: Trash2 },
                ].map(item => (
                  <button 
                    key={item.id}
                    onClick={() => setView(item.id as any)}
                    className={`w-full flex items-center gap-3 px-5 py-4 rounded-2xl text-sm font-bold transition-all ${view === item.id ? 'bg-slate-900 text-white' : 'text-slate-500 hover:bg-slate-50'}`}
                  >
                    <item.icon className="w-4 h-4" />
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Content Area */}
            <div className="col-span-9 bg-white rounded-[2.5rem] border border-slate-200 shadow-xl overflow-hidden flex flex-col">
              <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center border border-slate-200 text-indigo-600 shadow-sm">
                    {view === 'preview' && <TableIcon className="w-5 h-5" />}
                    {view === 'vlookup' && <ArrowRightLeft className="w-5 h-5" />}
                    {view === 'analyze' && <BarChart3 className="w-5 h-5" />}
                    {view === 'clean' && <Trash2 className="w-5 h-5" />}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">
                      {view === 'preview' && '数据实时预览'}
                      {view === 'vlookup' && '多表关联匹配 (VLOOKUP)'}
                      {view === 'analyze' && '智能透视分析'}
                      {view === 'clean' && '数据质量优化'}
                    </h2>
                    <p className="text-xs text-slate-400 font-medium">当前工作表: {sheets[activeSheetIndex!]?.name}</p>
                  </div>
                </div>
              </div>

              <div className="flex-1 overflow-auto p-8">
                {view === 'preview' && (
                  <div className="relative">
                    <table className="w-full text-left border-collapse min-w-[800px]">
                      <thead>
                        <tr className="border-b border-slate-200">
                          {sheets[activeSheetIndex!].columns.map(col => (
                            <th key={col} className="pb-4 px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">{col}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {sheets[activeSheetIndex!].data.slice(0, 100).map((row, i) => (
                          <tr key={i} className="hover:bg-slate-50 transition-colors">
                            {sheets[activeSheetIndex!].columns.map(col => (
                              <td key={col} className="py-4 px-4 text-xs font-medium text-slate-600 max-w-[200px] truncate">{String(row[col] ?? '')}</td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {sheets[activeSheetIndex!].data.length > 100 && (
                      <div className="mt-6 py-4 bg-slate-50 rounded-2xl text-center border border-slate-100 italic text-[10px] text-slate-400 uppercase font-black tracking-widest">
                        ... 仅显示前 100 条记录 / 共 {sheets[activeSheetIndex!].data.length} 条 ...
                      </div>
                    )}
                  </div>
                )}

                {view === 'vlookup' && (
                  <div className="max-w-xl space-y-8">
                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">主数据表</label>
                        <select 
                          value={vlookupConfig.sourceSheet}
                          onChange={e => setVlookupConfig({...vlookupConfig, sourceSheet: e.target.value, sourceKey: ''})}
                          className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm font-bold focus:outline-none focus:border-indigo-600 appearance-none"
                        >
                          <option value="">选择表...</option>
                          {sheets.map(s => <option key={s.name} value={s.name}>{s.name}</option>)}
                        </select>
                      </div>
                      <div className="space-y-3">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">关联码列</label>
                        <select 
                          value={vlookupConfig.sourceKey}
                          onChange={e => setVlookupConfig({...vlookupConfig, sourceKey: e.target.value})}
                          className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm font-bold focus:outline-none focus:border-indigo-600"
                        >
                          <option value="">选择列...</option>
                          {sheets.find(s => s.name === vlookupConfig.sourceSheet)?.columns.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                      </div>
                    </div>

                    <div className="py-4 flex justify-center">
                      <div className="p-3 bg-indigo-50 rounded-full border border-indigo-100">
                        <ArrowRightLeft className="w-5 h-5 text-indigo-600" />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">查阅数据库</label>
                        <select 
                          value={vlookupConfig.targetSheet}
                          onChange={e => setVlookupConfig({...vlookupConfig, targetSheet: e.target.value, targetKey: '', copyColumns: []})}
                          className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm font-bold focus:outline-none focus:border-indigo-600"
                        >
                          <option value="">选择表...</option>
                          {sheets.map(s => <option key={s.name} value={s.name}>{s.name}</option>)}
                        </select>
                      </div>
                      <div className="space-y-3">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">匹配基准列</label>
                        <select 
                          value={vlookupConfig.targetKey}
                          onChange={e => setVlookupConfig({...vlookupConfig, targetKey: e.target.value})}
                          className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm font-bold focus:outline-none focus:border-indigo-600"
                        >
                          <option value="">选择列...</option>
                          {sheets.find(s => s.name === vlookupConfig.targetSheet)?.columns.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                      </div>
                    </div>

                    {vlookupConfig.targetSheet && (
                      <div className="pt-6">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1 block mb-4">需提取的字段</label>
                        <div className="grid grid-cols-3 gap-3">
                          {sheets.find(s => s.name === vlookupConfig.targetSheet)?.columns.map(col => (
                            <button 
                              key={col}
                              onClick={() => {
                                const exists = vlookupConfig.copyColumns.includes(col);
                                setVlookupConfig({
                                  ...vlookupConfig,
                                  copyColumns: exists 
                                    ? vlookupConfig.copyColumns.filter(c => c !== col)
                                    : [...vlookupConfig.copyColumns, col]
                                });
                              }}
                              className={`px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest border transition-all ${vlookupConfig.copyColumns.includes(col) ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-400 border-slate-200 hover:border-indigo-400'}`}
                            >
                              {col}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    <button 
                      onClick={handleVLookup}
                      disabled={!vlookupConfig.sourceKey || !vlookupConfig.targetKey || vlookupConfig.copyColumns.length === 0}
                      className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-indigo-600 transition-all disabled:opacity-50 disabled:grayscale"
                    >
                      执行智能匹配并生成新表
                    </button>
                  </div>
                )}

                {view === 'analyze' && (
                  <div className="max-w-xl space-y-8">
                    <div className="space-y-4">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">按此字段分组 (行标签)</label>
                      <select 
                        value={analysisConfig.groupBy}
                        onChange={e => setAnalysisConfig({...analysisConfig, groupBy: e.target.value})}
                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm font-bold focus:outline-none focus:border-indigo-600"
                      >
                        <option value="">选择分组字段...</option>
                        {sheets[activeSheetIndex!].columns.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>

                    <div className="space-y-4">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">数据项计算方式</label>
                      <div className="space-y-3">
                        {analysisConfig.calculate.map((calc, i) => (
                          <div key={i} className="flex gap-3 items-center">
                            <select 
                              value={calc.col}
                              onChange={e => {
                                const next = [...analysisConfig.calculate];
                                next[i].col = e.target.value;
                                setAnalysisConfig({...analysisConfig, calculate: next});
                              }}
                              className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs font-bold"
                            >
                              {sheets[activeSheetIndex!].columns.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                            <select 
                              value={calc.op}
                              onChange={e => {
                                const next = [...analysisConfig.calculate];
                                next[i].op = e.target.value as any;
                                setAnalysisConfig({...analysisConfig, calculate: next});
                              }}
                              className="w-24 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs font-bold"
                            >
                              <option value="sum">求和</option>
                              <option value="avg">平均值</option>
                              <option value="count">计数</option>
                            </select>
                            <button 
                              onClick={() => setAnalysisConfig({...analysisConfig, calculate: analysisConfig.calculate.filter((_, idx) => idx !== i)})}
                              className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                        <button 
                          onClick={() => setAnalysisConfig({...analysisConfig, calculate: [...analysisConfig.calculate, { col: sheets[activeSheetIndex!].columns[0], op: 'sum' }]})}
                          className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors"
                        >
                          <Plus className="w-4 h-4" /> 添加指标
                        </button>
                      </div>
                    </div>

                    <button 
                      onClick={handleAnalyze}
                      disabled={!analysisConfig.groupBy || analysisConfig.calculate.length === 0}
                      className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-indigo-600 transition-all disabled:opacity-50"
                    >
                      生成分析汇总表
                    </button>
                  </div>
                )}

                {view === 'clean' && (
                  <div className="max-w-2xl">
                    <div className="grid grid-cols-2 gap-6">
                      <div className="p-8 bg-slate-50 rounded-[2rem] border border-slate-200 hover:border-indigo-200 transition-all group">
                        <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center border border-slate-200 mb-6 text-indigo-600 group-hover:scale-110 transition-transform">
                          <Search className="w-6 h-6" />
                        </div>
                        <h4 className="font-bold mb-2">重复项移除</h4>
                        <p className="text-xs text-slate-500 leading-relaxed mb-6">自动识别并合并完全重复的数据行，确保数据唯一性。</p>
                        <div className="flex items-center gap-2 text-[10px] font-black text-emerald-500 uppercase tracking-widest">
                          <CheckCircle2 className="w-3 h-3" /> 算法优化已启用
                        </div>
                      </div>
                      <div className="p-8 bg-slate-50 rounded-[2rem] border border-slate-200 hover:border-indigo-200 transition-all group">
                        <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center border border-slate-200 mb-6 text-indigo-600 group-hover:scale-110 transition-transform">
                          <AlertCircle className="w-6 h-6" />
                        </div>
                        <h4 className="font-bold mb-2">空值标准化</h4>
                        <p className="text-xs text-slate-500 leading-relaxed mb-6">将所有的 Blank、Empty 统一标记为 "N/A"，方便后续统计。</p>
                        <div className="flex items-center gap-2 text-[10px] font-black text-emerald-500 uppercase tracking-widest">
                          <CheckCircle2 className="w-3 h-3" /> 全量扫描就绪
                        </div>
                      </div>
                    </div>
                    
                    <button 
                      onClick={handleClean}
                      className="w-full mt-10 py-5 bg-slate-900 text-white rounded-3xl font-bold text-lg hover:bg-indigo-600 transition-all shadow-xl shadow-slate-200"
                    >
                      开始执行深度清洗任务
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Loading Overlay */}
      <AnimatePresence>
        {loading && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center"
          >
            <div className="bg-white p-12 rounded-[3.5rem] flex flex-col items-center">
              <div className="w-16 h-16 border-4 border-slate-100 border-t-indigo-600 rounded-full animate-spin mb-6" />
              <p className="text-sm font-black text-slate-400 uppercase tracking-[0.3em]">处理中 / Processing</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error Message */}
      {error && (
        <div className="fixed bottom-8 right-8 bg-rose-50 border border-rose-200 px-6 py-4 rounded-2xl shadow-xl flex items-center gap-4 animate-in slide-in-from-right">
          <AlertCircle className="w-6 h-6 text-rose-500" />
          <div>
            <p className="font-bold text-rose-900">执行错误</p>
            <p className="text-xs text-rose-600 font-medium">{error}</p>
          </div>
          <button onClick={() => setError(null)} className="ml-4 text-rose-400 hover:text-rose-600">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
