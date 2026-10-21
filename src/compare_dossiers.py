#!/usr/bin/env python3
"""OMEGA Comparison Tool - Vergleicht zwei Dossiers/Audits."""
import os, sys, re, json, glob
from datetime import datetime

OUTPUT_DIR = os.path.expanduser("~/.hermes/skills/omega-master/dossiers")

def parse_dossier(path):
    """Extrahiert Key-Metriken aus einem Dossier."""
    with open(path, "r", encoding="utf-8") as f:
        content = f.read()

    metrics = {"path": path, "filename": os.path.basename(path)}

    # Extract scores
    conv_before = re.search(r"Conversion-Psychologie Score.*?(\d+)\s*/\s*100.*?(\d+)\s*/\s*100", content, re.DOTALL)
    if conv_before:
        metrics["conv_before"] = int(conv_before.group(1))
        metrics["conv_after"] = int(conv_before.group(2))

    slop_before = re.search(r"AI-Slop Toxizität.*?(\d+)%.*?(\d+)%", content, re.DOTALL)
    if slop_before:
        metrics["slop_before"] = int(slop_before.group(1))
        metrics["slop_after"] = int(slop_before.group(2))

    burst_before = re.search(r"Satz-Dynamik \(Burstiness\).*?([\d.]+).*?([\d.]+)", content, re.DOTALL)
    if burst_before:
        metrics["burst_before"] = float(burst_before.group(1))
        metrics["burst_after"] = float(burst_before.group(2))

    # Extract target
    target_match = re.search(r"Geprüftes Ziel:\s*`(.+?)`", content)
    if target_match:
        metrics["target"] = target_match.group(1)

    # Extract niche
    niche_match = re.search(r"Markt / Nische:\s*(.+)", content)
    if niche_match:
        metrics["niche"] = niche_match.group(1).strip()

    # Extract date
    date_match = re.search(r"Datum:\s*(.+)", content)
    if date_match:
        metrics["date"] = date_match.group(1).strip()

    # Extract lethal flaws
    flaws = re.findall(r"\d+\.\s*\*\*(.+?)\*\*", content)
    metrics["flaws"] = flaws

    return metrics

def compare(path1, path2):
    m1 = parse_dossier(path1)
    m2 = parse_dossier(path2)

    print("\n" + "="*70)
    print("OMEGA COMPARISON: Zwei Audits im Vergleich")
    print("="*70)

    print(f"\n{'Metrik':<35} {'Audit 1':>15} {'Audit 2':>15} {'Delta':>10}")
    print("-"*70)

    comparisons = [
        ("Conversion (Vorher)", "conv_before", "/100"),
        ("Conversion (Nachher)", "conv_after", "/100"),
        ("Slop-Toxizität (Vorher)", "slop_before", "%"),
        ("Slop-Toxizität (Nachher)", "slop_after", "%"),
        ("Burstiness (Vorher)", "burst_before", ""),
        ("Burstiness (Nachher)", "burst_after", ""),
    ]

    for label, key, unit in comparisons:
        v1 = m1.get(key, "N/A")
        v2 = m2.get(key, "N/A")
        if isinstance(v1, (int, float)) and isinstance(v2, (int, float)):
            delta = v2 - v1
            delta_str = f"{delta:+.1f}" if isinstance(delta, float) else f"{delta:+d}"
            print(f"{label:<35} {str(v1)+unit:>15} {str(v2)+unit:>15} {delta_str:>10}")
        else:
            print(f"{label:<35} {str(v1):>15} {str(v2):>15} {'N/A':>10}")

    print("\n" + "-"*70)
    print(f"Audit 1: {m1.get('target', 'N/A')} ({m1.get('date', 'N/A')})")
    print(f"Audit 2: {m2.get('target', 'N/A')} ({m2.get('date', 'N/A')})")

    if m1.get("flaws") or m2.get("flaws"):
        print("\n--- Lethal Flaws ---")
        print("Audit 1:")
        for f in m1.get("flaws", []):
            print(f"  • {f}")
        print("Audit 2:")
        for f in m2.get("flaws", []):
            print(f"  • {f}")

def list_dossiers():
    dossiers = sorted(glob.glob(os.path.join(OUTPUT_DIR, "*_MASTER_DOSSIER.md")), reverse=True)
    if not dossiers:
        print("Keine Dossiers gefunden.")
        return
    print(f"\n{'#':<4} {'Datum':<20} {'Ziel':<50}")
    print("-"*74)
    for i, d in enumerate(dossiers, 1):
        m = parse_dossier(d)
        date = m.get("date", "N/A")[:19]
        target = m.get("target", os.path.basename(d))[:48]
        print(f"{i:<4} {date:<20} {target:<50}")

if __name__ == "__main__":
    if len(sys.argv) == 1:
        list_dossiers()
    elif len(sys.argv) == 2:
        list_dossiers()
    elif len(sys.argv) == 3:
        compare(sys.argv[1], sys.argv[2])
    else:
        print("Usage: compare_dossiers.py [dossier1.md] [dossier2.md]")
        print("       compare_dossiers.py  (lists all dossiers)")
