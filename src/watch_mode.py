#!/usr/bin/env python3
"""OMEGA Watch Mode - Überwacht eine URL und re-auditiert bei Änderungen."""
import os, sys, time, hashlib, subprocess, json
from datetime import datetime

SCRIPT = os.path.expanduser("~/.hermes/skills/omega-master/omega_orchestrator.py")
STATE_FILE = os.path.expanduser("~/.hermes/skills/omega-master/watch_state.json")

def fetch_hash(url):
    """Holt die Seite und gibt einen Hash des Inhalts zurück."""
    import urllib.request
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0 (OMEGA Watch Mode)"})
    try:
        with urllib.request.urlopen(req, timeout=15) as resp:
            content = resp.read()
            return hashlib.sha256(content).hexdigest()
    except Exception as e:
        print(f"[!] Fetch-Fehler: {e}")
        return None

def load_state():
    if os.path.isfile(STATE_FILE):
        with open(STATE_FILE, "r") as f:
            return json.load(f)
    return {}

def save_state(state):
    with open(STATE_FILE, "w") as f:
        json.dump(state, f, indent=2)

def watch(url, niche, interval=3600, objections="", style="Messerscharfer Direkt-Response-Experte"):
    """Überwacht eine URL und re-auditiert bei Änderungen."""
    state = load_state()
    print(f"[*] Watch Mode aktiv für: {url}")
    print(f"[*] Prüfintervall: {interval}s ({interval//60} Min)")
    print(f"[*] Beende mit Ctrl+C\n")

    while True:
        now = datetime.now().strftime("%H:%M:%S")
        current_hash = fetch_hash(url)

        if current_hash is None:
            print(f"[{now}] Konnte URL nicht abrufen. Warte {interval}s...")
            time.sleep(interval)
            continue

        last_hash = state.get(url, {}).get("last_hash")

        if last_hash is None:
            print(f"[{now}] Erste Prüfung. Baseline-Hash gespeichert.")
            state[url] = {"last_hash": current_hash, "last_check": now, "audits": 0}
            save_state(state)
        elif current_hash != last_hash:
            print(f"[{now}] ⚠️  ÄNDERUNG ERKANNT! Starte Re-Audit...")
            state[url]["last_hash"] = current_hash
            state[url]["last_check"] = now
            state[url]["audits"] = state[url].get("audits", 0) + 1
            save_state(state)

            # Run audit
            try:
                subprocess.run(
                    ["python", SCRIPT, "--target", url, "--niche", niche,
                     "--objections", objections, "--style", style],
                    timeout=600
                )
                print(f"[{now}] ✅ Re-Audit abgeschlossen.")
            except Exception as e:
                print(f"[{now}] ❌ Re-Audit fehlgeschlagen: {e}")
        else:
            print(f"[{now}] Keine Änderung. Nächste Prüfung in {interval//60} Min.")
            state[url]["last_check"] = now
            save_state(state)

        time.sleep(interval)

if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser(description="OMEGA Watch Mode - URL-Überwachung")
    parser.add_argument("url", help="Zu überwachende URL")
    parser.add_argument("--niche", "-n", required=True)
    parser.add_argument("--interval", "-i", type=int, default=3600, help="Prüfintervall in Sekunden (default: 3600)")
    parser.add_argument("--objections", "-o", default="")
    parser.add_argument("--style", "-s", default="Messerscharfer Direkt-Response-Experte")
    args = parser.parse_args()
    try:
        watch(args.url, args.niche, args.interval, args.objections, args.style)
    except KeyboardInterrupt:
        print("\n[*] Watch Mode beendet.")
