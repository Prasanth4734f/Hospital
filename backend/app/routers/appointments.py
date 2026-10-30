import uuid
from datetime import date
from fastapi import APIRouter, Depends, Query, status, HTTPException
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.core.dependencies import get_current_user, require_role
from app.core.permissions import UserRole, STAFF_ROLES
from app.models.user import User
from app.models.appointment import AppointmentStatus
from app.schemas.appointment import AppointmentCreate, AppointmentUpdate, AppointmentStatusUpdate
from app.services import appointment_service
from app.utils.responses import api_success, api_paginated
from app.utils.pagination import get_pagination_params, PaginationParams

router = APIRouter(prefix="/appointments", tags=["Appointments"])

@router.get("/availability")
def get_appointment_availability(
    doctor_id: uuid.UUID = Query(...),
    appointment_date: date = Query(...),
    appointment_type: str | None = Query(default="GENERAL_CONSULTATION"),
    db: Session = Depends(get_db)
):
    slots = appointment_service.generate_doctor_slots(db, doctor_id, appointment_date)
    return api_success("Available slots retrieved successfully", slots)

@router.post("", status_code=status.HTTP_201_CREATED)
def book_appointment(
    req: AppointmentCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # If patient, they can only book for themselves
    if current_user.role == UserRole.PATIENT:
        if not current_user.patient_profile or current_user.patient_profile.id != req.patient_id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Patients can only book appointments for themselves.")

    appt = appointment_service.create_appointment(db, req, current_user=current_user)
    return api_success(
        "Appointment booked successfully",
        {
            "id": str(appt.id),
            "appointment_number": appt.appointment_number,
            "patient_id": str(appt.patient_id),
            "doctor_id": str(appt.doctor_id),
            "appointment_date": str(appt.appointment_date),
            "start_time": str(appt.start_time),
            "end_time": str(appt.end_time),
            "status": appt.status.value
        }
    )

@router.get("")
def list_appointments(
    doctor_id: uuid.UUID | None = Query(default=None),
    patient_id: uuid.UUID | None = Query(default=None),
    appointment_date: date | None = Query(default=None),
    status: AppointmentStatus | None = Query(default=None),
    pagination: PaginationParams = Depends(get_pagination_params),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Patient can only list own appointments
    if current_user.role == UserRole.PATIENT:
        if current_user.patient_profile:
            patient_id = current_user.patient_profile.id
        else:
            return api_paginated([], 0, pagination.page, pagination.limit)

    # Doctor filtering to self unless admin
    if current_user.role == UserRole.DOCTOR:
        if current_user.doctor_profile:
            doctor_id = current_user.doctor_profile.id

    items, total = appointment_service.list_appointments(
        db,
        doctor_id=doctor_id,
        patient_id=patient_id,
        appointment_date=appointment_date,
        status_filter=status,
        offset=pagination.offset,
        limit=pagination.limit
    )

    data = [
        {
            "id": str(a.id),
            "appointment_number": a.appointment_number,
            "patient_id": str(a.patient_id),
            "patient_name": f"{a.patient.first_name} {a.patient.last_name}" if a.patient else None,
            "patient_phone": a.patient.phone if a.patient else None,
            "doctor_id": str(a.doctor_id),
            "doctor_name": a.doctor.user.full_name if a.doctor and a.doctor.user else None,
            "department_name": a.department.department_name if a.department else None,
            "appointment_date": str(a.appointment_date),
            "start_time": str(a.start_time),
            "end_time": str(a.end_time),
            "appointment_type": a.appointment_type,
            "reason_for_visit": a.reason_for_visit,
            "status": a.status.value,
            "created_at": a.created_at.isoformat()
        } for a in items
    ]
    return api_paginated(data, total, pagination.page, pagination.limit, "Appointments retrieved successfully")

@router.get("/{appointment_id}")
def get_appointment(
    appointment_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    a = appointment_service.get_appointment_by_id(db, appointment_id)

    if current_user.role == UserRole.PATIENT:
        if not current_user.patient_profile or a.patient_id != current_user.patient_profile.id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied.")

    return api_success(
        "Appointment retrieved successfully",
        {
            "id": str(a.id),
            "appointment_number": a.appointment_number,
            "patient_id": str(a.patient_id),
            "patient_name": f"{a.patient.first_name} {a.patient.last_name}" if a.patient else None,
            "doctor_id": str(a.doctor_id),
            "doctor_name": a.doctor.user.full_name if a.doctor and a.doctor.user else None,
            "appointment_date": str(a.appointment_date),
            "start_time": str(a.start_time),
            "end_time": str(a.end_time),
            "appointment_type": a.appointment_type,
            "reason_for_visit": a.reason_for_visit,
            "status": a.status.value,
            "created_at": a.created_at.isoformat()
        }
    )

@router.put("/{appointment_id}")
def update_appointment(
    appointment_id: uuid.UUID,
    req: AppointmentUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    appt = appointment_service.update_appointment(db, appointment_id, req, current_user=current_user)
    return api_success("Appointment rescheduled successfully", {"id": str(appt.id), "appointment_number": appt.appointment_number, "status": appt.status.value})

@router.patch("/{appointment_id}/status")
def update_appointment_status(
    appointment_id: uuid.UUID,
    req: AppointmentStatusUpdate,
    current_user: User = Depends(require_role(*STAFF_ROLES)),
    db: Session = Depends(get_db)
):
    appt = appointment_service.transition_appointment_status(db, appointment_id, req.status, current_user=current_user)
    return api_success(f"Appointment status transitioned to {req.status.value}", {"id": str(appt.id), "status": appt.status.value})

@router.delete("/{appointment_id}")
def cancel_appointment(
    appointment_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    appointment_service.delete_appointment(db, appointment_id, current_user=current_user)
    return api_success("Appointment cancelled successfully", None)
