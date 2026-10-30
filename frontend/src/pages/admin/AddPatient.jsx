import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { patientService } from '../../services/patientService';
import { validatePatientForm } from '../../utils/validators';
import { BLOOD_GROUPS, GENDERS, MARITAL_STATUSES } from '../../utils/constants';
import { useNotificationContext } from '../../context/NotificationContext';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import Button from '../../components/common/Button';
import { ArrowLeft, Save, Calendar, RotateCcw, X } from 'lucide-react';

export const AddPatient = () => {
  const navigate = useNavigate();
  const { addToast } = useNotificationContext();

  const initialFormState = {
    first_name: '',
    last_name: '',
    dob: '',
    gender: 'Male',
    blood_group: 'O+',
    marital_status: 'Single',
    phone: '',
    email: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    emergency_name: '',
    emergency_phone: '',
    emergency_relation: 'Spouse',
    allergies: '',
  };

  const [formData, setFormData] = useState(initialFormState);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleReset = () => {
    setFormData(initialFormState);
    setErrors({});
    addToast('Patient registration form cleared', 'info');
  };

  const submitPatient = async (andBookAppointment = false) => {
    const formErrors = validatePatientForm(formData);
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      addToast('Please resolve the required highlighted form fields.', 'warning');
      return;
    }

    try {
      setSaving(true);
      const res = await patientService.createPatient(formData);
      if (res.success && res.data) {
        addToast('Patient registered successfully.', 'success');
        if (andBookAppointment) {
          navigate(`/admin/appointments/new?patient_id=${res.data.id}`);
        } else {
          navigate(`/admin/patients/${res.data.id}`);
        }
      }
    } catch (err) {
      addToast(err.message || 'Failed to register patient', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate('/admin/patients')}
            className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-slate-800 tracking-tight">Register New Patient</h1>
            <p className="text-xs text-slate-500">Create a permanent electronic medical record (EMR)</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            id="btn_reset_patient_form"
            variant="outline"
            size="sm"
            icon={RotateCcw}
            onClick={handleReset}
          >
            Reset Form
          </Button>
          <Button
            id="btn_cancel_patient"
            variant="ghost"
            size="sm"
            icon={X}
            onClick={() => navigate('/admin/patients')}
          >
            Cancel
          </Button>
        </div>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          submitPatient(false);
        }}
        className="space-y-6"
      >
        {/* Personal Information Card */}
        <div className="bg-white p-6 rounded-xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="border-b border-slate-100 pb-2">
            <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
              1. Personal Demographic Information
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <Input
              id="first_name"
              name="first_name"
              label="First Name"
              placeholder="e.g. Eleanor"
              value={formData.first_name}
              onChange={handleChange}
              error={errors.first_name}
              required
            />
            <Input
              id="last_name"
              name="last_name"
              label="Last Name"
              placeholder="e.g. Vance"
              value={formData.last_name}
              onChange={handleChange}
              error={errors.last_name}
              required
            />
            <Input
              id="dob"
              name="dob"
              type="date"
              label="Date of Birth"
              value={formData.dob}
              onChange={handleChange}
              error={errors.dob}
              required
            />
            <Select
              id="gender"
              name="gender"
              label="Gender"
              value={formData.gender}
              onChange={handleChange}
              options={GENDERS}
              required
            />
            <Select
              id="blood_group"
              name="blood_group"
              label="Blood Group"
              value={formData.blood_group}
              onChange={handleChange}
              options={BLOOD_GROUPS}
              required
            />
            <Select
              id="marital_status"
              name="marital_status"
              label="Marital Status"
              value={formData.marital_status}
              onChange={handleChange}
              options={MARITAL_STATUSES}
            />
          </div>
          <div className="pt-2">
            <Input
              id="allergies"
              name="allergies"
              label="Known Allergies (if any)"
              placeholder="e.g. Penicillin, Peanuts, Latex"
              value={formData.allergies}
              onChange={handleChange}
              helperText="Separated by commas; will appear as critical alerts during consultation"
            />
          </div>
        </div>

        {/* Contact Information Card */}
        <div className="bg-white p-6 rounded-xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="border-b border-slate-100 pb-2">
            <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
              2. Contact & Residential Details
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              id="phone"
              name="phone"
              type="tel"
              label="Primary Phone Number"
              placeholder="+1 555-019-2831"
              value={formData.phone}
              onChange={handleChange}
              error={errors.phone}
              required
            />
            <Input
              id="email"
              name="email"
              type="email"
              label="Email Address"
              placeholder="eleanor.vance@example.com"
              value={formData.email}
              onChange={handleChange}
              error={errors.email}
            />
          </div>
          <Input
            id="address"
            name="address"
            label="Street Address"
            placeholder="742 Evergreen Terrace"
            value={formData.address}
            onChange={handleChange}
          />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              id="city"
              name="city"
              label="City"
              placeholder="Springfield"
              value={formData.city}
              onChange={handleChange}
            />
            <Input
              id="state"
              name="state"
              label="State / Province"
              placeholder="IL"
              value={formData.state}
              onChange={handleChange}
            />
            <Input
              id="pincode"
              name="pincode"
              label="Pincode / Postal Code"
              placeholder="62704"
              value={formData.pincode}
              onChange={handleChange}
            />
          </div>
        </div>

        {/* Emergency Contact Information Card */}
        <div className="bg-white p-6 rounded-xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="border-b border-slate-100 pb-2">
            <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
              3. Emergency Contact Details
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              id="emergency_name"
              name="emergency_name"
              label="Emergency Contact Person"
              placeholder="e.g. Arthur Vance"
              value={formData.emergency_name}
              onChange={handleChange}
            />
            <Input
              id="emergency_phone"
              name="emergency_phone"
              type="tel"
              label="Emergency Phone"
              placeholder="+1 555-019-2832"
              value={formData.emergency_phone}
              onChange={handleChange}
            />
            <Input
              id="emergency_relation"
              name="emergency_relation"
              label="Relationship"
              placeholder="e.g. Spouse, Parent, Sibling"
              value={formData.emergency_relation}
              onChange={handleChange}
            />
          </div>
        </div>

        {/* Form Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Button
            id="btn_save_patient"
            type="submit"
            variant="teal"
            icon={Save}
            loading={saving}
          >
            Save Patient
          </Button>

          <Button
            id="btn_save_and_book"
            type="button"
            variant="primary"
            icon={Calendar}
            loading={saving}
            onClick={() => submitPatient(true)}
          >
            Save & Book Appointment
          </Button>
        </div>
      </form>
    </div>
  );
};

export default AddPatient;

