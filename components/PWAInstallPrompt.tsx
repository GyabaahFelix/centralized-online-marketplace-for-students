import React, { useEffect, useState } from 'react';
import { Card, Button } from './UI';

export const PWAInstallPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [platform, setPlatform] = useState<'ios' | 'android' | 'other'>('other');
  const [step, setStep] = useState<'prompt' | 'ios-guide'>('prompt');

  useEffect(() => {
    // 1. Detect platform
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIOS = /iphone|ipad|ipod/.test(userAgent);
    const isAndroid = /android/.test(userAgent);
    
    if (isIOS) {
      setPlatform('ios');
    } else if (isAndroid) {
      setPlatform('android');
    }

    // 2. Check if already running in standalone/installed mode
    const isStandalone = 
      window.matchMedia('(display-mode: standalone)').matches || 
      (window.navigator as any).standalone === true;

    if (isStandalone) {
      console.log('LYNQED: App is already running in standalone mode.');
      return;
    }

    // 3. Check localStorage for recent dismissal
    const dismissedAt = localStorage.getItem('lynqed_install_prompt_dismissed_at');
    if (dismissedAt) {
      const elapsed = Date.now() - parseInt(dismissedAt, 10);
      const SEVEN_DAYS = 7 * 24 * 60 * 60 * 1000;
      if (elapsed < SEVEN_DAYS) {
        return;
      }
    }

    // 4. Listen for beforeinstallprompt event (Android / Desktop Chrome / Edge)
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      // Wait 4 seconds on launch to show prompt seamlessly
      const timer = setTimeout(() => {
        setShowPrompt(true);
      }, 4000);
      return () => clearTimeout(timer);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // 5. For iOS users, we don't get beforeinstallprompt, so we trigger a custom guide after 6 seconds
    if (isIOS) {
      const timer = setTimeout(() => {
        setShowPrompt(true);
      }, 6000);
      return () => {
        clearTimeout(timer);
        window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      };
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (platform === 'ios') {
      setStep('ios-guide');
    } else if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      console.log(`LYNQED installation outcome: ${outcome}`);
      setDeferredPrompt(null);
      setShowPrompt(false);
    } else {
      // Fallback: If no deferred prompt is captured (e.g. on other browsers), display custom standard instructions
      setStep('ios-guide'); // Reuse step guide with generalized instructions
    }
  };

  const handleDismiss = () => {
    localStorage.setItem('lynqed_install_prompt_dismissed_at', Date.now().toString());
    setShowPrompt(false);
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed inset-0 z-[10000] bg-black/60 backdrop-blur-md flex items-end sm:items-center justify-center p-4 sm:p-6 animate-fade-in">
      <Card className="w-full max-w-md bg-white dark:bg-darkSurface rounded-[2.5rem] p-6 sm:p-8 shadow-[0_25px_60px_-15px_rgba(168,85,247,0.3)] border-2 border-primary/10 overflow-hidden animate-slide-up relative">
        
        {/* Decorative ambient background blur inside card */}
        <div className="absolute top-[-20%] right-[-20%] w-48 h-48 bg-primary/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-[-20%] left-[-20%] w-48 h-48 bg-accent/10 rounded-full blur-3xl pointer-events-none"></div>

        {step === 'prompt' ? (
          <div className="relative text-center flex flex-col items-center">
            {/* App Icon Container */}
            <div className="relative mb-5 group">
              <div className="absolute inset-0 bg-primary/20 rounded-[2rem] blur-xl group-hover:scale-110 transition-transform duration-500"></div>
              <div className="relative w-20 h-20 bg-gradient-to-tr from-primary to-accent rounded-[2rem] flex items-center justify-center p-0.5 shadow-md">
                <div className="w-full h-full bg-white dark:bg-darkBg rounded-[1.85rem] flex items-center justify-center overflow-hidden">
                  <img 
                    src="https://suschmjoogvoufhozbet.supabase.co/storage/v1/object/public/lynqed-assets/Lynqed_Logo.png" 
                    alt="LYNQED Logo" 
                    className="w-14 h-14 object-contain"
                  />
                </div>
              </div>
            </div>

            {/* Title & Description */}
            <h3 className="text-2xl font-black text-gray-900 dark:text-white font-display tracking-tight mb-2">
              Install LYNQED App
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 font-bold max-w-sm mb-6 leading-relaxed">
              Get the full mobile experience on your device! Fast loading, push notifications, and seamless campus trading.
            </p>

            {/* Install Features Bento Grid */}
            <div className="grid grid-cols-3 gap-3 w-full mb-8">
              <div className="bg-gray-50 dark:bg-darkBg/60 p-3 rounded-2xl border border-gray-100 dark:border-gray-800/40 flex flex-col items-center justify-center">
                <i className="fa-solid fa-bolt text-lg text-primary mb-1"></i>
                <span className="text-[9px] font-black uppercase text-gray-400">Super Fast</span>
              </div>
              <div className="bg-gray-50 dark:bg-darkBg/60 p-3 rounded-2xl border border-gray-100 dark:border-gray-800/40 flex flex-col items-center justify-center">
                <i className="fa-solid fa-bell text-lg text-accent mb-1 animate-bounce-slight"></i>
                <span className="text-[9px] font-black uppercase text-gray-400">Push Alerts</span>
              </div>
              <div className="bg-gray-50 dark:bg-darkBg/60 p-3 rounded-2xl border border-gray-100 dark:border-gray-800/40 flex flex-col items-center justify-center">
                <i className="fa-solid fa-layer-group text-lg text-indigo-500 mb-1"></i>
                <span className="text-[9px] font-black uppercase text-gray-400">Offline Run</span>
              </div>
            </div>

            {/* Call to Actions */}
            <div className="flex flex-col gap-3 w-full">
              <Button 
                onClick={handleInstallClick}
                className="w-full py-4 text-sm font-black uppercase tracking-wider rounded-2xl"
              >
                Add LYNQED to Device
              </Button>
              <button 
                onClick={handleDismiss}
                className="text-xs font-black text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors py-2 uppercase tracking-widest mt-1"
              >
                Maybe Later
              </button>
            </div>
          </div>
        ) : (
          <div className="relative text-left">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-black text-gray-900 dark:text-white font-display flex items-center gap-2">
                <i className="fa-solid fa-circle-info text-primary"></i>
                Easy Installation Guide
              </h3>
              <button 
                onClick={() => setStep('prompt')}
                className="w-8 h-8 rounded-full bg-gray-50 dark:bg-gray-800 flex items-center justify-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
              >
                <i className="fa-solid fa-arrow-left"></i>
              </button>
            </div>

            <p className="text-xs text-gray-500 dark:text-gray-400 font-bold mb-6">
              Follow these simple steps to install LYNQED on your {platform === 'ios' ? 'iPhone' : 'browser'}:
            </p>

            {/* Visual Guideline Steps */}
            <div className="space-y-4 mb-8">
              {platform === 'ios' ? (
                <>
                  <div className="flex gap-4 items-start bg-gray-50 dark:bg-darkBg/40 p-4 rounded-2xl border border-gray-100 dark:border-gray-800/40">
                    <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-black text-sm flex-shrink-0">1</div>
                    <div>
                      <p className="text-xs font-black text-gray-800 dark:text-gray-200">Open Share Menu</p>
                      <p className="text-[11px] text-gray-400 font-bold mt-1">
                        Tap the share icon <span className="inline-flex items-center justify-center w-5 h-5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded text-[10px] text-gray-600 dark:text-gray-300 mx-0.5"><i className="fa-solid fa-arrow-up-from-bracket"></i></span> at the bottom of Safari.
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-4 items-start bg-gray-50 dark:bg-darkBg/40 p-4 rounded-2xl border border-gray-100 dark:border-gray-800/40">
                    <div className="w-8 h-8 rounded-xl bg-accent/10 text-accent flex items-center justify-center font-black text-sm flex-shrink-0">2</div>
                    <div>
                      <p className="text-xs font-black text-gray-800 dark:text-gray-200">Select Add to Home Screen</p>
                      <p className="text-[11px] text-gray-400 font-bold mt-1">
                        Scroll down the share list and tap <span className="font-black text-gray-600 dark:text-gray-300">"Add to Home Screen"</span> <span className="inline-flex items-center justify-center w-5 h-5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded text-[10px] text-gray-600 dark:text-gray-300 mx-0.5"><i className="fa-regular fa-square-plus"></i></span>.
                      </p>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex gap-4 items-start bg-gray-50 dark:bg-darkBg/40 p-4 rounded-2xl border border-gray-100 dark:border-gray-800/40">
                    <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-black text-sm flex-shrink-0">1</div>
                    <div>
                      <p className="text-xs font-black text-gray-800 dark:text-gray-200">Open Browser Options</p>
                      <p className="text-[11px] text-gray-400 font-bold mt-1">
                        Tap the browser settings icon (usually 3 vertical dots <i className="fa-solid fa-ellipsis-vertical"></i> or menu icon) in your address bar.
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-4 items-start bg-gray-50 dark:bg-darkBg/40 p-4 rounded-2xl border border-gray-100 dark:border-gray-800/40">
                    <div className="w-8 h-8 rounded-xl bg-accent/10 text-accent flex items-center justify-center font-black text-sm flex-shrink-0">2</div>
                    <div>
                      <p className="text-xs font-black text-gray-800 dark:text-gray-200">Install / Add to Home Screen</p>
                      <p className="text-[11px] text-gray-400 font-bold mt-1">
                        Select <span className="font-black text-gray-600 dark:text-gray-300">"Install App"</span> or <span className="font-black text-gray-600 dark:text-gray-300">"Add to Home screen"</span> to save LYNQED as a native app icon.
                      </p>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Action buttons */}
            <Button 
              onClick={handleDismiss}
              className="w-full py-4 text-sm font-black uppercase tracking-wider rounded-2xl"
            >
              Got It, Thanks!
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
};
