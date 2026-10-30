import uuid
from datetime import datetime, timezone
from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from app.models.prescription import Prescription
from app.models.prescription_item import PrescriptionItem
from app.models.patient import Patient
from app.models.doctor import Doctor
from app.models.user import User
from app.core.permissions import UserRole
from app.schemas.prescription import PrescriptionCreate
from app.services.notification_service import create_notification, create_audit_log

def create_prescription(db: Session, req: PrescriptionCreate, current_user: User) -> Prescription:
    doctor = db.query(Doctor).filter(Doctor.user_id == current_user.id).first()
    if not doctor and current_user.role not in [UserRole.SUPER_ADMIN, UserRole.HOSPITAL_ADMIN]:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only doctors can create prescriptions.")

    doctor_id = doctor.id if doctor else db.query(Doctor).first().id

    patient = db.query(Patient).filter(Patient.id == req.patient_id).first()
    if not patient:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Patient not found.")

    pr_count = db.query(Prescription).count() + 1
    prescription_number = f"RX-{datetime.now(timezone.utc).year}-{pr_count:05d}"

    prescription = Prescription(
        id=uuid.uuid4(),
        prescription_number=prescription_number,
        patient_id=req.patient_id,
        doctor_id=doctor_id,
        medical_record_id=req.medical_record_id,
        status="ACTIVE",
        created_at=datetime.now(timezone.utc)
    )
    db.add(prescription)
    db.flush()

    for item in req.items:
        pr_item = PrescriptionItem(
            id=uuid.uuid4(),
            prescription_id=prescription.id,
            medicine_id=item.medicine_id,
            medicine_name=item.medicine_name,
            medicine_type=item.medicine_type,
            dosage=item.dosage,
            frequency=item.frequency,
            duration=item.duration,
            route=item.route,
            instructions=item.instructions,
            quantity=item.quantity
        )
        db.add(pr_item)

    if patient.user_id:
        create_notification(
            db,
            patient.user_id,
            "New Prescription Issued",
            f"Prescription {prescription.prescription_number} has been issued by your doctor.",
            category="PRESCRIPTION",
            reference_id=prescription.id
        )

    create_audit_log(db, current_user.id, "PRESCRIPTION_CREATE", "prescriptions", prescription.id, {"prescription_number": prescription_number})
    db.commit()
    db.refresh(prescription)
    return prescription

def get_prescription_by_id(db: Session, prescription_id: uuid.UUID, current_user: User) -> Prescription:
    pr = db.query(Prescription).filter(Prescription.id == prescription_id).first()
    if not pr:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Prescription not found.")

    if current_user.role == UserRole.PATIENT:
        if not current_user.patient_profile or pr.patient_id != current_user.patient_profile.id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied to prescription.")

    return pr

def list_prescriptions(
    db: Session,
    patient_id: uuid.UUID | None = None,
    doctor_id: uuid.UUID | None = None,
    offset: int = 0,
    limit: int = 20
) -> tuple[list[Prescription], int]:
    query = db.query(Prescription)
    if patient_id:
        query = query.filter(Prescription.patient_id == patient_id)
    if doctor_id:
        query = query.filter(Prescription.doctor_id == doctor_id)

    total = query.count()
    items = query.order_by(Prescription.created_at.desc()).offset(offset).limit(limit).all()
    return items, total

def list_patient_prescriptions(db: Session, patient_id: uuid.UUID, current_user: User) -> list[Prescription]:
    if current_user.role == UserRole.PATIENT:
        if not current_user.patient_profile or current_user.patient_profile.id != patient_id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied to prescriptions.")

    return db.query(Prescription).filter(Prescription.patient_id == patient_id).order_by(Prescription.created_at.desc()).all()
