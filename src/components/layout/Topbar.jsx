import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useNotificationContext } from '../../context/NotificationContext';
import { isMockMode } from '../../services/api';
import Modal from '../common/Modal';
import Button from '../common/Button';
import {
  Menu,
  Bell,
  HelpCircle,
  Search,
  User,
  Settings,
  LogOut,
  ChevronDown,
  Sparkles,
  Server,
  HeartPulse,
} from 'lucide-react';

export const Topbar = ({ onToggleSidebar }) => {
  const { user, role, logout } = useAuth();
  const { unreadCount } = useNotificationContext();
  const navigate = useNavigate();

  const [profileOpen, setProfileOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [globalSearch, setGlobalSearch] = useState('');

  const handleGlobalSearch = (e) => {
    e.preventDefault();
    if (!globalSearch.trim()) return;
    // Route global search depending on role
    if (role === 'DOCTOR') {
      navigate(`/doctor/patients?search=${encodeURIComponent(globalSearch)}`);
    } else if (role === 'PHARMACIST') {
      navigate(`/pharmacy/inventory?search=${encodeURIComponent(globalSearch)}`);
    } else {
      navigate(`/admin/patients?search=${encodeURIComponent(globalSearch)}`);
    }
  };

  const handleSignOut = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200/80 sticky top-0 z-30 flex items-center justify-between px-4 sm:px-6 lg:px-8">
      {/* Left: Mobile Toggle & Global Search */}
      <div className="flex items-center gap-4 flex-1 max-w-xl">
        <button
          type="button"
          onClick={onToggleSidebar}
          className="lg:hidden p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg"
          aria-label="Toggle navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Global Search Input */}
        <form onSubmit={handleGlobalSearch} className="relative w-full max-w-md hidden sm:block">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={globalSearch}
            onChange={(e) => setGlobalSearch(e.target.value)}
            placeholder="Search patients, medical records, doctors, prescriptions..."
            className="w-full bg-slate-50 border border-slate-200 rounded-lg py-1.5 pl-9 pr-4 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all"
          />
        </form>
      </div>

      {/* Right: Mode Badge, Notification, Help, Profile */}
      <div className="flex items-center gap-2 sm:gap-4">
        {/* Mock / Live Backend Indicator */}
        <div
          title={isMockMode ? 'Running in Mock Data Mode' : 'Connected to FastAPI Backend'}
          className={`hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
            isMockMode
              ? 'bg-amber-50 text-amber-700 border border-amber-200'
              : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
          }`}
        >
          <Server className="w-3.5 h-3.5" />
          <span>{isMockMode ? 'Mock Simulation Mode' : 'Live FastAPI Mode'}</span>
        </div>

        {/* Notifications Icon */}
        <button
          type="button"
          onClick={() => navigate('/notifications')}
          className="relative p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
          aria-label="View notifications"
        >
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 flex h-4 min-w-[16px] px-1 items-center justify-center rounded-full bg-teal-600 text-[10px] font-bold text-white leading-none">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>

        {/* Help Center Icon */}
        <button
          type="button"
          onClick={() => setHelpOpen(true)}
          className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
          aria-label="Hospital system help and documentation"
        >
          <HelpCircle className="w-5 h-5" />
        </button>

        {/* Profile Avatar Dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setProfileOpen(!profileOpen)}
            className="flex items-center gap-2.5 p-1 rounded-lg hover:bg-slate-100 transition-colors focus:outline-none"
          >
            {user?.avatar ? (
              <img
                src={user.avatar}
                alt={user?.full_name || 'Profile'}
                className="w-8 h-8 rounded-full object-cover border border-slate-200"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-xs font-semibold">
                {user?.full_name?.charAt(0) || 'U'}
              </div>
            )}
            <div className="hidden md:block text-left">
              <div className="text-xs font-semibold text-slate-800 leading-tight">
                {user?.full_name || 'MediCore User'}
              </div>
              <div className="text-[10px] text-slate-400 capitalize">
                {user?.role?.toLowerCase().replace('_', ' ')}
              </div>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden md:block" />
          </button>

          {/* Dropdown Menu */}
          {profileOpen && (
            <div
              className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-100 py-1.5 z-50 animate-in fade-in slide-in-from-top-2"
              onMouseLeave={() => setProfileOpen(false)}
            >
              <div className="px-4 py-2.5 border-b border-slate-100">
                <p className="text-xs font-semibold text-slate-800 truncate">{user?.full_name}</p>
                <p className="text-[11px] text-slate-400 truncate">{user?.email}</p>
              </div>

              <Link
                to={
                  role === 'DOCTOR'
                    ? '/doctor/profile'
                    : role === 'PATIENT'
                    ? '/patient/profile'
                    : role === 'RECEPTIONIST'
                    ? '/reception/profile'
                    : role === 'PHARMACIST'
                    ? '/pharmacy/profile'
                    : '/settings'
                }
                onClick={() => setProfileOpen(false)}
                className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
              >
                <User className="w-4 h-4 text-slate-400" />
                <span>My Profile</span>
              </Link>

              <Link
                to="/settings"
                onClick={() => setProfileOpen(false)}
                className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
              >
                <Settings className="w-4 h-4 text-slate-400" />
                <span>System Settings</span>
              </Link>

              <div className="border-t border-slate-100 my-1" />

              <button
                type="button"
                onClick={handleSignOut}
                className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Help Modal */}
      <Modal
        isOpen={helpOpen}
        onClose={() => setHelpOpen(false)}
        title="MediCore Connected Healthcare Ecosystem"
        subtitle="Version 2.4.0 Clinical Release"
        maxWidth="max-w-md"
        footer={
          <Button variant="primary" size="sm" onClick={() => setHelpOpen(false)}>
            Close Guide
          </Button>
        }
      >
        <div className="space-y-4 text-xs text-slate-600">
          <div className="p-3 bg-teal-50 border border-teal-200 rounded-lg text-teal-800">
            <p className="font-semibold mb-1">Centralized Hospital Management System</p>
            <p>
              MediCore provides real-time medical workflow coordination among hospital administrators, doctors, receptionists, pharmacists, and patients.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-slate-800 mb-1">Standard Demo Credentials</h4>
            <ul className="space-y-1 list-disc pl-4 text-slate-600">
              <li><strong>Admin:</strong> admin@medicore.com / password123</li>
              <li><strong>Doctor:</strong> doctor@medicore.com / password123</li>
              <li><strong>Receptionist:</strong> reception@medicore.com / password123</li>
              <li><strong>Pharmacist:</strong> pharmacy@medicore.com / password123</li>
              <li><strong>Patient:</strong> patient@medicore.com / password123</li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-slate-800 mb-1">FastAPI Backend Pairing</h4>
            <p>
              When the separate FastAPI backend is running, toggle <code>VITE_USE_MOCK_DATA=false</code> in <code>.env</code> and point <code>VITE_API_BASE_URL</code> to the host IP.
            </p>
          </div>
        </div>
      </Modal>
    </header>
  );
};

export default Topbar;

