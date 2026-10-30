# MediCore – Frontend-Backend API Integration Contract

**Document Version:** 1.0.0  
**Backend Base URL:** `http://<BACKEND_IP>:8000/api/v1`  
**Frontend Environment Configuration:**  
```env
VITE_API_BASE_URL=http://<BACKEND_IP>:8000/api/v1
```

---

## 1. Standard Response Formats

### Success Response
```json
{
  "success": true,
  "message": "Operation description",
  "data": { ... }
}
```

### Paginated Response
```json
{
  "success": true,
  "message": "Items retrieved successfully",
  "data": {
    "items": [ ... ],
    "page": 1,
    "limit": 20,
    "total": 100,
    "total_pages": 5
  }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Specific error explanation",
  "data": null
}
```

---

## 2. Authentication & Authorization

All authenticated endpoints require an `Authorization` header:
`Authorization: Bearer <access_token>`

Roles: `SUPER_ADMIN`, `HOSPITAL_ADMIN`, `DOCTOR`, `RECEPTIONIST`, `PHARMACIST`, `PATIENT`

### Endpoints:
1. `POST /api/v1/auth/register`
   - **Allowed Roles:** Public
   - **Request Body:**
     ```json
     {
       "full_name": "Jane Doe",
       "email": "jane@example.com",
       "phone": "+19876543210",
       "password": "Password123"
     }
     ```
   - **Response:** Success object with patient and user identifiers.
   - **Frontend Screen:** Patient Registration Screen / Sign Up

2. `POST /api/v1/auth/login`
   - **Allowed Roles:** Public
   - **Request Body:**
     ```json
     {
       "email": "admin@medicore.com",
       "password": "Admin@123"
     }
     ```
   - **Response Data:**
     ```json
     {
       "access_token": "eyJhbGciOi...",
       "refresh_token": "eyJhbGciOi...",
       "token_type": "bearer",
       "user": {
         "id": "uuid",
         "full_name": "Super Admin",
         "email": "admin@medicore.com",
         "role": "SUPER_ADMIN",
         "patient_id": null,
         "doctor_id": null
       }
     }
     ```
   - **Frontend Screen:** Login Screen

3. `POST /api/v1/auth/refresh`
   - **Request Body:** `{"refresh_token": "eyJhbGci..."}`
   - **Frontend Service:** Axios Token Interceptor

4. `POST /api/v1/auth/logout`
   - **Auth Required:** Bearer token
   - **Frontend Screen:** Header / Logout button

5. `GET /api/v1/auth/me`
   - **Auth Required:** Bearer token
   - **Frontend Service:** AuthContext bootstrap

---

## 3. Patients API

1. `POST /api/v1/patients`
   - **Roles:** `SUPER_ADMIN`, `HOSPITAL_ADMIN`, `DOCTOR`, `RECEPTIONIST`, `PHARMACIST`
   - **Request:**
     ```json
     {
       "first_name": "John",
       "last_name": "Smith",
       "phone": "+19876543210",
       "gender": "MALE",
       "blood_group": "O+",
       "date_of_birth": "1990-05-15",
       "city": "Metro City"
     }
     ```
   - **Frontend Screen:** Receptionist / Patient Registration Modal

2. `GET /api/v1/patients`
   - **Query Params:** `search`, `gender`, `blood_group`, `status`, `page`, `limit`
   - **Frontend Screen:** Patient Directory / Patients Table

3. `GET /api/v1/patients/{patient_id}`
   - **Frontend Screen:** Patient Profile View

4. `PUT /api/v1/patients/{patient_id}`
   - **Frontend Screen:** Edit Patient Profile Modal

5. `DELETE /api/v1/patients/{patient_id}`
   - **Roles:** Admins only. Sets patient status to `INACTIVE` while preserving historical records.

6. `GET /api/v1/patients/{patient_id}/history`
   - **Frontend Screen:** Complete Medical Timeline / Patient EHR Tab

---

## 4. Doctors & Availability API

