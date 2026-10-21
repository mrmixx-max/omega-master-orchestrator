#!/usr/bin/env python3
"""OMEGA Invoice Generator - Erstellt professionelle Rechnungen für Audit-Services."""
import os, sys, json, argparse
from datetime import datetime, timedelta

OUTPUT_DIR = os.path.expanduser("~/.hermes/skills/omega-master/invoices")

PACKAGES = {
    "pre-launch": {"name": "Pre-Launch Autopsy", "price": 950, "desc": "4-Persona Stresstest + Slop-Sanitization + Executive Dossier + Cold-Pitch"},
    "full-funnel": {"name": "Full-Funnel Overhaul", "price": 2400, "desc": "Komplette Pipeline + 3 Loops + Proposal + 30 Tage Support"},
    "retainer": {"name": "Monatlicher Retainer", "price": 490, "desc": "Monatlicher Re-Audit + Optimierung + Priority Support"},
    "audit-only": {"name": "Conversion Audit Only", "price": 490, "desc": "4-Persona Stresstest + Scorecard + Killer-Analyse"},
    "slop-only": {"name": "Slop-Sanitization Only", "price": 350, "desc": "Forensik + Härtung + B2B Pitch"},
}

def generate_invoice(client_name, client_email, package, project_name, notes=""):
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    pkg = PACKAGES.get(package, PACKAGES["pre-launch"])
    invoice_number = f"OMG-{datetime.now().strftime('%Y%m%d')}-{hash(client_name) % 10000:04d}"
    date = datetime.now().strftime("%d.%m.%Y")
    due_date = (datetime.now() + timedelta(days=14)).strftime("%d.%m.%Y")

    # VAT calculation (19% for Germany)
    net = pkg["price"]
    vat = round(net * 0.19, 2)
    gross = round(net + vat, 2)

    html = f"""<!DOCTYPE html>
<html lang="de">
<head>
    <meta charset="UTF-8">
    <title>Rechnung {invoice_number}</title>
    <style>
        * {{ box-sizing: border-box; margin: 0; padding: 0; }}
        body {{ font-family: -apple-system, sans-serif; background: #f8f9fa; color: #111; padding: 40px; }}
        .invoice {{ max-width: 800px; margin: 0 auto; background: #fff; padding: 50px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }}
        .header {{ display: flex; justify-content: space-between; margin-bottom: 40px; border-bottom: 2px solid #06b6d4; padding-bottom: 20px; }}
        .logo {{ font-size: 24px; font-weight: bold; color: #06b6d4; }}
        .meta {{ text-align: right; font-size: 13px; color: #666; }}
        .section {{ margin-bottom: 30px; }}
        .section h3 {{ font-size: 14px; color: #06b6d4; margin-bottom: 10px; text-transform: uppercase; letter-spacing: 1px; }}
        table {{ width: 100%; border-collapse: collapse; margin-top: 15px; }}
        th, td {{ padding: 12px; text-align: left; border-bottom: 1px solid #eee; }}
        th {{ background: #f0f9ff; font-size: 12px; text-transform: uppercase; color: #666; }}
        .total {{ font-size: 18px; font-weight: bold; color: #06b6d4; }}
        .footer {{ margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee; font-size: 11px; color: #999; }}
        .notes {{ background: #f0f9ff; padding: 15px; border-radius: 8px; font-size: 13px; color: #444; margin-top: 20px; }}
        @media print {{ body {{ background: #fff; padding: 0; }} .invoice {{ box-shadow: none; }} }}
    </style>
</head>
<body>
    <div class="invoice">
        <div class="header">
            <div>
                <div class="logo">Ω OMEGA</div>
                <div style="font-size: 12px; color: #666; margin-top: 5px;">Master Orchestrator Services</div>
            </div>
            <div class="meta">
                <strong>Rechnung {invoice_number}</strong><br>
                Datum: {date}<br>
                Fällig: {due_date}
            </div>
        </div>

        <div class="section">
            <h3>Rechnungsempfänger</h3>
            <div style="font-size: 14px;">
                <strong>{client_name}</strong><br>
                {client_email}<br>
                {project_name}
            </div>
        </div>

        <div class="section">
            <h3>Leistungsbeschreibung</h3>
            <table>
                <thead>
                    <tr>
                        <th>Pos.</th>
                        <th>Leistung</th>
                        <th>Beschreibung</th>
                        <th>Netto</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>1</td>
                        <td><strong>{pkg['name']}</strong></td>
                        <td style="font-size: 12px; color: #666;">{pkg['desc']}</td>
                        <td>{net:,.2f} €</td>
                    </tr>
                </tbody>
            </table>
        </div>

        <div class="section" style="text-align: right;">
            <div style="font-size: 13px; color: #666;">Netto: {net:,.2f} €</div>
            <div style="font-size: 13px; color: #666;">MwSt. (19%): {vat:,.2f} €</div>
            <div class="total">Gesamt: {gross:,.2f} €</div>
        </div>

        {"<div class='notes'><strong>Hinweise:</strong><br>" + notes + "</div>" if notes else ""}

        <div class="footer">
            <strong>Zahlungsbedingungen:</strong> Zahlbar innerhalb von 14 Tagen nach Rechnungsdatum.<br>
            <strong>Bankverbindung:</strong> [IBAN eintragen] | [BIC eintragen]<br>
            <strong>Steuernummer:</strong> [Steuernummer eintragen]<br>
            <br>
            Vielen Dank für Ihr Vertrauen in OMEGA Master Orchestrator Services.
        </div>
    </div>
</body>
</html>"""

    filename = f"Rechnung_{invoice_number}_{client_name.replace(' ', '_')}.html"
    filepath = os.path.join(OUTPUT_DIR, filename)
    with open(filepath, "w", encoding="utf-8") as f:
        f.write(html)

    # Also save JSON record
    record = {
        "invoice_number": invoice_number,
        "date": date,
        "due_date": due_date,
        "client_name": client_name,
        "client_email": client_email,
        "package": package,
        "project_name": project_name,
        "net": net,
        "vat": vat,
        "gross": gross,
        "notes": notes,
        "filepath": filepath,
    }
    record_path = os.path.join(OUTPUT_DIR, f"{invoice_number}.json")
    with open(record_path, "w", encoding="utf-8") as f:
        json.dump(record, f, indent=2, ensure_ascii=False)

    print(f"Rechnung erstellt: {filepath}")
    print(f"Rechnungsnummer: {invoice_number}")
    print(f"Gesamtbetrag: {gross:,.2f} € (netto {net:,.2f} € + MwSt. {vat:,.2f} €)")
    return filepath

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="OMEGA Invoice Generator")
    parser.add_argument("--client", "-c", required=True, help="Kundenname")
    parser.add_argument("--email", "-e", default="", help="Kunden-E-Mail")
    parser.add_argument("--package", "-p", default="pre-launch", choices=list(PACKAGES.keys()), help="Paket")
    parser.add_argument("--project", "-P", required=True, help="Projektname")
    parser.add_argument("--notes", "-n", default="", help="Hinweise")
    args = parser.parse_args()
    generate_invoice(args.client, args.email, args.package, args.project, args.notes)
