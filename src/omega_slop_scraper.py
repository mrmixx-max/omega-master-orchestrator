#!/usr/bin/env python3
"""
OMEGA SLOP SCRAPER v3 — Weiter verbessert
Neue Features:
- Parallele Verarbeitung (ThreadPoolExecutor)
- Open Graph / Meta-Tag-Extraktion
- Heading-Struktur (H1-H6)
- CTA-Erkennung (Buttons, Links)
- Response-Zeit-Messung
- SSL/HTTPS-Prüfung
- E-Mail-Extraktion aus Seiten
- Social-Media-Link-Extraktion
- Formular-Erkennung
- Verbesserter Progress-Bar (CLI)
- Detailliertere HTML-Reports
"""

import os
import sys
import csv
import json
import re
import time
import hashlib
import argparse
import ssl
import socket
import urllib.request
import urllib.error
import urllib.robotparser
import urllib.parse
from datetime import datetime
from html.parser import HTMLParser
from pathlib import Path
from collections import OrderedDict
from concurrent.futures import ThreadPoolExecutor, as_completed

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
MAX_WORKERS = 4
SLOP_PATTERNS = [
    r"\bin der heutigen schnelllebigen welt\b", r"\bin einer welt,? in der\b",
    r"\bzusammenfassend lässt sich sagen\b", r"\bes ist wichtig zu beachten\b",
    r"\bes lässt sich nicht leugnen\b", r"\bein entscheidender faktor\b",
    r"\bnicht nur\b.*?\bsondern auch\b", r"\beintauchen in\b",
    r"\bnahtlos(?:e|en|er)?\b", r"\bgame-?changer\b", r"\brevolutionier(?:en|t)\b",
    r"\bauf das nächste level\b", r"\bein stück weit\b", r"\bsymphonie\b",
    r"\bwandteppich\b", r"\bleuchtfeuer\b", r"\bganzheitlich(?:e|er|en)? ansatz\b",
    r"\bschlüssel zum erfolg\b", r"\bweichenstellend(?:e|er|en)?\b",
    r"\btransformationsprozess\b", r"\bwertschöpfungskette\b",
    r"\bparadigmenwechsel\b", r"\binnovationskraft\b", r"\bwettbewerbsvorteil\b",
    r"\bmarktführer(?:schaft)?\b", r"\bin today's fast-paced world\b",
    r"\bdelve into\b", r"\btapestry\b", r"\btestament to\b",
    r"\bunlock the potential\b", r"\bit is important to note\b",
    r"\bseamless(?:ly)?\b", r"\bcutting-edge\b", r"\bstate-of-the-art\b",
    r"\brobust solution\b", r"\bempower(?:ing|ed)?\b", r"\bleverage\b",
    r"\bsynergy\b", r"\bparadigm shift\b", r"\bholistic approach\b",
    r"\bgame changer\b", r"\bnext level\b", r"\bdeep dive\b",
    r"\bmove the needle\b", r"\blow-hanging fruit\b", r"\bthink outside the box\b",
    r"\bat the end of the day\b", r"\bin the realm of\b", r"\bpaving the way\b",
    r"\bfoster(?:ing)?\b", r"\bcatalyst for\b",
]

CTA_PATTERNS = [
    r"\bjetzt (?:kaufen|bestellen|anmelden|registrieren|starten|testen|kontaktieren)\b",
    r"\bget started\b", r"\bsign up\b", r"\btry (?:it )?free\b",
    r"\bbuy now\b", r"\border now\b", r"\blearn more\b",
    r"\bcontact us\b", r"\brequest (?:a )?demo\b", r"\bfree trial\b",
    r"\bjetzt (?:loslegen|beginnen|ausprobieren)\b",
    r"\bkostenlos (?:testen|starten|anmelden)\b",
]

