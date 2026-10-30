import uuid
from datetime import datetime, timezone
from sqlalchemy import Integer, Text, DateTime, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID
from app.database.base import Base

class Dispensing(Base):
    __tablename__ = "dispensing"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    prescription_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("prescriptions.id", ondelete="CASCADE"), nullable=False, index=True)
    prescription_item_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("prescription_items.id", ondelete="CASCADE"), nullable=False, index=True)
    patient_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("patients.id", ondelete="CASCADE"), nullable=False, index=True)
    pharmacist_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    medicine_batch_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("medicine_batches.id", ondelete="CASCADE"), nullable=False, index=True)
    dispensed_quantity: Mapped[int] = mapped_column(Integer, nullable=False)
    pharmacist_notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)

    prescription = relationship("Prescription", back_populates="dispensing_records")
    prescription_item = relationship("PrescriptionItem", back_populates="dispensing_records")
    patient = relationship("Patient", back_populates="dispensing_records")
    batch = relationship("MedicineBatch", back_populates="dispensing_records")
