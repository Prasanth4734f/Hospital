import pytest
import uuid
from datetime import datetime, timezone
from app.models import User, Patient
from app.core.permissions import UserRole
from app.core.security import hash_password, create_access_token

def test_patient_cross_access_forbidden(client, db_session):
    # Patient 1
    u1 = User(
        id=uuid.uuid4(),
        full_name="Patient One",
        email="p1@medicore.com",
        phone="+19876543111",
        password_hash=hash_password("Password123"),
        role=UserRole.PATIENT,
        is_active=True,
        created_at=datetime.now(timezone.utc),
        updated_at=datetime.now(timezone.utc)
    )
    db_session.add(u1)
    db_session.flush()

    pat1 = Patient(
        id=uuid.uuid4(),
        user_id=u1.id,
        patient_number="PAT-001",
        first_name="Patient",
        last_name="One",
        phone="+19876543111",
        status="ACTIVE",
        created_at=datetime.now(timezone.utc),
        updated_at=datetime.now(timezone.utc)
    )
    db_session.add(pat1)

    # Patient 2
    u2 = User(
        id=uuid.uuid4(),
        full_name="Patient Two",
        email="p2@medicore.com",
        phone="+19876543222",
        password_hash=hash_password("Password123"),
        role=UserRole.PATIENT,
        is_active=True,
        created_at=datetime.now(timezone.utc),
        updated_at=datetime.now(timezone.utc)
    )
    db_session.add(u2)
    db_session.flush()

    pat2 = Patient(
        id=uuid.uuid4(),
        user_id=u2.id,
        patient_number="PAT-002",
        first_name="Patient",
        last_name="Two",
        phone="+19876543222",
        status="ACTIVE",
        created_at=datetime.now(timezone.utc),
        updated_at=datetime.now(timezone.utc)
    )
    db_session.add(pat2)
    db_session.commit()

    # Login Patient 1
    t1 = create_access_token({"sub": str(u1.id), "email": u1.email, "role": u1.role.value})
    headers1 = {"Authorization": f"Bearer {t1}"}

    # Patient 1 accesses own profile -> 200
    res_own = client.get(f"/api/v1/patients/{pat1.id}", headers=headers1)
    assert res_own.status_code == 200

    # Patient 1 attempts to access Patient 2's profile -> 403 Forbidden
    res_other = client.get(f"/api/v1/patients/{pat2.id}", headers=headers1)
    assert res_other.status_code == 403

def test_unauthorized_staff_route_for_patient(client, db_session):
    u = User(
        id=uuid.uuid4(),
        full_name="Patient Tester",
        email="p_test@medicore.com",
        phone="+19876543333",
        password_hash=hash_password("Password123"),
        role=UserRole.PATIENT,
        is_active=True,
        created_at=datetime.now(timezone.utc),
        updated_at=datetime.now(timezone.utc)
    )
    db_session.add(u)
    db_session.commit()
    t = create_access_token({"sub": str(u.id), "email": u.email, "role": u.role.value})
    headers = {"Authorization": f"Bearer {t}"}

    # Patient trying to list all users (admin-only)
    res = client.get("/api/v1/users", headers=headers)
    assert res.status_code == 403