EMAIL_PATTERN = re.compile(r"[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}")
SOCIAL_PATTERNS = {
    "twitter": re.compile(r"https?://(?:www\.)?(?:twitter|x)\.com/[\w]+"),
    "linkedin": re.compile(r"https?://(?:www\.)?linkedin\.com/(?:company|in)/[\w-]+"),
    "facebook": re.compile(r"https?://(?:www\.)?facebook\.com/[\w.]+"),
    "instagram": re.compile(r"https?://(?:www\.)?instagram\.com/[\w.]+"),
    "youtube": re.compile(r"https?://(?:www\.)?youtube\.com/(?:channel|c|@)[\w-]+"),
    "github": re.compile(r"https?://(?:www\.)?github\.com/[\w-]+"),
}


# ============================================================
# ERWEITERTE HTML-EXTRAKTION
# ============================================================

class V3TextExtractor(HTMLParser):
    """Erweiterte HTML-Extraktion mit Meta-Tags, Headings, CTAs, etc."""

    def __init__(self):
        super().__init__()
        self.ignore_tags = {"script", "style", "noscript", "svg", "footer", "nav", "header", "meta", "link", "iframe", "form", "button", "input", "select", "textarea"}
        self.block_tags = {"p", "div", "h1", "h2", "h3", "h4", "h5", "h6", "li", "td", "th", "article", "section", "blockquote", "pre", "span", "a"}
        self.ignore_depth = 0
        self.blocks = []
        self.current_block = []
        self.current_tag = ""
        self.headings = []
        self.ctas = []
        self.meta_tags = {}
        self.og_tags = {}
        self.links = {"internal": [], "external": []}
        self.emails = set()
        self.social_links = {}
        self.has_viewport = False
        self.has_ssl = None

    def handle_starttag(self, tag, attrs):
        tag = tag.lower()
        self.current_tag = tag
        attrs_dict = {k.lower(): v for k, v in attrs}

        if tag in self.ignore_tags:
            self.ignore_depth += 1
            return

        # Meta tags
        if tag == "meta":
            name = attrs_dict.get("name", "").lower()
            prop = attrs_dict.get("property", "").lower()
            content = attrs_dict.get("content", "")
            if name:
                self.meta_tags[name] = content
            if prop.startswith("og:"):
                self.og_tags[prop] = content
            if name == "viewport":
                self.has_viewport = True

        # Headings
        if tag in ("h1", "h2", "h3", "h4", "h5", "h6"):
            pass  # Text wird in handle_data erfasst

        # Links
        if tag == "a":
            href = attrs_dict.get("href", "")
            if href:
                text = ""  # Wird in handle_data gefüllt
                self._current_link = href

        if tag in self.block_tags and self.current_block:
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
                # Check for headings
                if self.current_tag in ("h1", "h2", "h3", "h4", "h5", "h6"):
                    self.headings.append({"level": self.current_tag, "text": text})
                # Check for CTAs
                for pattern in CTA_PATTERNS:
                    if re.search(pattern, text, re.IGNORECASE):
                        self.ctas.append(text)
                        break
            self.current_block = []

    def handle_data(self, data):
        if self.ignore_depth > 0:
            return
        text = re.sub(r"\s+", " ", data).strip()
        if text:
            self.current_block.append(text)
            # E-Mails extrahieren
            for email in EMAIL_PATTERN.findall(text):
                self.emails.add(email)
            # Social Links extrahieren
            for platform, pattern in SOCIAL_PATTERNS.items():
                for match in pattern.findall(text):
                    if platform not in self.social_links:
                        self.social_links[platform] = set()
                    self.social_links[platform].add(match)

    def get_text(self, max_chars=MAX_TEXT_CHARS):
        if self.current_block:
            text = " ".join(self.current_block).strip()
            if len(text) > 15:
                self.blocks.append(text)
        return "\n".join(self.blocks)[:max_chars]

    def get_paragraphs(self):
        if self.current_block:
            text = " ".join(self.current_block).strip()
            if len(text) > 15:
                self.blocks.append(text)
        return self.blocks


