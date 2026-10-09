/**
 * ASTRA Health - PWA Install Component
 * Provides clean in-app install button and iOS Safari guidance.
 */

import React, { useState } from 'react';
import { usePWAInstall } from '../../hooks/usePWAInstall';
import { Download, Share2, X, Smartphone } from 'lucide-react';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  if (isInstalled) {
    return null;
  }

  if (isInstallable) {
    return (
      <button
        id="pwa-install-btn"
        onClick={install}
        className="flex items-center gap-2 rounded-lg bg-cyan-600/90 hover:bg-cyan-500 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition border border-cyan-400/30 cursor-pointer"
        title="Install ASTRA Health as a standalone offline PWA"
      >
        <Download className="w-3.5 h-3.5" />
        <span>Install PWA</span>
      </button>
    );
  }

  if (isIOS) {
    return (
      <>
        <button
          id="pwa-ios-install-btn"
          onClick={() => setShowIOSGuide(true)}
          className="flex items-center gap-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 px-3 py-1.5 text-xs font-medium text-slate-200 border border-slate-700 transition cursor-pointer"
        >
          <Smartphone className="w-3.5 h-3.5 text-cyan-400" />
          <span>Install App</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
            <div className="w-full max-w-sm rounded-xl bg-slate-900 border border-slate-700 p-6 shadow-2xl text-slate-100">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-semibold flex items-center gap-2">
                  <Share2 className="w-4 h-4 text-cyan-400" />
                  Install on iOS Safari
                </h3>
                <button
                  onClick={() => setShowIOSGuide(false)}
                  className="text-slate-400 hover:text-white p-1"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <p className="text-sm text-slate-300 mb-4 leading-relaxed">
                To run ASTRA offline during mission ops without internet:
              </p>
              <ol className="text-xs text-slate-300 space-y-2 list-decimal list-inside bg-slate-950/60 p-3.5 rounded-lg border border-slate-800 mb-4">
                <li>Tap the <strong>Share</strong> button in Safari toolbar</li>
                <li>Scroll down and tap <strong>Add to Home Screen</strong></li>
                <li>Launch ASTRA from your home screen for full offline mode</li>
              </ol>
              <button
                onClick={() => setShowIOSGuide(false)}
                className="w-full py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-xs font-semibold text-white transition"
              >
                Understood
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};
