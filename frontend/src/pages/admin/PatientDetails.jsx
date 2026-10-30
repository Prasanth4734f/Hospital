import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { patientService } from '../../services/patientService';
import { appointmentService } from '../../services/appointmentService';
import { prescriptionService } from '../../services/prescriptionService';
import { billingService } from '../../services/billingService';
import { formatCurrency, formatDate } from '../../utils/formatters';
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
  FileText,
  Activity,
  CreditCard,
  Download,
  Edit,
  UserX,
  UserCheck,
  AlertTriangle,
  Plus,
  Clock,
  HeartPulse,
} from 'lucide-react';

export const PatientDetails = () => {
  const { patientId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { addToast } = useNotificationContext();

  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'overview');
  const [patient, setPatient] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);

  // Edit Patient Modal State
  const [editModalOpen, setEditModalOpen] = useState(searchParams.get('edit') === 'true');
  const [editForm, setEditForm] = useState({});
  const [savingEdit, setSavingEdit] = useState(false);

  // Deactivate dialog
  const [confirmDeactivateOpen, setConfirmDeactivateOpen] = useState(false);
  const [statusLoading, setStatusLoading] = useState(false);

  const fetchPatientAllData = useCallback(async () => {
    try {
      setLoading(true);
      const [pRes, aptRes, rxRes, invRes] = await Promise.all([
        patientService.getPatientById(patientId),
        appointmentService.getAppointments({ patient_id: patientId }),
        prescriptionService.getPatientPrescriptions(patientId),
        billingService.getInvoices({ patient_id: patientId }),
      ]);

      if (pRes.success && pRes.data) {
        setPatient(pRes.data);
        setEditForm(pRes.data);
      }
      if (aptRes.success) setAppointments(aptRes.data || []);
      if (rxRes.success) setPrescriptions(rxRes.data || []);
      if (invRes.success) setInvoices(invRes.data || []);
    } catch (err) {
      addToast(err.message || 'Error loading patient details', 'error');
    } finally {
      setLoading(false);
    }
  }, [patientId, addToast]);

  useEffect(() => {
    fetchPatientAllData();
  }, [fetchPatientAllData]);

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    try {
      setSavingEdit(true);
      const res = await patientService.updatePatient(patientId, editForm);
      if (res.success) {
        addToast('Patient profile updated successfully', 'success');
        setPatient(res.data);
        setEditModalOpen(false);
      }
    } catch (err) {
      addToast(err.message || 'Failed to update patient', 'error');
    } finally {
      setSavingEdit(false);
    }
  };

  const handleToggleStatus = async () => {
    try {
      setStatusLoading(true);
      const res = await patientService.togglePatientStatus(patientId);
      if (res.success) {
        addToast(res.message, 'success');
        setPatient(res.data);
        setConfirmDeactivateOpen(false);
      }
    } catch (err) {
      addToast(err.message || 'Failed to update status', 'error');
    } finally {
      setStatusLoading(false);
    }
  };

  const handleDownloadReport = () => {
    const reportData = {
      patient,
      clinical_history: patient?.medical_history,
      recent_appointments: appointments,
      active_prescriptions: prescriptions,
      invoices,
    };
    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Patient_Report_${patient?.id}_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    addToast('Patient clinical dossier downloaded', 'success');
  };

  if (loading) {
    return <Loader message="Retrieving electronic medical record..." />;
  }

  if (!patient) {
    return (
      <div className="text-center py-12">
        <p className="text-sm text-slate-500">Patient not found</p>
        <Button variant="outline" size="sm" onClick={() => navigate('/admin/patients')} className="mt-3">
          Back to Directory
        </Button>
      </div>
    );
  }

  const tabs = [
    { key: 'overview', label: 'Overview' },
    { key: 'history', label: 'Medical History' },
    { key: 'appointments', label: `Appointments (${appointments.length})` },
    { key: 'prescriptions', label: `Prescriptions (${prescriptions.length})` },
    { key: 'billing', label: `Billing (${invoices.length})` },
    { key: 'documents', label: 'Documents' },
  ];

  return (
    <div className="space-y-6">
      {/* Header and Quick Operations */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate('/admin/patients')}
            className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl font-bold text-slate-800 tracking-tight">{patient.full_name}</h1>
              <StatusBadge status={patient.status} />
              <span className="text-xs font-mono font-semibold text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                {patient.id}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {patient.gender} • {patient.age} years • Blood Group:{' '}
              <span className="font-semibold text-slate-700">{patient.blood_group}</span> • Reg:{' '}
              {formatDate(patient.registration_date)}
            </p>
          </div>
        </div>

        {/* Action Buttons from Specification */}
        <div className="flex items-center flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            icon={Edit}
            onClick={() => setEditModalOpen(true)}
          >
            Edit Patient
          </Button>

          <Button
            variant="teal"
            size="sm"
            icon={Calendar}
            onClick={() => navigate(`/admin/appointments/new?patient_id=${patient.id}`)}
          >
            Book Appointment
          </Button>

          <Button
            variant="outline"
            size="sm"
            icon={Download}
            onClick={handleDownloadReport}
          >
            Download Patient Report
          </Button>

          <Button
            variant={patient.status === 'Active' ? 'danger' : 'outline'}
            size="sm"
            icon={patient.status === 'Active' ? UserX : UserCheck}
            onClick={() => setConfirmDeactivateOpen(true)}
          >
            {patient.status === 'Active' ? 'Deactivate' : 'Activate'}
          </Button>
        </div>
      </div>

      {/* Allergies Critical Banner if present */}
      {patient.allergies && patient.allergies.length > 0 && (
        <div className="bg-rose-50 border border-rose-200 rounded-xl p-3.5 flex items-center gap-3">
          <div className="p-1.5 rounded-lg bg-rose-100 text-rose-700">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs font-bold text-rose-800 uppercase tracking-wider">
              Critical Allergies Documented:
            </span>
            <p className="text-xs font-medium text-rose-700 mt-0.5">
              {patient.allergies.join(', ')}
            </p>
          </div>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="border-b border-slate-200">
        <nav className="flex space-x-6 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`py-3 px-1 border-b-2 font-medium text-xs sm:text-sm whitespace-nowrap transition-colors ${
                activeTab === tab.key
                  ? 'border-teal-600 text-teal-700 font-semibold'
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Panels */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            {/* Demographic Card */}
            <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs space-y-4">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-2">
                Demographic Profile
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
                <div>
                  <span className="text-slate-400">Date of Birth</span>
                  <p className="font-semibold text-slate-800 mt-0.5">{formatDate(patient.dob)}</p>
                </div>
                <div>
                  <span className="text-slate-400">Marital Status</span>
                  <p className="font-semibold text-slate-800 mt-0.5">{patient.marital_status || 'Single'}</p>
                </div>
                <div>
                  <span className="text-slate-400">Blood Group</span>
                  <p className="font-semibold text-slate-800 mt-0.5">{patient.blood_group}</p>
                </div>
                <div>
                  <span className="text-slate-400">Phone Number</span>
                  <p className="font-semibold text-slate-800 mt-0.5">{patient.phone}</p>
                </div>
                <div>
                  <span className="text-slate-400">Email Address</span>
                  <p className="font-semibold text-slate-800 mt-0.5">{patient.email || 'None'}</p>
                </div>
                <div>
                  <span className="text-slate-400">Residential Address</span>
                  <p className="font-semibold text-slate-800 mt-0.5">
                    {patient.address ? `${patient.address}, ${patient.city}, ${patient.state} ${patient.pincode}` : 'Not provided'}
                  </p>
                </div>
              </div>
            </div>

            {/* Emergency Contact */}
            <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs space-y-3">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-2">
                Emergency Information
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div>
                  <span className="text-slate-400">Emergency Contact</span>
                  <p className="font-semibold text-slate-800 mt-0.5">{patient.emergency_name || 'N/A'}</p>
                </div>
                <div>
                  <span className="text-slate-400">Relationship</span>
                  <p className="font-semibold text-slate-800 mt-0.5">{patient.emergency_relation || 'N/A'}</p>
                </div>
                <div>
                  <span className="text-slate-400">Emergency Phone</span>
                  <p className="font-semibold text-slate-800 mt-0.5">{patient.emergency_phone || 'N/A'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Summary Sidebar */}
          <div className="space-y-4">
            <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs space-y-3">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Quick Clinical Actions
              </h3>
              <Button
                variant="teal"
                size="sm"
                className="w-full justify-start"
                icon={Calendar}
                onClick={() => navigate(`/admin/appointments/new?patient_id=${patient.id}`)}
              >
                Schedule Appointment
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start"
                icon={FileText}
                onClick={() => setActiveTab('history')}
              >
                View Medical History
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start"
                icon={Activity}
                onClick={() => setActiveTab('prescriptions')}
              >
                View Prescriptions
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Medical History Tab */}
      {activeTab === 'history' && (
        <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
              Diagnosed Clinical Conditions & History
            </h3>
          </div>
          {patient.medical_history && patient.medical_history.length > 0 ? (
            <div className="divide-y divide-slate-100">
              {patient.medical_history.map((rec, i) => (
                <div key={i} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <div className="text-sm font-semibold text-slate-800">{rec.condition}</div>
                    <div className="text-xs text-slate-500">{rec.notes}</div>
                    <div className="text-[11px] text-teal-600 font-medium mt-0.5">
                      Diagnosed by {rec.diagnosed_by}
                    </div>
                  </div>
                  <span className="text-xs font-mono text-slate-400">{rec.date}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-500 py-6 text-center">No past medical history recorded.</p>
          )}
        </div>
      )}

      {/* Appointments Tab */}
      {activeTab === 'appointments' && (
        <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
              Appointment Records
            </h3>
            <Button
              variant="teal"
              size="sm"
              icon={Plus}
              onClick={() => navigate(`/admin/appointments/new?patient_id=${patient.id}`)}
            >
              Book New
            </Button>
          </div>
          <div className="divide-y divide-slate-100">
            {appointments.map((apt) => (
              <div key={apt.id} className="py-3 flex items-center justify-between">
                <div>
                  <div className="text-sm font-semibold text-slate-800">
                    {apt.appointment_type} with {apt.doctor_name}
                  </div>
                  <div className="text-xs text-slate-500">
                    {apt.appointment_date} at {apt.appointment_time} • {apt.reason}
                  </div>
                </div>
                <StatusBadge status={apt.status} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Prescriptions Tab */}
      {activeTab === 'prescriptions' && (
        <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
            Prescriptions Issued
          </h3>
          <div className="divide-y divide-slate-100">
            {prescriptions.map((rx) => (
              <div key={rx.id} className="py-3 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-semibold text-slate-800">
                    {rx.id} • {rx.diagnosis}
                  </div>
                  <StatusBadge status={rx.status} />
                </div>
                <div className="text-xs text-slate-500">Prescribed by {rx.doctor_name} on {rx.date}</div>
                <div className="bg-slate-50 p-2.5 rounded-lg space-y-1">
                  {rx.medicines?.map((m, idx) => (
                    <div key={idx} className="text-xs text-slate-700 flex justify-between">
                      <span className="font-medium">• {m.name} ({m.dosage})</span>
                      <span className="text-slate-500">{m.frequency} for {m.duration}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Billing Tab */}
      {activeTab === 'billing' && (
        <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
            Invoices and Statements
          </h3>
          <div className="divide-y divide-slate-100">
            {invoices.map((inv) => (
              <div key={inv.id} className="py-3 flex items-center justify-between">
                <div>
                  <div className="text-sm font-semibold text-slate-800">
                    {inv.id} • Total: {formatCurrency(inv.total_amount)}
                  </div>
                  <div className="text-xs text-slate-500">
                    Paid: {formatCurrency(inv.paid_amount)} | Balance: {formatCurrency(inv.balance)}
                  </div>
                </div>
                <StatusBadge status={inv.payment_status} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Documents Tab */}
      {activeTab === 'documents' && (
        <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs space-y-4 text-center py-10">
          <FileText className="w-10 h-10 text-slate-300 mx-auto" />
          <p className="text-sm font-semibold text-slate-700">Digital Clinical Archive</p>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Lab results, scanned insurance identification, and signed consent waivers are securely mirrored in MediCore cloud storage.
          </p>
          <Button variant="outline" size="sm" onClick={handleDownloadReport}>
            Download Full Clinical Dossier
          </Button>
        </div>
      )}

      {/* Edit Patient Modal */}
      <Modal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        title="Edit Patient Information"
        subtitle={`Updating records for ${patient.full_name} (${patient.id})`}
      >
        <form onSubmit={handleSaveEdit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="First Name"
              value={editForm.first_name || ''}
              onChange={(e) => setEditForm({ ...editForm, first_name: e.target.value })}
              required
            />
            <Input
              label="Last Name"
              value={editForm.last_name || ''}
              onChange={(e) => setEditForm({ ...editForm, last_name: e.target.value })}
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Phone Number"
              value={editForm.phone || ''}
              onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
              required
            />
            <Input
              label="Email Address"
              value={editForm.email || ''}
              onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
            />
          </div>
          <Input
            label="Street Address"
            value={editForm.address || ''}
            onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
          />
          <div className="grid grid-cols-3 gap-3">
            <Input
              label="City"
              value={editForm.city || ''}
              onChange={(e) => setEditForm({ ...editForm, city: e.target.value })}
            />
            <Input
              label="State"
              value={editForm.state || ''}
              onChange={(e) => setEditForm({ ...editForm, state: e.target.value })}
            />
            <Input
              label="Pincode"
              value={editForm.pincode || ''}
              onChange={(e) => setEditForm({ ...editForm, pincode: e.target.value })}
            />
          </div>
          <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
            <Button variant="outline" size="sm" onClick={() => setEditModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="teal" size="sm" loading={savingEdit}>
              Save Changes
            </Button>
          </div>
        </form>
      </Modal>

      {/* Deactivate / Reactivate Confirm Dialog */}
      <ConfirmDialog
        isOpen={confirmDeactivateOpen}
        onClose={() => setConfirmDeactivateOpen(false)}
        onConfirm={handleToggleStatus}
        title={patient.status === 'Active' ? 'Deactivate Patient Profile?' : 'Activate Patient Profile?'}
        message={`Are you sure you want to change the status of ${patient.full_name}?`}
        confirmText={patient.status === 'Active' ? 'Deactivate' : 'Activate'}
        type={patient.status === 'Active' ? 'danger' : 'info'}
        loading={statusLoading}
      />
    </div>
  );
};

export default PatientDetails;

