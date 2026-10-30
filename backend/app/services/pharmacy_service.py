import uuid
from datetime import datetime, timezone, date
from sqlalchemy.orm import Session
from sqlalchemy import func, or_
from fastapi import HTTPException, status

from app.models.medicine import Medicine
from app.models.medicine_batch import MedicineBatch
from app.models.dispensing import Dispensing
from app.models.prescription import Prescription
from app.models.prescription_item import PrescriptionItem
from app.models.patient import Patient
from app.models.user import User
from app.schemas.medicine import MedicineCreate, MedicineUpdate, MedicineBatchCreate
from app.schemas.dispensing import DispenseRequest
from app.services.notification_service import create_notification, create_audit_log

def create_medicine(db: Session, req: MedicineCreate, current_user: User | None = None) -> Medicine:
    code_count = db.query(Medicine).count() + 1
    medicine_code = f"MED-{code_count:04d}"

    medicine = Medicine(
        id=uuid.uuid4(),
        medicine_code=medicine_code,
        name=req.name.strip(),
        generic_name=req.generic_name.strip() if req.generic_name else None,
        category=req.category,
        manufacturer=req.manufacturer,
        reorder_level=req.reorder_level,
        purchase_price=req.purchase_price,
        selling_price=req.selling_price,
        storage_instructions=req.storage_instructions,
        status="ACTIVE",
        created_at=datetime.now(timezone.utc)
    )
    db.add(medicine)
    db.flush()

    for b in req.batches:
        batch = MedicineBatch(
            id=uuid.uuid4(),
            medicine_id=medicine.id,
            batch_number=b.batch_number.strip(),
            expiry_date=b.expiry_date,
            stock_quantity=b.stock_quantity,
            purchase_price=b.purchase_price,
            selling_price=b.selling_price,
            created_at=datetime.now(timezone.utc)
        )
        db.add(batch)

    create_audit_log(db, current_user.id if current_user else None, "MEDICINE_CREATE", "medicines", medicine.id, {"medicine_code": medicine_code})
    db.commit()
    db.refresh(medicine)
    return medicine

def get_medicine_by_id(db: Session, medicine_id: uuid.UUID) -> Medicine:
    med = db.query(Medicine).filter(Medicine.id == medicine_id).first()
    if not med:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Medicine not found.")
    return med

def update_medicine(db: Session, medicine_id: uuid.UUID, req: MedicineUpdate, current_user: User | None = None) -> Medicine:
    med = get_medicine_by_id(db, medicine_id)
    update_data = req.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(med, field, value)

    create_audit_log(db, current_user.id if current_user else None, "MEDICINE_UPDATE", "medicines", med.id, update_data)
    db.commit()
    db.refresh(med)
    return med

def add_batch_to_medicine(db: Session, medicine_id: uuid.UUID, req: MedicineBatchCreate, current_user: User | None = None) -> MedicineBatch:
    med = get_medicine_by_id(db, medicine_id)
    batch = MedicineBatch(
        id=uuid.uuid4(),
        medicine_id=med.id,
        batch_number=req.batch_number.strip(),
        expiry_date=req.expiry_date,
        stock_quantity=req.stock_quantity,
        purchase_price=req.purchase_price,
        selling_price=req.selling_price,
        created_at=datetime.now(timezone.utc)
    )
    db.add(batch)
    create_audit_log(db, current_user.id if current_user else None, "BATCH_CREATE", "medicine_batches", batch.id)
    db.commit()
    db.refresh(batch)
    return batch

def list_medicines(
    db: Session,
    search: str | None = None,
    category: str | None = None,
    offset: int = 0,
    limit: int = 20
) -> tuple[list[Medicine], int]:
    query = db.query(Medicine)
    if search:
        s = f"%{search.strip()}%"
        query = query.filter(or_(Medicine.name.ilike(s), Medicine.generic_name.ilike(s), Medicine.medicine_code.ilike(s)))
    if category:
        query = query.filter(Medicine.category == category)

    total = query.count()
    items = query.order_by(Medicine.name.asc()).offset(offset).limit(limit).all()
    return items, total

