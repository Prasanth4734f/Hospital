import pytest
import uuid
from datetime import datetime, timezone, date
from decimal import Decimal
from app.models import User, Patient, Doctor, Appointment, AppointmentStatus, MedicalRecord, Prescription, PrescriptionItem, Medicine, MedicineBatch, Invoice, InvoiceItem
from app.core.permissions import UserRole
from app.core.security import hash_password, create_access_token

@pytest.fixture
def doctor_setup(db_session):
    u = User(
        id=uuid.uuid4(),
        full_name="Dr. Gregory House",
        email="house@medicore.com",
        phone="+18889991111",
        password_hash=hash_password("Password123"),
        role=UserRole.DOCTOR,
        is_active=True,
        created_at=datetime.now(timezone.utc),
        updated_at=datetime.now(timezone.utc)
    )
    db_session.add(u)
    db_session.flush()

    doc = Doctor(
        id=uuid.uuid4(),
        user_id=u.id,
        doctor_number="DOC-HOUSE",
        medical_registration_number="REG-HOUSE",
        specialization="Diagnostics",
        qualifications="MD",
        status="ACTIVE",
        created_at=datetime.now(timezone.utc),
        updated_at=datetime.now(timezone.utc)
    )
    db_session.add(doc)

    pat = Patient(
        id=uuid.uuid4(),
        patient_number="PAT-HOUSE-01",
        first_name="Patient",
        last_name="House",
        phone="+18889992222",
        status="ACTIVE",
        created_at=datetime.now(timezone.utc),
        updated_at=datetime.now(timezone.utc)
    )
    db_session.add(pat)
    db_session.commit()

    token = create_access_token({"sub": str(u.id), "email": u.email, "role": u.role.value})
    return {"Authorization": f"Bearer {token}"}, doc, pat

def test_medical_record_creation_and_prescription_workflow(client, doctor_setup):
    headers, doc, pat = doctor_setup

    # 1. Create Medical Record
    rec_payload = {
        "patient_id": str(pat.id),
        "chief_complaint": "Persistent cough and fever",
        "symptoms": "Chills, fatigue",
        "blood_pressure": "120/80",
        "heart_rate": 78,
        "temperature": 99.5,
        "oxygen_saturation": 98.0,
        "diagnosis": "Acute Bronchitis",
        "clinical_notes": "Prescribed antibiotic therapy",
        "status": "FINALIZED"
    }
    rec_res = client.post("/api/v1/medical-records", json=rec_payload, headers=headers)
    assert rec_res.status_code == 201
    rec_id = rec_res.json()["data"]["id"]

    # 2. Cannot overwrite finalized record directly with DRAFT status
    upd_res = client.put(f"/api/v1/medical-records/{rec_id}", json={"status": "DRAFT"}, headers=headers)
    assert upd_res.status_code == 400

    # 3. Create Prescription linked to this record
    rx_payload = {
        "patient_id": str(pat.id),
        "medical_record_id": rec_id,
        "items": [
            {
                "medicine_name": "Azithromycin 500mg",
                "dosage": "500mg",
                "frequency": "Once daily",
                "duration": 3,
                "quantity": 3,
                "instructions": "Take after food"
            }
        ]
    }
    rx_res = client.post("/api/v1/prescriptions", json=rx_payload, headers=headers)
    assert rx_res.status_code == 201
    assert rx_res.json()["data"]["items_count"] == 1
