import pytest
import uuid
from datetime import datetime, timezone
from decimal import Decimal
from app.models import User, Patient, Invoice, InvoiceItem
from app.core.permissions import UserRole
from app.core.security import hash_password, create_access_token

@pytest.fixture
def admin_token(db_session):
    u = User(
        id=uuid.uuid4(),
        full_name="Billing Staff",
        email="billing_test@medicore.com",
        phone="+1000000030",
        password_hash=hash_password("Password123"),
        role=UserRole.HOSPITAL_ADMIN,
        is_active=True,
        created_at=datetime.now(timezone.utc),
        updated_at=datetime.now(timezone.utc)
    )
    db_session.add(u)
    db_session.commit()
    t = create_access_token({"sub": str(u.id), "email": u.email, "role": u.role.value})
    return {"Authorization": f"Bearer {t}"}

def test_invoice_creation_and_partial_payment(client, db_session, admin_token):
    pat = Patient(
        id=uuid.uuid4(),
        patient_number="PAT-BILL-01",
        first_name="Bill",
        last_name="Patient",
        phone="+19876543233",
        status="ACTIVE",
        created_at=datetime.now(timezone.utc),
        updated_at=datetime.now(timezone.utc)
    )
    db_session.add(pat)
    db_session.commit()

    inv_req = {
        "patient_id": str(pat.id),
        "discount": 10.00,
        "tax": 5.00,
        "items": [
            {"description": "Consultation", "quantity": 1, "unit_price": 100.00},
            {"description": "Lab Blood Test", "quantity": 2, "unit_price": 25.00}
        ]
    }
    # Subtotal = 100 + 50 = 150. Total = 150 - 10 + 5 = 145.00
    res = client.post("/api/v1/billing/invoices", json=inv_req, headers=admin_token)
    assert res.status_code == 201
    inv_data = res.json()["data"]
    inv_id = inv_data["id"]
    assert inv_data["total_amount"] == 145.00
    assert inv_data["balance_amount"] == 145.00

    # Partial payment of 45.00
    pay_res = client.patch(f"/api/v1/billing/invoices/{inv_id}/payment", json={"amount": 45.00, "payment_method": "CASH"}, headers=admin_token)
    assert pay_res.status_code == 201

    # Verify balance is updated to 100.00 and status is PARTIALLY_PAID
    inv_get = client.get(f"/api/v1/billing/invoices/{inv_id}", headers=admin_token)
    assert inv_get.json()["data"]["balance_amount"] == 100.00
    assert inv_get.json()["data"]["payment_status"] == "PARTIALLY_PAID"

    # Payment exceeding remaining balance (e.g. 150.00) should be rejected
    exceed_res = client.patch(f"/api/v1/billing/invoices/{inv_id}/payment", json={"amount": 150.00, "payment_method": "CASH"}, headers=admin_token)
    assert exceed_res.status_code == 400
