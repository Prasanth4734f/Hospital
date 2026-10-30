import uuid
from datetime import datetime, timezone
from sqlalchemy.orm import Session
from sqlalchemy import or_
from fastapi import HTTPException, status

from app.models.patient import Patient
from app.models.user import User
from app.models.appointment import Appointment
from app.models.medical_record import MedicalRecord
from app.models.prescription import Prescription
from app.models.billing import Invoice
from app.schemas.patient import PatientCreate, PatientUpdate
from app.utils.validators import validate_phone
from app.services.notification_service import create_audit_log

def create_patient(db: Session, req: PatientCreate, current_user: User | None = None) -> Patient:
    if not validate_phone(req.phone):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid phone number format.")

    # Unique check for patient_number
    patient_count = db.query(Patient).count() + 1
    patient_number = f"PAT-{datetime.now(timezone.utc).year}-{patient_count:05d}"

    patient = Patient(
        id=uuid.uuid4(),
        user_id=req.user_id,
        patient_number=patient_number,
        first_name=req.first_name.strip(),
        last_name=req.last_name.strip(),
        date_of_birth=req.date_of_birth,
        gender=req.gender,
        blood_group=req.blood_group,
        marital_status=req.marital_status,
        phone=req.phone.strip(),
        email=str(req.email).lower().strip() if req.email else None,
        address=req.address,
        city=req.city,
        state=req.state,
        pincode=req.pincode,
        emergency_contact_name=req.emergency_contact_name,
        emergency_phone=req.emergency_phone,
        emergency_relationship=req.emergency_relationship,
        status="ACTIVE",
        created_at=datetime.now(timezone.utc),
        updated_at=datetime.now(timezone.utc)
    )
    db.add(patient)
    create_audit_log(
        db,
        current_user.id if current_user else None,
        "PATIENT_CREATE",
        "patients",
        patient.id,
        {"patient_number": patient.patient_number}
    )
    db.commit()
    db.refresh(patient)
    return patient

def get_patient_by_id(db: Session, patient_id: uuid.UUID) -> Patient:
    patient = db.query(Patient).filter(Patient.id == patient_id).first()
    if not patient:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Patient not found.")
    return patient

def update_patient(db: Session, patient_id: uuid.UUID, req: PatientUpdate, current_user: User | None = None) -> Patient:
    patient = get_patient_by_id(db, patient_id)
    update_data = req.model_dump(exclude_unset=True)

    if "phone" in update_data and update_data["phone"]:
        if not validate_phone(update_data["phone"]):
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid phone number format.")

    for field, value in update_data.items():
        setattr(patient, field, value)

    patient.updated_at = datetime.now(timezone.utc)
    create_audit_log(db, current_user.id if current_user else None, "PATIENT_UPDATE", "patients", patient.id, update_data)
    db.commit()
    db.refresh(patient)
    return patient

def deactivate_patient(db: Session, patient_id: uuid.UUID, current_user: User | None = None) -> Patient:
    patient = get_patient_by_id(db, patient_id)
    patient.status = "INACTIVE"
    patient.updated_at = datetime.now(timezone.utc)
    create_audit_log(db, current_user.id if current_user else None, "PATIENT_DEACTIVATE", "patients", patient.id)
    db.commit()
    db.refresh(patient)
    return patient

def list_patients(
    db: Session,
    search: str | None = None,
    gender: str | None = None,
    blood_group: str | None = None,
    status_filter: str | None = None,
    offset: int = 0,
    limit: int = 20
) -> tuple[list[Patient], int]:
    query = db.query(Patient)

    if search:
        s = f"%{search.strip()}%"
        query = query.filter(
            or_(
                Patient.first_name.ilike(s),
                Patient.last_name.ilike(s),
                Patient.patient_number.ilike(s),
                Patient.phone.ilike(s),
                Patient.email.ilike(s)
            )
        )

    if gender:
        query = query.filter(Patient.gender.ilike(gender))
    if blood_group:
        query = query.filter(Patient.blood_group == blood_group)
    if status_filter:
        query = query.filter(Patient.status == status_filter)

    total = query.count()
    items = query.order_by(Patient.created_at.desc()).offset(offset).limit(limit).all()
    return items, total

def get_patient_history(db: Session, patient_id: uuid.UUID) -> dict:
    patient = get_patient_by_id(db, patient_id)
    appointments = db.query(Appointment).filter(Appointment.patient_id == patient_id).order_by(Appointment.appointment_date.desc()).all()
    medical_records = db.query(MedicalRecord).filter(MedicalRecord.patient_id == patient_id).order_by(MedicalRecord.created_at.desc()).all()
    prescriptions = db.query(Prescription).filter(Prescription.patient_id == patient_id).order_by(Prescription.created_at.desc()).all()
    invoices = db.query(Invoice).filter(Invoice.patient_id == patient_id).order_by(Invoice.created_at.desc()).all()

    return {
        "patient": patient,
        "appointments": [
            {
                "id": str(a.id),
                "appointment_number": a.appointment_number,
                "date": str(a.appointment_date),
                "start_time": str(a.start_time),
                "status": a.status.value,
                "doctor_id": str(a.doctor_id)
            } for a in appointments
        ],
        "medical_records": [
            {
                "id": str(m.id),
                "diagnosis": m.diagnosis,
                "chief_complaint": m.chief_complaint,
                "status": m.status,
                "created_at": m.created_at.isoformat()
            } for m in medical_records
        ],
        "prescriptions": [
            {
                "id": str(p.id),
                "prescription_number": p.prescription_number,
                "status": p.status,
                "created_at": p.created_at.isoformat()
            } for p in prescriptions
        ],
        "invoices": [
            {
                "id": str(i.id),
                "invoice_number": i.invoice_number,
                "total_amount": float(i.total_amount),
                "paid_amount": float(i.paid_amount),
                "balance_amount": float(i.balance_amount),
                "payment_status": i.payment_status
            } for i in invoices
        ]
    }
