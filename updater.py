"""
Self-update mechanism.
Checks GitHub for a newer version tag on startup.
If found, runs git pull + pip install and restarts.
"""

import subprocess
import sys
import os
from pathlib import Path

GITHUB_REPO = "klennepette/steek"
VERSION_FILE = Path(__file__).parent / "version.txt"


def get_local_version() -> str:
    try:
        return VERSION_FILE.read_text().strip()
    except FileNotFoundError:
        return "0.0.0"


def get_remote_version() -> str | None:
    """Fetch the latest release tag from GitHub API."""
    try:
        import requests
        resp = requests.get(
            f"https://api.github.com/repos/{GITHUB_REPO}/releases/latest",
            timeout=5,
            headers={"Accept": "application/vnd.github.v3+json"},
        )
        if resp.status_code == 200:
            tag = resp.json().get("tag_name", "")
            return tag.lstrip("v")
    except Exception:
        pass
    return None


def _version_tuple(v: str):
    try:
        return tuple(int(x) for x in v.split("."))
    except ValueError:
        return (0, 0, 0)


def is_newer(remote: str, local: str) -> bool:
    return _version_tuple(remote) > _version_tuple(local)


def run_update():
    """Pull latest code and reinstall dependencies."""
    root = Path(__file__).parent
    print("Update gevonden! Bezig met updaten...")

    subprocess.run(["git", "pull", "origin", "main"], cwd=root, check=True)
    subprocess.run(
        [sys.executable, "-m", "pip", "install", "-r", "requirements.txt", "--quiet"],
        cwd=root,
        check=True,
    )

    print("Update voltooid. App wordt herstart...")
    os.execv(sys.executable, [sys.executable] + sys.argv)


def check_and_update(silent: bool = True) -> bool:
    """
    Check for updates.
    Returns True if update was applied (app will restart).
    Returns False if no update needed.
    """
    local = get_local_version()
    remote = get_remote_version()

    if remote is None:
        if not silent:
            print("Kan versie niet controleren (geen internetverbinding?).")
        return False

    if is_newer(remote, local):
        run_update()
        return True  # Won't reach here (os.execv restarts)

    if not silent:
        print(f"Nieuwste versie ({local}) is al geïnstalleerd.")
    return False
