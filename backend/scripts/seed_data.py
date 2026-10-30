import uuid
from datetime import datetime, timezone, date, time, timedelta
from decimal import Decimal
from app.database.session import SessionLocal
from app.models import (
    User, Department, Patient, Doctor, DoctorAvailability,
    Appointment, AppointmentStatus, MedicalRecord,
    Prescription, PrescriptionItem, Medicine, MedicineBatch,
    Invoice, InvoiceItem, Payment, Notification
)
from app.core.permissions import UserRole
from app.core.security import hash_password

def seed():
    db = SessionLocal()
    try:
        # 1. Departments
        dept_data = [
            ("Cardiology", "Heart and cardiovascular system care"),
            ("Neurology", "Brain and nervous system disorders"),
            ("General Medicine", "Primary healthcare and general consultations"),
            ("Pediatrics", "Infant, child, and adolescent medical care"),
            ("Orthopedics", "Bones, joints, ligaments, tendons, and muscles")
        ]
        dept_map = {}
        for name, desc in dept_data:
            dept = db.query(Department).filter(Department.department_name == name).first()
            if not dept:
                dept = Department(id=uuid.uuid4(), department_name=name, description=desc, status="ACTIVE", created_at=datetime.now(timezone.utc))
                db.add(dept)
                db.flush()
            dept_map[name] = dept

        # 2. Staff & Admin Users
        users_to_create = [
            ("Super Admin", "admin@medicore.com", "+1100000001", UserRole.SUPER_ADMIN, "Admin@123"),
            ("Hospital Admin", "hospital.admin@medicore.com", "+1100000002", UserRole.HOSPITAL_ADMIN, "Admin@123"),
            ("Receptionist Sarah", "receptionist1@medicore.com", "+1100000003", UserRole.RECEPTIONIST, "Staff@123"),
            ("Receptionist Mike", "receptionist2@medicore.com", "+1100000004", UserRole.RECEPTIONIST, "Staff@123"),
            ("Pharmacist Emily", "pharmacist1@medicore.com", "+1100000005", UserRole.PHARMACIST, "Staff@123"),
            ("Pharmacist David", "pharmacist2@medicore.com", "+1100000006", UserRole.PHARMACIST, "Staff@123")
        ]

        user_map = {}
        for name, email, phone, role, pwd in users_to_create:
            u = db.query(User).filter(User.email == email).first()
            if not u:
                u = User(
                    id=uuid.uuid4(),
                    full_name=name,
                    email=email,
                    phone=phone,
                    password_hash=hash_password(pwd),
                    role=role,
                    is_active=True,
                    is_verified=True,
                    created_at=datetime.now(timezone.utc),
                    updated_at=datetime.now(timezone.utc)
                )
                db.add(u)
                db.flush()
            user_map[email] = u

        # 3. Doctors (Three Doctors)
        doctors_data = [
            ("Dr. Alice Walker", "dr.alice@medicore.com", "+1122334401", "DOC-REG-1001", "Cardiology", "MD, FACC", 12, Decimal("150.00"), "Cardiology"),
            ("Dr. Robert Chen", "dr.robert@medicore.com", "+1122334402", "DOC-REG-1002", "Neurology", "MD, DM Neurology", 15, Decimal("180.00"), "Neurology"),
            ("Dr. Grace Hopper", "dr.grace@medicore.com", "+1122334403", "DOC-REG-1003", "General Medicine", "MBBS, MD Internal Med", 8, Decimal("100.00"), "General Medicine"),
        ]

        doc_objs = []
        for name, email, phone, reg, spec, qual, exp, fee, d_name in doctors_data:
            u = db.query(User).filter(User.email == email).first()
            if not u:
                u = User(
                    id=uuid.uuid4(),
                    full_name=name,
                    email=email,
                    phone=phone,
                    password_hash=hash_password("Doctor@123"),
                    role=UserRole.DOCTOR,
                    is_active=True,
                    is_verified=True,
                    created_at=datetime.now(timezone.utc),
                    updated_at=datetime.now(timezone.utc)
                )
                db.add(u)
                db.flush()

            doc = db.query(Doctor).filter(Doctor.user_id == u.id).first()
            if not doc:
                doc = Doctor(
                    id=uuid.uuid4(),
                    user_id=u.id,
                    doctor_number=f"DOC-2026-000{len(doc_objs)+1}",
                    medical_registration_number=reg,
                    specialization=spec,
                    qualifications=qual,
                    experience_years=exp,
                    consultation_fee=fee,
                    department_id=dept_map[d_name].id,
                    availability_status="AVAILABLE",
                    status="ACTIVE",
                    created_at=datetime.now(timezone.utc),
                    updated_at=datetime.now(timezone.utc)
                )
                db.add(doc)
                db.flush()

                # Add weekly availability (Mon-Fri 09:00 to 17:00)
                for day in range(5):
                    avail = DoctorAvailability(
                        id=uuid.uuid4(),
                        doctor_id=doc.id,
                        day_of_week=day,
                        start_time=time(9, 0),
                        end_time=time(17, 0),
                        slot_duration_minutes=30,
                        is_available=True
                    )
                    db.add(avail)
            doc_objs.append(doc)

        # 4. Patients (Five Patients)
        patients_data = [
            ("John", "Doe", "john.doe@example.com", "+1987654301", date(1985, 5, 20), "MALE", "O+"),
            ("Jane", "Smith", "jane.smith@example.com", "+1987654302", date(1990, 8, 15), "FEMALE", "A+"),
            ("Carlos", "Santana", "carlos.s@example.com", "+1987654303", date(1978, 12, 1), "MALE", "B+"),
            ("Aisha", "Khan", "aisha.k@example.com", "+1987654304", date(1995, 3, 25), "FEMALE", "AB+"),
            ("Liam", "Wilson", "liam.w@example.com", "+1987654305", date(2000, 7, 10), "MALE", "O-"),
        ]

        patient_objs = []
        for fn, ln, email, phone, dob, gender, bg in patients_data:
            u = db.query(User).filter(User.email == email).first()
            if not u:
                u = User(
                    id=uuid.uuid4(),
                    full_name=f"{fn} {ln}",
                    email=email,
                    phone=phone,
                    password_hash=hash_password("Patient@123"),
                    role=UserRole.PATIENT,
                    is_active=True,
                    is_verified=True,
                    created_at=datetime.now(timezone.utc),
                    updated_at=datetime.now(timezone.utc)
                )
                db.add(u)
                db.flush()

            pat = db.query(Patient).filter(Patient.user_id == u.id).first()
            if not pat:
                pat = Patient(
                    id=uuid.uuid4(),
                    user_id=u.id,
                    patient_number=f"PAT-2026-0000{len(patient_objs)+1}",
                    first_name=fn,
                    last_name=ln,
                    date_of_birth=dob,
                    gender=gender,
                    blood_group=bg,
                    marital_status="SINGLE",
                    phone=phone,
                    email=email,
                    address="123 Hospital Lane",
                    city="Metro City",
                    state="State",
                    pincode="123456",
                    emergency_contact_name="Family Contact",
                    emergency_phone="+1987654399",
                    emergency_relationship="Spouse/Parent",
                    status="ACTIVE",
                    created_at=datetime.now(timezone.utc),
                    updated_at=datetime.now(timezone.utc)
                )
                db.add(pat)
                db.flush()
            patient_objs.append(pat)

        # 5. Medicines and Batches
        medicines_data = [
            ("MED-0001", "Paracetamol 500mg", "Acetaminophen", "Analgesic", "PharmaCorp", 50, Decimal("2.50"), Decimal("5.00"), [("B101", date(2027, 1, 1), 200)]),
            ("MED-0002", "Amoxicillin 250mg", "Amoxicillin", "Antibiotic", "BioHealth", 30, Decimal("8.00"), Decimal("15.00"), [("B202", date(2026, 12, 1), 150)]),
            ("MED-0003", "Atorvastatin 10mg", "Atorvastatin Calcium", "Cardiovascular", "HeartCare Ltd", 20, Decimal("12.00"), Decimal("22.00"), [("B303", date(2027, 6, 1), 80)]),
            ("MED-0004", "Metformin 500mg", "Metformin HCl", "Antidiabetic", "EndoCare", 40, Decimal("4.00"), Decimal("9.00"), [("B404", date(2027, 8, 1), 120)]),
            ("MED-0005", "Cetirizine 10mg", "Cetirizine Dihydrochloride", "Antihistamine", "AllergyPharm", 25, Decimal("1.50"), Decimal("4.00"), [("B505", date(2027, 5, 1), 100)]),
        ]

        med_objs = []
        for code, name, gen, cat, mfg, reorder, p_price, s_price, batches in medicines_data:
            med = db.query(Medicine).filter(Medicine.medicine_code == code).first()
            if not med:
                med = Medicine(
                    id=uuid.uuid4(),
                    medicine_code=code,
                    name=name,
                    generic_name=gen,
                    category=cat,
                    manufacturer=mfg,
                    reorder_level=reorder,
                    purchase_price=p_price,
                    selling_price=s_price,
                    storage_instructions="Store below 25°C in a dry place",
                    status="ACTIVE",
                    created_at=datetime.now(timezone.utc)
                )
                db.add(med)
                db.flush()

                for b_num, exp, qty in batches:
                    batch = MedicineBatch(
                        id=uuid.uuid4(),
                        medicine_id=med.id,
                        batch_number=b_num,
                        expiry_date=exp,
                        stock_quantity=qty,
                        purchase_price=p_price,
                        selling_price=s_price,
                        created_at=datetime.now(timezone.utc)
                    )
                    db.add(batch)
            med_objs.append(med)

        # 6. Appointments & Medical Records
        today = date.today()
        sample_appts = [
            (patient_objs[0], doc_objs[0], today, time(10, 0), time(10, 30), AppointmentStatus.CONFIRMED, "Routine cardiac follow-up"),
            (patient_objs[1], doc_objs[1], today, time(11, 0), time(11, 30), AppointmentStatus.CHECKED_IN, "Recurring migraines and dizziness"),
            (patient_objs[2], doc_objs[2], today, time(14, 0), time(14, 30), AppointmentStatus.PENDING, "Annual wellness exam"),
        ]

        for pat, doc, d, st, et, status_val, reason in sample_appts:
            existing_appt = db.query(Appointment).filter(
                Appointment.patient_id == pat.id,
                Appointment.doctor_id == doc.id,
                Appointment.appointment_date == d,
                Appointment.start_time == st
            ).first()

            if not existing_appt:
                appt = Appointment(
                    id=uuid.uuid4(),
                    appointment_number=f"APT-2026-{db.query(Appointment).count()+1:05d}",
                    patient_id=pat.id,
                    doctor_id=doc.id,
                    department_id=doc.department_id,
                    appointment_date=d,
                    start_time=st,
                    end_time=et,
                    appointment_type="GENERAL_CONSULTATION",
                    reason_for_visit=reason,
                    status=status_val,
                    created_at=datetime.now(timezone.utc),
                    updated_at=datetime.now(timezone.utc)
                )
                db.add(appt)
                db.flush()

                # Add sample invoice for confirmed/checked in appointments
                inv = Invoice(
                    id=uuid.uuid4(),
                    invoice_number=f"INV-2026-{db.query(Invoice).count()+1:05d}",
                    patient_id=pat.id,
                    appointment_id=appt.id,
                    subtotal=doc.consultation_fee,
                    discount=Decimal("0.00"),
                    tax=Decimal("0.00"),
                    total_amount=doc.consultation_fee,
                    paid_amount=Decimal("0.00"),
                    balance_amount=doc.consultation_fee,
                    payment_status="UNPAID",
                    created_at=datetime.now(timezone.utc),
                    updated_at=datetime.now(timezone.utc)
                )
                db.add(inv)
                db.flush()

                item = InvoiceItem(
                    id=uuid.uuid4(),
                    invoice_id=inv.id,
                    description=f"Doctor Consultation Fee - {doc.specialization}",
                    category="CONSULTATION",
                    quantity=1,
                    unit_price=doc.consultation_fee,
                    total_price=doc.consultation_fee
                )
                db.add(item)

        # 7. Sample Prescription
        pat0 = patient_objs[0]
        doc0 = doc_objs[0]
        rx = db.query(Prescription).filter(Prescription.patient_id == pat0.id).first()
        if not rx:
            rx = Prescription(
                id=uuid.uuid4(),
                prescription_number="RX-2026-00001",
                patient_id=pat0.id,
                doctor_id=doc0.id,
                status="ACTIVE",
                created_at=datetime.now(timezone.utc)
            )
            db.add(rx)
            db.flush()

            med0 = med_objs[0]
            rx_item = PrescriptionItem(
                id=uuid.uuid4(),
                prescription_id=rx.id,
                medicine_id=med0.id,
                medicine_name=med0.name,
                dosage="500mg",
                frequency="Twice daily after meals",
                duration=5,
                quantity=10,
                instructions="Take with a full glass of water"
            )
            db.add(rx_item)

        db.commit()
        print("SEED DATA SUCCESSFULLY APPLIED!")
    except Exception as e:
        db.rollback()
        print("Error seeding data:", e)
        raise e
    finally:
        db.close()

if __name__ == "__main__":
    seed()
