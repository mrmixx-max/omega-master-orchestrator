#!/usr/bin/env python3
"""
OMEGA SLOP SCRAPER v2 — Verbesserte Version
Verbesserungen:
- Bessere HTML-Text-Extraktion (verschachtelte Tags, Whitespace-Normalisierung)
- Umfassendere Slop-Patterns (30+ DE/EN)
- Paragraf-Level Burstiness (nicht nur Satz-Level)
- Verbessertes Lead-Scoring (mehr Faktoren)
- Caching (kein Re-Scraping derselben URL)
- Retry-Logik für fehlgeschlagene Requests
- URL-Normalisierung für bessere Deduplizierung
- Fortschritts-Tracking
- Bessere E-Mail-Vorlagen
- Robots.txt-Respekt
"""

import os
import sys
import csv
import json
import re
import time
import hashlib
import argparse
import urllib.request
import urllib.error
import urllib.robotparser
from datetime import datetime
from html.parser import HTMLParser
from pathlib import Path
from collections import OrderedDict

os.environ.pop("PYTHONPATH", None)

SKILL_DIR = Path(os.path.expanduser("~/.hermes/skills/omega-master"))
SCRAPER_DIR = SKILL_DIR / "scraper_leads"
CACHE_DIR = SCRAPER_DIR / "cache"
os.makedirs(SCRAPER_DIR, exist_ok=True)
os.makedirs(CACHE_DIR, exist_ok=True)

sys.path.insert(0, str(SKILL_DIR))

# ============================================================
# KONFIGURATION
# ============================================================

USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
REQUEST_TIMEOUT = 15
MAX_RETRIES = 3
RETRY_DELAY = 2
MAX_TEXT_CHARS = 10000
CACHE_TTL_HOURS = 24

# ============================================================
# VERBESSERTE SLOP-PATTERNS (DE + EN, 40+)
# ============================================================

SLOP_PATTERNS = [
    # Deutsch
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
    r"\bein stück weit\b",
    r"\bsymphonie\b",
    r"\bwandteppich\b",
    r"\bleuchtfeuer\b",
    r"\bganzheitlich(?:e|er|en)? ansatz\b",
    r"\bschlüssel zum erfolg\b",
    r"\bweichenstellend(?:e|er|en)?\b",
    r"\btransformationsprozess\b",
    r"\bwertschöpfungskette\b",
    r"\bparadigmenwechsel\b",
    r"\binnovationskraft\b",
    r"\bwettbewerbsvorteil\b",
    r"\bmarktführer(?:schaft)?\b",
    # Englisch
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
    r"\bholistic approach\b",
    r"\bgame changer\b",
    r"\bnext level\b",
    r"\bdeep dive\b",
    r"\bmove the needle\b",
    r"\blow-hanging fruit\b",
    r"\bthink outside the box\b",
    r"\bat the end of the day\b",
    r"\bin the realm of\b",
    r"\bpaving the way\b",
    r"\bfoster(?:ing)?\b",
    r"\bcatalyst for\b",
]

# ============================================================
# VERBESSERTE HTML-TEXT-EXTRAKTION
# ============================================================

class AdvancedTextExtractor(HTMLParser):
    """Verbesserte HTML-Text-Extraktion mit besserer Whitespace-Normalisierung."""

    def __init__(self):
        super().__init__()
        self.ignore_tags = {"script", "style", "noscript", "svg", "footer", "nav", "header", "meta", "link", "iframe", "form", "button"}
        self.block_tags = {"p", "div", "h1", "h2", "h3", "h4", "h5", "h6", "li", "td", "th", "article", "section", "blockquote", "pre"}
        self.ignore_depth = 0
        self.blocks = []
        self.current_block = []
        self.current_tag = ""

    def handle_starttag(self, tag, attrs):
        tag = tag.lower()
        self.current_tag = tag
        if tag in self.ignore_tags:
            self.ignore_depth += 1
        elif tag in self.block_tags and self.current_block:
            # Neuen Block starten
            text = " ".join(self.current_block).strip()
            if len(text) > 15:
                self.blocks.append(text)
            self.current_block = []

    def handle_endtag(self, tag):
        tag = tag.lower()
        if tag in self.ignore_tags and self.ignore_depth > 0:
            self.ignore_depth -= 1
        elif tag in self.block_tags and self.current_block:
            text = " ".join(self.current_block).strip()
            if len(text) > 15:
                self.blocks.append(text)
            self.current_block = []

    def handle_data(self, data):
        if self.ignore_depth > 0:
            return
        text = re.sub(r"\s+", " ", data).strip()
        if text:
            self.current_block.append(text)

    def get_text(self, max_chars=MAX_TEXT_CHARS):
        # Letzten Block hinzufügen
        if self.current_block:
            text = " ".join(self.current_block).strip()
            if len(text) > 15:
                self.blocks.append(text)
        return "\n".join(self.blocks)[:max_chars]

    def get_paragraphs(self):
        """Gibt Liste von Paragrafen zurück."""
        if self.current_block:
            text = " ".join(self.current_block).strip()
            if len(text) > 15:
                self.blocks.append(text)
        return self.blocks


