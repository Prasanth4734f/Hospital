import uuid
from datetime import date, datetime
from decimal import Decimal
from pydantic import BaseModel, Field

class MedicineBatchBase(BaseModel):
    batch_number: str = Field(..., min_length=1)
    expiry_date: date
    stock_quantity: int = Field(..., ge=0)
    purchase_price: Decimal = Field(default=Decimal("0.00"), ge=0)
    selling_price: Decimal = Field(default=Decimal("0.00"), ge=0)

class MedicineBatchCreate(MedicineBatchBase):
    pass

class MedicineBatchResponse(MedicineBatchBase):
    id: uuid.UUID
    medicine_id: uuid.UUID
    created_at: datetime

    class Config:
        from_attributes = True

class MedicineBase(BaseModel):
    name: str = Field(..., min_length=1)
    generic_name: str | None = None
    category: str | None = None
    manufacturer: str | None = None
    reorder_level: int = Field(default=10, ge=0)
    purchase_price: Decimal = Field(default=Decimal("0.00"), ge=0)
    selling_price: Decimal = Field(default=Decimal("0.00"), ge=0)
    storage_instructions: str | None = None

class MedicineCreate(MedicineBase):
    batches: list[MedicineBatchCreate] = []

class MedicineUpdate(BaseModel):
    name: str | None = None
    generic_name: str | None = None
    category: str | None = None
    manufacturer: str | None = None
    reorder_level: int | None = None
    purchase_price: Decimal | None = None
    selling_price: Decimal | None = None
    storage_instructions: str | None = None
    status: str | None = None

class MedicineResponse(MedicineBase):
    id: uuid.UUID
    medicine_code: str
    status: str
    created_at: datetime
    total_stock: int = 0
    batches: list[MedicineBatchResponse] = []

    class Config:
        from_attributes = True
