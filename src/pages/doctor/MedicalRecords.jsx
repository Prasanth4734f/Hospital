import React, { useState, useEffect } from 'react';
import { medicalService } from '../../services/medicalService';
import DataTable from '../../components/common/DataTable';
import SearchBar from '../../components/common/SearchBar';
import StatusBadge from '../../components/common/StatusBadge';
import Modal from '../../components/common/Modal';
import Button from '../../components/common/Button';
import { Eye } from 'lucide-react';

export const DoctorMedicalRecords = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    medicalService.getPatientRecords('PAT-1001').then((res) => {
      if (res.success && res.data) setRecords(res.data);
      setLoading(false);
    });
  }, []);

  const columns = [
    {
      key: 'id',
      header: 'Record ID',
      render: (r) => <span className="font-semibold text-primary">{r.id}</span>,
    },
    {
      key: 'patient_id',
      header: 'Patient ID',
    },
    {
      key: 'date',
      header: 'Date',
    },
    {
      key: 'diagnosis',
      header: 'Diagnosis',
      render: (r) => <span className="font-semibold text-slate-800">{r.diagnosis}</span>,
    },
    {
      key: 'status',
      header: 'Status',
      render: (r) => <StatusBadge status={r.status} />,
    },
    {
      key: 'actions',
      header: 'Actions',
      headerClassName: 'text-right',
      className: 'text-right',
      render: (r) => (
        <button
          type="button"
          onClick={() => {
            setSelectedRecord(r);
            setModalOpen(true);
          }}
          className="p-1.5 rounded-lg text-slate-500 hover:text-teal-600 hover:bg-teal-50"
        >
          <Eye className="w-4 h-4" />
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Clinical EMR Records</h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Review finalized examinations and clinical history
        </p>
      </div>

      <DataTable columns={columns} data={records} loading={loading} />

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Electronic Medical Record"
        subtitle={selectedRecord?.id}
        footer={
          <Button variant="primary" size="sm" onClick={() => setModalOpen(false)}>
            Close
          </Button>
        }
      >
        {selectedRecord && (
          <div className="space-y-3 text-xs">
            <div className="p-3 bg-slate-50 rounded-lg">
              <span className="text-slate-400">Diagnosis:</span>
              <p className="font-bold text-slate-800 text-sm">{selectedRecord.diagnosis}</p>
            </div>
            <div className="p-3 border rounded-lg">
              <span className="text-slate-400">Clinical Notes:</span>
              <p className="text-slate-700 mt-1 leading-relaxed">{selectedRecord.clinical_notes}</p>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default DoctorMedicalRecords;

