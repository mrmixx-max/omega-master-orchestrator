#!/usr/bin/env python3
"""
OMEGA BATCH LEAD HUNTER & OUTREACH AUTOMATION ENGINE
Liest eine CSV-Liste von Ziel-URLs/Unternehmen ein, führt für jeden Lead
die OMEGA-Pipeline (Swarm + Slop Sanitizer) aus, generiert das Executive HTML-Dossier
und exportiert eine fertige Outreach-Warteschlange.
"""

import os
import sys
import csv
import json
import re
import argparse
import sqlite3
from datetime import datetime
from omega_orchestrator import (
    run_master_pipeline, ingest_target, analyze_slop_metrics,
    call_llm, parse_json_safe, generate_executive_html_report,
    DB_PATH, OUTPUT_DIR, PERSONAS, init_db
)

HUNTER_DIR = os.path.expanduser("~/.hermes/skills/omega-master/leads")
OUTREACH_DIR = os.path.expanduser("~/.hermes/skills/omega-master/outreach")
os.makedirs(HUNTER_DIR, exist_ok=True)
os.makedirs(OUTREACH_DIR, exist_ok=True)


def process_lead(target, niche, contact_name, company, style, objections):
    """Führt die OMEGA-Pipeline für einen einzelnen Lead aus und gibt die Ergebnisse zurück."""
    print(f"\n=======================================================================")
    print(f" OMEGA LEAD HUNTER | Ziel: {target[:50]} | Firma: {company}")
    print(f"=======================================================================")

    original_text = ingest_target(target)
    metrics_before = analyze_slop_metrics(original_text)

    # Persona outputs
    persona_outputs = {}
    for key, p in PERSONAS.items():
        print(f"  [*] Schwarm-Angriff durch: {p['title']} ...")
        p_prompt = f"NISCHE: {niche}\nBEKANNTER KUNDENFRUST: {objections or 'Skepsis'}\n\nTEXT:\n{original_text}"
        persona_outputs[key] = call_llm(p["system"], p_prompt, temperature=0.5)

    combined_swarm = "\n\n".join([f"### {PERSONAS[k]['title']}\n{v}" for k, v in persona_outputs.items()])

    base_eval = parse_json_safe(call_llm(
        "Du bist Auditeur. Gib AUSSCHLIESSLICH JSON zurück: " + '{"conversion_score": <int>, "lethal_flaws": ["F1", "F2", "F3"], "worst_quote": "<Zuschnitt>"}',
        f"ORIGINAL:\n{original_text}\n\nSCHWARM:\n{combined_swarm}",
        temperature=0.2, json_mode=True
    ))
    conv_before = int(base_eval.get("conversion_score", 52))
    lethal_flaws = base_eval.get("lethal_flaws", ["Schwacher Hook", "Fehlender Mechanismus", "Austauschbarer Ton"])
    worst_quote = base_eval.get("worst_quote", "")

    # Dual-Hardening Loop
    current_draft = ""
    conv_after = 0
    human_after = 0
    combined_score = 0
    critic_directives = "Eliminiere alle Konversions-Killer und schreibe mit extremer menschlicher Burstiness."
    loop_count = 0

    while combined_score < 92 and loop_count < 4:
        loop_count += 1
        print(f"  [*] Dual-Hardening Loop #{loop_count} (Ziel: >= 92) ...")

        forger_sys = (
            "Du bist OMEGA MASTER-FORGER. Schreibe die Seite komplett neu:\n"
            "1. HERO-SEKTION (Hook + Subheadline + Beweis-Mechanismus)\n"
            "2. CFO- & SKEPTIKER-BRECHER (Zahlen, ROI)\n"
            "3. KERN-ARCHITEKTUR & CTA.\n"
            f"TONALITÄT: {style}\nVERBOTEN: 'In einer welt', 'nahtlos', 'Gamechanger', 'ganzheitlich'. Nur druckreifer Text."
        )
        current_draft = call_llm(forger_sys, f"ORIGINAL:\n{original_text}\n\nSCHWARM:\n{combined_swarm}\n\nDIREKTIVEN:\n{critic_directives}\n\nENTWURF:\n{current_draft}", temperature=0.45)
        draft_metrics = analyze_slop_metrics(current_draft)

        dual_critic = parse_json_safe(call_llm(
            "Du bist DUAL RED_CRITIC. Gib AUSSCHLIESSLICH JSON zurück: " + '{"conversion_score": <int>, "human_score": <int>, "feedback": "<Text>"}',
            f"METRIKEN: Burstiness={draft_metrics['burstiness']}, Hits={draft_metrics['slop_hits']}\n\nENTWURF:\n{current_draft}",
            temperature=0.1, json_mode=True
        ))

        conv_after = int(dual_critic.get("conversion_score", 89))
        human_after = int(dual_critic.get("human_score", 89))
        if draft_metrics["hit_count"] > 0 or draft_metrics["burstiness"] < 5.5:
            human_after = min(human_after, 85)
            critic_directives = f"CODE-VETO! Floskeln oder monotone Sätze entfernen. {draft_metrics['slop_hits']}"
        else:
            critic_directives = dual_critic.get("feedback", "Schärfe den Hook.")

        combined_score = min(conv_after, human_after)

    metrics_after = analyze_slop_metrics(current_draft)

    # Pitch & Proposal
    print("  [*] Generiere High-Ticket Outreach-Pitch und Service-Proposal ...")
    pitch_sys = "Schreibe einen souveränen Cold-Pitch mit dem Conversion-Score, dem Slop-Wert und der neuen Hero-Sektion."
    executive_pitch = call_llm(pitch_sys, f"ZIEL: {target}\nSCORE: {conv_before}->{conv_after}\nCOPY:\n{current_draft[:1500]}", temperature=0.4)

    proposal_sys = (
        "Du schreibst ein hochprofessionelles, direkt auf diesen Kunden zugeschnittenes High-Ticket Dienstleistungs-Angebot (Proposal) "
        "für das OMEGA-System (Paket: Pre-Launch Autopsy 950 € oder Full-Funnel Overhaul 2.400 €). "
        "Beziehe dich konkret auf die gefundenen Schwachstellen der Ziel-URL, den Nischen-Kontext und die erreichten Scores. "
        "Formuliere klar, wertschätzend und direkt abschlussstark auf Deutsch."
    )
    client_proposal = call_llm(proposal_sys, f"ZIEL: {target}\nNISCHE: {niche}\nINITIAL-SCORE: {conv_before}/100\nTOXIZITÄT: {metrics_before['slop_toxicity']}%\nKILLER: {json.dumps(lethal_flaws)}", temperature=0.4)

    # Save dossier
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    slug = re.sub(r"[^a-zA-Z0-9]+", "_", target[:30]).strip("_").lower()
    ts = datetime.now().strftime("%Y%m%d_%H%M%S")
    dossier_path = os.path.join(OUTPUT_DIR, f"{ts}_{slug}_MASTER_DOSSIER.md")
    html_report = dossier_path.replace(".md", "_EXECUTIVE_REPORT.html")

    generate_executive_html_report(
        target, niche, style, conv_before, conv_after, human_after,
        metrics_before, metrics_after, lethal_flaws, worst_quote,
        combined_swarm, current_draft, executive_pitch, client_proposal, dossier_path
    )

    print(f"  [+] HTML-Report: {html_report}")

    return {
        "company": company,
        "contact_name": contact_name,
        "target_url": target,
        "niche": niche,
        "style": style,
        "conv_before": conv_before,
        "conv_after": conv_after,
        "human_after": human_after,
        "slop_toxicity_before": metrics_before["slop_toxicity"],
        "slop_toxicity_after": metrics_after["slop_toxicity"],
        "burstiness_before": metrics_before["burstiness"],
        "burstiness_after": metrics_after["burstiness"],
        "lethal_flaws": lethal_flaws,
        "executive_pitch": executive_pitch,
        "client_proposal": client_proposal,
        "dossier_path": dossier_path,
        "html_report_path": html_report,
        "timestamp": ts,
    }


