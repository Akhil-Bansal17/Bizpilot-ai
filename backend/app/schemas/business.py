from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field


class BusinessBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    business_type: str = Field(default="restaurant_cafe", max_length=50)
    currency: str = Field(default="INR", max_length=10)
    timezone: str = Field(default="Asia/Kolkata", max_length=50)


class BusinessCreate(BusinessBase):
    pass


class BusinessUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=255)
    business_type: str | None = Field(default=None, max_length=50)
    currency: str | None = Field(default=None, max_length=10)
    timezone: str | None = Field(default=None, max_length=50)
    is_active: bool | None = None


class BusinessResponse(BusinessBase):
    id: UUID
    owner_user_id: UUID
    is_active: bool
    created_at: datetime
    updated_at: datetime
    role: str | None = None

    model_config = ConfigDict(from_attributes=True)