def get_low_stock_medicines(db: Session) -> list[dict]:
    # Sum batches stock for each active medicine where sum <= reorder_level
    results = []
    medicines = db.query(Medicine).filter(Medicine.status == "ACTIVE").all()
    today = date.today()
    for m in medicines:
        active_batches = [b for b in m.batches if b.expiry_date > today]
        stock = sum(b.stock_quantity for b in active_batches)
        if stock <= m.reorder_level:
            results.append({
                "id": str(m.id),
                "medicine_code": m.medicine_code,
                "name": m.name,
                "current_stock": stock,
                "reorder_level": m.reorder_level,
                "category": m.category
            })
    return results

def dispense_medicine(db: Session, req: DispenseRequest, current_user: User) -> Dispensing:
    # 1. Verify prescription exists
    pr = db.query(Prescription).filter(Prescription.id == req.prescription_id).first()
    if not pr:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Prescription not found.")

    # 2. Verify prescription belongs to patient
    if pr.patient_id != req.patient_id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Prescription does not belong to specified patient.")

    # 3. Verify prescription item
    pr_item = db.query(PrescriptionItem).filter(
        PrescriptionItem.id == req.prescription_item_id,
        PrescriptionItem.prescription_id == req.prescription_id
    ).first()
    if not pr_item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Prescription item not found.")

    # 4. Check remaining prescribed quantity
    total_dispensed = db.query(func.coalesce(func.sum(Dispensing.dispensed_quantity), 0)).filter(
        Dispensing.prescription_item_id == pr_item.id
    ).scalar()

    if total_dispensed + req.dispensed_quantity > pr_item.quantity:
        remaining = pr_item.quantity - total_dispensed
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Excessive dispensing: prescribed {pr_item.quantity}, already dispensed {total_dispensed}, remaining {remaining}."
        )

    # 5. Row-level lock on batch for concurrency
    batch = db.query(MedicineBatch).filter(MedicineBatch.id == req.medicine_batch_id).with_for_update().first()
    if not batch:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Medicine batch not found.")

    # 6. Check expiry date
    if batch.expiry_date <= date.today():
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Cannot dispense from an expired batch.")

    # 7. Check stock and prevent negative inventory
    if batch.stock_quantity < req.dispensed_quantity:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Insufficient stock in batch. Available: {batch.stock_quantity}.")

    # 8. Deduct stock transactionally
    batch.stock_quantity -= req.dispensed_quantity

    # 9. Create dispensing record
    dispense_record = Dispensing(
        id=uuid.uuid4(),
        prescription_id=req.prescription_id,
        prescription_item_id=req.prescription_item_id,
        patient_id=req.patient_id,
        pharmacist_id=current_user.id,
        medicine_batch_id=req.medicine_batch_id,
        dispensed_quantity=req.dispensed_quantity,
        pharmacist_notes=req.pharmacist_notes,
        created_at=datetime.now(timezone.utc)
    )
    db.add(dispense_record)

    # 10. Check if prescription is fully dispensed
    all_items = db.query(PrescriptionItem).filter(PrescriptionItem.prescription_id == pr.id).all()
    all_dispensed = True
    for it in all_items:
        it_disp = db.query(func.coalesce(func.sum(Dispensing.dispensed_quantity), 0)).filter(
            Dispensing.prescription_item_id == it.id
        ).scalar()
        if it.id == pr_item.id:
            it_disp += req.dispensed_quantity
        if it_disp < it.quantity:
            all_dispensed = False
            break

    if all_dispensed:
        pr.status = "DISPENSED"

    create_audit_log(db, current_user.id, "MEDICINE_DISPENSE", "dispensing", dispense_record.id, {"quantity": req.dispensed_quantity})
    db.commit()
    db.refresh(dispense_record)
    return dispense_record

def list_dispensing_history(db: Session, offset: int = 0, limit: int = 20) -> tuple[list[Dispensing], int]:
    query = db.query(Dispensing)
    total = query.count()
    items = query.order_by(Dispensing.created_at.desc()).offset(offset).limit(limit).all()
    return items, total
