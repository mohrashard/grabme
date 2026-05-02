'use client';

import { useState, useEffect } from 'react';
import { useIOSPWA } from '@/hooks/useIOSPWA';

export default function InstallPrompt() {
  const [isDismissed, setIsDismissed] = useState(true);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  const [isAndroid, setIsAndroid] = useState(false);
  const { isIOSPromptVisible, isStandalone } = useIOSPWA();

  useEffect(() => {
    // a) Check localStorage for prompt dismissal
    const dismissed = localStorage.getItem('pwa_prompt_dismissed');
    if (!dismissed) {
      setIsDismissed(false);
    }

    // Detect Android
    setIsAndroid(/android/i.test(navigator.userAgent));

    // b) Add event listener for Android install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    // Check if the event already fired before React hydrated
    if ((window as any).deferredPWAEvent) {
      setDeferredPrompt((window as any).deferredPWAEvent);
    }

    // DEBUG FALLBACK: Force the banner to show if URL contains ?debug_pwa=true
    if (window.location.search.includes('debug_pwa=true')) {
      localStorage.removeItem('pwa_prompt_dismissed');
      setIsDismissed(false);
      setDeferredPrompt({ prompt: () => alert('Debug mode: Native prompt would open here.') });
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleDismiss = () => {
    setIsDismissed(true);
    localStorage.setItem('pwa_prompt_dismissed', 'true');
  };

  if (isDismissed) {
    return null;
  }

  // Android UI
  if (deferredPrompt) {
    return (
      <div className="fixed bottom-0 left-0 right-0 z-50 backdrop-blur-md bg-white/80 dark:bg-black/80 border-t border-gray-200 dark:border-gray-800 p-4 flex items-center justify-between shadow-lg">
        <p className="text-sm font-medium text-gray-900 dark:text-gray-100 pr-4">
          Install GrabMe for a faster experience
        </p>
        <div className="flex items-center gap-3">
          <button
            onClick={() => deferredPrompt.prompt()}
            className="whitespace-nowrap rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2"
          >
            Install App
          </button>
          <button
            onClick={handleDismiss}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            aria-label="Close"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    );
  }

  // Android UI (Fallback for Manual Install if event didn't fire)
  if (isAndroid && !isStandalone) {
    return (
      <div className="fixed bottom-0 left-0 right-0 z-50 backdrop-blur-md bg-white/80 dark:bg-black/80 border-t border-gray-200 dark:border-gray-800 p-4 shadow-lg flex items-start justify-between gap-4">
        <div className="flex-1">
          <p className="text-sm text-gray-900 dark:text-gray-100 leading-relaxed">
            To install the app, tap your browser's <strong className="font-bold">3-dot menu</strong> and select <strong className="font-bold">Install app</strong> or <strong className="font-bold">Add to Home screen</strong>.
          </p>
        </div>
        <button
          onClick={handleDismiss}
          className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 pt-0.5 shrink-0"
          aria-label="Close"
        >
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    );
  }

  // iOS UI
  if (isIOSPromptVisible) {
    return (
      <div className="fixed bottom-0 left-0 right-0 z-50 backdrop-blur-md bg-white/80 dark:bg-black/80 border-t border-gray-200 dark:border-gray-800 p-4 shadow-lg flex items-start justify-between gap-4">
        <div className="flex-1">
          <p className="text-sm text-gray-900 dark:text-gray-100 leading-relaxed flex flex-wrap items-center gap-x-1">
            To install the app, tap the Share icon 
            <span className="inline-flex items-center justify-center translate-y-[2px]">
              <svg className="h-5 w-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8M12 3v13M8 7l4-4 4 4" />
              </svg>
            </span>
            below and select Add to Home Screen 
            <span className="inline-flex items-center justify-center translate-y-[2px]">
              <svg className="h-5 w-5 text-gray-700 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <rect x="4" y="4" width="16" height="16" rx="2" strokeWidth={2} />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v8m-4-4h8" />
              </svg>
            </span>
            .
          </p>
        </div>
        <button
          onClick={handleDismiss}
          className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 pt-0.5 shrink-0"
          aria-label="Close"
        >
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    );
  }

  return null;
}
