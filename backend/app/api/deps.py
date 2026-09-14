from collections.abc import Generator
from typing import Annotated
from uuid import UUID

from fastapi import Depends, Header, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session

from app.core.security import decode_access_token
from app.db.session import get_db_session
from app.models.business import Business
from app.models.membership import BusinessMembership
from app.models.user import User

security_scheme = HTTPBearer(auto_error=False)


def get_db() -> Generator[Session, None, None]:
    """Dependency injection provider yielding SQLAlchemy database session."""
    yield from get_db_session()


def get_current_user(
    token_auth: Annotated[
        HTTPAuthorizationCredentials | None, Depends(security_scheme)
    ],
    db: Annotated[Session, Depends(get_db)],
) -> User:
    """Validates JWT bearer token and returns the authenticated active user."""
    if not token_auth or not token_auth.credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
            headers={"WWW-Authenticate": "Bearer"},
        )

    token = token_auth.credentials
    payload = decode_access_token(token)
    if not payload or "sub" not in payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials or token expired",
            headers={"WWW-Authenticate": "Bearer"},
        )

    try:
        user_id = UUID(payload["sub"])
    except (ValueError, TypeError):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token payload subject",
            headers={"WWW-Authenticate": "Bearer"},
        )

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Inactive user account",
        )

    return user


def get_current_business(
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
    x_business_id: Annotated[str | None, Header(alias="X-Business-ID")] = None,
) -> Business:
    """Verifies and returns the requested business context for the authenticated user."""
    if x_business_id:
        try:
            target_business_id = UUID(x_business_id)
        except (ValueError, TypeError):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid business ID format",
            )

        membership = (
            db.query(BusinessMembership)
            .filter(
                BusinessMembership.user_id == current_user.id,
                BusinessMembership.business_id == target_business_id,
            )
            .first()
        )
        if not membership:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to access this business context",
            )

        business = db.query(Business).filter(Business.id == target_business_id).first()
        if not business or not business.is_active:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Business not found or inactive",
            )
        return business

    # Fallback to the first accessible business for the current user
    membership = (
        db.query(BusinessMembership)
        .filter(BusinessMembership.user_id == current_user.id)
        .first()
    )
    if not membership:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No business found for current user",
        )

    business = db.query(Business).filter(Business.id == membership.business_id).first()
    if not business or not business.is_active:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Business not found or inactive",
        )
    return business


def require_business_role(allowed_roles: list[str]):
    """Returns a dependency function verifying user role in the target business."""

    def role_checker(
        current_user: Annotated[User, Depends(get_current_user)],
        current_business: Annotated[Business, Depends(get_current_business)],
        db: Annotated[Session, Depends(get_db)],
    ) -> BusinessMembership:
        membership = (
            db.query(BusinessMembership)
            .filter(
                BusinessMembership.user_id == current_user.id,
                BusinessMembership.business_id == current_business.id,
            )
            .first()
        )
        if not membership or membership.role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Insufficient business permissions. Required role in {allowed_roles}",
            )
        return membership

    return role_checker
