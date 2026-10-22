#!/usr/bin/env python3
"""
OMEGA Master Desktop App
PyWebView-basierte Desktop-Anwendung für den OMEGA Master Orchestrator.
Wrappt die Cyberpunk-Web-UI in ein natives Desktop-Fenster.
"""

import os
import sys
import json
import subprocess
import threading
from pathlib import Path

# Ensure PYTHONPATH doesn't poison imports
os.environ.pop("PYTHONPATH", None)

SKILL_DIR = Path(os.path.expanduser("~/.hermes/skills/omega-master"))
OUTPUT_DIR = SKILL_DIR / "dossiers"
LEADS_DIR = SKILL_DIR / "leads"
OUTREACH_DIR = SKILL_DIR / "outreach"
PYTHON_EXE = sys.executable

# Add skill dir to path for imports
sys.path.insert(0, str(SKILL_DIR))

import webview

class OmegaAPI:
    """Python API exposed to the webview via JS bridge."""

    def __init__(self):
        self.window = None

    def run_audit(self, target, niche, objections, style):
        """Führt einen OMEGA Audit aus."""
        try:
            from omega_orchestrator import run_master_pipeline
            run_master_pipeline(target, niche, objections, style)
            return {"status": "ok", "message": "Audit abgeschlossen"}
        except Exception as e:
            return {"status": "error", "message": str(e)}

    def get_dossiers(self):
        """Listet alle Dossiers auf."""
        if not OUTPUT_DIR.exists():
            return []
        files = sorted(OUTPUT_DIR.glob("*_EXECUTIVE_REPORT.html"), reverse=True)
        return [{"name": f.name, "path": str(f)} for f in files[:20]]

    def open_file(self, path):
        """Öffnet eine Datei im Standard-Browser/Editor."""
        import webbrowser
        if path.endswith(".html"):
            webbrowser.open(f"file:///{path.replace(os.sep, '/')}")
        else:
            os.startfile(path) if sys.platform == "win32" else subprocess.run(["xdg-open", path])
        return {"status": "ok"}

    def generate_invoice(self, client, package, project):
        """Generiert eine Rechnung."""
        try:
            result = subprocess.run(
                [PYTHON_EXE, str(SKILL_DIR / "invoice_generator.py"),
                 "--client", client, "--package", package, "--project", project],
                capture_output=True, text=True, cwd=str(SKILL_DIR)
            )
            return {"status": "ok" if result.returncode == 0 else "error",
                    "output": result.stdout + result.stderr}
        except Exception as e:
            return {"status": "error", "message": str(e)}

    def get_status(self):
        """Gibt System-Status zurück."""
        ollama_ok = False
        try:
            import urllib.request
            urllib.request.urlopen("http://localhost:11434/api/tags", timeout=3)
            ollama_ok = True
        except Exception:
            pass
        return {
            "ollama": ollama_ok,
            "python": sys.version.split()[0],
            "skill_dir": str(SKILL_DIR),
            "dossiers": len(list(OUTPUT_DIR.glob("*.html"))) if OUTPUT_DIR.exists() else 0,
        }


def get_html_path():
    """Pfad zur Dashboard-HTML."""
    dashboard = SKILL_DIR / "dashboard.html"
    if dashboard.exists():
        return str(dashboard)
    # Fallback: embedded HTML
    return None


def main():
    api = OmegaAPI()

    html_path = get_html_path()
    if html_path:
        window = webview.create_window(
            "OMEGA Master Orchestrator",
            url=f"file:///{html_path.replace(os.sep, '/')}",
            js_api=api,
            width=1400,
            height=900,
            min_size=(1000, 700),
            background_color="#090d16",
        )
    else:
        # Fallback embedded
        window = webview.create_window(
            "OMEGA Master Orchestrator",
            html="<h1>OMEGA Master</h1><p>Dashboard nicht gefunden.</p>",
            js_api=api,
            width=1400,
            height=900,
        )

    api.window = window
    webview.start(debug=False)


if __name__ == "__main__":
    main()
