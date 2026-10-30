import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { doctorService } from '../../services/doctorService';
import { appointmentService } from '../../services/appointmentService';
import { formatCurrency } from '../../utils/formatters';
import { useNotificationContext } from '../../context/NotificationContext';
import Button from '../../components/common/Button';
import StatusBadge from '../../components/common/StatusBadge';
import Loader from '../../components/common/Loader';
import Modal from '../../components/common/Modal';
import Input from '../../components/common/Input';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import {
  ArrowLeft,
  Calendar,
  Clock,
  Edit,
  Mail,
  Phone,
  Award,
  DollarSign,
  UserCheck,
  UserX,
  Stethoscope,
} from 'lucide-react';

export const DoctorDetails = () => {
  const { doctorId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { addToast } = useNotificationContext();

  const [doctor, setDoctor] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Edit modal
  const [editModalOpen, setEditModalOpen] = useState(searchParams.get('edit') === 'true');
  const [editForm, setEditForm] = useState({});
  const [savingEdit, setSavingEdit] = useState(false);

  // Deactivate dialog
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [toggling, setToggling] = useState(false);

  const fetchDoctorData = useCallback(async () => {
    try {
      setLoading(true);
      const [docRes, aptRes] = await Promise.all([
        doctorService.getDoctorById(doctorId),
        appointmentService.getAppointments({ doctor_id: doctorId }),
      ]);
      if (docRes.success && docRes.data) {
        setDoctor(docRes.data);
        setEditForm(docRes.data);
      }
      if (aptRes.success) {
        setAppointments(aptRes.data || []);
      }
    } catch (err) {
      addToast(err.message || 'Failed to load doctor profile', 'error');
    } finally {
      setLoading(false);
    }
  }, [doctorId, addToast]);

  useEffect(() => {
    fetchDoctorData();
  }, [fetchDoctorData]);

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    try {
      setSavingEdit(true);
      const res = await doctorService.updateDoctor(doctorId, editForm);
      if (res.success) {
        addToast('Doctor details updated', 'success');
        setDoctor(res.data);
        setEditModalOpen(false);
      }
    } catch (err) {
      addToast(err.message || 'Failed to update', 'error');
    } finally {
      setSavingEdit(false);
    }
  };

  const handleToggleStatus = async () => {
    try {
      setToggling(true);
      const res = await doctorService.toggleDoctorStatus(doctorId);
      if (res.success) {
        addToast(res.message, 'success');
        setDoctor(res.data);
        setConfirmOpen(false);
      }
    } catch (err) {
      addToast(err.message || 'Status update failed', 'error');
    } finally {
      setToggling(false);
    }
  };

  if (loading) return <Loader message="Loading doctor profile..." />;
  if (!doctor) {
    return (
      <div className="text-center py-12">
        <p className="text-sm text-slate-500">Doctor not found</p>
        <Button variant="outline" size="sm" onClick={() => navigate('/admin/doctors')} className="mt-3">
          Back to Directory
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate('/admin/doctors')}
            className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3.5">
            <img
              src={doctor.profile_photo || 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=150'}
              alt={doctor.full_name}
              className="w-14 h-14 rounded-full object-cover border-2 border-teal-500 shadow-sm"
            />
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-2xl font-bold text-slate-800 tracking-tight">{doctor.full_name}</h1>
                <StatusBadge status={doctor.availability} />
                <StatusBadge status={doctor.status} />
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {doctor.specialization} • {doctor.medical_reg_no} • {doctor.experience} yrs exp
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" icon={Edit} onClick={() => setEditModalOpen(true)}>
            Edit Details
          </Button>
          <Button
            variant="teal"
            size="sm"
            icon={Calendar}
            onClick={() => navigate(`/admin/appointments/new?doctor_id=${doctor.id}`)}
          >
            Book Appointment
          </Button>
          <Button
            variant={doctor.status === 'Active' ? 'danger' : 'outline'}
            size="sm"
            icon={doctor.status === 'Active' ? UserX : UserCheck}
            onClick={() => setConfirmOpen(true)}
          >
            {doctor.status === 'Active' ? 'Deactivate' : 'Activate'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Details */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs space-y-4">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-2">
              Clinical Qualifications & Licensing
            </h3>
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-slate-400">Department</span>
                <p className="font-semibold text-slate-800 mt-0.5">{doctor.department}</p>
              </div>
              <div>
                <span className="text-slate-400">Consultation Fee</span>
                <p className="font-semibold text-slate-800 mt-0.5">{formatCurrency(doctor.consultation_fee)}</p>
              </div>
              <div>
                <span className="text-slate-400">Qualifications</span>
                <p className="font-semibold text-slate-800 mt-0.5">{doctor.qualifications || 'MBBS, MD'}</p>
              </div>
              <div>
                <span className="text-slate-400">Registration Number</span>
                <p className="font-semibold text-slate-800 mt-0.5">{doctor.medical_reg_no}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs space-y-4">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-2">
              Assigned Appointment Schedule ({appointments.length})
            </h3>
            {appointments.length > 0 ? (
              <div className="divide-y divide-slate-100">
                {appointments.map((apt) => (
                  <div key={apt.id} className="py-2.5 flex items-center justify-between text-xs">
                    <div>
                      <div className="font-semibold text-slate-800">
                        {apt.patient_name} ({apt.appointment_type})
                      </div>
                      <div className="text-slate-400">
                        {apt.appointment_date} at {apt.appointment_time}
                      </div>
                    </div>
                    <StatusBadge status={apt.status} />
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 text-center py-4">No appointments scheduled.</p>
            )}
          </div>
        </div>

        {/* Right Column: Working Schedule */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs space-y-4">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-2">
              Working Duty Schedule
            </h3>
            <div className="space-y-3 text-xs">
              <div>
                <span className="text-slate-400">Consultation Shift</span>
                <p className="font-semibold text-slate-800 mt-0.5">{doctor.available_time || '09:00 AM - 02:00 PM'}</p>
              </div>
              <div>
                <span className="text-slate-400">Rostered Working Days</span>
                <div className="flex flex-wrap gap-1.5 mt-1.5">
                  {(doctor.available_days || []).map((day) => (
                    <span key={day} className="px-2 py-0.5 bg-teal-50 text-teal-800 rounded font-medium text-[11px] border border-teal-200">
                      {day}
                    </span>
                  ))}
                </div>
              </div>
              <div className="pt-2 border-t border-slate-100">
                <span className="text-slate-400">Direct Contact</span>
                <p className="font-semibold text-slate-800 mt-0.5 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-slate-400" /> {doctor.email}
                </p>
                <p className="font-semibold text-slate-800 mt-1 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-slate-400" /> {doctor.phone}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Doctor Modal */}
      <Modal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        title="Edit Doctor Details"
        subtitle={`Updating profile for ${doctor.full_name}`}
      >
        <form onSubmit={handleSaveEdit} className="space-y-4">
          <Input
            label="Doctor Name"
            value={editForm.full_name || ''}
            onChange={(e) => setEditForm({ ...editForm, full_name: e.target.value })}
            required
          />
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Phone"
              value={editForm.phone || ''}
              onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
              required
            />
            <Input
              label="Consultation Fee ($)"
              type="number"
              value={editForm.consultation_fee || ''}
              onChange={(e) => setEditForm({ ...editForm, consultation_fee: e.target.value })}
              required
            />
          </div>
          <Input
            label="Qualifications"
            value={editForm.qualifications || ''}
            onChange={(e) => setEditForm({ ...editForm, qualifications: e.target.value })}
          />
          <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
            <Button variant="outline" size="sm" onClick={() => setEditModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="teal" size="sm" loading={savingEdit}>
              Save Updates
            </Button>
          </div>
        </form>
      </Modal>

      {/* Confirmation Dialog */}
      <ConfirmDialog
        isOpen={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleToggleStatus}
        title={doctor.status === 'Active' ? 'Deactivate Doctor?' : 'Activate Doctor?'}
        message={`Are you sure you want to change the status of ${doctor.full_name}?`}
        confirmText={doctor.status === 'Active' ? 'Deactivate' : 'Activate'}
        type={doctor.status === 'Active' ? 'danger' : 'info'}
        loading={toggling}
      />
    </div>
  );
};

export default DoctorDetails;

