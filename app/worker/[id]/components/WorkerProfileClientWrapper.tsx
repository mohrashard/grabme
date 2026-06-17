'use client';

import React, { useState, useEffect } from 'react';
import { ThemeContext } from './ThemeContext';

interface WorkerProfileClientWrapperProps {
  children: React.ReactNode;
}

export default function WorkerProfileClientWrapper({ children }: WorkerProfileClientWrapperProps) {
  // Default is 'light' to match the product branding
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    const savedTheme = localStorage.getItem('grabme-worker-theme') as 'light' | 'dark' | null;
    if (savedTheme === 'light' || savedTheme === 'dark') {
      setTheme(savedTheme);
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('grabme-worker-theme', newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {/* The `.dark` class is placed here so all `dark:` Tailwind classes below it respond */}
      <div className={theme === 'dark' ? 'dark' : ''}>
        <div className="min-h-[100dvh] bg-[#f8fafc] text-[#0f172a] dark:bg-[#050b18] dark:text-white font-outfit pb-32 md:pb-0 relative overflow-x-hidden">
          {children}
        </div>
      </div>
    </ThemeContext.Provider>
  );
}
