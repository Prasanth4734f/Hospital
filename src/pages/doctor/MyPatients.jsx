import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { patientService } from '../../services/patientService';
import DataTable from '../../components/common/DataTable';
import Button from '../../components/common/Button';
import SearchBar from '../../components/common/SearchBar';
import StatusBadge from '../../components/common/StatusBadge';
import { Eye, Calendar, FileText } from 'lucide-react';

export const MyPatients = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(searchParams.get('search') || '');

  useEffect(() => {
    patientService.getPatients().then((res) => {
      if (res.success && res.data) setPatients(res.data);
      setLoading(false);
    });
  }, []);

  const filtered = patients.filter(
    (p) =>
      p.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      p.id?.toLowerCase().includes(search.toLowerCase()) ||
      p.phone?.includes(search)
  );

  const columns = [
    {
      key: 'id',
      header: 'Patient ID',
      render: (p) => <span className="font-semibold text-primary">{p.id}</span>,
    },
    {
      key: 'full_name',
      header: 'Patient Name',
      render: (p) => (
        <div>
          <div className="font-semibold text-slate-800">{p.full_name}</div>
          <div className="text-[11px] text-slate-400">{p.gender}, {p.age} yrs • Blood Group: {p.blood_group}</div>
        </div>
      ),
    },
    {
      key: 'phone',
      header: 'Contact Phone',
    },
    {
      key: 'allergies',
      header: 'Allergies',
      render: (p) => (
        <span className="text-xs text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
          {p.allergies?.join(', ') || 'None known'}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (p) => <StatusBadge status={p.status} />,
    },
    {
      key: 'actions',
      header: 'Actions',
      headerClassName: 'text-right',
      className: 'text-right',
      render: (p) => (
        <div className="flex items-center justify-end gap-1.5">
          <Button
            variant="outline"
            size="sm"
            icon={Eye}
            onClick={() => navigate(`/admin/patients/${p.id}`)}
          >
            Profile
          </Button>
          <Button
            variant="teal"
            size="sm"
            icon={Calendar}
            onClick={() => navigate(`/admin/appointments/new?patient_id=${p.id}`)}
          >
            Schedule
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Assigned Patients</h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Patient roster, medical alerts, allergies, and diagnostic records
        </p>
      </div>

      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Search by patient name, contact, or ID..."
        />
      </div>

      <DataTable
        columns={columns}
        data={filtered}
        loading={loading}
        emptyTitle="No Patients Found"
      />
    </div>
  );
};

export default MyPatients;

