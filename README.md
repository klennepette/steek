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

## S3 Backup

Steek can automatically back up the database to Amazon S3.
Backups run when the app starts and then every N minutes (default 60, configurable).

### 1. Create an S3 bucket

1. Go to the [S3 Console](https://s3.console.aws.amazon.com/)
2. Click **Create bucket**
3. Choose a name (e.g. `borduurweelde-backups`)
4. Choose a region (e.g. `eu-west-1`)
5. Leave other settings at their defaults and click **Create**

### 2. Create an IAM user

1. Go to the [IAM Console](https://console.aws.amazon.com/iam/)
2. Click **Users → Create user**
3. Give it a name (e.g. `steek-backup`) and click **Next**
4. Select **Attach policies directly** → **Create inline policy**
5. Switch to the **JSON** tab and paste:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": ["s3:PutObject", "s3:PutObjectAcl"],
      "Resource": "arn:aws:s3:::borduurweelde-backups/backups/*"
    }
  ]
}
```

Replace `borduurweelde-backups` with your bucket name.

6. Click **Next → Create user**
7. Open the user, go to the **Security credentials** tab, and click **Create access key**
8. Choose **Application running outside AWS** → **Next**
9. Copy the **Access Key ID** and **Secret Access Key**

### 3. Configure in Steek

1. Open Steek and go to **Instellingen**
2. Fill in the **AWS S3 Backup** section:
   - **Access Key ID** — from step 2.9
   - **Secret Access Key** — from step 2.9
   - **Bucket naam** — your bucket name
   - **Regio** — the region you chose (e.g. `eu-west-1`)
   - **Backup interval (minuten)** — how often to back up (default 60)
3. Click **Opslaan**
4. Click **Backup nu naar S3** to test the connection

## Features

- 🛒 **Kassa** — Barcode scanner integration, cart, payment methods
- 📦 **Voorraad** — Product management (barcode, packetcode, stock, consignation)
- 📊 **Verkopen** — Sales history with day totals
- ⚙️ **Instellingen** — Settings, S3 backup config, DB backup/restore
