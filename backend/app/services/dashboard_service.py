import uuid
from datetime import date, datetime, timezone
from decimal import Decimal
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.models.patient import Patient
from app.models.doctor import Doctor
from app.models.appointment import Appointment, AppointmentStatus
from app.models.medical_record import MedicalRecord
from app.models.medicine import Medicine
from app.models.medicine_batch import MedicineBatch
from app.models.dispensing import Dispensing
from app.models.billing import Invoice
from app.models.user import User

def get_admin_dashboard(db: Session) -> dict:
    today = date.today()
    total_patients = db.query(Patient).filter(Patient.status == "ACTIVE").count()
    total_doctors = db.query(Doctor).filter(Doctor.status == "ACTIVE").count()
    today_appointments = db.query(Appointment).filter(Appointment.appointment_date == today).count()
    pending_appointments = db.query(Appointment).filter(Appointment.status == AppointmentStatus.PENDING).count()
    completed_consultations = db.query(MedicalRecord).filter(MedicalRecord.status == "FINALIZED").count()
    total_revenue = db.query(func.coalesce(func.sum(Invoice.paid_amount), 0)).scalar()

    return {
        "total_patients": total_patients,
        "total_doctors": total_doctors,
        "today_appointments": today_appointments,
        "pending_appointments": pending_appointments,
        "completed_consultations": completed_consultations,
        "total_revenue": total_revenue
    }

def get_doctor_dashboard(db: Session, current_user: User) -> dict:
    doctor = db.query(Doctor).filter(Doctor.user_id == current_user.id).first()
    if not doctor:
        return {"today_appointments": 0, "pending_consultations": 0, "completed_consultations": 0, "assigned_patients": 0}

    today = date.today()
    today_appts = db.query(Appointment).filter(Appointment.doctor_id == doctor.id, Appointment.appointment_date == today).count()
    pending_cons = db.query(Appointment).filter(
        Appointment.doctor_id == doctor.id,
        Appointment.status.in_([AppointmentStatus.CONFIRMED, AppointmentStatus.CHECKED_IN])
    ).count()
    completed_cons = db.query(Appointment).filter(Appointment.doctor_id == doctor.id, Appointment.status == AppointmentStatus.COMPLETED).count()
    assigned_patients = db.query(func.count(func.distinct(Appointment.patient_id))).filter(Appointment.doctor_id == doctor.id).scalar()

    return {
        "today_appointments": today_appts,
        "pending_consultations": pending_cons,
        "completed_consultations": completed_consultations if False else completed_cons,
        "assigned_patients": assigned_patients
    }

def get_receptionist_dashboard(db: Session) -> dict:
    today = date.today()
    today_appts = db.query(Appointment).filter(Appointment.appointment_date == today).count()
    registered_patients = db.query(Patient).count()
    pending_checkins = db.query(Appointment).filter(Appointment.appointment_date == today, Appointment.status == AppointmentStatus.CONFIRMED).count()
    pending_appointments = db.query(Appointment).filter(Appointment.status == AppointmentStatus.PENDING).count()

    return {
        "today_appointments": today_appts,
        "registered_patients": registered_patients,
        "pending_checkins": pending_checkins,
        "pending_appointments": pending_appointments
    }

def get_pharmacist_dashboard(db: Session) -> dict:
    today = date.today()
    total_meds = db.query(Medicine).filter(Medicine.status == "ACTIVE").count()

    # Expiring within 30 days
    from datetime import timedelta
    next_month = today + timedelta(days=30)
    expiring = db.query(MedicineBatch).filter(MedicineBatch.expiry_date <= next_month, MedicineBatch.expiry_date >= today).count()

    # Low stock
    all_meds = db.query(Medicine).filter(Medicine.status == "ACTIVE").all()
    low_stock_count = 0
    for m in all_meds:
        st = sum(b.stock_quantity for b in m.batches if b.expiry_date > today)
        if st <= m.reorder_level:
            low_stock_count += 1

    today_dispensed = db.query(Dispensing).filter(func.date(Dispensing.created_at) == today).count()

    return {
        "total_medicines": total_meds,
        "low_stock_medicines": low_stock_count,
        "expiring_batches": expiring,
        "today_dispensing_count": today_dispensed
    }

def get_patient_dashboard(db: Session, current_user: User) -> dict:
    if not current_user.patient_profile:
        return {"upcoming_appointments": 0, "completed_appointments": 0, "pending_payments": Decimal("0.00"), "prescriptions_count": 0}

    patient_id = current_user.patient_profile.id
    today = date.today()
    upcoming = db.query(Appointment).filter(
        Appointment.patient_id == patient_id,
        Appointment.appointment_date >= today,
        Appointment.status.notin_([AppointmentStatus.CANCELLED, AppointmentStatus.COMPLETED])
    ).count()

    completed = db.query(Appointment).filter(Appointment.patient_id == patient_id, Appointment.status == AppointmentStatus.COMPLETED).count()
    pending_pay = db.query(func.coalesce(func.sum(Invoice.balance_amount), 0)).filter(
        Invoice.patient_id == patient_id,
        Invoice.payment_status.in_(["UNPAID", "PARTIALLY_PAID"])
    ).scalar()
    from app.models.prescription import Prescription
    rx_count = db.query(Prescription).filter(Prescription.patient_id == patient_id).count()

    return {
        "upcoming_appointments": upcoming,
        "completed_appointments": completed,
        "pending_payments": pending_pay,
        "prescriptions_count": rx_count
    }
