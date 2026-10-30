import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { prescriptionService } from '../../services/prescriptionService';
import { patientService } from '../../services/patientService';
import { DOSAGE_FREQUENCIES, DOSAGE_ROUTES } from '../../utils/constants';
import { useNotificationContext } from '../../context/NotificationContext';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import {
  Pill,
  Plus,
  Trash2,
  Save,
  Eye,
  Download,
  Printer,
  X,
  ArrowLeft,
} from 'lucide-react';

export const DoctorPrescriptions = () => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { addToast } = useNotificationContext();

  const patientIdParam = searchParams.get('patient_id') || 'PAT-1001';
  const appointmentIdParam = searchParams.get('appointment_id') || 'APT-3001';

  const [patient, setPatient] = useState(null);
  const [prescriptionId] = useState(`RX-${Math.floor(700 + Math.random() * 300)}`);
  const [prescriptionDate] = useState(new Date().toISOString().split('T')[0]);
  const [diagnosis, setDiagnosis] = useState('Acute Clinical Episode');

  // Dynamic Medicine Entries
  const [medicines, setMedicines] = useState([
    {
      name: 'Amoxicillin + Clavulanate 625mg',
      type: 'Tablet',
      dosage: '625 mg',
      frequency: 'Twice daily (BD)',
      duration: '7 Days',
      route: 'Oral',
      instructions: 'Take after meals with water',
    },
  ]);

  const [saving, setSaving] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);

  useEffect(() => {
    patientService.getPatientById(patientIdParam).then((res) => {
      if (res.success && res.data) setPatient(res.data);
    });
  }, [patientIdParam]);

  const addMedicineRow = () => {
    setMedicines([
      ...medicines,
      {
        name: '',
        type: 'Tablet',
        dosage: '',
        frequency: 'Once daily (OD)',
        duration: '5 Days',
        route: 'Oral',
        instructions: 'Take after food',
      },
    ]);
    addToast('New medication row added', 'info');
  };

  const removeMedicineRow = (index) => {
    if (medicines.length <= 1) {
      addToast('Prescription must contain at least one medication.', 'warning');
      return;
    }
    const updated = medicines.filter((_, idx) => idx !== index);
    setMedicines(updated);
  };

  const handleMedChange = (index, field, value) => {
    const updated = [...medicines];
    updated[index][field] = value;
    setMedicines(updated);
  };

  const handleSave = async (e) => {
    if (e) e.preventDefault();

    const emptyName = medicines.some((m) => !m.name.trim());
    if (emptyName) {
      addToast('Please specify medicine names for all rows.', 'warning');
      return;
    }

    try {
      setSaving(true);
      const payload = {
        id: prescriptionId,
        patient_id: patientIdParam,
        patient_name: patient?.full_name || 'Eleanor Vance',
        doctor_id: user?.doctor_id || 'DOC-201',
        doctor_name: user?.full_name || 'Dr. Sarah Jenkins',
        consultation_id: appointmentIdParam,
        date: prescriptionDate,
        diagnosis,
        medicines,
      };

      const res = await prescriptionService.createPrescription(payload);
      if (res.success) {
        addToast('Prescription saved successfully.', 'success');
        setPreviewOpen(true);
      }
    } catch (err) {
      addToast(err.message || 'Failed to save prescription', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handlePrint = () => {
    window.print();
    addToast('Prescription sent to print queue', 'info');
  };

  const handleDownloadPdf = () => {
    const content = `
MEDICORE HEALTHCARE ECOSYSTEM - PRESCRIPTION
============================================
Prescription ID: ${prescriptionId}
Date: ${prescriptionDate}
Patient: ${patient?.full_name} (${patientIdParam})
Doctor: ${user?.full_name || 'Dr. Sarah Jenkins'}
Consultation ID: ${appointmentIdParam}
Diagnosis: ${diagnosis}

MEDICATIONS:
${medicines
  .map(
    (m, i) =>
      `${i + 1}. ${m.name} (${m.dosage}) - ${m.frequency} for ${m.duration} [${m.route}]\n   Notes: ${m.instructions}`
  )
  .join('\n\n')}
============================================
Digitally Signed by Prescribing Physician
    `;
    const blob = new Blob([content], { type: 'text/plain' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `Prescription_${prescriptionId}.txt`;
    a.click();
    addToast('Prescription copy downloaded', 'success');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-slate-800 tracking-tight">Prescription Generator</h1>
            <p className="text-xs text-slate-500">Formulate therapeutic clinical dosage and digital script</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            id="btn_preview_prescription"
            variant="outline"
            size="sm"
            icon={Eye}
            onClick={() => setPreviewOpen(true)}
          >
            Preview Script
          </Button>

          <Button
            id="btn_cancel_prescription"
            variant="ghost"
            size="sm"
            icon={X}
            onClick={() => navigate('/doctor/dashboard')}
          >
            Cancel
          </Button>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Prescription Metadata Header Card */}
        <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs space-y-4">
          <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-2">
            Prescription Clinical Context
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <span className="text-slate-400">Prescription ID</span>
              <p className="font-mono font-bold text-teal-700 mt-0.5">{prescriptionId}</p>
            </div>
            <div>
              <span className="text-slate-400">Patient</span>
              <p className="font-bold text-slate-800 mt-0.5">{patient?.full_name || 'Loading...'}</p>
              <p className="text-[11px] text-slate-400">{patientIdParam}</p>
            </div>
            <div>
              <span className="text-slate-400">Physician</span>
              <p className="font-bold text-slate-800 mt-0.5">{user?.full_name || 'Dr. Sarah Jenkins'}</p>
              <p className="text-[11px] text-slate-400">{user?.doctor_id || 'DOC-201'}</p>
            </div>
            <div>
              <span className="text-slate-400">Consultation ID</span>
              <p className="font-semibold text-slate-700 mt-0.5">{appointmentIdParam}</p>
            </div>
            <div>
              <span className="text-slate-400">Prescription Date</span>
              <p className="font-semibold text-slate-700 mt-0.5">{prescriptionDate}</p>
            </div>
            <div>
              <span className="text-slate-400">Diagnosis / Indication</span>
              <input
                type="text"
                value={diagnosis}
                onChange={(e) => setDiagnosis(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded px-2 py-1 text-xs text-slate-800 mt-0.5 focus:border-teal-500"
              />
            </div>
          </div>
        </div>

        {/* Dynamic Medicines Form */}
        <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Prescribed Medicines ({medicines.length})
            </h2>
            <Button
              id="btn_add_medicine"
              type="button"
              variant="teal"
              size="sm"
              icon={Plus}
              onClick={addMedicineRow}
            >
              Add Medicine
            </Button>
          </div>

          <div className="space-y-4">
            {medicines.map((med, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3 relative group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700">Drug Formulation #{idx + 1}</span>
                  {medicines.length > 1 && (
                    <button
                      id="btn_remove_medicine"
                      type="button"
                      onClick={() => removeMedicineRow(idx)}
                      className="text-slate-400 hover:text-rose-600 transition-colors p-1"
                      title="Remove this medicine"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <Input
                    label="Medicine Name"
                    placeholder="e.g. Atorvastatin"
                    value={med.name}
                    onChange={(e) => handleMedChange(idx, 'name', e.target.value)}
                    required
                  />
                  <Select
                    label="Dosage Form"
                    value={med.type}
                    onChange={(e) => handleMedChange(idx, 'type', e.target.value)}
                    options={['Tablet', 'Capsule', 'Syrup', 'Injection', 'Ointment', 'Inhaler', 'Drops']}
                  />
                  <Input
                    label="Dosage Strength"
                    placeholder="e.g. 500 mg, 10 ml"
                    value={med.dosage}
                    onChange={(e) => handleMedChange(idx, 'dosage', e.target.value)}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <Select
                    label="Frequency"
                    value={med.frequency}
                    onChange={(e) => handleMedChange(idx, 'frequency', e.target.value)}
                    options={DOSAGE_FREQUENCIES}
                  />
                  <Input
                    label="Duration"
                    placeholder="e.g. 7 Days, 1 Month"
                    value={med.duration}
                    onChange={(e) => handleMedChange(idx, 'duration', e.target.value)}
                    required
                  />
                  <Select
                    label="Route of Administration"
                    value={med.route}
                    onChange={(e) => handleMedChange(idx, 'route', e.target.value)}
                    options={DOSAGE_ROUTES}
                  />
                </div>

                <Input
                  label="Instructions for Patient"
                  placeholder="e.g. Take 30 minutes after dinner with a full glass of water"
                  value={med.instructions}
                  onChange={(e) => handleMedChange(idx, 'instructions', e.target.value)}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Buttons Row */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Button
            id="btn_save_prescription"
            type="submit"
            variant="teal"
            icon={Save}
            loading={saving}
          >
            Save Prescription
          </Button>
        </div>
      </form>

      {/* Preview Modal */}
      <Modal
        isOpen={previewOpen}
        onClose={() => setPreviewOpen(false)}
        title="Prescription Script Preview"
        subtitle={prescriptionId}
        footer={
          <div className="flex items-center justify-between w-full">
            <Button
              id="btn_print_prescription"
              variant="outline"
              size="sm"
              icon={Printer}
              onClick={handlePrint}
            >
              Print
            </Button>
            <div className="flex items-center gap-2">
              <Button
                id="btn_download_pdf"
                variant="teal"
                size="sm"
                icon={Download}
                onClick={handleDownloadPdf}
              >
                Download Script
              </Button>
              <Button variant="primary" size="sm" onClick={() => setPreviewOpen(false)}>
                Done
              </Button>
            </div>
          </div>
        }
      >
        <div className="space-y-4 text-xs">
          <div className="p-3 bg-slate-50 rounded-lg flex justify-between">
            <div>
              <p className="font-bold text-slate-800">{patient?.full_name}</p>
              <p className="text-slate-400">Diagnosis: {diagnosis}</p>
            </div>
            <div className="text-right">
              <p className="font-mono font-bold text-teal-700">{prescriptionId}</p>
              <p className="text-slate-400">{prescriptionDate}</p>
            </div>
          </div>

          <div className="space-y-2">
            {medicines.map((m, i) => (
              <div key={i} className="p-2.5 border rounded-lg bg-white">
                <div className="font-semibold text-slate-800">
                  {i + 1}. {m.name} ({m.dosage}) - {m.type}
                </div>
                <div className="text-slate-500 text-[11px] mt-0.5">
                  {m.frequency} • {m.duration} • {m.route}
                </div>
                <div className="text-slate-600 italic text-[11px] mt-1">
                  Note: {m.instructions}
                </div>
              </div>
            ))}
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default DoctorPrescriptions;

