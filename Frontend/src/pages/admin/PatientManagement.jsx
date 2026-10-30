import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { patientService } from '../../services/patientService';
import { BLOOD_GROUPS, GENDERS } from '../../utils/constants';
import { useNotificationContext } from '../../context/NotificationContext';
import DataTable from '../../components/common/DataTable';
import Button from '../../components/common/Button';
import SearchBar from '../../components/common/SearchBar';
import Select from '../../components/common/Select';
import StatusBadge from '../../components/common/StatusBadge';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import {
  UserPlus,
  Filter,
  RotateCcw,
  Download,
  Eye,
  Edit,
  FileText,
  Calendar,
  UserX,
  UserCheck,
} from 'lucide-react';

export const PatientManagement = () => {
  const navigate = useNavigate();
  const { addToast } = useNotificationContext();

  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters state
  const [search, setSearch] = useState('');
  const [genderFilter, setGenderFilter] = useState('All');
  const [bloodGroupFilter, setBloodGroupFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  // Deactivate confirmation state
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [statusToggling, setStatusToggling] = useState(false);

  const fetchPatients = useCallback(async () => {
    try {
      setLoading(true);
      const params = {
        search: search.trim() || undefined,
        gender: genderFilter !== 'All' ? genderFilter : undefined,
        blood_group: bloodGroupFilter !== 'All' ? bloodGroupFilter : undefined,
        status: statusFilter !== 'All' ? statusFilter : undefined,
      };
      const res = await patientService.getPatients(params);
      if (res.success && res.data) {
        setPatients(res.data);
      }
    } catch (err) {
      addToast(err.message || 'Failed to fetch patient records', 'error');
    } finally {
      setLoading(false);
    }
  }, [search, genderFilter, bloodGroupFilter, statusFilter, addToast]);

  useEffect(() => {
    fetchPatients();
  }, [fetchPatients]);

  const handleResetFilters = () => {
    setSearch('');
    setGenderFilter('All');
    setBloodGroupFilter('All');
    setStatusFilter('All');
    setCurrentPage(1);
    addToast('Filters reset', 'info');
  };

  const handleExportPatients = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      ['ID,Name,Age,Gender,Phone,Blood Group,Status,Registration Date']
        .concat(
          patients.map(
            (p) =>
              `"${p.id}","${p.full_name}","${p.age}","${p.gender}","${p.phone}","${p.blood_group}","${p.status}","${p.registration_date}"`
          )
        )
        .join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `MediCore_Patients_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    addToast('Patient directory exported to CSV', 'success');
  };

  const handleToggleStatus = async () => {
    if (!selectedPatient) return;
    try {
      setStatusToggling(true);
      const res = await patientService.togglePatientStatus(selectedPatient.id);
      if (res.success) {
        addToast(res.message, 'success');
        setConfirmOpen(false);
        fetchPatients();
      }
    } catch (err) {
      addToast(err.message || 'Failed to update patient status', 'error');
    } finally {
      setStatusToggling(false);
    }
  };

  // Paginate records
  const paginatedData = patients.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const columns = [
    {
      key: 'id',
      header: 'Patient ID',
      render: (p) => <span className="font-semibold text-primary">{p.id}</span>,
    },
    {
      key: 'full_name',
      header: 'Full Name',
      render: (p) => (
        <div>
          <div className="font-semibold text-slate-800">{p.full_name}</div>
          <div className="text-[11px] text-slate-400">{p.email || 'No email provided'}</div>
        </div>
      ),
    },
    {
      key: 'age',
      header: 'Age',
      render: (p) => <span>{p.age} yrs</span>,
    },
    {
      key: 'gender',
      header: 'Gender',
    },
    {
      key: 'phone',
      header: 'Phone',
    },
    {
      key: 'blood_group',
      header: 'Blood Group',
      render: (p) => (
        <span className="inline-block px-2 py-0.5 font-bold text-xs bg-slate-100 rounded text-slate-700">
          {p.blood_group}
        </span>
      ),
    },
    {
      key: 'registration_date',
      header: 'Reg Date',
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
          <button
            type="button"
            title="View Profile"
            onClick={() => navigate(`/admin/patients/${p.id}`)}
            className="p-1.5 rounded-lg text-slate-500 hover:text-teal-600 hover:bg-teal-50 transition-colors"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            type="button"
            title="Edit Details"
            onClick={() => navigate(`/admin/patients/${p.id}?edit=true`)}
            className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-colors"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            type="button"
            title="Medical History"
            onClick={() => navigate(`/admin/patients/${p.id}?tab=history`)}
            className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
          >
            <FileText className="w-4 h-4" />
          </button>
          <button
            type="button"
            title="Book Appointment"
            onClick={() => navigate(`/admin/appointments/new?patient_id=${p.id}`)}
            className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
          >
            <Calendar className="w-4 h-4" />
          </button>
          <button
            type="button"
            title={p.status === 'Active' ? 'Deactivate Patient' : 'Activate Patient'}
            onClick={() => {
              setSelectedPatient(p);
              setConfirmOpen(true);
            }}
            className={`p-1.5 rounded-lg transition-colors ${
              p.status === 'Active'
                ? 'text-slate-500 hover:text-rose-600 hover:bg-rose-50'
                : 'text-slate-500 hover:text-emerald-600 hover:bg-emerald-50'
            }`}
          >
            {p.status === 'Active' ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-5">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Patient Management</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Manage registered patients, clinical history, and demographic profiles
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            id="btn_export_patients"
            variant="outline"
            size="sm"
            icon={Download}
            onClick={handleExportPatients}
          >
            Export Directory
          </Button>

          <Button
            id="btn_add_patient"
            variant="teal"
            size="sm"
            icon={UserPlus}
            onClick={() => navigate('/admin/patients/new')}
          >
            Register Patient
          </Button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div className="md:col-span-2">
            <SearchBar
              id="input_search_patient"
              value={search}
              onChange={setSearch}
              placeholder="Search by patient name, phone number, or PAT ID..."
            />
          </div>

          <div>
            <select
              id="filter_gender"
              value={genderFilter}
              onChange={(e) => setGenderFilter(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-lg py-2 px-3 text-xs sm:text-sm text-slate-700 focus:outline-none focus:border-teal-500"
            >
              <option value="All">All Genders</option>
              {GENDERS.map((g) => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
          </div>

          <div>
            <select
              id="filter_blood_group"
              value={bloodGroupFilter}
              onChange={(e) => setBloodGroupFilter(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-lg py-2 px-3 text-xs sm:text-sm text-slate-700 focus:outline-none focus:border-teal-500"
            >
              <option value="All">All Blood Groups</option>
              {BLOOD_GROUPS.map((bg) => (
                <option key={bg} value={bg}>{bg}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-xs">
          <div className="text-slate-500">
            Found <span className="font-semibold text-slate-800">{patients.length}</span> patient records
          </div>
          <div className="flex items-center gap-2">
            <Button
              id="btn_apply_filters"
              variant="outline"
              size="sm"
              icon={Filter}
              onClick={fetchPatients}
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

      {/* Patient Directory Table */}
      <DataTable
        columns={columns}
        data={paginatedData}
        loading={loading}
        emptyTitle="No Patients Found"
        emptyDescription="No patients match your current search and filter criteria."
        emptyActionLabel="Register First Patient"
        onEmptyAction={() => navigate('/admin/patients/new')}
        pagination={{
          currentPage,
          totalItems: patients.length,
          pageSize,
          onPageChange: setCurrentPage,
        }}
      />

      {/* Confirmation Dialog for Status Deactivate/Activate */}
      <ConfirmDialog
        isOpen={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleToggleStatus}
        title={selectedPatient?.status === 'Active' ? 'Deactivate Patient Profile?' : 'Reactivate Patient Profile?'}
        message={`Are you sure you want to ${
          selectedPatient?.status === 'Active' ? 'deactivate' : 'activate'
        } ${selectedPatient?.full_name} (${selectedPatient?.id})? Inactive patients cannot book new appointments until reactivated.`}
        confirmText={selectedPatient?.status === 'Active' ? 'Deactivate' : 'Activate'}
        type={selectedPatient?.status === 'Active' ? 'danger' : 'info'}
        loading={statusToggling}
        confirmId="btn_confirm_patient_status"
      />
    </div>
  );
};

export default PatientManagement;

