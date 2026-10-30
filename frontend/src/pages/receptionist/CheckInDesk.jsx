import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { appointmentService } from '../../services/appointmentService';
import { useNotificationContext } from '../../context/NotificationContext';
import DataTable from '../../components/common/DataTable';
import Button from '../../components/common/Button';
import SearchBar from '../../components/common/SearchBar';
import StatusBadge from '../../components/common/StatusBadge';
import Modal from '../../components/common/Modal';
import { CheckSquare, UserX, Eye, Calendar, Clock, UserCheck } from 'lucide-react';

export const CheckInDesk = () => {
  const navigate = useNavigate();
  const { addToast } = useNotificationContext();

  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);

  const fetchCheckInData = async () => {
    try {
      setLoading(true);
      const res = await appointmentService.getAppointments();
      if (res.success && res.data) {
        setAppointments(res.data);
      }
    } catch (err) {
      addToast('Failed to load check-in queue', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCheckInData();
  }, []);

  const handleCheckIn = async (aptId) => {
    try {
      const res = await appointmentService.checkInPatient(aptId);
      if (res.success) {
        addToast('Patient checked in and assigned clinical queue token.', 'success');
        fetchCheckInData();
      }
    } catch (err) {
      addToast(err.message || 'Check-in failed', 'error');
    }
  };

  const handleMarkNoShow = async (aptId) => {
    try {
      const res = await appointmentService.updateStatus(aptId, 'No Show');
      if (res.success) {
        addToast('Appointment marked as No-Show', 'warning');
        fetchCheckInData();
      }
    } catch (err) {
      addToast(err.message || 'Action failed', 'error');
    }
  };

  const filtered = appointments.filter(
    (a) =>
      a.patient_name?.toLowerCase().includes(search.toLowerCase()) ||
      a.token_no?.toLowerCase().includes(search.toLowerCase()) ||
      a.doctor_name?.toLowerCase().includes(search.toLowerCase())
  );

  const columns = [
    {
      key: 'token_no',
      header: 'Token No.',
      render: (a) => (
        <span className="font-bold text-xs bg-slate-100 text-primary px-2.5 py-1 rounded-md">
          {a.token_no || 'T-100'}
        </span>
      ),
    },
    {
      key: 'patient_id',
      header: 'Patient ID',
      render: (a) => <span className="font-semibold text-primary">{a.patient_id}</span>,
    },
    {
      key: 'patient_name',
      header: 'Patient Name',
      render: (a) => <span className="font-semibold text-slate-800">{a.patient_name}</span>,
    },
    {
      key: 'doctor_name',
      header: 'Doctor',
      render: (a) => (
        <div>
          <div className="font-medium text-slate-800">{a.doctor_name}</div>
          <div className="text-[11px] text-teal-600">{a.department}</div>
        </div>
      ),
    },
    {
      key: 'appointment_time',
      header: 'Appointment Time',
      render: (a) => <span>{a.appointment_time || a.time_slot}</span>,
    },
    {
      key: 'check_in_time',
      header: 'Check-in Time',
      render: (a) => (
        <span className="text-slate-600 font-mono text-xs">
          {a.check_in_time || 'Not arrived yet'}
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
      header: 'Desk Actions',
      headerClassName: 'text-right',
      className: 'text-right',
      render: (a) => (
        <div className="flex items-center justify-end gap-1.5">
          {a.status !== 'Checked In' && a.status !== 'Completed' && a.status !== 'No Show' && (
            <Button
              id="btn_check_in"
              variant="teal"
              size="sm"
              icon={UserCheck}
              onClick={() => handleCheckIn(a.id)}
            >
              Check In
            </Button>
          )}

          {a.status !== 'Completed' && a.status !== 'No Show' && (
            <Button
              id="btn_mark_no_show"
              variant="outline"
              size="sm"
              icon={UserX}
              onClick={() => handleMarkNoShow(a.id)}
            >
              No-Show
            </Button>
          )}

          <button
            id="btn_view_patient"
            type="button"
            title="View Patient Profile"
            onClick={() => navigate(`/admin/patients/${a.patient_id}`)}
            className="p-1.5 rounded-lg text-slate-500 hover:text-teal-600 hover:bg-teal-50"
          >
            <Eye className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Lobby Check-in Desk</h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Patient arrival intake, token verification, and waiting room coordination
        </p>
      </div>

      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Search by patient name, token number, or doctor..."
        />
      </div>

      <DataTable
        columns={columns}
        data={filtered}
        loading={loading}
        emptyTitle="No Patients In Lobby Queue"
      />
    </div>
  );
};

export default CheckInDesk;

