# Ω OMEGA Master Orchestrator

> **Adversarial Swarm Stresstest & Deterministischer Slop-Sanitizer** — Ein KI-gestütztes System zur kompromisslosen Härtung von Landingpages, Sales-Copy und Produktangeboten.

![Version](https://img.shields.io/badge/version-3.0-blue)
![Python](https://img.shields.io/badge/python-3.11+-green)
![License](https://img.shields.io/badge/license-MIT-orange)
![Status](https://img.shields.io/badge/status-production--ready-emerald)

---

## 🎯 Was ist OMEGA Master?

OMEGA Master Orchestrator kombiniert zwei leistungsstarke KI-Engines in einer einzigen Pipeline:

1. **Swarm-Auditor** — 4 feindliche Käufer-Personas (Burned Skeptic, Ruthless CFO, ADHD Scroller, Domain Pedant) analysieren Landingpages und Sales-Copy
2. **Slop-Sanitizer** — Deterministische Forensik erkennt KI-generierte Floskeln und misst die Burstiness (Satzlängen-Dynamik)

**Ergebnis:** Eine gehärtete, conversion-optimierte Copy mit ≥ 92 Punkten in beiden Dimensionen (Conversion + Sprach-Reinheit).

---

## ✨ Features

### Core Pipeline
- **4 Adversarial Personas** — Jede mit eigener Perspektive und Kritik
- **Dual Red-Critic Gate** — ≥ 92 Punkte in Conversion UND Human-Authenticity
- **Deterministisches Code-Veto** — Automatische Score-Reduktion bei überlebenden KI-Floskeln
- **Automatischer Cold-Pitch** — "Trojanisches Pferd" Permissionless Value Pitch
- **Proposal-Generator** — Maßgeschneidertes High-Ticket Service-Angebot
- **Executive HTML Report** — Druckoptimiert mit Scorecard, Copy, Pitch, Proposal

### Tools & Scripts
| Script | Beschreibung |
|---|---|
| `omega_orchestrator.py` | Haupt-Pipeline (Audit + Slop-Sanitization + Proposal) |
| `omega_hunter.py` | Batch Lead Hunter & Outreach Automation (CSV → Pipeline → E-Mail) |
| `batch_processor.py` | Verarbeitet mehrere URLs aus einer Datei |
| `compare_dossiers.py` | Vergleicht zwei Audits side-by-side |
| `watch_mode.py` | Überwacht URL, re-auditiert bei Änderungen |
| `report_history.py` | Generiert HTML-Übersicht aller Dossiers |
| `launcher.py` | Startet HTTP-Server + öffnet Dashboard |
| `invoice_generator.py` | Erstellt Rechnungen (HTML + JSON, MwSt. 19%) |
| `portfolio_generator.py` | Erstellt Case-Study-Showcase-Seite |

### Web-UI
- **Dashboard** — Cyberpunk Web-UI mit Live-Terminal, Scorecard, Killer-Analyse, Copy-Editor, Cold-Pitch-Generator
- **Lead Capture** — Landingpage für kostenlose Erst-Audits
- **Portfolio** — Case-Study-Showcase mit Scores und Deltas

---

## 🚀 Schnellstart

### 1. Installation

```bash
# Voraussetzungen
pip install reportlab

# Ollama installieren (https://ollama.com)
# Modell laden
ollama pull qwen2.5:14b

# Repository klonen
git clone https://github.com/mrmixx-max/omega-master-orchestrator.git
cd omega-master-orchestrator
```

### 2. Ersten Audit durchführen

```bash
python src/omega_orchestrator.py \
  --target "https://example.com" \
  --niche "B2B SaaS" \
  --objections "Zu teuer, zu komplex" \
  --style "Messerscharfer Direkt-Response-Experte"
```

### 3. Ergebnis

```
dossiers/
├── 20261021_143022_example_com_MASTER_DOSSIER.md
└── 20261021_143022_example_com_MASTER_DOSSIER_EXECUTIVE_REPORT.html
```

Der HTML-Report öffnet sich automatisch im Browser und kann als PDF gespeichert werden (Drucken → Als PDF speichern).

---

## 📋 CLI-Referenz

### omega_orchestrator.py

```bash
python src/omega_orchestrator.py --target URL --niche "SaaS" --objections "Zu teuer" --style "Direkt"
```

| Parameter | Kurz | Beschreibung | Default |
|---|---|---|---|
| `--target` | `-t` | Ziel-URL, Datei oder Text | required |
| `--niche` | `-n` | Markt/Nische | required |
| `--objections` | `-o` | Bekannte Käufer-Einwände | `""` |
| `--style` | `-s` | Ziel-Tonalität | Messerscharfer Direkt-Response-Experte |

### Weitere Tools

```bash
# Batch-Verarbeitung
python src/batch_processor.py urls.txt --niche "SaaS" --delay 5

# URL-Überwachung (stündlich)
python src/watch_mode.py "https://example.com" --niche "SaaS" --interval 3600

# Audits vergleichen
python src/compare_dossiers.py dossier1.md dossier2.md

# Rechnung erstellen
python src/invoice_generator.py --client "Firma GmbH" --package "pre-launch" --project "Landingpage Audit"

# Portfolio generieren
python src/portfolio_generator.py

# Dashboard starten
python src/launcher.py
```

---

## 💰 Preismodell

| Paket | Preis | Inhalt |
|---|---|---|
| Pre-Launch Autopsy | 950 € | 4-Persona + Slop + Dossier + Pitch |
| Full-Funnel Overhaul | 2.400 € | Komplett + 3 Loops + Proposal + 30 Tage Support |
| Audit Only | 490 € | 4-Persona + Scorecard + Killer-Analyse |
| Slop-Sanitization Only | 350 € | Forensik + Härtung + B2B Pitch |
| Monatlicher Retainer | 490 €/Mo | Re-Audit + Optimierung + Priority Support |
| Batch-Verarbeitung | 490 €/Batch | Bis zu 10 URLs |
| Watch Mode | 490 €/Mo | Kontinuierliche Überwachung + Re-Audit |

### Kunden-Akquise-Workflow

```
1. Lead Capture (lead_capture.html) → kostenlose Erst-Audits
2. Cold-Pitch → Automatisch aus dem Dossier
3. Proposal → High-Ticket Angebot (950–2.400 €)
4. Rechnung → invoice_generator.py
5. Delivery → Executive HTML Report
6. Upsell → Retainer (490 €/Mo)
```

---

## 🏗️ Architektur

```
┌─────────────────────────────────────────────────┐
│                  OMEGA PIPELINE                  │
├─────────────────────────────────────────────────┤
│  Phase 0: Ingest (URL scrape / File / Text)     │
│  Phase 1: 4-Persona Swarm (Skeptic, CFO, ...)   │
│  Phase 2: Dual-Hardening Loop (≤4 Loops)        │
│    ├── Master-Forger (Conversion + Anti-Slop)   │
│    ├── Dual Red-Critic (≥92 in beiden)          │
│    └── Code-Veto (Regex + Burstiness)           │
│  Phase 3: Output                                │
│    ├── Markdown Dossier                         │
│    ├── Executive HTML Report (+ Proposal)       │
│    ├── Cold-Pitch (Trojanisches Pferd)          │
│    └── SQLite memory.db Entry                   │
└─────────────────────────────────────────────────┘
```

---

## 🔧 Konfiguration

### Umgebungsvariablen

| Variable | Default | Beschreibung |
|---|---|---|
| `OMEGA_API_URL` | `http://localhost:11434/v1/chat/completions` | LLM-Endpunkt |
| `OMEGA_MODEL` | `qwen2.5:14b` | Modellname |
| `OMEGA_API_KEY` | `ollama` | API-Key |
| `HERMES_MEMORY_DB` | `~/.hermes/memory.db` | SQLite-Datenbankpfad |

### config.json

```json
{
    "llm_api_url": "http://localhost:11434/v1/chat/completions",
    "llm_model": "qwen2.5:14b",
    "llm_api_key": "ollama",
    "min_critic_score": 92,
    "max_loops": 4,
    "retry_attempts": 3
}
```

---

## 📁 Dateistruktur

```
omega-master-orchestrator/
├── src/
│   ├── omega_orchestrator.py      # Haupt-Pipeline
│   ├── batch_processor.py         # Batch-Verarbeitung
│   ├── compare_dossiers.py        # Vergleichstool
│   ├── watch_mode.py              # URL-Überwachung
│   ├── report_history.py          # Dossier-Übersicht
│   ├── launcher.py                # Web-Server + Dashboard
│   ├── invoice_generator.py       # Rechnungs-Generator
│   └── portfolio_generator.py     # Case-Study-Showcase
├── web/
│   ├── dashboard.html             # Cyberpunk Web-UI
│   └── lead_capture.html          # Lead-Generierungs-Landingpage
├── docs/
│   ├── MONEY_MAKING_GUIDE.md      # Verkaufs-Leitfaden
│   └── OMEGA_Master_Handbuch_Premium.pdf
├── dossiers/                      # Output-Verzeichnis
├── invoices/                      # Rechnungs-Verzeichnis
├── config.json                    # Konfiguration
├── SKILL.md                       # Skill-Dokumentation
└── README.md                      # Diese Datei
```

---

## 🔍 Troubleshooting

| Problem | Lösung |
|---|---|
| LLM-Timeout | Schnelleres Modell nutzen oder timeout erhöhen |
| JSON-Parse-Fehler | `parse_json_safe()` fängt Fehler ab |
| Keine Dossiers gefunden | OUTPUT_DIR Pfad prüfen |
| DB-Fehler | `init_db()` erstellt Tabellen automatisch |
| Slop-Veto ausgelöst | Überlebende Floskeln entfernen, Burstiness erhöhen |

---

## 📄 Lizenz

MIT License — frei nutzbar für kommerzielle und nicht-kommerzielle Zwecke.

---

## 👤 Autor

**Erik Gieske** (mrmixx-max)
- GitHub: [mrmixx-max](https://github.com/mrmixx-max)
- Email: erikgieske@gmail.com
- Hamburg, Deutschland

---

*Erstellt mit OMEGA Master Orchestrator v3.0*