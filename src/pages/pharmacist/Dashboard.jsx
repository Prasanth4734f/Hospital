import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { pharmacyService } from '../../services/pharmacyService';
import Button from '../../components/common/Button';
import StatusBadge from '../../components/common/StatusBadge';
import Loader from '../../components/common/Loader';
import {
  Package,
  PlusCircle,
  RefreshCw,
  Send,
  History,
  AlertTriangle,
  ArrowRight,
} from 'lucide-react';

export const PharmacistDashboard = () => {
  const navigate = useNavigate();

  const [medicines, setMedicines] = useState([]);
  const [dispenseLog, setDispenseLog] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      pharmacyService.getMedicines(),
      pharmacyService.getDispensingHistory(),
    ]).then(([medRes, dispRes]) => {
      if (medRes.success) setMedicines(medRes.data || []);
      if (dispRes.success) setDispenseLog(dispRes.data || []);
      setLoading(false);
    });
  }, []);

  if (loading) return <Loader message="Connecting pharmacy dispensary..." />;

  const lowStock = medicines.filter((m) => m.stock <= m.reorder_level);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Pharmacy Operations & Dispensary</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Pharmaceutical stock tracking, safety reorders, and digital prescription dispensing
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="teal"
            size="sm"
            icon={Send}
            onClick={() => navigate('/pharmacy/dispense')}
          >
            Dispense Medication
          </Button>
          <Button
            variant="primary"
            size="sm"
            icon={PlusCircle}
            onClick={() => navigate('/pharmacy/add-medicine')}
          >
            Add Drug Batch
          </Button>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div
          onClick={() => navigate('/pharmacy/inventory')}
          className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs hover:shadow-md cursor-pointer transition-all"
        >
          <div className="flex justify-between items-center text-xs text-slate-500 font-medium">
            <span>Total Catalog</span>
            <Package className="w-4 h-4 text-teal-600" />
          </div>
          <div className="text-2xl font-bold text-slate-800 mt-2">{medicines.length} Formulations</div>
        </div>

        <div
          onClick={() => navigate('/pharmacy/inventory?status=Low Stock')}
          className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs hover:shadow-md cursor-pointer transition-all"
        >
          <div className="flex justify-between items-center text-xs text-amber-600 font-medium">
            <span>Low Stock Warnings</span>
            <AlertTriangle className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-bold text-amber-700 mt-2">{lowStock.length} Items</div>
        </div>

        <div
          onClick={() => navigate('/pharmacy/dispensing-history')}
          className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs hover:shadow-md cursor-pointer transition-all"
        >
          <div className="flex justify-between items-center text-xs text-slate-500 font-medium">
            <span>Prescriptions Dispensed</span>
            <Send className="w-4 h-4 text-sky-600" />
          </div>
          <div className="text-2xl font-bold text-slate-800 mt-2">{dispenseLog.length} Records</div>
        </div>

        <div
          onClick={() => navigate('/pharmacy/update-stock')}
          className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs hover:shadow-md cursor-pointer transition-all"
        >
          <div className="flex justify-between items-center text-xs text-slate-500 font-medium">
            <span>Stock Restock Desk</span>
            <RefreshCw className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-bold text-slate-800 mt-2">Update Lots</div>
        </div>
      </div>

      {/* Low Stock Watchlist */}
      {lowStock.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 shadow-xs space-y-3">
          <div className="flex items-center gap-2 text-amber-800 font-bold text-sm">
            <AlertTriangle className="w-5 h-5 text-amber-600" />
            <span>Attention: Critical Low Stock Formulations</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {lowStock.map((m) => (
              <div key={m.id} className="p-3 bg-white rounded-lg border border-amber-200 flex justify-between items-center text-xs">
                <div>
                  <div className="font-bold text-slate-800">{m.name}</div>
                  <div className="text-slate-500">Batch: {m.batch_number} • Reorder Threshold: {m.reorder_level}</div>
                </div>
                <span className="font-bold text-rose-600 text-sm">{m.stock} Left</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Dispensed */}
      <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b pb-3">
          <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
            Recent Dispensing Log
          </h2>
          <Button variant="ghost" size="sm" onClick={() => navigate('/pharmacy/dispensing-history')}>
            Full Log
          </Button>
        </div>

        <div className="divide-y divide-slate-100">
          {dispenseLog.map((log) => (
            <div key={log.id} className="py-3 flex items-center justify-between text-xs">
              <div>
                <span className="font-bold text-slate-800 text-sm">{log.medicine}</span>
                <p className="text-slate-500">For {log.patient_name} • Prescription: {log.prescription_id}</p>
              </div>
              <div className="text-right">
                <span className="font-semibold text-teal-700 bg-teal-50 px-2 py-0.5 rounded">
                  {log.dispensed_qty} units
                </span>
                <p className="text-[11px] text-slate-400 mt-1">{log.dispensed_at}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PharmacistDashboard;

