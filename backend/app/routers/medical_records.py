import uuid
from fastapi import APIRouter, Depends, status, HTTPException
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.core.dependencies import get_current_user, require_role
from app.core.permissions import UserRole, CLINICAL_ROLES
from app.models.user import User
from app.schemas.medical_record import MedicalRecordCreate, MedicalRecordUpdate
from app.services import medical_record_service
from app.utils.responses import api_success

router = APIRouter(tags=["Medical Records"])

@router.post("/medical-records", status_code=status.HTTP_201_CREATED)
def create_medical_record(
    req: MedicalRecordCreate,
    current_user: User = Depends(require_role(*CLINICAL_ROLES)),
    db: Session = Depends(get_db)
):
    rec = medical_record_service.create_medical_record(db, req, current_user=current_user)
    return api_success(
        "Medical record created successfully",
        {
            "id": str(rec.id),
            "patient_id": str(rec.patient_id),
            "doctor_id": str(rec.doctor_id),
            "status": rec.status,
            "created_at": rec.created_at.isoformat()
        }
    )

@router.get("/medical-records/{record_id}")
def get_medical_record(
    record_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    rec = medical_record_service.get_medical_record_by_id(db, record_id, current_user=current_user)
    return api_success(
        "Medical record retrieved successfully",
        {
            "id": str(rec.id),
            "patient_id": str(rec.patient_id),
            "doctor_id": str(rec.doctor_id),
            "appointment_id": str(rec.appointment_id) if rec.appointment_id else None,
            "chief_complaint": rec.chief_complaint,
            "symptoms": rec.symptoms,
            "blood_pressure": rec.blood_pressure,
            "heart_rate": rec.heart_rate,
            "temperature": float(rec.temperature) if rec.temperature else None,
            "oxygen_saturation": float(rec.oxygen_saturation) if rec.oxygen_saturation else None,
            "diagnosis": rec.diagnosis,
            "clinical_notes": rec.clinical_notes,
            "follow_up_date": str(rec.follow_up_date) if rec.follow_up_date else None,
            "status": rec.status,
            "created_at": rec.created_at.isoformat(),
            "updated_at": rec.updated_at.isoformat()
        }
    )

@router.put("/medical-records/{record_id}")
def update_medical_record(
    record_id: uuid.UUID,
    req: MedicalRecordUpdate,
    current_user: User = Depends(require_role(*CLINICAL_ROLES)),
    db: Session = Depends(get_db)
):
    rec = medical_record_service.update_medical_record(db, record_id, req, current_user=current_user)
    return api_success("Medical record updated successfully", {"id": str(rec.id), "status": rec.status})

@router.get("/patients/{patient_id}/medical-records")
def get_patient_medical_records(
    patient_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    records = medical_record_service.list_patient_medical_records(db, patient_id, current_user=current_user)
    return api_success(
        "Patient medical records retrieved successfully",
        [
            {
                "id": str(r.id),
                "patient_id": str(r.patient_id),
                "doctor_id": str(r.doctor_id),
                "doctor_name": r.doctor.user.full_name if r.doctor and r.doctor.user else None,
                "chief_complaint": r.chief_complaint,
                "diagnosis": r.diagnosis,
                "status": r.status,
                "created_at": r.created_at.isoformat()
            } for r in records
        ]
    )
