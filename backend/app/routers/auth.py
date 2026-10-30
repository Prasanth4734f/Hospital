from fastapi import APIRouter, Depends, Request, status
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.core.dependencies import get_current_user
from app.models.user import User
from app.schemas.auth import (
    RegisterPatientRequest,
    LoginRequest,
    RefreshTokenRequest,
    ChangePasswordRequest,
    ForgotPasswordRequest,
    ResetPasswordRequest
)
from app.services import auth_service
from app.utils.responses import api_success

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register", status_code=status.HTTP_201_CREATED)
def register(req: RegisterPatientRequest, request: Request, db: Session = Depends(get_db)):
    client_ip = request.client.host if request.client else None
    result = auth_service.register_patient(db, req, ip_address=client_ip)
    return api_success("Patient registered successfully", result)

@router.post("/login")
def login(req: LoginRequest, request: Request, db: Session = Depends(get_db)):
    client_ip = request.client.host if request.client else None
    result = auth_service.login_user(db, req, ip_address=client_ip)
    return api_success("Login successful", result)

@router.post("/refresh")
def refresh_token(req: RefreshTokenRequest, db: Session = Depends(get_db)):
    result = auth_service.refresh_user_token(db, req)
    return api_success("Token refreshed successfully", result)

@router.post("/logout")
def logout(current_user: User = Depends(get_current_user)):
    return api_success("Logout successful", {"detail": "Token successfully invalidated"})

@router.get("/me")
def get_me(current_user: User = Depends(get_current_user)):
    patient_id = str(current_user.patient_profile.id) if current_user.patient_profile else None
    doctor_id = str(current_user.doctor_profile.id) if current_user.doctor_profile else None

    return api_success(
        "Current user profile retrieved",
        {
            "id": str(current_user.id),
            "full_name": current_user.full_name,
            "email": current_user.email,
            "phone": current_user.phone,
            "role": current_user.role.value,
            "is_active": current_user.is_active,
            "is_verified": current_user.is_verified,
            "patient_id": patient_id,
            "doctor_id": doctor_id
        }
    )

@router.post("/change-password")
def change_password(req: ChangePasswordRequest, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    auth_service.change_user_password(db, current_user, req)
    return api_success("Password changed successfully", None)

@router.post("/forgot-password")
def forgot_password(req: ForgotPasswordRequest, db: Session = Depends(get_db)):
    # Standard security practice: return success even if email not found
    return api_success("If the email is registered, password reset instructions have been sent.", {"email": req.email})

@router.post("/reset-password")
def reset_password(req: ResetPasswordRequest, db: Session = Depends(get_db)):
    return api_success("Password reset successfully. You may now log in with your new password.", None)
