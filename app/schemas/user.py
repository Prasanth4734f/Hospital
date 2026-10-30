import uuid
from datetime import datetime
from pydantic import BaseModel, EmailStr, Field
from app.core.permissions import UserRole

class UserBase(BaseModel):
    full_name: str
    email: EmailStr
    phone: str | None = None
    role: UserRole
    is_active: bool = True

class UserCreate(BaseModel):
    full_name: str = Field(..., min_length=2)
    email: EmailStr
    phone: str | None = None
    password: str = Field(..., min_length=8)
    role: UserRole
    is_active: bool = True

class UserUpdate(BaseModel):
    full_name: str | None = None
    email: EmailStr | None = None
    phone: str | None = None
    role: UserRole | None = None
    is_active: bool | None = None

class UserStatusUpdate(BaseModel):
    is_active: bool

class UserResponse(BaseModel):
    id: uuid.UUID
    full_name: str
    email: str
    phone: str | None = None
    role: str
    is_active: bool
    is_verified: bool
    created_at: datetime
    updated_at: datetime
    last_login: datetime | None = None

    class Config:
        from_attributes = True
