import uuid
from datetime import date
from fastapi import APIRouter, Depends, Query, status, HTTPException
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.core.dependencies import get_current_user, require_role
from app.core.permissions import UserRole, PHARMACY_ROLES, STAFF_ROLES
from app.models.user import User
from app.schemas.medicine import MedicineCreate, MedicineUpdate, MedicineBatchCreate
from app.schemas.dispensing import DispenseRequest
from app.services import pharmacy_service
from app.utils.responses import api_success, api_paginated
from app.utils.pagination import get_pagination_params, PaginationParams

router = APIRouter(tags=["Pharmacy & Medicines"])

# Medicines Endpoints
@router.post("/medicines", status_code=status.HTTP_201_CREATED)
def create_medicine(
    req: MedicineCreate,
    current_user: User = Depends(require_role(*PHARMACY_ROLES)),
    db: Session = Depends(get_db)
):
    med = pharmacy_service.create_medicine(db, req, current_user=current_user)
    return api_success(
        "Medicine registered successfully",
        {
            "id": str(med.id),
            "medicine_code": med.medicine_code,
            "name": med.name,
            "generic_name": med.generic_name,
            "category": med.category,
            "reorder_level": med.reorder_level,
            "selling_price": float(med.selling_price)
        }
    )

@router.get("/medicines/low-stock")
def get_low_stock_medicines(
    current_user: User = Depends(require_role(*STAFF_ROLES)),
    db: Session = Depends(get_db)
):
    items = pharmacy_service.get_low_stock_medicines(db)
    return api_success("Low stock medicines retrieved successfully", items)

@router.get("/medicines")
def list_medicines(
    search: str | None = Query(default=None),
    category: str | None = Query(default=None),
    pagination: PaginationParams = Depends(get_pagination_params),
    db: Session = Depends(get_db)
):
    items, total = pharmacy_service.list_medicines(
        db,
        search=search,
        category=category,
        offset=pagination.offset,
        limit=pagination.limit
    )

    today = date.today()
    data = [
        {
            "id": str(m.id),
            "medicine_code": m.medicine_code,
            "name": m.name,
            "generic_name": m.generic_name,
            "category": m.category,
            "manufacturer": m.manufacturer,
            "reorder_level": m.reorder_level,
            "purchase_price": float(m.purchase_price),
            "selling_price": float(m.selling_price),
            "storage_instructions": m.storage_instructions,
            "status": m.status,
            "total_stock": sum(b.stock_quantity for b in m.batches if b.expiry_date > today),
            "created_at": m.created_at.isoformat()
        } for m in items
    ]
    return api_paginated(data, total, pagination.page, pagination.limit, "Medicines retrieved successfully")

@router.get("/medicines/{medicine_id}")
def get_medicine(
    medicine_id: uuid.UUID,
    db: Session = Depends(get_db)
):
    m = pharmacy_service.get_medicine_by_id(db, medicine_id)
    today = date.today()
    return api_success(
        "Medicine retrieved successfully",
        {
            "id": str(m.id),
            "medicine_code": m.medicine_code,
            "name": m.name,
            "generic_name": m.generic_name,
            "category": m.category,
            "manufacturer": m.manufacturer,
            "reorder_level": m.reorder_level,
            "purchase_price": float(m.purchase_price),
            "selling_price": float(m.selling_price),
            "storage_instructions": m.storage_instructions,
            "status": m.status,
            "total_stock": sum(b.stock_quantity for b in m.batches if b.expiry_date > today),
            "batches": [
                {
                    "id": str(b.id),
                    "batch_number": b.batch_number,
                    "expiry_date": str(b.expiry_date),
                    "stock_quantity": b.stock_quantity,
                    "purchase_price": float(b.purchase_price),
                    "selling_price": float(b.selling_price)
                } for b in m.batches
            ]
        }
    )

@router.put("/medicines/{medicine_id}")
def update_medicine(
    medicine_id: uuid.UUID,
    req: MedicineUpdate,
    current_user: User = Depends(require_role(*PHARMACY_ROLES)),
    db: Session = Depends(get_db)
):
    med = pharmacy_service.update_medicine(db, medicine_id, req, current_user=current_user)
    return api_success("Medicine updated successfully", {"id": str(med.id), "name": med.name})

@router.post("/medicines/{medicine_id}/batches", status_code=status.HTTP_201_CREATED)
def add_batch(
    medicine_id: uuid.UUID,
    req: MedicineBatchCreate,
    current_user: User = Depends(require_role(*PHARMACY_ROLES)),
    db: Session = Depends(get_db)
):
    b = pharmacy_service.add_batch_to_medicine(db, medicine_id, req, current_user=current_user)
    return api_success(
        "Batch added successfully",
        {
            "id": str(b.id),
            "medicine_id": str(b.medicine_id),
            "batch_number": b.batch_number,
            "expiry_date": str(b.expiry_date),
            "stock_quantity": b.stock_quantity
        }
    )

# Dispensing Endpoints
@router.post("/pharmacy/dispense", status_code=status.HTTP_201_CREATED)
def dispense_medicine(
    req: DispenseRequest,
    current_user: User = Depends(require_role(*PHARMACY_ROLES)),
    db: Session = Depends(get_db)
):
    rec = pharmacy_service.dispense_medicine(db, req, current_user=current_user)
    return api_success(
        "Medicine dispensed successfully",
        {
            "id": str(rec.id),
            "prescription_id": str(rec.prescription_id),
            "prescription_item_id": str(rec.prescription_item_id),
            "patient_id": str(rec.patient_id),
            "pharmacist_id": str(rec.pharmacist_id),
            "medicine_batch_id": str(rec.medicine_batch_id),
            "dispensed_quantity": rec.dispensed_quantity,
            "created_at": rec.created_at.isoformat()
        }
    )

@router.get("/pharmacy/dispensing-history")
def get_dispensing_history(
    pagination: PaginationParams = Depends(get_pagination_params),
    current_user: User = Depends(require_role(*PHARMACY_ROLES)),
    db: Session = Depends(get_db)
):
    items, total = pharmacy_service.list_dispensing_history(db, offset=pagination.offset, limit=pagination.limit)
    data = [
        {
            "id": str(d.id),
            "prescription_id": str(d.prescription_id),
            "prescription_number": d.prescription.prescription_number if d.prescription else None,
            "patient_name": f"{d.patient.first_name} {d.patient.last_name}" if d.patient else None,
            "medicine_name": d.prescription_item.medicine_name if d.prescription_item else None,
            "batch_number": d.batch.batch_number if d.batch else None,
            "dispensed_quantity": d.dispensed_quantity,
            "pharmacist_notes": d.pharmacist_notes,
            "created_at": d.created_at.isoformat()
        } for d in items
    ]
    return api_paginated(data, total, pagination.page, pagination.limit, "Dispensing history retrieved successfully")
