import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { authService } from '../../services/authService';
import { useNotificationContext } from '../../context/NotificationContext';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import { Mail, ArrowLeft, CheckCircle2 } from 'lucide-react';

export const ForgotPassword = () => {
  const { addToast } = useNotificationContext();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;

    try {
      setLoading(true);
      const res = await authService.forgotPassword(email);
      if (res.success) {
        setSubmitted(true);
        addToast(res.message, 'success');
      }
    } catch (err) {
      addToast(err.message || 'Failed to submit reset request', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-6 text-center">
        <h2 className="text-xl font-bold text-slate-800 tracking-tight">Forgot Password</h2>
        <p className="text-xs text-slate-500 mt-1">
          Enter your registered MediCore email to receive recovery instructions
        </p>
      </div>

      {submitted ? (
        <div className="p-4 bg-teal-50 border border-teal-200 rounded-xl text-center space-y-3">
          <div className="w-10 h-10 rounded-full bg-teal-100 text-teal-600 mx-auto flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <p className="text-sm font-semibold text-slate-800">Check your inbox</p>
          <p className="text-xs text-slate-600">
            We have dispatched password recovery instructions to <span className="font-semibold">{email}</span>.
          </p>
          <div className="pt-2">
            <Link to="/reset-password?token=mock_reset_token">
              <Button variant="teal" size="sm" className="w-full">
                Proceed to Reset Password
              </Button>
            </Link>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            id="email"
            name="email"
            type="email"
            label="Registered Email"
            placeholder="name@medicore.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            icon={Mail}
            required
          />

          <Button type="submit" variant="primary" className="w-full" loading={loading}>
            Send Reset Instructions
          </Button>
        </form>
      )}

      <div className="mt-6 text-center">
        <Link
          to="/login"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-teal-600 hover:text-teal-700"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Sign In</span>
        </Link>
      </div>
    </div>
  );
};

export default ForgotPassword;

