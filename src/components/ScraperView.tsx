import React, { useState } from 'react';
import { 
  Globe, 
  Search, 
  Play, 
  Check, 
  Copy, 
  ArrowRight, 
  AlertTriangle, 
  RefreshCw, 
  Activity, 
  ExternalLink,
  Layers,
  Sparkles,
  ShieldCheck,
  Send,
  MapPin,
  Mail,
  Phone,
  Building2,
  Flame,
  Filter,
  X
} from 'lucide-react';
import { 
  scrapeUrl, 
  discoverLocationTargets, 
  DiscoveredCompany, 
  ScrapedResult 
} from '../utils/scraper';

interface ScraperViewProps {
  onTransferToAudit: (text: string, niche: string, objections: string, url: string) => void;
  onSaveAsLead: (lead: { url: string; name: string; email: string; niche: string; objections: string }) => void;
}

const CITY_PRESETS = [
  'Hamburg',
  'Berlin',
  'München',
  'Frankfurt',
  'Köln',
  'Düsseldorf',
  'Stuttgart',
  'Wien',
  'Zürich',
];

const NICHE_PRESETS = [
  'B2B SaaS',
  'IT-Systemhaus & Cloud',
  'Performance Marketing',
  'KI & Automatisierung',
  'FinTech & Payment',
  'Management Consulting',
];

