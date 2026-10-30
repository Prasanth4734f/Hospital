import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { medicalService } from '../../services/medicalService';
import { patientService } from '../../services/patientService';
import { useNotificationContext } from '../../context/NotificationContext';
import DataTable from '../../components/common/DataTable';
import Button from '../../components/common/Button';
import SearchBar from '../../components/common/SearchBar';
import StatusBadge from '../../components/common/StatusBadge';
import Modal from '../../components/common/Modal';
import { FileText, Eye, Download, Activity, Heart, Thermometer, Plus } from 'lucide-react';

export const MedicalRecords = () => {
  const navigate = useNavigate();
  const { addToast } = useNotificationContext();

  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);

  useEffect(() => {
    // Fetch initial sample medical records from PAT-1001 or all
    medicalService.getPatientRecords('PAT-1001').then((res) => {
      if (res.success && res.data) {
        setRecords(res.data);
      }
      setLoading(false);
    });
  }, []);

  const handleExport = () => {
    const jsonStr = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(records, null, 2))}`;
    const a = document.createElement('a');
    a.href = jsonStr;
    a.download = `MediCore_Clinical_Records_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    addToast('Clinical medical records exported', 'success');
  };

  const columns = [
    {
      key: 'id',
      header: 'Record ID',
      render: (r) => <span className="font-semibold text-primary">{r.id}</span>,
    },
    {
      key: 'patient_id',
      header: 'Patient ID',
      render: (r) => <span className="font-medium text-slate-700">{r.patient_id}</span>,
    },
    {
      key: 'doctor_name',
      header: 'Attending Doctor',
    },
    {
      key: 'date',
      header: 'Consultation Date',
    },
    {
      key: 'diagnosis',
      header: 'Diagnosis',
      render: (r) => <span className="font-medium text-slate-800">{r.diagnosis}</span>,
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
            setViewModalOpen(true);
          }}
          className="p-1.5 rounded-lg text-slate-500 hover:text-teal-600 hover:bg-teal-50 transition-colors"
          title="View Medical Record"
        >
          <Eye className="w-4 h-4" />
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Electronic Medical Records (EMR)</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Clinical examinations, diagnostic evaluations, vitals, and progress notes
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button variant="outline" size="sm" icon={Download} onClick={handleExport}>
            Export Records
          </Button>
        </div>
      </div>

      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Search by diagnosis, record ID, or attending clinician..."
        />
      </div>

      <DataTable
        columns={columns}
        data={records}
        loading={loading}
        emptyTitle="No Medical Records"
        emptyDescription="Clinical records recorded during consultations appear here."
      />

      {/* Record Modal */}
      <Modal
        isOpen={viewModalOpen}
        onClose={() => setViewModalOpen(false)}
        title="Electronic Medical Record Dossier"
        subtitle={selectedRecord?.id}
        footer={
          <Button variant="primary" size="sm" onClick={() => setViewModalOpen(false)}>
            Close
          </Button>
        }
      >
        {selectedRecord && (
          <div className="space-y-4 text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div>
                <span className="text-slate-400">Consultation Date</span>
                <p className="font-semibold text-slate-800">{selectedRecord.date}</p>
              </div>
              <StatusBadge status={selectedRecord.status} />
            </div>

            {/* Vitals Grid */}
            <div>
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 block">
                Recorded Vitals
              </span>
              <div className="grid grid-cols-4 gap-2 text-center">
                <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                  <span className="text-[10px] text-slate-400 uppercase">Blood Pressure</span>
                  <p className="font-bold text-slate-800 text-sm mt-0.5">{selectedRecord.bp || '120/80'}</p>
                </div>
                <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                  <span className="text-[10px] text-slate-400 uppercase">Heart Rate</span>
                  <p className="font-bold text-slate-800 text-sm mt-0.5">{selectedRecord.heart_rate || '72 bpm'}</p>
                </div>
                <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                  <span className="text-[10px] text-slate-400 uppercase">Body Temp</span>
                  <p className="font-bold text-slate-800 text-sm mt-0.5">{selectedRecord.temperature || '98.6 °F'}</p>
                </div>
                <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                  <span className="text-[10px] text-slate-400 uppercase">SpO2 Oxygen</span>
                  <p className="font-bold text-slate-800 text-sm mt-0.5">{selectedRecord.spo2 || '99 %'}</p>
                </div>
              </div>
            </div>

            <div>
              <span className="text-slate-400">Chief Complaint & Symptoms</span>
              <p className="font-medium text-slate-800 p-2.5 bg-slate-50 rounded-lg mt-1 border border-slate-100">
                {selectedRecord.chief_complaint}: {selectedRecord.symptoms}
              </p>
            </div>

            <div>
              <span className="text-slate-400">Primary Clinical Diagnosis</span>
              <p className="font-semibold text-teal-800 p-2.5 bg-teal-50 rounded-lg mt-1 border border-teal-200">
                {selectedRecord.diagnosis}
              </p>
            </div>

            <div>
              <span className="text-slate-400">Clinical Progress & Plan</span>
              <p className="font-medium text-slate-700 p-2.5 bg-slate-50 rounded-lg mt-1 border border-slate-100 whitespace-pre-wrap">
                {selectedRecord.clinical_notes}
              </p>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default MedicalRecords;

