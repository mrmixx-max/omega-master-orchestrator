#!/usr/bin/env python3
"""
OMEGA SLOP SCRAPER & AUTO-OUTREACH ENGINE
Scrapt automatisch Webseiten, prüft sie auf KI-Slop (deterministisch + LLM),
generiert Verkaufs-E-Mails und exportiert eine priorisierte Lead-Liste.
"""

import os
import sys
import csv
import json
import re
import time
import argparse
import urllib.request
import urllib.error
from datetime import datetime
from html.parser import HTMLParser
from pathlib import Path

os.environ.pop("PYTHONPATH", None)

SKILL_DIR = Path(os.path.expanduser("~/.hermes/skills/omega-master"))
OUTPUT_DIR = SKILL_DIR / "dossiers"
SCRAPER_DIR = SKILL_DIR / "scraper_leads"
os.makedirs(SCRAPER_DIR, exist_ok=True)
os.makedirs(OUTPUT_DIR, exist_ok=True)

sys.path.insert(0, str(SKILL_DIR))

from omega_orchestrator import (
    analyze_slop_metrics, call_llm, parse_json_safe,
    PERSONAS, init_db, DB_PATH
)

# --- KI-SLOP SCRAPER PATTERNS ---
SLOP_INDICATORS = [
    r"\bin der heutigen schnelllebigen welt\b",
    r"\bin einer welt,? in der\b",
    r"\bzusammenfassend lässt sich sagen\b",
    r"\bes ist wichtig zu beachten\b",
    r"\bes lässt sich nicht leugnen\b",
    r"\bein entscheidender faktor\b",
    r"\bnicht nur\b.*?\bsondern auch\b",
    r"\beintauchen in\b",
    r"\bnahtlos(?:e|en|er)?\b",
    r"\bgame-?changer\b",
    r"\brevolutionier(?:en|t)\b",
    r"\bauf das nächste level\b",
    r"\bsymphonie\b",
    r"\bwandteppich\b",
    r"\bleuchtfeuer\b",
    r"\bganzheitlich(?:e|er|en)? ansatz\b",
    r"\bschlüssel zum erfolg\b",
    r"\bin today's fast-paced world\b",
    r"\bdelve into\b",
    r"\btapestry\b",
    r"\btestament to\b",
    r"\bunlock the potential\b",
    r"\bit is important to note\b",
    r"\bseamless(?:ly)?\b",
    r"\bcutting-edge\b",
    r"\bstate-of-the-art\b",
    r"\brobust solution\b",
    r"\bempower(?:ing|ed)?\b",
    r"\bleverage\b",
    r"\bsynergy\b",
    r"\bparadigm shift\b",
]

# --- HTML TEXT EXTRACTOR ---
class TextExtractor(HTMLParser):
    def __init__(self):
        super().__init__()
        self.ignore = {"script", "style", "noscript", "svg", "footer", "nav", "header", "meta", "link"}
        self.depth = 0
        self.blocks = []

    def handle_starttag(self, tag, attrs):
        if tag.lower() in self.ignore:
            self.depth += 1

    def handle_endtag(self, tag):
        if tag.lower() in self.ignore and self.depth > 0:
            self.depth -= 1

    def handle_data(self, data):
        if self.depth > 0:
            return
        text = re.sub(r"\s+", " ", data).strip()
        if len(text) > 15:
            self.blocks.append(text)

    def get_text(self, max_chars=8000):
        return "\n".join(self.blocks)[:max_chars]


def scrape_url(url: str) -> dict:
    """Scraped eine URL und gibt Text + Metadaten zurück."""
    result = {"url": url, "text": "", "title": "", "status": "ok", "error": ""}
    try:
        req = urllib.request.Request(url, headers={
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
        })
        with urllib.request.urlopen(req, timeout=15) as resp:
            html = resp.read().decode("utf-8", errors="replace")
            parser = TextExtractor()
            parser.feed(html)
            result["text"] = parser.get_text()
            # Extract title
            title_match = re.search(r"<title[^>]*>(.*?)</title>", html, re.IGNORECASE | re.DOTALL)
            if title_match:
                result["title"] = re.sub(r"\s+", " ", title_match.group(1)).strip()
    except Exception as e:
        result["status"] = "error"
        result["error"] = str(e)
    return result


def quick_slop_scan(text: str) -> dict:
    """Schneller deterministischer Slop-Scan ohne LLM."""
    text_lower = text.lower()
    hits = []
    for pattern in SLOP_INDICATORS:
        matches = re.findall(pattern, text_lower, re.IGNORECASE)
        if matches:
            hits.extend(matches)
    hit_count = len(hits)
    unique_hits = len(set(hits))

    # Burstiness (vereinfacht)
    sentences = [s.strip() for s in re.split(r'[.!?]+', text) if len(s.strip()) > 10]
    lengths = [len(s.split()) for s in sentences]
    if lengths:
        import statistics
        mean_len = statistics.mean(lengths)
        std_len = statistics.stdev(lengths) if len(lengths) > 1 else 0
        burstiness = round(std_len / mean_len * 10, 2) if mean_len > 0 else 0
    else:
        burstiness = 0

    # Slop-Toxizität (0-100)
    word_count = len(text.split())
    slop_density = (hit_count / max(word_count, 1)) * 100
    toxicity = min(100, int(slop_density * 10))

    return {
        "hit_count": hit_count,
        "unique_hits": unique_hits,
        "slop_hits": list(set(hits))[:10],
        "burstiness": burstiness,
        "slop_toxicity": toxicity,
        "word_count": word_count,
        "sentence_count": len(sentences),
    }


