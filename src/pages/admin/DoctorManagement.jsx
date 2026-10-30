import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { doctorService } from '../../services/doctorService';
import { formatCurrency } from '../../utils/formatters';
import { DEPARTMENTS } from '../../utils/constants';
import { useNotificationContext } from '../../context/NotificationContext';
import DataTable from '../../components/common/DataTable';
import Button from '../../components/common/Button';
import SearchBar from '../../components/common/SearchBar';
import StatusBadge from '../../components/common/StatusBadge';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import Modal from '../../components/common/Modal';
import {
  Stethoscope,
  Plus,
  Filter,
  RotateCcw,
  Download,
  Eye,
  Edit,
  Clock,
  Calendar,
  UserX,
  UserCheck,
} from 'lucide-react';

export const DoctorManagement = () => {
  const navigate = useNavigate();
  const { addToast } = useNotificationContext();

  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [specializationFilter, setSpecializationFilter] = useState('All');
  const [availabilityFilter, setAvailabilityFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  // Availability modal
  const [availabilityDoctor, setAvailabilityDoctor] = useState(null);
  const [availabilityModalOpen, setAvailabilityModalOpen] = useState(false);
  const [selectedDays, setSelectedDays] = useState([]);
  const [selectedTime, setSelectedTime] = useState('');
  const [updatingAvailability, setUpdatingAvailability] = useState(false);

  // Deactivate modal
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [togglingStatus, setTogglingStatus] = useState(false);

  const fetchDoctors = useCallback(async () => {
    try {
      setLoading(true);
      const params = {
        search: search.trim() || undefined,
        specialization: specializationFilter !== 'All' ? specializationFilter : undefined,
        availability: availabilityFilter !== 'All' ? availabilityFilter : undefined,
        status: statusFilter !== 'All' ? statusFilter : undefined,
      };
      const res = await doctorService.getDoctors(params);
      if (res.success && res.data) {
        setDoctors(res.data);
      }
    } catch (err) {
      addToast(err.message || 'Failed to load doctors list', 'error');
    } finally {
      setLoading(false);
    }
  }, [search, specializationFilter, availabilityFilter, statusFilter, addToast]);

  useEffect(() => {
    fetchDoctors();
  }, [fetchDoctors]);

  const handleResetFilters = () => {
    setSearch('');
    setSpecializationFilter('All');
    setAvailabilityFilter('All');
    setStatusFilter('All');
    setCurrentPage(1);
    addToast('Doctor directory filters reset', 'info');
  };

  const handleExportDoctors = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      ['Doctor ID,Name,Specialization,Experience,Phone,Consultation Fee,Availability,Status']
        .concat(
          doctors.map(
            (d) =>
              `"${d.id}","${d.full_name}","${d.specialization}","${d.experience} yrs","${d.phone}","${d.consultation_fee}","${d.availability}","${d.status}"`
          )
        )
        .join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `MediCore_Doctors_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    addToast('Doctor roster exported to CSV', 'success');
  };

  const openManageAvailability = (doc) => {
    setAvailabilityDoctor(doc);
    setSelectedDays(doc.available_days || []);
    setSelectedTime(doc.available_time || '09:00 AM - 02:00 PM');
    setAvailabilityModalOpen(true);
  };

  const handleSaveAvailability = async () => {
    if (!availabilityDoctor) return;
    try {
      setUpdatingAvailability(true);
      const res = await doctorService.updateDoctorAvailability(availabilityDoctor.id, {
        available_days: selectedDays,
        available_time: selectedTime,
      });
      if (res.success) {
        addToast('Doctor schedule updated successfully', 'success');
        setAvailabilityModalOpen(false);
        fetchDoctors();
      }
    } catch (err) {
      addToast(err.message || 'Failed to update schedule', 'error');
    } finally {
      setUpdatingAvailability(false);
    }
  };

  const handleToggleStatus = async () => {
    if (!selectedDoctor) return;
    try {
      setTogglingStatus(true);
      const res = await doctorService.toggleDoctorStatus(selectedDoctor.id);
      if (res.success) {
        addToast(res.message, 'success');
        setConfirmOpen(false);
        fetchDoctors();
      }
    } catch (err) {
      addToast(err.message || 'Failed to update doctor status', 'error');
    } finally {
      setTogglingStatus(false);
    }
  };

  const paginatedData = doctors.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const columns = [
    {
      key: 'id',
      header: 'Doctor ID',
      render: (d) => <span className="font-semibold text-primary">{d.id}</span>,
    },
    {
      key: 'full_name',
      header: 'Doctor Name',
      render: (d) => (
        <div className="flex items-center gap-3">
          <img
            src={d.profile_photo || 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=100'}
            alt={d.full_name}
            className="w-8 h-8 rounded-full object-cover border border-slate-200"
          />
          <div>
            <div className="font-semibold text-slate-800">{d.full_name}</div>
            <div className="text-[11px] text-slate-400">{d.email}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'specialization',
      header: 'Specialization',
      render: (d) => (
        <span className="font-medium text-teal-700 bg-teal-50 px-2 py-0.5 rounded text-xs border border-teal-200">
          {d.specialization}
        </span>
      ),
    },
    {
      key: 'experience',
      header: 'Experience',
      render: (d) => <span>{d.experience} yrs</span>,
    },
    {
      key: 'phone',
      header: 'Phone',
    },
    {
      key: 'consultation_fee',
      header: 'Consultation Fee',
      render: (d) => <span className="font-semibold text-slate-800">{formatCurrency(d.consultation_fee)}</span>,
    },
    {
      key: 'availability',
      header: 'Availability',
      render: (d) => <StatusBadge status={d.availability} />,
    },
    {
      key: 'status',
      header: 'Status',
      render: (d) => <StatusBadge status={d.status} />,
    },
    {
      key: 'actions',
      header: 'Actions',
      headerClassName: 'text-right',
      className: 'text-right',
      render: (d) => (
        <div className="flex items-center justify-end gap-1.5">
          <button
            type="button"
            title="View Profile"
            onClick={() => navigate(`/admin/doctors/${d.id}`)}
            className="p-1.5 rounded-lg text-slate-500 hover:text-teal-600 hover:bg-teal-50 transition-colors"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            type="button"
            title="Edit Doctor"
            onClick={() => navigate(`/admin/doctors/${d.id}?edit=true`)}
            className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-colors"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            type="button"
            title="Manage Availability"
            onClick={() => openManageAvailability(d)}
            className="p-1.5 rounded-lg text-slate-500 hover:text-amber-600 hover:bg-amber-50 transition-colors"
          >
            <Clock className="w-4 h-4" />
          </button>
          <button
            type="button"
            title="View Appointments"
            onClick={() => navigate(`/admin/appointments?doctor_id=${d.id}`)}
            className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
          >
            <Calendar className="w-4 h-4" />
          </button>
          <button
            type="button"
            title={d.status === 'Active' ? 'Deactivate Doctor' : 'Activate Doctor'}
            onClick={() => {
              setSelectedDoctor(d);
              setConfirmOpen(true);
            }}
            className={`p-1.5 rounded-lg transition-colors ${
              d.status === 'Active'
                ? 'text-slate-500 hover:text-rose-600 hover:bg-rose-50'
                : 'text-slate-500 hover:text-emerald-600 hover:bg-emerald-50'
            }`}
          >
            {d.status === 'Active' ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
          </button>
        </div>
      ),
    },
  ];

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  return (
    <div className="space-y-5">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Doctor Management</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Clinical specialists, credentials, consultation rates, and roster schedules
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            icon={Download}
            onClick={handleExportDoctors}
          >
            Export Doctor List
          </Button>

          <Button
            variant="primary"
            size="sm"
            icon={Plus}
            onClick={() => navigate('/admin/doctors/new')}
          >
            Add New Doctor
          </Button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div className="md:col-span-2">
            <SearchBar
              value={search}
              onChange={setSearch}
              placeholder="Search by doctor name, specialization, or DOC ID..."
            />
          </div>

          <div>
            <select
              value={specializationFilter}
              onChange={(e) => setSpecializationFilter(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-lg py-2 px-3 text-xs sm:text-sm text-slate-700 focus:outline-none focus:border-teal-500"
            >
              <option value="All">All Specializations</option>
              {DEPARTMENTS.map((dept) => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
          </div>

          <div>
            <select
              value={availabilityFilter}
              onChange={(e) => setAvailabilityFilter(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-lg py-2 px-3 text-xs sm:text-sm text-slate-700 focus:outline-none focus:border-teal-500"
            >
              <option value="All">All Availabilities</option>
              <option value="Available">Available</option>
              <option value="In Consultation">In Consultation</option>
              <option value="On Leave">On Leave</option>
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-xs">
          <div className="text-slate-500">
            Displaying <span className="font-semibold text-slate-800">{doctors.length}</span> verified medical practitioners
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              icon={Filter}
              onClick={fetchDoctors}
            >
              Apply Filters
            </Button>
            <Button
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

      {/* Doctor Roster Table */}
      <DataTable
        columns={columns}
        data={paginatedData}
        loading={loading}
        emptyTitle="No Doctors Found"
        emptyDescription="Try adjusting your department or availability filters."
        emptyActionLabel="Onboard First Doctor"
        onEmptyAction={() => navigate('/admin/doctors/new')}
        pagination={{
          currentPage,
          totalItems: doctors.length,
          pageSize,
          onPageChange: setCurrentPage,
        }}
      />

      {/* Availability Management Modal */}
      <Modal
        isOpen={availabilityModalOpen}
        onClose={() => setAvailabilityModalOpen(false)}
        title="Manage Doctor Roster & Availability"
        subtitle={`Schedule parameters for ${availabilityDoctor?.full_name}`}
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setAvailabilityModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="teal" size="sm" loading={updatingAvailability} onClick={handleSaveAvailability}>
              Update Schedule
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
              Working Duty Days
            </label>
            <div className="flex flex-wrap gap-2">
              {daysOfWeek.map((day) => {
                const isSelected = selectedDays.includes(day);
                return (
                  <button
                    key={day}
                    type="button"
                    onClick={() => {
                      if (isSelected) {
                        setSelectedDays(selectedDays.filter((d) => d !== day));
                      } else {
                        setSelectedDays([...selectedDays, day]);
                      }
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                      isSelected
                        ? 'bg-teal-600 text-white border-teal-600 shadow-xs'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {day}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Duty Shift Hours
            </label>
            <input
              type="text"
              value={selectedTime}
              onChange={(e) => setSelectedTime(e.target.value)}
              placeholder="e.g. 09:00 AM - 02:00 PM"
              className="w-full bg-white border border-slate-300 rounded-lg py-2 px-3.5 text-sm text-slate-800 focus:outline-none focus:border-teal-500"
            />
          </div>
        </div>
      </Modal>

      {/* Deactivate/Reactivate Doctor Confirmation */}
      <ConfirmDialog
        isOpen={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleToggleStatus}
        title={selectedDoctor?.status === 'Active' ? 'Deactivate Doctor Record?' : 'Activate Doctor Record?'}
        message={`Are you sure you want to ${
          selectedDoctor?.status === 'Active' ? 'deactivate' : 'activate'
        } ${selectedDoctor?.full_name}? Inactive doctors will not be available for patient bookings.`}
        confirmText={selectedDoctor?.status === 'Active' ? 'Deactivate' : 'Activate'}
        type={selectedDoctor?.status === 'Active' ? 'danger' : 'info'}
        loading={togglingStatus}
      />
    </div>
  );
};

export default DoctorManagement;

