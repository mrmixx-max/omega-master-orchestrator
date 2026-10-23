import React, { useState } from 'react';
import { Sparkles, ArrowUpRight, TrendingDown, CheckCircle, Shield, Mail, Download } from 'lucide-react';
import { AuditRun } from '../types';
import { ClientEmailModal } from './ClientEmailModal';
import { downloadAllAttachments } from '../utils/slopSanitizer';

interface PortfolioViewProps {
  dossiers: AuditRun[];
  onSelectAudit: (audit: AuditRun) => void;
}

export const PortfolioView: React.FC<PortfolioViewProps> = ({
  dossiers,
  onSelectAudit,
}) => {
  const [emailAudit, setEmailAudit] = useState<AuditRun | null>(null);
  return (
    <div className="max-w-6xl mx-auto space-y-8 py-2">
      {/* Hero Header */}
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-800 text-cyan-400 text-xs font-mono font-semibold">
          <Sparkles className="w-3.5 h-3.5" />
          <span>VERIFIED CASE STUDIES & SHOWCASE</span>
        </div>
        <h2 className="text-2xl md:text-3xl font-black text-white">
          Gehärtete Landingpages & Ergebnisse
        </h2>
        <p className="text-xs md:text-sm text-slate-400">
          Reale Vorher-Nachher-Ergebnisse nach dem OMEGA Swarm-Stresstest und der deterministischen Slop-Sanitization.
        </p>
      </div>

      {/* Grid of Case Studies */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {dossiers.map((audit) => {
          const convDelta = audit.convScoreAfter - audit.convScoreBefore;
          const slopDelta = audit.slopToxicityBefore - audit.slopToxicityAfter;

          return (
            <div
              key={audit.id}
              className="bg-[#111827] border border-[#1f2937] hover:border-cyan-700/60 rounded-2xl p-5 shadow-xl transition-all duration-300 flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-start justify-between mb-3">
                  <div className="max-w-[70%]">
                    <span className="text-[10px] font-mono text-cyan-400 font-bold uppercase tracking-wider">
                      {audit.niche}
                    </span>
                    <h3 className="text-sm font-bold text-white truncate mt-0.5" title={audit.targetSource}>
                      {audit.targetSource.replace(/^https?:\/\//, '')}
                    </h3>
                  </div>

                  <div className="text-right">
                    <div className="text-xl font-black text-white font-mono flex items-baseline justify-end">
                      {audit.convScoreAfter}
                      <span className="text-[10px] text-slate-500 font-normal">/100</span>
                    </div>
                    <div className="text-[10px] font-bold text-emerald-400 flex items-center justify-end gap-0.5">
                      <ArrowUpRight className="w-3 h-3" />
                      <span>+{convDelta} Pkt</span>
                    </div>
                  </div>
                </div>

                {/* Score Stats Badges */}
                <div className="grid grid-cols-2 gap-2 my-4">
                  <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-2.5 text-center">
                    <div className="text-[10px] text-slate-400 uppercase tracking-wider">Slop-Toxizität</div>
                    <div className="text-sm font-bold text-emerald-400 font-mono mt-0.5">
                      {audit.slopToxicityAfter}%{' '}
                      <span className="text-[10px] text-slate-500 font-normal">(-{slopDelta}%)</span>
                    </div>
                  </div>

                  <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-2.5 text-center">
                    <div className="text-[10px] text-slate-400 uppercase tracking-wider">Gate Status</div>
                    <div className="text-sm font-bold text-emerald-400 font-mono mt-0.5 flex items-center justify-center gap-1">
                      <CheckCircle className="w-3 h-3 text-emerald-400" />
                      <span>Gehärtet</span>
                    </div>
                  </div>
                </div>

                {/* Resolved Flaws */}
                <div className="space-y-1.5 mb-4">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    Beseitigte Conversion-Lecks:
                  </div>
                  <ul className="space-y-1">
                    {audit.lethalFlaws.slice(0, 2).map((flaw, idx) => (
                      <li key={idx} className="text-xs text-slate-300 flex items-start gap-1.5 leading-snug">
                        <span className="text-cyan-400 font-bold">•</span>
                        <span className="line-clamp-2">{flaw}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Actions row: View Dossier & Send Email */}
              <div className="grid grid-cols-2 gap-2 mt-2">
                <button
                  onClick={() => onSelectAudit(audit)}
                  className="py-2.5 bg-slate-900 hover:bg-cyan-950 text-slate-300 hover:text-cyan-300 border border-slate-800 hover:border-cyan-800 rounded-xl text-xs font-semibold transition flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span>Dossier öffnen</span>
                  <ArrowUpRight className="w-3.5 h-3.5 text-cyan-400" />
                </button>

                <button
                  onClick={() => setEmailAudit(audit)}
                  className="py-2.5 bg-gradient-to-r from-cyan-950 to-emerald-950 hover:from-cyan-900 hover:to-emerald-900 text-cyan-300 border border-cyan-800 hover:border-cyan-700 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
                  title="Kunden-E-Mail mit 3 Anhängen vorbereiten"
                >
                  <Mail className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Kunden-E-Mail</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {emailAudit && (
        <ClientEmailModal
          audit={emailAudit}
          isOpen={true}
          onClose={() => setEmailAudit(null)}
        />
      )}
    </div>
  );
};

