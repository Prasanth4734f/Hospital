import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { prescriptionService } from '../../services/prescriptionService';
import { useNotificationContext } from '../../context/NotificationContext';
import DataTable from '../../components/common/DataTable';
import Button from '../../components/common/Button';
import StatusBadge from '../../components/common/StatusBadge';
import Modal from '../../components/common/Modal';
import { Pill, Eye, Download, Printer } from 'lucide-react';

export const PatientPrescriptions = () => {
  const { user } = useAuth();
  const { addToast } = useNotificationContext();
  const patientId = user?.patient_id || 'PAT-1001';

  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRx, setSelectedRx] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    prescriptionService.getPatientPrescriptions(patientId).then((res) => {
      if (res.success && res.data) setPrescriptions(res.data);
      setLoading(false);
    });
  }, [patientId]);

  const handleDownload = (rx) => {
    const text = `
MEDICORE PRESCRIPTION
ID: ${rx.id}
Date: ${rx.date}
Doctor: ${rx.doctor_name}
Diagnosis: ${rx.diagnosis}

Medications:
${(rx.medicines || []).map((m, i) => `${i + 1}. ${m.name} (${m.dosage}) - ${m.frequency} for ${m.duration} [${m.instructions}]`).join('\n')}
    `;
    const blob = new Blob([text], { type: 'text/plain' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `Prescription_${rx.id}.txt`;
    a.click();
    addToast('Prescription script downloaded', 'success');
  };

  const columns = [
    {
      key: 'id',
      header: 'Prescription Ref',
      render: (p) => <span className="font-semibold text-primary">{p.id}</span>,
    },
    {
      key: 'doctor_name',
      header: 'Prescribing Physician',
    },
    {
      key: 'date',
      header: 'Date Issued',
    },
    {
      key: 'diagnosis',
      header: 'Indication / Diagnosis',
      render: (p) => <span className="font-semibold text-slate-800">{p.diagnosis}</span>,
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
            onClick={() => {
              setSelectedRx(p);
              setModalOpen(true);
            }}
          >
            View
          </Button>
          <Button
            variant="teal"
            size="sm"
            icon={Download}
            onClick={() => handleDownload(p)}
          >
            Download
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-slate-800 tracking-tight">My Prescriptions</h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Access your digital medical prescriptions and instructions
        </p>
      </div>

      <DataTable columns={columns} data={prescriptions} loading={loading} />

      {/* Prescription View Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Electronic Prescription Script"
        subtitle={selectedRx?.id}
        footer={
          <div className="flex justify-between w-full">
            <Button variant="outline" size="sm" icon={Printer} onClick={() => window.print()}>
              Print Script
            </Button>
            <Button variant="primary" size="sm" onClick={() => setModalOpen(false)}>
              Close
            </Button>
          </div>
        }
      >
        {selectedRx && (
          <div className="space-y-4 text-xs">
            <div className="p-3 bg-slate-50 rounded-lg flex justify-between">
              <div>
                <p className="font-bold text-slate-800">{selectedRx.doctor_name}</p>
                <p className="text-slate-500">Diagnosis: {selectedRx.diagnosis}</p>
              </div>
              <span className="font-mono text-teal-700 font-bold">{selectedRx.date}</span>
            </div>

            <div className="space-y-2">
              {selectedRx.medicines?.map((m, i) => (
                <div key={i} className="p-3 border rounded-lg bg-white space-y-1">
                  <div className="font-semibold text-slate-800">
                    {i + 1}. {m.name} ({m.dosage})
                  </div>
                  <div className="text-slate-500 text-[11px]">
                    Frequency: {m.frequency} • Duration: {m.duration} • Route: {m.route}
                  </div>
                  <p className="text-teal-700 italic text-[11px]">Instructions: {m.instructions}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default PatientPrescriptions;