# ============================================================
# URL-NORMALISIERUNG & CACHING
# ============================================================

def normalize_url(url):
    """Normalisiert eine URL für Deduplizierung."""
    url = url.strip().rstrip("/")
    # Remove tracking params
    if "?" in url:
        base, params = url.split("?", 1)
        # Keep only essential params
        url = base
    # Remove fragment
    if "#" in url:
        url = url.split("#")[0]
    # Ensure protocol
    if not url.startswith("http"):
        url = "https://" + url
    return url


def get_cache_key(url):
    return hashlib.md5(url.encode()).hexdigest()


def get_cached(url):
    """Gibt gecachte Ergebnisse zurück (wenn nicht abgelaufen)."""
    key = get_cache_key(url)
    cache_file = CACHE_DIR / f"{key}.json"
    if cache_file.exists():
        try:
            with open(cache_file, "r", encoding="utf-8") as f:
                cached = json.load(f)
            cached_time = datetime.fromisoformat(cached.get("cached_at", "2000-01-01"))
            if (datetime.now() - cached_time).total_seconds() < CACHE_TTL_HOURS * 3600:
                return cached.get("result")
        except Exception:
            pass
    return None


def set_cache(url, result):
    """Speichert Ergebnis im Cache."""
    key = get_cache_key(url)
    cache_file = CACHE_DIR / f"{key}.json"
    try:
        with open(cache_file, "w", encoding="utf-8") as f:
            json.dump({"cached_at": datetime.now().isoformat(), "result": result}, f, ensure_ascii=False)
    except Exception:
        pass


# ============================================================
# VERBESSERTE SCRAPING-FUNKTIONEN
# ============================================================

def check_robots_txt(url):
    """Prüft ob Scraping erlaubt ist."""
    try:
        parsed = urllib.parse.urlparse(url)
        robots_url = f"{parsed.scheme}://{parsed.netloc}/robots.txt"
        rp = urllib.robotparser.RobotFileParser()
        rp.set_url(robots_url)
        rp.read()
        return rp.can_fetch(USER_AGENT, url)
    except Exception:
        return True  # Im Zweifel erlauben