# ============================================================
# HILFSFUNKTIONEN
# ============================================================

def normalize_url(url):
    url = url.strip().rstrip("/")
    if "?" in url:
        url = url.split("?")[0]
    if "#" in url:
        url = url.split("#")[0]
    if not url.startswith("http"):
        url = "https://" + url
    return url


def get_cache_key(url):
    return hashlib.md5(url.encode()).hexdigest()


def get_cached(url):
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
    key = get_cache_key(url)
    cache_file = CACHE_DIR / f"{key}.json"
    try:
        with open(cache_file, "w", encoding="utf-8") as f:
            json.dump({"cached_at": datetime.now().isoformat(), "result": result}, f, ensure_ascii=False)
    except Exception:
        pass


def check_robots_txt(url):
    try:
        parsed = urllib.parse.urlparse(url)
        robots_url = f"{parsed.scheme}://{parsed.netloc}/robots.txt"
        rp = urllib.robotparser.RobotFileParser()
        rp.set_url(robots_url)
        rp.read()
        return rp.can_fetch(USER_AGENT, url)
    except Exception:
        return True


def check_ssl(url):
    """Prüft ob die Seite HTTPS verwendet und das Zertifikat gültig ist."""
    parsed = urllib.parse.urlparse(url)
    if parsed.scheme != "https":
        return {"https": False, "valid_cert": False, "reason": "Kein HTTPS"}
    try:
        ctx = ssl.create_default_context()
        with socket.create_connection((parsed.netloc, 443), timeout=5) as sock:
            with ctx.wrap_socket(sock, server_hostname=parsed.netloc) as ssock:
                cert = ssock.getpeercert()
                return {"https": True, "valid_cert": True, "reason": "Gültig"}
    except ssl.SSLError as e:
        return {"https": True, "valid_cert": False, "reason": str(e)}
    except Exception as e:
        return {"https": True, "valid_cert": False, "reason": str(e)}


def scrape_url(url, respect_robots=True):
    """Scraped eine URL mit erweiterten Metadaten."""
    url = normalize_url(url)

    cached = get_cached(url)
    if cached:
        cached["from_cache"] = True
        return cached

    if respect_robots and not check_robots_txt(url):
        return {"url": url, "text": "", "title": "", "status": "blocked", "error": "robots.txt blockiert", "from_cache": False}

    result = {"url": url, "text": "", "title": "", "status": "ok", "error": "", "from_cache": False}
    ssl_info = check_ssl(url)
    result["ssl"] = ssl_info

    for attempt in range(MAX_RETRIES):
        try:
            start_time = time.time()
            req = urllib.request.Request(url, headers={
                "User-Agent": USER_AGENT,
                "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
                "Accept-Language": "de,en;q=0.9",
            })
            with urllib.request.urlopen(req, timeout=REQUEST_TIMEOUT) as resp:
                response_time = round((time.time() - start_time) * 1000)
                content_type = resp.headers.get("Content-Type", "")
                if "text/html" not in content_type and "text/plain" not in content_type:
                    result["status"] = "error"
                    result["error"] = f"Kein HTML: {content_type}"
                    return result

                html = resp.read().decode("utf-8", errors="replace")
                response_time = round((time.time() - start_time) * 1000)

                parser = V3TextExtractor()
                parser.feed(html)
                text = parser.get_text()

                title_match = re.search(r"<title[^>]*>(.*?)</title>", html, re.IGNORECASE | re.DOTALL)
                title = re.sub(r"\s+", " ", title_match.group(1)).strip() if title_match else ""

                # Meta description
                meta_desc = ""
                meta_match = re.search(r'<meta[^>]*name=["\']description["\'][^>]*content=["\']([^"\']*)["\']', html, re.IGNORECASE)
                if meta_match:
                    meta_desc = meta_match.group(1)

                # Open Graph tags
                og = {}
                for match in re.finditer(r'<meta[^>]*property=["\'](og:[^"\']*)["\'][^>]*content=["\']([^"\']*)["\']', html, re.IGNORECASE):
                    og[match.group(1)] = match.group(2)

                result.update({
                    "text": text,
                    "title": title or og.get("og:title", ""),
                    "meta_description": meta_desc or og.get("og:description", ""),
                    "og_image": og.get("og:image", ""),
                    "headings": parser.headings,
                    "ctas": parser.ctas,
                    "paragraphs": parser.get_paragraphs(),
                    "emails": list(parser.emails),
                    "social_links": {k: list(v) for k, v in parser.social_links.items()},
                    "has_viewport": parser.has_viewport,
                    "response_time_ms": response_time,
                    "content_length": len(html),
                    "status": "ok",
                })

                set_cache(url, result)
                return result

        except urllib.error.HTTPError as e:
            if e.code == 404:
                result["status"] = "error"; result["error"] = "404 Not Found"; return result
            elif e.code == 403:
                result["status"] = "error"; result["error"] = "403 Forbidden"; return result
            elif attempt < MAX_RETRIES - 1:
                time.sleep(RETRY_DELAY * (attempt + 1))
            else:
                result["status"] = "error"; result["error"] = f"HTTP {e.code}"
        except Exception as e:
            if attempt < MAX_RETRIES - 1:
                time.sleep(RETRY_DELAY * (attempt + 1))
            else:
                result["status"] = "error"; result["error"] = str(e)

    return result


