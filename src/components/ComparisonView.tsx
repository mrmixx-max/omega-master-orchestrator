import React, { useState } from 'react';
import { Scale, ArrowRight, TrendingUp, TrendingDown, Eye, Check } from 'lucide-react';
import { AuditRun } from '../types';

interface ComparisonViewProps {
  dossiers: AuditRun[];
  onSelectAudit: (audit: AuditRun) => void;
}

export const ComparisonView: React.FC<ComparisonViewProps> = ({
  dossiers,
  onSelectAudit,
}) => {
  const [selectedIdA, setSelectedIdA] = useState<string>(dossiers[0]?.id || '');
  const [selectedIdB, setSelectedIdB] = useState<string>(dossiers[1]?.id || dossiers[0]?.id || '');

  const auditA = dossiers.find(d => d.id === selectedIdA) || dossiers[0];
  const auditB = dossiers.find(d => d.id === selectedIdB) || dossiers[1] || dossiers[0];

  if (!auditA) {
    return (
      <div className="text-center py-12 text-slate-500">
        Keine Dossiers in der Historie gefunden. Führen Sie zuerst mindestens einen Audit durch.
      </div>
    );
  }

  const convDeltaA = auditA.convScoreAfter - auditA.convScoreBefore;
  const convDeltaB = auditB ? auditB.convScoreAfter - auditB.convScoreBefore : 0;

  return (
    <div className="max-w-6xl mx-auto space-y-8 py-2">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Scale className="w-5 h-5 text-purple-400" />
            <span>OMEGA Dossier-Vergleich (Side-by-Side)</span>
          </h2>
          <p className="text-xs text-slate-400">
            Vergleichen Sie zwei Audits nebeneinander, um Verbesserungen in Conversion, Slop-Sanitization und Burstiness zu analysieren.
          </p>
        </div>
      </div>

      {/* Selector Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-[#111827] border border-[#1f2937] rounded-xl p-4">
          <label className="block text-xs font-semibold text-cyan-400 mb-2">Audit #1 (Referenz)</label>
          <select
            value={selectedIdA}
            onChange={(e) => setSelectedIdA(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-cyan-500"
          >
            {dossiers.map(d => (
              <option key={d.id} value={d.id}>
                {d.targetSource.slice(0, 35)}... ({d.niche}) — {new Date(d.timestamp).toLocaleDateString()}
              </option>
            ))}
          </select>
        </div>

        <div className="bg-[#111827] border border-[#1f2937] rounded-xl p-4">
          <label className="block text-xs font-semibold text-emerald-400 mb-2">Audit #2 (Vergleich)</label>
          <select
            value={selectedIdB}
            onChange={(e) => setSelectedIdB(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
          >
            {dossiers.map(d => (
              <option key={d.id} value={d.id}>
                {d.targetSource.slice(0, 35)}... ({d.niche}) — {new Date(d.timestamp).toLocaleDateString()}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Comparison Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Card A */}
        <div className="bg-[#111827] border border-cyan-900/40 rounded-2xl p-5 space-y-4 shadow-xl">
          <div className="flex items-start justify-between border-b border-slate-800 pb-3">
            <div>
              <span className="text-[10px] font-mono text-cyan-400 uppercase font-bold">Audit 1</span>
              <h3 className="text-sm font-bold text-white break-all">{auditA.targetSource}</h3>
              <p className="text-[11px] text-slate-400">{auditA.niche} • {new Date(auditA.timestamp).toLocaleString()}</p>
            </div>
            <button
              onClick={() => onSelectAudit(auditA)}
              className="px-2 py-1 text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 rounded flex items-center gap-1 cursor-pointer"
            >
              <Eye className="w-3 h-3 text-cyan-400" />
              <span>Öffnen</span>
            </button>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="bg-slate-900/80 rounded-lg p-2.5 border border-slate-800">
              <div className="text-[10px] text-slate-400 uppercase">Conversion</div>
              <div className="text-xl font-black text-cyan-400 font-mono mt-1">{auditA.convScoreAfter}</div>
              <div className="text-[10px] text-emerald-400">+{convDeltaA} Pkt</div>
            </div>

            <div className="bg-slate-900/80 rounded-lg p-2.5 border border-slate-800">
              <div className="text-[10px] text-slate-400 uppercase">Slop Toxizität</div>
              <div className="text-xl font-black text-emerald-400 font-mono mt-1">{auditA.slopToxicityAfter}%</div>
              <div className="text-[10px] text-slate-500">von {auditA.slopToxicityBefore}%</div>
            </div>

            <div className="bg-slate-900/80 rounded-lg p-2.5 border border-slate-800">
              <div className="text-[10px] text-slate-400 uppercase">Burstiness</div>
              <div className="text-xl font-black text-white font-mono mt-1">{auditA.burstinessAfter}</div>
              <div className="text-[10px] text-cyan-400">Dynamisch</div>
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-300 uppercase">Tödliche Flaws:</h4>
            <ul className="space-y-1 text-xs text-slate-400">
              {auditA.lethalFlaws.map((f, i) => (
                <li key={i} className="flex items-start gap-1.5">
                  <span className="text-red-400 font-mono">•</span>
                  <span>{f}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Card B */}
        {auditB && (
          <div className="bg-[#111827] border border-emerald-900/40 rounded-2xl p-5 space-y-4 shadow-xl">
            <div className="flex items-start justify-between border-b border-slate-800 pb-3">
              <div>
                <span className="text-[10px] font-mono text-emerald-400 uppercase font-bold">Audit 2</span>
                <h3 className="text-sm font-bold text-white break-all">{auditB.targetSource}</h3>
                <p className="text-[11px] text-slate-400">{auditB.niche} • {new Date(auditB.timestamp).toLocaleString()}</p>
              </div>
              <button
                onClick={() => onSelectAudit(auditB)}
                className="px-2 py-1 text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 rounded flex items-center gap-1 cursor-pointer"
              >
                <Eye className="w-3 h-3 text-emerald-400" />
                <span>Öffnen</span>
              </button>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="bg-slate-900/80 rounded-lg p-2.5 border border-slate-800">
                <div className="text-[10px] text-slate-400 uppercase">Conversion</div>
                <div className="text-xl font-black text-cyan-400 font-mono mt-1">{auditB.convScoreAfter}</div>
                <div className="text-[10px] text-emerald-400">+{convDeltaB} Pkt</div>
              </div>

              <div className="bg-slate-900/80 rounded-lg p-2.5 border border-slate-800">
                <div className="text-[10px] text-slate-400 uppercase">Slop Toxizität</div>
                <div className="text-xl font-black text-emerald-400 font-mono mt-1">{auditB.slopToxicityAfter}%</div>
                <div className="text-[10px] text-slate-500">von {auditB.slopToxicityBefore}%</div>
              </div>

              <div className="bg-slate-900/80 rounded-lg p-2.5 border border-slate-800">
                <div className="text-[10px] text-slate-400 uppercase">Burstiness</div>
                <div className="text-xl font-black text-white font-mono mt-1">{auditB.burstinessAfter}</div>
                <div className="text-[10px] text-emerald-400">Dynamisch</div>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-300 uppercase">Tödliche Flaws:</h4>
              <ul className="space-y-1 text-xs text-slate-400">
                {auditB.lethalFlaws.map((f, i) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <span className="text-red-400 font-mono">•</span>
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
