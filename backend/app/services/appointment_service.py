import uuid
from datetime import datetime, timezone, date, time, timedelta
from sqlalchemy.orm import Session
from sqlalchemy import or_, and_
from fastapi import HTTPException, status

from app.models.appointment import Appointment, AppointmentStatus
from app.models.doctor import Doctor
from app.models.patient import Patient
from app.models.doctor_availability import DoctorAvailability
from app.models.user import User
from app.schemas.appointment import AppointmentCreate, AppointmentUpdate
from app.services.notification_service import create_notification, create_audit_log

VALID_TRANSITIONS = {
    AppointmentStatus.PENDING: [AppointmentStatus.CONFIRMED, AppointmentStatus.CANCELLED],
    AppointmentStatus.CONFIRMED: [AppointmentStatus.CHECKED_IN, AppointmentStatus.CANCELLED, AppointmentStatus.NO_SHOW],
    AppointmentStatus.CHECKED_IN: [AppointmentStatus.COMPLETED, AppointmentStatus.CANCELLED],
    AppointmentStatus.COMPLETED: [],
    AppointmentStatus.CANCELLED: [],
    AppointmentStatus.NO_SHOW: []
}

def generate_doctor_slots(db: Session, doctor_id: uuid.UUID, appt_date: date) -> list[dict]:
    day_of_week = appt_date.weekday() # 0 = Monday, 6 = Sunday
    availabilities = db.query(DoctorAvailability).filter(
        DoctorAvailability.doctor_id == doctor_id,
        DoctorAvailability.day_of_week == day_of_week,
        DoctorAvailability.is_available == True
    ).all()

    existing_appointments = db.query(Appointment).filter(
        Appointment.doctor_id == doctor_id,
        Appointment.appointment_date == appt_date,
        Appointment.status.notin_([AppointmentStatus.CANCELLED])
    ).all()

    booked_intervals = [(a.start_time, a.end_time) for a in existing_appointments]
    slots = []

    for window in availabilities:
        duration = timedelta(minutes=window.slot_duration_minutes)
        cur_dt = datetime.combine(appt_date, window.start_time)
        end_dt = datetime.combine(appt_date, window.end_time)

        while cur_dt + duration <= end_dt:
            slot_start = cur_dt.time()
            slot_end = (cur_dt + duration).time()

            is_booked = any(
                (slot_start < b_end and slot_end > b_start)
                for b_start, b_end in booked_intervals
            )

            slots.append({
                "start_time": slot_start.strftime("%H:%M:%S"),
                "end_time": slot_end.strftime("%H:%M:%S"),
                "is_available": not is_booked
            })
            cur_dt += duration

    return slots

def create_appointment(db: Session, req: AppointmentCreate, current_user: User | None = None) -> Appointment:
    doctor = db.query(Doctor).filter(Doctor.id == req.doctor_id, Doctor.status == "ACTIVE").first()
    if not doctor:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Doctor not found or inactive.")

    patient = db.query(Patient).filter(Patient.id == req.patient_id, Patient.status == "ACTIVE").first()
    if not patient:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Patient not found or inactive.")

    # Concurrency-safe check: lock doctor/date check with FOR UPDATE or serializable check
    conflict_doctor = db.query(Appointment).filter(
        Appointment.doctor_id == req.doctor_id,
        Appointment.appointment_date == req.appointment_date,
        Appointment.status.notin_([AppointmentStatus.CANCELLED]),
        Appointment.start_time < req.end_time,
        Appointment.end_time > req.start_time
    ).with_for_update().first()

    if conflict_doctor:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Doctor already has an appointment booked in this time slot.")

    conflict_patient = db.query(Appointment).filter(
        Appointment.patient_id == req.patient_id,
        Appointment.appointment_date == req.appointment_date,
        Appointment.status.notin_([AppointmentStatus.CANCELLED]),
        Appointment.start_time < req.end_time,
        Appointment.end_time > req.start_time
    ).first()

    if conflict_patient:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Patient already has an appointment in this time slot.")

    appt_count = db.query(Appointment).count() + 1
    appointment_number = f"APT-{datetime.now(timezone.utc).year}-{appt_count:05d}"

    appointment = Appointment(
        id=uuid.uuid4(),
        appointment_number=appointment_number,
        patient_id=req.patient_id,
        doctor_id=req.doctor_id,
        department_id=req.department_id or doctor.department_id,
        appointment_date=req.appointment_date,
        start_time=req.start_time,
        end_time=req.end_time,
        appointment_type=req.appointment_type,
        reason_for_visit=req.reason_for_visit,
        additional_notes=req.additional_notes,
        status=AppointmentStatus.PENDING,
        created_by=current_user.id if current_user else None,
        created_at=datetime.now(timezone.utc),
        updated_at=datetime.now(timezone.utc)
    )
    db.add(appointment)

    # Notifications
    if patient.user_id:
        create_notification(
            db,
            patient.user_id,
            "Appointment Booked",
            f"Your appointment {appointment.appointment_number} on {appointment.appointment_date} has been booked.",
            category="APPOINTMENT",
            reference_id=appointment.id
        )

    create_notification(
        db,
        doctor.user_id,
        "New Appointment Scheduled",
        f"New appointment {appointment.appointment_number} scheduled on {appointment.appointment_date} at {appointment.start_time}.",
        category="APPOINTMENT",
        reference_id=appointment.id
    )

    create_audit_log(db, current_user.id if current_user else None, "APPOINTMENT_CREATE", "appointments", appointment.id, {"appointment_number": appointment_number})
    db.commit()
    db.refresh(appointment)
    return appointment

