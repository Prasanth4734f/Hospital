import uuid
from datetime import date, datetime
from decimal import Decimal
from pydantic import BaseModel, Field

class MedicalRecordBase(BaseModel):
    patient_id: uuid.UUID
    appointment_id: uuid.UUID | None = None
    chief_complaint: str | None = None
    symptoms: str | None = None
    blood_pressure: str | None = None
    heart_rate: int | None = Field(default=None, ge=30, le=250)
    temperature: Decimal | None = Field(default=None, ge=70, le=115)
    oxygen_saturation: Decimal | None = Field(default=None, ge=50, le=100)
    diagnosis: str | None = None
    clinical_notes: str | None = None
    follow_up_date: date | None = None
    status: str = "DRAFT" # DRAFT or FINALIZED

class MedicalRecordCreate(MedicalRecordBase):
    pass

class MedicalRecordUpdate(BaseModel):
    chief_complaint: str | None = None
    symptoms: str | None = None
    blood_pressure: str | None = None
    heart_rate: int | None = Field(default=None, ge=30, le=250)
    temperature: Decimal | None = Field(default=None, ge=70, le=115)
    oxygen_saturation: Decimal | None = Field(default=None, ge=50, le=100)
    diagnosis: str | None = None
    clinical_notes: str | None = None
    follow_up_date: date | None = None
    status: str | None = None

class MedicalRecordResponse(MedicalRecordBase):
    id: uuid.UUID
    doctor_id: uuid.UUID
    created_at: datetime
    updated_at: datetime
    doctor_name: str | None = None
    patient_name: str | None = None

    class Config:
        from_attributes = True
