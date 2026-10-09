"""Create or reset the local development admin user.

This script is intended for development and Docker troubleshooting only.
Run it from the backend container with:
python scripts/reset_admin.py
"""

import sys
from pathlib import Path

BACKEND_ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(BACKEND_ROOT))

from app.core.config import settings
from app.core.security import hash_password, verify_password
from app.database.session import SessionLocal
from app.services.user_service import UserService


def main() -> None:
    """Create the initial admin user or reset its password."""
    db = SessionLocal()
    try:
        service = UserService(db)
        email = settings.initial_admin_email
        password = settings.initial_admin_password
        user = service.get_by_email(email)

        if user is None:
            user = service.create_user(
                email=email,
                password=password,
                full_name="VisionGuard Admin",
                is_superuser=True,
            )
            action = "created"
        else:
            user.hashed_password = hash_password(password)
            user.is_active = True
            user.is_superuser = True
            db.commit()
            db.refresh(user)
            action = "reset"

        password_ok = verify_password(password, user.hashed_password)
        print(f"Admin {action}: {user.email}")
        print(f"Active: {user.is_active}")
        print(f"Superuser: {user.is_superuser}")
        print(f"Password verifies: {password_ok}")
    finally:
        db.close()


if __name__ == "__main__":
    main()
