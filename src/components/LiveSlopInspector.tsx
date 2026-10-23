import React from 'react';
import { ShieldAlert, CheckCircle2, Activity, Sparkles, AlertTriangle } from 'lucide-react';
import { analyzeSlopMetrics } from '../utils/slopSanitizer';

interface LiveSlopInspectorProps {
  text: string;
}

export const LiveSlopInspector: React.FC<LiveSlopInspectorProps> = ({ text }) => {
  if (!text || text.trim().length < 15) {
    return null;
  }

  const metrics = analyzeSlopMetrics(text);
  const isVetoActive = metrics.slopHits.length > 0 || metrics.burstiness < 6.0;

  return (
    <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3.5 space-y-2.5 animate-fadeIn font-sans">
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <span className="font-bold text-slate-300 uppercase tracking-wider text-[10px] flex items-center gap-1">
            <Activity className="w-3.5 h-3.5 text-cyan-400" />
            <span>Echtzeit Slop- & Burstiness-Forensik</span>
          </span>
          <span className="text-[10px] text-slate-500 font-mono">({metrics.avgSentenceWords} W./Satz)</span>
        </div>

        <div className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono border flex items-center gap-1 ${
          isVetoActive
            ? 'bg-red-950/80 text-red-400 border-red-800'
            : 'bg-emerald-950/80 text-emerald-400 border-emerald-800'
        }`}>
          {isVetoActive ? (
            <>
              <AlertTriangle className="w-3 h-3 text-red-400" />
              <span>CODE-VETO AKTIV</span>
            </>
          ) : (
            <>
              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
              <span>SLOP-REIN (GATE-READY)</span>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 text-center text-xs">
        <div className="bg-slate-900 rounded-lg p-2 border border-slate-800">
          <div className="text-[10px] text-slate-400">Burstiness</div>
          <div className={`text-base font-black font-mono mt-0.5 ${
            metrics.burstiness >= 8.5 ? 'text-cyan-400' : metrics.burstiness >= 6.5 ? 'text-amber-400' : 'text-red-400'
          }`}>
            {metrics.burstiness}
          </div>
          <div className="text-[9px] text-slate-500">
            {metrics.burstiness >= 8.5 ? 'Menschlich' : 'Monoton'}
          </div>
        </div>

        <div className="bg-slate-900 rounded-lg p-2 border border-slate-800">
          <div className="text-[10px] text-slate-400">Slop-Toxizität</div>
          <div className={`text-base font-black font-mono mt-0.5 ${
            metrics.slopToxicity <= 20 ? 'text-emerald-400' : metrics.slopToxicity <= 45 ? 'text-amber-400' : 'text-red-400'
          }`}>
            {metrics.slopToxicity}%
          </div>
          <div className="text-[9px] text-slate-500">
            {metrics.slopToxicity <= 20 ? 'Gering' : 'Rauschen'}
          </div>
        </div>

        <div className="bg-slate-900 rounded-lg p-2 border border-slate-800">
          <div className="text-[10px] text-slate-400">GPT-Marker</div>
          <div className={`text-base font-black font-mono mt-0.5 ${
            metrics.hitCount === 0 ? 'text-emerald-400' : 'text-red-400'
          }`}>
            {metrics.hitCount}
          </div>
          <div className="text-[9px] text-slate-500">Treffer</div>
        </div>
      </div>

      {metrics.slopHits.length > 0 && (
        <div className="space-y-1 pt-1">
          <span className="text-[10px] font-semibold text-red-400 uppercase tracking-wide">
            Gefundene Verbotene Floskeln:
          </span>
          <div className="flex flex-wrap gap-1.5">
            {metrics.slopHits.map((hit, idx) => (
              <span
                key={idx}
                className="bg-red-950/90 text-red-300 border border-red-800 px-2 py-0.5 rounded text-[10px] font-mono"
              >
                „{hit}“
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
