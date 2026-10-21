#!/usr/bin/env python3
"""OMEGA Portfolio Generator - Erstellt eine Showcase-Seite aus bisherigen Audits."""
import os, glob, re, json
from datetime import datetime

OUTPUT_DIR = os.path.expanduser("~/.hermes/skills/omega-master/dossiers")
PORTFOLIO_PATH = os.path.join(OUTPUT_DIR, "portfolio.html")

def scan_audits():
    audits = []
    for md_path in sorted(glob.glob(os.path.join(OUTPUT_DIR, "*_MASTER_DOSSIER.md")), reverse=True):
        with open(md_path, "r", encoding="utf-8") as f:
            content = f.read()

        target = "Unbekannt"
        niche = "Allgemein"
        conv_before = conv_after = slop_before = slop_after = None
        date_str = ""

        for line in content.split("\n")[:20]:
            if "Geprüftes Ziel:" in line:
                target = line.split("`")[1] if "`" in line else "Unbekannt"
            if "Markt / Nische:" in line:
                niche = line.split(":")[-1].strip()
            if "Datum:" in line:
                date_str = line.split(":")[-1].strip() if ":" in line else ""

        conv_match = re.search(r"Conversion-Psychologie Score.*?(\d+)\s*/\s*100.*?(\d+)\s*/\s*100", content, re.DOTALL)
        if conv_match:
            conv_before, conv_after = int(conv_match.group(1)), int(conv_match.group(2))

        slop_match = re.search(r"AI-Slop Toxizität.*?(\d+)%.*?(\d+)%", content, re.DOTALL)
        if slop_match:
            slop_before, slop_after = int(slop_match.group(1)), int(slop_match.group(2))

        flaws = re.findall(r"\d+\.\s*\*\*(.+?)\*\*", content)

        audits.append({
            "target": target, "niche": niche, "date": date_str,
            "conv_before": conv_before, "conv_after": conv_after,
            "slop_before": slop_before, "slop_after": slop_after,
            "flaws": flaws[:3],
            "filename": os.path.basename(md_path),
        })
    return audits

def generate():
    audits = scan_audits()
    cards = ""
    for a in audits:
        conv_delta = (a["conv_after"] - a["conv_before"]) if a["conv_before"] and a["conv_after"] else 0
        slop_delta = (a["slop_before"] - a["slop_after"]) if a["slop_before"] and a["slop_after"] else 0
        flaws_html = "".join([f"<li class='text-xs text-slate-400'>• {f}</li>" for f in a["flaws"]])
        cards += f"""
        <div class="bg-slate-900/50 border border-slate-800 rounded-xl p-5 hover:border-cyan-800 transition">
            <div class="flex items-center justify-between mb-3">
                <div>
                    <h3 class="text-sm font-bold text-white">{a['target'][:50]}</h3>
                    <p class="text-[10px] text-slate-500">{a['niche']} • {a['date']}</p>
                </div>
                <div class="text-right">
                    <div class="text-lg font-black text-cyan-400">{a['conv_after'] or '?'}<span class="text-xs text-slate-500">/100</span></div>
                    <div class="text-[10px] text-emerald-400">+{conv_delta} Pkt</div>
                </div>
            </div>
            <div class="grid grid-cols-2 gap-2 mb-3">
                <div class="bg-slate-800/50 rounded-lg p-2 text-center">
                    <div class="text-xs text-slate-400">Slop-Toxizität</div>
                    <div class="text-sm font-bold text-emerald-400">{a['slop_after'] or '?'}% <span class="text-[10px] text-slate-500">(-{slop_delta}%)</span></div>
                </div>
                <div class="bg-slate-800/50 rounded-lg p-2 text-center">
                    <div class="text-xs text-slate-400">Status</div>
                    <div class="text-sm font-bold text-emerald-400">✓ Gehärtet</div>
                </div>
            </div>
            <ul class="space-y-1">{flaws_html}</ul>
        </div>"""

    html = f"""<!DOCTYPE html>
<html lang="de" class="dark">
<head>
    <meta charset="UTF-8">
    <title>OMEGA Portfolio - Case Studies</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        body {{ background: #090d16; color: #f3f4f6; font-family: -apple-system, sans-serif; }}
    </style>
</head>
<body class="min-h-screen p-8">
    <div class="max-w-6xl mx-auto">
        <div class="text-center mb-8">
            <h1 class="text-3xl font-black text-white mb-2">OMEGA Portfolio</h1>
            <p class="text-slate-400">Erfolgreich gehärtete Landingpages & Conversion-Optimierungen</p>
            <p class="text-xs text-slate-500 mt-1">{len(audits)} Case Studies</p>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {cards if cards else '<div class="col-span-full text-center text-slate-500 py-12">Noch keine Audits vorhanden. Starte die Pipeline!</div>'}
        </div>
        <div class="mt-8 text-center">
            <a href="lead_capture.html" class="px-6 py-3 bg-gradient-to-r from-cyan-500 to-emerald-500 text-black font-bold rounded-xl shadow-lg shadow-cyan-500/20 transition inline-block">
                Kostenloser Audit anfordern →
            </a>
        </div>
    </div>
</body>
</html>"""

    os.makedirs(OUTPUT_DIR, exist_ok=True)
    with open(PORTFOLIO_PATH, "w", encoding="utf-8") as f:
        f.write(html)
    print(f"Portfolio generiert: {PORTFOLIO_PATH} ({len(audits)} Audits)")

if __name__ == "__main__":
    generate()
