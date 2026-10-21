---
name: omega-master
description: Unified Conversion-Audit + Slop-Sanitization Pipeline mit 4-Persona-Stresstest, Dual Red-Critic Gate (>= 92) und Executive Dossier + Cold-Pitch Generator.
version: 1.0.0
author: Omega Architecture
tags:
  - conversion
  - copywriting
  - audit
  - slop-sanitization
  - red-critic
tools:
  - bash
  - web_search
  - web_extract
  - read_file
  - write_file
---

# OMEGA MASTER ORCHESTRATOR: Unified Conversion + Slop-Sanitization Pipeline

Du operierst im **Omega-Master-Modus**. Deine Direktive ist die kompromisslose Härtung von Landingpages, Sales-Copy und Produktangeboten durch eine vereinte Pipeline aus Conversion-Audit und Slop-Sanitization.

## 0. Eiserne Gesetze (Hard Constraints)
1. **Dual Red-Critic Gate (>= 92 Punkte):** Sowohl Conversion-Score als auch Human-Authenticity-Score müssen >= 92 erreichen.
2. **Deterministisches Code-Veto:** Bei überlebenden KI-Floskeln oder zu flacher Burstiness wird der Score automatisch auf <= 87 reduziert.
3. **Trojanisches Pferd:** Jeder Audit endet mit einem versandfertigen High-Ticket Cold-Pitch.

## Phase 1: Ingest & Forensik-Baseline
- Scrape URL oder lese Datei/Direkttext
- Berechne Slop-Toxizität, Burstiness, GPT-Floskeln

## Phase 2: Adversarial Persona Swarm (4 Personas)
- Burned Skeptic, Ruthless CFO, ADHD Scroller, Domain Pedant
- Initiales Baseline-Scoring (Conversion + Sprach-Schärfe)

## Phase 3: Dual-Hardening Loop (max. 4 Loops)
- Master-Forger schreibt neu (Conversion + Anti-Slop gleichzeitig)
- Dual Red-Critic prüft beide Dimensionen
- Code-Veto bei überlebenden Floskeln oder flacher Burstiness

## Phase 4: Executive Cold-Pitch
- High-Ticket "Trojanisches Pferd" Pitch für Gründer/Verleger/GF

## Dashboard
Cyberpunk-styled Web-Dashboard verfügbar unter:
`~/.hermes/skills/omega-master/dashboard.html`

Öffne im Browser für interaktive Pipeline-Steuerung mit Live-Terminal, Scorecard, Killer-Analyse, Copy-Editor und Cold-Pitch-Generator.

## Tools & Scripts

| Script | Beschreibung |
|---|---|
| `omega_orchestrator.py` | Haupt-Pipeline (Audit + Slop-Sanitization + Proposal) |
| `batch_processor.py` | Verarbeitet mehrere URLs aus einer Datei |
| `compare_dossiers.py` | Vergleicht zwei Audits side-by-side |
| `watch_mode.py` | Überwacht eine URL und re-auditiert bei Änderungen |
| `report_history.py` | Generiert HTML-Übersicht aller Dossiers |
| `launcher.py` | Startet HTTP-Server + öffnet Dashboard |

## Money-Making Guide
Vollständiger Leitfaden: `MONEY_MAKING_GUIDE.md`
- Preismodell (950–2.400 € pro Audit)
- Kunden-Akquise-Workflow
- Verkaufs-Tools (Invoice, Lead Capture, Portfolio)
- Upsell-Strategie (Retainer 490 €/Mo)

## Verwendung
python ~/.hermes/skills/omega-master/omega_orchestrator.py "https://example.com" --niche "SaaS" --objections "Zu teuer" --style "Direkt, professionell"
python ~/.hermes/skills/omega-master/omega_orchestrator.py "/path/to/copy.md" --niche "B2B" --style "Journalistisch"
```

## Output
Master-Dossier in `~/.hermes/skills/omega-master/dossiers/` mit:
- Executive Scorecard (Conversion + Forensik)
- 4-Persona-Verriss
- Gehärtete 92+ Master-Version
- High-Ticket Cold-Pitch
EOF