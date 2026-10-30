import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useNotificationContext } from '../../context/NotificationContext';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import { User, Save } from 'lucide-react';

export const PharmacistProfile = () => {
  const { user, updateUser } = useAuth();
  const { addToast } = useNotificationContext();

  const [form, setForm] = useState({
    full_name: user?.full_name || 'Alex Morgan',
    email: user?.email || 'pharmacy@medicore.com',
    phone: '+1 555-019-4491',
    department: 'Central Hospital Dispensary',
  });

  const [saving, setSaving] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSaving(true);
    setTimeout(() => {
      updateUser(form);
      setSaving(false);
      addToast('Pharmacist profile saved', 'success');
    }, 400);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Pharmacist Profile</h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Registered dispensary personnel credentials
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
              label="Email"
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />
            <Input
              label="Phone"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              required
            />
          </div>
          <Input
            label="Department"
            value={form.department}
            onChange={(e) => setForm({ ...form, department: e.target.value })}
          />

          <div className="pt-3 border-t flex justify-end">
            <Button type="submit" variant="teal" size="sm" icon={Save} loading={saving}>
              Save Profile
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PharmacistProfile;

