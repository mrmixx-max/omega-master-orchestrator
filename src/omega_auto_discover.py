#!/usr/bin/env python3
"""
OMEGA AUTO-DISCOVERY ENGINE v3 — Normale Webseiten + Mehr Quellen
Findet automatisch normale Business-Webseiten aus kostenlosen Quellen.
Quellen: GitHub Pages, Medium, Substack, WordPress.com, OSM Nominatim, Common Crawl, RSS Feeds.
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

# Import v2 sources
try:
    from omega_auto_discover import _dedup, SOURCES as V2_SOURCES
except Exception:
    V2_SOURCES = {}
    def _dedup(urls):
        seen = set(); unique = []
        for u in urls:
            if u not in seen:
                seen.add(u); unique.append(u)
        return unique


# ============================================================
# NEUE QUELLEN FÜR NORMALE WEBSEITEN
# ============================================================

def discover_github_pages(query, num=20):
    """Findet GitHub Pages Websites (.github.io)."""
    urls = []
    try:
        api_url = f"https://api.github.com/search/repositories?q={urllib.parse.quote(query)}+in:name+OR+in:description&sort=stars&per_page={min(num*2, 50)}"
        req = urllib.request.Request(api_url, headers={"User-Agent": "Mozilla/5.0", "Accept": "application/vnd.github.v3+json"})
        with urllib.request.urlopen(req, timeout=15) as resp:
            data = json.loads(resp.read().decode("utf-8"))
            for item in data.get("items", []):
                # GitHub Pages URL
                owner = item.get("owner", {}).get("login", "")
                name = item.get("name", "")
                if owner and name:
                    gh_pages = f"https://{owner}.github.io/{name}/"
                    urls.append(gh_pages)
                # Also homepage if available
                homepage = item.get("homepage", "")
                if homepage and homepage.startswith("http"):
                    urls.append(homepage)
    except Exception as e:
        print(f"  [!] GitHub Pages Fehler: {e}")
    return _dedup(urls)[:num]


def discover_medium(tag, num=20):
    """Findet Websites über Medium Tag/Topic."""
    urls = []
    try:
        # Medium RSS feed for a tag
        rss_url = f"https://medium.com/feed/tag/{urllib.parse.quote(tag)}"
        req = urllib.request.Request(rss_url, headers={"User-Agent": "Mozilla/5.0"})
        with urllib.request.urlopen(req, timeout=15) as resp:
            xml = resp.read().decode("utf-8", errors="replace")
            # Extract links from articles
            matches = re.findall(r"<link>(https?://[^<]+)</link>", xml)
            for m in matches:
                if "medium.com" not in m:
                    urls.append(m)
            # Also extract from content
            content_links = re.findall(r'href="(https?://(?!medium\.com)[^"]+)"', xml)
            urls.extend(content_links)
    except Exception as e:
        print(f"  [!] Medium Fehler: {e}")
    return _dedup(urls)[:num]


def discover_substack(topic, num=20):
    """Findet Websites über Substack."""
    urls = []
    try:
        # Substack has a public search
        search_url = f"https://substack.com/search/{urllib.parse.quote(topic)}?type=publication"
        req = urllib.request.Request(search_url, headers={"User-Agent": "Mozilla/5.0"})
        with urllib.request.urlopen(req, timeout=15) as resp:
            html = resp.read().decode("utf-8", errors="replace")
            # Extract substack URLs
            matches = re.findall(r'href="(https?://[^"]+\.substack\.com[^"]*)"', html)
            for m in matches:
                urls.append(m)
            # Also custom domains
            custom = re.findall(r'href="(https?://(?!substack\.com)[^"]+)"[^>]*class="[^"]*publication', html)
            urls.extend(custom)
    except Exception as e:
        print(f"  [!] Substack Fehler: {e}")
    return _dedup(urls)[:num]


def discover_wordpress_com(tag, num=20):
    """Findet Websites über WordPress.com (hosted blogs)."""
    urls = []
    try:
        api_url = f"https://public-api.wordpress.com/rest/v1.1/tags/{urllib.parse.quote(tag)}/posts?number={min(num, 20)}"
        req = urllib.request.Request(api_url, headers={"User-Agent": "Mozilla/5.0"})
        with urllib.request.urlopen(req, timeout=15) as resp:
            data = json.loads(resp.read().decode("utf-8"))
            for post in data.get("posts", []):
                # Get the blog URL from the post URL
                post_url = post.get("URL", "")
                if post_url:
                    # Extract base blog URL
                    match = re.match(r"(https?://[^/]+)", post_url)
                    if match:
                        blog_url = match.group(1)
                        if "wordpress.com" not in blog_url:
                            urls.append(blog_url)
    except Exception as e:
        print(f"  [!] WordPress.com Fehler: {e}")
    return _dedup(urls)[:num]


def discover_osm_nominatim(query, num=20):
    """Findet Business-Webseiten über OpenStreetMap Nominatim (kostenlos, kein API-Key)."""
    urls = []
    try:
        # Nominatim search for businesses
        api_url = f"https://nominatim.openstreetmap.org/search?q={urllib.parse.quote(query)}&format=json&limit={min(num, 20)}&addressdetails=1"
        req = urllib.request.Request(api_url, headers={
            "User-Agent": "OMEGA-Scraper/1.0 (contact@example.com)"
        })
        with urllib.request.urlopen(req, timeout=15) as resp:
            data = json.loads(resp.read().decode("utf-8"))
            for result in data:
                # Nominatim doesn't directly return websites, but we can construct from name
                name = result.get("display_name", "")
                # Try to find website in extratags
                extratags = result.get("extratags", {})
                website = extratags.get("website", "") or extratags.get("contact:website", "")
                if website and website.startswith("http"):
                    urls.append(website)
    except Exception as e:
        print(f"  [!] OSM Nominatim Fehler: {e}")
    return _dedup(urls)[:num]


def discover_commoncrawl(domain_pattern, num=20):
    """Findet URLs über Common Crawl CDX API (kostenlos)."""
    urls = []
    try:
        # Common Crawl CDX server
        cdx_url = f"http://index.commoncrawl.org/CC-MAIN-2024-10-index?url={urllib.parse.quote(domain_pattern)}&output=json&limit={min(num, 50)}"
        req = urllib.request.Request(cdx_url, headers={"User-Agent": "Mozilla/5.0"})
        with urllib.request.urlopen(req, timeout=30) as resp:
            for line in resp.read().decode("utf-8", errors="replace").strip().split("\n"):
                if line.strip():
                    try:
                        data = json.loads(line)
                        url = data.get("url", "")
                        if url and url.startswith("http"):
                            urls.append(url)
                    except Exception:
                        pass
    except Exception as e:
        print(f"  [!] Common Crawl Fehler: {e}")
    return _dedup(urls)[:num]


def discover_rss_feeds(opml_url=None, num=20):
    """Findet Blogs über RSS Feed Directories."""
    urls = []
    # Feed directories
    feed_dirs = [
        "https://www.feedspot.com/rss-feeds/",
    ]
    # Try to find RSS feeds from known blog platforms
    platforms = [
        "https://{}.wordpress.com",
        "https://{}.blogspot.com",
        "https://{}.tumblr.com",
    ]
    # This is a placeholder - actual implementation would scrape feed directories
    return urls[:num]


def discover_vercel_netlify(query, num=20):
    """Findet deployte Websites auf Vercel/Netlify."""
    urls = []
    try:
        # Search GitHub for repos deployed to Vercel/Netlify
        api_url = f"https://api.github.com/search/repositories?q={urllib.parse.quote(query)}+vercel+OR+netlify&sort=stars&per_page={min(num, 30)}"
        req = urllib.request.Request(api_url, headers={"User-Agent": "Mozilla/5.0", "Accept": "application/vnd.github.v3+json"})
        with urllib.request.urlopen(req, timeout=15) as resp:
            data = json.loads(resp.read().decode("utf-8"))
            for item in data.get("items", []):
                homepage = item.get("homepage", "")
                if homepage and homepage.startswith("http"):
                    urls.append(homepage)
                # Vercel deploy URL pattern
                name = item.get("name", "")
                owner = item.get("owner", {}).get("login", "")
                if name and owner:
                    vercel_url = f"https://{name}-{owner}.vercel.app"
                    urls.append(vercel_url)
    except Exception as e:
        print(f"  [!] Vercel/Netlify Fehler: {e}")
    return _dedup(urls)[:num]


# ============================================================
# UNIFIED DISCOVERY
# ============================================================

NORMAL_WEB_SOURCES = {
    "github_pages": ("GitHub Pages", discover_github_pages),
    "medium": ("Medium", discover_medium),
    "substack": ("Substack", discover_substack),
    "wordpress_com": ("WordPress.com", discover_wordpress_com),
    "osm_nominatim": ("OpenStreetMap", discover_osm_nominatim),
    "vercel_netlify": ("Vercel/Netlify", discover_vercel_netlify),
}

# Import v2 sources
try:
    from omega_auto_discover import SOURCES as V2_SOURCES, discover_all as v2_discover_all
    ALL_SOURCES = {**V2_SOURCES, **NORMAL_WEB_SOURCES}
except Exception:
    ALL_SOURCES = NORMAL_WEB_SOURCES
    v2_discover_all = None


def discover_all_v3(query, num_per_source=8):
    """Findet URLs aus ALLEN Quellen (v2 + v3)."""
    print(f"\n[*] Multi-Source Discovery v3: Query={query}")
    all_urls = []

    # v2 sources (GitHub, npm, PyPI, HN, Dev.to, WordPress plugins, Product Hunt, Shopify)
    if v2_discover_all:
        try:
            v2_urls = v2_discover_all(query, num_per_source)
            print(f"  [v2 Sources] {len(v2_urls)} URLs")
            all_urls.extend(v2_urls)
        except Exception as e:
            print(f"  [v2 Sources] Fehler: {e}")

    # v3 sources (normal websites)
    for source, (name, func) in NORMAL_WEB_SOURCES.items():
        try:
            urls = func(query, num_per_source)
            print(f"  [{name}] {len(urls)} URLs")
            all_urls.extend(urls)
        except Exception as e:
            print(f"  [{name}] Fehler: {e}")

    all_urls = _dedup(all_urls)
    print(f"\n  [+] Gesamt: {len(all_urls)} eindeutige URLs")
    return all_urls


if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser(description="OMEGA Auto-Discovery Engine v3")
    parser.add_argument("--source", "-s", default="all",
                        choices=list(ALL_SOURCES.keys()) + ["all", "v2", "v3"],
                        help="Discovery-Quelle")
    parser.add_argument("--query", "-q", default="landing page", help="Suchbegriff")
    parser.add_argument("--num", "-n", type=int, default=8, help="Anzahl pro Quelle")
    parser.add_argument("--output", "-o", help="Ausgabe-Datei")
    args = parser.parse_args()

    if args.source == "all":
        urls = discover_all_v3(args.query, args.num)
    elif args.source == "v2":
        if v2_discover_all:
            urls = v2_discover_all(args.query, args.num)
        else:
            urls = []
    elif args.source == "v3":
        urls = []
        for source, (name, func) in NORMAL_WEB_SOURCES.items():
            try:
                u = func(args.query, args.num)
                print(f"  [{name}] {len(u)} URLs")
                urls.extend(u)
            except Exception as e:
                print(f"  [{name}] Fehler: {e}")
        urls = _dedup(urls)
    else:
        func = ALL_SOURCES.get(args.source, (None, None))[1]
        if func:
            urls = func(args.query, args.num)
        else:
            urls = []

    if args.output:
        with open(args.output, "w", encoding="utf-8") as f:
            for u in urls:
                f.write(u + "\n")
        print(f"\n[+] {len(urls)} URLs gespeichert in: {args.output}")
    else:
        print(f"\nGefundene URLs:")
        for u in urls:
            print(f"  {u}")