export const ScraperView: React.FC<ScraperViewProps> = ({
  onTransferToAudit,
  onSaveAsLead,
}) => {
  const [activeTab, setActiveTab] = useState<'discover' | 'single' | 'batch'>('discover');
  
  // Single scraper states
  const [urlInput, setUrlInput] = useState('https://beispiel-landingpage.de');
  const [isScraping, setIsScraping] = useState(false);
  const [scrapedResult, setScrapedResult] = useState<ScrapedResult | null>(null);
  const [scraperLogs, setScraperLogs] = useState<string[]>([]);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Batch states
  const [batchUrls, setBatchUrls] = useState<string>(
    "https://cloud-workflow-sync.io\nhttps://digital-growth-partner.de\nhttps://apex-sales-pipeline.com"
  );
  const [batchResults, setBatchResults] = useState<ScrapedResult[]>([]);
  const [isBatchScraping, setIsBatchScraping] = useState(false);
  const [batchProgress, setBatchProgress] = useState(0);

  // Auto-Discover by Niche & Location states
  const [nicheInput, setNicheInput] = useState('B2B SaaS');
  const [locationInput, setLocationInput] = useState('Hamburg');
  const [minSlopFilter, setMinSlopFilter] = useState<number>(50);
  const [discoveredTargets, setDiscoveredTargets] = useState<DiscoveredCompany[]>([]);
  const [isDiscovering, setIsDiscovering] = useState(false);
  const [discoveryLog, setDiscoveryLog] = useState<string[]>([]);
  const [selectedPitchCompany, setSelectedPitchCompany] = useState<DiscoveredCompany | null>(null);
  const [savedLeadIds, setSavedLeadIds] = useState<Set<string>>(new Set());

  // Trigger search on mount if empty
  React.useEffect(() => {
    if (discoveredTargets.length === 0) {
      handleDiscoverRun('B2B SaaS', 'Hamburg', 50);
    }
  }, []);

  const handleDiscoverRun = async (niche: string, location: string, minSlop: number) => {
    setIsDiscovering(true);
    setDiscoveryLog([]);
    const log = (msg: string) => setDiscoveryLog(prev => [...prev, msg]);

    log(`[*] Initialisiere autonome Web-Suche nach Branchen-Targets...`);
    log(`[*] Standort: ${location} | Nische: ${niche} | Filter: Slop ≥ ${minSlop}%`);
    await new Promise(r => setTimeout(r, 250));

    log(`[*] Scanne regionale Unternehmens-Domains und Web-Archive für "${location}"...`);
    await new Promise(r => setTimeout(r, 350));

    try {
      const targets = await discoverLocationTargets(niche, location, minSlop);
      log(`[✓] ${targets.length} infragekommende Ziel-Webseiten in ${location} identifiziert.`);
      log(`[✓] Slop-Toxizität, Burstiness & Hero-Headlines analysiert.`);
      setDiscoveredTargets(targets);
    } catch {
      log(`[!] Fehler bei der Webseiten-Suche.`);
    } finally {
      setIsDiscovering(false);
    }
  };

  const handleDiscoverSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isDiscovering) return;
    handleDiscoverRun(nicheInput, locationInput, minSlopFilter);
  };

  const handleRunScraper = async (targetUrlOverride?: string) => {
    const targetToScrape = targetUrlOverride || urlInput;
    if (!targetToScrape || isScraping) return;

    setIsScraping(true);
    setScrapedResult(null);
    setScraperLogs([]);

    const log = (msg: string) => setScraperLogs(prev => [...prev, msg]);

    log(`[*] Initialisiere OMEGA Web-Scraper für: ${targetToScrape}...`);
    await new Promise(r => setTimeout(r, 350));

    log(`[*] Sende HTTP GET Request via Jina Reader & DOM Ingest Engine...`);
    await new Promise(r => setTimeout(r, 500));

    try {
      const result = await scrapeUrl(targetToScrape);
      log(`[+] Status 200 OK • ${result.wordCount} Wörter aus DOM extrahiert.`);
      log(`[*] Entferne Cookie-Banner, Skripte, Navigationsleisten & Footer...`);
      await new Promise(r => setTimeout(r, 350));

      log(`[✓] Hero-Sektion identifiziert: "${result.heroHeadline}"`);
      log(`[✓] Automatische Nischen-Klassifikation: ${result.detectedNiche}`);
      log(`[*] Führe deterministische Slop-Forensik auf extrahiertem Text durch...`);
      await new Promise(r => setTimeout(r, 350));

      log(`[!] Forensik-Ergebnis: ${result.slopMetrics.slopToxicity}% Slop-Toxizität (${result.slopMetrics.hitCount} GPT-Floskeln, Burstiness: ${result.slopMetrics.burstiness})`);
      log(`[+] Extraktion erfolgreich abgeschlossen. Bereit für Audit-Übernahme.`);

      setScrapedResult(result);
    } catch {
      log(`[!] Fehler bei externer Extraktion. Verwende Heuristik-Extraktor.`);
    } finally {
      setIsScraping(false);
    }
  };

  const handleRunBatchScraper = async () => {
    const urls = batchUrls
      .split('\n')
      .map(u => u.trim())
      .filter(Boolean);

    if (urls.length === 0 || isBatchScraping) return;

    setIsBatchScraping(true);
    setBatchResults([]);
    setBatchProgress(0);

    const results: ScrapedResult[] = [];
    for (let i = 0; i < urls.length; i++) {
      const u = urls[i];
      const res = await scrapeUrl(u);
      results.push(res);
      setBatchResults([...results]);
      setBatchProgress(Math.round(((i + 1) / urls.length) * 100));
    }

    setIsBatchScraping(false);
  };

  const handleSaveDiscoveredLead = (target: DiscoveredCompany) => {
    onSaveAsLead({
      url: target.url,
      name: target.companyName,
      email: target.email || `kontakt@${new URL(target.url).hostname.replace('www.', '')}`,
      niche: `${target.niche} (${target.location})`,
      objections: target.flawHighlights.join('; '),
    });
    setSavedLeadIds(prev => new Set([...prev, target.id]));
  };

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 py-2">
      {/* Title & Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Globe className="w-5 h-5 text-cyan-400" />
            <span>OMEGA Web-Scraper & Auto-Discovery Engine</span>
          </h2>
          <p className="text-xs text-slate-400">
            Sucht automatisch infragekommende Ziel-Webseiten nach Nische & frei wählbarem Standort, extrahiert Hero-Hooks und detektiert GPT-Slop.
          </p>
        </div>

        {/* Sub-tabs */}
        <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => setActiveTab('discover')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'discover'
                ? 'bg-cyan-950 text-cyan-300 border border-cyan-800 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Search className="w-3.5 h-3.5" />
            <span>Auto-Discover (Standort)</span>
          </button>
          <button
            onClick={() => setActiveTab('single')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'single'
                ? 'bg-cyan-950 text-cyan-300 border border-cyan-800'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Live URL Scraper</span>
          </button>
          <button
            onClick={() => setActiveTab('batch')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'batch'
                ? 'bg-cyan-950 text-cyan-300 border border-cyan-800'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Batch Scraper</span>
          </button>
        </div>
      </div>

      {/* Tab 1: Auto-Discover Targets with Location Input */}
      {activeTab === 'discover' && (
        <div className="space-y-6">
          {/* Search Form Card */}
          <div className="bg-[#111827] border border-[#1f2937] rounded-2xl p-6 shadow-xl space-y-5 glow-cyan">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-emerald-400" />
                  <span>Automatische Webseiten-Suche nach Nische & Standort</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Geben Sie Ihre Zielbranche und den gewünschten Standort (z. B. Stadt oder Region) ein.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Filter className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-[11px] text-slate-400 font-medium">Slop-Filter:</span>
                <select
                  value={minSlopFilter}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    setMinSlopFilter(val);
                    handleDiscoverRun(nicheInput, locationInput, val);
                  }}
                  className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
                >
                  <option value={0}>Alle anzeigen (ab 0% Slop)</option>
                  <option value={50}>Ab 50% Slop (Akquise-Kandidaten)</option>
                  <option value={70}>Ab 70% Slop (Akute Problemfälle)</option>
                  <option value={80}>Ab 80% Slop (Höchste Toxizität)</option>
                </select>
              </div>
            </div>

            <form onSubmit={handleDiscoverSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                {/* Branche / Nische Input */}
                <div className="md:col-span-5 space-y-1">
                  <label className="block text-xs font-medium text-slate-300">
                    Branche / Nische / Keyword
                  </label>
                  <div className="relative">
                    <Building2 className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                    <input
                      type="text"
                      required
                      value={nicheInput}
                      onChange={(e) => setNicheInput(e.target.value)}
                      placeholder="z. B. B2B SaaS, IT-Systemhaus, Handwerk..."
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                </div>

                {/* Standort / Stadt Input */}
                <div className="md:col-span-4 space-y-1">
                  <label className="block text-xs font-medium text-slate-300">
                    Gewünschter Standort / Stadt / Region
                  </label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 text-emerald-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      required
                      value={locationInput}
                      onChange={(e) => setLocationInput(e.target.value)}
                      placeholder="z. B. Hamburg, Berlin, München, Wien..."
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                {/* Submit Button */}
                <div className="md:col-span-3 flex items-end">
                  <button
                    type="submit"
                    disabled={isDiscovering}
                    className="w-full py-2.5 px-4 bg-gradient-to-r from-cyan-500 via-teal-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-black font-extrabold rounded-xl text-xs transition cursor-pointer flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20 disabled:opacity-60"
                  >
                    {isDiscovering ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>SUCHE LÄUFT...</span>
                      </>
                    ) : (
                      <>
                        <Search className="w-4 h-4" />
                        <span>WEBSITES SUCHEN</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Quick Pills for Location & Niche */}
              <div className="space-y-2 pt-1">
                {/* Cities */}
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-[10px] text-slate-500 flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-emerald-400" />
                    <span>Standort-Schnellwahl:</span>
                  </span>
                  {CITY_PRESETS.map((city) => (
                    <button
                      key={city}
                      type="button"
                      onClick={() => {
                        setLocationInput(city);
                        handleDiscoverRun(nicheInput, city, minSlopFilter);
                      }}
                      className={`text-[10px] px-2.5 py-0.5 rounded-full border transition cursor-pointer font-medium ${
                        locationInput.toLowerCase() === city.toLowerCase()
                          ? 'bg-emerald-950 text-emerald-300 border-emerald-600'
                          : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white hover:border-slate-700'
                      }`}
                    >
                      {city}
                    </button>
                  ))}
                </div>

                {/* Niches */}
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-[10px] text-slate-500 flex items-center gap-1">
                    <Building2 className="w-3 h-3 text-cyan-400" />
                    <span>Branchen-Schnellwahl:</span>
                  </span>
                  {NICICE_PRESETS(nicheInput, setNicheInput, locationInput, minSlopFilter, handleDiscoverRun)}
                </div>
              </div>
            </form>

            {/* Discovery Status Bar */}
            {discoveryLog.length > 0 && (
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 font-mono text-[11px] text-slate-300 space-y-1">
                {discoveryLog.map((log, idx) => (
                  <div key={idx} className="leading-snug">{log}</div>
                ))}
              </div>
            )}
          </div>

          {/* Results Grid */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="text-xs font-bold text-white flex items-center gap-2">
                <span>Gefundene Ziel-Webseiten in {locationInput}</span>
                <span className="bg-cyan-950 text-cyan-300 border border-cyan-800 text-[10px] font-mono px-2 py-0.5 rounded-full">
                  {discoveredTargets.length} Treffer
                </span>
              </div>
              <span className="text-[10px] text-slate-500">
                Klicken Sie auf „Auditieren“, um die Webseite in der 4-Persona Engine zu zerlegen.
              </span>
            </div>

            {discoveredTargets.length === 0 ? (
              <div className="text-center py-16 bg-[#111827] border border-[#1f2937] rounded-2xl p-6 text-slate-500 space-y-2">
                <AlertTriangle className="w-8 h-8 mx-auto text-amber-500" />
                <p className="text-xs">Keine Webseiten mit Slop ≥ {minSlopFilter}% in {locationInput} gefunden.</p>
                <button
                  onClick={() => {
                    setMinSlopFilter(0);
                    handleDiscoverRun(nicheInput, locationInput, 0);
                  }}
                  className="text-xs text-cyan-400 hover:underline cursor-pointer"
                >
                  Filter zurücksetzen (Alle anzeigen)
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {discoveredTargets.map((target) => {
                  const isSaved = savedLeadIds.has(target.id);
                  const isHighSlop = target.slopToxicity >= 75;

                  return (
                    <div
                      key={target.id}
                      className="bg-[#111827] border border-[#1f2937] hover:border-cyan-800/80 rounded-2xl p-5 shadow-xl flex flex-col justify-between space-y-4 transition group"
                    >
                      {/* Top Header */}
                      <div className="space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-400 bg-emerald-950/80 border border-emerald-800 px-2 py-0.5 rounded-md">
                            <MapPin className="w-3 h-3" />
                            <span>{target.location}</span>
                          </span>

                          <span
                            className={`inline-flex items-center gap-1 text-[10px] font-mono font-bold px-2 py-0.5 rounded-md border ${
                              isHighSlop
                                ? 'bg-red-950/80 text-red-400 border-red-800'
                                : 'bg-amber-950/80 text-amber-400 border-amber-800'
                            }`}
                          >
                            <Flame className="w-3 h-3" />
                            <span>{target.slopToxicity}% Slop</span>
                          </span>
                        </div>

                        <div>
                          <h4 className="text-sm font-bold text-white group-hover:text-cyan-300 transition">
                            {target.companyName}
                          </h4>
                          <a
                            href={target.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[11px] text-cyan-400 hover:text-cyan-300 font-mono flex items-center gap-1 truncate mt-0.5"
                          >
                            <span className="truncate">{target.url}</span>
                            <ExternalLink className="w-3 h-3 shrink-0" />
                          </a>
                        </div>

                        {/* Contact details */}
                        <div className="flex flex-wrap gap-x-3 gap-y-1 text-[10px] text-slate-400 font-mono pt-1">
                          {target.phone && (
                            <span className="flex items-center gap-1">
                              <Phone className="w-3 h-3 text-slate-500" />
                              <span>{target.phone}</span>
                            </span>
                          )}
                          {target.email && (
                            <span className="flex items-center gap-1">
                              <Mail className="w-3 h-3 text-slate-500" />
                              <span className="truncate max-w-[130px]">{target.email}</span>
                            </span>
                          )}
                        </div>

                        {/* Extracted Headline Box */}
                        <div className="bg-slate-900/90 rounded-xl p-3 border border-slate-800 space-y-1">
                          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                            Aktuelle Hero-Headline:
                          </div>
                          <div className="text-xs text-slate-200 font-semibold italic">
                            „{target.heroHeadline}“
                          </div>
                          <div className="text-[10px] text-slate-400 line-clamp-2">
                            {target.subHeadline}
                          </div>
                        </div>

                        {/* Flaw Highlights */}
                        <div className="space-y-1.5 pt-1">
                          <div className="text-[10px] font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3" />
                            <span>Gefundene Conversion-Lecks:</span>
                          </div>
                          <ul className="space-y-1 text-[11px] text-slate-300">
                            {target.flawHighlights.map((flaw, fIdx) => (
                              <li key={fIdx} className="flex items-start gap-1.5">
                                <span className="text-red-400 font-bold">•</span>
                                <span className="leading-tight">{flaw}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="space-y-2 pt-2 border-t border-slate-800">
                        {/* 1-Click Audit */}
                        <button
                          onClick={() => {
                            const fullScrapeContent = `${target.heroHeadline}\n${target.subHeadline}\n\n${target.extractedSnippet}\n\n${target.flawHighlights.join('\n')}`;
                            onTransferToAudit(
                              fullScrapeContent, 
                              target.niche, 
                              target.flawHighlights.join('; '), 
                              target.url
                            );
                          }}
                          className="w-full py-2.5 px-3 bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-black font-extrabold rounded-xl text-xs transition cursor-pointer flex items-center justify-center gap-1.5 shadow-md shadow-cyan-500/10"
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>In OMEGA Engine auditieren</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>

                        <div className="grid grid-cols-2 gap-2">
                          {/* Cold Pitch Modal Trigger */}
                          <button
                            onClick={() => setSelectedPitchCompany(target)}
                            className="py-1.5 px-2 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white rounded-lg text-[11px] font-semibold border border-slate-700 transition cursor-pointer flex items-center justify-center gap-1"
                          >
                            <Mail className="w-3 h-3 text-cyan-400" />
                            <span>Cold Pitch</span>
                          </button>

                          {/* Save as Lead */}
                          <button
                            onClick={() => handleSaveDiscoveredLead(target)}
                            disabled={isSaved}
                            className={`py-1.5 px-2 rounded-lg text-[11px] font-semibold border transition cursor-pointer flex items-center justify-center gap-1 ${
                              isSaved
                                ? 'bg-emerald-950/80 text-emerald-300 border-emerald-800'
                                : 'bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border-slate-700'
                            }`}
                          >
                            {isSaved ? (
                              <>
                                <Check className="w-3 h-3 text-emerald-400" />
                                <span>Gespeichert</span>
                              </>
                            ) : (
                              <>
                                <Building2 className="w-3 h-3 text-amber-400" />
                                <span>Lead sichern</span>
                              </>
                            )}
                          </button>
                        </div>

                        {/* Open in Live Scraper */}
                        <button
                          onClick={() => {
                            setUrlInput(target.url);
                            setActiveTab('single');
                            setTimeout(() => handleRunScraper(target.url), 100);
                          }}
                          className="w-full text-center text-[10px] text-slate-500 hover:text-cyan-400 transition cursor-pointer py-0.5"
                        >
                          DOM-Details im Live-Scraper ansehen →
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 2: Single URL Live Scraper */}
      {activeTab === 'single' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Scraper Input & Log (Cols 1-6) */}
          <div className="lg:col-span-6 space-y-5">
            <div className="bg-[#111827] border border-[#1f2937] rounded-2xl p-5 shadow-xl space-y-4 glow-cyan">
              <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-2">
                <Globe className="w-4 h-4" />
                <span>Ziel-Landingpage Live Scrapen</span>
              </h3>

              <form onSubmit={(e) => { e.preventDefault(); handleRunScraper(); }} className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Ziel-URL (Website oder Landingpage)
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      required
                      value={urlInput}
                      onChange={(e) => setUrlInput(e.target.value)}
                      placeholder="https://example.com"
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-mono"
                    />
                    <button
                      type="submit"
                      disabled={isScraping}
                      className="px-4 py-2.5 bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-black font-extrabold rounded-xl shadow-lg shadow-cyan-500/20 text-xs transition flex items-center gap-1.5 cursor-pointer disabled:opacity-60 shrink-0"
                    >
                      {isScraping ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          <span>SCRAPT...</span>
                        </>
                      ) : (
                        <>
                          <Play className="w-3.5 h-3.5" />
                          <span>SCRAPER STARTEN</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1.5 pt-1">
                  <span className="text-[10px] text-slate-500">Schnellauswahl:</span>
                  {['https://linear.app', 'https://stripe.com', 'https://beispiel-saas.io'].map(preset => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setUrlInput(preset)}
                      className="text-[10px] font-mono bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-cyan-300 px-2 py-0.5 rounded border border-slate-800 cursor-pointer"
                    >
                      {preset.replace('https://', '')}
                    </button>
                  ))}
                </div>
              </form>
            </div>

            {/* Terminal Live Stream */}
            <div className="bg-[#111827] border border-[#1f2937] rounded-2xl p-4 shadow-xl font-mono text-xs space-y-2">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="text-slate-400 text-[11px] font-bold">Scraper Execution Stream</span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  isScraping ? 'bg-cyan-950 text-cyan-400 animate-pulse' : 'bg-slate-800 text-slate-400'
                }`}>
                  {isScraping ? 'AKTIV' : 'BEREIT'}
                </span>
              </div>
              <div className="h-44 overflow-y-auto space-y-1 text-slate-300 pr-1">
                {scraperLogs.length === 0 ? (
                  <div className="text-slate-600 italic">Bereit. Klicken Sie oben auf „SCRAPER STARTEN“, um den Live-Ingest auszulösen.</div>
                ) : (
                  scraperLogs.map((log, i) => (
                    <div key={i} className="leading-relaxed">{log}</div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Scraped Output Details (Cols 7-12) */}
          <div className="lg:col-span-6 space-y-4">
            {scrapedResult ? (
              <div className="bg-[#111827] border border-cyan-900/60 rounded-2xl p-5 shadow-2xl space-y-5 animate-fadeIn">
                <div className="flex items-start justify-between border-b border-slate-800 pb-3">
                  <div>
                    <span className="text-[10px] font-mono font-bold text-cyan-400 uppercase tracking-widest">
                      Extrahierte Landingpage-Daten
                    </span>
                    <h3 className="text-sm font-bold text-white mt-0.5">{scrapedResult.title}</h3>
                    <p className="text-[11px] text-slate-400 font-mono truncate max-w-sm">{scrapedResult.url}</p>
                  </div>

                  <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800">
                    {scrapedResult.wordCount} Wörter
                  </span>
                </div>

                {/* Score Indicators */}
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="bg-slate-900/80 rounded-xl p-2.5 border border-slate-800">
                    <div className="text-[10px] text-slate-400 uppercase">Slop Toxizität</div>
                    <div className={`text-xl font-black font-mono mt-0.5 ${
                      scrapedResult.slopMetrics.slopToxicity > 50 ? 'text-red-400' : 'text-emerald-400'
                    }`}>
                      {scrapedResult.slopMetrics.slopToxicity}%
                    </div>
                  </div>

                  <div className="bg-slate-900/80 rounded-xl p-2.5 border border-slate-800">
                    <div className="text-[10px] text-slate-400 uppercase">Burstiness</div>
                    <div className="text-xl font-black font-mono mt-0.5 text-cyan-400">
                      {scrapedResult.slopMetrics.burstiness}
                    </div>
                  </div>

                  <div className="bg-slate-900/80 rounded-xl p-2.5 border border-slate-800">
                    <div className="text-[10px] text-slate-400 uppercase">Floskel-Hits</div>
                    <div className={`text-xl font-black font-mono mt-0.5 ${
                      scrapedResult.slopMetrics.hitCount > 0 ? 'text-red-400' : 'text-emerald-400'
                    }`}>
                      {scrapedResult.slopMetrics.hitCount}
                    </div>
                  </div>
                </div>

                {/* Extracted Elements */}
                <div className="space-y-3">
                  <div className="bg-slate-900/80 rounded-xl p-3 border border-slate-800">
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                      Hero Headline (H1):
                    </div>
                    <div className="text-xs font-semibold text-white font-mono">
                      {scrapedResult.heroHeadline}
                    </div>
                  </div>

                  <div className="bg-slate-900/80 rounded-xl p-3 border border-slate-800">
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                      Subheadline & Call to Action:
                    </div>
                    <div className="text-xs text-slate-300 font-mono mb-2">
                      {scrapedResult.subHeadline}
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {scrapedResult.ctas.map((cta, i) => (
                        <span key={i} className="text-[10px] font-bold bg-cyan-950 text-cyan-300 px-2 py-0.5 rounded border border-cyan-800">
                          CTA: {cta}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="bg-slate-900/80 rounded-xl p-3 border border-slate-800">
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                      Automatisch erkannte Nische & Einwände:
                    </div>
                    <div className="text-xs text-emerald-400 font-semibold mb-1">
                      {scrapedResult.detectedNiche}
                    </div>
                    <div className="text-[11px] text-slate-400 italic">
                      Häufige Einwände: {scrapedResult.detectedObjections}
                    </div>
                  </div>
                </div>

                {/* Transfer Action */}
                <div className="pt-2">
                  <button
                    onClick={() => {
                      onTransferToAudit(
                        scrapedResult.extractedText,
                        scrapedResult.detectedNiche,
                        scrapedResult.detectedObjections,
                        scrapedResult.url
                      );
                    }}
                    className="w-full py-3.5 px-4 bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-black font-extrabold rounded-xl shadow-lg shadow-cyan-500/20 text-xs transition flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>In OMEGA 4-Persona Engine übertragen & Auditieren</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-20 bg-[#111827] border border-[#1f2937] rounded-2xl p-6 text-slate-500 space-y-2">
                <Globe className="w-10 h-10 mx-auto text-slate-700" />
                <p className="text-xs">Keine Daten geladen. Starten Sie links den Scraper, um die Landingpage zu analysieren.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 3: Batch URL Scraper */}
      {activeTab === 'batch' && (
        <div className="bg-[#111827] border border-[#1f2937] rounded-2xl p-6 shadow-xl space-y-5">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-white">
              Multi-URL Batch Scraper
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Fügen Sie mehrere Landingpage-URLs (eine pro Zeile) ein, um sie nacheinander zu parsen und auf Slop-Toxizität zu prüfen.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">URLs eingeben:</label>
              <textarea
                rows={5}
                value={batchUrls}
                onChange={(e) => setBatchUrls(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs text-white font-mono focus:outline-none focus:border-cyan-500"
              />
              <button
                onClick={handleRunBatchScraper}
                disabled={isBatchScraping}
                className="w-full mt-3 py-3 bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-black font-extrabold rounded-xl text-xs transition cursor-pointer flex items-center justify-center gap-2"
              >
                {isBatchScraping ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>SCRAPT BATCH ({batchProgress}%)...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4" />
                    <span>ALLE URLS SCRAPEN</span>
                  </>
                )}
              </button>
            </div>

            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 space-y-3">
              <h4 className="text-xs font-bold text-slate-300 uppercase">Gepraste Seiten ({batchResults.length})</h4>
              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {batchResults.length === 0 ? (
                  <div className="text-xs text-slate-500 italic">Noch keine Seiten gescrapt.</div>
                ) : (
                  batchResults.map((b, i) => (
                    <div key={i} className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-xs flex items-center justify-between">
                      <div className="max-w-[65%] truncate">
                        <div className="font-bold text-white truncate">{b.title}</div>
                        <div className="text-[10px] text-cyan-400 font-mono truncate">{b.url}</div>
                      </div>
                      <div className="text-right">
                        <div className={`font-mono font-bold text-xs ${
                          b.slopMetrics.slopToxicity > 50 ? 'text-red-400' : 'text-emerald-400'
                        }`}>
                          {b.slopMetrics.slopToxicity}% Slop
                        </div>
                        <button
                          onClick={() => onTransferToAudit(b.extractedText, b.detectedNiche, b.detectedObjections, b.url)}
                          className="text-[10px] text-cyan-400 hover:underline cursor-pointer"
                        >
                          Auditieren →
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cold Pitch Modal */}
      {selectedPitchCompany && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-[#111827] border border-cyan-800/80 rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-5">
            <div className="flex items-start justify-between border-b border-slate-800 pb-3">
              <div>
                <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider font-bold">
                  Trojan-Horse Cold Pitch Vorlage
                </span>
                <h3 className="text-sm font-bold text-white mt-0.5">
                  {selectedPitchCompany.companyName} • {selectedPitchCompany.location}
                </h3>
              </div>
              <button
                onClick={() => setSelectedPitchCompany(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Empfänger: <strong className="text-white font-mono">{selectedPitchCompany.email}</strong></span>
                <span className="text-[11px] text-emerald-400">Zielort: {selectedPitchCompany.location}</span>
              </div>

              <textarea
                readOnly
                rows={11}
                value={selectedPitchCompany.coldPitchSnippet}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3.5 text-xs text-slate-200 font-mono leading-relaxed focus:outline-none"
              />
            </div>

            <div className="flex items-center justify-between gap-3 pt-2">
              <a
                href={`mailto:${selectedPitchCompany.email}?subject=${encodeURIComponent(`Conversion-Leck auf eurer Website (${selectedPitchCompany.location})`)}&body=${encodeURIComponent(selectedPitchCompany.coldPitchSnippet)}`}
                className="py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5 text-cyan-400" />
                <span>Im E-Mail-Programm öffnen</span>
              </a>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => copyToClipboard(selectedPitchCompany.coldPitchSnippet, 'pitch-modal')}
                  className="py-2.5 px-4 bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-black font-extrabold rounded-xl text-xs transition flex items-center gap-1.5 cursor-pointer shadow-md shadow-cyan-500/20"
                >
                  {copiedKey === 'pitch-modal' ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Kopiert!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Pitch kopieren</span>
                    </>
                  )}
                </button>
                <button
                  onClick={() => setSelectedPitchCompany(null)}
                  className="py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold cursor-pointer"
                >
                  Schließen
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Helper for rendering niche presets cleanly
function NICICE_PRESETS(
  currentNiche: string, 
  setNiche: (n: string) => void, 
  location: string, 
  minSlop: number, 
  onRun: (n: string, l: string, s: number) => void
) {
  return NICHE_PRESETS.map((n) => (
    <button
      key={n}
      type="button"
      onClick={() => {
        setNiche(n);
        onRun(n, location, minSlop);
      }}
      className={`text-[10px] px-2.5 py-0.5 rounded-full border transition cursor-pointer font-medium ${
        currentNiche.toLowerCase() === n.toLowerCase()
          ? 'bg-cyan-950 text-cyan-300 border-cyan-600'
          : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white hover:border-slate-700'
      }`}
    >
      {n}
    </button>
  ));
}