def score_lead(scan: dict, text: str) -> int:
    """Berechnet einen Lead-Score (0-100) basierend auf Slop-Toxizität und anderen Faktoren."""
    score = 0
    # Hohe Slop-Toxizität = hohe Chance auf Conversion
    score += min(40, scan["slop_toxicity"])
    # Niedrige Burstiness = monotone Copy = mehr Verbesserungspotenzial
    if scan["burstiness"] < 4:
        score += 20
    elif scan["burstiness"] < 6:
        score += 10
    # Viele Wörter = viel Copy zum Optimieren
    if scan["word_count"] > 500:
        score += 15
    elif scan["word_count"] > 200:
        score += 10
    # Viele Slop-Hits = klarer Beweis
    if scan["hit_count"] > 5:
        score += 15
    elif scan["hit_count"] > 2:
        score += 10
    # Niedrige Burstiness = KI-generiert
    if scan["burstiness"] < 3:
        score += 10
    return min(100, score)


def generate_sales_email(url: str, title: str, scan: dict, niche: str) -> str:
    """Generiert eine personalisierte Verkaufs-E-Mail."""
    hits_str = ", ".join(scan["slop_hits"][:5]) if scan["slop_hits"] else "keine"
    email = f"""Betreff: Conversion-Score für {title or url}: {max(30, 100 - scan['slop_toxicity'])}/100

Hallo,

ich habe mir {url} genauer angesehen und einen automatischen
Conversion- & Slop-Audit durchgeführt.

Die Ergebnisse:

• KI-Slop-Toxizität: {scan['slop_toxicity']}% ({scan['hit_count']} Floskeln gefunden)
• Burstiness (Satzlängen-Dynamik): {scan['burstiness']} (Ziel: ≥ 5.5)
• Wortanzahl: {scan['word_count']} Wörter analysiert
• Gefundene KI-Floskeln: {hits_str}

Ihre Seite hat Verbesserungspotenzial. Ich habe ein System,
das diese Probleme deterministisch entfernt und die Copy
auf ≥ 92 Punkte härtet.

Möchten Sie den vollständigen Audit-Report sehen?

Beste Grüße
Erik Gieske
OMEGA Master Orchestrator
https://github.com/mrmixx-max/omega-master-orchestrator
"""
    return email


