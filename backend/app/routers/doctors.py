import uuid
from fastapi import APIRouter, Depends, Query, status, HTTPException
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.core.dependencies import get_current_user, require_role
from app.core.permissions import UserRole, ADMIN_ROLES, STAFF_ROLES
from app.models.user import User
from app.schemas.doctor import DoctorCreate, DoctorUpdate
from app.schemas.availability import DoctorAvailabilityUpdate
from app.services import doctor_service
from app.utils.responses import api_success, api_paginated
from app.utils.pagination import get_pagination_params, PaginationParams

router = APIRouter(prefix="/doctors", tags=["Doctors"])

@router.post("", status_code=status.HTTP_201_CREATED)
def register_doctor(
    req: DoctorCreate,
    current_user: User = Depends(require_role(*ADMIN_ROLES)),
    db: Session = Depends(get_db)
):
    doctor = doctor_service.create_doctor(db, req, current_user=current_user)
    return api_success(
        "Doctor registered successfully",
        {
            "id": str(doctor.id),
            "user_id": str(doctor.user_id),
            "doctor_number": doctor.doctor_number,
            "medical_registration_number": doctor.medical_registration_number,
            "specialization": doctor.specialization,
            "status": doctor.status
        }
    )

@router.get("")
def list_doctors(
    search: str | None = Query(default=None),
    specialization: str | None = Query(default=None),
    department_id: uuid.UUID | None = Query(default=None),
    status: str | None = Query(default=None),
    pagination: PaginationParams = Depends(get_pagination_params),
    db: Session = Depends(get_db)
):
    items, total = doctor_service.list_doctors(
        db,
        search=search,
        specialization=specialization,
        department_id=department_id,
        status_filter=status,
        offset=pagination.offset,
        limit=pagination.limit
    )

    data = [
        {
            "id": str(d.id),
            "user_id": str(d.user_id),
            "doctor_number": d.doctor_number,
            "full_name": d.user.full_name if d.user else None,
            "email": d.user.email if d.user else None,
            "phone": d.user.phone if d.user else None,
            "medical_registration_number": d.medical_registration_number,
            "specialization": d.specialization,
            "qualifications": d.qualifications,
            "experience_years": d.experience_years,
            "consultation_fee": float(d.consultation_fee),
            "department_id": str(d.department_id) if d.department_id else None,
            "department_name": d.department.department_name if d.department else None,
            "availability_status": d.availability_status,
            "status": d.status,
            "created_at": d.created_at.isoformat()
        } for d in items
    ]
    return api_paginated(data, total, pagination.page, pagination.limit, "Doctors retrieved successfully")

@router.get("/{doctor_id}")
def get_doctor(
    doctor_id: uuid.UUID,
    db: Session = Depends(get_db)
):
    d = doctor_service.get_doctor_by_id(db, doctor_id)
    return api_success(
        "Doctor retrieved successfully",
        {
            "id": str(d.id),
            "user_id": str(d.user_id),
            "doctor_number": d.doctor_number,
            "full_name": d.user.full_name if d.user else None,
            "email": d.user.email if d.user else None,
            "phone": d.user.phone if d.user else None,
            "medical_registration_number": d.medical_registration_number,
            "specialization": d.specialization,
            "qualifications": d.qualifications,
            "experience_years": d.experience_years,
            "consultation_fee": float(d.consultation_fee),
            "department_id": str(d.department_id) if d.department_id else None,
            "department_name": d.department.department_name if d.department else None,
            "availability_status": d.availability_status,
            "status": d.status,
            "created_at": d.created_at.isoformat()
        }
    )

@router.put("/{doctor_id}")
def update_doctor(
    doctor_id: uuid.UUID,
    req: DoctorUpdate,
    current_user: User = Depends(require_role(*ADMIN_ROLES, UserRole.DOCTOR)),
    db: Session = Depends(get_db)
):
    # If doctor is editing, ensure it is their own profile
    if current_user.role == UserRole.DOCTOR:
        if not current_user.doctor_profile or current_user.doctor_profile.id != doctor_id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied: Cannot edit another doctor's profile.")

    d = doctor_service.update_doctor(db, doctor_id, req, current_user=current_user)
    return api_success("Doctor profile updated successfully", {"id": str(d.id), "doctor_number": d.doctor_number})

@router.get("/{doctor_id}/availability")
def get_doctor_availability(
    doctor_id: uuid.UUID,
    db: Session = Depends(get_db)
):
    slots = doctor_service.get_doctor_availability(db, doctor_id)
    return api_success(
        "Doctor availability retrieved successfully",
        [
            {
                "id": str(s.id),
                "doctor_id": str(s.doctor_id),
                "day_of_week": s.day_of_week,
                "start_time": str(s.start_time),
                "end_time": str(s.end_time),
                "slot_duration_minutes": s.slot_duration_minutes,
                "is_available": s.is_available
            } for s in slots
        ]
    )

@router.put("/{doctor_id}/availability")
def set_doctor_availability(
    doctor_id: uuid.UUID,
    req: DoctorAvailabilityUpdate,
    current_user: User = Depends(require_role(*ADMIN_ROLES, UserRole.DOCTOR)),
    db: Session = Depends(get_db)
):
    if current_user.role == UserRole.DOCTOR:
        if not current_user.doctor_profile or current_user.doctor_profile.id != doctor_id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied.")

    created_slots = doctor_service.set_doctor_availability(db, doctor_id, req, current_user=current_user)
    return api_success(
        "Doctor availability updated successfully",
        [
            {
                "id": str(s.id),
                "day_of_week": s.day_of_week,
                "start_time": str(s.start_time),
                "end_time": str(s.end_time),
                "slot_duration_minutes": s.slot_duration_minutes,
                "is_available": s.is_available
            } for s in created_slots
        ]
    )
