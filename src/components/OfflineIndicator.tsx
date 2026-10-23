import React from 'react';
import { useOnlineStatus } from '../hooks/usePWAInstall';
import { WifiOff } from 'lucide-react';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div className="fixed bottom-4 left-4 z-50 flex items-center gap-2.5 rounded-xl bg-amber-500/95 text-black px-3.5 py-2 text-xs font-bold shadow-2xl backdrop-blur border border-amber-400 animate-bounce">
      <WifiOff className="w-4 h-4" />
      <span>Offline-Modus — Lokaler Desktop-Cache aktiv</span>
    </div>
  );
};
