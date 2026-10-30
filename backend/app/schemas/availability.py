import uuid
from datetime import time
from pydantic import BaseModel, Field

class AvailabilitySlotBase(BaseModel):
    day_of_week: int = Field(..., ge=0, le=6, description="0=Monday, 6=Sunday")
    start_time: time
    end_time: time
    slot_duration_minutes: int = Field(default=30, ge=10, le=120)
    is_available: bool = True

class AvailabilitySlotCreate(AvailabilitySlotBase):
    pass

class AvailabilitySlotResponse(AvailabilitySlotBase):
    id: uuid.UUID
    doctor_id: uuid.UUID

    class Config:
        from_attributes = True

class DoctorAvailabilityUpdate(BaseModel):
    slots: list[AvailabilitySlotCreate]
