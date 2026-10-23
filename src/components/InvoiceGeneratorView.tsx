import React, { useState } from 'react';
import { Receipt, Printer, Plus, Check, Download, Copy } from 'lucide-react';
import { Invoice } from '../types';

interface InvoiceGeneratorViewProps {
  invoices: Invoice[];
  onAddInvoice: (inv: Invoice) => void;
}

const PACKAGES: Record<string, { name: string; price: number; desc: string }> = {
  'pre-launch': {
    name: 'Pre-Launch Autopsy',
    price: 950,
    desc: '4-Persona Stresstest + Slop-Sanitization + Executive Dossier + Cold-Pitch',
  },
  'full-funnel': {
    name: 'Full-Funnel Overhaul',
    price: 2400,
    desc: 'Komplette Pipeline + 3 Loops + Proposal + 30 Tage Priority Support',
  },
  'retainer': {
    name: 'Monatlicher Retainer',
    price: 490,
    desc: 'Monatlicher Re-Audit + Optimierung + Priority Support',
  },
  'audit-only': {
    name: 'Conversion Audit Only',
    price: 490,
    desc: '4-Persona Stresstest + Scorecard + Killer-Analyse',
  },
  'slop-only': {
    name: 'Slop-Sanitization Only',
    price: 350,
    desc: 'Forensik + Satz-Burstiness Härtung + B2B Cold Pitch',
  },
};

