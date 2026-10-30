import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { appointmentService } from '../../services/appointmentService';
import { dashboardService } from '../../services/dashboardService';
import { useNotificationContext } from '../../context/NotificationContext';
import Button from '../../components/common/Button';
import StatusBadge from '../../components/common/StatusBadge';
import Loader from '../../components/common/Loader';
import {
  Calendar,
  Clock,
  CheckCircle2,
  Users,
  Stethoscope,
  HeartPulse,
  Pill,
  FileText,
  ArrowRight,
  PlayCircle,
} from 'lucide-react';

export const DoctorDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { addToast } = useNotificationContext();

  const [appointments, setAppointments] = useState([]);
  const [metrics, setMetrics] = useState({
    today_appointments: 8,
    pending_consultations: 2,
    completed_consultations: 6,
    assigned_patients: 64,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDoctorTelemetry = async () => {
      try {
        const docId = user?.doctor_id || 'DOC-201';
        const [dashRes, aptRes] = await Promise.all([
          dashboardService.getDoctorDashboard(docId),
          appointmentService.getAppointments({ doctor_id: docId }),
        ]);
        if (dashRes.success && dashRes.data) setMetrics(dashRes.data);
        if (aptRes.success && aptRes.data) setAppointments(aptRes.data);
      } catch (err) {
        addToast('Error loading doctor workspace', 'error');
      } finally {
        setLoading(false);
      }
    };
    loadDoctorTelemetry();
  }, [user, addToast]);

  if (loading) return <Loader message="Opening physician clinical dashboard..." />;

  const statCards = [
    {
      title: "Today's Appointments",
      value: metrics.today_appointments,
      icon: Calendar,
      bgColor: 'bg-teal-50',
      color: 'text-teal-600',
      path: '/doctor/appointments',
    },
    {
      title: 'Pending Consultations',
      value: metrics.pending_consultations,
      icon: Clock,
      bgColor: 'bg-amber-50',
      color: 'text-amber-600',
      path: '/doctor/appointments?status=Pending',
    },
    {
      title: 'Completed Consultations',
      value: metrics.completed_consultations,
      icon: CheckCircle2,
      bgColor: 'bg-emerald-50',
      color: 'text-emerald-600',
      path: '/doctor/consultations',
    },
    {
      title: 'Total Assigned Patients',
      value: metrics.assigned_patients,
      icon: Users,
      bgColor: 'bg-indigo-50',
      color: 'text-indigo-600',
      path: '/doctor/patients',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
            Clinician Workspace: {user?.full_name || 'Dr. Sarah Jenkins'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Department of Cardiology • Clinical intake, active consultations, and electronic prescriptions
          </p>
        </div>

        <div className="flex items-center flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            icon={Calendar}
            onClick={() => navigate('/doctor/schedule')}
          >
            Update Availability
          </Button>
          <Button
            variant="teal"
            size="sm"
            icon={HeartPulse}
            onClick={() => {
              const activeApt = appointments.find((a) => a.status === 'Checked In' || a.status === 'In Progress') || appointments[0];
              if (activeApt) {
                navigate(`/doctor/consultations/${activeApt.id}`);
              } else {
                navigate('/doctor/appointments');
              }
            }}
          >
            Start Consultation
          </Button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div
              key={idx}
              onClick={() => navigate(card.path)}
              className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-xs hover:shadow-md transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-slate-500">{card.title}</span>
                <div className={`w-8 h-8 rounded-lg ${card.bgColor} ${card.color} flex items-center justify-center`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-bold text-slate-800">{card.value}</div>
              <div className="mt-2 text-[11px] text-teal-600 font-medium flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                <span>View Details</span>
                <ArrowRight className="w-3 h-3" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Clinical Queue */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Next Patients in Queue */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
                Today&apos;s Active Patient Queue
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">Patients checked in and waiting for examination</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/doctor/appointments')}
            >
              View Full Schedule
            </Button>
          </div>

          <div className="space-y-3">
            {appointments.slice(0, 5).map((apt) => (
              <div
                key={apt.id}
                className="p-3.5 rounded-xl border border-slate-200 hover:border-teal-400 bg-white transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 text-center font-bold text-xs text-primary bg-slate-100 py-2 rounded-lg">
                    {apt.appointment_time || apt.time_slot}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                      <span>{apt.patient_name}</span>
                      <span className="text-xs font-mono font-normal text-slate-400">({apt.patient_id})</span>
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5">
                      Type: <strong>{apt.appointment_type}</strong> • Reason: {apt.reason}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  <StatusBadge status={apt.status} />
                  <Button
                    variant="teal"
                    size="sm"
                    icon={PlayCircle}
                    onClick={() => navigate(`/doctor/consultations/${apt.id}`)}
                  >
                    Open Room
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Clinical Operations */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs space-y-3">
            <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
              Physician Quick Actions
            </h2>
            <Button
              variant="teal"
              size="sm"
              className="w-full justify-start"
              icon={Pill}
              onClick={() => navigate('/doctor/prescriptions')}
            >
              Write Prescription
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="w-full justify-start"
              icon={FileText}
              onClick={() => navigate('/doctor/medical-records')}
            >
              Browse Medical Records
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="w-full justify-start"
              icon={Users}
              onClick={() => navigate('/doctor/patients')}
            >
              View My Patients
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorDashboard;

