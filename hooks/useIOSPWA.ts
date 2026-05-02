'use client';

import { useState, useEffect } from 'react';

export function useIOSPWA() {
  const [isStandalone, setIsStandalone] = useState(false);
  const [isIOSPromptVisible, setIsIOSPromptVisible] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Check if the PWA is already installed
      const isStandaloneMode =
        window.matchMedia('(display-mode: standalone)').matches ||
        !!(window.navigator as any).standalone;
      
      setIsStandalone(isStandaloneMode);

      // Check for iOS Safari specifically
      const userAgent = window.navigator.userAgent.toLowerCase();
      const isIOS = /iphone|ipad|ipod/.test(userAgent);
      const isChromeIOS = /crios/.test(userAgent);
      
      // Standard iOS Safari user agent contains "safari" and does not contain "crios"
      const isIOSSafari = isIOS && /safari/.test(userAgent) && !isChromeIOS;

      // The prompt should be visible ONLY IF it's iOS Safari AND not standalone
      setIsIOSPromptVisible(isIOSSafari && !isStandaloneMode);
    }
  }, []);

  return { isIOSPromptVisible, isStandalone };
}
