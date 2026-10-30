import uuid
from datetime import datetime, timezone
from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from app.models.medical_record import MedicalRecord
from app.models.patient import Patient
from app.models.doctor import Doctor
from app.models.appointment import Appointment
from app.models.user import User
from app.core.permissions import UserRole
from app.schemas.medical_record import MedicalRecordCreate, MedicalRecordUpdate
from app.services.notification_service import create_audit_log

def create_medical_record(db: Session, req: MedicalRecordCreate, current_user: User) -> MedicalRecord:
    # Get current doctor
    doctor = db.query(Doctor).filter(Doctor.user_id == current_user.id).first()
    if not doctor and current_user.role not in [UserRole.SUPER_ADMIN, UserRole.HOSPITAL_ADMIN]:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only doctors can create medical records.")

    doctor_id = doctor.id if doctor else db.query(Doctor).first().id

    patient = db.query(Patient).filter(Patient.id == req.patient_id).first()
    if not patient:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Patient not found.")

    record = MedicalRecord(
        id=uuid.uuid4(),
        patient_id=req.patient_id,
        doctor_id=doctor_id,
        appointment_id=req.appointment_id,
        chief_complaint=req.chief_complaint,
        symptoms=req.symptoms,
        blood_pressure=req.blood_pressure,
        heart_rate=req.heart_rate,
        temperature=req.temperature,
        oxygen_saturation=req.oxygen_saturation,
        diagnosis=req.diagnosis,
        clinical_notes=req.clinical_notes,
        follow_up_date=req.follow_up_date,
        status=req.status or "DRAFT",
        created_at=datetime.now(timezone.utc),
        updated_at=datetime.now(timezone.utc)
    )
    db.add(record)
    create_audit_log(db, current_user.id, "MEDICAL_RECORD_CREATE", "medical_records", record.id, {"status": record.status})
    db.commit()
    db.refresh(record)
    return record

def get_medical_record_by_id(db: Session, record_id: uuid.UUID, current_user: User) -> MedicalRecord:
    record = db.query(MedicalRecord).filter(MedicalRecord.id == record_id).first()
    if not record:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Medical record not found.")

    # Authorization check
    if current_user.role == UserRole.PATIENT:
        if not current_user.patient_profile or record.patient_id != current_user.patient_profile.id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="You can only access your own medical records.")
    elif current_user.role == UserRole.DOCTOR:
        if not current_user.doctor_profile or record.doctor_id != current_user.doctor_profile.id:
            # Check if doctor is assigned or admin
            pass

    return record

def update_medical_record(db: Session, record_id: uuid.UUID, req: MedicalRecordUpdate, current_user: User) -> MedicalRecord:
    record = db.query(MedicalRecord).filter(MedicalRecord.id == record_id).first()
    if not record:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Medical record not found.")

    if record.status == "FINALIZED" and req.status != "AMENDED":
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Finalized medical records cannot be overwritten directly. Create an amendment.")

    update_data = req.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(record, field, value)

    record.updated_at = datetime.now(timezone.utc)
    create_audit_log(db, current_user.id, "MEDICAL_RECORD_UPDATE", "medical_records", record.id, update_data)
    db.commit()
    db.refresh(record)
    return record

def list_patient_medical_records(db: Session, patient_id: uuid.UUID, current_user: User) -> list[MedicalRecord]:
    if current_user.role == UserRole.PATIENT:
        if not current_user.patient_profile or current_user.patient_profile.id != patient_id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied to patient records.")

    return db.query(MedicalRecord).filter(MedicalRecord.patient_id == patient_id).order_by(MedicalRecord.created_at.desc()).all()
