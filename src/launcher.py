#!/usr/bin/env python3
"""OMEGA Master Launcher - Startet Dashboard + Report History im Browser."""
import os, webbrowser, http.server, socketserver, threading, time, subprocess

SKILL_DIR = os.path.expanduser("~/.hermes/skills/omega-master")
PORT = 8765

def serve():
    os.chdir(SKILL_DIR)
    handler = http.server.SimpleHTTPRequestHandler
    with socketserver.TCPServer(("", PORT), handler) as httpd:
        print(f"OMEGA Server läuft auf http://localhost:{PORT}")
        httpd.serve_forever()

if __name__ == "__main__":
    t = threading.Thread(target=serve, daemon=True)
    t.start()
    import time
    time.sleep(1)
    # Generate report history first
    subprocess.run(["python", os.path.join(SKILL_DIR, "report_history.py")], check=False)
    webbrowser.open(f"http://localhost:{PORT}/dashboard.html")
    print("Dashboard geöffnet. Drücke Ctrl+C zum Beenden.")
    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        print("\nServer beendet.")