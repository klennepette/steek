from flask import Blueprint, render_template, request, redirect, url_for
from ..database import get_db

bp = Blueprint("settings", __name__, url_prefix="/instellingen")


@bp.route("/", methods=["GET", "POST"])
def index():
    with get_db() as conn:
        if request.method == "POST":
            for key in ("shop_name", "printer_name"):
                value = request.form.get(key, "").strip()
                conn.execute(
                    "INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)",
                    (key, value),
                )
            return redirect(url_for("settings.index"))

        rows = conn.execute("SELECT key, value FROM settings").fetchall()
        settings = {r["key"]: r["value"] for r in rows}

    return render_template("settings/index.html", settings=settings)
