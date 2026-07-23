from flask import Blueprint, render_template, request, redirect, url_for
from ..database import get_db

bp = Blueprint("products", __name__, url_prefix="/voorraad")


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
        _save_product(request.form)
        return redirect(url_for("products.index"))
    return render_template("products/form.html", product=None)


@bp.route("/<int:product_id>/bewerk", methods=["GET", "POST"])
def edit(product_id):
    with get_db() as conn:
        product = conn.execute(
            "SELECT * FROM products WHERE id = ?", (product_id,)
        ).fetchone()
    if request.method == "POST":
        _save_product(request.form, product_id)
        return redirect(url_for("products.index"))
    return render_template("products/form.html", product=product)


@bp.route("/<int:product_id>/deactiveer", methods=["POST"])
def deactivate(product_id):
    with get_db() as conn:
        conn.execute(
            "UPDATE products SET active = 0, updated_at = datetime('now') WHERE id = ?",
            (product_id,),
        )
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
