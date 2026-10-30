from datetime import date
from decimal import Decimal
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.models.patient import Patient
from app.models.doctor import Doctor
from app.models.appointment import Appointment
from app.models.medical_record import MedicalRecord
from app.models.medicine import Medicine
from app.models.billing import Invoice
from app.models.payment import Payment

def get_patients_report(db: Session, start_date: date | None = None, end_date: date | None = None) -> list[dict]:
    query = db.query(Patient)
    if start_date:
        query = query.filter(func.date(Patient.created_at) >= start_date)
    if end_date:
        query = query.filter(func.date(Patient.created_at) <= end_date)

    patients = query.all()
    return [
        {
            "patient_number": p.patient_number,
            "full_name": f"{p.first_name} {p.last_name}",
            "gender": p.gender,
            "blood_group": p.blood_group,
            "phone": p.phone,
            "status": p.status,
            "created_at": p.created_at.strftime("%Y-%m-%d")
        } for p in patients
    ]

def get_doctors_report(db: Session) -> list[dict]:
    doctors = db.query(Doctor).all()
    return [
        {
            "doctor_number": d.doctor_number,
            "full_name": d.user.full_name if d.user else "Unknown",
            "specialization": d.specialization,
            "qualifications": d.qualifications,
            "consultation_fee": float(d.consultation_fee),
            "status": d.status,
            "department": d.department.department_name if d.department else "General"
        } for d in doctors
    ]

def get_appointments_report(
    db: Session,
    start_date: date | None = None,
    end_date: date | None = None,
    status_filter: str | None = None
) -> list[dict]:
    query = db.query(Appointment)
    if start_date:
        query = query.filter(Appointment.appointment_date >= start_date)
    if end_date:
        query = query.filter(Appointment.appointment_date <= end_date)
    if status_filter:
        query = query.filter(Appointment.status == status_filter)

    appts = query.all()
    return [
        {
            "appointment_number": a.appointment_number,
            "date": str(a.appointment_date),
            "time": str(a.start_time),
            "status": a.status.value,
            "doctor": a.doctor.user.full_name if a.doctor and a.doctor.user else "N/A",
            "patient": f"{a.patient.first_name} {a.patient.last_name}" if a.patient else "N/A"
        } for a in appts
    ]

def get_revenue_report(db: Session, start_date: date | None = None, end_date: date | None = None) -> dict:
    query = db.query(Payment)
    if start_date:
        query = query.filter(func.date(Payment.created_at) >= start_date)
    if end_date:
        query = query.filter(func.date(Payment.created_at) <= end_date)

    payments = query.all()
    total_rev = sum((p.amount for p in payments), Decimal("0.00"))

    by_method = {}
    for p in payments:
        by_method[p.payment_method] = by_method.get(p.payment_method, Decimal("0.00")) + p.amount

    return {
        "total_revenue": float(total_rev),
        "payment_count": len(payments),
        "revenue_by_method": {k: float(v) for k, v in by_method.items()},
        "payments": [
            {
                "payment_number": p.payment_number,
                "amount": float(p.amount),
                "method": p.payment_method,
                "status": p.payment_status,
                "created_at": p.created_at.strftime("%Y-%m-%d %H:%M:%S")
            } for p in payments
        ]
    }
