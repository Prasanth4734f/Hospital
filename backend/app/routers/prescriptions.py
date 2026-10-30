import uuid
from fastapi import APIRouter, Depends, Query, status, HTTPException
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.core.dependencies import get_current_user, require_role
from app.core.permissions import UserRole, CLINICAL_ROLES, STAFF_ROLES
from app.models.user import User
from app.schemas.prescription import PrescriptionCreate
from app.services import prescription_service
from app.utils.responses import api_success, api_paginated
from app.utils.pagination import get_pagination_params, PaginationParams

router = APIRouter(tags=["Prescriptions"])

@router.post("/prescriptions", status_code=status.HTTP_201_CREATED)
def create_prescription(
    req: PrescriptionCreate,
    current_user: User = Depends(require_role(*CLINICAL_ROLES)),
    db: Session = Depends(get_db)
):
    pr = prescription_service.create_prescription(db, req, current_user=current_user)
    return api_success(
        "Prescription created successfully",
        {
            "id": str(pr.id),
            "prescription_number": pr.prescription_number,
            "patient_id": str(pr.patient_id),
            "doctor_id": str(pr.doctor_id),
            "status": pr.status,
            "items_count": len(pr.items)
        }
    )

@router.get("/prescriptions")
def list_prescriptions(
    patient_id: uuid.UUID | None = Query(default=None),
    doctor_id: uuid.UUID | None = Query(default=None),
    pagination: PaginationParams = Depends(get_pagination_params),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role == UserRole.PATIENT:
        if current_user.patient_profile:
            patient_id = current_user.patient_profile.id
        else:
            return api_paginated([], 0, pagination.page, pagination.limit)

    items, total = prescription_service.list_prescriptions(
        db,
        patient_id=patient_id,
        doctor_id=doctor_id,
        offset=pagination.offset,
        limit=pagination.limit
    )

    data = [
        {
            "id": str(p.id),
            "prescription_number": p.prescription_number,
            "patient_id": str(p.patient_id),
            "patient_name": f"{p.patient.first_name} {p.patient.last_name}" if p.patient else None,
            "doctor_id": str(p.doctor_id),
            "doctor_name": p.doctor.user.full_name if p.doctor and p.doctor.user else None,
            "status": p.status,
            "created_at": p.created_at.isoformat(),
            "items_count": len(p.items)
        } for p in items
    ]
    return api_paginated(data, total, pagination.page, pagination.limit, "Prescriptions retrieved successfully")

@router.get("/prescriptions/{prescription_id}")
def get_prescription(
    prescription_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    pr = prescription_service.get_prescription_by_id(db, prescription_id, current_user=current_user)
    return api_success(
        "Prescription retrieved successfully",
        {
            "id": str(pr.id),
            "prescription_number": pr.prescription_number,
            "patient_id": str(pr.patient_id),
            "patient_name": f"{pr.patient.first_name} {pr.patient.last_name}" if pr.patient else None,
            "doctor_id": str(pr.doctor_id),
            "doctor_name": pr.doctor.user.full_name if pr.doctor and pr.doctor.user else None,
            "medical_record_id": str(pr.medical_record_id) if pr.medical_record_id else None,
            "status": pr.status,
            "created_at": pr.created_at.isoformat(),
            "items": [
                {
                    "id": str(it.id),
                    "medicine_id": str(it.medicine_id) if it.medicine_id else None,
                    "medicine_name": it.medicine_name,
                    "medicine_type": it.medicine_type,
                    "dosage": it.dosage,
                    "frequency": it.frequency,
                    "duration": it.duration,
                    "route": it.route,
                    "instructions": it.instructions,
                    "quantity": it.quantity
                } for it in pr.items
            ]
        }
    )

@router.get("/patients/{patient_id}/prescriptions")
def get_patient_prescriptions(
    patient_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    prs = prescription_service.list_patient_prescriptions(db, patient_id, current_user=current_user)
    return api_success(
        "Patient prescriptions retrieved successfully",
        [
            {
                "id": str(p.id),
                "prescription_number": p.prescription_number,
                "doctor_name": p.doctor.user.full_name if p.doctor and p.doctor.user else None,
                "status": p.status,
                "created_at": p.created_at.isoformat(),
                "items_count": len(p.items)
            } for p in prs
        ]
    )
