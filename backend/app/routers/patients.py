import uuid
from fastapi import APIRouter, Depends, Query, status, HTTPException
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.core.dependencies import get_current_user, require_role
from app.core.permissions import UserRole, ADMIN_ROLES, RECEPTION_ROLES, STAFF_ROLES
from app.models.user import User
from app.schemas.patient import PatientCreate, PatientUpdate, PatientResponse
from app.services import patient_service
from app.utils.responses import api_success, api_paginated
from app.utils.pagination import get_pagination_params, PaginationParams

router = APIRouter(prefix="/patients", tags=["Patients"])

@router.post("", status_code=status.HTTP_201_CREATED)
def register_patient(
    req: PatientCreate,
    current_user: User = Depends(require_role(*STAFF_ROLES)),
    db: Session = Depends(get_db)
):
    patient = patient_service.create_patient(db, req, current_user=current_user)
    return api_success("Patient registered successfully", {
        "id": str(patient.id),
        "patient_number": patient.patient_number,
        "first_name": patient.first_name,
        "last_name": patient.last_name,
        "phone": patient.phone,
        "status": patient.status
    })

@router.get("")
def list_patients(
    search: str | None = Query(default=None),
    gender: str | None = Query(default=None),
    blood_group: str | None = Query(default=None),
    status: str | None = Query(default=None),
    pagination: PaginationParams = Depends(get_pagination_params),
    current_user: User = Depends(require_role(*STAFF_ROLES)),
    db: Session = Depends(get_db)
):
    items, total = patient_service.list_patients(
        db,
        search=search,
        gender=gender,
        blood_group=blood_group,
        status_filter=status,
        offset=pagination.offset,
        limit=pagination.limit
    )

    data = [
        {
            "id": str(p.id),
            "patient_number": p.patient_number,
            "first_name": p.first_name,
            "last_name": p.last_name,
            "gender": p.gender,
            "blood_group": p.blood_group,
            "phone": p.phone,
            "email": p.email,
            "city": p.city,
            "status": p.status,
            "created_at": p.created_at.isoformat()
        } for p in items
    ]
    return api_paginated(data, total, pagination.page, pagination.limit, "Patients retrieved successfully")

@router.get("/{patient_id}")
def get_patient(
    patient_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Patient can only get own details
    if current_user.role == UserRole.PATIENT:
        if not current_user.patient_profile or current_user.patient_profile.id != patient_id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied to patient profile.")

    patient = patient_service.get_patient_by_id(db, patient_id)
    return api_success(
        "Patient retrieved successfully",
        {
            "id": str(patient.id),
            "user_id": str(patient.user_id) if patient.user_id else None,
            "patient_number": patient.patient_number,
            "first_name": patient.first_name,
            "last_name": patient.last_name,
            "date_of_birth": str(patient.date_of_birth) if patient.date_of_birth else None,
            "gender": patient.gender,
            "blood_group": patient.blood_group,
            "marital_status": patient.marital_status,
            "phone": patient.phone,
            "email": patient.email,
            "address": patient.address,
            "city": patient.city,
            "state": patient.state,
            "pincode": patient.pincode,
            "emergency_contact_name": patient.emergency_contact_name,
            "emergency_phone": patient.emergency_phone,
            "emergency_relationship": patient.emergency_relationship,
            "status": patient.status,
            "created_at": patient.created_at.isoformat(),
            "updated_at": patient.updated_at.isoformat()
        }
    )

@router.put("/{patient_id}")
def update_patient(
    patient_id: uuid.UUID,
    req: PatientUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role == UserRole.PATIENT:
        if not current_user.patient_profile or current_user.patient_profile.id != patient_id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied.")
    elif current_user.role not in STAFF_ROLES:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied.")

    patient = patient_service.update_patient(db, patient_id, req, current_user=current_user)
    return api_success("Patient updated successfully", {"id": str(patient.id), "patient_number": patient.patient_number})

@router.delete("/{patient_id}")
def deactivate_patient(
    patient_id: uuid.UUID,
    current_user: User = Depends(require_role(*ADMIN_ROLES)),
    db: Session = Depends(get_db)
):
    patient = patient_service.deactivate_patient(db, patient_id, current_user=current_user)
    return api_success("Patient deactivated successfully (historical medical records preserved)", {"id": str(patient.id), "status": patient.status})

@router.get("/{patient_id}/history")
def get_patient_history(
    patient_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role == UserRole.PATIENT:
        if not current_user.patient_profile or current_user.patient_profile.id != patient_id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied.")
    elif current_user.role not in [UserRole.SUPER_ADMIN, UserRole.HOSPITAL_ADMIN, UserRole.DOCTOR]:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only doctors and administrators may view complete medical history.")

    history = patient_service.get_patient_history(db, patient_id)
    p = history["patient"]
    return api_success(
        "Patient medical history retrieved successfully",
        {
            "patient": {
                "id": str(p.id),
                "patient_number": p.patient_number,
                "first_name": p.first_name,
                "last_name": p.last_name,
                "phone": p.phone,
                "blood_group": p.blood_group
            },
            "appointments": history["appointments"],
            "medical_records": history["medical_records"],
            "prescriptions": history["prescriptions"],
            "invoices": history["invoices"]
        }
    )