1. `POST /api/v1/doctors`
   - **Roles:** Admins
   - **Request:**
     ```json
     {
       "full_name": "Dr. Sarah Conner",
       "email": "dr.sarah@medicore.com",
       "phone": "+1122334455",
       "password": "Doctor@123",
       "medical_registration_number": "DOC-REG-9988",
       "specialization": "Cardiology",
       "qualifications": "MD, FACC",
       "experience_years": 10,
       "consultation_fee": 150.00
     }
     ```
   - **Frontend Screen:** Admin / Add Doctor Modal

2. `GET /api/v1/doctors`
   - **Query Params:** `search`, `specialization`, `department_id`, `page`, `limit`
   - **Frontend Screen:** Doctors Directory

3. `GET /api/v1/doctors/{doctor_id}`
   - **Frontend Screen:** Doctor Profile

4. `PUT /api/v1/doctors/{doctor_id}`
   - **Frontend Screen:** Edit Doctor Details

5. `GET /api/v1/doctors/{doctor_id}/availability`
   - **Frontend Screen:** Doctor Schedule View

6. `PUT /api/v1/doctors/{doctor_id}/availability`
   - **Request:**
     ```json
     {
       "slots": [
         {
           "day_of_week": 0,
           "start_time": "09:00:00",
           "end_time": "17:00:00",
           "slot_duration_minutes": 30,
           "is_available": true
         }
       ]
     }
     ```
   - **Frontend Screen:** Doctor Schedule Configuration

---

## 5. Appointments API

1. `GET /api/v1/appointments/availability`
   - **Query Params:** `doctor_id`, `appointment_date`, `appointment_type`
   - **Returns:** List of time slots with `is_available` boolean.
   - **Frontend Screen:** Appointment Booking Slot Picker

2. `POST /api/v1/appointments`
   - **Request:**
     ```json
     {
       "patient_id": "uuid",
       "doctor_id": "uuid",
       "appointment_date": "2026-11-01",
       "start_time": "10:00:00",
       "end_time": "10:30:00",
       "appointment_type": "GENERAL_CONSULTATION",
       "reason_for_visit": "Chest tightness"
     }
     ```
   - **Frontend Screen:** Book Appointment Flow

3. `GET /api/v1/appointments`
   - **Query Params:** `doctor_id`, `patient_id`, `appointment_date`, `status`, `page`, `limit`
   - **Frontend Screen:** Appointment Calendar / Appointments List

4. `PATCH /api/v1/appointments/{appointment_id}/status`
   - **Request:** `{"status": "CONFIRMED"}` (Transitions: `CONFIRMED`, `CHECKED_IN`, `COMPLETED`, `CANCELLED`, `NO_SHOW`)
   - **Frontend Screen:** Receptionist Queue / Check-In Button

5. `PUT /api/v1/appointments/{appointment_id}`
   - **Frontend Screen:** Reschedule Modal

---

## 6. Medical Records & Consultations API

1. `POST /api/v1/medical-records`
   - **Roles:** `DOCTOR`, Admins
   - **Request:**
     ```json
     {
       "patient_id": "uuid",
       "appointment_id": "uuid",
       "chief_complaint": "Persistent cough",
       "symptoms": "Fever, headache",
       "blood_pressure": "120/80",
       "heart_rate": 72,
       "temperature": 98.6,
       "oxygen_saturation": 99.0,
       "diagnosis": "Viral upper respiratory infection",
       "clinical_notes": "Advised plenty of fluids and rest",
       "status": "FINALIZED"
     }
     ```
   - **Frontend Screen:** Doctor Consultation Room

2. `GET /api/v1/medical-records/{record_id}`
   - **Frontend Screen:** Consultation Details

3. `GET /api/v1/patients/{patient_id}/medical-records`
   - **Frontend Screen:** Patient History Tab

---

## 7. Prescriptions API

1. `POST /api/v1/prescriptions`
   - **Roles:** `DOCTOR`, Admins
   - **Request:**
     ```json
     {
       "patient_id": "uuid",
       "medical_record_id": "uuid",
       "items": [
         {
           "medicine_name": "Paracetamol 500mg",
           "medicine_type": "TABLET",
           "dosage": "500mg",
           "frequency": "1-0-1",
           "duration": 5,
           "route": "ORAL",
           "instructions": "Take after meals",
           "quantity": 10
         }
       ]
     }
     ```
   - **Frontend Screen:** Doctor Prescription Pad

