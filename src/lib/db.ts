import Database from "@tauri-apps/plugin-sql";

let db: Database | null = null;

export async function getDb(): Promise<Database> {
  if (!db) {
    db = await Database.load("sqlite:steek.db");
  }
  return db;
}

// ── Types ────────────────────────────────────────────────────────────────────

export interface Product {
  id: number;
  name: string;
  barcode: string | null;
  packetcode: string | null;
  description: string | null;
  price: number;
  stock: number;
  consignation: number; // boolean: 1 = consignment stock
  active: number;       // boolean: 1 = active
}

export interface Sale {
  id: number;
  created_at: string;
  total: number;
  payment_method: string;
  note: string | null;
}

export interface SaleLine {
  id: number;
  sale_id: number;
  product_id: number | null;
  product_name: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
}

export interface Setting {
  key: string;
  value: string | null;
}

// ── Products ─────────────────────────────────────────────────────────────────

export async function getProducts(activeOnly = true): Promise<Product[]> {
  const db = await getDb();
  const filter = activeOnly ? "WHERE active = 1" : "";
  return db.select<Product[]>(
    `SELECT * FROM products ${filter} ORDER BY name`
  );
}

/**
 * Search products by barcode, packetcode, or name (case-insensitive).
 * Results are ordered: exact barcode match first, then packetcode, then name.
 */
export async function searchProducts(query: string): Promise<Product[]> {
  const db = await getDb();
  return db.select<Product[]>(
    `SELECT * FROM products
     WHERE active = 1
       AND (barcode = ?1 OR packetcode = ?1 OR name LIKE ?2)
     ORDER BY
       CASE WHEN barcode    = ?1 THEN 0
            WHEN packetcode = ?1 THEN 1
            ELSE 2 END,
       name
     LIMIT 20`,
    [query, `%${query}%`]
  );
}

export async function upsertProduct(
  p: Omit<Product, "id"> & { id?: number }
): Promise<void> {
  const db = await getDb();
  if (p.id) {
    await db.execute(
      `UPDATE products
       SET name=?, barcode=?, packetcode=?, description=?,
           price=?, stock=?, consignation=?, active=?,
           updated_at=datetime('now')
       WHERE id=?`,
      [p.name, p.barcode, p.packetcode, p.description,
       p.price, p.stock, p.consignation, p.active, p.id]
    );
  } else {
    await db.execute(
      `INSERT INTO products (name, barcode, packetcode, description, price, stock, consignation, active)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [p.name, p.barcode, p.packetcode, p.description,
       p.price, p.stock, p.consignation ?? 0, p.active ?? 1]
    );
  }
}

export async function deactivateProduct(id: number): Promise<void> {
  const db = await getDb();
  await db.execute("UPDATE products SET active=0 WHERE id=?", [id]);
}

export async function adjustStock(id: number, delta: number): Promise<void> {
  const db = await getDb();
  await db.execute(
    "UPDATE products SET stock = MAX(0, stock + ?), updated_at=datetime('now') WHERE id=?",
    [delta, id]
  );
}

// ── Sales ────────────────────────────────────────────────────────────────────

export interface NewSale {
  payment_method: string;
  note?: string;
  lines: {
    product_id: number | null;
    product_name: string;
    quantity: number;
    unit_price: number;
  }[];
}

export async function recordSale(sale: NewSale): Promise<number> {
  const db = await getDb();

  const total = sale.lines.reduce((s, l) => s + l.quantity * l.unit_price, 0);

  const result = await db.execute(
    `INSERT INTO sales (total, payment_method, note) VALUES (?, ?, ?)`,
    [total, sale.payment_method, sale.note ?? null]
  );

  const saleId = result.lastInsertId as number;

  for (const l of sale.lines) {
    const subtotal = l.quantity * l.unit_price;
    await db.execute(
      `INSERT INTO sale_lines (sale_id, product_id, product_name, quantity, unit_price, subtotal)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [saleId, l.product_id, l.product_name, l.quantity, l.unit_price, subtotal]
    );
    if (l.product_id) {
      await db.execute(
        "UPDATE products SET stock = MAX(0, stock - ?), updated_at=datetime('now') WHERE id=?",
        [l.quantity, l.product_id]
      );
    }
  }

  return saleId;
}

export async function getSales(from?: string, to?: string): Promise<Sale[]> {
  const db = await getDb();
  let sql = "SELECT * FROM sales";
  const params: string[] = [];
  if (from && to) {
    sql += " WHERE created_at BETWEEN ? AND ?";
    params.push(from, to);
  }
  sql += " ORDER BY created_at DESC";
  return db.select<Sale[]>(sql, params);
}

export async function getSaleLines(saleId: number): Promise<SaleLine[]> {
  const db = await getDb();
  return db.select<SaleLine[]>("SELECT * FROM sale_lines WHERE sale_id = ?", [saleId]);
}

// ── Settings ─────────────────────────────────────────────────────────────────

export async function getSetting(key: string): Promise<string | null> {
  const db = await getDb();
  const rows = await db.select<Setting[]>("SELECT value FROM settings WHERE key = ?", [key]);
  return rows[0]?.value ?? null;
}

export async function setSetting(key: string, value: string): Promise<void> {
  const db = await getDb();
  await db.execute(
    "INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)",
    [key, value]
  );
}

export async function getAllSettings(): Promise<Record<string, string>> {
  const db = await getDb();
  const rows = await db.select<Setting[]>("SELECT key, value FROM settings");
  return Object.fromEntries(rows.map((r) => [r.key, r.value ?? ""]));
}
