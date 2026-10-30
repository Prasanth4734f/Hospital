import React, { useState, useEffect } from 'react';
import { pharmacyService } from '../../services/pharmacyService';
import DataTable from '../../components/common/DataTable';
import SearchBar from '../../components/common/SearchBar';
import Button from '../../components/common/Button';
import { Download } from 'lucide-react';

export const DispensingHistory = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    pharmacyService.getDispensingHistory().then((res) => {
      if (res.success && res.data) setHistory(res.data);
      setLoading(false);
    });
  }, []);

  const filtered = history.filter(
    (h) =>
      h.patient_name?.toLowerCase().includes(search.toLowerCase()) ||
      h.medicine?.toLowerCase().includes(search.toLowerCase()) ||
      h.prescription_id?.toLowerCase().includes(search.toLowerCase())
  );

  const columns = [
    {
      key: 'id',
      header: 'Dispense Ref',
      render: (h) => <span className="font-semibold text-primary">{h.id}</span>,
    },
    {
      key: 'prescription_id',
      header: 'Prescription ID',
      render: (h) => <span className="font-mono text-xs">{h.prescription_id}</span>,
    },
    {
      key: 'patient_name',
      header: 'Patient',
      render: (h) => (
        <div>
          <div className="font-semibold text-slate-800">{h.patient_name}</div>
          <div className="text-[11px] text-slate-400">{h.patient_id}</div>
        </div>
      ),
    },
    {
      key: 'medicine',
      header: 'Medication',
      render: (h) => <span className="font-semibold text-slate-800">{h.medicine}</span>,
    },
    {
      key: 'dispensed_qty',
      header: 'Qty',
      render: (h) => <span className="font-bold text-teal-700">{h.dispensed_qty} units</span>,
    },
    {
      key: 'batch_number',
      header: 'Batch',
      render: (h) => <span className="font-mono text-xs">{h.batch_number}</span>,
    },
    {
      key: 'dispensed_at',
      header: 'Timestamp',
    },
  ];

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Dispensing Audit Log</h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Historical record of pharmaceutical dispatches and pharmacist verifications
        </p>
      </div>

      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Search by patient, medicine name, or prescription ID..."
        />
      </div>

      <DataTable
        columns={columns}
        data={filtered}
        loading={loading}
        emptyTitle="No Dispensing Records"
      />
    </div>
  );
};

export default DispensingHistory;

