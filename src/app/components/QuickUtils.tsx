// src/app/components/QuickUtils.tsx
"use client";
import { useState, useEffect } from 'react';

export default function TimestampConverter() {
  // 固定初始值，避免 SSR 与客户端首次渲染的秒数不一致导致 hydration 报错；
  // 真实时间在挂载后的 useEffect 里写入。
  const [now, setNow] = useState(0);
  const [input, setInput] = useState('');
  const [copyLabel, setCopyLabel] = useState('Copy');

  // 实时更新当前时间戳
  useEffect(() => {
    setNow(Math.floor(Date.now() / 1000));
    const timer = setInterval(() => setNow(Math.floor(Date.now() / 1000)), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleCopy = (val: string) => {
    if (!val || val === '0') return;
    navigator.clipboard.writeText(val);
    setCopyLabel('Saved!');
    setTimeout(() => setCopyLabel('Copy'), 2000);
  };

  const convertTimestamp = (val: string) => {
    if (!val) return 'Waiting for input...';
    const num = parseInt(val);
    if (isNaN(num)) return 'Invalid Timestamp';
    
    // 处理秒或毫秒
    const date = new Date(num < 10000000000 ? num * 1000 : num);
    return date.toLocaleString('en-US', { hour12: false });
  };

  return (
    <div className="w-full bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl overflow-hidden shadow-sm hover:border-[#F97316]/30 transition-all group">
      {/* 顶部实时状态栏 */}
      <div className="px-4 py-2 border-b border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/[0.02] flex justify-between items-center">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#F97316] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#F97316]"></span>
          </span>
          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Current Epoch</span>
        </div>
        <button 
          onClick={() => handleCopy(now.toString())}
          className="text-[10px] font-mono font-bold text-[#F97316] hover:underline"
        >
          {now > 0 ? `${now} · ${copyLabel}` : copyLabel}
        </button>
      </div>

      {/* 转换交互区 */}
      <div className="p-4 flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Paste Unix Timestamp..."
            className="w-full px-3 py-2 rounded-lg bg-slate-100 dark:bg-white/10 border border-slate-300 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-[#F97316]/50 focus:border-[#F97316]/70 transition-colors"
          />
        </div>
        <div className="flex-1 flex items-center px-3 py-2 rounded-lg">
          <span className="font-mono">
            {convertTimestamp(input)}
          </span>
        </div>
      </div>
    </div>
  );
}