def scrape_url(url, respect_robots=True):
    """Scraped eine URL mit Retry-Logik und Caching."""
    url = normalize_url(url)

    # Cache prüfen
    cached = get_cached(url)
    if cached:
        cached["from_cache"] = True
        return cached

    # Robots.txt prüfen
    if respect_robots and not check_robots_txt(url):
        return {"url": url, "text": "", "title": "", "status": "blocked", "error": "robots.txt blockiert", "from_cache": False}

    result = {"url": url, "text": "", "title": "", "status": "ok", "error": "", "from_cache": False}

    for attempt in range(MAX_RETRIES):
        try:
            req = urllib.request.Request(url, headers={
                "User-Agent": USER_AGENT,
                "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
                "Accept-Language": "de,en;q=0.9",
            })
            with urllib.request.urlopen(req, timeout=REQUEST_TIMEOUT) as resp:
                content_type = resp.headers.get("Content-Type", "")
                if "text/html" not in content_type and "text/plain" not in content_type:
                    result["status"] = "error"
                    result["error"] = f"Kein HTML: {content_type}"
                    return result
                html = resp.read().decode("utf-8", errors="replace")

                parser = AdvancedTextExtractor()
                parser.feed(html)
                text = parser.get_text()

                # Title extrahieren
                title_match = re.search(r"<title[^>]*>(.*?)</title>", html, re.IGNORECASE | re.DOTALL)
                title = re.sub(r"\s+", " ", title_match.group(1)).strip() if title_match else ""

                # Meta description
                meta_desc = ""
                meta_match = re.search(r'<meta[^>]*name=["\']description["\'][^>]*content=["\']([^"\']*)["\']', html, re.IGNORECASE)
                if meta_match:
                    meta_desc = meta_match.group(1)

                result["text"] = text
                result["title"] = title
                result["meta_description"] = meta_desc
                result["paragraphs"] = parser.get_paragraphs()
                result["status"] = "ok"

                # Cache speichern
                set_cache(url, result)
                return result

        except urllib.error.HTTPError as e:
            if e.code == 404:
                result["status"] = "error"
                result["error"] = "404 Not Found"
                return result
            elif e.code == 403:
                result["status"] = "error"
                result["error"] = "403 Forbidden"
                return result
            elif attempt < MAX_RETRIES - 1:
                time.sleep(RETRY_DELAY * (attempt + 1))
            else:
                result["status"] = "error"
                result["error"] = f"HTTP {e.code}"
        except Exception as e:
            if attempt < MAX_RETRIES - 1:
                time.sleep(RETRY_DELAY * (attempt + 1))
            else:
                result["status"] = "error"
                result["error"] = str(e)

    return result


# ============================================================
# VERBESSERTE SLOP-ANALYSE
# ============================================================

def analyze_slop(text, paragraphs=None):
    """Verbesserte Slop-Analyse mit Paragraf-Level Burstiness."""
    if not text or len(text) < 50:
        return {
            "hit_count": 0, "unique_hits": 0, "slop_hits": [],
            "burstiness": 0, "slop_toxicity": 0, "word_count": 0,
            "sentence_count": 0, "paragraph_count": 0,
            "paragraph_burstiness": 0, "avg_sentence_length": 0,
            "longest_sentence": 0, "shortest_sentence": 0,
        }

    text_lower = text.lower()

    # Slop-Hits
    hits = []
    for pattern in SLOP_PATTERNS:
        matches = re.findall(pattern, text_lower, re.IGNORECASE | re.DOTALL)
        if matches:
            for m in matches:
                if isinstance(m, tuple):
                    hits.append(" ".join(m))
                else:
                    hits.append(m)
    hit_count = len(hits)
    unique_hits = len(set(h.lower() for h in hits))

    # Satz-Level Burstiness
    sentences = [s.strip() for s in re.split(r'[.!?]+', text) if len(s.strip()) > 10]
    lengths = [len(s.split()) for s in sentences]
    if lengths:
        import statistics
        mean_len = statistics.mean(lengths)
        std_len = statistics.stdev(lengths) if len(lengths) > 1 else 0
        burstiness = round(std_len / mean_len * 10, 2) if mean_len > 0 else 0
        avg_sentence_length = round(mean_len, 1)
        longest_sentence = max(lengths)
        shortest_sentence = min(lengths)
    else:
        burstiness = 0
        avg_sentence_length = 0
        longest_sentence = 0
        shortest_sentence = 0

    # Paragraf-Level Burstiness
    if paragraphs and len(paragraphs) > 1:
        para_lengths = [len(p.split()) for p in paragraphs]
        if para_lengths:
            import statistics
            para_mean = statistics.mean(para_lengths)
            para_std = statistics.stdev(para_lengths) if len(para_lengths) > 1 else 0
            paragraph_burstiness = round(para_std / para_mean * 10, 2) if para_mean > 0 else 0
        else:
            paragraph_burstiness = 0
    else:
        paragraph_burstiness = burstiness

    word_count = len(text.split())

    # Slop-Toxizität (verbessert: berücksichtigt auch Wortdichte)
    slop_density = (hit_count / max(word_count, 1)) * 100
    toxicity = min(100, int(slop_density * 10))

    # Bonus: Wenn sehr niedrige Burstiness, erhöhe Toxizität
    if burstiness < 3:
        toxicity = min(100, toxicity + 20)
    elif burstiness < 4:
        toxicity = min(100, toxicity + 10)

    return {
        "hit_count": hit_count,
        "unique_hits": unique_hits,
        "slop_hits": list(set(hits))[:15],
        "burstiness": burstiness,
        "paragraph_burstiness": paragraph_burstiness,
        "slop_toxicity": toxicity,
        "word_count": word_count,
        "sentence_count": len(sentences),
        "paragraph_count": len(paragraphs) if paragraphs else 0,
        "avg_sentence_length": avg_sentence_length,
        "longest_sentence": longest_sentence,
        "shortest_sentence": shortest_sentence,
    }


