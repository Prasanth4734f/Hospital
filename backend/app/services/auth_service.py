import uuid
from datetime import datetime, timezone
from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from app.models.user import User
from app.models.patient import Patient
from app.core.permissions import UserRole
from app.core.security import hash_password, verify_password, create_access_token, create_refresh_token, decode_token
from app.utils.validators import validate_phone, validate_password_strength
from app.schemas.auth import RegisterPatientRequest, LoginRequest, RefreshTokenRequest, ChangePasswordRequest
from app.services.notification_service import create_audit_log

def register_patient(db: Session, req: RegisterPatientRequest, ip_address: str | None = None) -> dict:
    if not validate_phone(req.phone):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid phone number format.")

    valid_pwd, msg = validate_password_strength(req.password)
    if not valid_pwd:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=msg)

    existing_user = db.query(User).filter(User.email == req.email.lower().strip()).first()
    if existing_user:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email already registered.")

    new_user = User(
        id=uuid.uuid4(),
        full_name=req.full_name.strip(),
        email=req.email.lower().strip(),
        phone=req.phone.strip(),
        password_hash=hash_password(req.password),
        role=UserRole.PATIENT,
        is_active=True,
        is_verified=True,
        created_at=datetime.now(timezone.utc),
        updated_at=datetime.now(timezone.utc)
    )
    db.add(new_user)
    db.flush()

    name_parts = req.full_name.strip().split(" ", 1)
    first_name = req.first_name or name_parts[0]
    last_name = req.last_name or (name_parts[1] if len(name_parts) > 1 else "")

    patient_count = db.query(Patient).count() + 1
    patient_number = f"PAT-{datetime.now(timezone.utc).year}-{patient_count:05d}"

    dob = None
    if req.date_of_birth:
        try:
            dob = datetime.strptime(req.date_of_birth, "%Y-%m-%d").date()
        except ValueError:
            pass

    patient = Patient(
        id=uuid.uuid4(),
        user_id=new_user.id,
        patient_number=patient_number,
        first_name=first_name,
        last_name=last_name,
        date_of_birth=dob,
        gender=req.gender,
        phone=req.phone.strip(),
        email=req.email.lower().strip(),
        status="ACTIVE",
        created_at=datetime.now(timezone.utc),
        updated_at=datetime.now(timezone.utc)
    )
    db.add(patient)
    create_audit_log(db, new_user.id, "PATIENT_REGISTER", "users", new_user.id, {"email": new_user.email}, ip_address)
    db.commit()

    return {
        "id": str(patient.id),
        "user_id": str(new_user.id),
        "patient_number": patient.patient_number,
        "full_name": new_user.full_name,
        "email": new_user.email,
        "phone": new_user.phone
    }

def login_user(db: Session, req: LoginRequest, ip_address: str | None = None) -> dict:
    user = db.query(User).filter(User.email == req.email.lower().strip()).first()
    if not user or not verify_password(req.password, user.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password.")

    if not user.is_active:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User account is inactive. Please contact administration.")

    user.last_login = datetime.now(timezone.utc)
    create_audit_log(db, user.id, "USER_LOGIN", "users", user.id, {"email": user.email}, ip_address)
    db.commit()

    token_data = {"sub": str(user.id), "email": user.email, "role": user.role.value}
    access_token = create_access_token(token_data)
    refresh_token = create_refresh_token(token_data)

    patient_id = None
    doctor_id = None
    if user.patient_profile:
        patient_id = str(user.patient_profile.id)
    if user.doctor_profile:
        doctor_id = str(user.doctor_profile.id)

    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
        "user": {
            "id": str(user.id),
            "full_name": user.full_name,
            "email": user.email,
            "role": user.role.value,
            "phone": user.phone,
            "patient_id": patient_id,
            "doctor_id": doctor_id
        }
    }

def refresh_user_token(db: Session, req: RefreshTokenRequest) -> dict:
    try:
        payload = decode_token(req.refresh_token)
        if payload.get("type") != "refresh":
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid refresh token type.")
        user_id = uuid.UUID(payload.get("sub"))
    except Exception:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Expired or invalid refresh token.")

    user = db.query(User).filter(User.id == user_id, User.is_active == True).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User no longer active or exists.")

    token_data = {"sub": str(user.id), "email": user.email, "role": user.role.value}
    access_token = create_access_token(token_data)
    refresh_token = create_refresh_token(token_data)

    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
        "user": {
            "id": str(user.id),
            "full_name": user.full_name,
            "email": user.email,
            "role": user.role.value
        }
    }

def change_user_password(db: Session, user: User, req: ChangePasswordRequest) -> None:
    if not verify_password(req.old_password, user.password_hash):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Current password is incorrect.")

    valid, msg = validate_password_strength(req.new_password)
    if not valid:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=msg)

    user.password_hash = hash_password(req.new_password)
    user.updated_at = datetime.now(timezone.utc)
    create_audit_log(db, user.id, "PASSWORD_CHANGE", "users", user.id)
    db.commit()