def process_batch(csv_filepath: str):
    """Verarbeitet eine CSV-Datei mit Leads und generiert die Outreach-Warteschlange."""
    csv_path = os.path.expanduser(csv_filepath)
    if not os.path.exists(csv_path):
        print(f"[!] Fehler: CSV-Datei nicht gefunden unter {csv_path}")
        sys.exit(1)

    print(f"\n=======================================================================")
    print(f" OMEGA BATCH LEAD HUNTER | Lese Leads aus: {csv_path}")
    print(f"=======================================================================")

    outreach_queue = []

    with open(csv_path, mode="r", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        leads = list(reader)

    print(f"[+] {len(leads)} Leads geladen. Starte autonome Verarbeitungs-Pipeline...\n")

    for idx, lead in enumerate(leads, 1):
        target = lead.get("url", "").strip()
        niche = lead.get("niche", "B2B SaaS / Services").strip()
        contact_name = lead.get("name", "Entscheider").strip()
        company = lead.get("company", "Unternehmen").strip()
        style = lead.get("style", "Messerscharfer Direkt-Response-Experte").strip()
        objections = lead.get("objections", "Skepsis gegen leere Marketing-Versprechen").strip()

        if not target:
            print(f"[{idx}/{len(leads)}] Überspringe Lead ohne URL.")
            continue

        print(f"\n--- Lead {idx}/{len(leads)}: {company} ---")

        try:
            result = process_lead(target, niche, contact_name, company, style, objections)
            outreach_queue.append(result)
            print(f"  [+] Lead verarbeitet: {company} (Score {result['conv_before']} → {result['conv_after']})")
        except Exception as e:
            print(f"  [!] Fehler bei {company}: {e}")
            continue

    # Export Outreach Queue
    ts = datetime.now().strftime("%Y%m%d_%H%M%S")
    json_path = os.path.join(OUTREACH_DIR, f"outreach_queue_{ts}.json")
    csv_path_out = os.path.join(OUTREACH_DIR, f"outreach_queue_{ts}.csv")

    # JSON export
    with open(json_path, "w", encoding="utf-8") as f:
        json.dump(outreach_queue, f, ensure_ascii=False, indent=2)

    # CSV export (ohne lange Texte)
    csv_fields = [
        "company", "contact_name", "target_url", "niche",
        "conv_before", "conv_after", "human_after",
        "slop_toxicity_before", "slop_toxicity_after",
        "burstiness_before", "burstiness_after",
        "dossier_path", "html_report_path", "timestamp"
    ]
    with open(csv_path_out, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=csv_fields, extrasaction="ignore")
        writer.writeheader()
        for row in outreach_queue:
            writer.writerow(row)

    # Summary
    print(f"\n=======================================================================")
    print(f" OMEGA BATCH LEAD HUNTER | ZUSAMMENFASSUNG")
    print(f"=======================================================================")
    print(f" Leads verarbeitet: {len(outreach_queue)}/{len(leads)}")
    if outreach_queue:
        avg_before = sum(r["conv_before"] for r in outreach_queue) / len(outreach_queue)
        avg_after = sum(r["conv_after"] for r in outreach_queue) / len(outreach_queue)
        print(f" Durchschnittlicher Score: {avg_before:.1f} → {avg_after:.1f} (+{avg_after - avg_before:.1f})")
        print(f" Durchschnittliche Slop-Toxizität: {sum(r['slop_toxicity_before'] for r in outreach_queue)/len(outreach_queue):.1f}% → {sum(r['slop_toxicity_after'] for r in outreach_queue)/len(outreach_queue):.1f}%")
    print(f"\n JSON-Warteschlange: {json_path}")
    print(f" CSV-Warteschlange:  {csv_path_out}")
    print(f"=======================================================================\n")

    return outreach_queue


def generate_outreach_email(lead_result: dict) -> str:
    """Generiert eine fertige Outreach-E-Mail aus einem Lead-Ergebnis."""
    email = f"""Betreff: Ihre Landingpage im Conversion-Check — {lead_result['company']}

Hallo {lead_result['contact_name']},

ich habe mir {lead_result['target_url']} genauer angesehen und einen vollständigen Conversion-Audit durchgeführt.

Die Ergebnisse:

• Conversion-Score: {lead_result['conv_before']}/100 → {lead_result['conv_after']}/100 (nach Härtung)
• KI-Slop-Toxizität: {lead_result['slop_toxicity_before']}% → {lead_result['slop_toxicity_after']}%
• Burstiness (Satzlängen-Dynamik): {lead_result['burstiness_before']} → {lead_result['burstiness_after']}

Die 3 tödlichsten Vertrauens-Killer:
{chr(10).join(f"  {i+1}. {f}" for i, f in enumerate(lead_result['lethal_flaws']))}

Ich habe eine gehärtete Version Ihrer Copy erstellt, die diese Probleme eliminiert.
Das vollständige Dossier finden Sie als Anhang.

Möchten Sie die gehärtete Version sehen? Ich sende Ihnen gerne das komplette Executive Report.

Beste Grüße
Erik Gieske
OMEGA Master Orchestrator
"""
    return email


def export_outreach_emails(outreach_queue: list):
    """Exportiert fertige Outreach-E-Mails für alle Leads."""
    email_dir = os.path.join(OUTREACH_DIR, "emails")
    os.makedirs(email_dir, exist_ok=True)

    for lead in outreach_queue:
        email = generate_outreach_email(lead)
        slug = re.sub(r"[^a-zA-Z0-9]+", "_", lead["company"][:20]).strip("_").lower()
        path = os.path.join(email_dir, f"outreach_{slug}.txt")
        with open(path, "w", encoding="utf-8") as f:
            f.write(email)
        print(f"  [+] E-Mail exportiert: {path}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="OMEGA Batch Lead Hunter & Outreach Automation")
    parser.add_argument("--csv", "-c", required=True, help="Pfad zur CSV-Datei mit Leads (Spalten: url, niche, name, company, style, objections)")
    parser.add_argument("--export-emails", "-e", action="store_true", help="Fertige Outreach-E-Mails exportieren")
    args = parser.parse_args()

    queue = process_batch(args.csv)

    if args.export_emails:
        print("\n[*] Exportiere Outreach-E-Mails...")
        export_outreach_emails(queue)
        print("[+] Alle E-Mails exportiert.\n")
