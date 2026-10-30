import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useNotificationContext } from '../../context/NotificationContext';
import { ROLE_REDIRECTS } from '../../utils/constants';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import { Mail, Lock, Eye, EyeOff, ShieldCheck } from 'lucide-react';

export const Login = () => {
  const { login } = useAuth();
  const { addToast } = useNotificationContext();
  const navigate = useNavigate();

  const [email, setEmail] = useState('admin@medicore.com');
  const [password, setPassword] = useState('password123');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password) {
      setError('Please enter both email and password.');
      return;
    }

    try {
      setLoading(true);
      const res = await login({ email, password });
      if (res.success && res.user) {
        addToast(`Welcome back, ${res.user.full_name}!`, 'success');
        const targetPath = ROLE_REDIRECTS[res.user.role] || '/admin/dashboard';
        navigate(targetPath, { replace: true });
      } else {
        setError(res.message || 'Login failed. Please check your credentials.');
      }
    } catch (err) {
      setError(err.message || 'Authentication failed. Please verify credentials.');
      addToast(err.message || 'Authentication error', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleRoleQuickSelect = (roleEmail) => {
    setEmail(roleEmail);
    setPassword('password123');
  };

  return (
    <div>
      <div className="mb-6 text-center">
        <h2 className="text-xl font-bold text-slate-800 tracking-tight">Welcome Back</h2>
        <p className="text-xs text-slate-500 mt-1">
          Access your clinical workspace and patient records
        </p>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Email */}
        <Input
          id="email"
          name="email"
          type="email"
          label="Email Address"
          placeholder="name@medicore.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          icon={Mail}
          required
        />

        {/* Password */}
        <Input
          id="password"
          name="password"
          type={showPassword ? 'text' : 'password'}
          label="Password"
          placeholder="••••••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          icon={Lock}
          required
          rightElement={
            <button
              id="show_password"
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="text-slate-400 hover:text-slate-600 focus:outline-none"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          }
        />

        {/* Remember me & Forgot Password */}
        <div className="flex items-center justify-between text-xs">
          <label className="flex items-center gap-2 text-slate-600 cursor-pointer">
            <input
              id="remember_me"
              name="remember_me"
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="rounded border-slate-300 text-teal-600 focus:ring-teal-500 w-4 h-4"
            />
            <span>Remember me</span>
          </label>
          <Link
            to="/forgot-password"
            className="text-teal-600 hover:text-teal-700 font-semibold transition-colors"
          >
            Forgot Password?
          </Link>
        </div>

        {/* Sign In Button */}
        <Button
          id="btn_sign_in"
          type="submit"
          variant="primary"
          className="w-full"
          loading={loading}
        >
          Sign In
        </Button>
      </form>

      {/* Quick Demo Switcher */}
      <div className="mt-6 pt-5 border-t border-slate-100">
        <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2 text-center">
          Instant Role Preview (Demo)
        </p>
        <div className="grid grid-cols-2 gap-1.5 text-[11px]">
          <button
            type="button"
            onClick={() => handleRoleQuickSelect('admin@medicore.com')}
            className="py-1 px-2 text-left rounded bg-slate-50 hover:bg-teal-50 hover:text-teal-700 border border-slate-200 transition-colors"
          >
            🏥 <strong>Admin</strong>
          </button>
          <button
            type="button"
            onClick={() => handleRoleQuickSelect('doctor@medicore.com')}
            className="py-1 px-2 text-left rounded bg-slate-50 hover:bg-teal-50 hover:text-teal-700 border border-slate-200 transition-colors"
          >
            🩺 <strong>Doctor</strong>
          </button>
          <button
            type="button"
            onClick={() => handleRoleQuickSelect('reception@medicore.com')}
            className="py-1 px-2 text-left rounded bg-slate-50 hover:bg-teal-50 hover:text-teal-700 border border-slate-200 transition-colors"
          >
            📋 <strong>Receptionist</strong>
          </button>
          <button
            type="button"
            onClick={() => handleRoleQuickSelect('pharmacy@medicore.com')}
            className="py-1 px-2 text-left rounded bg-slate-50 hover:bg-teal-50 hover:text-teal-700 border border-slate-200 transition-colors"
          >
            💊 <strong>Pharmacist</strong>
          </button>
          <button
            type="button"
            onClick={() => handleRoleQuickSelect('patient@medicore.com')}
            className="py-1 px-2 text-left col-span-2 rounded bg-slate-50 hover:bg-teal-50 hover:text-teal-700 border border-slate-200 transition-colors"
          >
            🧑‍🦱 <strong>Patient Portal</strong> (Eleanor Vance)
          </button>
        </div>
      </div>

      {/* Create Patient Account */}
      <div className="mt-6 text-center text-xs text-slate-500">
        Don&apos;t have a patient account?{' '}
        <Link to="/register" className="text-teal-600 hover:text-teal-700 font-semibold">
          Create Account
        </Link>
      </div>
    </div>
  );
};

export default Login;

