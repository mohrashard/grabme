'use client';

import React, { useState, useLayoutEffect } from 'react';
import { ThemeContext } from './ThemeContext';

interface WorkerProfileClientWrapperProps {
  children: React.ReactNode;
}

// Read theme from localStorage synchronously before first paint.
// This prevents the "theme flash" glitch on mobile where the page briefly
// renders in the wrong theme before the useEffect fires.
function getInitialTheme(): 'light' | 'dark' {
  if (typeof window === 'undefined') return 'light';
  try {
    const saved = localStorage.getItem('grabme-worker-theme');
    if (saved === 'dark' || saved === 'light') return saved;
  } catch {
    // localStorage not available (e.g. private browsing on some iOS)
  }
  return 'light';
}

export default function WorkerProfileClientWrapper({ children }: WorkerProfileClientWrapperProps) {
  const [theme, setTheme] = useState<'light' | 'dark'>(getInitialTheme);

  // useLayoutEffect fires synchronously after DOM mutations but before the browser paints.
  // On mobile, this ensures the correct dark/light class is applied before any pixel is shown,
  // completely eliminating the flash/repaint glitch on Android and iOS.
  useLayoutEffect(() => {
    const saved = localStorage.getItem('grabme-worker-theme') as 'light' | 'dark' | null;
    if (saved === 'light' || saved === 'dark') {
      setTheme(saved);
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    try {
      localStorage.setItem('grabme-worker-theme', newTheme);
    } catch { /* ignore */ }
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {/* .dark class drives all dark: Tailwind variants below */}
      <div className={theme === 'dark' ? 'dark' : ''}>
        {/*
          Mobile performance notes:
          - NO transition on this root div: theme toggling would trigger a full-page
            repaint on Android/iOS which causes the overlapping-card glitch.
          - NO transform-gpu here: promoting the root to a GPU layer on low-end
            Android devices causes excessive VRAM pressure and compositor jank.
          - overflow-x-hidden is kept to prevent horizontal scroll on narrow screens.
          - will-change is intentionally omitted — it creates new stacking contexts
            that break fixed positioning of the sticky header and bottom bar on iOS.
        */}
        <div className="min-h-[100dvh] bg-[#f8fafc] text-[#0f172a] dark:bg-[#050b18] dark:text-white font-outfit pb-32 md:pb-0 relative overflow-x-hidden">
          {children}
        </div>
      </div>
    </ThemeContext.Provider>
  );
}
