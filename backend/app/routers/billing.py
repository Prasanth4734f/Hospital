import uuid
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, Query, status, HTTPException
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.core.dependencies import get_current_user, require_role
from app.core.permissions import UserRole, BILLING_ROLES, STAFF_ROLES
from app.models.user import User
from app.schemas.billing import InvoiceCreate, PaymentCreate
from app.services import billing_service
from app.utils.responses import api_success, api_paginated
from app.utils.pagination import get_pagination_params, PaginationParams

router = APIRouter(prefix="/billing", tags=["Billing & Payments"])

@router.post("/invoices", status_code=status.HTTP_201_CREATED)
def create_invoice(
    req: InvoiceCreate,
    current_user: User = Depends(require_role(*BILLING_ROLES)),
    db: Session = Depends(get_db)
):
    inv = billing_service.create_invoice(db, req, current_user=current_user)
    return api_success(
        "Invoice created successfully",
        {
            "id": str(inv.id),
            "invoice_number": inv.invoice_number,
            "patient_id": str(inv.patient_id),
            "total_amount": float(inv.total_amount),
            "balance_amount": float(inv.balance_amount),
            "payment_status": inv.payment_status
        }
    )

@router.get("/invoices")
def list_invoices(
    patient_id: uuid.UUID | None = Query(default=None),
    payment_status: str | None = Query(default=None),
    pagination: PaginationParams = Depends(get_pagination_params),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role == UserRole.PATIENT:
        if current_user.patient_profile:
            patient_id = current_user.patient_profile.id
        else:
            return api_paginated([], 0, pagination.page, pagination.limit)

    items, total = billing_service.list_invoices(
        db,
        patient_id=patient_id,
        payment_status=payment_status,
        offset=pagination.offset,
        limit=pagination.limit
    )

    data = [
        {
            "id": str(inv.id),
            "invoice_number": inv.invoice_number,
            "patient_id": str(inv.patient_id),
            "patient_name": f"{inv.patient.first_name} {inv.patient.last_name}" if inv.patient else None,
            "subtotal": float(inv.subtotal),
            "discount": float(inv.discount),
            "tax": float(inv.tax),
            "total_amount": float(inv.total_amount),
            "paid_amount": float(inv.paid_amount),
            "balance_amount": float(inv.balance_amount),
            "payment_status": inv.payment_status,
            "created_at": inv.created_at.isoformat()
        } for inv in items
    ]
    return api_paginated(data, total, pagination.page, pagination.limit, "Invoices retrieved successfully")

@router.get("/invoices/{invoice_id}")
def get_invoice(
    invoice_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    inv = billing_service.get_invoice_by_id(db, invoice_id)
    if current_user.role == UserRole.PATIENT:
        if not current_user.patient_profile or inv.patient_id != current_user.patient_profile.id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied.")

    return api_success(
        "Invoice retrieved successfully",
        {
            "id": str(inv.id),
            "invoice_number": inv.invoice_number,
            "patient_id": str(inv.patient_id),
            "patient_name": f"{inv.patient.first_name} {inv.patient.last_name}" if inv.patient else None,
            "appointment_id": str(inv.appointment_id) if inv.appointment_id else None,
            "subtotal": float(inv.subtotal),
            "discount": float(inv.discount),
            "tax": float(inv.tax),
            "total_amount": float(inv.total_amount),
            "paid_amount": float(inv.paid_amount),
            "balance_amount": float(inv.balance_amount),
            "payment_status": inv.payment_status,
            "created_at": inv.created_at.isoformat(),
            "items": [
                {
                    "id": str(it.id),
                    "description": it.description,
                    "category": it.category,
                    "quantity": it.quantity,
                    "unit_price": float(it.unit_price),
                    "total_price": float(it.total_price)
                } for it in inv.items
            ],
            "payments": [
                {
                    "id": str(p.id),
                    "payment_number": p.payment_number,
                    "amount": float(p.amount),
                    "payment_method": p.payment_method,
                    "transaction_reference": p.transaction_reference,
                    "payment_status": p.payment_status,
                    "created_at": p.created_at.isoformat()
                } for p in inv.payments
            ]
        }
    )

@router.patch("/invoices/{invoice_id}/payment", status_code=status.HTTP_201_CREATED)
def record_payment(
    invoice_id: uuid.UUID,
    req: PaymentCreate,
    current_user: User = Depends(require_role(*BILLING_ROLES)),
    db: Session = Depends(get_db)
):
    payment = billing_service.record_payment(db, invoice_id, req, current_user=current_user)
    return api_success(
        "Payment recorded successfully",
        {
            "id": str(payment.id),
            "payment_number": payment.payment_number,
            "invoice_id": str(payment.invoice_id),
            "amount": float(payment.amount),
            "payment_method": payment.payment_method,
            "payment_status": payment.payment_status,
            "created_at": payment.created_at.isoformat()
        }
    )

@router.get("/payments")
def list_payments(
    invoice_id: uuid.UUID | None = Query(default=None),
    pagination: PaginationParams = Depends(get_pagination_params),
    current_user: User = Depends(require_role(*BILLING_ROLES)),
    db: Session = Depends(get_db)
):
    items, total = billing_service.list_payments(db, invoice_id=invoice_id, offset=pagination.offset, limit=pagination.limit)
    data = [
        {
            "id": str(p.id),
            "payment_number": p.payment_number,
            "invoice_id": str(p.invoice_id),
            "invoice_number": p.invoice.invoice_number if p.invoice else None,
            "amount": float(p.amount),
            "payment_method": p.payment_method,
            "transaction_reference": p.transaction_reference,
            "payment_status": p.payment_status,
            "created_at": p.created_at.isoformat()
        } for p in items
    ]
    return api_paginated(data, total, pagination.page, pagination.limit, "Payments retrieved successfully")

@router.get("/invoices/{invoice_id}/receipt")
def get_receipt(
    invoice_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    inv = billing_service.get_invoice_by_id(db, invoice_id)
    if current_user.role == UserRole.PATIENT:
        if not current_user.patient_profile or inv.patient_id != current_user.patient_profile.id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied.")

    return api_success(
        "Receipt generated successfully",
        {
            "hospital_name": "MediCore Intelligent Hospital",
            "tagline": "One Hospital. One Connected Healthcare Ecosystem.",
            "invoice_number": inv.invoice_number,
            "invoice_date": inv.created_at.strftime("%Y-%m-%d %H:%M"),
            "patient_name": f"{inv.patient.first_name} {inv.patient.last_name}" if inv.patient else "Patient",
            "patient_number": inv.patient.patient_number if inv.patient else None,
            "items": [
                {
                    "description": it.description,
                    "quantity": it.quantity,
                    "unit_price": float(it.unit_price),
                    "total_price": float(it.total_price)
                } for it in inv.items
            ],
            "subtotal": float(inv.subtotal),
            "discount": float(inv.discount),
            "tax": float(inv.tax),
            "total_amount": float(inv.total_amount),
            "paid_amount": float(inv.paid_amount),
            "balance_amount": float(inv.balance_amount),
            "payment_status": inv.payment_status,
            "payments": [
                {
                    "payment_number": p.payment_number,
                    "amount": float(p.amount),
                    "method": p.payment_method,
                    "date": p.created_at.strftime("%Y-%m-%d %H:%M")
                } for p in inv.payments
            ]
        }
    )
