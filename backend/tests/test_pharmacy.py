import pytest
import uuid
from datetime import datetime, timezone, date
from decimal import Decimal
from app.models import User, Medicine, MedicineBatch, Prescription, PrescriptionItem, Patient, Doctor
from app.core.permissions import UserRole
from app.core.security import hash_password, create_access_token

@pytest.fixture
def pharm_token(db_session):
    u = User(
        id=uuid.uuid4(),
        full_name="Pharmacist Test",
        email="pharm_test@medicore.com",
        phone="+1000000020",
        password_hash=hash_password("Password123"),
        role=UserRole.PHARMACIST,
        is_active=True,
        created_at=datetime.now(timezone.utc),
        updated_at=datetime.now(timezone.utc)
    )
    db_session.add(u)
    db_session.commit()
    t = create_access_token({"sub": str(u.id), "email": u.email, "role": u.role.value})
    return {"Authorization": f"Bearer {t}"}, u

def test_pharmacy_dispensing_and_stock_deduction(client, db_session, pharm_token):
    headers, pharm_user = pharm_token

    # 1. Create Patient
    pat = Patient(
        id=uuid.uuid4(),
        patient_number="PAT-PHARM-01",
        first_name="Pharm",
        last_name="Patient",
        phone="+19876543299",
        status="ACTIVE",
        created_at=datetime.now(timezone.utc),
        updated_at=datetime.now(timezone.utc)
    )
    db_session.add(pat)

    # 2. Create Medicine with 10 stock
    med = Medicine(
        id=uuid.uuid4(),
        medicine_code="MED-T01",
        name="Amoxicillin Test",
        reorder_level=5,
        purchase_price=Decimal("5.00"),
        selling_price=Decimal("10.00"),
        status="ACTIVE",
        created_at=datetime.now(timezone.utc)
    )
    db_session.add(med)
    db_session.flush()

    batch = MedicineBatch(
        id=uuid.uuid4(),
        medicine_id=med.id,
        batch_number="BATCH-T01",
        expiry_date=date(2027, 1, 1),
        stock_quantity=10,
        purchase_price=Decimal("5.00"),
        selling_price=Decimal("10.00"),
        created_at=datetime.now(timezone.utc)
    )
    db_session.add(batch)

    # 3. Create Prescription for 5 items
    doc_user = User(
        id=uuid.uuid4(),
        full_name="Dr. Pharm Test",
        email="dr_pharm@medicore.com",
        phone="+19876543298",
        password_hash=hash_password("Password123"),
        role=UserRole.DOCTOR,
        is_active=True,
        created_at=datetime.now(timezone.utc),
        updated_at=datetime.now(timezone.utc)
    )
    db_session.add(doc_user)
    db_session.flush()

    doc = Doctor(
        id=uuid.uuid4(),
        user_id=doc_user.id,
        doctor_number="DOC-T99",
        medical_registration_number="REG-T99",
        specialization="General",
        qualifications="MBBS",
        status="ACTIVE",
        created_at=datetime.now(timezone.utc),
        updated_at=datetime.now(timezone.utc)
    )
    db_session.add(doc)
    db_session.flush()

    rx = Prescription(
        id=uuid.uuid4(),
        prescription_number="RX-TEST-001",
        patient_id=pat.id,
        doctor_id=doc.id,
        status="ACTIVE",
        created_at=datetime.now(timezone.utc)
    )
    db_session.add(rx)
    db_session.flush()

    rx_item = PrescriptionItem(
        id=uuid.uuid4(),
        prescription_id=rx.id,
        medicine_id=med.id,
        medicine_name=med.name,
        dosage="250mg",
        frequency="TDS",
        duration=3,
        quantity=5
    )
    db_session.add(rx_item)
    db_session.commit()

    # Dispense 3 items
    dispense_req = {
        "prescription_id": str(rx.id),
        "prescription_item_id": str(rx_item.id),
        "patient_id": str(pat.id),
        "medicine_batch_id": str(batch.id),
        "dispensed_quantity": 3
    }
    res = client.post("/api/v1/pharmacy/dispense", json=dispense_req, headers=headers)
    assert res.status_code == 201

    # Verify stock deducted (10 - 3 = 7)
    db_session.refresh(batch)
    assert batch.stock_quantity == 7

    # Attempt excessive dispensing (Remaining is 2, trying to dispense 5) -> Should Fail with 400
    excessive_req = {
        "prescription_id": str(rx.id),
        "prescription_item_id": str(rx_item.id),
        "patient_id": str(pat.id),
        "medicine_batch_id": str(batch.id),
        "dispensed_quantity": 5
    }
    res_err = client.post("/api/v1/pharmacy/dispense", json=excessive_req, headers=headers)
    assert res_err.status_code == 400
