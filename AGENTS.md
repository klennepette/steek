# Steek — Agent guide

Offline-first inventory & POS app for Borduurweelde market stalls.

## Stack

Python 3.10+ / Flask / HTMX 2 / Jinja2 / SQLite. No JS framework, no build step, no tests, no CI.

## First run

```bash
python3 -m venv .venv && .venv/bin/pip install -r requirements.txt
.venv/bin/python run.py
```

Or use `start.sh` / `start.bat` (auto-creates venv, pulls git, installs deps).

Opens at `http://127.0.0.1:5000`.

## Structure

```
run.py              # Entrypoint: update check, creates app, opens browser
updater.py          # git pull + pip install + os.execv self-restart
app/
  __init__.py       # create_app() — hardcoded secret_key, registers blueprints
  database.py       # get_db() / init_db() — auto-creates steek.db tables
  backup.py         # S3 backup — reads AWS keys from DB settings
  routes/
    main.py         /  redirects to /kassa
    products.py     /voorraad/  (+ /zoek HTMX endpoint)
    sales.py        /kassa/  (+ /geschiedenis, /export/xlsx)
    settings.py     /instellingen/  (+ backup/restore DB, S3 config)
  templates/        Jinja2, UI is Dutch
  static/
    css/app.css
    js/checkout.js  # In-memory cart, HTMX integration for barcode search
```

## Database

- `steek.db` created at repo root on first `create_app()` call — no migrations needed (idempotent `CREATE TABLE IF NOT EXISTS`).
- Tables: `products`, `sales`, `sale_lines`, `settings`.
- Products have both `barcode` (unique) and `packetcode` (unique). `consignation` is a boolean (0/1 integer).
- Payment methods stored as strings: `cash`, `payconiq`, `mixed`.
- `PRAGMA foreign_keys = ON` set per-connection.

## Key flows

- **Barcode scanning**: `/voorraad/zoek` HTMX endpoint — exact barcode match auto-adds to cart, partial name/packetcode match shows dropdown with Enter-to-confirm.
- **Checkout cart**: client-side in `checkout.js` (array + hidden form fields). Submits line fields as `line_product_id_N`, `line_name_N`, etc.
- **Auto-update**: `run.py` → `updater.check_and_update()` → GitHub API → `git pull origin main` → `pip install -r` → `os.execv`.
- **DB backup/restore**: settings page, `.db` file download/upload, auto-creates `steek_pre_restore_*.db` before restore.
- **S3 backup**: AWS keys stored in `settings` table, configurable via settings page. Manual button + automatic background scheduler (daemon thread, fails silently offline). Backup runs at startup and every N minutes (default 60, configurable via `backup_interval_minutes` setting). IAM needs `s3:PutObject` on `backups/*`.

## Useful commands

```bash
.venv/bin/python run.py            # Start dev server
.venv/bin/python -c "from app import create_app; create_app()"  # Quick init test
```

No lint, typecheck, test, or format commands exist.

## Notes

- All UI text, URLs, and commit messages are in Dutch.
- Secret key is hardcoded (`steek-borduurweelde`) — acceptable for local-only offline app.
- The `.svelte-kit/` in `.gitignore` is a stale artifact from an abandoned branch.
- `openpyxl` is used for XLSX export of sales history.
