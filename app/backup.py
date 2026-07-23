"""S3 backup module for Steek database.

IAM policy needed on the configured user/role:
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": ["s3:PutObject", "s3:PutObjectAcl"],
      "Resource": "arn:aws:s3:::your-bucket-name/backups/*"
    }
  ]
}
"""

import logging
import threading
import time
from pathlib import Path
from datetime import datetime

DB_PATH = Path(__file__).resolve().parent.parent / "steek.db"
_BACKUP_INTERVAL_KEY = "backup_interval_minutes"
_DEFAULT_INTERVAL_MINUTES = 60

logger = logging.getLogger(__name__)


def _get_settings():
    from .database import get_db
    with get_db() as conn:
        rows = conn.execute(
            "SELECT key, value FROM settings WHERE key LIKE 'aws_%' OR key = ?",
            (_BACKUP_INTERVAL_KEY,),
        ).fetchall()
    return {r["key"]: r["value"] for r in rows}


def upload_to_s3(settings=None):
    """Upload steek.db to configured S3 bucket.

    Accepts an optional settings dict (from the DB). If None, reads from DB.
    Returns (success: bool, message: str).
    """
    if settings is None:
        settings = _get_settings()

    access_key = settings.get("aws_access_key_id", "").strip()
    secret_key = settings.get("aws_secret_access_key", "").strip()
    bucket = settings.get("aws_bucket_name", "").strip()
    region = settings.get("aws_region", "").strip() or "eu-west-1"

    if not all([access_key, secret_key, bucket]):
        return False, "AWS backup niet geconfigureerd."

    if not DB_PATH.exists():
        return False, "Database bestand niet gevonden."

    try:
        import boto3
        from botocore.exceptions import ClientError, NoCredentialsError

        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        object_name = f"backups/steek_{timestamp}.db"

        client = boto3.client(
            "s3",
            aws_access_key_id=access_key,
            aws_secret_access_key=secret_key,
            region_name=region,
        )
        client.upload_file(str(DB_PATH), bucket, object_name)

        msg = f"Backup geüpload naar S3: {bucket}/{object_name}"
        _save_result(True, msg)
        return True, msg
    except ImportError:
        return False, "boto3 niet geïnstalleerd. Voer 'pip install boto3' uit."
    except NoCredentialsError:
        return False, "AWS credentials ongeldig."
    except ClientError as e:
        code = e.response["Error"]["Code"]
        if code == "AccessDenied":
            return False, (
                "Toegang geweigerd door S3. "
                "Controleer het IAM beleid: de gebruiker heeft "
                "s3:PutObject nodig op de bucket."
            )
        return False, f"S3 fout ({code}): {e}"
    except Exception as e:
        return False, f"Backup mislukt: {e}"


def _save_result(success, message):
    from .database import get_db
    with get_db() as conn:
        conn.execute(
            "INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)",
            ("aws_last_backup", datetime.now().isoformat()),
        )
        conn.execute(
            "INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)",
            ("aws_last_backup_result", message),
        )


def _get_interval_minutes():
    """Read the configured backup interval from DB, fall back to default."""
    settings = _get_settings()
    raw = settings.get(_BACKUP_INTERVAL_KEY, "").strip()
    try:
        val = int(raw)
        return max(1, val)
    except (ValueError, TypeError):
        return _DEFAULT_INTERVAL_MINUTES


def _scheduler_loop():
    """Background loop: backup on startup, then every N minutes."""
    time.sleep(3)
    settings = _get_settings()
    if settings.get("aws_access_key_id") and settings.get("aws_bucket_name"):
        upload_to_s3(settings)
    while True:
        interval = _get_interval_minutes()
        time.sleep(interval * 60)
        settings = _get_settings()
        if settings.get("aws_access_key_id") and settings.get("aws_bucket_name"):
            upload_to_s3(settings)


def start_scheduler():
    """Start the backup scheduler in a daemon thread.

    Call once at app startup. Does nothing if scheduler is already running.
    """
    if hasattr(start_scheduler, "_started") and start_scheduler._started:
        return
    start_scheduler._started = True
    thread = threading.Thread(target=_scheduler_loop, daemon=True)
    thread.start()
