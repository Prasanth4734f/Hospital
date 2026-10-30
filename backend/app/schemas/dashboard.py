from decimal import Decimal
from pydantic import BaseModel

class AdminDashboardStats(BaseModel):
    total_patients: int
    total_doctors: int
    today_appointments: int
    pending_appointments: int
    completed_consultations: int
    total_revenue: Decimal

class DoctorDashboardStats(BaseModel):
    today_appointments: int
    pending_consultations: int
    completed_consultations: int
    assigned_patients: int

class ReceptionistDashboardStats(BaseModel):
    today_appointments: int
    registered_patients: int
    pending_checkins: int
    pending_appointments: int

class PharmacistDashboardStats(BaseModel):
    total_medicines: int
    low_stock_medicines: int
    expiring_batches: int
    today_dispensing_count: int

class PatientDashboardStats(BaseModel):
    upcoming_appointments: int
    completed_appointments: int
    pending_payments: Decimal
    prescriptions_count: int
