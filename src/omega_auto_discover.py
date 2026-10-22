#!/usr/bin/env python3
"""
OMEGA AUTO-DISCOVERY ENGINE
Findet automatisch geeignete Webseiten für den Slop-Scraper.
Quellen: DuckDuckGo Instant Answer API, Clutch.co, G2.com, Sitemap-Discovery.
"""

import os
import sys
import re
import json
import urllib.request
import urllib.parse
from pathlib import Path

os.environ.pop("PYTHONPATH", None)

SKILL_DIR = Path(os.path.expanduser("~/.hermes/skills/omega-master"))
sys.path.insert(0, str(SKILL_DIR))


def discover_duckduckgo(query: str, num: int = 20) -> list:
    """Nutzt die DuckDuckGo Instant Answer API (funktioniert ohne Blockierung)."""
    urls = []
    try:
        api_url = f"https://api.duckduckgo.com/?q={urllib.parse.quote(query)}&format=json&no_html=1&skip_disambig=1"
        req = urllib.request.Request(api_url, headers={"User-Agent": "Mozilla/5.0"})
        with urllib.request.urlopen(req, timeout=15) as resp:
            data = json.loads(resp.read().decode("utf-8"))
            # Related topics
            for topic in data.get("RelatedTopics", []):
                if isinstance(topic, dict):
                    if "FirstURL" in topic:
                        urls.append(topic["FirstURL"])
                    elif "Topics" in topic:
                        for t in topic["Topics"]:
                            if "FirstURL" in t:
                                urls.append(t["FirstURL"])
            # Results
            for r in data.get("Results", []):
                if "FirstURL" in r:
                    urls.append(r["FirstURL"])
    except Exception as e:
        print(f"  [!] DuckDuckGo API Fehler: {e}")
    return urls[:num]


def discover_clutch(category: str, num: int = 20) -> list:
    """Scraped Clutch.co für Agenturen/Dienstleister."""
    urls = []
    try:
        search_url = f"https://clutch.co/{category}"
        req = urllib.request.Request(search_url, headers={
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
        })
        with urllib.request.urlopen(req, timeout=15) as resp:
            html = resp.read().decode("utf-8", errors="replace")
            # Extract company website links
            matches = re.findall(r'href="(https?://(?!clutch\.co)[^"]+)"', html)
            for m in matches:
                if m not in urls:
                    urls.append(m)
    except Exception as e:
        print(f"  [!] Clutch Fehler: {e}")
    return urls[:num]


def discover_g2(category: str, num: int = 20) -> list:
    """Scraped G2.com für Software-Anbieter."""
    urls = []
    try:
        search_url = f"https://www.g2.com/categories/{category}"
        req = urllib.request.Request(search_url, headers={
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
        })
        with urllib.request.urlopen(req, timeout=15) as resp:
            html = resp.read().decode("utf-8", errors="replace")
            matches = re.findall(r'href="(https?://(?!g2\.com)[^"]+)"', html)
            for m in matches:
                if m not in urls and "g2.com" not in m:
                    urls.append(m)
    except Exception as e:
        print(f"  [!] G2 Fehler: {e}")
    return urls[:num]


def discover_sitemap(domain: str) -> list:
    """Findet URLs aus der Sitemap eines Domains."""
    urls = []
    sitemap_urls = [
        f"https://{domain}/sitemap.xml",
        f"https://{domain}/sitemap_index.xml",
        f"https://{domain}/robots.txt",
    ]
    for sm_url in sitemap_urls:
        try:
            req = urllib.request.Request(sm_url, headers={"User-Agent": "Mozilla/5.0"})
            with urllib.request.urlopen(req, timeout=10) as resp:
                content = resp.read().decode("utf-8", errors="replace")
                # Extract URLs from sitemap XML
                found = re.findall(r"<loc>(https?://[^<]+)</loc>", content)
                urls.extend(found)
                # Also try robots.txt for sitemap references
                if "sitemap" in sm_url and ".xml" not in sm_url:
                    sm_refs = re.findall(r"Sitemap:\s*(https?://\S+)", content)
                    for ref in sm_refs:
                        try:
                            req2 = urllib.request.Request(ref, headers={"User-Agent": "Mozilla/5.0"})
                            with urllib.request.urlopen(req2, timeout=10) as resp2:
                                content2 = resp2.read().decode("utf-8", errors="replace")
                                found2 = re.findall(r"<loc>(https?://[^<]+)</loc>", content2)
                                urls.extend(found2)
                        except Exception:
                            pass
        except Exception:
            pass
    # Deduplicate and filter (only same domain, max 50)
    seen = set()
    unique = []
    for u in urls:
        if domain in u and u not in seen:
            seen.add(u)
            unique.append(u)
    return unique[:50]


