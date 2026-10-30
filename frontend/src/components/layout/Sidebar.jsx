import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { ROLES } from '../../utils/constants';
import {
  LayoutDashboard,
  Users,
  UserCheck,
  Calendar,
  FileText,
  Pill,
  CreditCard,
  Building2,
  BarChart3,
  Bell,
  Settings,
  LogOut,
  Stethoscope,
  Clock,
  UserPlus,
  ClipboardList,
  CheckSquare,
  Package,
  PlusCircle,
  RefreshCw,
  Send,
  History,
  Activity,
  HeartPulse,
  User,
  X,
} from 'lucide-react';

export const Sidebar = ({ isOpen, onClose }) => {
  const { user, role, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const getNavLinks = () => {
    switch (role) {
      case ROLES.SUPER_ADMIN:
      case ROLES.HOSPITAL_ADMIN:
        return [
          { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
          { name: 'Patients', path: '/admin/patients', icon: Users },
          { name: 'Doctors', path: '/admin/doctors', icon: Stethoscope },
          { name: 'Appointments', path: '/admin/appointments', icon: Calendar },
          { name: 'Medical Records', path: '/admin/medical-records', icon: FileText },
          { name: 'Prescriptions', path: '/admin/prescriptions', icon: Activity },
          { name: 'Pharmacy', path: '/admin/pharmacy', icon: Pill },
          { name: 'Billing & Payments', path: '/admin/billing', icon: CreditCard },
          { name: 'Staff Management', path: '/admin/staff', icon: Building2 },
          { name: 'Reports & Analytics', path: '/admin/reports', icon: BarChart3 },
          { name: 'Notifications', path: '/notifications', icon: Bell },
          { name: 'Settings', path: '/settings', icon: Settings },
        ];

      case ROLES.DOCTOR:
        return [
          { name: 'Dashboard', path: '/doctor/dashboard', icon: LayoutDashboard },
          { name: 'My Appointments', path: '/doctor/appointments', icon: Calendar },
          { name: 'My Patients', path: '/doctor/patients', icon: Users },
          { name: 'Consultations', path: '/doctor/consultations', icon: HeartPulse },
          { name: 'Medical Records', path: '/doctor/medical-records', icon: FileText },
          { name: 'Prescriptions', path: '/doctor/prescriptions', icon: Pill },
          { name: 'My Schedule', path: '/doctor/schedule', icon: Clock },
          { name: 'Notifications', path: '/notifications', icon: Bell },
          { name: 'My Profile', path: '/doctor/profile', icon: User },
        ];

      case ROLES.RECEPTIONIST:
        return [
          { name: 'Dashboard', path: '/reception/dashboard', icon: LayoutDashboard },
          { name: 'Register Patient', path: '/reception/patient-registration', icon: UserPlus },
          { name: 'Patient Directory', path: '/reception/patients', icon: Users },
          { name: 'Book Appointment', path: '/reception/book-appointment', icon: Calendar },
          { name: 'Appointment List', path: '/reception/appointments', icon: ClipboardList },
          { name: 'Check-in Desk', path: '/reception/check-in', icon: CheckSquare },
          { name: 'Billing', path: '/reception/billing', icon: CreditCard },
          { name: 'Notifications', path: '/notifications', icon: Bell },
          { name: 'My Profile', path: '/reception/profile', icon: User },
        ];

      case ROLES.PHARMACIST:
        return [
          { name: 'Dashboard', path: '/pharmacy/dashboard', icon: LayoutDashboard },
          { name: 'Inventory', path: '/pharmacy/inventory', icon: Package },
          { name: 'Add Medicine', path: '/pharmacy/add-medicine', icon: PlusCircle },
          { name: 'Update Stock', path: '/pharmacy/update-stock', icon: RefreshCw },
          { name: 'Dispense Medicine', path: '/pharmacy/dispense', icon: Send },
          { name: 'Dispensing History', path: '/pharmacy/dispensing-history', icon: History },
          { name: 'Notifications', path: '/notifications', icon: Bell },
          { name: 'Profile', path: '/pharmacy/profile', icon: User },
        ];

      case ROLES.PATIENT:
        return [
          { name: 'My Dashboard', path: '/patient/dashboard', icon: LayoutDashboard },
          { name: 'Book Appointment', path: '/patient/book-appointment', icon: Calendar },
          { name: 'My Appointments', path: '/patient/appointments', icon: ClipboardList },
          { name: 'Medical History', path: '/patient/history', icon: FileText },
          { name: 'My Prescriptions', path: '/patient/prescriptions', icon: Pill },
          { name: 'My Bills', path: '/patient/billing', icon: CreditCard },
          { name: 'Notifications', path: '/notifications', icon: Bell },
          { name: 'My Profile', path: '/patient/profile', icon: User },
        ];

      default:
        return [];
    }
  };

  const navLinks = getNavLinks();

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar Panel */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-primary-dark text-slate-200 border-r border-slate-800/80 flex flex-col transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 px-5 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-teal-500/20 border border-teal-500/30 flex items-center justify-center text-teal-400 font-bold">
              <HeartPulse className="w-5 h-5 text-teal-400" />
            </div>
            <div>
              <div className="font-bold text-white text-base tracking-tight leading-none">
                Medi<span className="text-teal-400">Core</span>
              </div>
              <div className="text-[10px] text-slate-400 font-medium uppercase tracking-wider mt-0.5">
                Connected Hospital
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="lg:hidden text-slate-400 hover:text-white p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Role Pill */}
        <div className="px-5 py-3 border-b border-slate-800/60 bg-slate-900/40">
          <div className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">
            Logged in as
          </div>
          <div className="text-xs font-medium text-teal-400 flex items-center gap-1.5 mt-0.5">
            <span className="w-1.5 h-1.5 rounded-full bg-teal-400" />
            {role?.replace('_', ' ') || 'Healthcare Staff'}
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {navLinks.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => {
                  if (window.innerWidth < 1024) onClose();
                }}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-teal-600 text-white shadow-sm'
                      : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                  }`
                }
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                <span className="truncate">{item.name}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Bottom Logout Area */}
        <div className="p-3 border-t border-slate-800">
          <button
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium text-rose-300 hover:bg-rose-500/10 hover:text-rose-200 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;

