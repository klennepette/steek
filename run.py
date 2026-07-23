"""
Steek - Borduurweelde Inventory & Point-of-Sale
Entry point: checks for updates, starts Flask, opens browser.
"""

import threading
import webbrowser
import time
import sys
from pathlib import Path

from updater import check_and_update, get_local_version

PORT = 5000
HOST = "127.0.0.1"
VERSION = get_local_version()


def open_browser():
    """Open the browser after a short delay to let Flask start."""
    time.sleep(1.5)
    webbrowser.open(f"http://{HOST}:{PORT}")


def main():
    # Check for updates on startup (silent — won't crash if offline)
    print(f"Steek v{VERSION} — Borduurweelde")
    print("Controleren op updates...")
    check_and_update(silent=True)

    # Import here so updates to app/ are picked up after restart
    from app import create_app
    flask_app = create_app()

    # Inject version and update info into all templates
    remote_version = None
    try:
        from updater import get_remote_version, is_newer
        remote_version = get_remote_version()
    except Exception:
        pass

    update_available = (
        remote_version is not None and is_newer(remote_version, VERSION)
    )

    @flask_app.context_processor
    def inject_globals():
        return {
            "version": VERSION,
            "update_available": update_available,
        }

    # Open browser in background thread
    threading.Thread(target=open_browser, daemon=True).start()

    print(f"Steek gestart op http://{HOST}:{PORT}")
    print("Druk op Ctrl+C om te stoppen.")
    print()

    flask_app.run(host=HOST, port=PORT, debug=False, use_reloader=False)


if __name__ == "__main__":
    main()
