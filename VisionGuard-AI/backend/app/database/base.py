from sqlalchemy.orm import DeclarativeBase


class Base(DeclarativeBase):
    """Base class for SQLAlchemy ORM models."""


# Import models so Alembic can discover metadata from this module.
from app import models  # noqa: E402,F401
