import React, { useState } from 'react';
import { Printer, Download, Copy, Check, FileText, X } from 'lucide-react';
import { AuditRun, MarketLanguage } from '../types';
import { generateExecutiveReportHtml, generateDossierMarkdown } from '../utils/slopSanitizer';

interface ExecutiveReportModalProps {
  audit: AuditRun;
  isOpen: boolean;
  onClose: () => void;
  initialLang?: MarketLanguage;
}

export const ExecutiveReportModal: React.FC<ExecutiveReportModalProps> = ({
  audit,
  isOpen,
  onClose,
  initialLang,
}) => {
  const [reportLang, setReportLang] = useState<MarketLanguage>(initialLang || audit.market || 'de');
  const [copiedMd, setCopiedMd] = useState(false);

  if (!isOpen) return null;

  const handleDownloadHtml = () => {
    const html = generateExecutiveReportHtml(audit, reportLang);
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${audit.id}_EXECUTIVE_REPORT_${reportLang.toUpperCase()}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadMarkdown = () => {
    const md = generateDossierMarkdown(audit, reportLang);
    const blob = new Blob([md], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${audit.id}_MASTER_DOSSIER_${reportLang.toUpperCase()}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCopyMarkdown = () => {
    const md = generateDossierMarkdown(audit, reportLang);
    navigator.clipboard.writeText(md);
    setCopiedMd(true);
    setTimeout(() => setCopiedMd(false), 2000);
  };

  const htmlContent = generateExecutiveReportHtml(audit, reportLang);

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 md:p-6 animate-fadeIn">
      <div className="bg-[#111827] border border-[#1f2937] rounded-2xl max-w-5xl w-full h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Top Actions Bar */}
        <div className="px-5 py-3.5 bg-slate-900 border-b border-slate-800 flex items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-cyan-400 to-emerald-400 flex items-center justify-center text-black font-black text-sm">
              Ω
            </div>
            <div>
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                {reportLang === 'en' ? 'Executive HTML Report & Proposal' : 'Executive HTML Report & Proposal'}
              </h3>
              <p className="text-[10px] text-slate-400 font-mono">Dossier ID: {audit.id}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Market Toggle Button Group */}
            <div className="flex items-center bg-slate-950 border border-slate-800 rounded-xl p-1 gap-1">
              <button
                type="button"
                onClick={() => setReportLang('de')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
                  reportLang === 'de'
                    ? 'bg-cyan-950 text-cyan-300 border border-cyan-800'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Deutsche Fassung"
              >
                <span>🇩🇪</span>
                <span className="hidden sm:inline">DE</span>
              </button>
              <button
                type="button"
                onClick={() => setReportLang('en')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
                  reportLang === 'en'
                    ? 'bg-cyan-950 text-cyan-300 border border-cyan-800'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="US / English Version"
              >
                <span>🇺🇸</span>
                <span className="hidden sm:inline">EN</span>
              </button>
            </div>

            <button
              onClick={handleCopyMarkdown}
              className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold transition flex items-center gap-1 cursor-pointer border border-slate-700"
              title="Markdown kopieren"
            >
              {copiedMd ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">Markdown</span>
            </button>

            <button
              onClick={handleDownloadMarkdown}
              className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold transition flex items-center gap-1 cursor-pointer border border-slate-700"
              title="Markdown Dossier (.md) herunterladen"
            >
              <Download className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden sm:inline">.MD</span>
            </button>

            <button
              onClick={handleDownloadHtml}
              className="px-3 py-1.5 bg-cyan-950 hover:bg-cyan-900 text-cyan-300 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer border border-cyan-800"
              title="HTML Dossier herunterladen"
            >
              <Download className="w-3.5 h-3.5 text-cyan-400" />
              <span>HTML Export</span>
            </button>

            <button
              onClick={() => window.print()}
              className="px-3 py-1.5 bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-black rounded-lg text-xs font-extrabold transition flex items-center gap-1.5 cursor-pointer shadow"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>{reportLang === 'en' ? 'Print / PDF' : 'Drucken / PDF'}</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 ml-1 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Report Preview iframe container */}
        <div className="flex-1 bg-white p-0 overflow-hidden">
          <iframe
            title="Executive Report Preview"
            srcDoc={htmlContent}
            className="w-full h-full border-none"
          />
        </div>
      </div>
    </div>
  );
};
