import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { appointmentService } from '../../services/appointmentService';
import { useNotificationContext } from '../../context/NotificationContext';
import Button from '../../components/common/Button';
import StatusBadge from '../../components/common/StatusBadge';
import Loader from '../../components/common/Loader';
import {
  UserPlus,
  Calendar,
  Search,
  CheckSquare,
  CreditCard,
  Clock,
  CheckCircle2,
  Users,
} from 'lucide-react';

export const ReceptionistDashboard = () => {
  const navigate = useNavigate();
  const { addToast } = useNotificationContext();

  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    appointmentService.getAppointments().then((res) => {
      if (res.success && res.data) setAppointments(res.data);
      setLoading(false);
    });
  }, []);

  const handleQuickCheckIn = async (aptId) => {
    try {
      const res = await appointmentService.checkInPatient(aptId);
      if (res.success) {
        addToast(res.message, 'success');
        setAppointments((prev) =>
          prev.map((a) => (a.id === aptId ? { ...a, status: 'Checked In', check_in_time: 'Just now' } : a))
        );
      }
    } catch (err) {
      addToast('Check-in error', 'error');
    }
  };

  if (loading) return <Loader message="Opening reception desk..." />;

  const todayCount = appointments.length;
  const checkedInCount = appointments.filter((a) => a.status === 'Checked In').length;
  const pendingCount = appointments.filter((a) => a.status === 'Confirmed' || a.status === 'Pending').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Front Desk & Intake Operations</h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Patient registration, appointment check-ins, token queues, and billing counter
        </p>
      </div>

      {/* Action Shortcut Buttons from Section 14 */}
      <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs space-y-3">
        <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
          Front Desk Quick Actions
        </h2>
        <div className="flex flex-wrap gap-2.5">
          <Button
            variant="teal"
            size="sm"
            icon={UserPlus}
            onClick={() => navigate('/reception/patient-registration')}
          >
            Register New Patient
          </Button>

          <Button
            variant="primary"
            size="sm"
            icon={Calendar}
            onClick={() => navigate('/reception/book-appointment')}
          >
            Book Appointment
          </Button>

          <Button
            variant="outline"
            size="sm"
            icon={Search}
            onClick={() => navigate('/reception/patients')}
          >
            Search Patient Directory
          </Button>

          <Button
            variant="outline"
            size="sm"
            icon={CheckSquare}
            onClick={() => navigate('/reception/check-in')}
          >
            Check-in Desk Queue
          </Button>

          <Button
            variant="outline"
            size="sm"
            icon={CreditCard}
            onClick={() => navigate('/reception/billing')}
          >
            Billing & Invoicing
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
          <span className="text-xs text-slate-500 font-medium">Scheduled Today</span>
          <div className="text-2xl font-bold text-slate-800 mt-1">{todayCount}</div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
          <span className="text-xs text-teal-600 font-medium">Checked-in At Lobby</span>
          <div className="text-2xl font-bold text-teal-700 mt-1">{checkedInCount}</div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
          <span className="text-xs text-amber-600 font-medium">Pending Arrival</span>
          <div className="text-2xl font-bold text-amber-700 mt-1">{pendingCount}</div>
        </div>
      </div>

      {/* Front Desk Live Queue */}
      <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
              Today&apos;s Patient Arrivals
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">Quickly issue tokens and check in patients</p>
          </div>
          <Button variant="ghost" size="sm" onClick={() => navigate('/reception/check-in')}>
            Full Check-in Desk
          </Button>
        </div>

        <div className="divide-y divide-slate-100">
          {appointments.slice(0, 6).map((apt) => (
            <div key={apt.id} className="py-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 text-center font-bold text-xs bg-slate-100 py-1.5 rounded-lg text-primary">
                  {apt.token_no || 'T-100'}
                </div>
                <div>
                  <div className="font-semibold text-slate-800 text-sm">{apt.patient_name}</div>
                  <div className="text-xs text-slate-400">
                    With {apt.doctor_name} • {apt.appointment_time}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <StatusBadge status={apt.status} />
                {apt.status === 'Confirmed' && (
                  <Button
                    variant="teal"
                    size="sm"
                    onClick={() => handleQuickCheckIn(apt.id)}
                  >
                    Check In
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ReceptionistDashboard;

