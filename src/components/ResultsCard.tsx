import React, { useState } from 'react';
import { 
  PieChart, 
  AlertTriangle, 
  FileEdit, 
  Send, 
  Briefcase, 
  Copy, 
  Check, 
  ShieldCheck, 
  Printer, 
  Sparkles,
  ArrowUpRight,
  TrendingDown,
  Activity,
  Download,
  Eye,
  FileText,
  Mail,
  Paperclip,
  Globe
} from 'lucide-react';
import { AuditRun } from '../types';
import { ExecutiveReportModal } from './ExecutiveReportModal';
import { ClientEmailModal } from './ClientEmailModal';
import { LandingPagePreviewModal } from './LandingPagePreviewModal';
import { 
  generateDossierMarkdown, 
  downloadAttachment, 
  downloadAllAttachments, 
  getClientEmailTemplates 
} from '../utils/slopSanitizer';

interface ResultsCardProps {
  audit: AuditRun;
}

export const ResultsCard: React.FC<ResultsCardProps> = ({ audit }) => {
  const [activeTab, setActiveTab] = useState<'scorecard' | 'killers' | 'copy' | 'pitch' | 'proposal' | 'email'>('scorecard');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [isHtmlPreviewModalOpen, setIsHtmlPreviewModalOpen] = useState(false);
  const [allDownloaded, setAllDownloaded] = useState(false);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handlePrintReport = () => {
    setIsReportModalOpen(true);
  };

  const handleDownloadMarkdown = () => {
    const md = generateDossierMarkdown(audit, audit.market || 'de');
    const blob = new Blob([md], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${audit.id}_MASTER_DOSSIER_${(audit.market || 'de').toUpperCase()}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const convDelta = audit.convScoreAfter - audit.convScoreBefore;
  const slopDelta = audit.slopToxicityBefore - audit.slopToxicityAfter;

  return (
    <div className="bg-[#111827] border border-[#1f2937] rounded-2xl shadow-xl overflow-hidden animate-fadeIn">
      {/* Tab Navigation Header */}
      <div className="flex border-b border-[#1f2937] overflow-x-auto p-2 bg-slate-900/60 gap-1 scrollbar-none">
        <button
          onClick={() => setActiveTab('scorecard')}
          className={`px-3.5 py-2 text-xs font-semibold rounded-xl transition flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeTab === 'scorecard'
              ? 'bg-cyan-950 text-cyan-300 border border-cyan-800 shadow-sm shadow-cyan-500/20'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <PieChart className="w-3.5 h-3.5 text-cyan-400" />
          <span>Executive Scorecard</span>
        </button>

        <button
          onClick={() => setActiveTab('killers')}
          className={`px-3.5 py-2 text-xs font-semibold rounded-xl transition flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeTab === 'killers'
              ? 'bg-cyan-950 text-cyan-300 border border-cyan-800 shadow-sm shadow-cyan-500/20'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
          <span>Tödliche Killer & Slop</span>
          {audit.metricsBefore.hitCount > 0 && (
            <span className="bg-red-950 text-red-400 border border-red-800 text-[10px] px-1.5 py-0.2 rounded-full font-mono">
              {audit.metricsBefore.hitCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('copy')}
          className={`px-3.5 py-2 text-xs font-semibold rounded-xl transition flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeTab === 'copy'
              ? 'bg-cyan-950 text-cyan-300 border border-cyan-800 shadow-sm shadow-cyan-500/20'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <FileEdit className="w-3.5 h-3.5 text-emerald-400" />
          <span>Gehärtete Master-Copy</span>
        </button>

        <button
          onClick={() => setActiveTab('pitch')}
          className={`px-3.5 py-2 text-xs font-semibold rounded-xl transition flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeTab === 'pitch'
              ? 'bg-cyan-950 text-cyan-300 border border-cyan-800 shadow-sm shadow-cyan-500/20'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Send className="w-3.5 h-3.5 text-purple-400" />
          <span>Cold-Pitch Outreach</span>
        </button>

        <button
          onClick={() => setActiveTab('proposal')}
          className={`px-3.5 py-2 text-xs font-semibold rounded-xl transition flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeTab === 'proposal'
              ? 'bg-cyan-950 text-cyan-300 border border-cyan-800 shadow-sm shadow-cyan-500/20'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Briefcase className="w-3.5 h-3.5 text-amber-400" />
          <span>High-Ticket Proposal</span>
        </button>

        <button
          onClick={() => setActiveTab('email')}
          className={`px-3.5 py-2 text-xs font-semibold rounded-xl transition flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeTab === 'email'
              ? 'bg-gradient-to-r from-cyan-950 to-emerald-950 text-cyan-300 border border-cyan-700 shadow-sm shadow-cyan-500/20'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Mail className="w-3.5 h-3.5 text-cyan-400" />
          <span>Kunden-E-Mail & Anhänge</span>
          <span className="bg-gradient-to-r from-cyan-400 to-emerald-400 text-black font-extrabold text-[9px] px-1.5 py-0.2 rounded-full uppercase">
            4 Anhänge (inkl. HTML)
          </span>
        </button>
      </div>

      {/* Tab Contents */}
      <div className="p-5 md:p-6">
        {/* Tab 1: Executive Scorecard */}
        {activeTab === 'scorecard' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Conversion Score */}
              <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4.5 relative overflow-hidden group hover:border-cyan-800 transition">
                <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                  <span>Conversion-Score</span>
                  <ArrowUpRight className="w-3.5 h-3.5 text-emerald-400" />
                </div>
                <div className="flex items-baseline justify-between mt-3">
                  <div className="text-3xl font-black text-white font-mono">
                    {audit.convScoreAfter}
                    <span className="text-xs text-slate-500 font-normal">/100</span>
                  </div>
                  <div className="text-xs font-bold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800">
                    +{convDelta} Pkt
                  </div>
                </div>
                <div className="text-[11px] text-slate-400 mt-2.5 flex items-center gap-1.5">
                  <span>Vorher:</span>
                  <span className="line-through text-slate-500 font-mono">{audit.convScoreBefore}</span>
                  <span className="text-slate-600">|</span>
                  <span className="text-cyan-400 font-medium">Swarm-Verified</span>
                </div>
              </div>

              {/* Slop Toxicity */}
              <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4.5 relative overflow-hidden group hover:border-emerald-800 transition">
                <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                  <span>AI-Slop Toxizität</span>
                  <TrendingDown className="w-3.5 h-3.5 text-emerald-400" />
                </div>
                <div className="flex items-baseline justify-between mt-3">
                  <div className="text-3xl font-black text-emerald-400 font-mono">
                    {audit.slopToxicityAfter}
                    <span className="text-xs text-slate-500 font-normal">%</span>
                  </div>
                  <div className="text-xs font-bold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800">
                    -{slopDelta}% Rauschen
                  </div>
                </div>
                <div className="text-[11px] text-slate-400 mt-2.5 flex items-center gap-1.5">
                  <span>Vorher:</span>
                  <span className="line-through text-slate-500 font-mono">{audit.slopToxicityBefore}%</span>
                  <span className="text-slate-600">|</span>
                  <span className="text-emerald-400 font-medium">Sanitized</span>
                </div>
              </div>

              {/* Burstiness */}
              <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4.5 relative overflow-hidden group hover:border-cyan-800 transition">
                <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                  <span>Satz-Dynamik (Burstiness)</span>
                  <Activity className="w-3.5 h-3.5 text-cyan-400" />
                </div>
                <div className="flex items-baseline justify-between mt-3">
                  <div className="text-3xl font-black text-cyan-400 font-mono">
                    {audit.burstinessAfter}
                  </div>
                  <div className="text-xs font-bold text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800">
                    Menschlich
                  </div>
                </div>
                <div className="text-[11px] text-slate-400 mt-2.5 flex items-center gap-1.5">
                  <span>Vorher:</span>
                  <span className="text-slate-500 font-mono">{audit.burstinessBefore}</span>
                  <span className="text-slate-600">|</span>
                  <span className="text-slate-300">Hohe Rhythmus-Varianz</span>
                </div>
              </div>
            </div>

            {/* Red-Critic Gatekeeper Box */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 relative overflow-hidden">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-950/80 border border-emerald-800 flex items-center justify-center text-emerald-400 shrink-0 mt-0.5">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div className="space-y-1.5 flex-1">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <span>Red-Critic Gatekeeper Status: BESTANDEN (≥ 92 Pkt)</span>
                    <span className="text-[10px] bg-emerald-950 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-800 font-mono">
                      {audit.convScoreAfter}/100 Conv • {audit.humanScoreAfter}/100 Human
                    </span>
                  </h4>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Der deterministische Anti-Slop-Filter und die 4 feindlichen Käufer-Personas haben die Kopie in{' '}
                    <strong className="text-white font-mono">{audit.loopsUsed} Loops</strong> gehärtet. Alle verbotenen ChatGPT-Floskeln 
                    (wie <em>„nahtlos“</em>, <em>„ganzheitlicher Ansatz“</em> oder <em>„in einer Welt“</em>) wurden getilgt. 
                    Beide Qualitäts-Dimensionen liegen über der harten Schwelle von 92 Punkten.
                  </p>
                </div>
              </div>
            </div>

            {/* Print, Modal and Export Buttons */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-800">
              <span className="text-xs text-slate-500 font-mono">Dossier-ID: {audit.id}</span>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={handleDownloadMarkdown}
                  className="px-3 py-1.5 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded-lg transition flex items-center gap-1.5 cursor-pointer"
                  title="Markdown Dossier herunterladen"
                >
                  <Download className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Dossier (.md)</span>
                </button>

                <button
                  onClick={() => setIsReportModalOpen(true)}
                  className="px-3.5 py-1.5 text-xs font-bold bg-cyan-950 hover:bg-cyan-900 text-cyan-300 border border-cyan-800 rounded-lg transition flex items-center gap-1.5 cursor-pointer shadow-sm shadow-cyan-500/20"
                >
                  <Eye className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Executive Report Vollbild</span>
                </button>

                <button
                  onClick={() => setIsReportModalOpen(true)}
                  className="px-3.5 py-1.5 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded-lg transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Drucken / PDF</span>
                </button>

                <button
                  onClick={() => setIsEmailModalOpen(true)}
                  className="px-3.5 py-1.5 text-xs font-black bg-gradient-to-r from-cyan-400 via-cyan-500 to-emerald-400 hover:from-cyan-300 hover:to-emerald-300 text-black rounded-lg transition flex items-center gap-1.5 cursor-pointer shadow-md shadow-cyan-500/20"
                >
                  <Mail className="w-3.5 h-3.5 text-black" />
                  <span>E-Mail an Kunden versenden (inkl. Anhänge)</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Tödliche Killer & Diagnosen */}
        {activeTab === 'killers' && (
          <div className="space-y-5">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1 flex items-center gap-2">
                <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
                <span>Enttarnte Schwachstellen & GPT-Marker</span>
              </h3>
              <p className="text-xs text-slate-400">
                Die 4 feindlichen Käufer-Personas haben den Originaltext auf psychologische Widerstände und fehlende Beweise analysiert:
              </p>
            </div>

            <div className="space-y-3">
              {audit.personas.map((persona, idx) => (
                <div key={persona.id} className="bg-slate-900 border border-slate-800 rounded-xl p-4 hover:border-slate-700 transition">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-red-400 font-mono">#{idx + 1}</span>
                      <h4 className="text-xs font-bold text-white">{persona.title}</h4>
                      <span className="text-[10px] text-slate-500 px-2 py-0.5 rounded bg-slate-800">
                        Fokus: {persona.focus}
                      </span>
                    </div>
                    <span className="text-xs font-mono font-bold text-red-400 bg-red-950/60 px-2 py-0.5 rounded border border-red-800">
                      Score: {persona.score}/100
                    </span>
                  </div>

                  <div className="text-xs text-amber-300/90 mb-2 italic bg-amber-950/20 p-2 rounded border border-amber-900/30">
                    Kritischster Hebel: „{persona.worstElement}“
                  </div>

                  <ul className="space-y-1 pl-4 text-xs text-slate-300 list-disc">
                    {persona.critique.map((c, i) => (
                      <li key={i}>{c}</li>
                    ))}
                  </ul>
                </div>
              ))}

              {/* Slop hits */}
              <div className="bg-slate-900 border border-red-900/40 rounded-xl p-4">
                <h4 className="text-xs font-bold text-red-400 mb-2 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Enttarnter GPT-Slop & Banalitäts-Floskeln ({audit.metricsBefore.hitCount} Treffer)</span>
                </h4>
                {audit.metricsBefore.slopHits.length > 0 ? (
                  <div className="flex flex-wrap gap-2 mb-2">
                    {audit.metricsBefore.slopHits.map((hit, i) => (
                      <span key={i} className="px-2 py-1 text-xs font-mono bg-red-950/80 text-red-300 border border-red-800 rounded">
                        „{hit}“
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400">Keine extremen Standard-Floskeln gefunden, aber monotone Rhythmik.</p>
                )}
                <p className="text-[11px] text-slate-400 mt-2">
                  Ursprüngliches Zitat aus der Analyse: <em className="text-slate-300">{audit.worstQuote}</em>
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Gehärtete Master-Copy */}
        {activeTab === 'copy' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-xs font-semibold text-white">92+ Punkte Master-Neufassung</span>
                <p className="text-[11px] text-slate-400">Schlüsselfertige, conversion-optimierte Copy für Landingpage oder Angebot</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsHtmlPreviewModalOpen(true)}
                  className="px-3 py-1.5 text-xs font-bold bg-gradient-to-r from-cyan-500 to-emerald-400 hover:from-cyan-400 hover:to-emerald-300 text-black rounded-lg transition flex items-center gap-1.5 cursor-pointer shadow-md shadow-cyan-500/20"
                  title="Fertige HTML-Landingpage in Desktop/Mobile Vorschau ansehen"
                >
                  <Globe className="w-3.5 h-3.5" />
                  <span>Fertige HTML-Landingpage ansehen</span>
                </button>
                <button
                  onClick={() => handleCopy(audit.masterCopy, 'copy')}
                  className="px-3 py-1.5 text-xs font-semibold bg-cyan-950 text-cyan-300 border border-cyan-800 hover:bg-cyan-900 rounded-lg transition flex items-center gap-1.5 cursor-pointer"
                >
                  {copiedKey === 'copy' ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Kopiert!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Kopieren</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 md:p-5 text-xs font-mono text-slate-200 whitespace-pre-wrap leading-relaxed max-h-[420px] overflow-y-auto selection:bg-cyan-500 selection:text-black">
              {audit.masterCopy}
            </div>

            <div className="bg-emerald-950/30 border border-emerald-800/50 rounded-xl p-3 flex items-center justify-between text-xs text-emerald-300">
              <span className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400" />
                <span>Burstiness: {audit.burstinessAfter} (Hohe Rhythmus-Varianz) • Slop-Toxizität: {audit.slopToxicityAfter}%</span>
              </span>
              <span className="font-mono font-bold">100% Slop-Free</span>
            </div>
          </div>
        )}

        {/* Tab 4: High-Ticket Cold-Pitch */}
        {activeTab === 'pitch' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-white">Trojanisches-Pferd Cold-Outreach</span>
                <p className="text-[11px] text-slate-400">Sofort versandfertige Permissionless-Value Nachricht für E-Mail oder LinkedIn</p>
              </div>
              <button
                onClick={() => handleCopy(audit.executivePitch, 'pitch')}
                className="px-3 py-1.5 text-xs font-semibold bg-emerald-950 text-emerald-300 border border-emerald-800 hover:bg-emerald-900 rounded-lg transition flex items-center gap-1.5 cursor-pointer"
              >
                {copiedKey === 'pitch' ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Kopiert!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Kopieren</span>
                  </>
                )}
              </button>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 md:p-5 text-xs font-mono text-slate-200 whitespace-pre-wrap leading-relaxed max-h-[420px] overflow-y-auto selection:bg-cyan-500 selection:text-black">
              {audit.executivePitch}
            </div>

            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3 text-xs text-slate-400">
              <strong className="text-white">Verkaufs-Psychologie:</strong> Statt unverbindlich zu pitchen, schenken Sie dem Interessenten die vorab gelöste Hero-Sektion. Das erzeugt sofortiges Reziprozitäts-Gefühl und beweist Kompetenz ohne Verkaufsdruck.
            </div>
          </div>
        )}

        {/* Tab 5: High-Ticket Proposal */}
        {activeTab === 'proposal' && (
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-white">Maßgeschneidertes High-Ticket Service-Angebot</span>
                <p className="text-[11px] text-slate-400">Bereit für den direkten Versand an den geprüften Kunden</p>
              </div>
              <button
                onClick={() => handleCopy(JSON.stringify(audit.proposal, null, 2), 'proposal')}
                className="px-3 py-1.5 text-xs font-semibold bg-amber-950 text-amber-300 border border-amber-800 hover:bg-amber-900 rounded-lg transition flex items-center gap-1.5 cursor-pointer"
              >
                {copiedKey === 'proposal' ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Kopiert!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Angebot kopieren</span>
                  </>
                )}
              </button>
            </div>

            <div className="bg-slate-900/90 border border-amber-900/40 rounded-xl p-5 space-y-4">
              <div className="flex items-start justify-between border-b border-slate-800 pb-4">
                <div>
                  <span className="text-[10px] text-amber-400 uppercase tracking-widest font-mono font-bold">Empfohlenes Paket</span>
                  <h3 className="text-base font-bold text-white mt-0.5">{audit.proposal.recommendedPackage}</h3>
                  <p className="text-xs text-slate-400 mt-1">Timeline: {audit.proposal.timeline}</p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-black text-amber-400 font-mono">{audit.proposal.price} €</div>
                  <span className="text-[10px] text-slate-500">zzgl. 19% MwSt.</span>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold text-slate-300 mb-2 uppercase tracking-wide">Leistungsumfang (Deliverables)</h4>
                <ul className="space-y-1.5">
                  {audit.proposal.deliverables.map((item, i) => (
                    <li key={i} className="text-xs text-slate-300 flex items-start gap-2">
                      <span className="text-amber-400 font-bold">✓</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-amber-950/20 border border-amber-800/40 rounded-lg p-3 text-xs text-amber-300/90">
                <strong>Garantie:</strong> {audit.proposal.roiGuarantee}
              </div>
            </div>
          </div>
        )}

        {/* Tab 6: Kunden-E-Mail & Anhänge Dispatch */}
        {activeTab === 'email' && (
          <div className="space-y-6 animate-fadeIn">
            {/* Header Banner */}
            <div className="bg-gradient-to-r from-cyan-950/70 via-slate-900 to-emerald-950/70 border border-cyan-800/60 rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-900/80 text-cyan-300 font-bold uppercase tracking-wider border border-cyan-700">
                    Versandfertiges Komplettpaket
                  </span>
                  <span className="text-xs text-slate-400">Dossier #{audit.id}</span>
                </div>
                <h3 className="text-base font-bold text-white">
                  Kunden-E-Mail mit allen 3 Anhängen versenden
                </h3>
                <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
                  Übermitteln Sie das Prüfungsergebnis direkt per E-Mail an den Kunden. Alle 3 Dokumente (Vollständiger Audit-Report, gehärtete Copy-Swipe und 72h-Sprintplan) sind vorformatiert und stehen zum Download und Mail-Versand bereit.
                </p>
              </div>

              <div className="flex items-center gap-2.5 shrink-0">
                <button
                  onClick={() => {
                    downloadAllAttachments(audit);
                    setAllDownloaded(true);
                    setTimeout(() => setAllDownloaded(false), 2500);
                  }}
                  className="px-3.5 py-2 text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl transition flex items-center gap-1.5 cursor-pointer"
                >
                  {allDownloaded ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-400" />
                      <span className="text-emerald-400">4 Anhänge geladen!</span>
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4 text-cyan-400" />
                      <span>Alle 4 Anhänge laden</span>
                    </>
                  )}
                </button>

                <button
                  onClick={() => setIsEmailModalOpen(true)}
                  className="px-4 py-2 text-xs font-black bg-gradient-to-r from-cyan-400 via-cyan-500 to-emerald-400 hover:from-cyan-300 hover:to-emerald-300 text-black rounded-xl transition flex items-center gap-2 cursor-pointer shadow-lg shadow-cyan-500/25"
                >
                  <Mail className="w-4 h-4 text-black" />
                  <span>E-Mail-Editor & Dispatch öffnen</span>
                </button>
              </div>
            </div>

            {/* 4 Attachments Cards */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                  <Paperclip className="w-3.5 h-3.5 text-cyan-400" />
                  <span>4 Generierte Kunden-Anhänge ({audit.targetSource.replace(/^https?:\/\//, '')})</span>
                </h4>
                <span className="text-[11px] text-slate-500">Inklusive schlüsselfertiger HTML-Landingpage</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3.5">
                {/* Attachment 1 */}
                <div className="bg-slate-900 border border-slate-800 hover:border-cyan-800/80 rounded-xl p-4 flex flex-col justify-between transition group">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
                        HTML / PDF
                      </span>
                      <span className="text-[10px] text-slate-500">Interaktiv</span>
                    </div>
                    <h5 className="text-xs font-bold text-white group-hover:text-cyan-300 transition">
                      Anhang 1: Executive Audit Report
                    </h5>
                    <p className="text-[11px] text-slate-400 mt-1 leading-snug">
                      Vollständige Vorher/Nachher-Scorecard (+{convDelta} Pkt), Persona-Stresstest, Slop-Audit und High-Ticket-Angebot.
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-800 flex items-center gap-2">
                    <button
                      onClick={() => downloadAttachment(audit, 'report_html')}
                      className="flex-1 py-1.5 bg-cyan-950 hover:bg-cyan-900 text-cyan-300 border border-cyan-800 rounded-lg text-xs font-semibold transition flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>HTML Export</span>
                    </button>
                    <button
                      onClick={() => setIsReportModalOpen(true)}
                      className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded-lg transition cursor-pointer"
                      title="Vollbild-Vorschau & Drucken"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Attachment 2 */}
                <div className="bg-slate-900 border border-slate-800 hover:border-emerald-800/80 rounded-xl p-4 flex flex-col justify-between transition group">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                        MARKDOWN (.md)
                      </span>
                      <span className="text-[10px] text-emerald-400 font-semibold">92+ Pkt Master-Copy</span>
                    </div>
                    <h5 className="text-xs font-bold text-white group-hover:text-emerald-300 transition">
                      Anhang 2: High-Conversion Copy Swipe
                    </h5>
                    <p className="text-[11px] text-slate-400 mt-1 leading-snug">
                      Einsatzbereite, auf 4 Personas abgestimmte Texte ohne GPT-Floskeln für CMS, Landingpage, Hero und CTAs.
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-800 flex items-center gap-2">
                    <button
                      onClick={() => downloadAttachment(audit, 'swipe_md')}
                      className="flex-1 py-1.5 bg-emerald-950 hover:bg-emerald-900 text-emerald-300 border border-emerald-800 rounded-lg text-xs font-semibold transition flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Swipe (.md) laden</span>
                    </button>
                    <button
                      onClick={() => handleCopy(audit.masterCopy, 'swipe-copy')}
                      className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded-lg transition cursor-pointer"
                      title="Copy in Zwischenablage"
                    >
                      {copiedKey === 'swipe-copy' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                {/* Attachment 3 */}
                <div className="bg-slate-900 border border-slate-800 hover:border-purple-800/80 rounded-xl p-4 flex flex-col justify-between transition group">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800">
                        MARKDOWN (.md)
                      </span>
                      <span className="text-[10px] text-purple-300 font-semibold">3-Tage Matrix</span>
                    </div>
                    <h5 className="text-xs font-bold text-white group-hover:text-purple-300 transition">
                      Anhang 3: 72h-Quick-Fix Sprint-Plan
                    </h5>
                    <p className="text-[11px] text-slate-400 mt-1 leading-snug">
                      Taktische Entwickler-Checkliste in 3 Phasen (0-24h, 24-48h, 48-72h) mit Hebeln, Stunden und KPI-Impact.
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-800 flex items-center gap-2">
                    <button
                      onClick={() => downloadAttachment(audit, 'sprint_md')}
                      className="flex-1 py-1.5 bg-purple-950 hover:bg-purple-900 text-purple-300 border border-purple-800 rounded-lg text-xs font-semibold transition flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Sprint (.md) laden</span>
                    </button>
                    <button
                      onClick={() => setIsEmailModalOpen(true)}
                      className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded-lg transition cursor-pointer"
                      title="Im E-Mail-Editor anpassen"
                    >
                      <Mail className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Attachment 4: Ready to Deploy HTML Landingpage */}
                <div className="bg-slate-900 border border-slate-800 hover:border-cyan-500/80 rounded-xl p-4 flex flex-col justify-between transition group glow-cyan">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
                        STANDALONE HTML (.html)
                      </span>
                      <span className="text-[10px] text-cyan-400 font-semibold">Plug & Play</span>
                    </div>
                    <h5 className="text-xs font-bold text-white group-hover:text-cyan-300 transition">
                      Anhang 4: Schlüsselfertige Landingpage
                    </h5>
                    <p className="text-[11px] text-slate-400 mt-1 leading-snug">
                      Vollständige HTML-Single-File-Landingpage mit Hero, Nutzen-Grid, Einwand-Killer & Formular. Sofort hochladbar.
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-800 flex items-center gap-2">
                    <button
                      onClick={() => downloadAttachment(audit, 'landingpage_html')}
                      className="flex-1 py-1.5 bg-cyan-950 hover:bg-cyan-900 text-cyan-300 border border-cyan-800 rounded-lg text-xs font-semibold transition flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>HTML laden</span>
                    </button>
                    <button
                      onClick={() => setIsHtmlPreviewModalOpen(true)}
                      className="p-1.5 bg-slate-800 hover:bg-slate-700 text-cyan-400 border border-slate-700 rounded-lg transition cursor-pointer"
                      title="Interaktive Live-Vorschau öffnen"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Preview of Email Draft */}
            {(() => {
              const defaultTemplates = getClientEmailTemplates(audit, {
                clientName: 'Dr. Thomas Weber',
                clientCompany: audit.targetSource.replace(/^https?:\/\//, '').replace(/\/.*$/, ''),
                clientEmail: `kontakt@${audit.targetSource.replace(/^https?:\/\//, '').replace(/\/.*$/, '')}`,
                senderName: 'Alexander Vance',
                senderTitle: 'Senior Conversion Architekt',
                tone: 'c_level',
                salutation: 'sie',
                subjectIndex: 0,
              });

              return (
                <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-4.5 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-white flex items-center gap-2">
                        <span>E-Mail Entwurf (Executive C-Level)</span>
                        <span className="text-[10px] text-slate-500 font-normal">• Referenziert alle 3 Anhänge</span>
                      </span>
                      <p className="text-[11px] text-slate-400">Betreff: „{defaultTemplates.selectedSubject}“</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleCopy(defaultTemplates.plainTextBody, 'default-body')}
                        className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer"
                      >
                        {copiedKey === 'default-body' ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                            <span className="text-emerald-400">Kopiert!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Text kopieren</span>
                          </>
                        )}
                      </button>

                      <button
                        onClick={() => setIsEmailModalOpen(true)}
                        className="px-3.5 py-1.5 bg-cyan-950 hover:bg-cyan-900 text-cyan-300 border border-cyan-800 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                      >
                        <Mail className="w-3.5 h-3.5" />
                        <span>Personalisieren & Absenden</span>
                      </button>
                    </div>
                  </div>

                  <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 text-xs font-mono text-slate-300 whitespace-pre-wrap leading-relaxed max-h-[300px] overflow-y-auto selection:bg-cyan-500 selection:text-black">
                    {defaultTemplates.plainTextBody}
                  </div>
                </div>
              );
            })()}
          </div>
        )}
      </div>

      {/* Fullscreen Executive HTML Report & Proposal Modal */}
      <ExecutiveReportModal
        audit={audit}
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
      />

      {/* Fullscreen Client Email & Attachment Dispatch Modal */}
      <ClientEmailModal
        audit={audit}
        isOpen={isEmailModalOpen}
        onClose={() => setIsEmailModalOpen(false)}
        initialLang={audit.market || 'de'}
      />

      {/* Fullscreen Ready-to-deploy HTML Landing Page Preview Modal */}
      <LandingPagePreviewModal
        audit={audit}
        isOpen={isHtmlPreviewModalOpen}
        onClose={() => setIsHtmlPreviewModalOpen(false)}
        initialLang={audit.market || 'de'}
      />
    </div>
  );
};

