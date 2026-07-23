# Steek - Borduurweelde Inventory & Point-of-Sale

Offline-first inventory and POS app for Borduurweelde market stalls.

## Tech Stack

- **Python** + **Flask** (web server)
- **HTMX** (dynamic UI, no JavaScript framework)
- **SQLite** (built into Python, zero config)
- **Jinja2** (HTML templates, built into Flask)

## Requirements

- Python 3.10+
- Git

## Getting Started

### Windows

```bash
git clone https://github.com/klennepette/steek.git
cd steek
start.bat
```

### Linux / macOS

```bash
git clone https://github.com/klennepette/steek.git
cd steek
./start.sh
```

The app opens automatically in your browser at `http://localhost:5000`.

## Desktop Shortcut (Windows)

```powershell
Set-ExecutionPolicy -ExecutionPolicy Bypass -Scope Process
.\create-shortcut.ps1
```

## Auto-Update

On startup, Steek checks GitHub for a newer release tag.
If found, it runs `git pull`, reinstalls dependencies, and restarts automatically.

## Features

- 🛒 **Kassa** — Barcode scanner integration, cart, payment methods
- 📦 **Voorraad** — Product management (barcode, packetcode, stock, consignation)
- 📊 **Verkopen** — Sales history with day totals
- ⚙️ **Instellingen** — Settings + update status
