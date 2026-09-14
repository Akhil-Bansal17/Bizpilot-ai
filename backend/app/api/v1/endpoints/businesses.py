from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_db
from app.models.business import Business
from app.models.membership import BusinessMembership
from app.models.user import User
from app.schemas.business import BusinessCreate, BusinessResponse, BusinessUpdate

router = APIRouter()


@router.post(
    "",
    response_model=BusinessResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new business",
)
def create_business(
    business_in: BusinessCreate,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
) -> BusinessResponse:
    """Creates a new business entity for the authenticated user and grants them owner role."""
    try:
        business = Business(
            owner_user_id=current_user.id,
            name=business_in.name,
            business_type=business_in.business_type,
            currency=business_in.currency,
            timezone=business_in.timezone,
            is_active=True,
        )
        db.add(business)
        db.flush()

        membership = BusinessMembership(
            user_id=current_user.id,
            business_id=business.id,
            role="owner",
        )
        db.add(membership)

        db.commit()
        db.refresh(business)

        resp = BusinessResponse.model_validate(business)
        resp.role = "owner"
        return resp
    except Exception:
        db.rollback()
        raise


@router.get(
    "",
    response_model=list[BusinessResponse],
    summary="List accessible businesses for current user",
)
def list_businesses(
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
) -> list[BusinessResponse]:
    """Returns all active businesses where current user holds membership."""
    memberships = (
        db.query(BusinessMembership)
        .filter(BusinessMembership.user_id == current_user.id)
        .all()
    )

    businesses: list[BusinessResponse] = []
    for m in memberships:
        b = db.query(Business).filter(Business.id == m.business_id).first()
        if b and b.is_active:
            resp = BusinessResponse.model_validate(b)
            resp.role = m.role
            businesses.append(resp)

    return businesses


@router.get(
    "/{business_id}",
    response_model=BusinessResponse,
    summary="Get business by ID",
)
def get_business(
    business_id: UUID,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
) -> BusinessResponse:
    """Retrieves business details if current user is an authorized member."""
    membership = (
        db.query(BusinessMembership)
        .filter(
            BusinessMembership.user_id == current_user.id,
            BusinessMembership.business_id == business_id,
        )
        .first()
    )
    if not membership:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to access this business",
        )

    business = db.query(Business).filter(Business.id == business_id).first()
    if not business or not business.is_active:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Business not found",
        )

    resp = BusinessResponse.model_validate(business)
    resp.role = membership.role
    return resp


@router.patch(
    "/{business_id}",
    response_model=BusinessResponse,
    summary="Update business settings (Owner only)",
)
def update_business(
    business_id: UUID,
    business_in: BusinessUpdate,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
) -> BusinessResponse:
    """Updates foundational business settings. Allowed for business owner only."""
    membership = (
        db.query(BusinessMembership)
        .filter(
            BusinessMembership.user_id == current_user.id,
            BusinessMembership.business_id == business_id,
        )
        .first()
    )
    if not membership:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to access this business",
        )

    if membership.role != "owner":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only the business owner can update business settings",
        )

    business = db.query(Business).filter(Business.id == business_id).first()
    if not business or not business.is_active:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Business not found",
        )

    update_data = business_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        if value is not None:
            setattr(business, field, value)

    db.commit()
    db.refresh(business)

    resp = BusinessResponse.model_validate(business)
    resp.role = membership.role
    return resp
