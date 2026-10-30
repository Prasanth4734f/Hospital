import pytest

def test_register_patient(client):
    payload = {
        "full_name": "Test Patient",
        "email": "testpatient@example.com",
        "phone": "+12345678901",
        "password": "Password123"
    }
    res = client.post("/api/v1/auth/register", json=payload)
    assert res.status_code == 201
    data = res.json()
    assert data["success"] is True
    assert "id" in data["data"]
    assert "patient_number" in data["data"]

def test_register_duplicate_email(client):
    payload = {
        "full_name": "Duplicate User",
        "email": "duplicate@example.com",
        "phone": "+12345678901",
        "password": "Password123"
    }
    res = client.post("/api/v1/auth/register", json=payload)
    assert res.status_code == 201
    res2 = client.post("/api/v1/auth/register", json=payload)
    assert res2.status_code == 409
    assert res2.json()["success"] is False

def test_login_success(client):
    payload = {
        "full_name": "Login User",
        "email": "loginuser@example.com",
        "phone": "+12345678902",
        "password": "Password123"
    }
    client.post("/api/v1/auth/register", json=payload)

    login_res = client.post("/api/v1/auth/login", json={
        "email": "loginuser@example.com",
        "password": "Password123"
    })
    assert login_res.status_code == 200
    res_data = login_res.json()
    assert res_data["success"] is True
    assert "access_token" in res_data["data"]
    assert "refresh_token" in res_data["data"]

def test_login_invalid_password(client):
    res = client.post("/api/v1/auth/login", json={
        "email": "nonexistent@example.com",
        "password": "WrongPassword123"
    })
    assert res.status_code == 401
    assert res.json()["success"] is False
