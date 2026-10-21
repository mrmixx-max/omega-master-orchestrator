#!/usr/bin/env python3
"""OMEGA Batch Processor - Verarbeitet mehrere URLs aus einer Datei."""
import os, sys, subprocess, time
from datetime import datetime

SCRIPT = os.path.expanduser("~/.hermes/skills/omega-master/omega_orchestrator.py")
OUTPUT_DIR = os.path.expanduser("~/.hermes/skills/omega-master/dossiers")

def batch_process(urls_file: str, niche: str, objections: str = "", style: str = "Messerscharfer Direkt-Response-Experte", delay: int = 5):
    """Verarbeitet eine Liste von URLs aus einer Datei."""
    with open(urls_file, "r", encoding="utf-8") as f:
        urls = [line.strip() for line in f if line.strip() and not line.startswith("#")]

    print(f"[*] Batch-Verarbeitung: {len(urls)} URLs")
    print(f"[*] Nische: {niche}")
    print(f"[*] Verzögerung zwischen Runs: {delay}s\n")

    results = []
    for i, url in enumerate(urls, 1):
        print(f"\n{'='*60}")
        print(f"[{i}/{len(urls)}] Verarbeite: {url}")
        print(f"{'='*60}")

        try:
            result = subprocess.run(
                ["python", SCRIPT, "--target", url, "--niche", niche,
                 "--objections", objections, "--style", style],
                capture_output=True, text=True, timeout=600
            )
            if result.returncode == 0:
                print(f"[✅] Erfolgreich: {url}")
                results.append({"url": url, "status": "ok"})
            else:
                print(f"[❌] Fehler: {url}")
                print(result.stderr[:500])
                results.append({"url": url, "status": "error", "error": result.stderr[:200]})
        except subprocess.TimeoutExpired:
            print(f"[⏱️] Timeout: {url}")
            results.append({"url": url, "status": "timeout"})
        except Exception as e:
            print(f"[❌] Exception: {e}")
            results.append({"url": url, "status": "exception", "error": str(e)})

        if i < len(urls):
            print(f"[*] Warte {delay}s vor nächstem Run...")
            time.sleep(delay)

    # Summary
    print(f"\n{'='*60}")
    print(f"BATCH SUMMARY: {sum(1 for r in results if r['status']=='ok')}/{len(results)} erfolgreich")
    print(f"{'='*60}")
    for r in results:
        status_icon = "✅" if r["status"] == "ok" else "❌"
        print(f"  {status_icon} {r['url']}")

    # Save summary
    summary_path = os.path.join(OUTPUT_DIR, f"batch_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json")
    with open(summary_path, "w", encoding="utf-8") as f:
        json.dump(results, f, indent=2, ensure_ascii=False)
    print(f"\n[*] Summary gespeichert: {summary_path}")

if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser(description="OMEGA Batch Processor - Mehrere URLs verarbeiten")
    parser.add_argument("urls_file", help="Datei mit URLs (eine pro Zeile, # für Kommentare)")
    parser.add_argument("--niche", "-n", required=True)
    parser.add_argument("--objections", "-o", default="")
    parser.add_argument("--style", "-s", default="Messerscharfer Direkt-Response-Experte")
    parser.add_argument("--delay", "-d", type=int, default=5, help="Verzögerung zwischen Runs in Sekunden")
    args = parser.parse_args()
    batch_process(args.urls_file, args.niche, args.objections, args.style, args.delay)
PYEOF