2. `GET /api/v1/prescriptions`
   - **Query Params:** `patient_id`, `doctor_id`, `page`, `limit`
   - **Frontend Screen:** Prescriptions List

3. `GET /api/v1/prescriptions/{prescription_id}`
   - **Frontend Screen:** Prescription View / Print Modal

---

## 8. Pharmacy & Inventory API

1. `POST /api/v1/medicines`
   - **Roles:** `PHARMACIST`, Admins
   - **Request:**
     ```json
     {
       "name": "Paracetamol 500mg",
       "generic_name": "Acetaminophen",
       "category": "Analgesic",
       "reorder_level": 50,
       "purchase_price": 2.50,
       "selling_price": 5.00
     }
     ```
   - **Frontend Screen:** Add Medicine Modal

2. `GET /api/v1/medicines`
   - **Query Params:** `search`, `category`, `page`, `limit`
   - **Frontend Screen:** Pharmacy Inventory Table

3. `GET /api/v1/medicines/low-stock`
   - **Frontend Screen:** Pharmacy Stock Alerts

4. `POST /api/v1/medicines/{medicine_id}/batches`
   - **Request:**
     ```json
     {
       "batch_number": "B9981",
       "expiry_date": "2027-06-30",
       "stock_quantity": 200,
       "purchase_price": 2.50,
       "selling_price": 5.00
     }
     ```
   - **Frontend Screen:** Add Stock Batch Modal

5. `POST /api/v1/pharmacy/dispense`
   - **Roles:** `PHARMACIST`, Admins
   - **Request:**
     ```json
     {
       "prescription_id": "uuid",
       "prescription_item_id": "uuid",
       "patient_id": "uuid",
       "medicine_batch_id": "uuid",
       "dispensed_quantity": 10,
       "pharmacist_notes": "Dispensed full course"
     }
     ```
   - **Frontend Screen:** Pharmacist Dispensing Terminal

6. `GET /api/v1/pharmacy/dispensing-history`
   - **Frontend Screen:** Pharmacy Audit Log

---

## 9. Billing & Payments API

1. `POST /api/v1/billing/invoices`
   - **Roles:** `RECEPTIONIST`, Admins
   - **Request:**
     ```json
     {
       "patient_id": "uuid",
       "appointment_id": "uuid",
       "discount": 0.00,
       "tax": 5.00,
       "items": [
         {
           "description": "Doctor Consultation Fee",
           "category": "CONSULTATION",
           "quantity": 1,
           "unit_price": 100.00
         }
       ]
     }
     ```
   - **Frontend Screen:** Generate Invoice Modal

2. `GET /api/v1/billing/invoices`
   - **Query Params:** `patient_id`, `payment_status`, `page`, `limit`
   - **Frontend Screen:** Billing Dashboard

3. `GET /api/v1/billing/invoices/{invoice_id}`
   - **Frontend Screen:** Invoice Detail View

4. `PATCH /api/v1/billing/invoices/{invoice_id}/payment`
   - **Request:**
     ```json
     {
       "amount": 105.00,
       "payment_method": "CASH",
       "transaction_reference": "TXN-987654"
     }
     ```
   - **Frontend Screen:** Record Payment Modal

5. `GET /api/v1/billing/invoices/{invoice_id}/receipt`
   - **Frontend Screen:** Print Payment Receipt

---

## 10. Dashboards API

- `GET /api/v1/dashboard/admin`
- `GET /api/v1/dashboard/doctor`
- `GET /api/v1/dashboard/receptionist`
- `GET /api/v1/dashboard/pharmacist`
- `GET /api/v1/dashboard/patient`
- `GET /api/v1/dashboard/statistics`
- `GET /api/v1/dashboard/recent-activities`

---

## 11. Reports & Analytics API

- `GET /api/v1/reports/patients` (params: `start_date`, `end_date`)
- `GET /api/v1/reports/doctors`
- `GET /api/v1/reports/appointments` (params: `start_date`, `end_date`, `status`)
- `GET /api/v1/reports/consultations`
- `GET /api/v1/reports/pharmacy`
- `GET /api/v1/reports/revenue` (params: `start_date`, `end_date`)
- `GET /api/v1/reports/payments`