# ============================================================
# ANALYSE & SCORING (wiederverwendet aus v2)
# ============================================================

def analyze_slop(text, paragraphs=None):
    """Slop-Analyse (identisch zu v2)."""
    if not text or len(text) < 50:
        return {"hit_count": 0, "unique_hits": 0, "slop_hits": [], "burstiness": 0,
                "slop_toxicity": 0, "word_count": 0, "sentence_count": 0, "paragraph_count": 0,
                "paragraph_burstiness": 0, "avg_sentence_length": 0, "longest_sentence": 0, "shortest_sentence": 0}
    text_lower = text.lower()
    hits = []
    for pattern in SLOP_PATTERNS:
        matches = re.findall(pattern, text_lower, re.IGNORECASE | re.DOTALL)
        if matches:
            for m in matches:
                hits.append(m if isinstance(m, str) else " ".join(m))
    hit_count = len(hits)
    unique_hits = len(set(h.lower() for h in hits))
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
        burstiness = 0; avg_sentence_length = 0; longest_sentence = 0; shortest_sentence = 0
    if paragraphs and len(paragraphs) > 1:
        para_lengths = [len(p.split()) for p in paragraphs]
        if para_lengths:
            import statistics
            para_mean = statistics.mean(para_lengths)
            para_std = statistics.stdev(para_lengths) if len(para_lengths) > 1 else 0
            paragraph_burstiness = round(para_std / para_mean * 10, 2) if para_mean > 0 else 0
        else:
            paragraph_burstiness = burstiness
    else:
        paragraph_burstiness = burstiness
    word_count = len(text.split())
    slop_density = (hit_count / max(word_count, 1)) * 100
    toxicity = min(100, int(slop_density * 10))
    if burstiness < 3:
        toxicity = min(100, toxicity + 20)
    elif burstiness < 4:
        toxicity = min(100, toxicity + 10)
    return {"hit_count": hit_count, "unique_hits": unique_hits, "slop_hits": list(set(hits))[:15],
            "burstiness": burstiness, "paragraph_burstiness": paragraph_burstiness,
            "slop_toxicity": toxicity, "word_count": word_count, "sentence_count": len(sentences),
            "paragraph_count": len(paragraphs) if paragraphs else 0,
            "avg_sentence_length": avg_sentence_length, "longest_sentence": longest_sentence,
            "shortest_sentence": shortest_sentence}


