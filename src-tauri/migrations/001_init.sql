-- Categorieën
CREATE TABLE IF NOT EXISTS categorieen (
    id        INTEGER PRIMARY KEY AUTOINCREMENT,
    naam      TEXT    NOT NULL UNIQUE,
    volgorde  INTEGER NOT NULL DEFAULT 0
);

-- Producten
CREATE TABLE IF NOT EXISTS producten (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    naam          TEXT    NOT NULL,
    beschrijving  TEXT,
    sku           TEXT    UNIQUE,
    categorie_id  INTEGER REFERENCES categorieen(id) ON DELETE SET NULL,
    prijs         REAL    NOT NULL DEFAULT 0,
    btw_pct       REAL    NOT NULL DEFAULT 6,   -- 6% voor meeste hobbyartikelen
    voorraad      INTEGER NOT NULL DEFAULT 0,
    actief        INTEGER NOT NULL DEFAULT 1,    -- boolean: 1=actief, 0=inactief
    aangemaakt    TEXT    NOT NULL DEFAULT (datetime('now')),
    bijgewerkt    TEXT    NOT NULL DEFAULT (datetime('now'))
);

-- Verkooptransacties (één rij per afrekening)
CREATE TABLE IF NOT EXISTS verkopen (
    id             INTEGER PRIMARY KEY AUTOINCREMENT,
    datum          TEXT    NOT NULL DEFAULT (datetime('now')),
    totaal_excl    REAL    NOT NULL DEFAULT 0,
    totaal_btw     REAL    NOT NULL DEFAULT 0,
    totaal_incl    REAL    NOT NULL DEFAULT 0,
    betaalmethode  TEXT    NOT NULL DEFAULT 'contant',  -- contant | payconiq | gemengd
    opmerking      TEXT
);

-- Verkoopregels (één rij per product per verkoop)
CREATE TABLE IF NOT EXISTS verkoop_regels (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    verkoop_id   INTEGER NOT NULL REFERENCES verkopen(id) ON DELETE CASCADE,
    product_id   INTEGER REFERENCES producten(id) ON DELETE SET NULL,
    product_naam TEXT    NOT NULL,   -- snapshot van naam op moment van verkoop
    aantal       INTEGER NOT NULL DEFAULT 1,
    stukprijs    REAL    NOT NULL,   -- incl. BTW
    btw_pct      REAL    NOT NULL DEFAULT 6,
    subtotaal    REAL    NOT NULL    -- aantal * stukprijs
);

-- Instellingen (sleutel/waarde)
CREATE TABLE IF NOT EXISTS instellingen (
    sleutel TEXT PRIMARY KEY,
    waarde  TEXT
);

-- Standaard instellingen
INSERT OR IGNORE INTO instellingen (sleutel, waarde) VALUES
    ('winkel_naam',     'Borduurweelde'),
    ('btw_nummer',      ''),
    ('standaard_btw',   '6'),
    ('update_url',      ''),
    ('printer_naam',    '');

-- Standaard categorieën
INSERT OR IGNORE INTO categorieen (naam, volgorde) VALUES
    ('Borduurpakketten',   1),
    ('Haakpakketten',      2),
    ('Wol & haakkatoen',   3),
    ('Mercerie',           4),
    ('Stoffen en garen',   5),
    ('Boeken',             6),
    ('Kids',               7),
    ('Overige',            99);
