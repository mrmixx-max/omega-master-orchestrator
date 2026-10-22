#!/usr/bin/env python3
"""
OMEGA AUTO-DISCOVERY ENGINE v2 — Mehr Quellen
Findet automatisch geeignete Webseiten aus verschiedenen kostenlosen Quellen.
Quellen: GitHub, npm, PyPI, Hacker News, Reddit, Dev.to, WordPress Plugins, Shopify Apps.
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


def _dedup(urls):
    seen = set()
    unique = []
    for u in urls:
        if u not in seen:
            seen.add(u)
            unique.append(u)
    return unique


def discover_github(query, num=20):
    urls = []
    try:
        api_url = f"https://api.github.com/search/repositories?q={urllib.parse.quote(query)}&sort=stars&per_page={min(num, 30)}"
        req = urllib.request.Request(api_url, headers={"User-Agent": "Mozilla/5.0", "Accept": "application/vnd.github.v3+json"})
        with urllib.request.urlopen(req, timeout=15) as resp:
            data = json.loads(resp.read().decode("utf-8"))
            for item in data.get("items", []):
                homepage = item.get("homepage", "")
                if homepage and homepage.startswith("http"):
                    urls.append(homepage)
    except Exception as e:
        print(f"  [!] GitHub Fehler: {e}")
    return _dedup(urls)[:num]


def discover_npm(query, num=20):
    urls = []
    try:
        api_url = f"https://registry.npmjs.org/-/v1/search?text={urllib.parse.quote(query)}&size={min(num, 20)}"
        req = urllib.request.Request(api_url, headers={"User-Agent": "Mozilla/5.0"})
        with urllib.request.urlopen(req, timeout=15) as resp:
            data = json.loads(resp.read().decode("utf-8"))
            for obj in data.get("objects", []):
                pkg = obj.get("package", {})
                links = pkg.get("links", {})
                homepage = links.get("homepage", "")
                if homepage and homepage.startswith("http"):
                    urls.append(homepage)
    except Exception as e:
        print(f"  [!] npm Fehler: {e}")
    return _dedup(urls)[:num]


def discover_pypi(query, num=20):
    urls = []
    try:
        search_url = f"https://pypi.org/search/?q={urllib.parse.quote(query)}"
        req = urllib.request.Request(search_url, headers={"User-Agent": "Mozilla/5.0"})
        with urllib.request.urlopen(req, timeout=15) as resp:
            html = resp.read().decode("utf-8", errors="replace")
            matches = re.findall(r'href="/project/([^/]+)/"', html)
            for name in matches[:num]:
                try:
                    proj_url = f"https://pypi.org/pypi/{name}/json"
                    req2 = urllib.request.Request(proj_url, headers={"User-Agent": "Mozilla/5.0"})
                    with urllib.request.urlopen(req2, timeout=10) as resp2:
                        proj_data = json.loads(resp2.read().decode("utf-8"))
                        info = proj_data.get("info", {})
                        homepage = info.get("home_page", "") or info.get("project_url", "")
                        if homepage and homepage.startswith("http") and "pypi.org" not in homepage:
                            urls.append(homepage)
                except Exception:
                    pass
    except Exception as e:
        print(f"  [!] PyPI Fehler: {e}")
    return _dedup(urls)[:num]


def discover_hackernews(query, num=20):
    urls = []
    try:
        api_url = f"https://hn.algolia.com/api/v1/search?query={urllib.parse.quote(query)}&tags=story&hitsPerPage={min(num, 30)}"
        req = urllib.request.Request(api_url, headers={"User-Agent": "Mozilla/5.0"})
        with urllib.request.urlopen(req, timeout=15) as resp:
            data = json.loads(resp.read().decode("utf-8"))
            for hit in data.get("hits", []):
                url = hit.get("url", "")
                if url and url.startswith("http"):
                    urls.append(url)
    except Exception as e:
        print(f"  [!] Hacker News Fehler: {e}")
    return _dedup(urls)[:num]


def discover_reddit(subreddit, query="", num=20):
    urls = []
    try:
        if query:
            search_url = f"https://www.reddit.com/r/{subreddit}/search.json?q={urllib.parse.quote(query)}&restrict_sr=1&limit={min(num, 25)}"
        else:
            search_url = f"https://www.reddit.com/r/{subreddit}/hot.json?limit={min(num, 25)}"
        req = urllib.request.Request(search_url, headers={"User-Agent": "Mozilla/5.0 (compatible; OMEGA-Scraper/1.0)"})
        with urllib.request.urlopen(req, timeout=15) as resp:
            data = json.loads(resp.read().decode("utf-8"))
            posts = data.get("data", {}).get("children", [])
            for post in posts:
                pdata = post.get("data", {})
                url = pdata.get("url", "")
                if url and url.startswith("http") and "reddit.com" not in url and "redd.it" not in url:
                    urls.append(url)
    except Exception as e:
        print(f"  [!] Reddit Fehler: {e}")
    return _dedup(urls)[:num]


def discover_devto(tag, num=20):
    urls = []
    try:
        api_url = f"https://dev.to/api/articles?tag={urllib.parse.quote(tag)}&per_page={min(num, 30)}"
        req = urllib.request.Request(api_url, headers={"User-Agent": "Mozilla/5.0"})
        with urllib.request.urlopen(req, timeout=15) as resp:
            data = json.loads(resp.read().decode("utf-8"))
            for article in data:
                canonical = article.get("canonical_url", "")
                if canonical and canonical.startswith("http") and "dev.to" not in canonical:
                    urls.append(canonical)
    except Exception as e:
        print(f"  [!] Dev.to Fehler: {e}")
    return _dedup(urls)[:num]


def discover_wordpress_plugins(query, num=20):
    urls = []
    try:
        api_url = f"https://api.wordpress.org/plugins/info/1.2/?action=query_plugins&request[search]={urllib.parse.quote(query)}&request[per_page]={min(num, 20)}"
        req = urllib.request.Request(api_url, headers={"User-Agent": "Mozilla/5.0"})
        with urllib.request.urlopen(req, timeout=15) as resp:
            data = json.loads(resp.read().decode("utf-8"))
            for plugin in data.get("plugins", []):
                homepage = plugin.get("homepage", "")
                if homepage and homepage.startswith("http"):
                    urls.append(homepage)
    except Exception as e:
        print(f"  [!] WordPress Fehler: {e}")
    return _dedup(urls)[:num]


def discover_producthunt(topic, num=20):
    urls = []
    try:
        rss_url = f"https://www.producthunt.com/feed?category={urllib.parse.quote(topic)}"
        req = urllib.request.Request(rss_url, headers={"User-Agent": "Mozilla/5.0"})
        with urllib.request.urlopen(req, timeout=15) as resp:
            xml = resp.read().decode("utf-8", errors="replace")
            matches = re.findall(r"<link>(https?://[^<]+)</link>", xml)
            for m in matches:
                if "producthunt.com" not in m:
                    urls.append(m)
    except Exception as e:
        print(f"  [!] Product Hunt Fehler: {e}")
    return _dedup(urls)[:num]


def discover_shopify_apps(query, num=20):
    urls = []
    try:
        search_url = f"https://apps.shopify.com/search?q={urllib.parse.quote(query)}"
        req = urllib.request.Request(search_url, headers={"User-Agent": "Mozilla/5.0"})
        with urllib.request.urlopen(req, timeout=15) as resp:
            html = resp.read().decode("utf-8", errors="replace")
            matches = re.findall(r'href="(https?://[^"]+)"', html)
            for m in matches:
                if "shopify.com" not in m and "shopifycdn.com" not in m:
                    urls.append(m)
    except Exception as e:
        print(f"  [!] Shopify Fehler: {e}")
    return _dedup(urls)[:num]


SOURCES = {
    "github": ("GitHub Repos", discover_github),
    "npm": ("npm Packages", discover_npm),
    "pypi": ("PyPI Packages", discover_pypi),
    "hackernews": ("Hacker News", discover_hackernews),
    "devto": ("Dev.to", discover_devto),
    "wordpress": ("WordPress Plugins", discover_wordpress_plugins),
    "producthunt": ("Product Hunt", discover_producthunt),
    "shopify": ("Shopify Apps", discover_shopify_apps),
}


def auto_discover(source, query="", num=20, **kwargs):
    print(f"\n[*] Auto-Discovery: Quelle={source}, Query={query}")
    urls = []
    if source == "reddit":
        subreddit = kwargs.get("subreddit", "SaaS")
        urls = discover_reddit(subreddit, query, num)
    elif source in SOURCES:
        func = SOURCES[source][1]
        urls = func(query, num)
    else:
        print(f"  [!] Unbekannte Quelle: {source}")
        print(f"  [!] Verfuegbar: {', '.join(SOURCES.keys())}, reddit")
    urls = _dedup(urls)
    print(f"  [+] {len(urls)} URLs gefunden")
    return urls


def discover_all(query, num_per_source=10):
    print(f"\n[*] Multi-Source Discovery: Query={query}")
    all_urls = []
    for source, (name, func) in SOURCES.items():
        try:
            urls = func(query, num_per_source)
            print(f"  [{name}] {len(urls)} URLs")
            all_urls.extend(urls)
        except Exception as e:
            print(f"  [{name}] Fehler: {e}")
    try:
        urls = discover_reddit("SaaS", query, num_per_source)
        print(f"  [Reddit] {len(urls)} URLs")
        all_urls.extend(urls)
    except Exception as e:
        print(f"  [Reddit] Fehler: {e}")
    all_urls = _dedup(all_urls)
    print(f"\n  [+] Gesamt: {len(all_urls)} eindeutige URLs")
    return all_urls


if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser(description="OMEGA Auto-Discovery Engine v2")
    parser.add_argument("--source", "-s", default="all", choices=list(SOURCES.keys()) + ["reddit", "all"], help="Discovery-Quelle")
    parser.add_argument("--query", "-q", default="landing page", help="Suchbegriff")
    parser.add_argument("--num", "-n", type=int, default=10, help="Anzahl pro Quelle")
    parser.add_argument("--subreddit", default="SaaS", help="Subreddit")
    parser.add_argument("--output", "-o", help="Ausgabe-Datei")
    args = parser.parse_args()

    if args.source == "all":
        urls = discover_all(args.query, args.num)
    elif args.source == "reddit":
        urls = auto_discover("reddit", args.query, args.num, subreddit=args.subreddit)
    else:
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
