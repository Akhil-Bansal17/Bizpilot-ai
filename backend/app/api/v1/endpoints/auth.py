from datetime import datetime, timezone
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_db
from app.core.security import create_access_token, get_password_hash, verify_password
from app.models.business import Business
from app.models.membership import BusinessMembership
from app.models.user import User
from app.schemas.auth import (
    LoginRequest,
    TokenResponse,
    UserCreate,
    UserProfileResponse,
    UserResponse,
)
from app.schemas.business import BusinessResponse

router = APIRouter()


@router.post(
    "/register",
    response_model=TokenResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Register new user and create initial business",
)
def register(
    user_in: UserCreate,
    db: Annotated[Session, Depends(get_db)],
) -> TokenResponse:
    """Registers a new user and automatically sets up their initial business and owner membership."""
    normalized_email = user_in.email.lower().strip()

    # Check if user already exists
    existing_user = db.query(User).filter(User.email == normalized_email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email is already registered",
        )

    try:
        # Create User
        user = User(
            email=normalized_email,
            password_hash=get_password_hash(user_in.password),
            full_name=user_in.full_name,
            is_active=True,
            last_login_at=datetime.now(timezone.utc),
        )
        db.add(user)
        db.flush()  # Generate user.id

        # Create Initial Business
        business_name = user_in.business_name or f"{user_in.full_name}'s Business"
        business = Business(
            owner_user_id=user.id,
            name=business_name,
            business_type="restaurant_cafe",
            currency=user_in.currency,
            timezone=user_in.timezone,
            is_active=True,
        )
        db.add(business)
        db.flush()  # Generate business.id

        # Create Owner Membership
        membership = BusinessMembership(
            user_id=user.id,
            business_id=business.id,
            role="owner",
        )
        db.add(membership)

        db.commit()
        db.refresh(user)
        db.refresh(business)

        access_token = create_access_token(subject=user.id)

        business_resp = BusinessResponse.model_validate(business)
        business_resp.role = "owner"

        return TokenResponse(
            access_token=access_token,
            token_type="bearer",
            user=UserResponse.model_validate(user),
            selected_business=business_resp,
        )

    except Exception:
        db.rollback()
        raise


@router.post(
    "/login",
    response_model=TokenResponse,
    summary="Authenticate user credentials and issue access token",
)
def login(
    login_in: LoginRequest,
    db: Annotated[Session, Depends(get_db)],
) -> TokenResponse:
    """Authenticates credentials, updates last login timestamp, and returns access token."""
    normalized_email = login_in.email.lower().strip()
    user = db.query(User).filter(User.email == normalized_email).first()

    if not user or not verify_password(login_in.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Inactive user account",
        )

    # Update last login timestamp
    user.last_login_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(user)

    # Fetch user's first business to select automatically
    membership = (
        db.query(BusinessMembership)
        .filter(BusinessMembership.user_id == user.id)
        .first()
    )
    selected_business = None
    if membership:
        bus = db.query(Business).filter(Business.id == membership.business_id).first()
        if bus and bus.is_active:
            selected_business = BusinessResponse.model_validate(bus)
            selected_business.role = membership.role

    access_token = create_access_token(subject=user.id)

    return TokenResponse(
        access_token=access_token,
        token_type="bearer",
        user=UserResponse.model_validate(user),
        selected_business=selected_business,
    )


@router.get(
    "/me",
    response_model=UserProfileResponse,
    summary="Get authenticated user profile and accessible businesses",
)
def get_me(
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
) -> UserProfileResponse:
    """Returns safe user profile details along with accessible business memberships."""
    memberships = (
        db.query(BusinessMembership)
        .filter(BusinessMembership.user_id == current_user.id)
        .all()
    )

    businesses_response: list[BusinessResponse] = []
    for m in memberships:
        b = db.query(Business).filter(Business.id == m.business_id).first()
        if b and b.is_active:
            b_resp = BusinessResponse.model_validate(b)
            b_resp.role = m.role
            businesses_response.append(b_resp)

    user_resp = UserProfileResponse(
        id=current_user.id,
        email=current_user.email,
        full_name=current_user.full_name,
        is_active=current_user.is_active,
        created_at=current_user.created_at,
        last_login_at=current_user.last_login_at,
        businesses=businesses_response,
    )
    return user_resp
