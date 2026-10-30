# MediCore – Intelligent Hospital Management Ecosystem (Backend)

> **One Hospital. One Connected Healthcare Ecosystem.**

Complete production-grade backend implementation in Python 3.11+, FastAPI, SQLAlchemy 2.x, PostgreSQL, and Alembic.

---

## 1. Architecture & Technologies

- **Framework:** FastAPI
- **Database:** PostgreSQL (Driver: `psycopg` 3)
- **ORM:** SQLAlchemy 2.0 (mapped column typing, asynchronous/session pooling)
- **Validation:** Pydantic v2
- **Authentication:** JWT with Argon2id password hashing
- **Migrations:** Alembic
- **Testing:** Pytest & HTTPX TestClient

---

## 2. Network & Deployment Setup

The backend serves requests across the local network to frontend clients (such as Laptop 1).

### Finding Backend IPv4 Address
In PowerShell:
```powershell
Get-NetIPAddress -AddressFamily IPv4 | Where-Object { $_.InterfaceAlias -like "*Wi-Fi*" -or $_.InterfaceAlias -like "*Ethernet*" }
```
*Current Active Host IP:* `192.168.1.17`

### Opening Windows Firewall for Port 8000
If required for Laptop 1 inbound requests, run once in an elevated PowerShell prompt:
```powershell
New-NetFirewallRule -DisplayName "MediCore Backend 8000" -Direction Inbound -LocalPort 8000 -Protocol TCP -Action Allow
```

### Running the Server
```powershell
.\.venv\Scripts\Activate.ps1
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

---

## 3. URLs & Documentation

- **Root Status:** `http://localhost:8000/`
- **Health Check:** `http://localhost:8000/health`
- **Swagger UI:** `http://localhost:8000/docs`
- **ReDoc:** `http://localhost:8000/redoc`
- **API Base URL:** `http://<BACKEND_IP>:8000/api/v1`

---

## 4. Preloaded Demo Credentials

All test accounts are seeded in the database with secure Argon2id hashes:

| Role | Email | Password |
|---|---|---|
| **Super Admin** | `admin@medicore.com` | `Admin@123` |
| **Hospital Admin** | `hospital.admin@medicore.com` | `Admin@123` |
| **Doctor (Cardiology)** | `dr.alice@medicore.com` | `Doctor@123` |
| **Doctor (Neurology)** | `dr.robert@medicore.com` | `Doctor@123` |
| **Doctor (General)** | `dr.grace@medicore.com` | `Doctor@123` |
| **Receptionist 1** | `receptionist1@medicore.com` | `Staff@123` |
| **Receptionist 2** | `receptionist2@medicore.com` | `Staff@123` |
| **Pharmacist 1** | `pharmacist1@medicore.com` | `Staff@123` |
| **Pharmacist 2** | `pharmacist2@medicore.com` | `Staff@123` |
| **Patient 1** | `john.doe@example.com` | `Patient@123` |
| **Patient 2** | `jane.smith@example.com` | `Patient@123` |

---

## 5. Database Commands & Migrations

To apply or update schema migrations:
```powershell
.\.venv\Scripts\alembic upgrade head
```

To run seed data:
```powershell
$env:PYTHONPATH="."
.\.venv\Scripts\python scripts/seed_data.py
```

---

## 6. Running Automated Tests

```powershell
$env:PYTHONPATH="."
.\.venv\Scripts\pytest -v
```
All 12 automated unit and integration tests run against an isolated test database `medicore_test`.
