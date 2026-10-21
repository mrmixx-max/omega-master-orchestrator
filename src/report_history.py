#!/usr/bin/env python3
"""Generiert eine HTML-Übersicht aller bisherigen OMEGA Dossiers."""
import os, glob, re
from datetime import datetime

OUTPUT_DIR = os.path.expanduser("~/.hermes/skills/omega-master/dossiers")
HISTORY_PATH = os.path.join(OUTPUT_DIR, "index.html")

def scan_dossiers():
    dossiers = []
    for md_path in sorted(glob.glob(os.path.join(OUTPUT_DIR, "*_MASTER_DOSSIER.md")), reverse=True):
        basename = os.path.basename(md_path)
        # Extract timestamp and slug
        m = re.match(r"(\d{8}_\d{6})_(.+)_MASTER_DOSSIER\.md", basename)
        if not m:
            continue
        ts_str, slug = m.groups()
        try:
            dt = datetime.strptime(ts_str, "%Y%m%d_%H%M%S")
            date_str = dt.strftime("%d.%m.%Y %H:%M")
        except Exception:
            date_str = ts_str

        # Read first lines for metadata
        niche = "Unbekannt"
        target = slug.replace("_", " ").title()
        try:
            with open(md_path, "r", encoding="utf-8") as f:
                for line in f.readlines()[:15]:
                    if "**Geprüftes Ziel:**" in line:
                        target = line.split("`")[1] if "`" in line else target
                    if "**Markt / Nische:**" in line:
                        niche = line.split(":")[-1].strip()
        except Exception:
            pass

        html_path = md_path.replace(".md", "_EXECUTIVE_REPORT.html")
        has_html = os.path.isfile(html_path)

        dossiers.append({
            "date": date_str,
            "target": target,
            "niche": niche,
            "slug": slug,
            "md_path": md_path,
            "html_path": html_path if has_html else None,
            "has_html": has_html,
        })
    return dossiers

def generate():
    dossiers = scan_dossiers()
    rows = ""
    for d in dossiers:
        html_link = f'<a href="{os.path.basename(d["html_path"])}" class="text-cyan-400 hover:underline">HTML Report</a>' if d["has_html"] else '<span class="text-slate-500">—</span>'
        rows += f"""
        <tr class="border-b border-slate-800 hover:bg-slate-800/50">
            <td class="py-3 px-4 text-xs text-slate-400">{d['date']}</td>
            <td class="py-3 px-4 text-sm text-white font-medium">{d['target'][:60]}</td>
            <td class="py-3 px-4 text-xs text-slate-300">{d['niche'][:40]}</td>
            <td class="py-3 px-4 text-xs">{html_link}</td>
            <td class="py-3 px-4 text-xs text-slate-500">{os.path.basename(d['md_path'])}</td>
        </tr>"""

    html = f"""<!DOCTYPE html>
<html lang="de" class="dark">
<head>
    <meta charset="UTF-8">
    <title>OMEGA Report History</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        body {{ background: #090d16; color: #f3f4f6; font-family: -apple-system, sans-serif; }}
        ::-webkit-scrollbar {{ width: 6px; }}
        ::-webkit-scrollbar-track {{ background: #090d16; }}
        ::-webkit-scrollbar-thumb {{ background: #1f2937; border-radius: 3px; }}
    </style>
</head>
<body class="min-h-screen p-8">
    <div class="max-w-6xl mx-auto">
        <div class="flex items-center justify-between mb-8">
            <div>
                <h1 class="text-2xl font-bold text-cyan-400">OMEGA Report History</h1>
                <p class="text-sm text-slate-400">{len(dossiers)} Dossiers gefunden</p>
            </div>
            <a href="dashboard.html" class="px-4 py-2 bg-cyan-950 text-cyan-300 border border-cyan-800 rounded-lg text-sm hover:bg-cyan-900 transition">
                ← Dashboard
            </a>
        </div>

        <div class="bg-slate-900/50 border border-slate-800 rounded-xl overflow-hidden">
            <table class="w-full">
                <thead>
                    <tr class="bg-slate-800/50 text-left text-xs text-slate-400 uppercase tracking-wider">
                        <th class="py-3 px-4">Datum</th>
                        <th class="py-3 px-4">Ziel</th>
                        <th class="py-3 px-4">Nische</th>
                        <th class="py-3 px-4">Report</th>
                        <th class="py-3 px-4">Datei</th>
                    </tr>
                </thead>
                <tbody>
                    {rows if rows else '<tr><td colspan="5" class="py-8 text-center text-slate-500">Noch keine Dossiers vorhanden. Starte die Pipeline!</td></tr>'}
                </tbody>
            </table>
        </div>
    </div>
</body>
</html>"""

    os.makedirs(OUTPUT_DIR, exist_ok=True)
    with open(HISTORY_PATH, "w", encoding="utf-8") as f:
        f.write(html)
    print(f"Report History generiert: {HISTORY_PATH} ({len(dossiers)} Dossiers)")

if __name__ == "__main__":
    generate()