def score_lead(scan, text, title="", scraped_data=None):
    """Verbessertes Lead-Scoring mit mehr Faktoren."""
    score = 0
    reasons = []
    tox = scan["slop_toxicity"]
    if tox >= 50: score += 40; reasons.append("Hohe Slop-Toxizität")
    elif tox >= 30: score += 30; reasons.append("Mittlere Slop-Toxizität")
    elif tox >= 10: score += 15; reasons.append("Niedrige Slop-Toxizität")
    else: score += 5
    burst = scan["burstiness"]
    if burst < 3: score += 20; reasons.append("Sehr monotone Satzstruktur (KI-verdächtig)")
    elif burst < 4: score += 15; reasons.append("Monotone Satzstruktur")
    elif burst < 5.5: score += 10; reasons.append("Leicht monotone Satzstruktur")
    else: score += 3
    wc = scan["word_count"]
    if wc > 1000: score += 15; reasons.append("Viel Copy zum Optimieren")
    elif wc > 500: score += 12
    elif wc > 200: score += 8
    else: score += 3
    hits = scan["hit_count"]
    if hits > 10: score += 15; reasons.append(f"Viele KI-Floskeln ({hits})")
    elif hits > 5: score += 12
    elif hits > 2: score += 8
    elif hits > 0: score += 4
    if title and len(title) > 5: score += 5
    if scan.get("paragraph_burstiness", 0) < 3: score += 5; reasons.append("Monotone Absatzstruktur")
    # Neue Faktoren
    if scraped_data:
        if not scraped_data.get("ssl", {}).get("https", True):
            score += 5; reasons.append("Kein HTTPS (Sicherheitsproblem)")
        if not scraped_data.get("has_viewport", True):
            score += 5; reasons.append("Nicht mobile-optimiert")
        if scraped_data.get("response_time_ms", 0) > 3000:
            score += 3; reasons.append("Langsame Ladezeit")
        if not scraped_data.get("ctas"):
            score += 5; reasons.append("Keine Call-to-Action gefunden")
        if not scraped_data.get("emails"):
            score += 3; reasons.append("Keine Kontakt-E-Mail gefunden")
    return min(100, score), reasons


def generate_sales_email(url, title, scan, niche, reasons=None, scraped_data=None):
    """Erweiterter E-Mail-Generator."""
    hits_str = ", ".join(f"'{h}'" for h in scan["slop_hits"][:5]) if scan["slop_hits"] else "keine gefunden"
    score = max(30, 100 - scan["slop_toxicity"])
    reasons_str = "\n".join(f"  • {r}" for r in (reasons or [])) if reasons else "  • Allgemeine Optimierungsmöglichkeiten"
    extra = ""
    if scraped_data:
        if scraped_data.get("ctas"):
            extra += f"\nGefundene CTAs: {', '.join(scraped_data['ctas'][:3])}"
        if scraped_data.get("emails"):
            extra += f"\nGefundene E-Mails: {', '.join(scraped_data['emails'][:2])}"
        if scraped_data.get("social_links"):
            platforms = list(scraped_data["social_links"].keys())
            if platforms:
                extra += f"\nSocial Media: {', '.join(platforms)}"
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
• HTTPS: {'Ja' if scraped_data and scraped_data.get('ssl', {}).get('https') else 'Nein'}
• Ladezeit: {scraped_data.get('response_time_ms', 'N/A') if scraped_data else 'N/A'}ms
• Mobile-optimiert: {'Ja' if scraped_data and scraped_data.get('has_viewport') else 'Nein'}

Gefundene KI-Floskeln: {hits_str}
{extra}

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
# PARALLELE SCRAPING-FUNKTION
# ============================================================

