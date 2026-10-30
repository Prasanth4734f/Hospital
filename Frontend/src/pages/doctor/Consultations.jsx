import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { appointmentService } from '../../services/appointmentService';
import DataTable from '../../components/common/DataTable';
import Button from '../../components/common/Button';
import SearchBar from '../../components/common/SearchBar';
import StatusBadge from '../../components/common/StatusBadge';
import { PlayCircle, Eye } from 'lucide-react';

export const Consultations = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const docId = user?.doctor_id || 'DOC-201';
    appointmentService.getAppointments({ doctor_id: docId }).then((res) => {
      if (res.success && res.data) setAppointments(res.data);
      setLoading(false);
    });
  }, [user]);

  const columns = [
    {
      key: 'id',
      header: 'Consultation ID',
      render: (a) => <span className="font-semibold text-primary">{a.id}</span>,
    },
    {
      key: 'patient_name',
      header: 'Patient Name',
      render: (a) => (
        <div>
          <div className="font-semibold text-slate-800">{a.patient_name}</div>
          <div className="text-[11px] text-slate-400">{a.patient_id}</div>
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
      key: 'reason',
      header: 'Chief Complaint',
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
        <Button
          variant="teal"
          size="sm"
          icon={PlayCircle}
          onClick={() => navigate(`/doctor/consultations/${a.id}`)}
        >
          {a.status === 'Completed' ? 'Review Room' : 'Enter Consultation'}
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Clinical Consultations</h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Active examinations, vital recording, and finalized clinical assessments
        </p>
      </div>

      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Search by consultation ID, patient name, or complaint..."
        />
      </div>

      <DataTable
        columns={columns}
        data={appointments}
        loading={loading}
        emptyTitle="No Consultations Recorded"
      />
    </div>
  );
};

export default Consultations;

