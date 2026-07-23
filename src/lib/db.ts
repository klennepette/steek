import Database from "@tauri-apps/plugin-sql";

let db: Database | null = null;

export async function getDb(): Promise<Database> {
  if (!db) {
    db = await Database.load("sqlite:steek.db");
  }
  return db;
}

// ── Types ───────────────────────────────────────────────────────────────────

export interface Categorie {
  id: number;
  naam: string;
  volgorde: number;
}

export interface Product {
  id: number;
  naam: string;
  beschrijving: string | null;
  sku: string | null;
  categorie_id: number | null;
  categorie_naam?: string;
  prijs: number;
  btw_pct: number;
  voorraad: number;
  actief: number;
}

export interface Verkoop {
  id: number;
  datum: string;
  totaal_excl: number;
  totaal_btw: number;
  totaal_incl: number;
  betaalmethode: string;
  opmerking: string | null;
}

export interface VerkoopRegel {
  id: number;
  verkoop_id: number;
  product_id: number | null;
  product_naam: string;
  aantal: number;
  stukprijs: number;
  btw_pct: number;
  subtotaal: number;
}

export interface Instelling {
  sleutel: string;
  waarde: string | null;
}

// ── Categorieën ─────────────────────────────────────────────────────────────

export async function getCategorieen(): Promise<Categorie[]> {
  const db = await getDb();
  return db.select<Categorie[]>("SELECT * FROM categorieen ORDER BY volgorde, naam");
}

// ── Producten ────────────────────────────────────────────────────────────────

export async function getProducten(alleenActief = true): Promise<Product[]> {
  const db = await getDb();
  const filter = alleenActief ? "WHERE p.actief = 1" : "";
  return db.select<Product[]>(`
    SELECT p.*, c.naam AS categorie_naam
    FROM producten p
    LEFT JOIN categorieen c ON c.id = p.categorie_id
    ${filter}
    ORDER BY c.volgorde, p.naam
  `);
}

export async function upsertProduct(p: Omit<Product, "id" | "categorie_naam"> & { id?: number }): Promise<void> {
  const db = await getDb();
  if (p.id) {
    await db.execute(
      `UPDATE producten SET naam=?, beschrijving=?, sku=?, categorie_id=?, prijs=?, btw_pct=?,
       voorraad=?, actief=?, bijgewerkt=datetime('now') WHERE id=?`,
      [p.naam, p.beschrijving, p.sku, p.categorie_id, p.prijs, p.btw_pct, p.voorraad, p.actief, p.id]
    );
  } else {
    await db.execute(
      `INSERT INTO producten (naam, beschrijving, sku, categorie_id, prijs, btw_pct, voorraad, actief)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [p.naam, p.beschrijving, p.sku, p.categorie_id, p.prijs, p.btw_pct, p.voorraad, p.actief ?? 1]
    );
  }
}

export async function verwijderProduct(id: number): Promise<void> {
  const db = await getDb();
  await db.execute("UPDATE producten SET actief=0 WHERE id=?", [id]);
}

export async function updateVoorraad(id: number, delta: number): Promise<void> {
  const db = await getDb();
  await db.execute(
    "UPDATE producten SET voorraad = MAX(0, voorraad + ?), bijgewerkt=datetime('now') WHERE id=?",
    [delta, id]
  );
}

// ── Verkopen ─────────────────────────────────────────────────────────────────

export interface NieuweVerkoop {
  betaalmethode: string;
  opmerking?: string;
  regels: {
    product_id: number | null;
    product_naam: string;
    aantal: number;
    stukprijs: number;
    btw_pct: number;
  }[];
}

export async function slaVerkoopOp(verkoop: NieuweVerkoop): Promise<number> {
  const db = await getDb();

  const totaal_incl = verkoop.regels.reduce((s, r) => s + r.aantal * r.stukprijs, 0);
  const totaal_excl = verkoop.regels.reduce((s, r) => {
    const excl = r.stukprijs / (1 + r.btw_pct / 100);
    return s + r.aantal * excl;
  }, 0);
  const totaal_btw = totaal_incl - totaal_excl;

  const result = await db.execute(
    `INSERT INTO verkopen (totaal_excl, totaal_btw, totaal_incl, betaalmethode, opmerking)
     VALUES (?, ?, ?, ?, ?)`,
    [totaal_excl, totaal_btw, totaal_incl, verkoop.betaalmethode, verkoop.opmerking ?? null]
  );

  const verkoopId = result.lastInsertId as number;

  for (const r of verkoop.regels) {
    const subtotaal = r.aantal * r.stukprijs;
    await db.execute(
      `INSERT INTO verkoop_regels (verkoop_id, product_id, product_naam, aantal, stukprijs, btw_pct, subtotaal)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [verkoopId, r.product_id, r.product_naam, r.aantal, r.stukprijs, r.btw_pct, subtotaal]
    );
    // Update voorraad
    if (r.product_id) {
      await db.execute(
        "UPDATE producten SET voorraad = MAX(0, voorraad - ?), bijgewerkt=datetime('now') WHERE id=?",
        [r.aantal, r.product_id]
      );
    }
  }

  return verkoopId;
}

export async function getVerkopen(van?: string, tot?: string): Promise<Verkoop[]> {
  const db = await getDb();
  let sql = "SELECT * FROM verkopen";
  const params: string[] = [];
  if (van && tot) {
    sql += " WHERE datum BETWEEN ? AND ?";
    params.push(van, tot);
  }
  sql += " ORDER BY datum DESC";
  return db.select<Verkoop[]>(sql, params);
}

export async function getVerkoopRegels(verkoopId: number): Promise<VerkoopRegel[]> {
  const db = await getDb();
  return db.select<VerkoopRegel[]>(
    "SELECT * FROM verkoop_regels WHERE verkoop_id = ?",
    [verkoopId]
  );
}

// ── Instellingen ─────────────────────────────────────────────────────────────

export async function getInstelling(sleutel: string): Promise<string | null> {
  const db = await getDb();
  const rows = await db.select<Instelling[]>(
    "SELECT waarde FROM instellingen WHERE sleutel = ?",
    [sleutel]
  );
  return rows[0]?.waarde ?? null;
}

export async function setInstelling(sleutel: string, waarde: string): Promise<void> {
  const db = await getDb();
  await db.execute(
    "INSERT OR REPLACE INTO instellingen (sleutel, waarde) VALUES (?, ?)",
    [sleutel, waarde]
  );
}

export async function getAlleInstellingen(): Promise<Record<string, string>> {
  const db = await getDb();
  const rows = await db.select<Instelling[]>("SELECT sleutel, waarde FROM instellingen");
  return Object.fromEntries(rows.map((r) => [r.sleutel, r.waarde ?? ""]));
}
