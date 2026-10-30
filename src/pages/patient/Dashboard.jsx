import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { appointmentService } from '../../services/appointmentService';
import { prescriptionService } from '../../services/prescriptionService';
import { billingService } from '../../services/billingService';
import { formatCurrency } from '../../utils/formatters';
import { useNotificationContext } from '../../context/NotificationContext';
import Button from '../../components/common/Button';
import StatusBadge from '../../components/common/StatusBadge';
import Loader from '../../components/common/Loader';
import {
  Calendar,
  CheckCircle2,
  CreditCard,
  Pill,
  FileText,
  Clock,
  ArrowRight,
  Download,
} from 'lucide-react';

export const PatientDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { addToast } = useNotificationContext();

  const patientId = user?.patient_id || 'PAT-1001';

  const [appointments, setAppointments] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      appointmentService.getAppointments({ patient_id: patientId }),
      prescriptionService.getPatientPrescriptions(patientId),
      billingService.getInvoices({ patient_id: patientId }),
    ]).then(([aptRes, rxRes, invRes]) => {
      if (aptRes.success) setAppointments(aptRes.data || []);
      if (rxRes.success) setPrescriptions(rxRes.data || []);
      if (invRes.success) setInvoices(invRes.data || []);
      setLoading(false);
    });
  }, [patientId]);

  const handleDownloadReport = () => {
    const report = {
      patient_id: patientId,
      patient_name: user?.full_name,
      appointments,
      prescriptions,
      invoices,
    };
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `MediCore_Patient_Health_Record_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    addToast('Patient clinical health record downloaded', 'success');
  };

  if (loading) return <Loader message="Connecting patient health portal..." />;

  const upcomingApts = appointments.filter((a) => a.status === 'Confirmed' || a.status === 'Pending' || a.status === 'Checked In');
  const completedApts = appointments.filter((a) => a.status === 'Completed');
  const pendingBills = invoices.filter((i) => i.balance > 0);

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-primary to-primary-dark rounded-2xl p-6 text-white shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold text-teal-400 uppercase tracking-wider">
            Patient Health Portal
          </span>
          <h1 className="text-2xl font-bold mt-1">Hello, {user?.full_name || 'Eleanor Vance'}</h1>
          <p className="text-xs text-slate-300 mt-1 max-w-md">
            Review your upcoming hospital appointments, download verified e-prescriptions, and pay outstanding balances securely.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            id="btn_book_new_appointment"
            variant="teal"
            size="sm"
            icon={Calendar}
            onClick={() => navigate('/patient/book-appointment')}
          >
            Book New Appointment
          </Button>

          <Button
            id="btn_download_medical_report"
            variant="outline"
            size="sm"
            className="text-white border-white/30 hover:bg-white/10"
            icon={Download}
            onClick={handleDownloadReport}
          >
            Health Dossier
          </Button>
        </div>
      </div>

      {/* 4 Dashboard Metric Cards from Section 15 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div
          onClick={() => navigate('/patient/appointments')}
          className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs hover:shadow-md cursor-pointer transition-all"
        >
          <div className="flex justify-between items-center text-xs text-slate-500 font-medium">
            <span>Upcoming Appointments</span>
            <Calendar className="w-4 h-4 text-teal-600" />
          </div>
          <div className="text-2xl font-bold text-slate-800 mt-2">{upcomingApts.length}</div>
        </div>

        <div
          onClick={() => navigate('/patient/appointments?tab=completed')}
          className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs hover:shadow-md cursor-pointer transition-all"
        >
          <div className="flex justify-between items-center text-xs text-slate-500 font-medium">
            <span>Completed Appointments</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-slate-800 mt-2">{completedApts.length}</div>
        </div>

        <div
          onClick={() => navigate('/patient/billing')}
          className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs hover:shadow-md cursor-pointer transition-all"
        >
          <div className="flex justify-between items-center text-xs text-slate-500 font-medium">
            <span>Pending Payments</span>
            <CreditCard className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-bold text-amber-700 mt-2">{pendingBills.length} Invoices</div>
        </div>

        <div
          onClick={() => navigate('/patient/prescriptions')}
          className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs hover:shadow-md cursor-pointer transition-all"
        >
          <div className="flex justify-between items-center text-xs text-slate-500 font-medium">
            <span>Active Prescriptions</span>
            <Pill className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-bold text-slate-800 mt-2">{prescriptions.length} Regimens</div>
        </div>
      </div>

      {/* Main Split: Next Appointment & Active Prescriptions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Next Appointment */}
        <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b pb-3">
            <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
              Upcoming Clinical Schedule
            </h2>
            <Button
              id="btn_view_appointment"
              variant="ghost"
              size="sm"
              onClick={() => navigate('/patient/appointments')}
            >
              All Appointments
            </Button>
          </div>

          {upcomingApts.length > 0 ? (
            upcomingApts.map((apt) => (
              <div key={apt.id} className="p-4 rounded-xl border border-slate-100 bg-slate-50/60 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-bold text-slate-800">{apt.doctor_name}</div>
                  <StatusBadge status={apt.status} />
                </div>
                <div className="text-xs text-slate-500">
                  {apt.department} • Scheduled: {apt.appointment_date} at {apt.appointment_time}
                </div>
                <p className="text-xs text-slate-600 italic">Reason: {apt.reason}</p>
                <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-200/60">
                  <Button
                    id="btn_reschedule_appointment"
                    variant="outline"
                    size="sm"
                    onClick={() => navigate('/patient/appointments')}
                  >
                    Reschedule
                  </Button>
                  <Button
                    id="btn_cancel_appointment"
                    variant="ghost"
                    size="sm"
                    className="text-rose-600"
                    onClick={() => navigate('/patient/appointments')}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ))
          ) : (
            <p className="text-xs text-slate-400 py-6 text-center">No upcoming appointments scheduled.</p>
          )}
        </div>

        {/* Active Prescriptions */}
        <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b pb-3">
            <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
              Recent Prescriptions
            </h2>
            <Button
              id="btn_download_prescription"
              variant="ghost"
              size="sm"
              onClick={() => navigate('/patient/prescriptions')}
            >
              All Prescriptions
            </Button>
          </div>

          {prescriptions.length > 0 ? (
            prescriptions.slice(0, 3).map((rx) => (
              <div key={rx.id} className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/60 space-y-2 text-xs">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-slate-800">{rx.diagnosis}</span>
                  <StatusBadge status={rx.status} />
                </div>
                <div className="text-slate-500">Doctor: {rx.doctor_name} • Issued: {rx.date}</div>
                <div className="space-y-1">
                  {rx.medicines?.map((m, i) => (
                    <div key={i} className="text-[11px] text-slate-700 font-medium">
                      • {m.name} ({m.dosage}) - {m.frequency}
                    </div>
                  ))}
                </div>
              </div>
            ))
          ) : (
            <p className="text-xs text-slate-400 py-6 text-center">No active prescriptions.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default PatientDashboard;

