"use client";

import { useEffect, useState } from 'react';

export default function ClientClock() {
  const [currentTime, setCurrentTime] = useState('');
  const [timezone, setTimezone] = useState('');

  useEffect(() => {
    // 获取客户端时区
    const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    setTimezone(userTimezone);

    // 更新时间函数
    const updateTime = () => {
      const now = new Date();
      const formattedTime = now.toLocaleTimeString('en-US', {
        hour12: true,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        timeZone: userTimezone
      });
      setCurrentTime(formattedTime);
    };

    // 初始更新
    updateTime();

    // 设置每秒更新
    const intervalId = setInterval(updateTime, 1000);

    // 清除interval
    return () => clearInterval(intervalId);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center p-6 bg-background/30 backdrop-blur-sm rounded-2xl border border-gray-800 shadow-lg w-full max-w-md mx-auto">
      <div className="text-4xl font-mono font-bold mb-2">
        {currentTime || 'Loading...'}
      </div>
      <div className="text-sm text-gray-400 flex items-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <polyline points="12 6 12 12 16 14"></polyline>
        </svg>
        {timezone || 'Detecting timezone...'}
      </div>
    </div>
  );
}