def scrape_and_analyze(urls: list, niche: str = "B2B SaaS", delay: float = 1.0):
    """Scraped URLs, analysiert auf Slop und generiert E-Mails."""
    print(f"\n{'='*70}")
    print(f" OMEGA SLOP SCRAPER | {len(urls)} URLs | Nische: {niche}")
    print(f"{'='*70}\n")

    results = []
    for idx, url in enumerate(urls, 1):
        url = url.strip()
        if not url:
            continue
        print(f"[{idx}/{len(urls)}] Scraping: {url[:60]}...")

        scraped = scrape_url(url)
        if scraped["status"] == "error":
            print(f"  [!] Fehler: {scraped['error']}")
            results.append({
                "url": url, "title": "", "status": "error",
                "error": scraped["error"], "scan": None, "lead_score": 0
            })
            continue

        scan = quick_slop_scan(scraped["text"])
        lead_score = score_lead(scan, scraped["text"])
        email = generate_sales_email(url, scraped["title"], scan, niche)

        result = {
            "url": url,
            "title": scraped["title"],
            "status": "ok",
            "scan": scan,
            "lead_score": lead_score,
            "email": email,
            "timestamp": datetime.now().strftime("%Y%m%d_%H%M%S"),
        }
        results.append(result)

        print(f"  ✓ Slop: {scan['slop_toxicity']}% | Burstiness: {scan['burstiness']} | "
              f"Hits: {scan['hit_count']} | Lead-Score: {lead_score}/100")

        if delay > 0 and idx < len(urls):
            time.sleep(delay)

    # Sortiere nach Lead-Score (höchste zuerst)
    ok_results = [r for r in results if r["status"] == "ok"]
    ok_results.sort(key=lambda x: x["lead_score"], reverse=True)

    # Export
    ts = datetime.now().strftime("%Y%m%d_%H%M%S")
    json_path = SCRAPER_DIR / f"slop_leads_{ts}.json"
    csv_path = SCRAPER_DIR / f"slop_leads_{ts}.csv"
    email_dir = SCRAPER_DIR / f"emails_{ts}"
    os.makedirs(email_dir, exist_ok=True)

    # JSON export
    with open(json_path, "w", encoding="utf-8") as f:
        json.dump(results, f, ensure_ascii=False, indent=2)

    # CSV export
    with open(csv_path, "w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        writer.writerow(["rank", "url", "title", "lead_score", "slop_toxicity", "burstiness",
                        "hit_count", "word_count", "status"])
        for rank, r in enumerate(ok_results, 1):
            s = r["scan"]
            writer.writerow([rank, r["url"], r["title"], r["lead_score"],
                            s["slop_toxicity"], s["burstiness"], s["hit_count"],
                            s["word_count"], r["status"]])
        for r in results:
            if r["status"] == "error":
                writer.writerow(["-", r["url"], "", 0, 0, 0, 0, 0, "error: " + r["error"]])

    # E-Mails exportieren
    for rank, r in enumerate(ok_results, 1):
        slug = re.sub(r"[^a-zA-Z0-9]+", "_", (r["title"] or r["url"])[:30]).strip("_").lower()
        email_path = email_dir / f"{rank:03d}_{slug}.txt"
        with open(email_path, "w", encoding="utf-8") as f:
            f.write(r["email"])

    # Summary
    print(f"\n{'='*70}")
    print(f" ZUSAMMENFASSUNG")
    print(f"{'='*70}")
    print(f" URLs gescraped: {len(urls)}")
    print(f" Erfolgreich: {len(ok_results)}")
    print(f" Fehler: {len(results) - len(ok_results)}")
    if ok_results:
        avg_slop = sum(r["scan"]["slop_toxicity"] for r in ok_results) / len(ok_results)
        avg_score = sum(r["lead_score"] for r in ok_results) / len(ok_results)
        high_priority = [r for r in ok_results if r["lead_score"] >= 60]
        print(f" Durchschnittliche Slop-Toxizität: {avg_slop:.1f}%")
        print(f" Durchschnittlicher Lead-Score: {avg_score:.1f}/100")
        print(f" High-Priority Leads (≥60): {len(high_priority)}")
        print(f"\n Top 5 Leads:")
        for r in ok_results[:5]:
            print(f"  {r['lead_score']:3d}/100 | {r['scan']['slop_toxicity']:3d}% Slop | {r['url'][:50]}")
    print(f"\n JSON: {json_path}")
    print(f" CSV:  {csv_path}")
    print(f" E-Mails: {email_dir}/ ({len(ok_results)} Dateien)")
    print(f"{'='*70}\n")

    return results


def scrape_from_search(query: str, num_results: int = 20):
    """Sucht nach URLs. Hinweis: Suchmaschinen blockieren automatisierte Anfragen.
    Empfohlen: URLs manuell sammeln und via --file übergeben."""
    print(f"[*] Suche nach: {query}")
    print("  [!] Suchmaschinen blockieren automatisierte Anfragen.")
    print("  [!] Alternative: URLs manuell sammeln und via --file übergeben.")
    print("  [!] Tipp: Google 'B2B SaaS landing page' → URLs kopieren → urls.txt")
    return []


def main():
    parser = argparse.ArgumentParser(description="OMEGA Slop Scraper & Auto-Outreach Engine")
    parser.add_argument("--urls", "-u", nargs="+", help="URLs zum Scrapen")
    parser.add_argument("--file", "-f", help="Datei mit URLs (eine pro Zeile)")
    parser.add_argument("--search", "-s", help="Suchbegriff für DuckDuckGo-Suche")
    parser.add_argument("--niche", "-n", default="B2B SaaS", help="Ziel-Nische")
    parser.add_argument("--delay", "-d", type=float, default=1.0, help="Verzögerung zwischen Requests (Sekunden)")
    parser.add_argument("--auto-discover", "-a", action="store_true", help="Automatisch URLs via GitHub API finden")
    parser.add_argument("--discover-query", default="landing page saas", help="Suchbegriff für Auto-Discovery")
    parser.add_argument("--discover-num", type=int, default=20, help="Anzahl zu entdeckender URLs")
    args = parser.parse_args()

    urls = []
    if args.urls:
        urls.extend(args.urls)
    if args.file:
        with open(args.file, "r", encoding="utf-8") as f:
            urls.extend([line.strip() for line in f if line.strip()])
    if args.auto_discover:
        sys.path.insert(0, str(SKILL_DIR))
        from omega_auto_discover import discover_all
        discovered = discover_all(args.discover_query, args.discover_num)
        urls.extend(discovered)
        print(f"[+] {len(discovered)} URLs via Auto-Discovery gefunden")

    if not urls:
        print("[!] Keine URLs angegeben. Nutze --urls, --file oder --search")
        sys.exit(1)

    # Deduplicate
    seen = set()
    unique_urls = []
    for u in urls:
        if u not in seen:
            seen.add(u)
            unique_urls.append(u)

    scrape_and_analyze(unique_urls, args.niche, args.delay)


if __name__ == "__main__":
    import urllib.parse
    main()
