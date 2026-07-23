import sqlite3
from pathlib import Path

DB_PATH = Path(__file__).parent.parent / "steek.db"


def get_db():
    """Open a database connection with row_factory for dict-like access."""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")
    return conn


def init_db():
    """Create tables and seed default data if not present."""
    with get_db() as conn:
        conn.executescript("""
            CREATE TABLE IF NOT EXISTS products (
                id           INTEGER PRIMARY KEY AUTOINCREMENT,
                name         TEXT    NOT NULL,
                barcode      TEXT    UNIQUE,
                packetcode   TEXT    UNIQUE,
                description  TEXT,
                price        REAL    NOT NULL DEFAULT 0,
                stock        INTEGER NOT NULL DEFAULT 0,
                consignation INTEGER NOT NULL DEFAULT 0,
                active       INTEGER NOT NULL DEFAULT 1,
                created_at   TEXT    NOT NULL DEFAULT (datetime('now')),
                updated_at   TEXT    NOT NULL DEFAULT (datetime('now'))
            );

            CREATE INDEX IF NOT EXISTS idx_products_barcode
                ON products(barcode);
            CREATE INDEX IF NOT EXISTS idx_products_packetcode
                ON products(packetcode);

            CREATE TABLE IF NOT EXISTS sales (
                id             INTEGER PRIMARY KEY AUTOINCREMENT,
                created_at     TEXT    NOT NULL DEFAULT (datetime('now')),
                total          REAL    NOT NULL DEFAULT 0,
                payment_method TEXT    NOT NULL DEFAULT 'cash',
                note           TEXT
            );

            CREATE TABLE IF NOT EXISTS sale_lines (
                id            INTEGER PRIMARY KEY AUTOINCREMENT,
                sale_id       INTEGER NOT NULL REFERENCES sales(id) ON DELETE CASCADE,
                product_id    INTEGER REFERENCES products(id) ON DELETE SET NULL,
                product_name  TEXT    NOT NULL,
                quantity      INTEGER NOT NULL DEFAULT 1,
                unit_price    REAL    NOT NULL,
                subtotal      REAL    NOT NULL
            );

            CREATE TABLE IF NOT EXISTS settings (
                key   TEXT PRIMARY KEY,
                value TEXT
            );

            INSERT OR IGNORE INTO settings (key, value) VALUES
                ('shop_name',    'Borduurweelde'),
                ('printer_name', '');
        """)
