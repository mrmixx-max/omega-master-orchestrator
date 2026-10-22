#!/usr/bin/env python3
"""
OMEGA SLOP SCRAPER DESKTOP APP
PyWebView-basierte Desktop-Anwendung für den Slop Scraper & Auto-Outreach Engine.
"""

import os
import sys
import json
import threading
from pathlib import Path

os.environ.pop("PYTHONPATH", None)

SKILL_DIR = Path(os.path.expanduser("~/.hermes/skills/omega-master"))
SCRAPER_DIR = SKILL_DIR / "scraper_leads"
PYTHON_EXE = sys.executable

sys.path.insert(0, str(SKILL_DIR))

import webview

class ScraperAPI:
    def __init__(self):
        self.window = None
        self.last_results = None
        self.running = False

    def scrape_urls(self, urls_text, niche, delay=1.0):
        """Scraped URLs und analysiert auf Slop. urls_text = newline-separated URLs."""
        if self.running:
            return {"status": "error", "message": "Bereits läuft"}
        self.running = True
        try:
            from omega_slop_scraper import scrape_url, quick_slop_scan, score_lead, generate_sales_email
            urls = [u.strip() for u in urls_text.split("\n") if u.strip()]
            results = []
            for url in urls:
                scraped = scrape_url(url)
                if scraped["status"] == "error":
                    results.append({"url": url, "status": "error", "error": scraped["error"], "lead_score": 0})
                    continue
                scan = quick_slop_scan(scraped["text"])
                lead_score = score_lead(scan, scraped["text"])
                email = generate_sales_email(url, scraped["title"], scan, niche)
                results.append({
                    "url": url, "title": scraped["title"], "status": "ok",
                    "scan": scan, "lead_score": lead_score, "email": email,
                })
            # Sort by lead score
            ok = [r for r in results if r["status"] == "ok"]
            ok.sort(key=lambda x: x["lead_score"], reverse=True)
            self.last_results = {"results": results, "ok": ok, "niche": niche}
            return {
                "status": "ok",
                "total": len(urls),
                "success": len(ok),
                "errors": len(results) - len(ok),
                "top_leads": [{"url": r["url"], "title": r["title"], "lead_score": r["lead_score"],
                               "slop_toxicity": r["scan"]["slop_toxicity"],
                               "burstiness": r["scan"]["burstiness"],
                               "hit_count": r["scan"]["hit_count"]} for r in ok[:10]],
            }
        except Exception as e:
            return {"status": "error", "message": str(e)}
        finally:
            self.running = False

    def export_results(self):
        """Exportiert die letzten Ergebnisse als JSON + CSV + E-Mails."""
        if not self.last_results:
            return {"status": "error", "message": "Keine Ergebnisse vorhanden"}
        try:
            from omega_slop_scraper import scrape_and_analyze
            import json, os, re
            from datetime import datetime
            ts = datetime.now().strftime("%Y%m%d_%H%M%S")
            export_dir = SCRAPER_DIR / f"desktop_export_{ts}"
            os.makedirs(export_dir, exist_ok=True)
            email_dir = export_dir / "emails"
            os.makedirs(email_dir, exist_ok=True)

            ok = self.last_results["ok"]
            # JSON
            with open(export_dir / "results.json", "w", encoding="utf-8") as f:
                json.dump(self.last_results["results"], f, ensure_ascii=False, indent=2)
            # CSV
            import csv
            with open(export_dir / "results.csv", "w", newline="", encoding="utf-8") as f:
                w = csv.writer(f)
                w.writerow(["rank", "url", "title", "lead_score", "slop_toxicity", "burstiness", "hit_count"])
                for rank, r in enumerate(ok, 1):
                    w.writerow([rank, r["url"], r["title"], r["lead_score"],
                                r["scan"]["slop_toxicity"], r["scan"]["burstiness"], r["scan"]["hit_count"]])
            # Emails
            for rank, r in enumerate(ok, 1):
                slug = re.sub(r"[^a-zA-Z0-9]+", "_", (r["title"] or r["url"])[:30]).strip("_").lower()
                with open(email_dir / f"{rank:03d}_{slug}.txt", "w", encoding="utf-8") as f:
                    f.write(r["email"])
            return {"status": "ok", "path": str(export_dir), "files": len(ok)}
        except Exception as e:
            return {"status": "error", "message": str(e)}

    def get_email(self, url):
        """Gibt die generierte E-Mail für eine URL zurück."""
        if not self.last_results:
            return {"status": "error", "message": "Keine Ergebnisse"}
        for r in self.last_results["results"]:
            if r["url"] == url and r.get("email"):
                return {"status": "ok", "email": r["email"]}
        return {"status": "error", "message": "Nicht gefunden"}

    def open_file(self, path):
        import webbrowser
        webbrowser.open(f"file:///{path.replace(os.sep, '/')}")
        return {"status": "ok"}

    def auto_discover(self, query, num=20):
        """Findet URLs automatisch via GitHub API."""
        try:
            sys.path.insert(0, str(SKILL_DIR))
            from omega_auto_discover import discover_github
            urls = discover_github(query, num)
            return {"status": "ok", "urls": urls, "count": len(urls)}
        except Exception as e:
            return {"status": "error", "message": str(e)}

    def get_status(self):
        return {
            "python": sys.version.split()[0],
            "skill_dir": str(SKILL_DIR),
            "exports": len(list(SCRAPER_DIR.glob("desktop_export_*"))) if SCRAPER_DIR.exists() else 0,
            "running": self.running,
        }