# ============================================================
# VERBESSERTES LEAD-SCORING
# ============================================================

def score_lead(scan, text, title=""):
    """Verbessertes Lead-Scoring mit mehr Faktoren."""
    score = 0
    reasons = []

    # 1. Slop-Toxizität (max 40)
    tox = scan["slop_toxicity"]
    if tox >= 50:
        score += 40
        reasons.append("Hohe Slop-Toxizität")
    elif tox >= 30:
        score += 30
        reasons.append("Mittlere Slop-Toxizität")
    elif tox >= 10:
        score += 15
        reasons.append("Niedrige Slop-Toxizität")
    else:
        score += 5

    # 2. Niedrige Burstiness (max 20)
    burst = scan["burstiness"]
    if burst < 3:
        score += 20
        reasons.append("Sehr monotone Satzstruktur (KI-verdächtig)")
    elif burst < 4:
        score += 15
        reasons.append("Monotone Satzstruktur")
    elif burst < 5.5:
        score += 10
        reasons.append("Leicht monotone Satzstruktur")
    else:
        score += 3

    # 3. Viel Copy = viel Optimierungspotenzial (max 15)
    wc = scan["word_count"]
    if wc > 1000:
        score += 15
        reasons.append("Viel Copy zum Optimieren")
    elif wc > 500:
        score += 12
    elif wc > 200:
        score += 8
    else:
        score += 3

    # 4. Viele Slop-Hits = klarer Beweis (max 15)
    hits = scan["hit_count"]
    if hits > 10:
        score += 15
        reasons.append(f"Viele KI-Floskeln ({hits})")
    elif hits > 5:
        score += 12
    elif hits > 2:
        score += 8
    elif hits > 0:
        score += 4

    # 5. Titel vorhanden = echte Website (max 5)
    if title and len(title) > 5:
        score += 5

    # 6. Paragraf-Level Burstiness (max 5)
    para_burst = scan.get("paragraph_burstiness", 0)
    if para_burst < 3:
        score += 5
        reasons.append("Monotone Absatzstruktur")

    return min(100, score), reasons


# ============================================================
# VERBESSERTER E-MAIL-GENERATOR
# ============================================================

def generate_sales_email(url, title, scan, niche, reasons=None):
    """Verbesserter E-Mail-Generator mit mehr Personalisierung."""
    hits_str = ", ".join(f"'{h}'" for h in scan["slop_hits"][:5]) if scan["slop_hits"] else "keine gefunden"
    score = max(30, 100 - scan["slop_toxicity"])
    reasons_str = "\n".join(f"  • {r}" for r in (reasons or [])) if reasons else "  • Allgemeine Optimierungsmöglichkeiten"

    email = f"""Betreff: Conversion-Score für {title or url}: {score}/100

Hallo,

ich habe mir {url} genauer angesehen und einen automatischen
Conversion- & Slop-Audit durchgeführt.

Die Ergebnisse:

• KI-Slop-Toxizität: {scan['slop_toxicity']}% ({scan['hit_count']} Floskeln gefunden)
• Burstiness (Satzlängen-Dynamik): {scan['burstiness']} (Ziel: ≥ 5.5)
• Paragraf-Burstiness: {scan.get('paragraph_burstiness', 'N/A')}
• Wortanzahl: {scan['word_count']} Wörter analysiert
• Durchschnittliche Satzlänge: {scan.get('avg_sentence_length', 'N/A')} Wörter

Gefundene KI-Floskeln: {hits_str}

Warum diese Seite ein Kandidat ist:
{reasons_str}

Ich habe ein System, das diese Probleme deterministisch entfernt
und die Copy auf ≥ 92 Punkte härtet.

Möchten Sie den vollständigen Audit-Report sehen?

Beste Grüße
Erik Gieske
OMEGA Master Orchestrator
https://github.com/mrmixx-max/omega-master-orchestrator
"""
    return email


