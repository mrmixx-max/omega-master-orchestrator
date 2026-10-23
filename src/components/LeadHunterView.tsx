import React, { useState, useMemo } from 'react';
import { 
  Crosshair, 
  Play, 
  Check, 
  Copy, 
  Plus, 
  RefreshCw, 
  Send, 
  Sparkles, 
  Mail, 
  Video, 
  MessageSquare, 
  PhoneCall, 
  Clock, 
  FileText, 
  Download, 
  ExternalLink, 
  ChevronRight, 
  ArrowRight, 
  ShieldCheck, 
  Flame, 
  Eye, 
  Globe,
  Sliders,
  Users
} from 'lucide-react';
import { BatchItem, AuditRun, Lead, ColdOutreachSequence, ColdOutreachStep, MarketLanguage } from '../types';
import { generateColdOutreachSequence, generateOutreachFromAudit } from '../utils/coldOutreachEngine';
import { LandingPagePreviewModal } from './LandingPagePreviewModal';
import { ClientEmailModal } from './ClientEmailModal';

interface LeadHunterViewProps {
  onRunBatchItem: (url: string, niche: string) => void;
  dossiers?: AuditRun[];
  leads?: Lead[];
  market?: MarketLanguage;
  onToggleMarket?: (market: MarketLanguage) => void;
}

const DEFAULT_BATCH_DE: BatchItem[] = [
  {
    id: 'batch-de-1',
    url: 'https://cloud-devops-forge.io',
    company: 'CloudForge Systems',
    niche: 'DevOps & Kubernetes Cloud',
    contactName: 'Florian Becker',
    status: 'Bereit',
    market: 'de',
  },
  {
    id: 'batch-de-2',
    url: 'https://quantum-legal-tech.de',
    company: 'Quantum Legal AI',
    niche: 'B2B LegalTech Software',
    contactName: 'Dr. Julia Sommer',
    status: 'Bereit',
    market: 'de',
  },
  {
    id: 'batch-de-3',
    url: 'https://apex-revops-crm.com',
    company: 'Apex RevOps',
    niche: 'SaaS Revenue Operations',
    contactName: 'Marc Völker',
    status: 'Bereit',
    market: 'de',
  },
];

const DEFAULT_BATCH_US: BatchItem[] = [
  {
    id: 'batch-us-1',
    url: 'https://devflow-ai.io',
    company: 'DevFlow Systems SF',
    niche: 'B2B AI Agent Orchestration',
    contactName: 'Sarah Jenkins',
    status: 'Bereit',
    market: 'en',
  },
  {
    id: 'batch-us-2',
    url: 'https://austin-cyberops.com',
    company: 'Nexus CyberOps Austin',
    niche: 'Enterprise Zero-Trust Identity',
    contactName: 'David Ross',
    status: 'Bereit',
    market: 'en',
  },
  {
    id: 'batch-us-3',
    url: 'https://velocity-revops.nyc',
    company: 'Velocity RevOps NYC',
    niche: 'High-Growth B2B Pipeline Automation',
    contactName: 'Michael Chen',
    status: 'Bereit',
    market: 'en',
  },
];

