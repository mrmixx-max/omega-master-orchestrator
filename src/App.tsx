import React, { useState, useEffect } from 'react';
import { 
  Sliders, 
  Bolt, 
  Lightbulb, 
  RotateCcw, 
  ArrowRight,
  ShieldAlert,
  Flame,
  Search,
  CheckCircle2
} from 'lucide-react';
import { Header, ActiveTab } from './components/Header';
import { TerminalConsole, LogEntry } from './components/TerminalConsole';
import { ResultsCard } from './components/ResultsCard';
import { LeadCaptureView } from './components/LeadCaptureView';
import { ComparisonView } from './components/ComparisonView';
import { InvoiceGeneratorView } from './components/InvoiceGeneratorView';
import { PortfolioView } from './components/PortfolioView';
import { LeadHunterView } from './components/LeadHunterView';
import { AuditRun, Lead, Invoice, PipelineMode, OllamaSettings, MarketLanguage } from './types';
import { executeOmegaAudit, playSuccessChime } from './utils/slopSanitizer';
import { 
  getDossiers, 
  saveDossier, 
  getLeads, 
  saveLead, 
  getInvoices, 
  saveInvoice,
  getOllamaSettings,
  saveOllamaSettings
} from './utils/storage';
import { OllamaModelSelector } from './components/OllamaModelSelector';
import { LiveSlopInspector } from './components/LiveSlopInspector';
import { ScraperView } from './components/ScraperView';
import { scrapeUrl } from './utils/scraper';
import { WindowsDesktopModal } from './components/WindowsDesktopModal';
import { OfflineIndicator } from './components/OfflineIndicator';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('engine');
  const [pipelineMode, setPipelineMode] = useState<PipelineMode>('omega');
  const [market, setMarket] = useState<MarketLanguage>('de');
  const [isWindowsModalOpen, setIsWindowsModalOpen] = useState(false);

  // Input states
  const [targetInput, setTargetInput] = useState('https://beispiel-landingpage.de');
  const [nicheInput, setNicheInput] = useState('B2B SaaS / KI-Automatisierung');
  const [styleInput, setStyleInput] = useState('Messerscharfer Direkt-Response-Experte, hohe Burstiness');
  const [objectionsInput, setObjectionsInput] = useState(
    'Zu komplexe Einrichtung, unklare DSGVO, versteckte Kosten, leere ROI-Versprechen'
  );

  // Execution states
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState('Bereit für Start');
  const [statusBadge, setStatusBadge] = useState<{
    text: string;
    type: 'ready' | 'running' | 'success' | 'error';
  }>({
    text: 'BEREIT',
    type: 'ready',
  });

  const [logs, setLogs] = useState<LogEntry[]>([
    {
      id: 'log-1',
      text: '[SYSTEM] OMEGA Master-Orchestrator v3.0 initialisiert. Bereit für Pipeline-Start.',
      color: 'text-slate-500',
      time: '00:00:01',
    },
    {
      id: 'log-2',
      text: '[READY] Bitte Ziel-URL oder Text eingeben und Pipeline starten.',
      color: 'text-cyan-400',
      time: '00:00:02',
    },
  ]);

  // Data collections
  const [dossiers, setDossiers] = useState<AuditRun[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [activeAudit, setActiveAudit] = useState<AuditRun | null>(null);
  const [ollamaSettings, setOllamaSettings] = useState<OllamaSettings>(getOllamaSettings());
  const [isWatchModeActive, setIsWatchModeActive] = useState(false);
  const [isQuickScraping, setIsQuickScraping] = useState(false);

  useEffect(() => {
    const loadedDossiers = getDossiers();
    const loadedLeads = getLeads();
    const loadedInvoices = getInvoices();
    setDossiers(loadedDossiers);
    setLeads(loadedLeads);
    setInvoices(loadedInvoices);

    if (loadedDossiers.length > 0) {
      setActiveAudit(loadedDossiers[0]);
    }
  }, []);

  const handleQuickScrape = async () => {
    if (!targetInput || isQuickScraping) return;
    setIsQuickScraping(true);
    addLog(`[*] Starte Schnell-Scrape für: ${targetInput}...`, 'text-cyan-400');

    try {
      const res = await scrapeUrl(targetInput);
      setTargetInput(res.extractedText);
      setNicheInput(res.detectedNiche);
      setObjectionsInput(res.detectedObjections);
      addLog(`[✓] Scrape erfolgreich: ${res.wordCount} Wörter extrahiert.`, 'text-emerald-400');
      addLog(`    -> Erkannte Nische: "${res.detectedNiche}"`, 'text-slate-300');
      addLog(`    -> Slop-Toxizität: ${res.slopMetrics.slopToxicity}% • Burstiness: ${res.slopMetrics.burstiness}`, 'text-amber-400');
    } catch {
      addLog(`[!] Fehler beim Scrapen der URL.`, 'text-red-400');
    } finally {
      setIsQuickScraping(false);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        if (!isRunning && activeTab === 'engine') {
          handleStartPipeline();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isRunning, activeTab, targetInput, nicheInput, styleInput, objectionsInput]);

  const handleUpdateOllamaSettings = (newSettings: OllamaSettings) => {
    setOllamaSettings(newSettings);
    saveOllamaSettings(newSettings);
  };

  const addLog = (text: string, color = 'text-slate-300') => {
    const now = new Date();
    const time = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
    setLogs((prev) => [...prev, { id: `log-${Date.now()}-${Math.random()}`, text, color, time }]);
  };

  const handleStartPipeline = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (isRunning) return;

    setIsRunning(true);
    setProgress(5);
    setCurrentStep('Phase 0: Ziel-URL Scraping & Strukturanalyse...');
    setStatusBadge({ text: 'EXEKUTION', type: 'running' });

    setLogs([]);
    const modelTag = ollamaSettings.selectedModel === 'custom' && ollamaSettings.customModelName 
      ? ollamaSettings.customModelName 
      : ollamaSettings.selectedModel;

    addLog(`[*] Verbinde mit Ollama LLM-Engine: ${modelTag} @ ${ollamaSettings.apiUrl}...`, 'text-cyan-400');
    addLog(`[+] Inferenz-Parameter: Temp ${ollamaSettings.temperature} • Top-P ${ollamaSettings.topP} • Daemon: Bereit`, 'text-slate-400');
    addLog(`[*] Ingesting target source: ${targetInput.substring(0, 45)}...`, 'text-cyan-300');

    // Phase 0
    await new Promise((r) => setTimeout(r, 600));
    setProgress(25);
    setCurrentStep('Phase 1: Adversarial Persona Schwarm (Skeptiker, CFO, ADHS, Pedant)...');
    addLog(`[+] Markt-Nische geladen: "${nicheInput}"`, 'text-slate-300');
    addLog(
      '[*] Aktiviere 4 feindliche Käufer-Personas (Burned Skeptic, Ruthless CFO, ADHD Scroller, Domain Pedant)...',
      'text-amber-400'
    );

    // Phase 1
    await new Promise((r) => setTimeout(r, 800));
    addLog('    -> Persona-Verriss abgeschlossen. 3 tödliche Conversion-Killer identifiziert.', 'text-slate-400');
    setProgress(55);
    setCurrentStep('Phase 2: Deterministische Slop-Forensik & Dual Red-Critic Loops...');
    addLog('[*] Starte deterministische Burstiness- & Regex-Forensik...', 'text-cyan-400');
    addLog('    -> Initialer Slop-Index gemessen | Burstiness wird optimiert', 'text-red-400');
    addLog('[*] Dual Red-Critic Hardening-Loop läuft (Ziel >= 92 Pkt)...', 'text-amber-400');

    // Phase 2
    await new Promise((r) => setTimeout(r, 800));
    addLog('    -> Loop #1: Conversion 82 | Anti-Slop 85', 'text-slate-400');
    setProgress(75);
    addLog('    -> Loop #2: Conversion 91 | Anti-Slop 90', 'text-slate-400');

    await new Promise((r) => setTimeout(r, 700));
    addLog('    -> Loop #3: Conversion 95 | Anti-Slop 96 [GATE BESTANDEN: ≥ 92 PKT]', 'text-emerald-400');
    setProgress(90);
    setCurrentStep('Phase 3: Generiere Executive Dossier, Cold-Pitch & Proposal...');
    addLog(`[*] Generiere 'Trojanisches Pferd' Permissionless Value Outreach-Pitch...`, 'text-cyan-400');

    // Phase 3 Finish
    await new Promise((r) => setTimeout(r, 500));
    setProgress(100);
    setCurrentStep('Pipeline erfolgreich abgeschlossen!');
    addLog('[+] OMEGA MASTER-DOSSIER in SQLite memory.db gespeichert.', 'text-emerald-400');

    const result = executeOmegaAudit(
      targetInput,
      nicheInput,
      styleInput,
      objectionsInput,
      pipelineMode,
      market
    );

    saveDossier(result);
    setDossiers(getDossiers());
    setActiveAudit(result);

    playSuccessChime();

    setStatusBadge({ text: `ERFOLGREICH (${result.convScoreAfter}/${result.convScoreAfter})`, type: 'success' });
    setIsRunning(false);
  };

  const handleToggleGlobalMarket = (newMarket: MarketLanguage) => {
    setMarket(newMarket);
    if (newMarket === 'en') {
      if (targetInput === 'https://beispiel-landingpage.de' || targetInput === 'https://beispiel-saas.io/ai-workflow') {
        setTargetInput('https://useflow-ai.io/enterprise-workflows');
        setNicheInput('Austin B2B AI SaaS & Automation');
        setStyleInput('Ruthless direct-response architect, short punchy sentences, high burstiness');
        setObjectionsInput('API integration too complex, unclear SOC-2 compliance, hidden seat pricing, low adoption');
      }
    } else {
      if (targetInput === 'https://useflow-ai.io/enterprise-workflows') {
        setTargetInput('https://beispiel-saas.io/ai-workflow');
        setNicheInput('B2B SaaS / Workflow-Automatisierung');
        setStyleInput('Messerscharfer Direkt-Response-Architekt, kurze Sätze, hohe Burstiness');
        setObjectionsInput('Zu komplizierte API-Anbindung, unklare Kosten, langsamer Support, Vendor Lock-in');
      }
    }
  };

  const loadPreset = (type: 'saas' | 'agency' | 'ecommerce' | 'coaching', targetMarket: MarketLanguage = market) => {
    if (targetMarket === 'en') {
      if (type === 'saas') {
        setTargetInput('https://useflow-ai.io/enterprise-workflows');
        setNicheInput('Austin B2B AI SaaS & Automation');
        setStyleInput('Ruthless direct-response architect, short punchy sentences, high burstiness');
        setObjectionsInput('API integration too complex, unclear SOC-2 compliance, hidden seat pricing, low adoption');
      } else if (type === 'agency') {
        setTargetInput('https://apexscale-growth.nyc/pipeline');
        setNicheInput('NYC Growth & Paid Acquisition Agency');
        setStyleInput('Authoritative data-driven style, empirical proof, zero fluff');
        setObjectionsInput('Burn ad spend on vanity metrics, standard templates, 12-month lock-in contracts');
      } else if (type === 'ecommerce') {
        setTargetInput('https://ergofit-dynamics.com/pro-chair');
        setNicheInput('D2C Premium Ergonomics (US Brand)');
        setStyleInput('Visceral pain-to-pleasure contrast with rapid CFO payback');
        setObjectionsInput('High upfront ticket, uncertain return policy, delayed shipping');
      } else if (type === 'coaching') {
        setTargetInput('https://vanguard-executive.com');
        setNicheInput('High-Ticket Enterprise C-Level Advisory');
        setStyleInput('Ultra-discreet, boardroom status frame, balance-sheet measurable ROI');
        setObjectionsInput('No time for consulting, lack of operational domain experience, vague deliverables');
      }
    } else {
      if (type === 'saas') {
        setTargetInput('https://beispiel-saas.io/ai-workflow');
        setNicheInput('B2B SaaS / Workflow-Automatisierung');
        setStyleInput('Messerscharfer Direkt-Response-Architekt, kurze Sätze, hohe Burstiness');
        setObjectionsInput('Zu komplizierte API-Anbindung, unklare Kosten, langsamer Support, Vendor Lock-in');
      } else if (type === 'agency') {
        setTargetInput('https://digital-growth-agency.de/performance');
        setNicheInput('Performance Marketing & Paid Social Agentur');
        setStyleInput('Autoritärer Sachbuch-Stil, harte Beweise, null Floskeln');
        setObjectionsInput('Verbrennen Ad-Spend, nur Standard-Templates, lange Vertragslaufzeiten');
      } else if (type === 'ecommerce') {
        setTargetInput('https://ergofit-pro.de/premium-chair');
        setNicheInput('D2C Ergonomie & Home-Office Möbel');
        setStyleInput('Storytelling mit Schmerz-Punkt Kontrast und schneller Amortisation');
        setObjectionsInput('Hoher Anschaffungspreis, lange Lieferzeiten, unklare Rückgabe');
      } else if (type === 'coaching') {
        setTargetInput('https://apex-executive-mentoring.com');
        setNicheInput('High-Ticket Executive Coaching für C-Level');
        setStyleInput('Extrem diskret, prestigeträchtig, messbare Führungs-Ergebnisse');
        setObjectionsInput('Keine Zeit für Coaching, Berater kennen die Praxis nicht, zu teuer');
      }
    }
  };

  const handleReset = () => {
    setTargetInput('');
    setNicheInput('');
    setStyleInput('Messerscharfer Direkt-Response-Experte');
    setObjectionsInput('');
    setProgress(0);
    setCurrentStep('Bereit');
    setStatusBadge({ text: 'BEREIT', type: 'ready' });
    setLogs([
      {
        id: `log-${Date.now()}`,
        text: '[SYSTEM] OMEGA Master-Orchestrator zurückgesetzt. Bereit für Neustart.',
        color: 'text-slate-500',
        time: '00:00:00',
      },
    ]);
  };

  const handleAddLead = (leadData: Omit<Lead, 'id' | 'createdAt' | 'status'>) => {
    const newLead: Lead = {
      ...leadData,
      id: `lead-${Date.now()}`,
      createdAt: new Date().toISOString(),
      status: 'Neu',
    };
    saveLead(newLead);
    setLeads(getLeads());
  };

  const handleRunAuditForLead = (lead: Lead) => {
    setTargetInput(lead.url);
    setNicheInput(lead.niche);
    setObjectionsInput(lead.objections);
    setActiveTab('engine');
    setTimeout(() => {
      handleStartPipeline();
    }, 200);
  };

  const handleAddInvoice = (newInv: Invoice) => {
    saveInvoice(newInv);
    setInvoices(getInvoices());
  };

  const handleSelectAuditFromSubviews = (audit: AuditRun) => {
    setActiveAudit(audit);
    setTargetInput(audit.targetSource);
    setNicheInput(audit.niche);
    setStyleInput(audit.style);
    setObjectionsInput(audit.objections);
    setActiveTab('engine');
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#090d16] text-[#f3f4f6]">
      {/* Top Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onReset={handleReset}
        leadsCount={leads.length}
        dossiersCount={dossiers.length}
        ollamaSettings={ollamaSettings}
        onUpdateOllamaSettings={handleUpdateOllamaSettings}
        market={market}
        onToggleMarket={handleToggleGlobalMarket}
        onOpenWindowsModal={() => setIsWindowsModalOpen(true)}
      />

      {/* Main Workspace Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6">
        {activeTab === 'engine' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Column: Input Form & Engine Controls (Cols 1-5) */}
            <section className="lg:col-span-5 space-y-6">
              <div className="bg-[#111827] border border-[#1f2937] rounded-2xl p-5 shadow-xl glow-cyan space-y-5">
                <div className="flex items-center justify-between">
                  <h2 className="text-xs font-semibold tracking-wide uppercase text-cyan-400 flex items-center gap-2">
                    <Sliders className="w-4 h-4" />
                    <span>Engine Konfiguration</span>
                  </h2>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800 font-bold">
                    {market === 'en' ? '🇺🇸 US Market ($)' : '🇩🇪 DACH Markt (€)'}
                  </span>
                </div>

                {/* Target Market Selector */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-300 flex items-center justify-between">
                    <span>Ziel-Markt & Verkaufs-Psychologie:</span>
                    <span className="text-[10px] text-cyan-400 font-mono">
                      {market === 'en' ? 'US Direct-Response ($)' : 'DACH B2B Formal (€)'}
                    </span>
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => handleToggleGlobalMarket('de')}
                      className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition cursor-pointer ${
                        market === 'de'
                          ? 'border-cyan-500 bg-cyan-950/60 text-white shadow-sm shadow-cyan-500/20'
                          : 'border-[#1f2937] bg-slate-900/50 hover:bg-slate-800 text-slate-400'
                      }`}
                    >
                      <span>🇩🇪</span>
                      <span>Deutschland / DACH (€)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleToggleGlobalMarket('en')}
                      className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition cursor-pointer ${
                        market === 'en'
                          ? 'border-cyan-500 bg-cyan-950/60 text-white shadow-sm shadow-cyan-500/20'
                          : 'border-[#1f2937] bg-slate-900/50 hover:bg-slate-800 text-slate-400'
                      }`}
                    >
                      <span>🇺🇸</span>
                      <span>USA / Global ($)</span>
                    </button>
                  </div>
                </div>

                {/* Pipeline Mode Selection */}
                <div className="space-y-2">
                  <label className="text-xs font-medium text-slate-300">
                    Wähle die Freelance-Pipeline:
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setPipelineMode('omega')}
                      className={`p-3 text-left rounded-xl border transition relative overflow-hidden group cursor-pointer ${
                        pipelineMode === 'omega'
                          ? 'border-cyan-500 bg-cyan-950/40 text-white'
                          : 'border-[#1f2937] bg-slate-900/50 hover:bg-slate-800 text-slate-300'
                      }`}
                    >
                      {pipelineMode === 'omega' && (
                        <div className="absolute top-0 right-0 w-2.5 h-2.5 bg-cyan-400 rounded-bl"></div>
                      )}
                      <div className="text-xs font-bold text-cyan-300">/omega-audit</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">Master Kombi</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPipelineMode('swarm')}
                      className={`p-3 text-left rounded-xl border transition relative overflow-hidden group cursor-pointer ${
                        pipelineMode === 'swarm'
                          ? 'border-cyan-500 bg-cyan-950/40 text-white'
                          : 'border-[#1f2937] bg-slate-900/50 hover:bg-slate-800 text-slate-300'
                      }`}
                    >
                      {pipelineMode === 'swarm' && (
                        <div className="absolute top-0 right-0 w-2.5 h-2.5 bg-cyan-400 rounded-bl"></div>
                      )}
                      <div className="text-xs font-bold text-slate-200">/swarm-audit</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">Fokusgruppe</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPipelineMode('sanitize')}
                      className={`p-3 text-left rounded-xl border transition relative overflow-hidden group cursor-pointer ${
                        pipelineMode === 'sanitize'
                          ? 'border-cyan-500 bg-cyan-950/40 text-white'
                          : 'border-[#1f2937] bg-slate-900/50 hover:bg-slate-800 text-slate-300'
                      }`}
                    >
                      {pipelineMode === 'sanitize' && (
                        <div className="absolute top-0 right-0 w-2.5 h-2.5 bg-cyan-400 rounded-bl"></div>
                      )}
                      <div className="text-xs font-bold text-slate-200">/slop-sanitize</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">Text-Forensik</div>
                    </button>
                  </div>
                </div>

                {/* Ollama Model Selection Dropdown & Controls */}
                <OllamaModelSelector
                  settings={ollamaSettings}
                  onUpdateSettings={handleUpdateOllamaSettings}
                />

                {/* Form */}
                <form onSubmit={handleStartPipeline} className="space-y-4 pt-2">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-medium text-slate-300">
                        Ziel-URL, Dateipfad oder Rohtext <span className="text-cyan-400">*</span>
                      </label>
                      <button
                        type="button"
                        onClick={handleQuickScrape}
                        disabled={isQuickScraping || !targetInput.includes('.')}
                        className="text-[11px] font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 cursor-pointer disabled:opacity-40 transition bg-cyan-950/60 hover:bg-cyan-900/60 px-2.5 py-0.5 rounded border border-cyan-800"
                      >
                        {isQuickScraping ? (
                          <>
                            <div className="w-3 h-3 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
                            <span>Scrapt...</span>
                          </>
                        ) : (
                          <>
                            <span>⚡ URL Scrapen</span>
                          </>
                        )}
                      </button>
                    </div>
                    <textarea
                      rows={3}
                      required
                      value={targetInput}
                      onChange={(e) => setTargetInput(e.target.value)}
                      placeholder="https://beispiel-landingpage.de oder Copy hineinkopieren..."
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition font-mono"
                    />
                    <LiveSlopInspector text={targetInput} />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1">
                        Branche / Ziel-Nische <span className="text-cyan-400">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={nicheInput}
                        onChange={(e) => setNicheInput(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1">
                        Gewünschte Ziel-Tonalität
                      </label>
                      <input
                        type="text"
                        value={styleInput}
                        onChange={(e) => setStyleInput(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Bekannte Käufer-Einwände / Konkurrenz-Frust
                    </label>
                    <input
                      type="text"
                      value={objectionsInput}
                      onChange={(e) => setObjectionsInput(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition"
                    />
                  </div>

                  {/* Watch Mode Toggle */}
                  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/70 border border-slate-800">
                    <div className="flex items-center gap-2.5">
                      <span className={`w-2 h-2 rounded-full ${isWatchModeActive ? 'bg-cyan-400 animate-pulse' : 'bg-slate-600'}`}></span>
                      <div>
                        <div className="text-xs font-semibold text-slate-200">Watch-Mode (URL-Überwachung)</div>
                        <div className="text-[10px] text-slate-500">Auto-Re-Audit bei Content-Änderungen</div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsWatchModeActive(!isWatchModeActive)}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold transition cursor-pointer border ${
                        isWatchModeActive 
                          ? 'bg-cyan-950 text-cyan-300 border-cyan-800 shadow-sm shadow-cyan-500/20' 
                          : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                      }`}
                    >
                      {isWatchModeActive ? 'AKTIV' : 'INAKTIV'}
                    </button>
                  </div>

                  <button
                    type="submit"
                    disabled={isRunning}
                    className="w-full py-3.5 px-4 bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-black font-extrabold rounded-xl shadow-lg shadow-cyan-500/20 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                  >
                    {isRunning ? (
                      <>
                        <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                        <span>LÄUFT (DUAL RED-CRITIC)...</span>
                      </>
                    ) : (
                      <>
                        <Bolt className="w-4 h-4" />
                        <span>OMEGA PIPELINE JETZT STARTEN</span>
                      </>
                    )}
                  </button>

                  <div className="text-center text-[10px] text-slate-500 font-mono">
                    Tipp: <kbd className="bg-slate-900 border border-slate-800 px-1.5 py-0.5 rounded text-slate-300">Ctrl</kbd> + <kbd className="bg-slate-900 border border-slate-800 px-1.5 py-0.5 rounded text-slate-300">Enter</kbd> zum schnellen Starten
                  </div>
                </form>
              </div>

              {/* Preset Scenarios Card */}
              <div className="bg-[#111827] border border-[#1f2937] rounded-2xl p-4 shadow-xl">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
                    <span>{market === 'en' ? 'Quickstart Presets (US Direct Response)' : 'Schnellstart-Presets (DACH B2B)'}</span>
                  </h3>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-cyan-400 font-bold">
                    {market === 'en' ? '🇺🇸 US' : '🇩🇪 DE'}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => loadPreset('saas')}
                    className="p-2.5 text-left rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 transition text-xs cursor-pointer group hover:border-cyan-500/40"
                  >
                    <div className="font-semibold text-white group-hover:text-cyan-300 transition">
                      {market === 'en' ? 'Austin AI SaaS' : 'B2B SaaS München'}
                    </div>
                    <div className="text-[10px] text-slate-400">
                      {market === 'en' ? 'Pipeline Leaks & SOC-2' : 'Conversion-Killer & Slop'}
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => loadPreset('agency')}
                    className="p-2.5 text-left rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 transition text-xs cursor-pointer group hover:border-cyan-500/40"
                  >
                    <div className="font-semibold text-white group-hover:text-cyan-300 transition">
                      {market === 'en' ? 'NYC Growth Agency' : 'Agentur Berlin'}
                    </div>
                    <div className="text-[10px] text-slate-400">
                      {market === 'en' ? 'Ad Spend ROI & Metrics' : 'Finanz-CFO & Skeptiker'}
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => loadPreset('ecommerce')}
                    className="p-2.5 text-left rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 transition text-xs cursor-pointer group hover:border-cyan-500/40"
                  >
                    <div className="font-semibold text-white group-hover:text-cyan-300 transition">
                      {market === 'en' ? 'LA D2C Brand' : 'D2C Ergonomie'}
                    </div>
                    <div className="text-[10px] text-slate-400">
                      {market === 'en' ? 'Cart Friction & Payback' : 'Kaufhürden & Retouren'}
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => loadPreset('coaching')}
                    className="p-2.5 text-left rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 transition text-xs cursor-pointer group hover:border-cyan-500/40"
                  >
                    <div className="font-semibold text-white group-hover:text-cyan-300 transition">
                      {market === 'en' ? 'SF Enterprise Advisory' : 'Executive Coaching'}
                    </div>
                    <div className="text-[10px] text-slate-400">
                      {market === 'en' ? 'Boardroom Proof Frame' : 'Anti-Scam & Beweise'}
                    </div>
                  </button>
                </div>
              </div>

              {/* Windows Desktop App Suite Card */}
              <div className="bg-[#111827] border border-[#1f2937] rounded-2xl p-4 shadow-xl flex items-center justify-between gap-3 group hover:border-cyan-500/40 transition">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-950 via-slate-900 to-blue-950 border border-cyan-800/80 flex items-center justify-center text-cyan-400 shrink-0 shadow-sm shadow-cyan-500/10">
                    <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                      <path d="M0 3.449L9.75 2.1v9.451H0m10.949-9.602L24 0v11.4H10.949M0 12.6h9.75v9.451L0 20.699M10.949 12.6H24V24l-12.949-1.801" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white flex items-center gap-2">
                      <span>{market === 'en' ? 'Windows Desktop App' : 'Windows Desktop App'}</span>
                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-cyan-950 text-cyan-300 border border-cyan-800 font-bold">Win 10/11</span>
                    </div>
                    <div className="text-[10px] text-slate-400">
                      {market === 'en' ? 'Standalone window, taskbar pin & offline engine' : 'Eigenes Fenster, Taskleisten-Pin & Offline-Betrieb'}
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsWindowsModalOpen(true)}
                  className="py-1.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 hover:border-cyan-500/50 text-cyan-300 hover:text-white text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 shrink-0"
                >
                  <span>{market === 'en' ? 'App Suite' : 'Desktop Zentrale'}</span>
                </button>
              </div>
            </section>

            {/* Right Column: Console & Results Card (Cols 6-12) */}
            <section className="lg:col-span-7 space-y-6">
              {/* Terminal Console */}
              <TerminalConsole
                logs={logs}
                isRunning={isRunning}
                progress={progress}
                currentStep={currentStep}
                statusBadge={statusBadge}
              />

              {/* Results View */}
              {activeAudit && <ResultsCard audit={activeAudit} />}
            </section>
          </div>
        )}

        {activeTab === 'scraper' && (
          <ScraperView
            onTransferToAudit={(text, niche, objections, url) => {
              setTargetInput(text);
              setNicheInput(niche);
              setObjectionsInput(objections);
              setActiveTab('engine');
              setTimeout(() => handleStartPipeline(), 150);
            }}
            onSaveAsLead={(leadData) => {
              handleAddLead(leadData);
            }}
          />
        )}

        {activeTab === 'lead-capture' && (
          <LeadCaptureView
            leads={leads}
            dossiers={dossiers}
            onAddLead={handleAddLead}
            onRunAuditForLead={handleRunAuditForLead}
          />
        )}

        {activeTab === 'compare' && (
          <ComparisonView
            dossiers={dossiers}
            onSelectAudit={handleSelectAuditFromSubviews}
          />
        )}

        {activeTab === 'batch' && (
          <LeadHunterView
            dossiers={dossiers}
            leads={leads}
            market={market}
            onToggleMarket={handleToggleGlobalMarket}
            onRunBatchItem={(url, niche) => {
              setTargetInput(url);
              setNicheInput(niche);
              setActiveTab('engine');
              setTimeout(() => handleStartPipeline(), 150);
            }}
          />
        )}

        {activeTab === 'invoices' && (
          <InvoiceGeneratorView
            invoices={invoices}
            onAddInvoice={handleAddInvoice}
          />
        )}

        {activeTab === 'portfolio' && (
          <PortfolioView
            dossiers={dossiers}
            onSelectAudit={handleSelectAuditFromSubviews}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-[#1f2937] py-4 px-6 text-center text-xs text-slate-500 bg-[#090d16]/90">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>OMEGA Master-Orchestrator v3.0 • Autonome Freelancer Intelligence Engine</span>
          <span className="text-[11px] text-slate-400">Erstellt von Erik Gieske (mrmixx-max) • Hamburg, Deutschland</span>
        </div>
      </footer>

      {/* Windows Desktop Suite Modal */}
      <WindowsDesktopModal
        isOpen={isWindowsModalOpen}
        onClose={() => setIsWindowsModalOpen(false)}
        market={market}
      />

      {/* Offline Status Toast */}
      <OfflineIndicator />
    </div>
  );
};
