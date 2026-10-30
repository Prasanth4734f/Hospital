import uuid
from datetime import datetime
from pydantic import BaseModel, Field

class PrescriptionItemBase(BaseModel):
    medicine_id: uuid.UUID | None = None
    medicine_name: str = Field(..., min_length=1)
    medicine_type: str = "TABLET"
    dosage: str = Field(..., min_length=1)
    frequency: str = Field(..., min_length=1)
    duration: int = Field(..., ge=1)
    route: str = "ORAL"
    instructions: str | None = None
    quantity: int = Field(..., ge=1)

class PrescriptionItemCreate(PrescriptionItemBase):
    pass

class PrescriptionItemResponse(PrescriptionItemBase):
    id: uuid.UUID
    prescription_id: uuid.UUID

    class Config:
        from_attributes = True

class PrescriptionCreate(BaseModel):
    patient_id: uuid.UUID
    medical_record_id: uuid.UUID | None = None
    items: list[PrescriptionItemCreate] = Field(..., min_items=1)

class PrescriptionResponse(BaseModel):
    id: uuid.UUID
    prescription_number: str
    patient_id: uuid.UUID
    doctor_id: uuid.UUID
    medical_record_id: uuid.UUID | None = None
    status: str
    created_at: datetime
    patient_name: str | None = None
    doctor_name: str | None = None
    items: list[PrescriptionItemResponse] = []

    class Config:
        from_attributes = True
