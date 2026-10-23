import React, { useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { Download, Monitor, Check } from 'lucide-react';

interface PWAInstallButtonProps {
  onOpenWindowsModal?: () => void;
  className?: string;
  compact?: boolean;
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({
  onOpenWindowsModal,
  className = '',
  compact = false,
}) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  // If already running inside standalone desktop window mode, show a sleek badge or hide
  if (isInstalled) {
    return (
      <button
        onClick={onOpenWindowsModal}
        title="Windows Desktop App aktiv (Klicken für Desktop-Zentrale)"
        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-emerald-950/60 border border-emerald-800/80 text-emerald-300 text-xs font-medium hover:bg-emerald-900/60 transition cursor-pointer ${className}`}
      >
        <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
        <Monitor className="w-3.5 h-3.5" />
        {!compact && <span>Desktop App</span>}
      </button>
    );
  }

  // Windows / Chromium direct install flow
  const handleClick = async () => {
    if (isInstallable) {
      await install();
    } else if (onOpenWindowsModal) {
      onOpenWindowsModal();
    }
  };

  if (isIOS) {
    return (
      <>
        <button
          onClick={() => setShowIOSGuide(true)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-700 bg-slate-900/80 hover:bg-slate-800 text-slate-300 text-xs font-medium transition cursor-pointer ${className}`}
        >
          <Download className="w-3.5 h-3.5 text-cyan-400" />
          <span>App installieren</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
            <div className="w-full max-w-sm rounded-2xl bg-[#0f172a] border border-slate-700 p-6 shadow-2xl text-slate-200">
              <h3 className="text-base font-bold text-white mb-2">Auf iPhone / iPad installieren</h3>
              <p className="text-xs text-slate-400 mb-4 leading-relaxed">
                1. Tippe unten auf den <strong>Teilen</strong>-Button (Viereck mit Pfeil nach oben).<br />
                2. Scrolle nach unten und wähle <strong>Zum Home-Bildschirm</strong>.
              </p>
              <button
                onClick={() => setShowIOSGuide(false)}
                className="w-full py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 font-bold text-black text-xs transition cursor-pointer"
              >
                Verstanden
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return (
    <button
      onClick={handleClick}
      title="Als Windows Desktop App installieren"
      className={`flex items-center gap-2 px-3 py-1.5 rounded-xl bg-gradient-to-r from-cyan-950/80 to-blue-950/80 hover:from-cyan-900 hover:to-blue-900 border border-cyan-800 text-cyan-300 hover:text-white text-xs font-semibold shadow-md shadow-cyan-950/30 transition cursor-pointer group ${className}`}
    >
      {/* Windows 4-pane mini logo */}
      <svg className="w-3.5 h-3.5 fill-current text-cyan-400 group-hover:scale-110 transition" viewBox="0 0 24 24">
        <path d="M0 3.449L9.75 2.1v9.451H0m10.949-9.602L24 0v11.4H10.949M0 12.6h9.75v9.451L0 20.699M10.949 12.6H24V24l-12.949-1.801" />
      </svg>
      <span>{compact ? 'Desktop' : 'Windows App'}</span>
    </button>
  );
};
