import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../../services/authService';
import { useNotificationContext } from '../../context/NotificationContext';
import { BLOOD_GROUPS, GENDERS } from '../../utils/constants';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import Button from '../../components/common/Button';
import { Mail, Lock, User, Phone, Calendar } from 'lucide-react';

export const Register = () => {
  const { addToast } = useNotificationContext();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    dob: '',
    gender: 'Female',
    blood_group: 'O+',
    password: '',
    confirm_password: '',
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!formData.first_name.trim()) newErrors.first_name = 'First name is required';
    if (!formData.last_name.trim()) newErrors.last_name = 'Last name is required';
    if (!formData.email.trim()) newErrors.email = 'Email address is required';
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
    if (!formData.dob) newErrors.dob = 'Date of birth is required';
    if (formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters';
    if (formData.password !== formData.confirm_password) newErrors.confirm_password = 'Passwords do not match';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      setLoading(true);
      const res = await authService.register(formData);
      if (res.success) {
        addToast('Patient registration complete! Please sign in with your credentials.', 'success');
        navigate('/login');
      }
    } catch (err) {
      addToast(err.message || 'Registration failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-5 text-center">
        <h2 className="text-xl font-bold text-slate-800 tracking-tight">Patient Portal Registration</h2>
        <p className="text-xs text-slate-500 mt-1">
          Create an account to manage appointments, prescriptions, and medical records
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3.5">
        <div className="grid grid-cols-2 gap-3">
          <Input
            id="first_name"
            name="first_name"
            label="First Name"
            placeholder="John"
            value={formData.first_name}
            onChange={handleChange}
            error={errors.first_name}
            required
          />
          <Input
            id="last_name"
            name="last_name"
            label="Last Name"
            placeholder="Doe"
            value={formData.last_name}
            onChange={handleChange}
            error={errors.last_name}
            required
          />
        </div>

        <Input
          id="email"
          name="email"
          type="email"
          label="Email Address"
          placeholder="john.doe@example.com"
          value={formData.email}
          onChange={handleChange}
          error={errors.email}
          icon={Mail}
          required
        />

        <div className="grid grid-cols-2 gap-3">
          <Input
            id="phone"
            name="phone"
            type="tel"
            label="Phone"
            placeholder="+1 555-0192"
            value={formData.phone}
            onChange={handleChange}
            error={errors.phone}
            icon={Phone}
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
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Select
            id="gender"
            name="gender"
            label="Gender"
            value={formData.gender}
            onChange={handleChange}
            options={GENDERS}
          />
          <Select
            id="blood_group"
            name="blood_group"
            label="Blood Group"
            value={formData.blood_group}
            onChange={handleChange}
            options={BLOOD_GROUPS}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Input
            id="password"
            name="password"
            type="password"
            label="Password"
            placeholder="••••••"
            value={formData.password}
            onChange={handleChange}
            error={errors.password}
            icon={Lock}
            required
          />
          <Input
            id="confirm_password"
            name="confirm_password"
            type="password"
            label="Confirm Password"
            placeholder="••••••"
            value={formData.confirm_password}
            onChange={handleChange}
            error={errors.confirm_password}
            icon={Lock}
            required
          />
        </div>

        <div className="pt-2">
          <Button type="submit" variant="teal" className="w-full" loading={loading}>
            Create Patient Account
          </Button>
        </div>
      </form>

      <div className="mt-4 text-center text-xs text-slate-500">
        Already registered?{' '}
        <Link to="/login" className="text-teal-600 hover:text-teal-700 font-semibold">
          Sign In
        </Link>
      </div>
    </div>
  );
};

export default Register;

