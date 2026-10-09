from sqlalchemy import text
from sqlalchemy.orm import Session


def check_database_connection(db: Session) -> bool:
    """Return whether the database can execute a lightweight query."""
    try:
        db.execute(text("SELECT 1"))
        return True
    except Exception:
        return False
