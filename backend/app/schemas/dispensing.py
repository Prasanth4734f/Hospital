import uuid
from datetime import datetime
from pydantic import BaseModel, Field

class DispenseRequest(BaseModel):
    prescription_id: uuid.UUID
    prescription_item_id: uuid.UUID
    patient_id: uuid.UUID
    medicine_batch_id: uuid.UUID
    dispensed_quantity: int = Field(..., ge=1)
    pharmacist_notes: str | None = None

class DispensingResponse(BaseModel):
    id: uuid.UUID
    prescription_id: uuid.UUID
    prescription_item_id: uuid.UUID
    patient_id: uuid.UUID
    pharmacist_id: uuid.UUID
    medicine_batch_id: uuid.UUID
    dispensed_quantity: int
    pharmacist_notes: str | None = None
    created_at: datetime
    medicine_name: str | None = None
    batch_number: str | None = None
    pharmacist_name: str | None = None

    class Config:
        from_attributes = True