export const InvoiceGeneratorView: React.FC<InvoiceGeneratorViewProps> = ({
  invoices,
  onAddInvoice,
}) => {
  const [clientName, setClientName] = useState('Firma GmbH');
  const [clientEmail, setClientEmail] = useState('buchhaltung@firma.de');
  const [projectName, setProjectName] = useState('Landingpage Conversion-Audit');
  const [selectedPkgKey, setSelectedPkgKey] = useState<string>('pre-launch');
  const [notes, setNotes] = useState('Zahlbar innerhalb von 14 Tagen ohne Abzug auf angegebenes Geschäftskonto.');
  const [activeInvoice, setActiveInvoice] = useState<Invoice | null>(invoices[0] || null);

  const selectedPkg = PACKAGES[selectedPkgKey] || PACKAGES['pre-launch'];
  const net = selectedPkg.price;
  const vat = Math.round(net * 0.19 * 100) / 100;
  const gross = Math.round((net + vat) * 100) / 100;

  const handleCreateInvoice = (e: React.FormEvent) => {
    e.preventDefault();
    const today = new Date();
    const dueDate = new Date();
    dueDate.setDate(today.getDate() + 14);

    const dateStr = today.toLocaleDateString('de-DE');
    const dueDateStr = dueDate.toLocaleDateString('de-DE');
    const invNumber = `OMG-${today.getFullYear()}${(today.getMonth() + 1).toString().padStart(2, '0')}${today.getDate().toString().padStart(2, '0')}-${Math.floor(1000 + Math.random() * 9000)}`;

    const newInv: Invoice = {
      id: `inv-${Date.now()}`,
      invoiceNumber: invNumber,
      date: dateStr,
      dueDate: dueDateStr,
      clientName,
      clientEmail,
      projectName,
      packageKey: selectedPkgKey,
      packageName: selectedPkg.name,
      packageDesc: selectedPkg.desc,
      net,
      vatRate: 0.19,
      vatAmount: vat,
      gross,
      notes,
      status: 'Entwurf',
    };

    onAddInvoice(newInv);
    setActiveInvoice(newInv);
  };

  const printInvoice = () => {
    window.print();
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 py-2">
      {/* Title */}
      <div>
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Receipt className="w-5 h-5 text-amber-400" />
          <span>OMEGA Rechnungs-Generator</span>
        </h2>
        <p className="text-xs text-slate-400">
          Erstellen Sie professionelle Rechnungen für Ihre Audit-Services mit automatischer MwSt.-Berechnung (19% Deutschland).
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Form Container */}
        <div className="lg:col-span-5 bg-[#111827] border border-[#1f2937] rounded-2xl p-6 shadow-xl space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 mb-2 flex items-center gap-2">
            <span>Neue Rechnung erstellen</span>
          </h3>

          <form onSubmit={handleCreateInvoice} className="space-y-3.5">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Service-Paket</label>
              <select
                value={selectedPkgKey}
                onChange={(e) => setSelectedPkgKey(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
              >
                {Object.entries(PACKAGES).map(([key, pkg]) => (
                  <option key={key} value={key}>
                    {pkg.name} — {pkg.price} € netto
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Kunden- / Firmenname</label>
              <input
                type="text"
                required
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Kunden-E-Mail</label>
              <input
                type="email"
                required
                value={clientEmail}
                onChange={(e) => setClientEmail(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Projektbezeichnung</label>
              <input
                type="text"
                required
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Zahlungsbedingungen / Notiz</label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 font-mono"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-bold rounded-xl shadow-lg shadow-amber-500/20 transition flex items-center justify-center gap-2 cursor-pointer text-xs"
            >
              <Plus className="w-4 h-4" />
              <span>RECHNUNG JETZT GENERIEREN</span>
            </button>
          </form>

          {/* Existing Invoices List */}
          <div className="pt-4 border-t border-slate-800">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Bisherige Rechnungen ({invoices.length})</h4>
            <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
              {invoices.map((inv) => (
                <div
                  key={inv.id}
                  onClick={() => setActiveInvoice(inv)}
                  className={`p-2.5 rounded-lg border text-xs cursor-pointer transition flex items-center justify-between ${
                    activeInvoice?.id === inv.id
                      ? 'bg-amber-950/40 border-amber-700 text-white'
                      : 'bg-slate-900/50 border-slate-800 text-slate-400 hover:bg-slate-800'
                  }`}
                >
                  <div>
                    <div className="font-semibold text-white">{inv.clientName}</div>
                    <div className="text-[10px] text-slate-500 font-mono">{inv.invoiceNumber}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-amber-400 font-mono">{inv.gross.toFixed(2)} €</div>
                    <div className="text-[10px] text-slate-500">{inv.date}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Invoice Preview (Cols 6-12) */}
        <div className="lg:col-span-7">
          {activeInvoice ? (
            <div className="bg-white text-slate-900 rounded-2xl p-6 md:p-8 shadow-2xl space-y-6 select-text print:p-0">
              {/* Header */}
              <div className="flex items-start justify-between border-b-2 border-cyan-500 pb-5">
                <div>
                  <div className="text-2xl font-black text-cyan-600 tracking-wider">Ω OMEGA</div>
                  <div className="text-xs text-slate-500 font-medium">Master Orchestrator Services</div>
                  <div className="text-[11px] text-slate-400 mt-1">Hamburg, Deutschland • erikgieske@gmail.com</div>
                </div>
                <div className="text-right text-xs">
                  <div className="font-bold text-slate-800 text-sm">{activeInvoice.invoiceNumber}</div>
                  <div className="text-slate-500 mt-1">Datum: {activeInvoice.date}</div>
                  <div className="text-slate-500">Fällig: {activeInvoice.dueDate}</div>
                </div>
              </div>

              {/* Recipient */}
              <div>
                <div className="text-[10px] uppercase font-bold text-cyan-600 tracking-wider">Rechnungsempfänger</div>
                <div className="text-sm font-bold text-slate-900 mt-1">{activeInvoice.clientName}</div>
                <div className="text-xs text-slate-600">{activeInvoice.clientEmail}</div>
                <div className="text-xs text-slate-500 mt-0.5">Projekt: {activeInvoice.projectName}</div>
              </div>

              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-100 text-slate-700 font-semibold uppercase text-[10px]">
                      <th className="py-2.5 px-3">Pos.</th>
                      <th className="py-2.5 px-3">Leistung</th>
                      <th className="py-2.5 px-3">Beschreibung</th>
                      <th className="py-2.5 px-3 text-right">Netto</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    <tr>
                      <td className="py-3 px-3 font-mono">1</td>
                      <td className="py-3 px-3 font-bold text-slate-900">{activeInvoice.packageName}</td>
                      <td className="py-3 px-3 text-slate-600 text-[11px] max-w-xs">{activeInvoice.packageDesc}</td>
                      <td className="py-3 px-3 text-right font-mono font-semibold">{activeInvoice.net.toFixed(2)} €</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Totals */}
              <div className="border-t border-slate-200 pt-4 flex flex-col items-end space-y-1 text-xs">
                <div className="text-slate-600">Netto: <span className="font-mono text-slate-800">{activeInvoice.net.toFixed(2)} €</span></div>
                <div className="text-slate-600">MwSt. (19%): <span className="font-mono text-slate-800">{activeInvoice.vatAmount.toFixed(2)} €</span></div>
                <div className="text-base font-black text-cyan-700 pt-1 border-t border-slate-300">
                  Gesamtbetrag: <span className="font-mono">{activeInvoice.gross.toFixed(2)} €</span>
                </div>
              </div>

              {/* Notes */}
              {activeInvoice.notes && (
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs text-slate-600">
                  <strong className="text-slate-800">Hinweis:</strong> {activeInvoice.notes}
                </div>
              )}

              {/* Actions & Status */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 no-print">
                <div className="flex items-center gap-2 text-xs">
                  <span className="font-semibold text-slate-600">Status:</span>
                  <select
                    value={activeInvoice.status}
                    onChange={(e) => {
                      const updated = { ...activeInvoice, status: e.target.value as Invoice['status'] };
                      setActiveInvoice(updated);
                      onAddInvoice(updated);
                    }}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition cursor-pointer ${
                      activeInvoice.status === 'Bezahlt'
                        ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                        : activeInvoice.status === 'Versendet'
                        ? 'bg-blue-100 text-blue-800 border-blue-300'
                        : 'bg-amber-100 text-amber-800 border-amber-300'
                    }`}
                  >
                    <option value="Entwurf">Entwurf</option>
                    <option value="Versendet">Versendet</option>
                    <option value="Bezahlt">Bezahlt</option>
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(activeInvoice, null, 2));
                      const a = document.createElement('a');
                      a.href = dataStr;
                      a.download = `${activeInvoice.invoiceNumber}.json`;
                      a.click();
                    }}
                    className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer border border-slate-300"
                    title="Rechnung als JSON exportieren"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>JSON</span>
                  </button>

                  <button
                    onClick={printInvoice}
                    className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow"
                  >
                    <Printer className="w-4 h-4 text-cyan-400" />
                    <span>Drucken / Als PDF speichern</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-16 text-slate-500 bg-[#111827] border border-[#1f2937] rounded-2xl">
              Wählen Sie eine Rechnung links aus oder erstellen Sie eine neue.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
