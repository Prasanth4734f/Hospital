import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useNotificationContext } from '../../context/NotificationContext';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import { Save, RotateCcw, Lock, Building, User, Upload, Trash2 } from 'lucide-react';

export const Settings = () => {
  const { user, updateUser } = useAuth();
  const { addToast } = useNotificationContext();

  // Account Settings Form
  const [accountForm, setAccountForm] = useState({
    full_name: user?.full_name || 'Dr. Gregory House',
    email: user?.email || 'admin@medicore.com',
    phone: '+1 555-019-1100',
    avatar: user?.avatar || 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=150',
  });

  // Security Form
  const [securityForm, setSecurityForm] = useState({
    current_password: '',
    new_password: '',
    confirm_password: '',
  });

  // Hospital Settings Form
  const [hospitalForm, setHospitalForm] = useState({
    hospital_name: 'MediCore Central Memorial Hospital',
    hospital_address: '100 Medical Center Boulevard, Suite 500, New York, NY 10001',
    contact_number: '+1 800-MEDICORE',
    email: 'contact@medicore.hospital.org',
    registration_number: 'HOSP-REG-NY-883921',
    logo: '/logo.png',
  });

  const [savingAccount, setSavingAccount] = useState(false);
  const [savingSecurity, setSavingSecurity] = useState(false);
  const [savingHospital, setSavingHospital] = useState(false);

  const handleSaveAccount = (e) => {
    e.preventDefault();
    setSavingAccount(true);
    setTimeout(() => {
      updateUser(accountForm);
      setSavingAccount(false);
      addToast('Profile account settings saved successfully', 'success');
    }, 400);
  };

  const handleResetAccount = () => {
    setAccountForm({
      full_name: user?.full_name || '',
      email: user?.email || '',
      phone: '+1 555-019-1100',
      avatar: user?.avatar || '',
    });
    addToast('Account changes reset', 'info');
  };

  const handleChangePassword = (e) => {
    e.preventDefault();
    if (!securityForm.current_password) {
      addToast('Please enter your current password.', 'warning');
      return;
    }
    if (securityForm.new_password.length < 6) {
      addToast('New password must be at least 6 characters.', 'warning');
      return;
    }
    if (securityForm.new_password !== securityForm.confirm_password) {
      addToast('Passwords do not match.', 'error');
      return;
    }
    setSavingSecurity(true);
    setTimeout(() => {
      setSavingSecurity(false);
      setSecurityForm({ current_password: '', new_password: '', confirm_password: '' });
      addToast('Security password updated successfully', 'success');
    }, 500);
  };

  const handleSaveHospital = (e) => {
    e.preventDefault();
    setSavingHospital(true);
    setTimeout(() => {
      setSavingHospital(false);
      addToast('Hospital institution profile updated successfully', 'success');
    }, 400);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800 tracking-tight">System Settings & Configurations</h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Manage clinical administrative credentials, security parameters, and facility profile
        </p>
      </div>

      {/* 1. Account Settings */}
      <div className="bg-white rounded-xl border border-slate-200/80 p-6 shadow-xs space-y-5">
        <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
          <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center">
            <User className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Account Settings</h2>
            <p className="text-xs text-slate-400">Personal administrative contact and identification</p>
          </div>
        </div>

        <form onSubmit={handleSaveAccount} className="space-y-4">
          <div className="flex items-center gap-4">
            <img
              src={accountForm.avatar || 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=150'}
              alt="Profile"
              className="w-16 h-16 rounded-full object-cover border-2 border-teal-500 shadow-xs"
            />
            <div className="space-y-1">
              <span className="text-xs font-semibold text-slate-700">Profile Picture</span>
              <p className="text-[11px] text-slate-400">PNG, JPG or WebP up to 5MB</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Full Name"
              value={accountForm.full_name}
              onChange={(e) => setAccountForm({ ...accountForm, full_name: e.target.value })}
              required
            />
            <Input
              label="Email Address"
              type="email"
              value={accountForm.email}
              onChange={(e) => setAccountForm({ ...accountForm, email: e.target.value })}
              required
            />
            <Input
              label="Contact Phone"
              value={accountForm.phone}
              onChange={(e) => setAccountForm({ ...accountForm, phone: e.target.value })}
            />
            <Input
              label="Avatar Image URL"
              value={accountForm.avatar}
              onChange={(e) => setAccountForm({ ...accountForm, avatar: e.target.value })}
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
            <Button
              id="btn_reset_changes"
              type="button"
              variant="outline"
              size="sm"
              icon={RotateCcw}
              onClick={handleResetAccount}
            >
              Reset Changes
            </Button>
            <Button
              id="btn_save_changes"
              type="submit"
              variant="teal"
              size="sm"
              icon={Save}
              loading={savingAccount}
            >
              Save Changes
            </Button>
          </div>
        </form>
      </div>

      {/* 2. Security Settings */}
      <div className="bg-white rounded-xl border border-slate-200/80 p-6 shadow-xs space-y-5">
        <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Lock className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Security & Credentials</h2>
            <p className="text-xs text-slate-400">Manage authorization password and session tokens</p>
          </div>
        </div>

        <form onSubmit={handleChangePassword} className="space-y-4">
          <Input
            label="Current Password"
            type="password"
            placeholder="••••••••••••"
            value={securityForm.current_password}
            onChange={(e) => setSecurityForm({ ...securityForm, current_password: e.target.value })}
            required
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="New Password"
              type="password"
              placeholder="••••••••••••"
              value={securityForm.new_password}
              onChange={(e) => setSecurityForm({ ...securityForm, new_password: e.target.value })}
              required
            />
            <Input
              label="Confirm New Password"
              type="password"
              placeholder="••••••••••••"
              value={securityForm.confirm_password}
              onChange={(e) => setSecurityForm({ ...securityForm, confirm_password: e.target.value })}
              required
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
            <Button
              id="btn_cancel_password_change"
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setSecurityForm({ current_password: '', new_password: '', confirm_password: '' })}
            >
              Cancel
            </Button>
            <Button
              id="btn_change_password"
              type="submit"
              variant="primary"
              size="sm"
              loading={savingSecurity}
            >
              Change Password
            </Button>
          </div>
        </form>
      </div>

      {/* 3. Hospital Settings */}
      <div className="bg-white rounded-xl border border-slate-200/80 p-6 shadow-xs space-y-5">
        <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
          <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center">
            <Building className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Hospital Facility Profile</h2>
            <p className="text-xs text-slate-400">Official institution details rendered on prescriptions and invoices</p>
          </div>
        </div>

        <form onSubmit={handleSaveHospital} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Hospital Name"
              value={hospitalForm.hospital_name}
              onChange={(e) => setHospitalForm({ ...hospitalForm, hospital_name: e.target.value })}
              required
            />
            <Input
              label="Registration / Healthcare Facility License No."
              value={hospitalForm.registration_number}
              onChange={(e) => setHospitalForm({ ...hospitalForm, registration_number: e.target.value })}
              required
            />
            <Input
              label="Official Contact Number"
              value={hospitalForm.contact_number}
              onChange={(e) => setHospitalForm({ ...hospitalForm, contact_number: e.target.value })}
              required
            />
            <Input
              label="Official Email"
              type="email"
              value={hospitalForm.email}
              onChange={(e) => setHospitalForm({ ...hospitalForm, email: e.target.value })}
              required
            />
          </div>

          <Input
            label="Facility Physical Address"
            value={hospitalForm.hospital_address}
            onChange={(e) => setHospitalForm({ ...hospitalForm, hospital_address: e.target.value })}
            required
          />

          <div className="flex items-center justify-between pt-2 border-t border-slate-100">
            <div className="flex items-center gap-2">
              <Button
                id="btn_upload_logo"
                type="button"
                variant="outline"
                size="sm"
                icon={Upload}
                onClick={() => addToast('Logo uploaded to MediCore media assets', 'success')}
              >
                Upload Logo
              </Button>
              <Button
                id="btn_remove_logo"
                type="button"
                variant="ghost"
                size="sm"
                icon={Trash2}
                onClick={() => addToast('Logo reset to default mark', 'info')}
              >
                Remove
              </Button>
            </div>

            <Button
              id="btn_save_hospital_details"
              type="submit"
              variant="teal"
              size="sm"
              icon={Save}
              loading={savingHospital}
            >
              Save Hospital Details
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Settings;

