import Database from "@tauri-apps/plugin-sql";

let db: Database | null = null;

export async function getDb(): Promise<Database> {
  if (!db) {
    db = await Database.load("sqlite:steek.db");
  }
  return db;
}

// ── Types ────────────────────────────────────────────────────────────────────

export interface Category {
  id: number;
  name: string;
  sort_order: number;
}

export interface Product {
  id: number;
  name: string;
  barcode: string | null;
  packetcode: string | null;
  description: string | null;
  category_id: number | null;
  category_name?: string;
  price: number;
  vat_pct: number;
  stock: number;
  consignation: number; // boolean: 1 = consignment stock
  active: number;       // boolean: 1 = active
}

export interface Sale {
  id: number;
  created_at: string;
  total_excl: number;
  total_vat: number;
  total_incl: number;
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
  vat_pct: number;
  subtotal: number;
}

export interface Setting {
  key: string;
  value: string | null;
}

// ── Categories ───────────────────────────────────────────────────────────────

export async function getCategories(): Promise<Category[]> {
  const db = await getDb();
  return db.select<Category[]>("SELECT * FROM categories ORDER BY sort_order, name");
}

// ── Products ─────────────────────────────────────────────────────────────────

export async function getProducts(activeOnly = true): Promise<Product[]> {
  const db = await getDb();
  const filter = activeOnly ? "WHERE p.active = 1" : "";
  return db.select<Product[]>(`
    SELECT p.*, c.name AS category_name
    FROM products p
    LEFT JOIN categories c ON c.id = p.category_id
    ${filter}
    ORDER BY c.sort_order, p.name
  `);
}

/**
 * Search products by barcode, packetcode, or name (case-insensitive).
 * Used by the checkout scanner input.
 */
export async function searchProducts(query: string): Promise<Product[]> {
  const db = await getDb();
  return db.select<Product[]>(
    `SELECT p.*, c.name AS category_name
     FROM products p
     LEFT JOIN categories c ON c.id = p.category_id
     WHERE p.active = 1
       AND (p.barcode = ?1 OR p.packetcode = ?1 OR p.name LIKE ?2)
     ORDER BY
       CASE WHEN p.barcode = ?1 THEN 0
            WHEN p.packetcode = ?1 THEN 1
            ELSE 2 END,
       p.name
     LIMIT 20`,
    [query, `%${query}%`]
  );
}

export async function upsertProduct(
  p: Omit<Product, "id" | "category_name"> & { id?: number }
): Promise<void> {
  const db = await getDb();
  if (p.id) {
    await db.execute(
      `UPDATE products
       SET name=?, barcode=?, packetcode=?, description=?, category_id=?,
           price=?, vat_pct=?, stock=?, consignation=?, active=?,
           updated_at=datetime('now')
       WHERE id=?`,
      [
        p.name, p.barcode, p.packetcode, p.description, p.category_id,
        p.price, p.vat_pct, p.stock, p.consignation, p.active,
        p.id,
      ]
    );
  } else {
    await db.execute(
      `INSERT INTO products
         (name, barcode, packetcode, description, category_id, price, vat_pct, stock, consignation, active)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        p.name, p.barcode, p.packetcode, p.description, p.category_id,
        p.price, p.vat_pct, p.stock, p.consignation ?? 0, p.active ?? 1,
      ]
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
    vat_pct: number;
  }[];
}

export async function recordSale(sale: NewSale): Promise<number> {
  const db = await getDb();

  const total_incl = sale.lines.reduce((s, l) => s + l.quantity * l.unit_price, 0);
  const total_excl = sale.lines.reduce((s, l) => {
    const excl = l.unit_price / (1 + l.vat_pct / 100);
    return s + l.quantity * excl;
  }, 0);
  const total_vat = total_incl - total_excl;

  const result = await db.execute(
    `INSERT INTO sales (total_excl, total_vat, total_incl, payment_method, note)
     VALUES (?, ?, ?, ?, ?)`,
    [total_excl, total_vat, total_incl, sale.payment_method, sale.note ?? null]
  );

  const saleId = result.lastInsertId as number;

  for (const l of sale.lines) {
    const subtotal = l.quantity * l.unit_price;
    await db.execute(
      `INSERT INTO sale_lines (sale_id, product_id, product_name, quantity, unit_price, vat_pct, subtotal)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [saleId, l.product_id, l.product_name, l.quantity, l.unit_price, l.vat_pct, subtotal]
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