def discover_github(query: str, num: int = 20) -> list:
    """Findet Websites über GitHub Search API (repos mit homepage)."""
    urls = []
    try:
        api_url = f"https://api.github.com/search/repositories?q={urllib.parse.quote(query)}&sort=stars&per_page={min(num, 30)}"
        req = urllib.request.Request(api_url, headers={
            "User-Agent": "Mozilla/5.0",
            "Accept": "application/vnd.github.v3+json"
        })
        with urllib.request.urlopen(req, timeout=15) as resp:
            data = json.loads(resp.read().decode("utf-8"))
            for item in data.get("items", []):
                homepage = item.get("homepage", "")
                if homepage and homepage.startswith("http"):
                    urls.append(homepage)
                # Also try the repo's GitHub Pages
                if not homepage:
                    urls.append(item.get("html_url", ""))
    except Exception as e:
        print(f"  [!] GitHub API Fehler: {e}")
    # Deduplicate
    seen = set()
    unique = []
    for u in urls:
        if u not in seen:
            seen.add(u)
            unique.append(u)
    return unique[:num]
def discover_from_list_file(filepath: str) -> list:
    """Liest URLs aus einer Textdatei (eine URL pro Zeile)."""
    urls = []
    try:
        with open(filepath, "r", encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith("#"):
                    urls.append(line)
    except Exception as e:
        print(f"  [!] Datei-Fehler: {e}")
    return urls


def auto_discover(source: str, query: str = "", num: int = 20) -> list:
    """Automatische URL-Entdeckung aus verschiedenen Quellen."""
    print(f"\n[*] Auto-Discovery: Quelle={source}, Query={query}")
    urls = []

    if source == "duckduckgo":
        urls = discover_duckduckgo(query, num)
    elif source == "clutch":
        urls = discover_clutch(query or "web-designers", num)
    elif source == "g2":
        urls = discover_g2(query or "crm", num)
    elif source == "sitemap":
        urls = discover_sitemap(query)
    elif source == "file":
        urls = discover_from_list_file(query)
    elif source == "github":
        urls = discover_github(query or "landing page saas", num)
    else:
        print(f"  [!] Unbekannte Quelle: {source}")

    # Deduplicate
    seen = set()
    unique = []
    for u in urls:
        if u not in seen:
            seen.add(u)
            unique.append(u)

    print(f"  [+] {len(unique)} URLs gefunden")
    return unique


# --- STANDALONE TEST ---
if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser(description="OMEGA Auto-Discovery Engine")
    parser.add_argument("--source", "-s", default="github",
                        choices=["duckduckgo", "clutch", "g2", "sitemap", "file", "github"],
                        help="Discovery-Quelle")
    parser.add_argument("--query", "-q", default="", help="Suchbegriff oder Domain")
    parser.add_argument("--num", "-n", type=int, default=20, help="Anzahl Ergebnisse")
    parser.add_argument("--output", "-o", help="Ausgabe-Datei (URLs, eine pro Zeile)")
    args = parser.parse_args()

    urls = auto_discover(args.source, args.query, args.num)

    if args.output:
        with open(args.output, "w", encoding="utf-8") as f:
            for u in urls:
                f.write(u + "\n")
        print(f"\n[+] {len(urls)} URLs gespeichert in: {args.output}")
    else:
        print(f"\nGefundene URLs:")
        for u in urls:
            print(f"  {u}")