# ============================================================
# HAUPT-SCRAPING-FUNKTION
# ============================================================

def scrape_and_analyze(urls, niche="B2B SaaS", delay=1.0, respect_robots=True):
    """Scraped URLs, analysiert auf Slop und generiert E-Mails."""
    print(f"\n{'='*70}")
    print(f" OMEGA SLOP SCRAPER v2 | {len(urls)} URLs | Nische: {niche}")
    print(f"{'='*70}\n")

    results = []
    cached_count = 0

    for idx, url in enumerate(urls, 1):
        url = normalize_url(url)
        print(f"[{idx}/{len(urls)}] Scraping: {url[:60]}...")

        scraped = scrape_url(url, respect_robots=respect_robots)
        if scraped.get("from_cache"):
            cached_count += 1

        if scraped["status"] == "error":
            print(f"  [!] Fehler: {scraped['error']}")
            results.append({
                "url": url, "title": "", "status": "error",
                "error": scraped["error"], "scan": None, "lead_score": 0,
                "reasons": [], "from_cache": scraped.get("from_cache", False)
            })
            continue
        if scraped["status"] == "blocked":
            print(f"  [!] Blockiert: {scraped['error']}")
            results.append({
                "url": url, "title": scraped.get("title", ""), "status": "blocked",
                "error": scraped["error"], "scan": None, "lead_score": 0,
                "reasons": [], "from_cache": False
            })
            continue

        scan = analyze_slop(scraped["text"], scraped.get("paragraphs"))
        lead_score, reasons = score_lead(scan, scraped["text"], scraped.get("title", ""))
        email = generate_sales_email(url, scraped.get("title", ""), scan, niche, reasons)

        result = {
            "url": url,
            "title": scraped.get("title", ""),
            "meta_description": scraped.get("meta_description", ""),
            "status": "ok",
            "scan": scan,
            "lead_score": lead_score,
            "reasons": reasons,
            "email": email,
            "from_cache": scraped.get("from_cache", False),
            "timestamp": datetime.now().strftime("%Y%m%d_%H%M%S"),
        }
        results.append(result)

        cache_indicator = " (cache)" if scraped.get("from_cache") else ""
        print(f"  ✓ Slop: {scan['slop_toxicity']}% | Burstiness: {scan['burstiness']} | "
              f"Hits: {scan['hit_count']} | Score: {lead_score}/100{cache_indicator}")

        if delay > 0 and idx < len(urls) and not scraped.get("from_cache"):
            time.sleep(delay)

    # Sortiere nach Lead-Score
    ok_results = [r for r in results if r["status"] == "ok"]
    ok_results.sort(key=lambda x: x["lead_score"], reverse=True)

    # Export
    ts = datetime.now().strftime("%Y%m%d_%H%M%S")
    json_path = SCRAPER_DIR / f"slop_leads_{ts}.json"
    csv_path = SCRAPER_DIR / f"slop_leads_{ts}.csv"
    email_dir = SCRAPER_DIR / f"emails_{ts}"
    os.makedirs(email_dir, exist_ok=True)

    # JSON
    with open(json_path, "w", encoding="utf-8") as f:
        json.dump(results, f, ensure_ascii=False, indent=2)

    # CSV
    with open(csv_path, "w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        writer.writerow(["rank", "url", "title", "lead_score", "slop_toxicity", "burstiness",
                        "para_burstiness", "hit_count", "word_count", "avg_sentence_len",
                        "from_cache", "status"])
        for rank, r in enumerate(ok_results, 1):
            s = r["scan"]
            writer.writerow([rank, r["url"], r["title"], r["lead_score"],
                            s["slop_toxicity"], s["burstiness"], s.get("paragraph_burstiness", 0),
                            s["hit_count"], s["word_count"], s.get("avg_sentence_length", 0),
                            r["from_cache"], r["status"]])
        for r in results:
            if r["status"] in ("error", "blocked"):
                writer.writerow(["-", r["url"], r.get("title", ""), 0, 0, 0, 0, 0, 0, 0, False, r["status"]])

    # E-Mails
    for rank, r in enumerate(ok_results, 1):
        slug = re.sub(r"[^a-zA-Z0-9]+", "_", (r["title"] or r["url"])[:30]).strip("_").lower()
        email_path = email_dir / f"{rank:03d}_{slug}.txt"
        with open(email_path, "w", encoding="utf-8") as f:
            f.write(r["email"])

    # Summary
    print(f"\n{'='*70}")
    print(f" ZUSAMMENFASSUNG v2")
    print(f"{'='*70}")
    print(f" URLs gescraped: {len(urls)}")
    print(f" Erfolgreich: {len(ok_results)}")
    print(f" Fehler: {len([r for r in results if r['status'] == 'error'])}")
    print(f" Blockiert (robots.txt): {len([r for r in results if r['status'] == 'blocked'])}")
    print(f" Aus Cache: {cached_count}")
    if ok_results:
        avg_slop = sum(r["scan"]["slop_toxicity"] for r in ok_results) / len(ok_results)
        avg_score = sum(r["lead_score"] for r in ok_results) / len(ok_results)
        avg_burst = sum(r["scan"]["burstiness"] for r in ok_results) / len(ok_results)
        high_priority = [r for r in ok_results if r["lead_score"] >= 60]
        print(f" Durchschnittliche Slop-Toxizität: {avg_slop:.1f}%")
        print(f" Durchschnittlicher Lead-Score: {avg_score:.1f}/100")
        print(f" Durchschnittliche Burstiness: {avg_burst:.1f}")
        print(f" High-Priority Leads (≥60): {len(high_priority)}")
        print(f"\n Top 5 Leads:")
        for r in ok_results[:5]:
            print(f"  {r['lead_score']:3d}/100 | {r['scan']['slop_toxicity']:3d}% Slop | "
                  f"Burst: {r['scan']['burstiness']:4.1f} | {r['url'][:50]}")
    print(f"\n JSON: {json_path}")
    print(f" CSV:  {csv_path}")
    print(f" E-Mails: {email_dir}/ ({len(ok_results)} Dateien)")
    print(f"{'='*70}\n")

    return results


