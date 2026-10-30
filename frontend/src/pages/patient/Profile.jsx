import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useNotificationContext } from '../../context/NotificationContext';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import { User, Save } from 'lucide-react';

export const PatientProfile = () => {
  const { user, updateUser } = useAuth();
  const { addToast } = useNotificationContext();

  const [form, setForm] = useState({
    full_name: user?.full_name || 'Eleanor Vance',
    email: user?.email || 'patient@medicore.com',
    phone: '+1 555-019-2831',
    address: '742 Evergreen Terrace, Springfield, IL',
    emergency_name: 'Arthur Vance',
    emergency_phone: '+1 555-019-2832',
  });

  const [saving, setSaving] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSaving(true);
    setTimeout(() => {
      updateUser(form);
      setSaving(false);
      addToast('Patient personal profile updated successfully', 'success');
    }, 400);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Patient Personal Profile</h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Manage your personal contact details and emergency contact
        </p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200/80 p-6 shadow-xs">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Full Name"
            value={form.full_name}
            onChange={(e) => setForm({ ...form, full_name: e.target.value })}
            required
          />
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Email Address"
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />
            <Input
              label="Phone Number"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              required
            />
          </div>
          <Input
            label="Home Address"
            value={form.address}
            onChange={(e) => setForm({ ...form, address: e.target.value })}
          />

          <div className="pt-2 border-t border-slate-100">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
              Emergency Contact
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Contact Name"
                value={form.emergency_name}
                onChange={(e) => setForm({ ...form, emergency_name: e.target.value })}
              />
              <Input
                label="Contact Phone"
                value={form.emergency_phone}
                onChange={(e) => setForm({ ...form, emergency_phone: e.target.value })}
              />
            </div>
          </div>

          <div className="pt-3 border-t flex justify-end">
            <Button
              id="btn_update_profile"
              type="submit"
              variant="teal"
              size="sm"
              icon={Save}
              loading={saving}
            >
              Update Profile
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PatientProfile;

