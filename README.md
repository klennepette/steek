# Steek - Borduurweelde Inventory & Point-of-Sale

A modern, offline-first desktop application for managing inventory and processing sales at Borduurweelde's market stalls.

## Features

- **Barcode Scanner Integration** — Scan barcodes, packetcodes, or search by name
- **Real-time Inventory Tracking** — Track stock levels across product categories
- **Sales Recording** — Process transactions with multiple payment methods (cash, Payconiq, mixed)
- **Consignment Support** — Handle consignment stock separately
- **Offline-First** — Works completely offline, syncs on next update
- **Auto-Update** — Pull latest changes from GitHub via git

## Tech Stack

- **Frontend:** SvelteKit + TypeScript + Tailwind CSS
- **Backend:** Tauri v2 + Rust
- **Database:** SQLite (local)
- **Deployment:** Source code distribution (no binary builds)

## Getting Started

### Linux (Development)

```bash
git clone https://github.com/klennepette/steek.git
cd steek
npm install
npm run tauri dev
```

### Windows (End Users)

See [WINDOWS_SETUP.md](WINDOWS_SETUP.md) for step-by-step instructions to create a desktop shortcut.

Quick summary:
1. Clone the repo
2. Run `create-shortcut.ps1`
3. Double-click the "Steek" desktop shortcut

### macOS

```bash
git clone https://github.com/klennepette/steek.git
cd steek
npm install
npm run tauri dev
```

Then run `./update.sh` to update in the future.

## Development

### Prerequisites

- **Node.js** (LTS): https://nodejs.org/
- **Rust**: https://www.rust-lang.org/tools/install
- **Git**: https://git-scm.com/

### Running in Development Mode

```bash
npm run tauri dev
```

This starts the Vite dev server with hot reload. Perfect for active development.

### Running in Production Mode (Windows)

```bash
steek-launcher-prod.bat
```

Or on Linux/macOS:
```bash
npm run build
npm run tauri dev
```

Production mode pre-builds the frontend for faster startup and more stable performance.

## Project Structure

```
steek/
├── src/                    # Frontend (SvelteKit)
│   ├── lib/
│   │   ├── db.ts          # Database functions
│   │   └── utils.ts       # UI utilities
│   └── routes/
│       ├── kassa/         # Checkout/POS
│       ├── voorraad/      # Inventory management
│       ├── verkopen/      # Sales history
│       └── instellingen/  # Settings
├── src-tauri/             # Backend (Rust)
│   ├── src/               # Tauri commands
│   ├── migrations/        # SQLite schema
│   └── tauri.conf.json    # App configuration
├── steek-launcher.bat     # Dev mode launcher (Windows)
├── steek-launcher-prod.bat # Production launcher (Windows)
├── create-shortcut.ps1    # Create desktop shortcut (Windows)
└── update.sh              # Update script (Linux/macOS)
```

## Database Schema

- **products** — Name, barcode, packetcode, price, stock, consignation flag
- **sales** — Timestamp, total, payment method, note
- **sale_lines** — Individual items in each sale
- **settings** — App configuration (shop name, printer, etc.)

## Updating

### Windows
- Run `update.bat` in the steek folder, then restart the app

### Linux/macOS
```bash
./update.sh
```

## Releases

Releases are published as source code on GitHub:
https://github.com/klennepette/steek/releases

To use a specific release, clone and checkout the tag:
```bash
git clone https://github.com/klennepette/steek.git
git checkout v0.1.0
npm install
npm run tauri dev
```

## IDE Setup

Recommended setup:
- **VS Code**
- Extensions: Svelte, Tauri, rust-analyzer
- Run `npm run tauri dev` in the terminal

## License

MIT

## Support

For issues or questions, visit: https://github.com/klennepette/steek/issues
