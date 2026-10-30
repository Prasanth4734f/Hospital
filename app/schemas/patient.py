import uuid
from datetime import date, datetime
from pydantic import BaseModel, EmailStr, Field

class PatientBase(BaseModel):
    first_name: str = Field(..., min_length=1, max_length=100)
    last_name: str = Field(..., min_length=1, max_length=100)
    date_of_birth: date | None = None
    gender: str | None = None
    blood_group: str | None = None
    marital_status: str | None = None
    phone: str = Field(..., min_length=10, max_length=15)
    email: EmailStr | None = None
    address: str | None = None
    city: str | None = None
    state: str | None = None
    pincode: str | None = None
    emergency_contact_name: str | None = None
    emergency_phone: str | None = None
    emergency_relationship: str | None = None

class PatientCreate(PatientBase):
    user_id: uuid.UUID | None = None

class PatientUpdate(BaseModel):
    first_name: str | None = None
    last_name: str | None = None
    date_of_birth: date | None = None
    gender: str | None = None
    blood_group: str | None = None
    marital_status: str | None = None
    phone: str | None = None
    email: EmailStr | None = None
    address: str | None = None
    city: str | None = None
    state: str | None = None
    pincode: str | None = None
    emergency_contact_name: str | None = None
    emergency_phone: str | None = None
    emergency_relationship: str | None = None
    status: str | None = None

class PatientResponse(PatientBase):
    id: uuid.UUID
    user_id: uuid.UUID | None = None
    patient_number: str
    status: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class PatientHistoryResponse(BaseModel):
    patient: PatientResponse
    appointments: list[dict] = []
    medical_records: list[dict] = []
    prescriptions: list[dict] = []
    invoices: list[dict] = []
