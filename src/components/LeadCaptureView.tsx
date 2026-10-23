import React, { useState } from 'react';
import { 
  Users, 
  Send, 
  Check, 
  Sparkles, 
  ShieldCheck, 
  Euro, 
  Play, 
  Copy,
  Clock,
  ArrowRight,
  Download,
  Search,
  Filter,
  Mail,
  Globe
} from 'lucide-react';
import { Lead, AuditRun } from '../types';
import { ClientEmailModal } from './ClientEmailModal';
import { LandingPagePreviewModal } from './LandingPagePreviewModal';

interface LeadCaptureViewProps {
  leads: Lead[];
  dossiers?: AuditRun[];
  onAddLead: (lead: Omit<Lead, 'id' | 'createdAt' | 'status'>) => void;
  onRunAuditForLead: (lead: Lead) => void;
}

export const LeadCaptureView: React.FC<LeadCaptureViewProps> = ({
  leads,
  dossiers = [],
  onAddLead,
  onRunAuditForLead,
}) => {
  const [emailAuditLead, setEmailAuditLead] = useState<{ lead: Lead; audit: AuditRun } | null>(null);
  const [previewAuditForHtml, setPreviewAuditForHtml] = useState<AuditRun | null>(null);
  const [url, setUrl] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [niche, setNiche] = useState('');
  const [objections, setObjections] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState(false);
  const [copiedLeadId, setCopiedLeadId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('Alle');

  const exportLeadsCsv = () => {
    const headers = ['ID', 'Name', 'Email', 'URL', 'Nische', 'Einwaende', 'Status', 'ErstelltAm'];
    const rows = leads.map(l => [
      l.id,
      `"${l.name.replace(/"/g, '""')}"`,
      `"${l.email.replace(/"/g, '""')}"`,
      `"${l.url.replace(/"/g, '""')}"`,
      `"${l.niche.replace(/"/g, '""')}"`,
      `"${l.objections.replace(/"/g, '""')}"`,
      l.status,
      l.createdAt
    ]);
    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const blobUrl = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = blobUrl;
    a.download = `OMEGA_LEADS_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(blobUrl);
  };

  const filteredLeads = leads.filter(l => {
    const matchesSearch = 
      l.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.url.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.niche.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'Alle' || l.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    setTimeout(() => {
      onAddLead({
        url,
        name,
        email,
        niche: niche || 'Allgemein',
        objections: objections || 'Hohe Skepsis, unklarer ROI',
      });
      setIsSubmitting(false);
      setSuccessMessage(true);
      setUrl('');
      setName('');
      setEmail('');
      setNiche('');
      setObjections('');

      setTimeout(() => setSuccessMessage(false), 5000);
    }, 800);
  };

  const copyLeadEmail = (lead: Lead) => {
    const text = `Lead: ${lead.name} (${lead.email})\nURL: ${lead.url}\nNische: ${lead.niche}\nEinwände: ${lead.objections}`;
    navigator.clipboard.writeText(text);
    setCopiedLeadId(lead.id);
    setTimeout(() => setCopiedLeadId(null), 2000);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-10 py-2">
      {/* Hero Section */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-400 via-cyan-500 to-emerald-500 flex items-center justify-center text-black font-black text-3xl mx-auto shadow-lg shadow-cyan-500/30">
          Ω
        </div>
        <h2 className="text-2xl md:text-3xl font-black text-white">
          Kostenloser Conversion & Slop-Audit
        </h2>
        <p className="text-slate-400 text-xs md:text-sm leading-relaxed">
          Lassen Sie Ihre Landingpage durch 4 feindliche Käufer-Personas und einen deterministischen Slop-Detektor prüfen.
          Ergebnis: Vollständige Scorecard, Killer-Analyse und gehärtete Master-Copy.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Form Container (Cols 1-7) */}
        <div className="lg:col-span-7 bg-[#111827] border border-[#1f2937] rounded-2xl p-6 md:p-8 shadow-xl glow-cyan">
          <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-400 mb-4 flex items-center gap-2">
            <Users className="w-4 h-4" />
            <span>Audit-Anfrage einreichen</span>
          </h3>

          {successMessage && (
            <div className="mb-6 p-4 rounded-xl bg-emerald-950/80 border border-emerald-800 text-emerald-300 text-xs flex items-center gap-2.5 animate-fadeIn">
              <Check className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>
                <strong>Vielen Dank!</strong> Ihre Anfrage wurde erfasst. Sie können den Audit nun direkt aus der Lead-Warteschlange starten.
              </span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Ihre Landingpage-URL <span className="text-cyan-400">*</span>
              </label>
              <input
                type="url"
                required
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://ihre-website.de"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition font-mono text-xs"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Ihr Name <span className="text-cyan-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Max Mustermann"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Ihre E-Mail <span className="text-cyan-400">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="max@firma.de"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Ihre Branche / Nische
              </label>
              <input
                type="text"
                value={niche}
                onChange={(e) => setNiche(e.target.value)}
                placeholder="z. B. B2B SaaS, E-Commerce, Consulting..."
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Bekannte Einwände / Zweifel der Interessenten
              </label>
              <input
                type="text"
                value={objections}
                onChange={(e) => setObjections(e.target.value)}
                placeholder="Zu teuer, zu komplex, unklarer ROI..."
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-black font-extrabold rounded-xl shadow-lg shadow-cyan-500/20 transition flex items-center justify-center gap-2 cursor-pointer mt-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                  <span>WIRD ERFASST...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>KOSTENLOSEN AUDIT ANFORDERN</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Trust Signals & Features (Cols 8-12) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="bg-[#111827] border border-[#1f2937] rounded-xl p-4">
              <div className="text-2xl font-black text-cyan-400 font-mono">4</div>
              <div className="text-[10px] text-slate-400 uppercase tracking-wider mt-1">Feindliche Personas</div>
            </div>
            <div className="bg-[#111827] border border-[#1f2937] rounded-xl p-4">
              <div className="text-2xl font-black text-emerald-400 font-mono">≥92</div>
              <div className="text-[10px] text-slate-400 uppercase tracking-wider mt-1">Red-Critic Score</div>
            </div>
            <div className="bg-[#111827] border border-[#1f2937] rounded-xl p-4">
              <div className="text-2xl font-black text-white font-mono">0 €</div>
              <div className="text-[10px] text-slate-400 uppercase tracking-wider mt-1">Erst-Audit</div>
            </div>
          </div>

          <div className="bg-[#111827] border border-[#1f2937] rounded-2xl p-5 space-y-3.5">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Was Sie erhalten:</span>
            </h4>
            <ul className="space-y-2.5 text-xs text-slate-300">
              <li className="flex items-start gap-2">
                <span className="text-cyan-400 font-bold">•</span>
                <span><strong>4-Persona Stresstest:</strong> Verriss aus den Augen von Skeptiker, CFO, Scroller & Pedant.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-cyan-400 font-bold">•</span>
                <span><strong>Slop-Forensik:</strong> Enttarnung von KI-Phrasen und Messung der Satz-Burstiness.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-cyan-400 font-bold">•</span>
                <span><strong>Gehärtete Master-Copy:</strong> Ein sofort nutzbarer Hero-Hook mit ≥ 92 Punkten.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-cyan-400 font-bold">•</span>
                <span><strong>Keine Verpflichtung:</strong> 100% kostenfrei im Rahmen des Permissionless Value Prinzips.</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Leads Pipeline / CRM Section */}
      <div className="bg-[#111827] border border-[#1f2937] rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Users className="w-4 h-4 text-cyan-400" />
              <span>Erfasste Leads & CRM Warteschlange ({leads.length})</span>
            </h3>
            <p className="text-xs text-slate-400">Verwalten Sie eingehende Landingpage-Anfragen und starten Sie Audits mit 1 Klick</p>
          </div>

          <button
            onClick={exportLeadsCsv}
            disabled={leads.length === 0}
            className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5 text-cyan-400" />
            <span>Leads als CSV exportieren</span>
          </button>
        </div>

        {/* Search & Filters */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
          <div className="relative w-full sm:w-72">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Lead, URL, Nische oder E-Mail suchen..."
              className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
          </div>

          <div className="flex items-center gap-1 overflow-x-auto w-full sm:w-auto">
            {['Alle', 'Neu', 'Auditiert', 'Gepitcht'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-2.5 py-1 rounded text-xs transition cursor-pointer font-medium ${
                  statusFilter === st
                    ? 'bg-cyan-950 text-cyan-300 border border-cyan-800'
                    : 'text-slate-400 hover:text-white bg-slate-900/60'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        {filteredLeads.length === 0 ? (
          <div className="text-center py-8 text-xs text-slate-500 bg-slate-900/30 rounded-xl">
            Keine Leads gefunden für die ausgewählten Filter.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300 border-collapse">
              <thead>
                <tr className="border-b border-[#1f2937] text-slate-500 font-mono text-[11px] uppercase">
                  <th className="py-2.5 px-3">Kontakt</th>
                  <th className="py-2.5 px-3">Ziel-URL</th>
                  <th className="py-2.5 px-3">Nische</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3 text-right">Aktion</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1f2937]">
                {filteredLeads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-slate-900/50 transition">
                    <td className="py-3 px-3">
                      <div className="font-semibold text-white">{lead.name}</div>
                      <div className="text-[11px] text-slate-400">{lead.email}</div>
                    </td>
                    <td className="py-3 px-3 font-mono text-[11px] text-cyan-300 max-w-xs truncate">
                      {lead.url}
                    </td>
                    <td className="py-3 px-3 text-slate-400">
                      {lead.niche}
                    </td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-950 text-cyan-300 border border-cyan-800">
                        {lead.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      {(() => {
                        const matchingAudit = dossiers.find(
                          (d) => d.id === lead.auditId || d.targetSource.includes(lead.url) || lead.url.includes(d.targetSource)
                        ) || (dossiers.length > 0 ? dossiers[0] : null);

                        return (
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => copyLeadEmail(lead)}
                              title="Daten kopieren"
                              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
                            >
                              {copiedLeadId === lead.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                            </button>

                            {matchingAudit && (
                              <>
                                <button
                                  onClick={() => setPreviewAuditForHtml(matchingAudit)}
                                  title="Schlüsselfertige HTML-Landingpage ansehen"
                                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-emerald-950 text-emerald-400 border border-slate-700 hover:border-emerald-800 transition cursor-pointer"
                                >
                                  <Globe className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => setEmailAuditLead({ lead, audit: matchingAudit })}
                                  title="Kunden-E-Mail & Anhänge vorbereiten"
                                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-cyan-950 text-cyan-400 border border-slate-700 hover:border-cyan-800 transition cursor-pointer"
                                >
                                  <Mail className="w-3.5 h-3.5" />
                                </button>
                              </>
                            )}

                            <button
                              onClick={() => onRunAuditForLead(lead)}
                              className="px-2.5 py-1.5 rounded-lg bg-cyan-950 hover:bg-cyan-900 text-cyan-300 border border-cyan-700 transition flex items-center gap-1 font-semibold cursor-pointer"
                            >
                              <Play className="w-3 h-3 text-cyan-400" />
                              <span>Audit starten</span>
                            </button>
                          </div>
                        );
                      })()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {emailAuditLead && (
        <ClientEmailModal
          audit={emailAuditLead.audit}
          isOpen={true}
          onClose={() => setEmailAuditLead(null)}
          initialClientEmail={emailAuditLead.lead.email}
          initialClientName={emailAuditLead.lead.name}
          initialCompanyName={emailAuditLead.lead.niche}
        />
      )}

      {previewAuditForHtml && (
        <LandingPagePreviewModal
          audit={previewAuditForHtml}
          isOpen={true}
          onClose={() => setPreviewAuditForHtml(null)}
        />
      )}
    </div>
  );
};

