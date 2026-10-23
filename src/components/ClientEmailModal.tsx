import React, { useState } from 'react';
import { 
  Mail, 
  Send, 
  Copy, 
  Check, 
  Download, 
  FileText, 
  X, 
  Sparkles, 
  Paperclip, 
  ExternalLink, 
  Layers, 
  Briefcase, 
  ShieldCheck, 
  Printer,
  ChevronRight,
  Info,
  CheckCircle2,
  Eye,
  Globe
} from 'lucide-react';
import { AuditRun, EmailTone, EmailSalutation, ClientEmailOptions, MarketLanguage } from '../types';
import { 
  getClientEmailTemplates, 
  downloadAttachment, 
  downloadAllAttachments 
} from '../utils/slopSanitizer';
import { LandingPagePreviewModal } from './LandingPagePreviewModal';

interface ClientEmailModalProps {
  audit: AuditRun;
  isOpen: boolean;
  onClose: () => void;
  initialClientEmail?: string;
  initialClientName?: string;
  initialCompanyName?: string;
  initialLang?: MarketLanguage;
}

export const ClientEmailModal: React.FC<ClientEmailModalProps> = ({
  audit,
  isOpen,
  onClose,
  initialClientEmail = '',
  initialClientName = '',
  initialCompanyName = '',
  initialLang,
}) => {
  const cleanDomain = audit.targetSource.replace(/^https?:\/\//, '').replace(/\/.*$/, '');

  const [lang, setLang] = useState<MarketLanguage>(initialLang || audit.market || 'de');
  const [tone, setTone] = useState<EmailTone>('c_level');
  const [salutation, setSalutation] = useState<EmailSalutation>('sie');
  const [clientName, setClientName] = useState(
    initialClientName || (lang === 'en' ? 'Mark Spencer' : 'Dr. Thomas Weber')
  );
  const [clientCompany, setClientCompany] = useState(initialCompanyName || cleanDomain);
  const [clientEmail, setClientEmail] = useState(initialClientEmail || `contact@${cleanDomain}`);
  const [senderName, setSenderName] = useState(lang === 'en' ? 'Erik Gieske' : 'Alexander Vance');
  const [senderTitle, setSenderTitle] = useState(
    lang === 'en' ? 'Principal Conversion Architect' : 'Conversion & Direct-Response Architekt'
  );
  const [subjectIndex, setSubjectIndex] = useState(0);
  const [customSubject, setCustomSubject] = useState('');
  const [customNotes, setCustomNotes] = useState('');
  
  const [activePreviewTab, setActivePreviewTab] = useState<'text' | 'html'>('text');
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [isPreviewHtmlModalOpen, setIsPreviewHtmlModalOpen] = useState(false);

  if (!isOpen) return null;

  const emailOptions: ClientEmailOptions = {
    clientName,
    clientCompany,
    clientEmail,
    senderName,
    senderTitle,
    tone,
    salutation,
    subjectIndex,
    customSubject: customSubject.trim() ? customSubject : undefined,
    customNotes: customNotes.trim() ? customNotes : undefined,
    lang,
  };

  const emailData = getClientEmailTemplates(audit, emailOptions);

  const handleCopy = (text: string, fieldKey: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldKey);
    setTimeout(() => setCopiedField(null), 2500);
  };

  const handleCopyHtml = () => {
    const blob = new Blob([emailData.htmlBody], { type: 'text/html' });
    const textBlob = new Blob([emailData.plainTextBody], { type: 'text/plain' });
    if (typeof ClipboardItem !== 'undefined') {
      const data = [new ClipboardItem({ 'text/html': blob, 'text/plain': textBlob })];
      navigator.clipboard.write(data).then(() => {
        setCopiedField('html');
        setTimeout(() => setCopiedField(null), 2500);
      });
    } else {
      handleCopy(emailData.htmlBody, 'html');
    }
  };

  const handleOpenMailto = () => {
    const encodedSubject = encodeURIComponent(emailData.selectedSubject);
    const encodedBody = encodeURIComponent(emailData.plainTextBody);
    const mailtoUrl = `mailto:${clientEmail}?subject=${encodedSubject}&body=${encodedBody}`;
    window.location.href = mailtoUrl;
  };

  const handleDownloadAll = () => {
    downloadAllAttachments(audit, lang);
    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 3000);
  };

  const handleToggleMarket = (newLang: MarketLanguage) => {
    setLang(newLang);
    if (newLang === 'en') {
      if (clientName === 'Dr. Thomas Weber') setClientName('Mark Spencer');
      if (senderName === 'Alexander Vance') setSenderName('Erik Gieske');
      if (senderTitle === 'Conversion & Direct-Response Architekt') {
        setSenderTitle('Principal Conversion Architect');
      }
    } else {
      if (clientName === 'Mark Spencer') setClientName('Dr. Thomas Weber');
      if (senderName === 'Erik Gieske') setSenderName('Alexander Vance');
      if (senderTitle === 'Principal Conversion Architect') {
        setSenderTitle('Conversion & Direct-Response Architekt');
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 md:p-6 animate-fadeIn">
      <div className="bg-[#111827] border border-[#1f2937] rounded-2xl max-w-6xl w-full h-[94vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Top Header Bar */}
        <div className="px-5 py-3.5 bg-slate-900 border-b border-slate-800 flex items-center justify-between gap-3">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-cyan-400 via-cyan-500 to-emerald-400 flex items-center justify-center text-black font-black text-base shadow-sm">
              <Mail className="w-4 h-4 text-black" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white tracking-wide">
                  {lang === 'en' ? 'Client Email & Attachments Dispatch' : 'Kunden-E-Mail & Anhänge-Dispatch'}
                </h3>
                <span className="text-[10px] bg-cyan-950 text-cyan-300 border border-cyan-800 font-mono px-2 py-0.5 rounded-full font-bold">
                  Dossier #{audit.id}
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                {lang === 'en'
                  ? 'Turnkey client email with 4 generated attachments (Report, Copy Swipe, 72h Sprint & HTML Landing Page)'
                  : 'Schlüsselfertige Kunden-E-Mail mit 4 generierten Anhängen (Report, Copy-Swipe, 72h-Sprint & HTML-Landingpage)'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Market Toggle Button Group */}
            <div className="flex items-center bg-slate-950 border border-slate-800 rounded-xl p-1 gap-1">
              <button
                type="button"
                onClick={() => handleToggleMarket('de')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
                  lang === 'de'
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
                onClick={() => handleToggleMarket('en')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
                  lang === 'en'
                    ? 'bg-cyan-950 text-cyan-300 border border-cyan-800'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="US / Global English Version"
              >
                <span>🇺🇸</span>
                <span className="hidden sm:inline">EN</span>
              </button>
            </div>

            <button
              onClick={handleDownloadAll}
              className="px-3.5 py-1.5 bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-black text-xs font-black rounded-lg transition flex items-center gap-1.5 cursor-pointer shadow-md shadow-cyan-500/20"
              title="Alle 4 Anhänge als Paket herunterladen"
            >
              {downloadSuccess ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>{lang === 'en' ? '4 Files Downloaded!' : '4 Anhänge geladen!'}</span>
                </>
              ) : (
                <>
                  <Download className="w-3.5 h-3.5" />
                  <span>{lang === 'en' ? 'Download All 4' : 'Alle 4 Anhänge laden'}</span>
                </>
              )}
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 cursor-pointer transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Main Content: Split Configuration & Live Preview */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden divide-y lg:divide-y-0 lg:divide-x divide-slate-800">
          
          {/* Left Column (5 Cols): Email Configuration Form */}
          <div className="lg:col-span-5 p-4 sm:p-5 overflow-y-auto space-y-5 bg-slate-900/40">
            
            {/* Tone Selector */}
            <div className="space-y-2">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Sparkles className="w-3 h-3 text-cyan-400" />
                <span>Tonalität & Verkaufs-Psychologie</span>
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                <button
                  type="button"
                  onClick={() => setTone('c_level')}
                  className={`px-2.5 py-2 rounded-xl text-left border text-xs font-medium transition cursor-pointer ${
                    tone === 'c_level'
                      ? 'bg-cyan-950/80 text-cyan-300 border-cyan-700 shadow-sm shadow-cyan-500/20'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <div className="font-bold text-[11px] text-white">Executive C-Level</div>
                  <div className="text-[10px] text-slate-400 truncate mt-0.5">ROI & Umsatzlecks</div>
                </button>

                <button
                  type="button"
                  onClick={() => setTone('direct')}
                  className={`px-2.5 py-2 rounded-xl text-left border text-xs font-medium transition cursor-pointer ${
                    tone === 'direct'
                      ? 'bg-cyan-950/80 text-cyan-300 border-cyan-700 shadow-sm shadow-cyan-500/20'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <div className="font-bold text-[11px] text-white">Klartext / OMEGA</div>
                  <div className="text-[10px] text-slate-400 truncate mt-0.5">Schonungslos & direkt</div>
                </button>

                <button
                  type="button"
                  onClick={() => setTone('consultative')}
                  className={`px-2.5 py-2 rounded-xl text-left border text-xs font-medium transition cursor-pointer ${
                    tone === 'consultative'
                      ? 'bg-cyan-950/80 text-cyan-300 border-cyan-700 shadow-sm shadow-cyan-500/20'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <div className="font-bold text-[11px] text-white">Beratender Partner</div>
                  <div className="text-[10px] text-slate-400 truncate mt-0.5">Value-First Geschenk</div>
                </button>
              </div>
            </div>

            {/* Recipient Details & Salutation */}
            <div className="space-y-3 bg-slate-900/80 p-3.5 rounded-xl border border-slate-800">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Empfänger & Anrede
                </span>
                <div className="flex items-center bg-slate-800 rounded-lg p-0.5 border border-slate-700">
                  <button
                    type="button"
                    onClick={() => setSalutation('sie')}
                    className={`px-2 py-0.5 rounded text-[10px] font-semibold transition cursor-pointer ${
                      salutation === 'sie' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Sie (Förmlich)
                  </button>
                  <button
                    type="button"
                    onClick={() => setSalutation('du')}
                    className={`px-2 py-0.5 rounded text-[10px] font-semibold transition cursor-pointer ${
                      salutation === 'du' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Du (Modern)
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="text-[10px] text-slate-400 font-medium">Ansprechpartner Name</label>
                  <input
                    type="text"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    placeholder="z.B. Dr. Thomas Weber"
                    className="w-full mt-1 px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-sans"
                  />
                </div>

                <div>
                  <label className="text-[10px] text-slate-400 font-medium">Unternehmen / Brand</label>
                  <input
                    type="text"
                    value={clientCompany}
                    onChange={(e) => setClientCompany(e.target.value)}
                    placeholder="z.B. FinScale GmbH"
                    className="w-full mt-1 px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-sans"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] text-slate-400 font-medium">Empfänger E-Mail</label>
                <input
                  type="email"
                  value={clientEmail}
                  onChange={(e) => setClientEmail(e.target.value)}
                  placeholder="kontakt@kunde.de"
                  className="w-full mt-1 px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs text-cyan-300 font-mono placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            {/* Subject Line Selection */}
            <div className="space-y-2">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
                <span>Betreffzeile (Hohe Öffnungsrate)</span>
                <span className="text-[10px] text-slate-500">4 Varianten</span>
              </label>
              
              <div className="space-y-1.5">
                {emailData.subjects.map((subj, idx) => (
                  <div
                    key={idx}
                    onClick={() => {
                      setSubjectIndex(idx);
                      setCustomSubject('');
                    }}
                    className={`p-2.5 rounded-xl border text-xs cursor-pointer transition flex items-center gap-2.5 ${
                      subjectIndex === idx && !customSubject
                        ? 'bg-cyan-950/60 border-cyan-600 text-white font-medium shadow-sm'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                    }`}
                  >
                    <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center shrink-0 ${
                      subjectIndex === idx && !customSubject ? 'border-cyan-400 bg-cyan-400' : 'border-slate-600'
                    }`}>
                      {subjectIndex === idx && !customSubject && <div className="w-1.5 h-1.5 rounded-full bg-black" />}
                    </div>
                    <span className="truncate">{subj}</span>
                  </div>
                ))}
              </div>

              {/* Custom Subject field */}
              <div className="mt-2">
                <input
                  type="text"
                  value={customSubject}
                  onChange={(e) => setCustomSubject(e.target.value)}
                  placeholder="Oder eigenen Betreff eingeben..."
                  className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-sans"
                />
              </div>
            </div>

            {/* Sender Signature & Custom Notes */}
            <div className="space-y-3 bg-slate-900/80 p-3.5 rounded-xl border border-slate-800">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Absender & Individuelle Notiz
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="text-[10px] text-slate-400 font-medium">Ihr Name</label>
                  <input
                    type="text"
                    value={senderName}
                    onChange={(e) => setSenderName(e.target.value)}
                    placeholder="Ihr Name"
                    className="w-full mt-1 px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-sans"
                  />
                </div>

                <div>
                  <label className="text-[10px] text-slate-400 font-medium">Ihre Position / Firma</label>
                  <input
                    type="text"
                    value={senderTitle}
                    onChange={(e) => setSenderTitle(e.target.value)}
                    placeholder="Position / Spezialisierung"
                    className="w-full mt-1 px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-sans"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] text-slate-400 font-medium">Zusätzlicher Hinweis / P.S. (optional)</label>
                <textarea
                  rows={2}
                  value={customNotes}
                  onChange={(e) => setCustomNotes(e.target.value)}
                  placeholder="z.B. P.S. Wir haben die Mobile-Performance auf iOS und Android separat gegengetestet."
                  className="w-full mt-1 px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 resize-none font-sans"
                />
              </div>
            </div>

          </div>

          {/* Right Column (7 Cols): Live Preview & Attachments Bar */}
          <div className="lg:col-span-7 flex flex-col bg-slate-950/70 overflow-hidden">
            
            {/* Attachment Cards Header */}
            <div className="p-3.5 bg-slate-900 border-b border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Paperclip className="w-4 h-4 text-cyan-400" />
                  <span className="text-xs font-bold text-white uppercase tracking-wider">
                    4 Fertige Kunden-Anhänge (Sofort-Download)
                  </span>
                </div>
                <button
                  onClick={handleDownloadAll}
                  className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Alle 4 herunterladen</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-2">
                {emailData.attachments.map((att) => (
                  <div
                    key={att.id}
                    className="bg-slate-950/80 border border-slate-800 hover:border-slate-700 rounded-xl p-2.5 flex flex-col justify-between group transition"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
                          {att.format}
                        </span>
                        <span className="text-[9px] text-slate-500 truncate ml-1">{att.badge}</span>
                      </div>
                      <div className="text-xs font-bold text-slate-200 line-clamp-1" title={att.title}>
                        {att.title}
                      </div>
                      <div className="text-[10px] text-slate-400 line-clamp-2 mt-0.5 leading-snug">
                        {att.description}
                      </div>
                    </div>

                    <div className="mt-2.5 flex items-center gap-1.5">
                      {att.id === 'landingpage_html' ? (
                        <>
                          <button
                            onClick={() => setIsPreviewHtmlModalOpen(true)}
                            className="flex-1 py-1 bg-cyan-950/80 hover:bg-cyan-900 text-cyan-300 border border-cyan-800 rounded-lg text-[10px] font-bold transition flex items-center justify-center gap-1 cursor-pointer"
                            title="Interaktive Live-Vorschau öffnen"
                          >
                            <Eye className="w-3 h-3 text-cyan-400" />
                            <span>{lang === 'en' ? 'Preview' : 'Vorschau'}</span>
                          </button>
                          <button
                            onClick={() => downloadAttachment(audit, att.id, lang)}
                            className="p-1 bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 rounded-lg transition cursor-pointer"
                            title="HTML-Datei herunterladen"
                          >
                            <Download className="w-3 h-3 text-cyan-400" />
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => downloadAttachment(audit, att.id, lang)}
                          className="w-full py-1 bg-slate-900 hover:bg-cyan-950 hover:text-cyan-300 text-slate-300 border border-slate-800 hover:border-cyan-800 rounded-lg text-[11px] font-semibold transition flex items-center justify-center gap-1 cursor-pointer"
                        >
                          <Download className="w-3 h-3 text-cyan-400" />
                          <span>{lang === 'en' ? 'Download' : 'Herunterladen'}</span>
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Email Preview Header Metadata */}
            <div className="px-5 py-3 bg-slate-900/90 border-b border-slate-800/80 flex items-center justify-between gap-3 text-xs">
              <div className="space-y-1 overflow-hidden">
                <div className="flex items-center gap-2 text-slate-400">
                  <span className="w-12 text-slate-500 font-mono text-[11px]">AN:</span>
                  <span className="font-semibold text-cyan-300 font-mono truncate">{clientEmail}</span>
                  <span className="text-slate-500">({clientName})</span>
                </div>
                <div className="flex items-center gap-2 text-slate-400">
                  <span className="w-12 text-slate-500 font-mono text-[11px]">BETREFF:</span>
                  <span className="font-bold text-white truncate">{emailData.selectedSubject}</span>
                </div>
              </div>

              {/* View Switcher: Text vs Rich HTML */}
              <div className="flex items-center bg-slate-800 rounded-lg p-0.5 border border-slate-700 shrink-0">
                <button
                  type="button"
                  onClick={() => setActivePreviewTab('text')}
                  className={`px-2.5 py-1 rounded text-[11px] font-semibold transition cursor-pointer ${
                    activePreviewTab === 'text' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Text-Ansicht
                </button>
                <button
                  type="button"
                  onClick={() => setActivePreviewTab('html')}
                  className={`px-2.5 py-1 rounded text-[11px] font-semibold transition cursor-pointer ${
                    activePreviewTab === 'html' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  HTML-Vorschau
                </button>
              </div>
            </div>

            {/* Email Body Preview Content */}
            <div className="flex-1 p-5 overflow-y-auto bg-slate-950 font-sans">
              {activePreviewTab === 'text' ? (
                <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-5 text-xs text-slate-200 font-mono whitespace-pre-wrap leading-relaxed select-all selection:bg-cyan-500 selection:text-black">
                  {emailData.plainTextBody}
                </div>
              ) : (
                <div className="bg-white rounded-xl p-6 text-slate-900 shadow-md border border-slate-300">
                  <div
                    dangerouslySetInnerHTML={{ __html: emailData.htmlBody }}
                    className="prose prose-sm max-w-none"
                  />
                </div>
              )}
            </div>

            {/* Bottom Actions Bar */}
            <div className="p-4 bg-slate-900 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleCopy(emailData.selectedSubject, 'subject')}
                  className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer"
                >
                  {copiedField === 'subject' ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">Betreff kopiert!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Betreff kopieren</span>
                    </>
                  )}
                </button>

                <button
                  onClick={() => handleCopy(emailData.plainTextBody, 'body')}
                  className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer"
                >
                  {copiedField === 'body' ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">Text kopiert!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>E-Mail-Text kopieren</span>
                    </>
                  )}
                </button>

                <button
                  onClick={handleCopyHtml}
                  className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer"
                  title="Formatiertes HTML für Webmail (Gmail/Outlook) kopieren"
                >
                  {copiedField === 'html' ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">HTML kopiert!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>HTML-Format kopieren</span>
                    </>
                  )}
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleOpenMailto}
                  className="px-4 py-2 bg-gradient-to-r from-cyan-500 via-cyan-400 to-emerald-400 hover:from-cyan-400 hover:to-emerald-300 text-black text-xs font-extrabold rounded-xl transition flex items-center gap-2 cursor-pointer shadow-lg shadow-cyan-500/25"
                >
                  <Send className="w-3.5 h-3.5 text-black" />
                  <span>In E-Mail-Programm öffnen (mailto:)</span>
                </button>
              </div>
            </div>

          </div>

        </div>

      </div>

      {/* Fullscreen HTML Landing Page Live Preview Modal */}
      <LandingPagePreviewModal
        audit={audit}
        isOpen={isPreviewHtmlModalOpen}
        onClose={() => setIsPreviewHtmlModalOpen(false)}
        initialLang={lang}
      />
    </div>
  );
};
