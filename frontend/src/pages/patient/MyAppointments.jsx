import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { appointmentService } from '../../services/appointmentService';
import { useNotificationContext } from '../../context/NotificationContext';
import DataTable from '../../components/common/DataTable';
import Button from '../../components/common/Button';
import StatusBadge from '../../components/common/StatusBadge';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import { Calendar, XCircle, Clock } from 'lucide-react';

export const PatientAppointments = () => {
  const { user } = useAuth();
  const { addToast } = useNotificationContext();
  const patientId = user?.patient_id || 'PAT-1001';

  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedApt, setSelectedApt] = useState(null);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  const fetchApts = async () => {
    setLoading(true);
    const res = await appointmentService.getAppointments({ patient_id: patientId });
    if (res.success && res.data) setAppointments(res.data);
    setLoading(false);
  };

  useEffect(() => {
    fetchApts();
  }, [patientId]);

  const handleCancelConfirm = async () => {
    if (!selectedApt) return;
    try {
      setCancelling(true);
      const res = await appointmentService.cancelAppointment(selectedApt.id);
      if (res.success) {
        addToast('Appointment cancelled successfully', 'success');
        setCancelOpen(false);
        fetchApts();
      }
    } catch {
      addToast('Error cancelling appointment', 'error');
    } finally {
      setCancelling(false);
    }
  };

  const columns = [
    {
      key: 'id',
      header: 'Appt ID',
      render: (a) => <span className="font-semibold text-primary">{a.id}</span>,
    },
    {
      key: 'doctor_name',
      header: 'Specialist Clinician',
      render: (a) => (
        <div>
          <div className="font-semibold text-slate-800">{a.doctor_name}</div>
          <div className="text-[11px] text-teal-600">{a.department}</div>
        </div>
      ),
    },
    {
      key: 'appointment_date',
      header: 'Date & Time',
      render: (a) => (
        <div>
          <span>{a.appointment_date}</span>
          <span className="text-slate-400 text-xs ml-1.5">{a.appointment_time || a.time_slot}</span>
        </div>
      ),
    },
    {
      key: 'appointment_type',
      header: 'Type',
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
        a.status !== 'Completed' && a.status !== 'Cancelled' ? (
          <Button
            variant="outline"
            size="sm"
            icon={XCircle}
            className="text-rose-600 hover:bg-rose-50"
            onClick={() => {
              setSelectedApt(a);
              setCancelOpen(true);
            }}
          >
            Cancel
          </Button>
        ) : null
      ),
    },
  ];

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-slate-800 tracking-tight">My Appointments</h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Review your clinical consultation bookings and appointments schedule
        </p>
      </div>

      <DataTable columns={columns} data={appointments} loading={loading} />

      <ConfirmDialog
        isOpen={cancelOpen}
        onClose={() => setCancelOpen(false)}
        onConfirm={handleCancelConfirm}
        title="Cancel Appointment?"
        message={`Are you sure you want to cancel your consultation with ${selectedApt?.doctor_name} on ${selectedApt?.appointment_date}?`}
        confirmText="Cancel Appointment"
        type="danger"
        loading={cancelling}
      />
    </div>
  );
};

export default PatientAppointments;