def get_html():
    """Generiert die Scraper-Desktop-HTML."""
    return """<!DOCTYPE html>
<html lang="de">
<head>
<meta charset="UTF-8">
<title>OMEGA Slop Scraper</title>
<script src="https://cdn.tailwindcss.com"></script>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;700&display=swap" rel="stylesheet">
<style>
  body { font-family: 'Inter', sans-serif; background: #090d16; color: #f3f4f6; }
  .font-mono { font-family: 'JetBrains Mono', monospace; }
  ::-webkit-scrollbar { width: 6px; } ::-webkit-scrollbar-track { background: #090d16; }
  ::-webkit-scrollbar-thumb { background: #1f2937; border-radius: 3px; }
  .glow-cyan { box-shadow: 0 0 20px rgba(6,182,212,0.15); }
</style>
</head>
<body class="min-h-screen flex flex-col">
<header class="border-b border-gray-800 bg-gray-900/80 backdrop-blur px-6 py-4 flex items-center justify-between">
  <div class="flex items-center space-x-3">
    <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center text-black font-black text-xl">🔍</div>
    <div>
      <h1 class="font-bold tracking-wider text-lg">OMEGA SLOP SCRAPER</h1>
      <p class="text-xs text-gray-400">Auto-Slop-Detektor & Outreach-Generator</p>
    </div>
  </div>
  <div id="status" class="text-xs text-gray-400 bg-gray-900 px-3 py-1.5 rounded-lg border border-gray-800">Bereit</div>
</header>
<main class="flex-1 overflow-auto p-6 space-y-6">
  <div class="bg-gray-900 border border-gray-800 rounded-xl p-6">
    <h2 class="text-cyan-400 font-bold text-lg mb-4">🔍 URLs eingeben</h2>
    <textarea id="urls" rows="6" placeholder="https://example.com&#10;https://another-site.com&#10;..." class="w-full bg-gray-950 border border-gray-700 rounded-lg px-4 py-3 text-white font-mono text-sm focus:border-cyan-500 focus:outline-none"></textarea>
    <div class="grid grid-cols-2 gap-4 mt-4">
      <div>
        <label class="text-sm text-gray-400 mb-1 block">Nische</label>
        <input id="niche" value="B2B SaaS" class="w-full bg-gray-950 border border-gray-700 rounded-lg px-4 py-2 text-white focus:border-cyan-500 focus:outline-none">
      </div>
      <div>
        <label class="text-sm text-gray-400 mb-1 block">Verzögerung (Sek)</label>
        <input id="delay" type="number" value="1" min="0" step="0.5" class="w-full bg-gray-950 border border-gray-700 rounded-lg px-4 py-2 text-white focus:border-cyan-500 focus:outline-none">
      </div>
    </div>
    <button onclick="runScrape()" id="scrapeBtn" class="mt-4 px-6 py-3 rounded-lg font-bold bg-gradient-to-r from-red-500 to-orange-500 text-black hover:shadow-lg transition">🚀 Scrapen & Analysieren</button>
    <button onclick="autoDiscover()" id="discoverBtn" class="mt-4 ml-2 px-6 py-3 rounded-lg font-bold bg-gradient-to-r from-purple-500 to-blue-500 text-white hover:shadow-lg transition">🔍 Auto-Discover</button>
    <button onclick="exportResults()" id="exportBtn" class="mt-4 ml-2 px-6 py-3 rounded-lg font-bold bg-gray-800 text-white hover:bg-gray-700 transition" disabled>💾 Exportieren</button>
  </div>
  <div id="log" class="bg-gray-900 border border-gray-800 rounded-xl p-4">
    <h3 class="text-gray-400 text-sm font-bold mb-2">📋 Log</h3>
    <div id="logContent" class="bg-gray-950 rounded-lg p-3 h-32 overflow-auto font-mono text-xs text-gray-300">Warte auf Start...</div>
  </div>
  <div id="results" class="hidden bg-gray-900 border border-gray-800 rounded-xl p-6 glow-cyan">
    <h2 class="text-emerald-400 font-bold text-lg mb-4">📊 Ergebnisse</h2>
    <div id="summary" class="grid grid-cols-4 gap-4 mb-4"></div>
    <div id="leadTable" class="overflow-auto"></div>
    <div id="emailPreview" class="mt-4 hidden">
      <h3 class="text-cyan-400 font-bold text-sm mb-2">📧 E-Mail Vorschau</h3>
      <pre id="emailContent" class="bg-gray-950 rounded-lg p-3 text-xs text-gray-300 whitespace-pre-wrap max-h-64 overflow-auto"></pre>
    </div>
  </div>
</main>
<script>
async function autoDiscover() {
  const query = document.getElementById('niche').value || 'landing page saas';
  const btn = document.getElementById('discoverBtn');
  btn.disabled = true; btn.textContent = '⏳ Discovering...';
  log('🔍 Auto-Discover: Suche nach Websites...');
  try {
    const res = await window.pywebview.api.auto_discover(query, 20);
    if (res.status === 'ok') {
      log('✅ ' + res.count + ' URLs gefunden');
      document.getElementById('urls').value = res.urls.join('\\n');
    } else {
      log('❌ ' + res.message);
    }
  } catch(e) { log('❌ ' + e); }
  btn.disabled = false; btn.textContent = '🔍 Auto-Discover';
}
async function runScrape() {
  const urls = document.getElementById('urls').value;
  const niche = document.getElementById('niche').value;
  const delay = parseFloat(document.getElementById('delay').value) || 1;
  if (!urls.trim()) { log('⚠️ Bitte URLs eingeben'); return; }
  const btn = document.getElementById('scrapeBtn');
  btn.disabled = true; btn.textContent = '⏳ Scraping...';
  document.getElementById('status').textContent = 'Läuft...';
  log('🚀 Starte Slop-Scan...');
  try {
    const res = await window.pywebview.api.scrape_urls(urls, niche, delay);
    if (res.status === 'ok') {
      log('✅ ' + res.success + '/' + res.total + ' URLs erfolgreich gescraped');
      log('📊 ' + res.top_leads.length + ' Top-Leads gefunden');
      showResults(res);
      document.getElementById('exportBtn').disabled = false;
    } else {
      log('❌ Fehler: ' + res.message);
    }
  } catch(e) { log('❌ ' + e); }
  btn.disabled = false; btn.textContent = '🚀 Scrapen & Analysieren';
  document.getElementById('status').textContent = 'Fertig';
}
async function exportResults() {
  const res = await window.pywebview.api.export_results();
  if (res.status === 'ok') {
    log('💾 Exportiert nach: ' + res.path + ' (' + res.files + ' E-Mails)');
  } else { log('❌ ' + res.message); }
}
function showResults(res) {
  document.getElementById('results').classList.remove('hidden');
  document.getElementById('summary').innerHTML = `
    <div class="bg-gray-950 rounded-lg p-3 text-center"><div class="text-gray-400 text-xs">URLs</div><div class="text-2xl font-bold text-white font-mono">${res.total}</div></div>
    <div class="bg-gray-950 rounded-lg p-3 text-center"><div class="text-gray-400 text-xs">Erfolg</div><div class="text-2xl font-bold text-emerald-400 font-mono">${res.success}</div></div>
    <div class="bg-gray-950 rounded-lg p-3 text-center"><div class="text-gray-400 text-xs">Fehler</div><div class="text-2xl font-bold text-red-400 font-mono">${res.errors}</div></div>
    <div class="bg-gray-950 rounded-lg p-3 text-center"><div class="text-gray-400 text-xs">Top-Leads</div><div class="text-2xl font-bold text-cyan-400 font-mono">${res.top_leads.length}</div></div>
  `;
  let html = '<table class="w-full text-sm"><thead><tr class="text-gray-400 border-b border-gray-800"><th class="text-left py-2">Score</th><th class="text-left py-2">Slop%</th><th class="text-left py-2">Burst</th><th class="text-left py-2">Hits</th><th class="text-left py-2">URL</th></tr></thead><tbody>';
  for (const l of res.top_leads) {
    const color = l.lead_score >= 60 ? 'text-emerald-400' : l.lead_score >= 40 ? 'text-yellow-400' : 'text-gray-400';
    html += `<tr class="border-b border-gray-800/50 hover:bg-gray-800/30 cursor-pointer" onclick="previewEmail('${l.url}')">
      <td class="py-2 font-mono ${color} font-bold">${l.lead_score}</td>
      <td class="py-2 font-mono text-red-400">${l.slop_toxicity}%</td>
      <td class="py-2 font-mono text-gray-300">${l.burstiness}</td>
      <td class="py-2 font-mono text-gray-300">${l.hit_count}</td>
      <td class="py-2 text-gray-300 truncate max-w-xs">${l.url}</td>
    </tr>`;
  }
  html += '</tbody></table>';
  document.getElementById('leadTable').innerHTML = html;
}
async function previewEmail(url) {
  const res = await window.pywebview.api.get_email(url);
  if (res.status === 'ok') {
    document.getElementById('emailPreview').classList.remove('hidden');
    document.getElementById('emailContent').textContent = res.email;
  }
}
function log(msg) {
  const c = document.getElementById('logContent');
  c.innerHTML += '\\n' + '[' + new Date().toLocaleTimeString() + '] ' + msg;
  c.scrollTop = c.scrollHeight;
}
</script>
</body>
</html>"""

def main():
    api = ScraperAPI()
    html = get_html()
    window = webview.create_window(
        "OMEGA Slop Scraper",
        html=html,
        js_api=api,
        width=1200, height=800,
        min_size=(900, 600),
        background_color="#090d16",
    )
    api.window = window
    webview.start(debug=False)

if __name__ == "__main__":
    main()
