import uuid
from datetime import datetime, timezone
from decimal import Decimal
from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from app.models.billing import Invoice
from app.models.invoice_item import InvoiceItem
from app.models.payment import Payment
from app.models.patient import Patient
from app.models.user import User
from app.schemas.billing import InvoiceCreate, PaymentCreate
from app.services.notification_service import create_notification, create_audit_log

def create_invoice(db: Session, req: InvoiceCreate, current_user: User | None = None) -> Invoice:
    patient = db.query(Patient).filter(Patient.id == req.patient_id).first()
    if not patient:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Patient not found.")

    subtotal = Decimal("0.00")
    for item in req.items:
        subtotal += item.unit_price * Decimal(item.quantity)

    discount = req.discount
    tax = req.tax
    total_amount = subtotal - discount + tax
    if total_amount < Decimal("0.00"):
        total_amount = Decimal("0.00")

    inv_count = db.query(Invoice).count() + 1
    invoice_number = f"INV-{datetime.now(timezone.utc).year}-{inv_count:05d}"

    invoice = Invoice(
        id=uuid.uuid4(),
        invoice_number=invoice_number,
        patient_id=req.patient_id,
        appointment_id=req.appointment_id,
        subtotal=subtotal,
        discount=discount,
        tax=tax,
        total_amount=total_amount,
        paid_amount=Decimal("0.00"),
        balance_amount=total_amount,
        payment_status="UNPAID",
        created_by=current_user.id if current_user else None,
        created_at=datetime.now(timezone.utc),
        updated_at=datetime.now(timezone.utc)
    )
    db.add(invoice)
    db.flush()

    for item in req.items:
        inv_item = InvoiceItem(
            id=uuid.uuid4(),
            invoice_id=invoice.id,
            description=item.description,
            category=item.category,
            quantity=item.quantity,
            unit_price=item.unit_price,
            total_price=item.unit_price * Decimal(item.quantity)
        )
        db.add(inv_item)

    if patient.user_id:
        create_notification(
            db,
            patient.user_id,
            "Invoice Generated",
            f"An invoice {invoice.invoice_number} of amount ${total_amount} has been issued.",
            category="BILLING",
            reference_id=invoice.id
        )

    create_audit_log(db, current_user.id if current_user else None, "INVOICE_CREATE", "invoices", invoice.id, {"invoice_number": invoice_number, "total": float(total_amount)})
    db.commit()
    db.refresh(invoice)
    return invoice

def get_invoice_by_id(db: Session, invoice_id: uuid.UUID) -> Invoice:
    inv = db.query(Invoice).filter(Invoice.id == invoice_id).first()
    if not inv:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Invoice not found.")
    return inv

def record_payment(db: Session, invoice_id: uuid.UUID, req: PaymentCreate, current_user: User | None = None) -> Payment:
    # Row-level lock on invoice to prevent concurrent overpayments
    invoice = db.query(Invoice).filter(Invoice.id == invoice_id).with_for_update().first()
    if not invoice:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Invoice not found.")

    if invoice.balance_amount <= Decimal("0.00"):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invoice is already fully paid.")

    if req.amount > invoice.balance_amount:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Payment amount (${req.amount}) exceeds outstanding balance (${invoice.balance_amount})."
        )

    pay_count = db.query(Payment).count() + 1
    payment_number = f"PAY-{datetime.now(timezone.utc).year}-{pay_count:05d}"

    payment = Payment(
        id=uuid.uuid4(),
        payment_number=payment_number,
        invoice_id=invoice.id,
        amount=req.amount,
        payment_method=req.payment_method,
        transaction_reference=req.transaction_reference,
        payment_status="COMPLETED",
        received_by=current_user.id if current_user else None,
        created_at=datetime.now(timezone.utc)
    )
    db.add(payment)

    # Update invoice balances
    invoice.paid_amount += req.amount
    invoice.balance_amount -= req.amount
    if invoice.balance_amount == Decimal("0.00"):
        invoice.payment_status = "PAID"
    else:
        invoice.payment_status = "PARTIALLY_PAID"

    invoice.updated_at = datetime.now(timezone.utc)

    if invoice.patient and invoice.patient.user_id:
        create_notification(
            db,
            invoice.patient.user_id,
            "Payment Recorded",
            f"Payment of ${req.amount} received for invoice {invoice.invoice_number}. Remaining: ${invoice.balance_amount}.",
            category="BILLING",
            reference_id=invoice.id
        )

    create_audit_log(db, current_user.id if current_user else None, "PAYMENT_RECORD", "payments", payment.id, {"payment_number": payment_number, "amount": float(req.amount)})
    db.commit()
    db.refresh(payment)
    return payment

def list_invoices(
    db: Session,
    patient_id: uuid.UUID | None = None,
    payment_status: str | None = None,
    offset: int = 0,
    limit: int = 20
) -> tuple[list[Invoice], int]:
    query = db.query(Invoice)
    if patient_id:
        query = query.filter(Invoice.patient_id == patient_id)
    if payment_status:
        query = query.filter(Invoice.payment_status == payment_status)

    total = query.count()
    items = query.order_by(Invoice.created_at.desc()).offset(offset).limit(limit).all()
    return items, total

def list_payments(db: Session, invoice_id: uuid.UUID | None = None, offset: int = 0, limit: int = 20) -> tuple[list[Payment], int]:
    query = db.query(Payment)
    if invoice_id:
        query = query.filter(Payment.invoice_id == invoice_id)

    total = query.count()
    items = query.order_by(Payment.created_at.desc()).offset(offset).limit(limit).all()
    return items, total