def get_appointment_by_id(db: Session, appointment_id: uuid.UUID) -> Appointment:
    appt = db.query(Appointment).filter(Appointment.id == appointment_id).first()
    if not appt:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Appointment not found.")
    return appt

def update_appointment(db: Session, appointment_id: uuid.UUID, req: AppointmentUpdate, current_user: User | None = None) -> Appointment:
    appt = get_appointment_by_id(db, appointment_id)
    if appt.status in [AppointmentStatus.COMPLETED, AppointmentStatus.CANCELLED]:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Cannot reschedule or edit appointment with status {appt.status.value}.")

    update_data = req.model_dump(exclude_unset=True)

    new_date = update_data.get("appointment_date", appt.appointment_date)
    new_start = update_data.get("start_time", appt.start_time)
    new_end = update_data.get("end_time", appt.end_time)

    # Validate conflicts if time/date changed
    if "appointment_date" in update_data or "start_time" in update_data or "end_time" in update_data:
        conflict = db.query(Appointment).filter(
            Appointment.doctor_id == appt.doctor_id,
            Appointment.appointment_date == new_date,
            Appointment.id != appt.id,
            Appointment.status.notin_([AppointmentStatus.CANCELLED]),
            Appointment.start_time < new_end,
            Appointment.end_time > new_start
        ).with_for_update().first()

        if conflict:
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Doctor is not available in the new time slot.")

    for field, value in update_data.items():
        setattr(appt, field, value)

    appt.updated_at = datetime.now(timezone.utc)
    create_audit_log(db, current_user.id if current_user else None, "APPOINTMENT_RESCHEDULE", "appointments", appt.id, update_data)
    db.commit()
    db.refresh(appt)
    return appt

def transition_appointment_status(db: Session, appointment_id: uuid.UUID, new_status: AppointmentStatus, current_user: User | None = None) -> Appointment:
    appt = get_appointment_by_id(db, appointment_id)

    if new_status == appt.status:
        return appt

    allowed = VALID_TRANSITIONS.get(appt.status, [])
    if new_status not in allowed:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid appointment status transition from {appt.status.value} to {new_status.value}."
        )

    appt.status = new_status
    appt.updated_at = datetime.now(timezone.utc)

    # Trigger notifications on cancellation
    if new_status == AppointmentStatus.CANCELLED and appt.patient and appt.patient.user_id:
        create_notification(
            db,
            appt.patient.user_id,
            "Appointment Cancelled",
            f"Your appointment {appt.appointment_number} has been cancelled.",
            category="APPOINTMENT",
            reference_id=appt.id
        )

    create_audit_log(db, current_user.id if current_user else None, f"APPOINTMENT_{new_status.value}", "appointments", appt.id)
    db.commit()
    db.refresh(appt)
    return appt

def delete_appointment(db: Session, appointment_id: uuid.UUID, current_user: User | None = None) -> None:
    appt = get_appointment_by_id(db, appointment_id)
    appt.status = AppointmentStatus.CANCELLED
    appt.updated_at = datetime.now(timezone.utc)
    create_audit_log(db, current_user.id if current_user else None, "APPOINTMENT_CANCEL", "appointments", appt.id)
    db.commit()

def list_appointments(
    db: Session,
    doctor_id: uuid.UUID | None = None,
    patient_id: uuid.UUID | None = None,
    appointment_date: date | None = None,
    status_filter: AppointmentStatus | None = None,
    offset: int = 0,
    limit: int = 20
) -> tuple[list[Appointment], int]:
    query = db.query(Appointment)

    if doctor_id:
        query = query.filter(Appointment.doctor_id == doctor_id)
    if patient_id:
        query = query.filter(Appointment.patient_id == patient_id)
    if appointment_date:
        query = query.filter(Appointment.appointment_date == appointment_date)
    if status_filter:
        query = query.filter(Appointment.status == status_filter)

    total = query.count()
    items = query.order_by(Appointment.appointment_date.desc(), Appointment.start_time.asc()).offset(offset).limit(limit).all()
    return items, total
