import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { prescriptionService } from '../../services/prescriptionService';
import { useNotificationContext } from '../../context/NotificationContext';
import DataTable from '../../components/common/DataTable';
import Button from '../../components/common/Button';
import SearchBar from '../../components/common/SearchBar';
import StatusBadge from '../../components/common/StatusBadge';
import Modal from '../../components/common/Modal';
import { Pill, Eye, Download, Printer, Plus, FileText } from 'lucide-react';

export const Prescriptions = () => {
  const navigate = useNavigate();
  const { addToast } = useNotificationContext();

  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedRx, setSelectedRx] = useState(null);
  const [previewOpen, setPreviewOpen] = useState(false);

  const fetchPrescriptions = useCallback(async () => {
    try {
      setLoading(true);
      const res = await prescriptionService.getPrescriptions({ search: search.trim() || undefined });
      if (res.success && res.data) {
        setPrescriptions(res.data);
      }
    } catch (err) {
      addToast('Failed to load prescriptions', 'error');
    } finally {
      setLoading(false);
    }
  }, [search, addToast]);

  useEffect(() => {
    fetchPrescriptions();
  }, [fetchPrescriptions]);

  const handlePrint = () => {
    window.print();
    addToast('Prescription sent to print queue', 'info');
  };

  const handleDownloadPdf = (rx) => {
    const rxText = `
MEDICORE HEALTHCARE ECOSYSTEM - OFFICIAL PRESCRIPTION
=====================================================
Prescription ID: ${rx.id}
Date: ${rx.date}
Patient: ${rx.patient_name} (${rx.patient_id})
Doctor: ${rx.doctor_name}
Diagnosis: ${rx.diagnosis}

PRESCRIBED MEDICATIONS:
${(rx.medicines || [])
  .map(
    (m, i) =>
      `${i + 1}. ${m.name} (${m.dosage}) - ${m.frequency} for ${m.duration} [${m.route}]\n   Instructions: ${m.instructions}`
  )
  .join('\n\n')}
=====================================================
Status: ${rx.status}
Digitally Verified through MediCore Clinical System
    `;
    const blob = new Blob([rxText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `MediCore_${rx.id}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    addToast('Prescription downloaded successfully', 'success');
  };

  const columns = [
    {
      key: 'id',
      header: 'Prescription ID',
      render: (p) => <span className="font-semibold text-primary">{p.id}</span>,
    },
    {
      key: 'patient_name',
      header: 'Patient',
      render: (p) => (
        <div>
          <div className="font-semibold text-slate-800">{p.patient_name}</div>
          <div className="text-[11px] text-slate-400">{p.patient_id}</div>
        </div>
      ),
    },
    {
      key: 'doctor_name',
      header: 'Prescribing Clinician',
    },
    {
      key: 'date',
      header: 'Date Issued',
    },
    {
      key: 'diagnosis',
      header: 'Clinical Diagnosis',
    },
    {
      key: 'medicines',
      header: 'Items Count',
      render: (p) => <span>{p.medicines?.length || 0} drugs</span>,
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
            title="Preview Prescription"
            onClick={() => {
              setSelectedRx(p);
              setPreviewOpen(true);
            }}
            className="p-1.5 rounded-lg text-slate-500 hover:text-teal-600 hover:bg-teal-50 transition-colors"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            type="button"
            title="Download Prescription"
            onClick={() => handleDownloadPdf(p)}
            className="p-1.5 rounded-lg text-slate-500 hover:text-sky-600 hover:bg-sky-50 transition-colors"
          >
            <Download className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Prescription Management</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Clinical pharmaceutical regimens, dosages, duration, and patient prescriptions
          </p>
        </div>
      </div>

      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Search by patient name, prescription ID, or diagnosis..."
        />
      </div>

      <DataTable
        columns={columns}
        data={prescriptions}
        loading={loading}
        emptyTitle="No Prescriptions Found"
        emptyDescription="Clinical prescriptions saved by doctors appear here."
      />

      {/* Prescription Preview Modal */}
      <Modal
        isOpen={previewOpen}
        onClose={() => setPreviewOpen(false)}
        title="Official Hospital Prescription"
        subtitle={selectedRx?.id}
        footer={
          <div className="flex items-center justify-between w-full">
            <Button variant="outline" size="sm" icon={Printer} onClick={handlePrint}>
              Print Prescription
            </Button>
            <div className="flex items-center gap-2">
              <Button
                variant="teal"
                size="sm"
                icon={Download}
                onClick={() => selectedRx && handleDownloadPdf(selectedRx)}
              >
                Download Copy
              </Button>
              <Button variant="primary" size="sm" onClick={() => setPreviewOpen(false)}>
                Close
              </Button>
            </div>
          </div>
        }
      >
        {selectedRx && (
          <div className="space-y-4 text-xs font-sans">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div>
                <h4 className="font-bold text-base text-slate-800">MediCore Medical Center</h4>
                <p className="text-slate-400">Department of Clinical Medicine</p>
              </div>
              <div className="text-right">
                <span className="font-mono font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                  {selectedRx.id}
                </span>
                <p className="text-[11px] text-slate-400 mt-1">Issued: {selectedRx.date}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 p-3 bg-slate-50 rounded-lg">
              <div>
                <span className="text-slate-400">Patient</span>
                <p className="font-semibold text-slate-800 mt-0.5">{selectedRx.patient_name}</p>
                <p className="text-[11px] text-slate-500">ID: {selectedRx.patient_id}</p>
              </div>
              <div>
                <span className="text-slate-400">Prescribing Physician</span>
                <p className="font-semibold text-slate-800 mt-0.5">{selectedRx.doctor_name}</p>
                <p className="text-[11px] text-teal-600">Diagnosis: {selectedRx.diagnosis}</p>
              </div>
            </div>

            <div>
              <h5 className="font-bold text-xs uppercase tracking-wider text-slate-700 mb-2">
                Prescribed Formulations (Rx)
              </h5>
              <div className="space-y-2">
                {selectedRx.medicines?.map((m, idx) => (
                  <div key={idx} className="p-3 bg-white rounded-lg border border-slate-200 space-y-1">
                    <div className="flex items-center justify-between font-semibold text-slate-800">
                      <span>
                        {idx + 1}. {m.name}
                      </span>
                      <span className="text-teal-700 font-mono text-xs">{m.dosage}</span>
                    </div>
                    <div className="text-slate-500 flex items-center gap-3 text-[11px]">
                      <span><strong>Freq:</strong> {m.frequency}</span>
                      <span><strong>Duration:</strong> {m.duration}</span>
                      <span><strong>Route:</strong> {m.route}</span>
                    </div>
                    <p className="text-slate-600 italic text-[11px] pt-1 border-t border-slate-100">
                      Instructions: {m.instructions}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Prescriptions;

