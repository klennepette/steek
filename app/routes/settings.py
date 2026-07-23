from flask import Blueprint, render_template, request, redirect, url_for, send_file
from ..database import get_db
from pathlib import Path
from datetime import datetime
import shutil
from io import BytesIO
import os

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


@bp.route("/backup")
def backup():
    """Download database backup."""
    db_path = Path(__file__).parent.parent.parent / "steek.db"
    
    if not db_path.exists():
        return redirect(url_for("settings.index"))
    
    # Create a backup file in memory
    backup_content = db_path.read_bytes()
    backup_io = BytesIO(backup_content)
    
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = f"steek_backup_{timestamp}.db"
    
    return send_file(
        backup_io,
        as_attachment=True,
        download_name=filename,
        mimetype="application/octet-stream"
    )


@bp.route("/restore", methods=["POST"])
def restore():
    """Restore database from backup file."""
    if "backup_file" not in request.files:
        return redirect(url_for("settings.index"))
    
    file = request.files["backup_file"]
    if file.filename == "":
        return redirect(url_for("settings.index"))
    
    if not file.filename.endswith(".db"):
        return redirect(url_for("settings.index"))
    
    db_path = Path(__file__).parent.parent.parent / "steek.db"
    
    # Create a backup of the current database before restoring
    if db_path.exists():
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        backup_path = db_path.parent / f"steek_pre_restore_{timestamp}.db"
        shutil.copy(db_path, backup_path)
    
    # Save the uploaded file as the new database
    file.save(str(db_path))
    
    return redirect(url_for("settings.index"))
