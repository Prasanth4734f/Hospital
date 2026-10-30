import uuid
from datetime import date, time, datetime
from pydantic import BaseModel, Field
from app.models.appointment import AppointmentStatus

class AppointmentBase(BaseModel):
    patient_id: uuid.UUID
    doctor_id: uuid.UUID
    department_id: uuid.UUID | None = None
    appointment_date: date
    start_time: time
    end_time: time
    appointment_type: str = "GENERAL_CONSULTATION"
    reason_for_visit: str | None = None
    additional_notes: str | None = None

class AppointmentCreate(AppointmentBase):
    pass

class AppointmentUpdate(BaseModel):
    appointment_date: date | None = None
    start_time: time | None = None
    end_time: time | None = None
    appointment_type: str | None = None
    reason_for_visit: str | None = None
    additional_notes: str | None = None

class AppointmentStatusUpdate(BaseModel):
    status: AppointmentStatus

class AppointmentResponse(AppointmentBase):
    id: uuid.UUID
    appointment_number: str
    status: AppointmentStatus
    created_by: uuid.UUID | None = None
    created_at: datetime
    updated_at: datetime
    patient_name: str | None = None
    doctor_name: str | None = None
    department_name: str | None = None

    class Config:
        from_attributes = True

class AvailableSlot(BaseModel):
    start_time: str
    end_time: str
    is_available: bool = True
