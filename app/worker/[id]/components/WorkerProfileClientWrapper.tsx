'use client';

import React, { useState, useLayoutEffect, useRef } from 'react';
import { ThemeContext } from './ThemeContext';

interface WorkerProfileClientWrapperProps {
  children: React.ReactNode;
}

export default function WorkerProfileClientWrapper({ children }: WorkerProfileClientWrapperProps) {
  // Always start 'light' — matches server render. No hydration mismatch.
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const rootRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    // Runs synchronously before the browser paints.
    // We apply the dark class directly to the DOM element via classList —
    // NOT via React state. This means React never does a reconciliation
    // re-render of the entire page tree, which was causing the mobile glitch.
    let saved: 'light' | 'dark' = 'light';
    try {
      const val = localStorage.getItem('grabme-worker-theme');
      if (val === 'dark' || val === 'light') saved = val;
    } catch { /* private browsing on iOS */ }

    if (saved === 'dark' && rootRef.current) {
      rootRef.current.classList.add('dark');
    }
    // Only update state for ThemeToggle icon — does NOT re-render children
    // because children are RSC nodes passed as props (opaque to React reconciler)
    setTheme(saved);
  }, []);

  const toggleTheme = () => {
    const next = theme === 'light' ? 'dark' : 'light';
    // Toggle class directly on DOM — no React re-render of the page tree
    rootRef.current?.classList.toggle('dark', next === 'dark');
    setTheme(next);
    try { localStorage.setItem('grabme-worker-theme', next); } catch { /* ignore */ }
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {/*
        suppressHydrationWarning: server renders this div without 'dark'.
        Our useLayoutEffect may add 'dark' before first paint via classList.
        We tell React to ignore this div's attribute differences during hydration
        so it never triggers a correction re-render for the class mismatch.
      */}
      <div ref={rootRef} suppressHydrationWarning>
        <div className="min-h-[100dvh] bg-[#f8fafc] text-[#0f172a] dark:bg-[#050b18] dark:text-white font-outfit pb-32 md:pb-0 relative overflow-x-hidden">
          {children}
        </div>
      </div>
    </ThemeContext.Provider>
  );
}