def scrape_and_analyze(urls, niche="B2B SaaS", delay=1.0, respect_robots=True, max_workers=MAX_WORKERS):
    """Scraped URLs parallel und analysiert auf Slop."""
    print(f"\n{'='*70}")
    print(f" OMEGA SLOP SCRAPER v3 | {len(urls)} URLs | {max_workers} Worker | Nische: {niche}")
    print(f"{'='*70}\n")

    results = []
    completed = 0

    def process_url(url):
        nonlocal completed
        scraped = scrape_url(url, respect_robots=respect_robots)
        if scraped["status"] == "error":
            return {"url": url, "title": "", "status": "error", "error": scraped["error"],
                    "scan": None, "lead_score": 0, "reasons": [], "from_cache": scraped.get("from_cache", False)}
        if scraped["status"] == "blocked":
            return {"url": url, "title": scraped.get("title", ""), "status": "blocked",
                    "error": scraped["error"], "scan": None, "lead_score": 0, "reasons": [], "from_cache": False}
        scan = analyze_slop(scraped["text"], scraped.get("paragraphs"))
        lead_score, reasons = score_lead(scan, scraped["text"], scraped.get("title", ""), scraped)
        email = generate_sales_email(url, scraped.get("title", ""), scan, niche, reasons, scraped)
        completed += 1
        cache_indicator = " (cache)" if scraped.get("from_cache") else ""
        print(f"  [{completed}/{len(urls)}] ✓ {lead_score:3d}/100 | Slop: {scan['slop_toxicity']:3d}% | "
              f"Burst: {scan['burstiness']:4.1f} | {url[:45]}{cache_indicator}")
        return {"url": url, "title": scraped.get("title", ""), "meta_description": scraped.get("meta_description", ""),
                "status": "ok", "scan": scan, "lead_score": lead_score, "reasons": reasons, "email": email,
                "scraped_data": scraped, "from_cache": scraped.get("from_cache", False),
                "timestamp": datetime.now().strftime("%Y%m%d_%H%M%S")}

    with ThreadPoolExecutor(max_workers=max_workers) as executor:
        future_to_url = {executor.submit(process_url, url): url for url in urls}
        for future in as_completed(future_to_url):
            try:
                result = future.result()
                results.append(result)
            except Exception as e:
                url = future_to_url[future]
                results.append({"url": url, "title": "", "status": "error", "error": str(e),
                                "scan": None, "lead_score": 0, "reasons": [], "from_cache": False})

    ok_results = [r for r in results if r["status"] == "ok"]
    ok_results.sort(key=lambda x: x["lead_score"], reverse=True)

    # Export
    ts = datetime.now().strftime("%Y%m%d_%H%M%S")
    json_path = SCRAPER_DIR / f"slop_leads_{ts}.json"
    csv_path = SCRAPER_DIR / f"slop_leads_{ts}.csv"
    email_dir = SCRAPER_DIR / f"emails_{ts}"
    os.makedirs(email_dir, exist_ok=True)

    with open(json_path, "w", encoding="utf-8") as f:
        json.dump(results, f, ensure_ascii=False, indent=2)

    with open(csv_path, "w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        writer.writerow(["rank", "url", "title", "lead_score", "slop_toxicity", "burstiness",
                        "para_burstiness", "hit_count", "word_count", "avg_sentence_len",
                        "https", "response_ms", "mobile", "ctas", "emails_found", "from_cache", "status"])
        for rank, r in enumerate(ok_results, 1):
            s = r["scan"]; sd = r.get("scraped_data", {})
            writer.writerow([rank, r["url"], r["title"], r["lead_score"], s["slop_toxicity"],
                            s["burstiness"], s.get("paragraph_burstiness", 0), s["hit_count"],
                            s["word_count"], s.get("avg_sentence_length", 0),
                            "Ja" if sd.get("ssl", {}).get("https") else "Nein",
                            sd.get("response_time_ms", 0), "Ja" if sd.get("has_viewport") else "Nein",
                            len(sd.get("ctas", [])), len(sd.get("emails", [])), r["from_cache"], r["status"]])
        for r in results:
            if r["status"] in ("error", "blocked"):
                writer.writerow(["-", r["url"], r.get("title", ""), 0, 0, 0, 0, 0, 0, 0, "", 0, "", 0, 0, False, r["status"]])

    for rank, r in enumerate(ok_results, 1):
        slug = re.sub(r"[^a-zA-Z0-9]+", "_", (r["title"] or r["url"])[:30]).strip("_").lower()
        email_path = email_dir / f"{rank:03d}_{slug}.txt"
        with open(email_path, "w", encoding="utf-8") as f:
            f.write(r["email"])

    # HTML Report generieren
    html_path = SCRAPER_DIR / f"report_{ts}.html"
    generate_html_report(results, ok_results, niche, html_path)

    print(f"\n{'='*70}")
    print(f" ZUSAMMENFASSUNG v3")
    print(f"{'='*70}")
    print(f" URLs gescraped: {len(urls)} | Worker: {max_workers}")
    print(f" Erfolgreich: {len(ok_results)} | Fehler: {len([r for r in results if r['status']=='error'])} | Blockiert: {len([r for r in results if r['status']=='blocked'])}")
    print(f" Aus Cache: {len([r for r in results if r.get('from_cache')])}")
    if ok_results:
        avg_slop = sum(r["scan"]["slop_toxicity"] for r in ok_results) / len(ok_results)
        avg_score = sum(r["lead_score"] for r in ok_results) / len(ok_results)
        avg_burst = sum(r["scan"]["burstiness"] for r in ok_results) / len(ok_results)
        high_priority = [r for r in ok_results if r["lead_score"] >= 60]
        no_https = [r for r in ok_results if not r.get("scraped_data", {}).get("ssl", {}).get("https", True)]
        no_cta = [r for r in ok_results if not r.get("scraped_data", {}).get("ctas")]
        print(f" Durchschnittliche Slop-Toxizität: {avg_slop:.1f}%")
        print(f" Durchschnittlicher Lead-Score: {avg_score:.1f}/100")
        print(f" Durchschnittliche Burstiness: {avg_burst:.1f}")
        print(f" High-Priority Leads (≥60): {len(high_priority)}")
        print(f" Ohne HTTPS: {len(no_https)} | Ohne CTA: {len(no_cta)}")
        print(f"\n Top 5 Leads:")
        for r in ok_results[:5]:
            sd = r.get("scraped_data", {})
            print(f"  {r['lead_score']:3d}/100 | Slop: {r['scan']['slop_toxicity']:3d}% | "
                  f"Burst: {r['scan']['burstiness']:4.1f} | HTTPS: {'✓' if sd.get('ssl',{}).get('https') else '✗'} | "
                  f"CTA: {'✓' if sd.get('ctas') else '✗'} | {r['url'][:40]}")
    print(f"\n JSON: {json_path}")
    print(f" CSV:  {csv_path}")
    print(f" E-Mails: {email_dir}/ ({len(ok_results)} Dateien)")
    print(f" HTML Report: {html_path}")
    print(f"{'='*70}\n")
    return results


