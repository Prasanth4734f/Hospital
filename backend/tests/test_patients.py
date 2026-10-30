import pytest
import uuid
from datetime import datetime, timezone
from app.models.user import User
from app.models.patient import Patient
from app.core.permissions import UserRole
from app.core.security import hash_password, create_access_token

@pytest.fixture
def auth_headers(db_session):
    user = User(
        id=uuid.uuid4(),
        full_name="Admin Staff",
        email="staff_admin@medicore.com",
        phone="+12345678999",
        password_hash=hash_password("Password123"),
        role=UserRole.SUPER_ADMIN,
        is_active=True,
        is_verified=True,
        created_at=datetime.now(timezone.utc),
        updated_at=datetime.now(timezone.utc)
    )
    db_session.add(user)
    db_session.commit()
    token = create_access_token({"sub": str(user.id), "email": user.email, "role": user.role.value})
    return {"Authorization": f"Bearer {token}"}

def test_create_and_retrieve_patient(client, auth_headers):
    payload = {
        "first_name": "Alice",
        "last_name": "Wonderland",
        "phone": "+19998887777",
        "gender": "FEMALE",
        "blood_group": "B+",
        "city": "London"
    }
    res = client.post("/api/v1/patients", json=payload, headers=auth_headers)
    assert res.status_code == 201
    created_id = res.json()["data"]["id"]

    get_res = client.get(f"/api/v1/patients/{created_id}", headers=auth_headers)
    assert get_res.status_code == 200
    assert get_res.json()["data"]["first_name"] == "Alice"
    assert get_res.json()["data"]["blood_group"] == "B+"

def test_deactivate_patient(client, auth_headers):
    payload = {
        "first_name": "Bob",
        "last_name": "Builder",
        "phone": "+19998886666"
    }
    res = client.post("/api/v1/patients", json=payload, headers=auth_headers)
    created_id = res.json()["data"]["id"]

    del_res = client.delete(f"/api/v1/patients/{created_id}", headers=auth_headers)
    assert del_res.status_code == 200
    assert del_res.json()["data"]["status"] == "INACTIVE"