# ============================================================
# CLI
# ============================================================

def main():
    parser = argparse.ArgumentParser(description="OMEGA Slop Scraper v2 — Verbesserte Version")
    parser.add_argument("--urls", "-u", nargs="+", help="URLs zum Scrapen")
    parser.add_argument("--file", "-f", help="Datei mit URLs (eine pro Zeile)")
    parser.add_argument("--auto-discover", "-a", action="store_true", help="Automatisch URLs finden")
    parser.add_argument("--discover-query", default="landing page", help="Suchbegriff für Auto-Discovery")
    parser.add_argument("--discover-num", type=int, default=8, help="Anzahl zu entdeckender URLs")
    parser.add_argument("--niche", "-n", default="B2B SaaS", help="Ziel-Nische")
    parser.add_argument("--delay", "-d", type=float, default=1.0, help="Verzögerung zwischen Requests")
    parser.add_argument("--no-robots", action="store_true", help="robots.txt ignorieren")
    parser.add_argument("--clear-cache", action="store_true", help="Cache leeren")
    args = parser.parse_args()

    if args.clear_cache:
        import shutil
        if CACHE_DIR.exists():
            shutil.rmtree(CACHE_DIR)
            os.makedirs(CACHE_DIR)
        print("[+] Cache geleert")
        return

    urls = []
    if args.urls:
        urls.extend(args.urls)
    if args.file:
        with open(args.file, "r", encoding="utf-8") as f:
            urls.extend([line.strip() for line in f if line.strip() and not line.startswith("#")])
    if args.auto_discover:
        sys.path.insert(0, str(SKILL_DIR))
        from omega_auto_discover import discover_all_v3
        discovered = discover_all_v3(args.discover_query, args.discover_num)
        urls.extend(discovered)
        print(f"[+] {len(discovered)} URLs via Auto-Discovery gefunden")

    # Normalisieren und deduplizieren
    seen = set()
    unique_urls = []
    for u in urls:
        nu = normalize_url(u)
        if nu not in seen:
            seen.add(nu)
            unique_urls.append(nu)

    if not unique_urls:
        print("[!] Keine URLs angegeben. Nutze --urls, --file oder --auto-discover")
        sys.exit(1)

    scrape_and_analyze(unique_urls, args.niche, args.delay, respect_robots=not args.no_robots)


if __name__ == "__main__":
    main()
