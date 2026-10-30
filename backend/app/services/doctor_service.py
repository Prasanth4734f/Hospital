import uuid
from datetime import datetime, timezone
from sqlalchemy.orm import Session
from sqlalchemy import or_
from fastapi import HTTPException, status

from app.models.doctor import Doctor
from app.models.user import User
from app.models.department import Department
from app.models.doctor_availability import DoctorAvailability
from app.core.permissions import UserRole
from app.core.security import hash_password
from app.schemas.doctor import DoctorCreate, DoctorUpdate
from app.schemas.availability import DoctorAvailabilityUpdate
from app.utils.validators import validate_phone, validate_password_strength
from app.services.notification_service import create_audit_log

def create_doctor(db: Session, req: DoctorCreate, current_user: User | None = None) -> Doctor:
    if not validate_phone(req.phone):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid phone number format.")

    valid_pwd, msg = validate_password_strength(req.password)
    if not valid_pwd:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=msg)

    existing_user = db.query(User).filter(User.email == req.email.lower().strip()).first()
    if existing_user:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email already registered for another user.")

    existing_reg = db.query(Doctor).filter(Doctor.medical_registration_number == req.medical_registration_number.strip()).first()
    if existing_reg:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Medical registration number already in use.")

    if req.department_id:
        dept = db.query(Department).filter(Department.id == req.department_id).first()
        if not dept:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Specified department does not exist.")

    # Create associated User
    new_user = User(
        id=uuid.uuid4(),
        full_name=req.full_name.strip(),
        email=req.email.lower().strip(),
        phone=req.phone.strip(),
        password_hash=hash_password(req.password),
        role=UserRole.DOCTOR,
        is_active=True,
        is_verified=True,
        created_at=datetime.now(timezone.utc),
        updated_at=datetime.now(timezone.utc)
    )
    db.add(new_user)
    db.flush()

    doctor_count = db.query(Doctor).count() + 1
    doctor_number = f"DOC-{datetime.now(timezone.utc).year}-{doctor_count:04d}"

    doctor = Doctor(
        id=uuid.uuid4(),
        user_id=new_user.id,
        doctor_number=doctor_number,
        medical_registration_number=req.medical_registration_number.strip(),
        specialization=req.specialization.strip(),
        qualifications=req.qualifications.strip(),
        experience_years=req.experience_years,
        consultation_fee=req.consultation_fee,
        department_id=req.department_id,
        profile_photo=req.profile_photo,
        availability_status=req.availability_status,
        status="ACTIVE",
        created_at=datetime.now(timezone.utc),
        updated_at=datetime.now(timezone.utc)
    )
    db.add(doctor)
    create_audit_log(db, current_user.id if current_user else None, "DOCTOR_CREATE", "doctors", doctor.id, {"doctor_number": doctor_number})
    db.commit()
    db.refresh(doctor)
    return doctor

def get_doctor_by_id(db: Session, doctor_id: uuid.UUID) -> Doctor:
    doctor = db.query(Doctor).filter(Doctor.id == doctor_id).first()
    if not doctor:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Doctor not found.")
    return doctor

def update_doctor(db: Session, doctor_id: uuid.UUID, req: DoctorUpdate, current_user: User | None = None) -> Doctor:
    doctor = get_doctor_by_id(db, doctor_id)
    update_data = req.model_dump(exclude_unset=True)

    if "medical_registration_number" in update_data and update_data["medical_registration_number"]:
        reg_num = update_data["medical_registration_number"].strip()
        existing = db.query(Doctor).filter(Doctor.medical_registration_number == reg_num, Doctor.id != doctor_id).first()
        if existing:
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Medical registration number already in use.")

    for field, value in update_data.items():
        setattr(doctor, field, value)

    doctor.updated_at = datetime.now(timezone.utc)
    create_audit_log(db, current_user.id if current_user else None, "DOCTOR_UPDATE", "doctors", doctor.id, update_data)
    db.commit()
    db.refresh(doctor)
    return doctor

def list_doctors(
    db: Session,
    search: str | None = None,
    specialization: str | None = None,
    department_id: uuid.UUID | None = None,
    status_filter: str | None = None,
    offset: int = 0,
    limit: int = 20
) -> tuple[list[Doctor], int]:
    query = db.query(Doctor).join(Doctor.user)

    if search:
        s = f"%{search.strip()}%"
        query = query.filter(
            or_(
                User.full_name.ilike(s),
                Doctor.specialization.ilike(s),
                Doctor.doctor_number.ilike(s),
                Doctor.medical_registration_number.ilike(s)
            )
        )

    if specialization:
        query = query.filter(Doctor.specialization.ilike(f"%{specialization.strip()}%"))
    if department_id:
        query = query.filter(Doctor.department_id == department_id)
    if status_filter:
        query = query.filter(Doctor.status == status_filter)

    total = query.count()
    items = query.order_by(Doctor.created_at.desc()).offset(offset).limit(limit).all()
    return items, total

def set_doctor_availability(db: Session, doctor_id: uuid.UUID, req: DoctorAvailabilityUpdate, current_user: User | None = None) -> list[DoctorAvailability]:
    doctor = get_doctor_by_id(db, doctor_id)
    # Clear existing availability
    db.query(DoctorAvailability).filter(DoctorAvailability.doctor_id == doctor_id).delete()

    created_slots = []
    for slot_data in req.slots:
        slot = DoctorAvailability(
            id=uuid.uuid4(),
            doctor_id=doctor.id,
            day_of_week=slot_data.day_of_week,
            start_time=slot_data.start_time,
            end_time=slot_data.end_time,
            slot_duration_minutes=slot_data.slot_duration_minutes,
            is_available=slot_data.is_available
        )
        db.add(slot)
        created_slots.append(slot)

    create_audit_log(db, current_user.id if current_user else None, "SET_DOCTOR_AVAILABILITY", "doctor_availability", doctor.id)
    db.commit()
    return created_slots

def get_doctor_availability(db: Session, doctor_id: uuid.UUID) -> list[DoctorAvailability]:
    doctor = get_doctor_by_id(db, doctor_id)
    return db.query(DoctorAvailability).filter(DoctorAvailability.doctor_id == doctor.id).order_by(DoctorAvailability.day_of_week, DoctorAvailability.start_time).all()
