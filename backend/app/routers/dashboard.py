from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.core.dependencies import get_current_user, require_role
from app.core.permissions import UserRole, ADMIN_ROLES
from app.models.user import User
from app.models.audit_log import AuditLog
from app.services import dashboard_service
from app.utils.responses import api_success

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])

@router.get("/admin")
def get_admin_dashboard(
    current_user: User = Depends(require_role(*ADMIN_ROLES)),
    db: Session = Depends(get_db)
):
    stats = dashboard_service.get_admin_dashboard(db)
    return api_success(
        "Admin dashboard statistics retrieved successfully",
        {
            "total_patients": stats["total_patients"],
            "total_doctors": stats["total_doctors"],
            "today_appointments": stats["today_appointments"],
            "pending_appointments": stats["pending_appointments"],
            "completed_consultations": stats["completed_consultations"],
            "total_revenue": float(stats["total_revenue"])
        }
    )

@router.get("/statistics")
def get_general_statistics(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    stats = dashboard_service.get_admin_dashboard(db)
    return api_success(
        "General statistics retrieved successfully",
        {
            "total_patients": stats["total_patients"],
            "total_doctors": stats["total_doctors"],
            "today_appointments": stats["today_appointments"]
        }
    )

@router.get("/recent-activities")
def get_recent_activities(
    current_user: User = Depends(require_role(*ADMIN_ROLES)),
    db: Session = Depends(get_db)
):
    logs = db.query(AuditLog).order_by(AuditLog.created_at.desc()).limit(15).all()
    data = [
        {
            "id": str(log.id),
            "action": log.action,
            "entity_type": log.entity_type,
            "entity_id": str(log.entity_id) if log.entity_id else None,
            "created_at": log.created_at.isoformat()
        } for log in logs
    ]
    return api_success("Recent activities retrieved successfully", data)

@router.get("/doctor")
def get_doctor_dashboard(
    current_user: User = Depends(require_role(UserRole.SUPER_ADMIN, UserRole.HOSPITAL_ADMIN, UserRole.DOCTOR)),
    db: Session = Depends(get_db)
):
    stats = dashboard_service.get_doctor_dashboard(db, current_user)
    return api_success("Doctor dashboard retrieved successfully", stats)

@router.get("/receptionist")
def get_receptionist_dashboard(
    current_user: User = Depends(require_role(UserRole.SUPER_ADMIN, UserRole.HOSPITAL_ADMIN, UserRole.RECEPTIONIST)),
    db: Session = Depends(get_db)
):
    stats = dashboard_service.get_receptionist_dashboard(db)
    return api_success("Receptionist dashboard retrieved successfully", stats)

@router.get("/pharmacist")
def get_pharmacist_dashboard(
    current_user: User = Depends(require_role(UserRole.SUPER_ADMIN, UserRole.HOSPITAL_ADMIN, UserRole.PHARMACIST)),
    db: Session = Depends(get_db)
):
    stats = dashboard_service.get_pharmacist_dashboard(db)
    return api_success("Pharmacist dashboard retrieved successfully", stats)

@router.get("/patient")
def get_patient_dashboard(
    current_user: User = Depends(require_role(UserRole.SUPER_ADMIN, UserRole.HOSPITAL_ADMIN, UserRole.PATIENT)),
    db: Session = Depends(get_db)
):
    stats = dashboard_service.get_patient_dashboard(db, current_user)
    return api_success(
        "Patient dashboard retrieved successfully",
        {
            "upcoming_appointments": stats["upcoming_appointments"],
            "completed_appointments": stats["completed_appointments"],
            "pending_payments": float(stats["pending_payments"]),
            "prescriptions_count": stats["prescriptions_count"]
        }
    )
