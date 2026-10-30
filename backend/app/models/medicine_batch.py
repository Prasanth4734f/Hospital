import uuid
from datetime import datetime, timezone, date
from decimal import Decimal
from sqlalchemy import String, Integer, Numeric, Date, DateTime, ForeignKey, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID
from app.database.base import Base

class MedicineBatch(Base):
    __tablename__ = "medicine_batches"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    medicine_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("medicines.id", ondelete="CASCADE"), nullable=False, index=True)
    batch_number: Mapped[str] = mapped_column(String(100), nullable=False, index=True)
    expiry_date: Mapped[date] = mapped_column(Date, nullable=False, index=True)
    stock_quantity: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    purchase_price: Mapped[Decimal] = mapped_column(Numeric(10, 2), default=Decimal("0.00"), nullable=False)
    selling_price: Mapped[Decimal] = mapped_column(Numeric(10, 2), default=Decimal("0.00"), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)

    __table_args__ = (
        UniqueConstraint("medicine_id", "batch_number", name="uq_medicine_batch_number"),
    )

    medicine = relationship("Medicine", back_populates="batches")
    dispensing_records = relationship("Dispensing", back_populates="batch")
