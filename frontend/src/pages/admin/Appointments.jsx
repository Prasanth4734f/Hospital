import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { appointmentService } from '../../services/appointmentService';
import { doctorService } from '../../services/doctorService';
import { APPOINTMENT_STATUS } from '../../utils/constants';
import { useNotificationContext } from '../../context/NotificationContext';
import DataTable from '../../components/common/DataTable';
import Button from '../../components/common/Button';
import SearchBar from '../../components/common/SearchBar';
import StatusBadge from '../../components/common/StatusBadge';
import Modal from '../../components/common/Modal';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import {
  Calendar as CalendarIcon,
  List,
  Plus,
  Filter,
  RotateCcw,
  Download,
  Eye,
  CheckCircle,
  Clock,
  XCircle,
  UserCheck,
  CheckCheck,
  CalendarDays,
} from 'lucide-react';

export const Appointments = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { addToast } = useNotificationContext();

  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);

  // View mode: 'list' | 'calendar'
  const [viewMode, setViewMode] = useState('list');

  // Filters
  const [search, setSearch] = useState('');
  const [doctorFilter, setDoctorFilter] = useState(searchParams.get('doctor_id') || 'All');
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || 'All');
  const [dateFilter, setDateFilter] = useState('');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  // Modals & Actions
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [rescheduleModalOpen, setRescheduleModalOpen] = useState(false);
  const [rescheduleDate, setRescheduleDate] = useState('');
  const [rescheduleTime, setRescheduleTime] = useState('');
  const [rescheduling, setRescheduling] = useState(false);

  // Cancel Confirmation
  const [cancelConfirmOpen, setCancelConfirmOpen] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  const fetchAppointments = useCallback(async () => {
    try {
      setLoading(true);
      const params = {
        doctor_id: doctorFilter !== 'All' ? doctorFilter : undefined,
        status: statusFilter !== 'All' ? statusFilter : undefined,
        date: dateFilter || undefined,
        search: search.trim() || undefined,
      };
      const res = await appointmentService.getAppointments(params);
      if (res.success && res.data) {
        setAppointments(res.data);
      }
    } catch (err) {
      addToast(err.message || 'Failed to fetch appointments', 'error');
    } finally {
      setLoading(false);
    }
  }, [doctorFilter, statusFilter, dateFilter, search, addToast]);

  useEffect(() => {
    fetchAppointments();
    // Fetch doctors for filter dropdown
    doctorService.getDoctors().then((res) => {
      if (res.success && res.data) setDoctors(res.data);
    });
  }, [fetchAppointments]);

  const handleResetFilters = () => {
    setSearch('');
    setDoctorFilter('All');
    setStatusFilter('All');
    setDateFilter('');
    setCurrentPage(1);
    addToast('Appointment filters cleared', 'info');
  };

  const handleExportAppointments = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      ['Appointment ID,Patient Name,Doctor,Department,Date,Time,Type,Status']
        .concat(
          appointments.map(
            (a) =>
              `"${a.id}","${a.patient_name}","${a.doctor_name}","${a.department}","${a.appointment_date}","${a.appointment_time}","${a.appointment_type}","${a.status}"`
          )
        )
        .join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `MediCore_Appointments_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    addToast('Appointment schedule exported', 'success');
  };

  const handleUpdateStatus = async (appointmentId, newStatus) => {
    try {
      const res = await appointmentService.updateStatus(appointmentId, newStatus);
      if (res.success) {
        addToast(res.message, 'success');
        fetchAppointments();
      }
    } catch (err) {
      addToast(err.message || 'Status update failed', 'error');
    }
  };

  const handleConfirmCancel = async () => {
    if (!selectedAppointment) return;
    try {
      setCancelling(true);
      const res = await appointmentService.cancelAppointment(selectedAppointment.id);
      if (res.success) {
        addToast(res.message, 'success');
        setCancelConfirmOpen(false);
        fetchAppointments();
      }
    } catch (err) {
      addToast(err.message || 'Failed to cancel appointment', 'error');
    } finally {
      setCancelling(false);
    }
  };

  const handleRescheduleSubmit = async (e) => {
    e.preventDefault();
    if (!rescheduleDate || !rescheduleTime) {
      addToast('Please select both date and time slot.', 'warning');
      return;
    }
    try {
      setRescheduling(true);
      const res = await appointmentService.rescheduleAppointment(
        selectedAppointment.id,
        rescheduleDate,
        rescheduleTime
      );
      if (res.success) {
        addToast(res.message, 'success');
        setRescheduleModalOpen(false);
        fetchAppointments();
      }
    } catch (err) {
      addToast(err.message || 'Failed to reschedule', 'error');
    } finally {
      setRescheduling(false);
    }
  };

  const paginatedData = appointments.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const columns = [
    {
      key: 'id',
      header: 'Appointment ID',
      render: (a) => <span className="font-semibold text-primary">{a.id}</span>,
    },
    {
      key: 'patient_name',
      header: 'Patient',
      render: (a) => (
        <div>
          <div className="font-semibold text-slate-800">{a.patient_name}</div>
          <div className="text-[11px] text-slate-400">Token: {a.token_no || 'T-N/A'}</div>
        </div>
      ),
    },
    {
      key: 'doctor_name',
      header: 'Doctor',
      render: (a) => (
        <div>
          <div className="font-medium text-slate-800">{a.doctor_name}</div>
          <div className="text-[11px] text-teal-600 font-medium">{a.department}</div>
        </div>
      ),
    },
    {
      key: 'appointment_date',
      header: 'Date & Time',
      render: (a) => (
        <div>
          <div className="font-medium text-slate-800">{a.appointment_date}</div>
          <div className="text-[11px] text-slate-400">{a.appointment_time || a.time_slot}</div>
        </div>
      ),
    },
    {
      key: 'appointment_type',
      header: 'Type',
      render: (a) => (
        <span className="text-xs text-slate-600 font-medium bg-slate-100 px-2 py-0.5 rounded">
          {a.appointment_type}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (a) => <StatusBadge status={a.status} />,
    },
    {
      key: 'actions',
      header: 'Actions',
      headerClassName: 'text-right',
      className: 'text-right',
      render: (a) => (
        <div className="flex items-center justify-end gap-1">
          <button
            type="button"
            title="View Details"
            onClick={() => {
              setSelectedAppointment(a);
              setViewModalOpen(true);
            }}
            className="p-1.5 rounded-lg text-slate-500 hover:text-teal-600 hover:bg-teal-50 transition-colors"
          >
            <Eye className="w-4 h-4" />
          </button>

          {a.status === 'Pending' && (
            <button
              type="button"
              title="Confirm Appointment"
              onClick={() => handleUpdateStatus(a.id, 'Confirmed')}
              className="p-1.5 rounded-lg text-slate-500 hover:text-sky-600 hover:bg-sky-50 transition-colors"
            >
              <CheckCircle className="w-4 h-4" />
            </button>
          )}

          {a.status === 'Confirmed' && (
            <button
              type="button"
              title="Check In Patient"
              onClick={() => handleUpdateStatus(a.id, 'Checked In')}
              className="p-1.5 rounded-lg text-slate-500 hover:text-teal-600 hover:bg-teal-50 transition-colors"
            >
              <UserCheck className="w-4 h-4" />
            </button>
          )}

          {(a.status === 'Checked In' || a.status === 'In Progress') && (
            <button
              type="button"
              title="Complete Appointment"
              onClick={() => handleUpdateStatus(a.id, 'Completed')}
              className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
            >
              <CheckCheck className="w-4 h-4" />
            </button>
          )}

          {a.status !== 'Completed' && a.status !== 'Cancelled' && (
            <>
              <button
                type="button"
                title="Reschedule Appointment"
                onClick={() => {
                  setSelectedAppointment(a);
                  setRescheduleDate(a.appointment_date);
                  setRescheduleTime(a.appointment_time || '10:00 AM');
                  setRescheduleModalOpen(true);
                }}
                className="p-1.5 rounded-lg text-slate-500 hover:text-amber-600 hover:bg-amber-50 transition-colors"
              >
                <Clock className="w-4 h-4" />
              </button>
              <button
                type="button"
                title="Cancel Appointment"
                onClick={() => {
                  setSelectedAppointment(a);
                  setCancelConfirmOpen(true);
                }}
                className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors"
              >
                <XCircle className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-5">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Appointment Management</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Clinical scheduling, patient intake, check-in tracking, and calendar views
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Toggle List/Calendar view */}
          <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200">
            <button
              id="btn_list_view"
              type="button"
              onClick={() => setViewMode('list')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
                viewMode === 'list'
                  ? 'bg-white text-slate-800 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span>List View</span>
            </button>
            <button
              id="btn_calendar_view"
              type="button"
              onClick={() => setViewMode('calendar')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
                viewMode === 'calendar'
                  ? 'bg-white text-slate-800 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <CalendarIcon className="w-3.5 h-3.5" />
              <span>Calendar View</span>
            </button>
          </div>

          <Button
            id="btn_export_appointments"
            variant="outline"
            size="sm"
            icon={Download}
            onClick={handleExportAppointments}
          >
            Export
          </Button>

          <Button
            id="btn_new_appointment"
            variant="teal"
            size="sm"
            icon={Plus}
            onClick={() => navigate('/admin/appointments/new')}
          >
            Book Appointment
          </Button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div>
            <SearchBar
              value={search}
              onChange={setSearch}
              placeholder="Search patient, doctor, or APT ID..."
            />
          </div>

          <div>
            <select
              value={doctorFilter}
              onChange={(e) => setDoctorFilter(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-lg py-2 px-3 text-xs sm:text-sm text-slate-700 focus:outline-none focus:border-teal-500"
            >
              <option value="All">All Doctors</option>
              {doctors.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.full_name} ({d.specialization})
                </option>
              ))}
            </select>
          </div>

          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-lg py-2 px-3 text-xs sm:text-sm text-slate-700 focus:outline-none focus:border-teal-500"
            >
              <option value="All">All Statuses</option>
              {Object.values(APPOINTMENT_STATUS).map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          <div>
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-lg py-2 px-3 text-xs sm:text-sm text-slate-700 focus:outline-none focus:border-teal-500"
            />
          </div>
        </div>

        <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-xs">
          <div className="text-slate-500">
            Total matching: <span className="font-semibold text-slate-800">{appointments.length}</span> appointments
          </div>
          <div className="flex items-center gap-2">
            <Button
              id="btn_apply_filters"
              variant="outline"
              size="sm"
              icon={Filter}
              onClick={fetchAppointments}
            >
              Apply Filters
            </Button>
            <Button
              id="btn_reset_filters"
              variant="ghost"
              size="sm"
              icon={RotateCcw}
              onClick={handleResetFilters}
            >
              Reset Filters
            </Button>
          </div>
        </div>
      </div>

      {/* Main View Display */}
      {viewMode === 'list' ? (
        <DataTable
          columns={columns}
          data={paginatedData}
          loading={loading}
          emptyTitle="No Appointments Scheduled"
          emptyDescription="There are no appointments matching your selected date or doctor filter."
          emptyActionLabel="Schedule Appointment"
          onEmptyAction={() => navigate('/admin/appointments/new')}
          pagination={{
            currentPage,
            totalItems: appointments.length,
            pageSize,
            onPageChange: setCurrentPage,
          }}
        />
      ) : (
        /* Calendar View Mode */
        <div className="bg-white rounded-xl border border-slate-200/80 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <CalendarDays className="w-5 h-5 text-teal-600" />
              <h2 className="text-base font-bold text-slate-800">Hospital Appointment Calendar</h2>
            </div>
            <span className="text-xs text-slate-400 font-medium">Grouped by Date</span>
          </div>

          <div className="space-y-6">
            {/* Group appointments by date */}
            {Object.entries(
              appointments.reduce((acc, apt) => {
                const d = apt.appointment_date || 'Undated';
                if (!acc[d]) acc[d] = [];
                acc[d].push(apt);
                return acc;
              }, {})
            ).map(([date, aptList]) => (
              <div key={date} className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-teal-500" />
                  <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">{date}</h3>
                  <span className="text-[11px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-medium">
                    {aptList.length} scheduled
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {aptList.map((apt) => (
                    <div
                      key={apt.id}
                      onClick={() => {
                        setSelectedAppointment(apt);
                        setViewModalOpen(true);
                      }}
                      className="p-3.5 rounded-xl border border-slate-200 hover:border-teal-400 bg-white hover:shadow-xs transition-all cursor-pointer"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-primary">{apt.appointment_time || apt.time_slot}</span>
                        <StatusBadge status={apt.status} />
                      </div>
                      <div className="text-sm font-semibold text-slate-800">{apt.patient_name}</div>
                      <div className="text-xs text-slate-500">{apt.doctor_name}</div>
                      <div className="text-[11px] text-teal-600 font-medium mt-1">{apt.appointment_type}</div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Appointment Details Modal */}
      <Modal
        isOpen={viewModalOpen}
        onClose={() => setViewModalOpen(false)}
        title="Appointment Clinical Record"
        subtitle={selectedAppointment?.id}
        footer={
          <Button variant="primary" size="sm" onClick={() => setViewModalOpen(false)}>
            Close
          </Button>
        }
      >
        {selectedAppointment && (
          <div className="space-y-3 text-xs">
            <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-lg">
              <div>
                <span className="text-slate-400">Patient</span>
                <p className="font-semibold text-slate-800 text-sm mt-0.5">{selectedAppointment.patient_name}</p>
                <p className="text-[11px] text-slate-500">{selectedAppointment.patient_id}</p>
              </div>
              <div>
                <span className="text-slate-400">Assigned Doctor</span>
                <p className="font-semibold text-slate-800 text-sm mt-0.5">{selectedAppointment.doctor_name}</p>
                <p className="text-[11px] text-teal-600">{selectedAppointment.department}</p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <span className="text-slate-400">Scheduled Date</span>
                <p className="font-semibold text-slate-800 mt-0.5">{selectedAppointment.appointment_date}</p>
              </div>
              <div>
                <span className="text-slate-400">Time Slot</span>
                <p className="font-semibold text-slate-800 mt-0.5">{selectedAppointment.appointment_time || selectedAppointment.time_slot}</p>
              </div>
              <div>
                <span className="text-slate-400">Status</span>
                <div className="mt-1"><StatusBadge status={selectedAppointment.status} /></div>
              </div>
            </div>
            <div>
              <span className="text-slate-400">Reason for Consultation</span>
              <p className="font-medium text-slate-700 mt-0.5 p-2 bg-slate-50 rounded border border-slate-100">
                {selectedAppointment.reason || 'General clinical consultation'}
              </p>
            </div>
            {selectedAppointment.notes && (
              <div>
                <span className="text-slate-400">Desk / Clinical Notes</span>
                <p className="font-medium text-slate-700 mt-0.5 p-2 bg-slate-50 rounded border border-slate-100">
                  {selectedAppointment.notes}
                </p>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Reschedule Modal */}
      <Modal
        isOpen={rescheduleModalOpen}
        onClose={() => setRescheduleModalOpen(false)}
        title="Reschedule Appointment"
        subtitle={`Select new slot for ${selectedAppointment?.patient_name}`}
      >
        <form onSubmit={handleRescheduleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              New Appointment Date
            </label>
            <input
              type="date"
              value={rescheduleDate}
              onChange={(e) => setRescheduleDate(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-lg py-2 px-3 text-sm text-slate-800 focus:outline-none focus:border-teal-500"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Available Time Slot
            </label>
            <select
              value={rescheduleTime}
              onChange={(e) => setRescheduleTime(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-lg py-2 px-3 text-sm text-slate-800 focus:outline-none focus:border-teal-500"
              required
            >
              <option value="09:00 AM">09:00 AM</option>
              <option value="09:30 AM">09:30 AM</option>
              <option value="10:00 AM">10:00 AM</option>
              <option value="10:30 AM">10:30 AM</option>
              <option value="11:00 AM">11:00 AM</option>
              <option value="02:00 PM">02:00 PM</option>
              <option value="02:30 PM">02:30 PM</option>
              <option value="03:00 PM">03:00 PM</option>
            </select>
          </div>
          <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
            <Button variant="outline" size="sm" onClick={() => setRescheduleModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="teal" size="sm" loading={rescheduling}>
              Confirm Reschedule
            </Button>
          </div>
        </form>
      </Modal>

      {/* Cancel Confirmation */}
      <ConfirmDialog
        isOpen={cancelConfirmOpen}
        onClose={() => setCancelConfirmOpen(false)}
        onConfirm={handleConfirmCancel}
        title="Cancel Appointment?"
        message={`Are you sure you want to cancel the appointment for ${selectedAppointment?.patient_name} on ${selectedAppointment?.appointment_date}?`}
        confirmText="Cancel Appointment"
        type="danger"
        loading={cancelling}
      />
    </div>
  );
};

export default Appointments;