def generate_html_report(results, ok_results, niche, output_path):
    """Generiert einen HTML-Report mit allen Ergebnissen."""
    rows = ""
    for rank, r in enumerate(ok_results, 1):
        s = r["scan"]; sd = r.get("scraped_data", {})
        score_color = "#10b981" if r["lead_score"] >= 60 else "#f59e0b" if r["lead_score"] >= 40 else "#6b7280"
        rows += f"""<tr>
            <td>{rank}</td>
            <td><a href="{r['url']}" target="_blank">{r['title'] or r['url'][:40]}</a></td>
            <td style="color:{score_color};font-weight:bold">{r['lead_score']}</td>
            <td>{s['slop_toxicity']}%</td>
            <td>{s['burstiness']}</td>
            <td>{s['hit_count']}</td>
            <td>{s['word_count']}</td>
            <td>{'✓' if sd.get('ssl',{}).get('https') else '✗'}</td>
            <td>{'✓' if sd.get('ctas') else '✗'}</td>
            <td>{'✓' if sd.get('has_viewport') else '✗'}</td>
        </tr>"""
    html = f"""<!DOCTYPE html>
<html lang="de"><head><meta charset="UTF-8"><title>OMEGA Scraper Report</title>
<style>
body{{font-family:Inter,sans-serif;background:#090d16;color:#f3f4f6;padding:2rem}}
table{{width:100%;border-collapse:collapse;margin:1rem 0}}
th,td{{padding:8px 12px;border:1px solid #1f2937;text-align:left;font-size:13px}}
th{{background:#1f2937;color:#06b6d4;font-weight:bold}}
tr:hover{{background:#111827}}
a{{color:#06b6d4;text-decoration:none}}
h1{{color:#06b6d4}} h2{{color:#10b981}}
.stat{{display:inline-block;margin:0.5rem;padding:1rem;background:#111827;border-radius:8px;text-align:center;min-width:120px}}
.stat .val{{font-size:2rem;font-weight:bold;color:#06b6d4}} .stat .lbl{{font-size:0.8rem;color:#9ca3af}}
</style></head><body>
<h1>Ω OMEGA Slop Scraper Report</h1>
<p>Nische: {niche} | Datum: {datetime.now().strftime('%d.%m.%Y %H:%M')} | URLs: {len(results)} | Erfolgreich: {len(ok_results)}</p>
<div>
<div class="stat"><div class="val">{len(ok_results)}</div><div class="lbl">Erfolgreich</div></div>
<div class="stat"><div class="val">{sum(r['lead_score'] for r in ok_results)//max(len(ok_results),1)}</div><div class="lbl">Ø Score</div></div>
<div class="stat"><div class="val">{sum(r['scan']['slop_toxicity'] for r in ok_results)//max(len(ok_results),1)}%</div><div class="lbl">Ø Slop</div></div>
<div class="stat"><div class="val">{len([r for r in ok_results if r['lead_score']>=60])}</div><div class="lbl">High-Priority</div></div>
</div>
<h2>Lead-Ranking</h2>
<table><thead><tr><th>#</th><th>Website</th><th>Score</th><th>Slop%</th><th>Burst</th><th>Hits</th><th>Wörter</th><th>HTTPS</th><th>CTA</th><th>Mobile</th></tr></thead>
<tbody>{rows}</tbody></table>
</body></html>"""
    with open(output_path, "w", encoding="utf-8") as f:
        f.write(html)


