"use client";

import { useEffect, useState } from 'react';

export default function ClientClock() {
  const [currentTime, setCurrentTime] = useState('');
  const [timezone, setTimezone] = useState('');

  useEffect(() => {
    const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    setTimezone(userTimezone);

    const updateTime = () => {
      const now = new Date();
      const formattedTime = now.toLocaleTimeString('en-US', {
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        timeZone: userTimezone
      });
      setCurrentTime(formattedTime);
    };

    updateTime();
    const intervalId = setInterval(updateTime, 1000);
    return () => clearInterval(intervalId);
  }, []);

  return (
    <div className="relative group">
      <div className="relative flex flex-col items-center justify-center p-8 
                      bg-white/70 dark:bg-white/10 
                      backdrop-blur-xl 
                      border border-black/[0.05] dark:border-white/20 
                      rounded-3xl 
                      shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] dark:shadow-2xl
                      overflow-hidden
                      transition-colors duration-500
                      w-full max-w-md mx-auto">
        
        <div className="absolute inset-0 bg-gradient-to-br from-white/40 dark:from-white/20 via-transparent to-transparent pointer-events-none" />
        
        <div className="text-5xl font-mono font-black mb-3 tracking-tighter text-slate-800 dark:text-white drop-shadow-sm">
          {currentTime || '00:00:00'}
        </div>

        <div className="text-xs font-semibold uppercase tracking-widest 
                        text-slate-500 dark:text-white/60 
                        flex items-center gap-2 px-4 py-1.5 
                        bg-slate-200/50 dark:bg-black/20 
                        rounded-full border border-black/[0.03] dark:border-white/5">
          <svg className="animate-pulse" xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <polyline points="12 6 12 12 16 14"></polyline>
          </svg>
          {timezone || 'Detecting...'}
        </div>
      </div>
    </div>
  );
}