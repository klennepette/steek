-- Products
CREATE TABLE IF NOT EXISTS products (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    name          TEXT    NOT NULL,
    barcode       TEXT    UNIQUE,
    packetcode    TEXT    UNIQUE,
    description   TEXT,
    price         REAL    NOT NULL DEFAULT 0,
    stock         INTEGER NOT NULL DEFAULT 0,
    consignation  INTEGER NOT NULL DEFAULT 0,  -- boolean: 1 = consignment stock
    active        INTEGER NOT NULL DEFAULT 1,  -- boolean: 1 = active
    created_at    TEXT    NOT NULL DEFAULT (datetime('now')),
    updated_at    TEXT    NOT NULL DEFAULT (datetime('now'))
);

-- Index for fast barcode/packetcode lookups (scanner use-case)
CREATE INDEX IF NOT EXISTS idx_products_barcode    ON products(barcode);
CREATE INDEX IF NOT EXISTS idx_products_packetcode ON products(packetcode);

-- Sales (one row per checkout)
CREATE TABLE IF NOT EXISTS sales (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    created_at      TEXT    NOT NULL DEFAULT (datetime('now')),
    total           REAL    NOT NULL DEFAULT 0,
    payment_method  TEXT    NOT NULL DEFAULT 'cash',  -- cash | payconiq | mixed
    note            TEXT
);

-- Sale lines (one row per product per sale)
CREATE TABLE IF NOT EXISTS sale_lines (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    sale_id       INTEGER NOT NULL REFERENCES sales(id) ON DELETE CASCADE,
    product_id    INTEGER REFERENCES products(id) ON DELETE SET NULL,
    product_name  TEXT    NOT NULL,  -- snapshot of name at time of sale
    quantity      INTEGER NOT NULL DEFAULT 1,
    unit_price    REAL    NOT NULL,  -- price at time of sale
    subtotal      REAL    NOT NULL   -- quantity * unit_price
);

-- Settings (key/value store)
CREATE TABLE IF NOT EXISTS settings (
    key    TEXT PRIMARY KEY,
    value  TEXT
);

-- Default settings
INSERT OR IGNORE INTO settings (key, value) VALUES
    ('shop_name',    'Borduurweelde'),
    ('update_url',   ''),
    ('printer_name', '');
