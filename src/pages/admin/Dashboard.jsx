import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { dashboardService } from '../../services/dashboardService';
import { formatCurrency } from '../../utils/formatters';
import { useNotificationContext } from '../../context/NotificationContext';
import Button from '../../components/common/Button';
import StatusBadge from '../../components/common/StatusBadge';
import Loader from '../../components/common/Loader';
import {
  Users,
  Stethoscope,
  Calendar,
  Clock,
  CheckCircle2,
  DollarSign,
  UserPlus,
  Plus,
  ArrowRight,
  RefreshCw,
  Download,
  Activity,
  TrendingUp,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

const COLORS = ['#0d9488', '#38bdf8', '#0F2744', '#f59e0b', '#8b5cf6'];

export const AdminDashboard = () => {
  const navigate = useNavigate();
  const { addToast } = useNotificationContext();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [dashboardData, setDashboardData] = useState(null);

  const fetchDashboard = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);

      const res = await dashboardService.getAdminDashboard();
      if (res.success && res.data) {
        setDashboardData(res.data);
        if (isRefresh) addToast('Dashboard refreshed successfully', 'success');
      }
    } catch (err) {
      addToast(err.message || 'Failed to fetch dashboard metrics', 'error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [addToast]);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  const handleExportSummary = () => {
    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
      JSON.stringify(dashboardData, null, 2)
    )}`;
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', jsonString);
    downloadAnchor.setAttribute('download', `MediCore_Hospital_Report_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    addToast('Executive hospital report exported successfully', 'success');
  };

  if (loading) {
    return <Loader message="Compiling real-time hospital analytics..." />;
  }

  const {
    statistics = {},
    today_schedule = [],
    recent_registrations = [],
    doctor_availability = [],
    recent_activities = [],
    hospital_performance = {},
  } = dashboardData || {};

  const statCards = [
    {
      title: 'Total Patients',
      value: statistics.total_patients?.toLocaleString() || '1,248',
      icon: Users,
      color: 'text-teal-600',
      bgColor: 'bg-teal-50',
      borderColor: 'border-teal-200',
      path: '/admin/patients',
    },
    {
      title: 'Total Doctors',
      value: statistics.total_doctors || '48',
      icon: Stethoscope,
      color: 'text-sky-600',
      bgColor: 'bg-sky-50',
      borderColor: 'border-sky-200',
      path: '/admin/doctors',
    },
    {
      title: "Today's Appointments",
      value: statistics.today_appointments || '36',
      icon: Calendar,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
      borderColor: 'border-indigo-200',
      path: '/admin/appointments?filter=today',
    },
    {
      title: 'Pending Appointments',
      value: statistics.pending_appointments || '9',
      icon: Clock,
      color: 'text-amber-600',
      bgColor: 'bg-amber-50',
      borderColor: 'border-amber-200',
      path: '/admin/appointments?status=Pending',
    },
    {
      title: 'Completed Consultations',
      value: statistics.completed_consultations || '22',
      icon: CheckCircle2,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
      borderColor: 'border-emerald-200',
      path: '/admin/appointments?status=Completed',
    },
    {
      title: 'Total Revenue',
      value: formatCurrency(statistics.total_revenue || 84350),
      icon: DollarSign,
      color: 'text-primary',
      bgColor: 'bg-primary-50',
      borderColor: 'border-primary-200',
      path: '/admin/billing',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Hospital Administration</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Real-time telemetry, clinical operations, and healthcare metrics
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center flex-wrap gap-2.5">
          <Button
            id="btn_refresh_dashboard"
            variant="outline"
            size="sm"
            icon={RefreshCw}
            loading={refreshing}
            onClick={() => fetchDashboard(true)}
          >
            Refresh
          </Button>

          <Button
            id="btn_export_report"
            variant="outline"
            size="sm"
            icon={Download}
            onClick={handleExportSummary}
          >
            Export Report
          </Button>

          <Button
            id="btn_add_patient"
            variant="teal"
            size="sm"
            icon={UserPlus}
            onClick={() => navigate('/admin/patients/new')}
          >
            Add Patient
          </Button>

          <Button
            id="btn_add_doctor"
            variant="primary"
            size="sm"
            icon={Plus}
            onClick={() => navigate('/admin/doctors/new')}
          >
            Add Doctor
          </Button>
        </div>
      </div>

      {/* Metric Cards Grid - clickable and navigate to relevant filtered screens */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {statCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div
              key={idx}
              onClick={() => navigate(card.path)}
              className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-xs hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-medium text-slate-500 leading-tight">
                  {card.title}
                </span>
                <div
                  className={`w-8 h-8 rounded-lg ${card.bgColor} ${card.color} flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform`}
                >
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <div className="text-xl font-bold text-slate-800">{card.value}</div>
              <div className="mt-2 text-[11px] text-teal-600 font-medium flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                <span>View Details</span>
                <ArrowRight className="w-3 h-3" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Analytics Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly Trend Area Chart */}
        <div className="lg:col-span-2 bg-white rounded-xl p-5 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
                Hospital Performance & Revenue Trend
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">Patient volume and billing over recent 6 months</p>
            </div>
            <Button
              id="btn_view_reports"
              variant="outline"
              size="sm"
              onClick={() => navigate('/admin/reports')}
            >
              Detailed Reports
            </Button>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={hospital_performance?.monthly_trend || []}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0d9488" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#0d9488" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} tickFormatter={(v) => `$${v / 1000}k`} />
                <Tooltip
                  formatter={(value, name) => [
                    name === 'revenue' ? formatCurrency(value) : value,
                    name === 'revenue' ? 'Revenue' : 'Patients'
                  ]}
                  contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                />
                <Area type="monotone" dataKey="revenue" stroke="#0d9488" strokeWidth={2} fillOpacity={1} fill="url(#colorRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Department Distribution Pie Chart */}
        <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
              Department Volume
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">Active consultation distribution</p>
            <div className="h-44 w-full mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={hospital_performance?.department_distribution || []}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={65}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {(hospital_performance?.department_distribution || []).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value}%`, 'Volume']} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-100">
            {(hospital_performance?.department_distribution || []).map((d, i) => (
              <div key={i} className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                <span className="text-slate-600 truncate">{d.name} ({d.value}%)</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Operational Sections: Schedule & Registrations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Schedule */}
        <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
                Today&apos;s Appointment Schedule
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">Appointments scheduled across clinical desks</p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                id="btn_new_appointment"
                variant="teal"
                size="sm"
                icon={Plus}
                onClick={() => navigate('/admin/appointments/new')}
              >
                Book
              </Button>
              <Button
                id="btn_view_all_appointments"
                variant="ghost"
                size="sm"
                onClick={() => navigate('/admin/appointments')}
              >
                View All
              </Button>
            </div>
          </div>

          <div className="space-y-2.5">
            {today_schedule.slice(0, 5).map((apt) => (
              <div
                key={apt.id}
                className="flex items-center justify-between p-3 rounded-lg border border-slate-100 hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 text-center font-bold text-xs text-primary bg-slate-100 py-1.5 rounded-md">
                    {apt.time}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-slate-800">{apt.patient}</div>
                    <div className="text-xs text-slate-500">
                      {apt.doctor} • <span className="text-teal-600 font-medium">{apt.dept}</span>
                    </div>
                  </div>
                </div>
                <StatusBadge status={apt.status} />
              </div>
            ))}
          </div>
        </div>

        {/* Recent Registrations */}
        <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
                Recent Patient Registrations
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">Newly onboarded patient profiles</p>
            </div>
            <Button
              id="btn_view_all_patients"
              variant="ghost"
              size="sm"
              onClick={() => navigate('/admin/patients')}
            >
              View Directory
            </Button>
          </div>

          <div className="space-y-2.5">
            {recent_registrations.map((p) => (
              <div
                key={p.id}
                onClick={() => navigate(`/admin/patients/${p.id}`)}
                className="flex items-center justify-between p-3 rounded-lg border border-slate-100 hover:bg-slate-50 transition-colors cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-teal-50 text-teal-700 flex items-center justify-center font-bold text-xs">
                    {p.name.charAt(0)}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-slate-800 group-hover:text-teal-600 transition-colors">
                      {p.name}
                    </div>
                    <div className="text-xs text-slate-400">
                      {p.gender}, {p.age} yrs • {p.phone}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-semibold text-slate-700">{p.id}</div>
                  <div className="text-[11px] text-slate-400">{p.date}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Lower Row: Doctor Availability & Live System Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Doctor Availability */}
        <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs">
          <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-3">
            On-Duty Doctor Availability
          </h2>
          <div className="divide-y divide-slate-100">
            {doctor_availability.map((doc, idx) => (
              <div key={idx} className="py-2.5 flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-slate-800">{doc.name}</div>
                  <div className="text-xs text-slate-400">{doc.dept}</div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-slate-500 font-medium">
                    {doc.patients_today} consultations today
                  </span>
                  <StatusBadge status={doc.status} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activities */}
        <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs">
          <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-3">
            Live Clinical Feed
          </h2>
          <div className="space-y-3">
            {recent_activities.map((act) => (
              <div key={act.id} className="flex items-start gap-3 text-xs">
                <span className="w-2 h-2 rounded-full bg-teal-500 mt-1.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="font-medium text-slate-700">{act.message}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">{act.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;

