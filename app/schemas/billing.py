import uuid
from datetime import datetime
from decimal import Decimal
from pydantic import BaseModel, Field

class InvoiceItemBase(BaseModel):
    description: str = Field(..., min_length=1)
    category: str = "CONSULTATION" # CONSULTATION, MEDICINE, LAB, OTHER
    quantity: int = Field(default=1, ge=1)
    unit_price: Decimal = Field(default=Decimal("0.00"), ge=0)

class InvoiceItemCreate(InvoiceItemBase):
    pass

class InvoiceItemResponse(InvoiceItemBase):
    id: uuid.UUID
    invoice_id: uuid.UUID
    total_price: Decimal

    class Config:
        from_attributes = True

class InvoiceCreate(BaseModel):
    patient_id: uuid.UUID
    appointment_id: uuid.UUID | None = None
    discount: Decimal = Field(default=Decimal("0.00"), ge=0)
    tax: Decimal = Field(default=Decimal("0.00"), ge=0)
    items: list[InvoiceItemCreate] = Field(..., min_items=1)

class PaymentCreate(BaseModel):
    amount: Decimal = Field(..., gt=0)
    payment_method: str = "CASH" # CASH, CARD, UPI, BANK_TRANSFER
    transaction_reference: str | None = None

class PaymentResponse(BaseModel):
    id: uuid.UUID
    payment_number: str
    invoice_id: uuid.UUID
    amount: Decimal
    payment_method: str
    transaction_reference: str | None = None
    payment_status: str
    received_by: uuid.UUID | None = None
    created_at: datetime

    class Config:
        from_attributes = True

class InvoiceResponse(BaseModel):
    id: uuid.UUID
    invoice_number: str
    patient_id: uuid.UUID
    appointment_id: uuid.UUID | None = None
    subtotal: Decimal
    discount: Decimal
    tax: Decimal
    total_amount: Decimal
    paid_amount: Decimal
    balance_amount: Decimal
    payment_status: str
    created_by: uuid.UUID | None = None
    created_at: datetime
    updated_at: datetime
    patient_name: str | None = None
    items: list[InvoiceItemResponse] = []
    payments: list[PaymentResponse] = []

    class Config:
        from_attributes = True

class InvoiceReceiptResponse(BaseModel):
    invoice: InvoiceResponse
    hospital_name: str = "MediCore Intelligent Hospital"
    generated_at: datetime
