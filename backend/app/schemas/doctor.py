import uuid
from datetime import datetime
from decimal import Decimal
from pydantic import BaseModel, EmailStr, Field
from app.schemas.availability import AvailabilitySlotResponse

class DoctorBase(BaseModel):
    medical_registration_number: str = Field(..., min_length=3)
    specialization: str = Field(..., min_length=2)
    qualifications: str = Field(..., min_length=2)
    experience_years: int = Field(default=0, ge=0)
    consultation_fee: Decimal = Field(default=Decimal("0.00"), ge=0)
    department_id: uuid.UUID | None = None
    profile_photo: str | None = None
    availability_status: str = "AVAILABLE"

class DoctorCreate(DoctorBase):
    full_name: str = Field(..., min_length=2)
    email: EmailStr
    phone: str = Field(..., min_length=10, max_length=15)
    password: str = Field(..., min_length=8)

class DoctorUpdate(BaseModel):
    medical_registration_number: str | None = None
    specialization: str | None = None
    qualifications: str | None = None
    experience_years: int | None = None
    consultation_fee: Decimal | None = None
    department_id: uuid.UUID | None = None
    profile_photo: str | None = None
    availability_status: str | None = None
    status: str | None = None

class DoctorResponse(DoctorBase):
    id: uuid.UUID
    user_id: uuid.UUID
    doctor_number: str
    status: str
    created_at: datetime
    updated_at: datetime
    full_name: str | None = None
    email: str | None = None
    phone: str | None = None
    department_name: str | None = None

    class Config:
        from_attributes = True
