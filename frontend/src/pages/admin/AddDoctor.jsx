import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { doctorService } from '../../services/doctorService';
import { validateDoctorForm } from '../../utils/validators';
import { DEPARTMENTS } from '../../utils/constants';
import { useNotificationContext } from '../../context/NotificationContext';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import Button from '../../components/common/Button';
import { ArrowLeft, Save, RotateCcw, X, Clock } from 'lucide-react';

export const AddDoctor = () => {
  const navigate = useNavigate();
  const { addToast } = useNotificationContext();

  const initialFormState = {
    full_name: '',
    email: '',
    phone: '',
    medical_reg_no: '',
    specialization: 'Cardiology',
    department: 'Cardiology',
    qualifications: '',
    experience: 5,
    consultation_fee: 100,
    profile_photo: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=300',
    available_days: ['Monday', 'Wednesday', 'Friday'],
    available_time: '09:00 AM - 02:00 PM',
  };

  const [formData, setFormData] = useState(initialFormState);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
      ...(name === 'specialization' ? { department: value } : {}),
    }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const toggleDay = (day) => {
    setFormData((prev) => {
      const exists = prev.available_days.includes(day);
      return {
        ...prev,
        available_days: exists
          ? prev.available_days.filter((d) => d !== day)
          : [...prev.available_days, day],
      };
    });
  };

  const handleReset = () => {
    setFormData(initialFormState);
    setErrors({});
    addToast('Doctor onboarding form reset', 'info');
  };

  const submitDoctor = async (navigateToProfile = false) => {
    const formErrors = validateDoctorForm(formData);
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      addToast('Please complete all required fields.', 'warning');
      return;
    }

    try {
      setSaving(true);
      const res = await doctorService.createDoctor(formData);
      if (res.success && res.data) {
        addToast('Doctor added successfully.', 'success');
        if (navigateToProfile) {
          navigate(`/admin/doctors/${res.data.id}`);
        } else {
          navigate('/admin/doctors');
        }
      }
    } catch (err) {
      addToast(err.message || 'Failed to create doctor', 'error');
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
            onClick={() => navigate('/admin/doctors')}
            className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-slate-800 tracking-tight">Onboard New Doctor</h1>
            <p className="text-xs text-slate-500">Register credentials, specialization, and consultation schedule</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            id="btn_reset_doctor_form"
            variant="outline"
            size="sm"
            icon={RotateCcw}
            onClick={handleReset}
          >
            Reset Form
          </Button>
          <Button
            id="btn_cancel_doctor"
            variant="ghost"
            size="sm"
            icon={X}
            onClick={() => navigate('/admin/doctors')}
          >
            Cancel
          </Button>
        </div>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          submitDoctor(false);
        }}
        className="space-y-6"
      >
        {/* Credentials & Identity */}
        <div className="bg-white p-6 rounded-xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="border-b border-slate-100 pb-2">
            <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
              1. Professional Identity & Contact
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              id="full_name"
              name="full_name"
              label="Doctor Full Name"
              placeholder="e.g. Dr. Sarah Jenkins"
              value={formData.full_name}
              onChange={handleChange}
              error={errors.full_name}
              required
            />
            <Input
              id="medical_reg_no"
              name="medical_reg_no"
              label="Medical Registration / License No."
              placeholder="e.g. MED-REG-84920"
              value={formData.medical_reg_no}
              onChange={handleChange}
              error={errors.medical_reg_no}
              required
            />
            <Input
              id="email"
              name="email"
              type="email"
              label="Professional Email"
              placeholder="sarah.jenkins@medicore.com"
              value={formData.email}
              onChange={handleChange}
              error={errors.email}
              required
            />
            <Input
              id="phone"
              name="phone"
              type="tel"
              label="Contact Phone"
              placeholder="+1 555-442-1001"
              value={formData.phone}
              onChange={handleChange}
              error={errors.phone}
              required
            />
          </div>
        </div>

        {/* Clinical Qualifications */}
        <div className="bg-white p-6 rounded-xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="border-b border-slate-100 pb-2">
            <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
              2. Specialization, Department & Rates
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Select
              id="specialization"
              name="specialization"
              label="Clinical Specialization"
              value={formData.specialization}
              onChange={handleChange}
              options={DEPARTMENTS}
              required
            />
            <Input
              id="experience"
              name="experience"
              type="number"
              min="0"
              label="Years of Experience"
              value={formData.experience}
              onChange={handleChange}
              required
            />
            <Input
              id="consultation_fee"
              name="consultation_fee"
              type="number"
              min="0"
              step="5"
              label="Consultation Fee ($)"
              value={formData.consultation_fee}
              onChange={handleChange}
              error={errors.consultation_fee}
              required
            />
          </div>
          <Input
            id="qualifications"
            name="qualifications"
            label="Degrees & Certifications"
            placeholder="e.g. MBBS, MD (Cardiology), FACC Harvard"
            value={formData.qualifications}
            onChange={handleChange}
          />
          <Input
            id="profile_photo"
            name="profile_photo"
            label="Profile Image URL"
            value={formData.profile_photo}
            onChange={handleChange}
            helperText="Enter a valid image URL for the doctor's roster avatar"
          />
        </div>

        {/* Availability Schedule */}
        <div className="bg-white p-6 rounded-xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="border-b border-slate-100 pb-2">
            <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
              3. Initial Duty Schedule
            </h2>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
              Available Days
            </label>
            <div className="flex flex-wrap gap-2">
              {daysOfWeek.map((day) => {
                const isSelected = formData.available_days.includes(day);
                return (
                  <button
                    key={day}
                    type="button"
                    onClick={() => toggleDay(day)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                      isSelected
                        ? 'bg-teal-600 text-white border-teal-600 shadow-xs'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {day}
                  </button>
                );
              })}
            </div>
          </div>
          <Input
            id="available_time"
            name="available_time"
            label="Available Consultation Hours"
            value={formData.available_time}
            onChange={handleChange}
            placeholder="09:00 AM - 02:00 PM"
          />
        </div>

        {/* Form Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Button
            id="btn_save_doctor"
            type="submit"
            variant="primary"
            icon={Save}
            loading={saving}
          >
            Save Doctor
          </Button>

          <Button
            id="btn_save_and_set_availability"
            type="button"
            variant="teal"
            icon={Clock}
            loading={saving}
            onClick={() => submitDoctor(true)}
          >
            Save & View Doctor Profile
          </Button>
        </div>
      </form>
    </div>
  );
};

export default AddDoctor;

