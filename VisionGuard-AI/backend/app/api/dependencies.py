from collections.abc import Generator

from fastapi import Depends, HTTPException, Query, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from app.core.security import decode_access_token
from app.database.session import get_db
from app.models.user import User
from app.services.camera_service import CameraService
from app.services.event_service import SurveillanceEventService
from app.services.user_service import UserService

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")
optional_oauth2_scheme = OAuth2PasswordBearer(
    tokenUrl="/api/v1/auth/login",
    auto_error=False,
)


def get_camera_service(
    db: Session = Depends(get_db),
) -> Generator[CameraService, None, None]:
    """Provide a camera service instance."""
    yield CameraService(db)


def get_event_service(
    db: Session = Depends(get_db),
) -> Generator[SurveillanceEventService, None, None]:
    """Provide a surveillance event service instance."""
    yield SurveillanceEventService(db)


def get_user_service(
    db: Session = Depends(get_db),
) -> Generator[UserService, None, None]:
    """Provide a user service instance."""
    yield UserService(db)


def get_current_user(
    token: str = Depends(oauth2_scheme),
    service: UserService = Depends(get_user_service),
) -> User:
    """Return the authenticated user from a bearer token."""
    subject = decode_access_token(token)
    if subject is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    user = service.get_by_email(subject)
    if user is None or not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Inactive or missing user.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return user


def get_current_user_from_header_or_query(
    token: str | None = Query(default=None),
    service: UserService = Depends(get_user_service),
    header_token: str | None = Depends(optional_oauth2_scheme),
) -> User:
    """Return current user from bearer header or token query parameter."""
    selected_token = token or header_token
    if selected_token is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication token is required.",
        )
    subject = decode_access_token(selected_token)
    if subject is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials.",
        )

    user = service.get_by_email(subject)
    if user is None or not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Inactive or missing user.",
        )
    return user
