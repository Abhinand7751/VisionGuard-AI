from pydantic import BaseModel, ConfigDict


class TokenResponse(BaseModel):
    """JWT token response returned after login."""

    access_token: str
    token_type: str = "bearer"


class UserResponse(BaseModel):
    """Authenticated user response model."""

    id: int
    email: str
    full_name: str | None
    is_active: bool
    is_superuser: bool

    model_config = ConfigDict(from_attributes=True)
