from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.security import hash_password, verify_password
from app.models.user import User


class UserService:
    """Application service for user and authentication operations."""

    def __init__(self, db: Session) -> None:
        """Initialize the service with a database session."""
        self.db = db

    def get_by_email(self, email: str) -> User | None:
        """Return a user by normalized email."""
        statement = select(User).where(User.email == email.lower())
        return self.db.scalar(statement)

    def authenticate(self, email: str, password: str) -> User | None:
        """Validate credentials and return the matching active user."""
        user = self.get_by_email(email)
        if user is None or not user.is_active:
            return None
        if not verify_password(password, user.hashed_password):
            return None
        return user

    def create_user(
        self,
        email: str,
        password: str,
        full_name: str | None = None,
        is_superuser: bool = False,
    ) -> User:
        """Create and persist a user."""
        user = User(
            email=email.lower(),
            hashed_password=hash_password(password),
            full_name=full_name,
            is_superuser=is_superuser,
        )
        self.db.add(user)
        self.db.commit()
        self.db.refresh(user)
        return user