export const LeadHunterView: React.FC<LeadHunterViewProps> = ({ 
  onRunBatchItem,
  dossiers = [],
  leads = [],
  market: propMarket = 'de',
  onToggleMarket,
}) => {
  const [internalMarket, setInternalMarket] = useState<MarketLanguage>(propMarket);
  const currentMarket = propMarket || internalMarket;

  const currentBatch = currentMarket === 'en' ? DEFAULT_BATCH_US : DEFAULT_BATCH_DE;
  const [items, setItems] = useState<BatchItem[]>(currentBatch);
  const [selectedBatchItem, setSelectedBatchItem] = useState<BatchItem | null>(currentBatch[0]);
  
  // Custom generator inputs
  const [targetCompany, setTargetCompany] = useState(currentBatch[0].company);
  const [targetUrl, setTargetUrl] = useState(currentBatch[0].url);
  const [targetNiche, setTargetNiche] = useState(currentBatch[0].niche);
  const [targetContact, setTargetContact] = useState(currentBatch[0].contactName);
  const [targetObjections, setTargetObjections] = useState(
    currentMarket === 'en' 
      ? 'Too expensive, unclear ROI, already using an in-house team/agency' 
      : 'Zu teuer, unklarer ROI, bestehende Agentur'
  );
  const [isProcessingBatch, setIsProcessingBatch] = useState(false);

  // Active step in sequence viewer
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Modals
  const [previewAuditForHtml, setPreviewAuditForHtml] = useState<AuditRun | null>(null);
  const [emailAuditForDispatch, setEmailAuditForDispatch] = useState<AuditRun | null>(null);

  // Handle market toggle
  const handleMarketChange = (newMarket: MarketLanguage) => {
    setInternalMarket(newMarket);
    if (onToggleMarket) onToggleMarket(newMarket);
    const newBatch = newMarket === 'en' ? DEFAULT_BATCH_US : DEFAULT_BATCH_DE;
    setItems(newBatch);
    setSelectedBatchItem(newBatch[0]);
    setTargetCompany(newBatch[0].company);
    setTargetUrl(newBatch[0].url);
    setTargetNiche(newBatch[0].niche);
    setTargetContact(newBatch[0].contactName);
    setTargetObjections(
      newMarket === 'en'
        ? 'Too expensive, unclear ROI, already using an in-house team/agency'
        : 'Zu teuer, unklarer ROI, bestehende Agentur'
    );
  };

  // Generate sequence dynamically
  const sequence: ColdOutreachSequence = useMemo(() => {
    return generateColdOutreachSequence({
      company: targetCompany,
      targetUrl: targetUrl,
      niche: targetNiche,
      contactName: targetContact,
      objections: targetObjections,
      market: currentMarket,
    });
  }, [targetCompany, targetUrl, targetNiche, targetContact, targetObjections, currentMarket]);

  const activeStep: ColdOutreachStep = sequence.steps[activeStepIndex] || sequence.steps[0];

  const handleCopyText = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleExportFullSequence = () => {
    const isEn = currentMarket === 'en';
    const content = isEn
      ? `# 🎯 MULTI-TOUCH COLD OUTREACH CADENCE: ${sequence.company}
Target URL: ${sequence.targetUrl}
Niche: ${sequence.niche}
Executive Contact: ${sequence.contactName}
Market Target: US / Global English (High-Conversion Direct Response)
Generated: ${new Date().toLocaleDateString('en-US')}

=======================================================
${sequence.steps.map(s => `
-------------------------------------------------------
### ${s.title}
Timing: ${s.timing} | Channel: ${s.channel.toUpperCase()}
Goal: ${s.goal}
Tactical Advice: ${s.actionAdvice}

Subject / Opener:
${s.subjectOrOpener}

Script / Template:
${s.script}
`).join('\n')}
=======================================================
Generated with OMEGA Master Orchestrator v3.0 Cold Outreach Engine
`
      : `# 🎯 MULTI-CHANNEL KALTAKQUISE-SEQUENZ: ${sequence.company}
Ziel-URL: ${sequence.targetUrl}
Nische: ${sequence.niche}
Ansprechpartner: ${sequence.contactName}
Markt: DACH (Deutschland, Österreich, Schweiz)
Generiert am: ${new Date().toLocaleDateString('de-DE')}

=======================================================
${sequence.steps.map(s => `
-------------------------------------------------------
### ${s.title}
Timing: ${s.timing} | Kanal: ${s.channel.toUpperCase()}
Ziel: ${s.goal}
Empfehlung: ${s.actionAdvice}

Betreff / Opener:
${s.subjectOrOpener}

Skript / Vorlage:
${s.script}
`).join('\n')}
=======================================================
Erstellt mit OMEGA Master Orchestrator v3.0 Kaltakquise-Engine
`;

    const blob = new Blob([content], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `COLD_OUTREACH_SEQUENCE_${sequence.company.replace(/\s+/g, '_')}_${currentMarket.toUpperCase()}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleSelectBatch = (item: BatchItem) => {
    setSelectedBatchItem(item);
    setTargetCompany(item.company);
    setTargetUrl(item.url);
    setTargetNiche(item.niche);
    setTargetContact(item.contactName);
  };

  const handleLoadDossier = (dossier: AuditRun) => {
    const cleanUrl = dossier.targetSource.replace(/^https?:\/\//, '').replace(/\/.*$/, '');
    setTargetCompany(dossier.niche.split('/')[0].trim() || cleanUrl);
    setTargetUrl(dossier.targetSource);
    setTargetNiche(dossier.niche);
    setTargetContact(dossier.market === 'en' ? 'Founder / CEO' : 'Geschäftsführer');
    setTargetObjections(dossier.objections);
    if (dossier.market) {
      setInternalMarket(dossier.market);
      if (onToggleMarket) onToggleMarket(dossier.market);
    }
  };

  const handleAddCustomTarget = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetUrl) return;

    const newItem: BatchItem = {
      id: `batch-${Date.now()}`,
      url: targetUrl,
      company: targetCompany || (currentMarket === 'en' ? 'Acme Corp' : 'Acme GmbH'),
      niche: targetNiche || (currentMarket === 'en' ? 'B2B SaaS' : 'B2B Dienstleistung'),
      contactName: targetContact || (currentMarket === 'en' ? 'Founder' : 'Inhaber'),
      status: 'Bereit',
      market: currentMarket,
    };

    setItems(prev => [newItem, ...prev]);
    setSelectedBatchItem(newItem);
  };

  const runSingleBatchAudit = (item: BatchItem) => {
    setItems(prev => prev.map(i => i.id === item.id ? { ...i, status: 'Läuft' } : i));

    setTimeout(() => {
      setItems(prev => prev.map(i => i.id === item.id ? {
        ...i,
        status: 'Abgeschlossen',
        convScore: 95,
        slopScore: 2,
        pitchSnippet: currentMarket === 'en'
          ? `Audit & turnkey HTML landing page for ${item.company} ready`
          : `Audit & fertige HTML-Landingpage für ${item.company} bereit`,
      } : i));
    }, 1200);
  };

  const runAllBatchAudits = () => {
    setIsProcessingBatch(true);
    let idx = 0;
    const interval = setInterval(() => {
      if (idx >= items.length) {
        clearInterval(interval);
        setIsProcessingBatch(false);
        return;
      }
      const item = items[idx];
      runSingleBatchAudit(item);
      idx++;
    }, 1200);
  };

  // Find matching audit dossier if available
  const matchingDossier = dossiers.find(d => 
    d.targetSource.includes(targetUrl) || targetUrl.includes(d.targetSource)
  ) || (dossiers.length > 0 ? dossiers[0] : null);

  const channelIcons = {
    email: <Mail className="w-4 h-4 text-cyan-400" />,
    loom: <Video className="w-4 h-4 text-purple-400" />,
    linkedin: <MessageSquare className="w-4 h-4 text-blue-400" />,
    phone: <PhoneCall className="w-4 h-4 text-emerald-400" />,
    breakup: <Clock className="w-4 h-4 text-amber-400" />,
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 py-2">
      
      {/* Top Banner & Title */}
      <div className="bg-[#111827] border border-[#1f2937] rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center gap-2.5 flex-wrap">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-red-500 via-amber-500 to-cyan-400 flex items-center justify-center text-black font-black text-lg shadow-md shadow-red-500/20">
                <Crosshair className="w-5 h-5 text-black" />
              </div>
              <h2 className="text-xl md:text-2xl font-black text-white tracking-wide">
                {currentMarket === 'en' 
                  ? 'Cold Outreach Command Center & Multi-Touch Cadence'
                  : 'Kaltakquise Command Center & Multi-Touch Outreach'}
              </h2>
              <span className="text-[10px] bg-red-950 text-red-300 border border-red-800 font-mono font-bold px-2 py-0.5 rounded-full">
                5-Touch Cadence
              </span>
            </div>
            <p className="text-xs text-slate-400 max-w-3xl leading-relaxed">
              {currentMarket === 'en'
                ? 'Convert cold B2B prospects into booked discovery calls: Generate an authentic 5-touch sales cadence (Email • 58s Loom Video Teardown • LinkedIn InMail • Pattern-Interrupt Cold Call & EA Bypass • High-Status Breakup) with turnkey HTML landing page proof enclosed.'
                : 'Verwandeln Sie eiskalte Zielunternehmen in kaufbereite Kunden: Generieren Sie eine durchgängige 5-Touch Akquise-Sequenz (E-Mail • 60s Loom Screen-Video • LinkedIn DM • Telefon-Gesprächsleitfaden • Breakup) inklusive Vorab-Beweisen und fertiger HTML-Landingpage als Geschenk.'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Market Switcher in View */}
            <div className="flex items-center bg-slate-900 border border-slate-700 rounded-xl p-1 gap-1">
              <button
                type="button"
                onClick={() => handleMarketChange('de')}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                  currentMarket === 'de'
                    ? 'bg-cyan-950 text-cyan-300 border border-cyan-700 shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="DACH (Deutsch, DSGVO, Vorzimmer-Bypass)"
              >
                <span>🇩🇪</span>
                <span>DE (DACH)</span>
              </button>
              <button
                type="button"
                onClick={() => handleMarketChange('en')}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                  currentMarket === 'en'
                    ? 'bg-cyan-950 text-cyan-300 border border-cyan-700 shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="US / Global (American Direct Response, Silicon Valley Loom, Pattern Interrupt)"
              >
                <span>🇺🇸</span>
                <span>US (American)</span>
              </button>
            </div>

            <button
              onClick={handleExportFullSequence}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer"
              title="Alle 5 Schritte als Markdown-Dossier exportieren"
            >
              <Download className="w-3.5 h-3.5 text-cyan-400" />
              <span>{currentMarket === 'en' ? 'Export Cadence (.md)' : 'Sequenz exportieren (.md)'}</span>
            </button>

            {matchingDossier && (
              <button
                onClick={() => setPreviewAuditForHtml(matchingDossier)}
                className="px-3.5 py-2 bg-gradient-to-r from-cyan-500 to-emerald-400 hover:from-cyan-400 hover:to-emerald-300 text-black text-xs font-extrabold rounded-xl transition flex items-center gap-1.5 cursor-pointer shadow-md shadow-cyan-500/20"
                title="Die für diesen Lead bereitliegende HTML-Landingpage öffnen"
              >
                <Globe className="w-3.5 h-3.5" />
                <span>{currentMarket === 'en' ? 'Turnkey HTML Page' : 'Fertige HTML-Landingpage'}</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Grid: Target Selector / Lead Queue & 5-Step Outreach Viewer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column (4 Cols): Targets & Lead Pipeline */}
        <div className="lg:col-span-4 space-y-5">
          
          {/* Target Configuration Card */}
          <div className="bg-[#111827] border border-[#1f2937] rounded-2xl p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <span className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5" />
                <span>{currentMarket === 'en' ? 'Configure Target Prospect' : 'Ziel-Unternehmen konfigurieren'}</span>
              </span>
              <span className="text-[10px] text-slate-500 font-mono">
                {currentMarket === 'en' ? '🇺🇸 US Market' : '🇩🇪 DE Markt'}
              </span>
            </div>

            {/* Quick-import from Dossiers */}
            {dossiers.length > 0 && (
              <div className="space-y-1.5">
                <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                  {currentMarket === 'en' ? 'Load from existing audit:' : 'Aus bestehendem Audit laden:'}
                </label>
                <select
                  onChange={(e) => {
                    const found = dossiers.find(d => d.id === e.target.value);
                    if (found) handleLoadDossier(found);
                  }}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-cyan-300 font-mono focus:outline-none focus:border-cyan-500"
                >
                  <option value="">{currentMarket === 'en' ? '-- Select Audit --' : '-- Audit auswählen --'}</option>
                  {dossiers.map(d => (
                    <option key={d.id} value={d.id}>
                      {d.targetSource.replace(/^https?:\/\//, '').substring(0, 30)} ({d.convScoreAfter} Pkt)
                    </option>
                  ))}
                </select>
              </div>
            )}

            <form onSubmit={handleAddCustomTarget} className="space-y-3">
              <div>
                <label className="block text-[11px] font-medium text-slate-300 mb-1">
                  {currentMarket === 'en' ? 'Target URL *' : 'Ziel-URL *'}
                </label>
                <input
                  type="url"
                  required
                  value={targetUrl}
                  onChange={(e) => setTargetUrl(e.target.value)}
                  placeholder={currentMarket === 'en' ? 'https://target-saas.com' : 'https://ziel-unternehmen.de'}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-medium text-slate-300 mb-1">
                    {currentMarket === 'en' ? 'Company' : 'Unternehmen'}
                  </label>
                  <input
                    type="text"
                    value={targetCompany}
                    onChange={(e) => setTargetCompany(e.target.value)}
                    placeholder={currentMarket === 'en' ? 'e.g. Acme Corp' : 'z. B. Acme GmbH'}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-slate-300 mb-1">
                    {currentMarket === 'en' ? 'Contact Name' : 'Ansprechpartner'}
                  </label>
                  <input
                    type="text"
                    value={targetContact}
                    onChange={(e) => setTargetContact(e.target.value)}
                    placeholder={currentMarket === 'en' ? 'Sarah Jenkins' : 'Herr Dr. Weber'}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-300 mb-1">
                  {currentMarket === 'en' ? 'Niche / Industry' : 'Branche / Nische'}
                </label>
                <input
                  type="text"
                  value={targetNiche}
                  onChange={(e) => setTargetNiche(e.target.value)}
                  placeholder={currentMarket === 'en' ? 'e.g. B2B AI Workflow SaaS' : 'z. B. B2B Cyber-Security'}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-300 mb-1">
                  {currentMarket === 'en' ? 'Addressed Objections' : 'Befürchtete Einwände'}
                </label>
                <input
                  type="text"
                  value={targetObjections}
                  onChange={(e) => setTargetObjections(e.target.value)}
                  placeholder={currentMarket === 'en' ? 'Too expensive, have agency...' : 'Zu teuer, haben schon Agentur...'}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="flex gap-2 pt-1">
                <button
                  type="submit"
                  className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-lg text-xs transition border border-slate-700 cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5 text-cyan-400" />
                  <span>{currentMarket === 'en' ? 'Save to Queue' : 'In Queue speichern'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => onRunBatchItem(targetUrl, targetNiche)}
                  className="px-3 py-2 bg-cyan-950 hover:bg-cyan-900 text-cyan-300 border border-cyan-800 font-bold rounded-lg text-xs transition cursor-pointer flex items-center gap-1"
                  title="Kompletten OMEGA Audit für dieses Ziel starten"
                >
                  <Play className="w-3.5 h-3.5" />
                  <span>{currentMarket === 'en' ? 'Run Audit' : 'Auditieren'}</span>
                </button>
              </div>
            </form>
          </div>

          {/* Batch Prospecting Queue */}
          <div className="bg-[#111827] border border-[#1f2937] rounded-2xl p-5 shadow-xl space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-cyan-400" />
                <span>{currentMarket === 'en' ? `Outreach Queue (${items.length})` : `Akquise-Queue (${items.length})`}</span>
              </span>
              <button
                onClick={runAllBatchAudits}
                disabled={isProcessingBatch}
                className="text-[11px] text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1 cursor-pointer disabled:opacity-40"
              >
                {isProcessingBatch ? (
                  <>
                    <RefreshCw className="w-3 h-3 animate-spin" />
                    <span>{currentMarket === 'en' ? 'Running...' : 'Läuft...'}</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3 h-3" />
                    <span>{currentMarket === 'en' ? 'Audit all' : 'Alle auditieren'}</span>
                  </>
                )}
              </button>
            </div>

            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
              {items.map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleSelectBatch(item)}
                  className={`p-2.5 rounded-xl border text-xs cursor-pointer transition flex items-center justify-between gap-2 ${
                    selectedBatchItem?.id === item.id
                      ? 'bg-cyan-950/70 border-cyan-700 shadow-sm'
                      : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="min-w-0">
                    <div className="font-bold text-white truncate">{item.company}</div>
                    <div className="text-[10px] text-slate-400 truncate">{item.contactName} &bull; {item.niche}</div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className={`px-1.5 py-0.5 rounded text-[9px] font-mono font-bold ${
                      item.status === 'Abgeschlossen'
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                        : item.status === 'Läuft'
                        ? 'bg-amber-950 text-amber-300 border border-amber-800 animate-pulse'
                        : 'bg-slate-800 text-slate-400'
                    }`}>
                      {item.status}
                    </span>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Right Column (8 Cols): The 5-Step Outreach Sequencer */}
        <div className="lg:col-span-8 bg-[#111827] border border-[#1f2937] rounded-2xl shadow-xl overflow-hidden flex flex-col">
          
          {/* Steps Navigation Bar */}
          <div className="p-3 bg-slate-900 border-b border-slate-800 flex items-center gap-1 overflow-x-auto scrollbar-none">
            {sequence.steps.map((st, idx) => (
              <button
                key={st.step}
                onClick={() => setActiveStepIndex(idx)}
                className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 whitespace-nowrap transition cursor-pointer ${
                  activeStepIndex === idx
                    ? 'bg-gradient-to-r from-cyan-950 to-slate-900 text-cyan-300 border border-cyan-700 shadow-sm shadow-cyan-500/20'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800 border border-transparent'
                }`}
              >
                <span className="w-5 h-5 rounded-full bg-slate-800 flex items-center justify-center text-[10px] font-mono font-bold text-slate-300">
                  {st.step}
                </span>
                <span>{channelIcons[st.channel]}</span>
                <span className="hidden sm:inline">
                  {currentMarket === 'en'
                    ? (st.channel === 'email' ? 'Touch 1 (Email)' :
                       st.channel === 'loom' ? 'Touch 2 (Loom Video)' :
                       st.channel === 'linkedin' ? 'Touch 3 (LinkedIn)' :
                       st.channel === 'phone' ? 'Touch 4 (Cold Call & EA)' : 'Touch 5 (Breakup)')
                    : (st.channel === 'email' ? 'Touch 1 (E-Mail)' :
                       st.channel === 'loom' ? 'Touch 2 (Loom-Video)' :
                       st.channel === 'linkedin' ? 'Touch 3 (LinkedIn)' :
                       st.channel === 'phone' ? 'Touch 4 (Telefon & Leitfaden)' : 'Touch 5 (Breakup)')}
                </span>
              </button>
            ))}
          </div>

          {/* Active Step Details Header */}
          <div className="p-5 border-b border-slate-800/80 bg-slate-900/40 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-950 text-cyan-300 border border-cyan-800">
                    {currentMarket === 'en' ? `Touch ${activeStep.step} of 5` : `Schritt ${activeStep.step} von 5`}
                  </span>
                  <span className="text-xs font-mono text-slate-400">
                    {activeStep.timing}
                  </span>
                  <span className="text-[10px] bg-emerald-950 text-emerald-400 border border-emerald-800 px-2 py-0.5 rounded-full font-semibold">
                    {activeStep.badge}
                  </span>
                </div>
                <h3 className="text-base font-bold text-white mt-1">
                  {activeStep.title}
                </h3>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleCopyText(activeStep.script, `step-${activeStep.step}`)}
                  className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer"
                >
                  {copiedKey === `step-${activeStep.step}` ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">{currentMarket === 'en' ? 'Script Copied!' : 'Skript kopiert!'}</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>{currentMarket === 'en' ? 'Copy Script' : 'Skript kopieren'}</span>
                    </>
                  )}
                </button>

                {matchingDossier && activeStep.channel === 'email' && (
                  <button
                    onClick={() => setEmailAuditForDispatch(matchingDossier)}
                    className="px-3 py-1.5 bg-cyan-950 hover:bg-cyan-900 text-cyan-300 border border-cyan-800 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <Mail className="w-3.5 h-3.5" />
                    <span>{currentMarket === 'en' ? 'Open in Email Modal' : 'In E-Mail-Modal öffnen'}</span>
                  </button>
                )}
              </div>
            </div>

            {/* Strategic Advice Box */}
            <div className="bg-slate-950/80 border border-slate-800/80 rounded-xl p-3 flex items-start gap-2.5 text-xs text-slate-300">
              <ShieldCheck className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <span className="font-semibold text-white">{currentMarket === 'en' ? 'Objective:' : 'Ziel dieses Touchpoints:'}</span> {activeStep.goal}
                <div className="text-[11px] text-slate-400 italic">💡 {currentMarket === 'en' ? 'Strategy:' : 'Taktik:'} {activeStep.actionAdvice}</div>
              </div>
            </div>

            {/* Subject / Opener Line */}
            <div className="flex items-center justify-between bg-slate-950 px-3.5 py-2 rounded-lg border border-slate-800 text-xs">
              <div className="flex items-center gap-2 overflow-hidden">
                <span className="text-[10px] font-mono text-slate-500 uppercase font-bold shrink-0">
                  {activeStep.channel === 'phone' ? (currentMarket === 'en' ? 'OPENER:' : 'EINSTIEG:') : (currentMarket === 'en' ? 'SUBJECT:' : 'BETREFF:')}
                </span>
                <span className="text-white font-medium truncate font-sans">
                  {activeStep.subjectOrOpener}
                </span>
              </div>
              <button
                onClick={() => handleCopyText(activeStep.subjectOrOpener, `sub-${activeStep.step}`)}
                className="text-[10px] text-cyan-400 hover:text-cyan-300 font-semibold shrink-0 cursor-pointer"
              >
                {copiedKey === `sub-${activeStep.step}` ? (currentMarket === 'en' ? 'Copied!' : 'Kopiert!') : (currentMarket === 'en' ? 'Copy' : 'Kopieren')}
              </button>
            </div>
          </div>

          {/* Script Content Area */}
          <div className="p-5 flex-1 bg-slate-950 overflow-y-auto max-h-[500px]">
            <div className="bg-slate-900/70 border border-slate-800/90 rounded-xl p-4 md:p-5 text-xs font-mono text-slate-200 whitespace-pre-wrap leading-relaxed select-all selection:bg-cyan-500 selection:text-black">
              {activeStep.script}
            </div>
          </div>

          {/* Bottom Bar: Touch Navigation & Next Action */}
          <div className="p-4 bg-slate-900 border-t border-slate-800 flex items-center justify-between text-xs">
            <button
              onClick={() => setActiveStepIndex(Math.max(0, activeStepIndex - 1))}
              disabled={activeStepIndex === 0}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition disabled:opacity-30 cursor-pointer"
            >
              {currentMarket === 'en' ? '← Previous Touch' : '← Vorheriger Touch'}
            </button>

            <span className="text-slate-500 font-mono text-[11px]">
              {currentMarket === 'en'
                ? 'Tip: Always keep the turnkey HTML page open in a second browser tab during the video walkthrough'
                : 'Tipp: Bei Video-Touch stets die fertige HTML-Landingpage im zweiten Tab geöffnet halten'}
            </span>

            <button
              onClick={() => setActiveStepIndex(Math.min(sequence.steps.length - 1, activeStepIndex + 1))}
              disabled={activeStepIndex === sequence.steps.length - 1}
              className="px-3.5 py-1.5 bg-gradient-to-r from-cyan-500 to-emerald-500 text-black font-extrabold rounded-lg transition disabled:opacity-30 cursor-pointer flex items-center gap-1 shadow-md shadow-cyan-500/10"
            >
              <span>{currentMarket === 'en' ? 'Next Touch' : 'Nächster Touch'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>

      </div>

      {/* Modals */}
      {previewAuditForHtml && (
        <LandingPagePreviewModal
          audit={previewAuditForHtml}
          isOpen={true}
          onClose={() => setPreviewAuditForHtml(null)}
          initialLang={currentMarket}
        />
      )}

      {emailAuditForDispatch && (
        <ClientEmailModal
          audit={emailAuditForDispatch}
          isOpen={true}
          onClose={() => setEmailAuditForDispatch(null)}
          initialClientEmail={`contact@${targetUrl.replace(/^https?:\/\//, '').replace(/\/.*$/, '')}`}
          initialClientName={targetContact}
          initialCompanyName={targetCompany}
          initialLang={currentMarket}
        />
      )}

    </div>
  );
};
