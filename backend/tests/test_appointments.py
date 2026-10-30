import pytest
import uuid
from datetime import datetime, timezone, date, time
from decimal import Decimal
from app.models import User, Patient, Doctor, Appointment, AppointmentStatus, Department
from app.core.permissions import UserRole
from app.core.security import hash_password, create_access_token

@pytest.fixture
def admin_token(db_session):
    u = User(
        id=uuid.uuid4(),
        full_name="Admin Test",
        email="admin_appt_test@medicore.com",
        phone="+1000000010",
        password_hash=hash_password("Password123"),
        role=UserRole.SUPER_ADMIN,
        is_active=True,
        created_at=datetime.now(timezone.utc),
        updated_at=datetime.now(timezone.utc)
    )
    db_session.add(u)
    db_session.commit()
    t = create_access_token({"sub": str(u.id), "email": u.email, "role": u.role.value})
    return {"Authorization": f"Bearer {t}"}

def test_appointment_booking_and_double_booking_prevention(client, db_session, admin_token):
    # Setup Patient
    pat = Patient(
        id=uuid.uuid4(),
        patient_number="PAT-TEST-001",
        first_name="Appt",
        last_name="Patient",
        phone="+19876543211",
        status="ACTIVE",
        created_at=datetime.now(timezone.utc),
        updated_at=datetime.now(timezone.utc)
    )
    db_session.add(pat)

    # Setup Doctor
    doc_user = User(
        id=uuid.uuid4(),
        full_name="Dr. Appt Test",
        email="doc_appt@medicore.com",
        phone="+19876543212",
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
        doctor_number="DOC-TEST-001",
        medical_registration_number="REG-TEST-001",
        specialization="Cardiology",
        qualifications="MBBS, MD",
        consultation_fee=Decimal("100.00"),
        status="ACTIVE",
        created_at=datetime.now(timezone.utc),
        updated_at=datetime.now(timezone.utc)
    )
    db_session.add(doc)
    db_session.commit()

    payload = {
        "patient_id": str(pat.id),
        "doctor_id": str(doc.id),
        "appointment_date": str(date.today()),
        "start_time": "10:00:00",
        "end_time": "10:30:00",
        "reason_for_visit": "Test Visit"
    }

    # First booking should succeed
    res1 = client.post("/api/v1/appointments", json=payload, headers=admin_token)
    assert res1.status_code == 201
    appt_id = res1.json()["data"]["id"]

    # Duplicate booking in same time slot must fail with 409 Conflict
    res2 = client.post("/api/v1/appointments", json=payload, headers=admin_token)
    assert res2.status_code == 409

    # Transition status: PENDING -> CONFIRMED -> CHECKED_IN
    res_conf = client.patch(f"/api/v1/appointments/{appt_id}/status", json={"status": "CONFIRMED"}, headers=admin_token)
    assert res_conf.status_code == 200
    assert res_conf.json()["data"]["status"] == "CONFIRMED"

    # Invalid transition directly to COMPLETED without check-in should fail
    res_inv = client.patch(f"/api/v1/appointments/{appt_id}/status", json={"status": "COMPLETED"}, headers=admin_token)
    assert res_inv.status_code == 400
