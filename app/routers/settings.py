from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.core.dependencies import require_role
from app.core.permissions import UserRole, ADMIN_ROLES
from app.models.user import User
from app.models.department import Department
from app.utils.responses import api_success

router = APIRouter(prefix="/settings", tags=["Settings"])

@router.get("/departments")
def list_departments(db: Session = Depends(get_db)):
    depts = db.query(Department).all()
    return api_success(
        "Departments retrieved successfully",
        [
            {
                "id": str(d.id),
                "department_name": d.department_name,
                "description": d.description,
                "status": d.status
            } for d in depts
        ]
    )

@router.get("/hospital-info")
def get_hospital_info():
    return api_success(
        "Hospital profile retrieved",
        {
            "name": "MediCore Intelligent Hospital",
            "tagline": "One Hospital. One Connected Healthcare Ecosystem.",
            "emergency_contact": "+1-800-MEDICORE",
            "email": "support@medicore.com",
            "address": "742 Evergreen Terrace, Medical District"
        }
    )
