from flask import Blueprint, render_template, request, redirect, url_for, flash
from ..database import get_db

bp = Blueprint("products", __name__, url_prefix="/voorraad")


class _FormProduct:
    def __init__(self, form):
        self.name = form.get("name", "").strip()
        self.barcode = form.get("barcode", "").strip() or ""
        self.packetcode = form.get("packetcode", "").strip() or ""
        self.description = form.get("description", "").strip() or ""
        try:
            self.price = float(form.get("price", 0))
        except (ValueError, TypeError):
            self.price = 0
        try:
            self.stock = int(form.get("stock", 0))
        except (ValueError, TypeError):
            self.stock = 0
        self.consignation = 1 if form.get("consignation") else 0
        self.active = 1 if form.get("active") else 0


def _validate_product(form, product_id=None):
    errors = []
    name = form.get("name", "").strip()
    if not name:
        errors.append("Naam is verplicht.")
    try:
        price = float(form.get("price", 0))
        if price < 0:
            errors.append("Prijs mag niet negatief zijn.")
    except (ValueError, TypeError):
        errors.append("Prijs is geen geldig getal.")
    try:
        stock = int(form.get("stock", 0))
        if stock < 0:
            errors.append("Voorraad mag niet negatief zijn.")
    except (ValueError, TypeError):
        errors.append("Voorraad is geen geldig getal.")
    exclude_id = product_id or -1
    barcode = form.get("barcode", "").strip() or None
    if barcode:
        with get_db() as conn:
            if conn.execute(
                "SELECT 1 FROM products WHERE barcode = ? AND id != ?",
                (barcode, exclude_id),
            ).fetchone():
                errors.append(f"Barcode '{barcode}' is al in gebruik.")
    packetcode = form.get("packetcode", "").strip() or None
    if packetcode:
        with get_db() as conn:
            if conn.execute(
                "SELECT 1 FROM products WHERE packetcode = ? AND id != ?",
                (packetcode, exclude_id),
            ).fetchone():
                errors.append(f"Pakketcode '{packetcode}' is al in gebruik.")
    return errors


@bp.route("/")
def index():
    search = request.args.get("q", "").strip()
    with get_db() as conn:
        if search:
            rows = conn.execute(
                """SELECT * FROM products
                   WHERE name LIKE ? OR barcode LIKE ? OR packetcode LIKE ?
                   ORDER BY name""",
                (f"%{search}%", f"%{search}%", f"%{search}%"),
            ).fetchall()
        else:
            rows = conn.execute(
                "SELECT * FROM products ORDER BY name"
            ).fetchall()
    return render_template("products/index.html", products=rows, search=search)


@bp.route("/nieuw", methods=["GET", "POST"])
def new():
    if request.method == "POST":
        errors = _validate_product(request.form)
        if errors:
            for e in errors:
                flash(e, "error")
            return render_template("products/form.html", product=_FormProduct(request.form))
        _save_product(request.form)
        flash("Product toegevoegd.", "success")
        return redirect(url_for("products.index"))
    return render_template("products/form.html", product=None)


@bp.route("/<int:product_id>/bewerk", methods=["GET", "POST"])
def edit(product_id):
    with get_db() as conn:
        product = conn.execute(
            "SELECT * FROM products WHERE id = ?", (product_id,)
        ).fetchone()
    if product is None:
        flash("Product niet gevonden.", "error")
        return redirect(url_for("products.index"))
    if request.method == "POST":
        errors = _validate_product(request.form, product_id)
        if errors:
            for e in errors:
                flash(e, "error")
            return render_template("products/form.html", product=_FormProduct(request.form))
        _save_product(request.form, product_id)
        flash("Product bijgewerkt.", "success")
        return redirect(url_for("products.index"))
    return render_template("products/form.html", product=product)


@bp.route("/<int:product_id>/deactiveer", methods=["POST"])
def deactivate(product_id):
    with get_db() as conn:
        cur = conn.execute(
            "UPDATE products SET active = 0, updated_at = datetime('now') WHERE id = ? AND active = 1",
            (product_id,),
        )
        if cur.rowcount == 0:
            flash("Product niet gevonden of al inactief.", "error")
            return redirect(url_for("products.index"))
    flash("Product gedeactiveerd.", "success")
    return redirect(url_for("products.index"))


@bp.route("/zoek")
def search():
    """HTMX endpoint: search products for checkout."""
    q = request.args.get("q", "").strip()
    if not q:
        return ""
    with get_db() as conn:
        rows = conn.execute(
            """SELECT * FROM products
               WHERE active = 1
                 AND (barcode = ?1 OR packetcode LIKE ?2 OR name LIKE ?2)
               ORDER BY
                 CASE WHEN barcode = ?1    THEN 0
                      WHEN packetcode LIKE ?2 THEN 1
                      ELSE 2 END,
                 name
               LIMIT 20""",
            (q, f"%{q}%"),
        ).fetchall()
    return render_template("products/search_results.html", products=rows, query=q)


def _save_product(form, product_id=None):
    fields = (
        form.get("name", "").strip(),
        form.get("barcode") or None,
        form.get("packetcode") or None,
        form.get("description") or None,
        float(form.get("price", 0)),
        int(form.get("stock", 0)),
        1 if form.get("consignation") else 0,
        1 if form.get("active") else 0,
    )
    with get_db() as conn:
        if product_id:
            conn.execute(
                """UPDATE products
                   SET name=?, barcode=?, packetcode=?, description=?,
                       price=?, stock=?, consignation=?, active=?,
                       updated_at=datetime('now')
                   WHERE id=?""",
                (*fields, product_id),
            )
        else:
            conn.execute(
                """INSERT INTO products
                     (name, barcode, packetcode, description, price, stock, consignation, active)
                   VALUES (?, ?, ?, ?, ?, ?, ?, ?)""",
                fields,
            )
