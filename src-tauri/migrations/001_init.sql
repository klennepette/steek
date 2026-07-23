-- Categories
CREATE TABLE IF NOT EXISTS categories (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    name        TEXT    NOT NULL UNIQUE,
    sort_order  INTEGER NOT NULL DEFAULT 0
);

-- Products
CREATE TABLE IF NOT EXISTS products (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    name         TEXT    NOT NULL,
    description  TEXT,
    sku          TEXT    UNIQUE,
    category_id  INTEGER REFERENCES categories(id) ON DELETE SET NULL,
    price        REAL    NOT NULL DEFAULT 0,      -- incl. VAT
    vat_pct      REAL    NOT NULL DEFAULT 6,      -- 6% for most hobby goods in BE
    stock        INTEGER NOT NULL DEFAULT 0,
    active       INTEGER NOT NULL DEFAULT 1,      -- boolean: 1=active, 0=inactive
    created_at   TEXT    NOT NULL DEFAULT (datetime('now')),
    updated_at   TEXT    NOT NULL DEFAULT (datetime('now'))
);

-- Sales (one row per checkout)
CREATE TABLE IF NOT EXISTS sales (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    created_at      TEXT    NOT NULL DEFAULT (datetime('now')),
    total_excl      REAL    NOT NULL DEFAULT 0,
    total_vat       REAL    NOT NULL DEFAULT 0,
    total_incl      REAL    NOT NULL DEFAULT 0,
    payment_method  TEXT    NOT NULL DEFAULT 'cash',  -- cash | payconiq | mixed
    note            TEXT
);

-- Sale lines (one row per product per sale)
CREATE TABLE IF NOT EXISTS sale_lines (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    sale_id       INTEGER NOT NULL REFERENCES sales(id) ON DELETE CASCADE,
    product_id    INTEGER REFERENCES products(id) ON DELETE SET NULL,
    product_name  TEXT    NOT NULL,   -- snapshot of name at time of sale
    quantity      INTEGER NOT NULL DEFAULT 1,
    unit_price    REAL    NOT NULL,   -- incl. VAT
    vat_pct       REAL    NOT NULL DEFAULT 6,
    subtotal      REAL    NOT NULL    -- quantity * unit_price
);

-- Settings (key/value store)
CREATE TABLE IF NOT EXISTS settings (
    key    TEXT PRIMARY KEY,
    value  TEXT
);

-- Default settings
INSERT OR IGNORE INTO settings (key, value) VALUES
    ('shop_name',       'Borduurweelde'),
    ('vat_number',      ''),
    ('default_vat',     '6'),
    ('update_url',      ''),
    ('printer_name',    '');

-- Default categories
INSERT OR IGNORE INTO categories (name, sort_order) VALUES
    ('Borduurpakketten',   1),
    ('Haakpakketten',      2),
    ('Wol & haakkatoen',   3),
    ('Mercerie',           4),
    ('Stoffen en garen',   5),
    ('Boeken',             6),
    ('Kids',               7),
    ('Overige',            99);
