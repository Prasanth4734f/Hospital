/**
 * Validation helpers for MediCore forms
 */

export const isValidEmail = (email) => {
  if (!email) return false;
  const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return re.test(String(email).trim().toLowerCase());
};

export const isValidPhone = (phone) => {
  if (!phone) return false;
  // Allows 10-15 digits with optional + at start
  const re = /^\+?[0-9]{10,15}$/;
  return re.test(String(phone).replace(/[\s-]/g, ''));
};

export const isNotEmpty = (val) => {
  if (val === null || val === undefined) return false;
  if (typeof val === 'string') return val.trim().length > 0;
  if (Array.isArray(val)) return val.length > 0;
  return true;
};

export const isValidPassword = (password) => {
  return typeof password === 'string' && password.length >= 6;
};

export const validatePatientForm = (data) => {
  const errors = {};
  if (!isNotEmpty(data.first_name)) errors.first_name = 'First name is required';
  if (!isNotEmpty(data.last_name)) errors.last_name = 'Last name is required';
  if (!isNotEmpty(data.dob)) errors.dob = 'Date of birth is required';
  if (!isNotEmpty(data.gender)) errors.gender = 'Gender is required';
  if (!isNotEmpty(data.phone)) {
    errors.phone = 'Phone number is required';
  } else if (!isValidPhone(data.phone)) {
    errors.phone = 'Enter a valid phone number (10-15 digits)';
  }
  if (data.email && !isValidEmail(data.email)) {
    errors.email = 'Enter a valid email address';
  }
  return errors;
};

export const validateDoctorForm = (data) => {
  const errors = {};
  if (!isNotEmpty(data.full_name)) errors.full_name = 'Doctor name is required';
  if (!isNotEmpty(data.email)) {
    errors.email = 'Email address is required';
  } else if (!isValidEmail(data.email)) {
    errors.email = 'Enter a valid email address';
  }
  if (!isNotEmpty(data.phone)) {
    errors.phone = 'Phone number is required';
  } else if (!isValidPhone(data.phone)) {
    errors.phone = 'Enter a valid phone number';
  }
  if (!isNotEmpty(data.medical_reg_no)) errors.medical_reg_no = 'Medical registration number is required';
  if (!isNotEmpty(data.specialization)) errors.specialization = 'Specialization is required';
  if (!isNotEmpty(data.department)) errors.department = 'Department is required';
  if (!data.consultation_fee || Number(data.consultation_fee) < 0) {
    errors.consultation_fee = 'Valid consultation fee is required';
  }
  return errors;
};

export const validateAppointmentForm = (data) => {
  const errors = {};
  if (!isNotEmpty(data.patient_id)) errors.patient_id = 'Patient selection is required';
  if (!isNotEmpty(data.doctor_id)) errors.doctor_id = 'Doctor selection is required';
  if (!isNotEmpty(data.appointment_date)) errors.appointment_date = 'Date is required';
  if (!isNotEmpty(data.time_slot)) errors.time_slot = 'Time slot is required';
  if (!isNotEmpty(data.appointment_type)) errors.appointment_type = 'Appointment type is required';
  return errors;
};

export const validateMedicineForm = (data) => {
  const errors = {};
  if (!isNotEmpty(data.name)) errors.name = 'Medicine name is required';
  if (!isNotEmpty(data.category)) errors.category = 'Category is required';
  if (!isNotEmpty(data.batch_number)) errors.batch_number = 'Batch number is required';
  if (!isNotEmpty(data.expiry_date)) errors.expiry_date = 'Expiry date is required';
  if (data.stock === undefined || Number(data.stock) < 0) errors.stock = 'Valid stock quantity is required';
  if (data.unit_price === undefined || Number(data.unit_price) <= 0) errors.unit_price = 'Valid unit price is required';
  return errors;
};

