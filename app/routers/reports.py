from datetime import date
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.core.dependencies import require_role
from app.core.permissions import UserRole, ADMIN_ROLES
from app.models.user import User
from app.services import report_service
from app.utils.responses import api_success

router = APIRouter(prefix="/reports", tags=["Reports & Analytics"])

@router.get("/patients")
def get_patients_report(
    start_date: date | None = Query(default=None),
    end_date: date | None = Query(default=None),
    current_user: User = Depends(require_role(*ADMIN_ROLES)),
    db: Session = Depends(get_db)
):
    data = report_service.get_patients_report(db, start_date, end_date)
    return api_success(
        "Patients report retrieved successfully",
        {
            "total_records": len(data),
            "filters": {"start_date": str(start_date) if start_date else None, "end_date": str(end_date) if end_date else None},
            "records": data
        }
    )

@router.get("/doctors")
def get_doctors_report(
    current_user: User = Depends(require_role(*ADMIN_ROLES)),
    db: Session = Depends(get_db)
):
    data = report_service.get_doctors_report(db)
    return api_success(
        "Doctors report retrieved successfully",
        {
            "total_records": len(data),
            "records": data
        }
    )

@router.get("/appointments")
def get_appointments_report(
    start_date: date | None = Query(default=None),
    end_date: date | None = Query(default=None),
    status: str | None = Query(default=None),
    current_user: User = Depends(require_role(*ADMIN_ROLES)),
    db: Session = Depends(get_db)
):
    data = report_service.get_appointments_report(db, start_date, end_date, status_filter=status)
    return api_success(
        "Appointments report retrieved successfully",
        {
            "total_records": len(data),
            "records": data
        }
    )

@router.get("/consultations")
def get_consultations_report(
    current_user: User = Depends(require_role(*ADMIN_ROLES)),
    db: Session = Depends(get_db)
):
    data = report_service.get_appointments_report(db, status_filter="COMPLETED")
    return api_success(
        "Consultations report retrieved successfully",
        {
            "total_records": len(data),
            "records": data
        }
    )

@router.get("/pharmacy")
def get_pharmacy_report(
    current_user: User = Depends(require_role(*ADMIN_ROLES, UserRole.PHARMACIST)),
    db: Session = Depends(get_db)
):
    from app.services.pharmacy_service import get_low_stock_medicines
    low_stock = get_low_stock_medicines(db)
    return api_success(
        "Pharmacy report retrieved successfully",
        {
            "low_stock_items": low_stock,
            "total_low_stock": len(low_stock)
        }
    )

@router.get("/revenue")
def get_revenue_report(
    start_date: date | None = Query(default=None),
    end_date: date | None = Query(default=None),
    current_user: User = Depends(require_role(*ADMIN_ROLES)),
    db: Session = Depends(get_db)
):
    rep = report_service.get_revenue_report(db, start_date, end_date)
    return api_success("Revenue report retrieved successfully", rep)

@router.get("/payments")
def get_payments_report(
    start_date: date | None = Query(default=None),
    end_date: date | None = Query(default=None),
    current_user: User = Depends(require_role(*ADMIN_ROLES)),
    db: Session = Depends(get_db)
):
    rep = report_service.get_revenue_report(db, start_date, end_date)
    return api_success("Payments report retrieved successfully", rep["payments"])
