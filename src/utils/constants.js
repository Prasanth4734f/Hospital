export const ROLES = {
  SUPER_ADMIN: 'SUPER_ADMIN',
  HOSPITAL_ADMIN: 'HOSPITAL_ADMIN',
  DOCTOR: 'DOCTOR',
  RECEPTIONIST: 'RECEPTIONIST',
  PHARMACIST: 'PHARMACIST',
  PATIENT: 'PATIENT',
};

export const ROLE_REDIRECTS = {
  SUPER_ADMIN: '/admin/dashboard',
  HOSPITAL_ADMIN: '/admin/dashboard',
  DOCTOR: '/doctor/dashboard',
  RECEPTIONIST: '/reception/dashboard',
  PHARMACIST: '/pharmacy/dashboard',
  PATIENT: '/patient/dashboard',
};

export const APPOINTMENT_STATUS = {
  PENDING: 'Pending',
  CONFIRMED: 'Confirmed',
  CHECKED_IN: 'Checked In',
  IN_PROGRESS: 'In Progress',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
  NO_SHOW: 'No Show',
};

export const PAYMENT_STATUS = {
  PAID: 'Paid',
  PENDING: 'Pending',
  OVERDUE: 'Overdue',
  PARTIAL: 'Partial',
  CANCELLED: 'Cancelled',
};

export const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export const GENDERS = ['Male', 'Female', 'Other'];

export const MARITAL_STATUSES = ['Single', 'Married', 'Divorced', 'Widowed'];

export const DEPARTMENTS = [
  'General Medicine',
  'Cardiology',
  'Orthopedics',
  'Pediatrics',
  'Neurology',
  'Dermatology',
  'Gynecology',
  'Ophthalmology',
  'ENT',
  'Oncology'
];

export const MEDICINE_CATEGORIES = [
  'Antibiotic',
  'Analgesic',
  'Antipyretic',
  'Antihypertensive',
  'Antidiabetic',
  'Antihistamine',
  'Vitamin & Supplement',
  'Cardiovascular',
  'Respiratory'
];

export const DOSAGE_FREQUENCIES = [
  'Once daily (OD)',
  'Twice daily (BD)',
  'Thrice daily (TDS)',
  'Four times daily (QID)',
  'As needed (PRN)',
  'Every 8 hours',
  'Every 12 hours'
];

export const DOSAGE_ROUTES = [
  'Oral',
  'Intravenous (IV)',
  'Intramuscular (IM)',
  'Subcutaneous',
  'Topical',
  'Inhalation',
  'Sublingual'
];

