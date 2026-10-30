import React, { useState, useEffect } from 'react';
import { reportService } from '../../services/reportService';
import { formatCurrency } from '../../utils/formatters';
import { DEPARTMENTS } from '../../utils/constants';
import { useNotificationContext } from '../../context/NotificationContext';
import Button from '../../components/common/Button';
import Loader from '../../components/common/Loader';
import {
  BarChart3,
  Download,
  Printer,
  RotateCcw,
  Filter,
  TrendingUp,
  Users,
  Calendar,
  DollarSign,
  FileSpreadsheet,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from 'recharts';

const COLORS = ['#0d9488', '#38bdf8', '#0F2744', '#f59e0b', '#8b5cf6'];

export const Reports = () => {
  const { addToast } = useNotificationContext();

  const [activeReport, setActiveReport] = useState('revenue');
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState(null);

  // Filters
  const [startDate, setStartDate] = useState('2026-05-01');
  const [endDate, setEndDate] = useState('2026-10-31');
  const [department, setDepartment] = useState('All');

  const fetchSelectedReport = async () => {
    try {
      setLoading(true);
      const params = { start_date: startDate, end_date: endDate, department };
      let res;
      if (activeReport === 'revenue' || activeReport === 'payment') {
        res = await reportService.getRevenueReport(params);
      } else if (activeReport === 'patients') {
        res = await reportService.getPatientReport(params);
      } else if (activeReport === 'doctors') {
        res = await reportService.getDoctorReport(params);
      } else {
        res = await reportService.getAppointmentReport(params);
      }
      if (res.success && res.data) {
        setReportData(res.data);
      }
    } catch (err) {
      addToast('Error generating analytics report', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSelectedReport();
  }, [activeReport]);

  const handleResetFilters = () => {
    setStartDate('2026-05-01');
    setEndDate('2026-10-31');
    setDepartment('All');
    addToast('Report filter parameters reset', 'info');
  };

  const handleExportCsv = () => {
    const jsonStr = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(reportData, null, 2))}`;
    const a = document.createElement('a');
    a.href = jsonStr;
    a.download = `MediCore_Report_${activeReport}_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    addToast('Report exported to data file', 'success');
  };

  const handlePrint = () => {
    window.print();
    addToast('Report sent to printer', 'info');
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Reports & Hospital Analytics</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Executive clinical intelligence, department revenue, and physician productivity
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            id="btn_export_csv"
            variant="outline"
            size="sm"
            icon={Download}
            onClick={handleExportCsv}
          >
            Export CSV / Data
          </Button>
          <Button
            id="btn_print_report"
            variant="outline"
            size="sm"
            icon={Printer}
            onClick={handlePrint}
          >
            Print Report
          </Button>
        </div>
      </div>

      {/* Report Categories Tabs */}
      <div className="bg-white p-1 rounded-xl border border-slate-200/80 shadow-xs flex flex-wrap gap-1">
        {[
          { key: 'revenue', label: 'Revenue & Financials' },
          { key: 'patients', label: 'Patient Registrations' },
          { key: 'doctors', label: 'Doctor Workload' },
          { key: 'appointments', label: 'Appointment Completion' },
        ].map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveReport(tab.key)}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
              activeReport === tab.key
                ? 'bg-teal-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
              Start Date
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-lg py-1.5 px-3 text-xs text-slate-700"
            />
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
              End Date
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-lg py-1.5 px-3 text-xs text-slate-700"
            />
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
              Department
            </label>
            <select
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-lg py-1.5 px-3 text-xs text-slate-700"
            >
              <option value="All">All Departments</option>
              {DEPARTMENTS.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
          <Button
            id="btn_reset_report_filters"
            variant="ghost"
            size="sm"
            icon={RotateCcw}
            onClick={handleResetFilters}
          >
            Reset Filters
          </Button>
          <Button
            id="btn_apply_report_filters"
            variant="teal"
            size="sm"
            icon={Filter}
            onClick={fetchSelectedReport}
          >
            Generate Report
          </Button>
        </div>
      </div>

      {/* Render Active Analytics Charts */}
      {loading ? (
        <Loader message="Synthesizing report datasets..." />
      ) : (
        <div className="space-y-6">
          {activeReport === 'revenue' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs">
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4">
                  Revenue Generated by Medical Department
                </h3>
                <div className="h-72 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={reportData?.revenue_by_dept || []}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} />
                      <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} tickFormatter={(v) => `$${v / 1000}k`} />
                      <Tooltip formatter={(value) => [formatCurrency(value), 'Revenue']} />
                      <Bar dataKey="revenue" fill="#0d9488" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-2">
                    Executive Summary
                  </h3>
                  <p className="text-xs text-slate-400 mb-4">Cumulative totals for selected date range</p>
                  <div className="space-y-4">
                    <div className="p-3 bg-teal-50 rounded-lg">
                      <span className="text-xs text-teal-700 font-semibold">Total Revenue Realized</span>
                      <div className="text-2xl font-bold text-teal-900 mt-1">
                        {formatCurrency(reportData?.total_revenue || 94500)}
                      </div>
                    </div>
                    <div className="p-3 bg-amber-50 rounded-lg">
                      <span className="text-xs text-amber-700 font-semibold">Outstanding Collections</span>
                      <div className="text-2xl font-bold text-amber-900 mt-1">
                        {formatCurrency(reportData?.pending_revenue || 14200)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeReport === 'patients' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs">
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4">
                  Registrations by Age Bracket
                </h3>
                <div className="h-72 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={reportData?.age_groups || []}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="group" stroke="#94a3b8" fontSize={12} />
                      <YAxis stroke="#94a3b8" fontSize={12} />
                      <Tooltip />
                      <Bar dataKey="count" fill="#38bdf8" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs">
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4">
                  Gender Distribution
                </h3>
                <div className="h-72 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={reportData?.gender_distribution || []}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {(reportData?.gender_distribution || []).map((e, idx) => (
                          <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}

          {activeReport === 'doctors' && (
            <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs">
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4">
                Consultation Volume by Clinician
              </h3>
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={reportData?.doctor_workload || []}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} />
                    <YAxis stroke="#94a3b8" fontSize={12} />
                    <Tooltip />
                    <Bar dataKey="consultations" fill="#0d9488" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {activeReport === 'appointments' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs">
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4">
                  Daily Appointment Volume (Completed vs Cancelled)
                </h3>
                <div className="h-72 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={reportData?.daily_distribution || []}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="day" stroke="#94a3b8" fontSize={12} />
                      <YAxis stroke="#94a3b8" fontSize={12} />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="completed" fill="#0d9488" name="Completed" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="cancelled" fill="#e11d48" name="Cancelled" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-center space-y-4">
                <div className="p-3 bg-emerald-50 rounded-lg">
                  <span className="text-xs text-emerald-700 font-semibold">Completion Rate</span>
                  <div className="text-2xl font-bold text-emerald-900 mt-1">{reportData?.completion_rate || '88.4%'}</div>
                </div>
                <div className="p-3 bg-rose-50 rounded-lg">
                  <span className="text-xs text-rose-700 font-semibold">Cancellation Rate</span>
                  <div className="text-2xl font-bold text-rose-900 mt-1">{reportData?.cancellation_rate || '7.2%'}</div>
                </div>
                <div className="p-3 bg-slate-100 rounded-lg">
                  <span className="text-xs text-slate-600 font-semibold">No-Show Rate</span>
                  <div className="text-2xl font-bold text-slate-800 mt-1">{reportData?.no_show_rate || '4.4%'}</div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Reports;