# ============================================================
# CLI
# ============================================================

def main():
    parser = argparse.ArgumentParser(description="OMEGA Slop Scraper v3 — Weiter verbessert")
    parser.add_argument("--urls", "-u", nargs="+", help="URLs zum Scrapen")
    parser.add_argument("--file", "-f", help="Datei mit URLs (eine pro Zeile)")
    parser.add_argument("--auto-discover", "-a", action="store_true", help="Automatisch URLs finden")
    parser.add_argument("--discover-query", default="landing page", help="Suchbegriff für Auto-Discovery")
    parser.add_argument("--discover-num", type=int, default=8, help="Anzahl zu entdeckender URLs")
    parser.add_argument("--niche", "-n", default="B2B SaaS", help="Ziel-Nische")
    parser.add_argument("--delay", "-d", type=float, default=1.0, help="Verzögerung zwischen Requests")
    parser.add_argument("--workers", "-w", type=int, default=MAX_WORKERS, help="Anzahl paralleler Worker")
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

    seen = set(); unique_urls = []
    for u in urls:
        nu = normalize_url(u)
        if nu not in seen:
            seen.add(nu); unique_urls.append(nu)

    if not unique_urls:
        print("[!] Keine URLs angegeben. Nutze --urls, --file oder --auto-discover")
        sys.exit(1)

    scrape_and_analyze(unique_urls, args.niche, args.delay, respect_robots=not args.no_robots, max_workers=args.workers)


if __name__ == "__main__":
    main()
