import React, { useState, useMemo } from 'react';
import { 
  X, 
  Download, 
  Copy, 
  Check, 
  ExternalLink, 
  Monitor, 
  Tablet, 
  Smartphone, 
  Code, 
  Eye, 
  Sparkles,
  FileCheck2,
  Globe
} from 'lucide-react';
import { AuditRun, MarketLanguage } from '../types';
import { generateLandingPageHtml, downloadLandingPageHtml } from '../utils/landingPageHtmlGenerator';

interface LandingPagePreviewModalProps {
  audit: AuditRun;
  isOpen: boolean;
  onClose: () => void;
  initialLang?: MarketLanguage;
}

export const LandingPagePreviewModal: React.FC<LandingPagePreviewModalProps> = ({
  audit,
  isOpen,
  onClose,
  initialLang,
}) => {
  const [previewLang, setPreviewLang] = useState<MarketLanguage>(initialLang || audit.market || 'de');
  const [activeTab, setActiveTab] = useState<'preview' | 'code'>('preview');
  const [device, setDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [copied, setCopied] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  const rawHtml = useMemo(() => generateLandingPageHtml(audit, previewLang), [audit, previewLang]);

  if (!isOpen) return null;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(rawHtml);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    downloadLandingPageHtml(audit, previewLang);
    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 2500);
  };

  const handleOpenInNewTab = () => {
    const blob = new Blob([rawHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 md:p-6 animate-fadeIn">
      <div className="bg-[#0f172a] border border-[#1e293b] rounded-2xl max-w-7xl w-full h-[94vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Top Header Bar */}
        <div className="px-5 py-3.5 bg-slate-900 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-cyan-400 via-cyan-500 to-emerald-400 flex items-center justify-center text-black font-black text-sm shadow-md shadow-cyan-500/20">
              <Globe className="w-4 h-4 text-black" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white tracking-wide">
                  Schlüsselfertige HTML-Landingpage (Plug & Play)
                </h3>
                <span className="text-[10px] bg-emerald-950 text-emerald-300 border border-emerald-800 font-mono px-2 py-0.5 rounded-full font-bold">
                  92+ Pkt Gehärtet
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Eigenständige, responsive Single-File HTML-Datei &bull; Direkt auf Webspace / CMS hochladbar
              </p>
            </div>
          </div>

          {/* Center: Language, Device & Mode Switcher */}
          <div className="flex items-center gap-2">
            {/* Language Switcher */}
            <div className="flex items-center bg-slate-950 border border-slate-800 rounded-xl p-1 gap-1">
              <button
                type="button"
                onClick={() => setPreviewLang('de')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
                  previewLang === 'de'
                    ? 'bg-cyan-950 text-cyan-300 border border-cyan-800'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Deutsche Fassung (DACH B2B, DSGVO, EUR)"
              >
                <span>🇩🇪</span>
                <span className="hidden sm:inline">DE</span>
              </button>
              <button
                type="button"
                onClick={() => setPreviewLang('en')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
                  previewLang === 'en'
                    ? 'bg-cyan-950 text-cyan-300 border border-cyan-800'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="US / Global English Version (Direct Response, SOC-2, USD)"
              >
                <span>🇺🇸</span>
                <span className="hidden sm:inline">EN</span>
              </button>
            </div>

            {activeTab === 'preview' && (
              <div className="hidden sm:flex items-center bg-slate-950 border border-slate-800 rounded-xl p-1 gap-1">
                <button
                  onClick={() => setDevice('desktop')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium flex items-center gap-1.5 transition cursor-pointer ${
                    device === 'desktop'
                      ? 'bg-cyan-950 text-cyan-300 border border-cyan-800'
                      : 'text-slate-400 hover:text-white'
                  }`}
                  title="Desktop-Ansicht (100% Breite)"
                >
                  <Monitor className="w-3.5 h-3.5" />
                  <span>Desktop</span>
                </button>

                <button
                  onClick={() => setDevice('tablet')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium flex items-center gap-1.5 transition cursor-pointer ${
                    device === 'tablet'
                      ? 'bg-cyan-950 text-cyan-300 border border-cyan-800'
                      : 'text-slate-400 hover:text-white'
                  }`}
                  title="Tablet-Ansicht (768px)"
                >
                  <Tablet className="w-3.5 h-3.5" />
                  <span>Tablet</span>
                </button>

                <button
                  onClick={() => setDevice('mobile')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium flex items-center gap-1.5 transition cursor-pointer ${
                    device === 'mobile'
                      ? 'bg-cyan-950 text-cyan-300 border border-cyan-800'
                      : 'text-slate-400 hover:text-white'
                  }`}
                  title="Mobile-Ansicht (375px)"
                >
                  <Smartphone className="w-3.5 h-3.5" />
                  <span>Mobile</span>
                </button>
              </div>
            )}

            <div className="flex items-center bg-slate-950 border border-slate-800 rounded-xl p-1 gap-1">
              <button
                onClick={() => setActiveTab('preview')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${
                  activeTab === 'preview'
                    ? 'bg-cyan-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Vorschau</span>
              </button>

              <button
                onClick={() => setActiveTab('code')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${
                  activeTab === 'code'
                    ? 'bg-cyan-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Code className="w-3.5 h-3.5" />
                <span>HTML Code</span>
              </button>
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyCode}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer"
              title="Vollständigen HTML-Code in die Zwischenablage kopieren"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Code kopiert!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Code kopieren</span>
                </>
              )}
            </button>

            <button
              onClick={handleDownload}
              className="px-3.5 py-1.5 bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-black text-xs font-extrabold rounded-lg transition flex items-center gap-1.5 cursor-pointer shadow-md shadow-cyan-500/20"
              title="HTML-Datei (index.html) herunterladen"
            >
              {downloadSuccess ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Heruntergeladen!</span>
                </>
              ) : (
                <>
                  <Download className="w-3.5 h-3.5" />
                  <span>HTML laden (.html)</span>
                </>
              )}
            </button>

            <button
              onClick={handleOpenInNewTab}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 cursor-pointer transition"
              title="In neuem Browser-Tab öffnen"
            >
              <ExternalLink className="w-4 h-4" />
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 cursor-pointer transition ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Viewport Area */}
        <div className="flex-1 bg-slate-950 overflow-hidden flex items-center justify-center p-2 sm:p-4 relative">
          {activeTab === 'preview' ? (
            <div
              className={`h-full transition-all duration-300 rounded-xl overflow-hidden shadow-2xl border border-slate-800 bg-[#0b0f19] flex flex-col ${
                device === 'desktop'
                  ? 'w-full'
                  : device === 'tablet'
                  ? 'w-[768px] border-4 border-slate-700'
                  : 'w-[375px] border-8 border-slate-700 rounded-3xl'
              }`}
            >
              {/* Browser mockup bar */}
              <div className="bg-slate-900 border-b border-slate-800 px-3 py-1.5 flex items-center gap-2 shrink-0">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500/80"></span>
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80"></span>
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80"></span>
                </div>
                <div className="flex-1 max-w-sm mx-auto bg-slate-950 border border-slate-800 rounded px-2.5 py-0.5 text-[10px] text-slate-400 text-center font-mono truncate">
                  https://{audit.targetSource.replace(/^https?:\/\//, '').replace(/\/.*$/, '')}/index.html
                </div>
                <div className="text-[10px] text-emerald-400 font-mono font-bold">
                  200 OK
                </div>
              </div>

              {/* Sandboxed iframe */}
              <iframe
                title="Landing Page Preview"
                srcDoc={rawHtml}
                className="w-full flex-1 border-0 bg-[#0b0f19]"
                sandbox="allow-scripts allow-forms allow-same-origin"
              />
            </div>
          ) : (
            <div className="w-full h-full bg-slate-900/90 rounded-xl border border-slate-800 p-4 overflow-y-auto">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
                <div className="flex items-center gap-2">
                  <FileCheck2 className="w-4 h-4 text-cyan-400" />
                  <span className="text-xs font-bold text-white uppercase font-mono">
                    {audit.id}_READY_TO_DEPLOY_LANDINGPAGE.html
                  </span>
                </div>
                <span className="text-xs text-slate-400 font-mono">
                  {rawHtml.length.toLocaleString('de-DE')} Zeichen &bull; Standalone Single-File
                </span>
              </div>
              <pre className="text-xs font-mono text-slate-300 whitespace-pre-wrap leading-relaxed select-all selection:bg-cyan-500 selection:text-black">
                {rawHtml}
              </pre>
            </div>
          )}
        </div>

        {/* Bottom Bar Info */}
        <div className="px-5 py-2.5 bg-slate-900 border-t border-slate-800 flex flex-wrap items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span>
              Kunden-Einsatz: Einfach als <code className="bg-slate-950 px-1 py-0.5 rounded text-cyan-300 font-mono">index.html</code> per FTP hochladen oder als Sektionen in Webflow / WordPress kopieren.
            </span>
          </div>
          <div className="text-[11px] text-slate-500 font-mono">
            Keine Datenbank nötig &bull; Null Wartung &bull; Maximale Conversion
          </div>
        </div>

      </div>
    </div>
  );
};
