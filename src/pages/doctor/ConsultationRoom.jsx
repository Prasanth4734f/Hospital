import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { appointmentService } from '../../services/appointmentService';
import { patientService } from '../../services/patientService';
import { medicalService } from '../../services/medicalService';
import { useAuth } from '../../hooks/useAuth';
import { useNotificationContext } from '../../context/NotificationContext';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import StatusBadge from '../../components/common/StatusBadge';
import Loader from '../../components/common/Loader';
import Modal from '../../components/common/Modal';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import {
  ArrowLeft,
  Save,
  CheckCircle2,
  AlertTriangle,
  Pill,
  FileText,
  Activity,
  Heart,
  Thermometer,
  Wind,
  X,
  Lock,
} from 'lucide-react';

export const ConsultationRoom = () => {
  const { appointmentId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { addToast } = useNotificationContext();

  const [appointment, setAppointment] = useState(null);
  const [patient, setPatient] = useState(null);
  const [medicalRecord, setMedicalRecord] = useState(null);
  const [loading, setLoading] = useState(true);

  // Form State
  const [formData, setFormData] = useState({
    chief_complaint: '',
    symptoms: '',
    bp: '120/80',
    heart_rate: '72',
    temperature: '98.6',
    spo2: '99',
    diagnosis: '',
    clinical_notes: '',
    follow_up_date: '',
    status: 'Draft', // 'Draft' | 'Finalized'
  });

  const [savingDraft, setSavingDraft] = useState(false);
  const [finalizing, setFinalizing] = useState(false);
  const [historyModalOpen, setHistoryModalOpen] = useState(false);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);

  const fetchConsultationData = useCallback(async () => {
    try {
      setLoading(true);
      const aptRes = await appointmentService.getAppointmentById(appointmentId);
      if (aptRes.success && aptRes.data) {
        setAppointment(aptRes.data);

        // Fetch patient details
        const patRes = await patientService.getPatientById(aptRes.data.patient_id);
        if (patRes.success && patRes.data) {
          setPatient(patRes.data);
        }

        // Initialize form with reason
        setFormData((prev) => ({
          ...prev,
          chief_complaint: aptRes.data.reason || prev.chief_complaint,
        }));
      }
    } catch (err) {
      addToast('Error initializing clinical workspace', 'error');
    } finally {
      setLoading(false);
    }
  }, [appointmentId, addToast]);

  useEffect(() => {
    fetchConsultationData();
  }, [fetchConsultationData]);

  const isFinalized = formData.status === 'Finalized' || appointment?.status === 'Completed';

  const handleInputChange = (field, value) => {
    if (isFinalized) {
      addToast('Finalized medical records cannot be altered.', 'warning');
      return;
    }
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSaveDraft = async () => {
    try {
      setSavingDraft(true);
      const recordPayload = {
        appointment_id: appointmentId,
        patient_id: patient?.id,
        patient_name: patient?.full_name,
        doctor_id: user?.doctor_id || 'DOC-201',
        doctor_name: user?.full_name || 'Dr. Sarah Jenkins',
        status: 'Draft',
        ...formData,
      };
      const res = await medicalService.createMedicalRecord(recordPayload);
      if (res.success) {
        setMedicalRecord(res.data);
        addToast('Clinical consultation draft saved.', 'success');
      }
    } catch (err) {
      addToast(err.message || 'Failed to save draft', 'error');
    } finally {
      setSavingDraft(false);
    }
  };

  const handleCompleteConsultation = async () => {
    if (!formData.diagnosis.trim()) {
      addToast('Please enter a definitive clinical diagnosis before finalizing.', 'warning');
      return;
    }

    try {
      setFinalizing(true);
      const recordPayload = {
        appointment_id: appointmentId,
        patient_id: patient?.id,
        patient_name: patient?.full_name,
        doctor_id: user?.doctor_id || 'DOC-201',
        doctor_name: user?.full_name || 'Dr. Sarah Jenkins',
        status: 'Finalized',
        ...formData,
      };
      await medicalService.createMedicalRecord(recordPayload);
      await appointmentService.updateStatus(appointmentId, 'Completed');
      setFormData((prev) => ({ ...prev, status: 'Finalized' }));
      addToast('Consultation finalized and medical record locked successfully.', 'success');
    } catch (err) {
      addToast(err.message || 'Failed to finalize consultation', 'error');
    } finally {
      setFinalizing(false);
    }
  };

  if (loading) return <Loader message="Connecting clinical exam room telemetry..." />;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate('/doctor/consultations')}
            className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-slate-800 tracking-tight">Clinical Consultation Workspace</h1>
              <StatusBadge status={formData.status} />
              {isFinalized && (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                  <Lock className="w-3 h-3" /> Record Locked
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Consultation ID: {appointmentId} • Patient: {patient?.full_name} ({patient?.id})
            </p>
          </div>
        </div>

        {/* Top Actions */}
        <div className="flex items-center gap-2">
          <Button
            id="btn_view_patient_history"
            variant="outline"
            size="sm"
            icon={FileText}
            onClick={() => setHistoryModalOpen(true)}
          >
            View History
          </Button>

          <Button
            id="btn_create_prescription"
            variant="teal"
            size="sm"
            icon={Pill}
            onClick={() => navigate(`/doctor/prescriptions?patient_id=${patient?.id}&appointment_id=${appointmentId}`)}
          >
            Create Prescription
          </Button>
        </div>
      </div>

      {/* Patient Clinical Info Bar & Critical Allergies */}
      <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-teal-50 text-teal-700 flex items-center justify-center font-bold text-sm">
              {patient?.full_name?.charAt(0)}
            </div>
            <div>
              <div className="font-bold text-slate-800 text-sm">{patient?.full_name}</div>
              <div className="text-xs text-slate-500">
                {patient?.gender} • {patient?.age} yrs • Blood Group:{' '}
                <strong className="text-slate-800">{patient?.blood_group}</strong> • DOB: {patient?.dob}
              </div>
            </div>
          </div>
          <div className="text-xs text-slate-500">
            <strong>Contact:</strong> {patient?.phone}
          </div>
        </div>

        {/* Critical Allergies Badge */}
        {patient?.allergies && patient.allergies.length > 0 ? (
          <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-lg flex items-center gap-2 text-xs text-rose-800 font-semibold">
            <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0" />
            <span>Documented Allergies: {patient.allergies.join(', ')}</span>
          </div>
        ) : (
          <div className="text-xs text-slate-500 italic">No known drug allergies reported.</div>
        )}
      </div>

      {/* Consultation Medical Examination Form */}
      <div className="bg-white rounded-xl border border-slate-200/80 p-6 shadow-xs space-y-6">
        <div>
          <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-1">
            Clinical Examination & Vitals Assessment
          </h2>
          <p className="text-xs text-slate-400">
            Enter objective physiological observations and diagnostic conclusions
          </p>
        </div>

        {/* Vitals Telemetry Row */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
            Patient Vitals (Biometrics)
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <span className="text-[11px] text-slate-500 flex items-center gap-1 mb-1">
                <Activity className="w-3.5 h-3.5 text-teal-600" /> Blood Pressure
              </span>
              <input
                type="text"
                disabled={isFinalized}
                value={formData.bp}
                onChange={(e) => handleInputChange('bp', e.target.value)}
                placeholder="120/80 mmHg"
                className="w-full bg-white border border-slate-300 rounded-lg py-2 px-3 text-xs font-semibold text-slate-800 focus:outline-none focus:border-teal-500 disabled:bg-slate-50"
              />
            </div>
            <div>
              <span className="text-[11px] text-slate-500 flex items-center gap-1 mb-1">
                <Heart className="w-3.5 h-3.5 text-rose-500" /> Heart Rate (BPM)
              </span>
              <input
                type="text"
                disabled={isFinalized}
                value={formData.heart_rate}
                onChange={(e) => handleInputChange('heart_rate', e.target.value)}
                placeholder="72 bpm"
                className="w-full bg-white border border-slate-300 rounded-lg py-2 px-3 text-xs font-semibold text-slate-800 focus:outline-none focus:border-teal-500 disabled:bg-slate-50"
              />
            </div>
            <div>
              <span className="text-[11px] text-slate-500 flex items-center gap-1 mb-1">
                <Thermometer className="w-3.5 h-3.5 text-amber-500" /> Temp (°F)
              </span>
              <input
                type="text"
                disabled={isFinalized}
                value={formData.temperature}
                onChange={(e) => handleInputChange('temperature', e.target.value)}
                placeholder="98.6 °F"
                className="w-full bg-white border border-slate-300 rounded-lg py-2 px-3 text-xs font-semibold text-slate-800 focus:outline-none focus:border-teal-500 disabled:bg-slate-50"
              />
            </div>
            <div>
              <span className="text-[11px] text-slate-500 flex items-center gap-1 mb-1">
                <Wind className="w-3.5 h-3.5 text-sky-500" /> SpO2 Oxygen (%)
              </span>
              <input
                type="text"
                disabled={isFinalized}
                value={formData.spo2}
                onChange={(e) => handleInputChange('spo2', e.target.value)}
                placeholder="99 %"
                className="w-full bg-white border border-slate-300 rounded-lg py-2 px-3 text-xs font-semibold text-slate-800 focus:outline-none focus:border-teal-500 disabled:bg-slate-50"
              />
            </div>
          </div>
        </div>

        {/* Complaints and Symptoms */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Chief Complaint <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              disabled={isFinalized}
              value={formData.chief_complaint}
              onChange={(e) => handleInputChange('chief_complaint', e.target.value)}
              placeholder="e.g. Sharp chest discomfort, fever"
              className="w-full bg-white border border-slate-300 rounded-lg py-2 px-3 text-sm text-slate-800 focus:outline-none focus:border-teal-500 disabled:bg-slate-50"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Associated Symptoms & Duration
            </label>
            <input
              type="text"
              disabled={isFinalized}
              value={formData.symptoms}
              onChange={(e) => handleInputChange('symptoms', e.target.value)}
              placeholder="e.g. Persistent dry cough for 3 days"
              className="w-full bg-white border border-slate-300 rounded-lg py-2 px-3 text-sm text-slate-800 focus:outline-none focus:border-teal-500 disabled:bg-slate-50"
            />
          </div>
        </div>

        {/* Clinical Diagnosis */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
            Primary Clinical Diagnosis <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            disabled={isFinalized}
            value={formData.diagnosis}
            onChange={(e) => handleInputChange('diagnosis', e.target.value)}
            placeholder="e.g. Essential Hypertension (ICD-10 I10)"
            className="w-full bg-white border border-slate-300 rounded-lg py-2.5 px-3 text-sm font-semibold text-slate-900 focus:outline-none focus:border-teal-500 disabled:bg-slate-50"
          />
        </div>

        {/* Clinical Notes */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
            Clinical Notes, Observations & Treatment Plan
          </label>
          <textarea
            rows={4}
            disabled={isFinalized}
            value={formData.clinical_notes}
            onChange={(e) => handleInputChange('clinical_notes', e.target.value)}
            placeholder="Document physical examination findings, recommended imaging or lab investigations, dietary advisories, and therapy protocol..."
            className="w-full bg-white border border-slate-300 rounded-lg py-2.5 px-3 text-sm text-slate-800 focus:outline-none focus:border-teal-500 disabled:bg-slate-50"
          />
        </div>

        {/* Follow up date */}
        <div className="max-w-xs">
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
            Recommended Follow-up Date
          </label>
          <input
            type="date"
            disabled={isFinalized}
            value={formData.follow_up_date}
            onChange={(e) => handleInputChange('follow_up_date', e.target.value)}
            className="w-full bg-white border border-slate-300 rounded-lg py-2 px-3 text-xs text-slate-800 focus:outline-none focus:border-teal-500 disabled:bg-slate-50"
          />
        </div>

        {/* Buttons Row from Specification */}
        <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
          <Button
            id="btn_cancel_consultation"
            variant="ghost"
            size="sm"
            icon={X}
            onClick={() => setCancelModalOpen(true)}
          >
            Leave Consultation Room
          </Button>

          <div className="flex items-center gap-2.5">
            {!isFinalized && (
              <Button
                id="btn_save_draft"
                variant="outline"
                size="sm"
                icon={Save}
                loading={savingDraft}
                onClick={handleSaveDraft}
              >
                Save Draft
              </Button>
            )}

            {!isFinalized ? (
              <Button
                id="btn_complete_consultation"
                variant="teal"
                size="sm"
                icon={CheckCircle2}
                loading={finalizing}
                onClick={handleCompleteConsultation}
              >
                Finalize & Complete Consultation
              </Button>
            ) : (
              <Button
                variant="primary"
                size="sm"
                onClick={() => navigate('/doctor/consultations')}
              >
                Return to Consultations
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Patient Medical History Modal */}
      <Modal
        isOpen={historyModalOpen}
        onClose={() => setHistoryModalOpen(false)}
        title="Electronic Patient History"
        subtitle={patient?.full_name}
        footer={
          <Button variant="primary" size="sm" onClick={() => setHistoryModalOpen(false)}>
            Close History
          </Button>
        }
      >
        <div className="space-y-3 text-xs">
          {patient?.medical_history && patient.medical_history.length > 0 ? (
            <div className="divide-y divide-slate-100">
              {patient.medical_history.map((h, i) => (
                <div key={i} className="py-2.5">
                  <div className="flex justify-between font-semibold text-slate-800">
                    <span>{h.condition}</span>
                    <span className="text-slate-400">{h.date}</span>
                  </div>
                  <p className="text-slate-600 mt-0.5">{h.notes}</p>
                  <p className="text-[11px] text-teal-600 mt-0.5">Diagnosed by: {h.diagnosed_by}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-slate-500 py-4 text-center">No past clinical conditions documented.</p>
          )}
        </div>
      </Modal>

      {/* Leave Modal */}
      <ConfirmDialog
        isOpen={cancelModalOpen}
        onClose={() => setCancelModalOpen(false)}
        onConfirm={() => navigate('/doctor/consultations')}
        title="Leave Consultation Room?"
        message="Are you sure you want to exit the exam room? Unsaved draft changes will be discarded."
        confirmText="Exit Room"
        type="warning"
      />
    </div>
  );
};

export default ConsultationRoom;

