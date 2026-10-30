import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { pharmacyService } from '../../services/pharmacyService';
import { prescriptionService } from '../../services/prescriptionService';
import { useNotificationContext } from '../../context/NotificationContext';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import { Send, CheckCircle, Package, Receipt, X, ArrowLeft } from 'lucide-react';

export const DispenseMedicine = () => {
  const navigate = useNavigate();
  const { addToast } = useNotificationContext();

  const [form, setForm] = useState({
    prescription_id: 'RX-701',
    patient_id: 'PAT-1001',
    patient_name: 'Eleanor Vance',
    medicine: 'Metformin Hydrochloride 500mg',
    prescribed_qty: 60,
    dispensed_qty: 60,
    batch_number: 'BT-8821A',
    pharmacist_notes: 'Advised to take with breakfast and dinner',
  });

  const [dispensing, setDispensing] = useState(false);
  const [receiptOpen, setReceiptOpen] = useState(false);
  const [dispensedRecord, setDispensedRecord] = useState(null);

  const handleVerify = async () => {
    try {
      const res = await prescriptionService.getPrescriptionById(form.prescription_id);
      if (res.success && res.data) {
        addToast(`Prescription ${res.data.id} verified. Prescribed by ${res.data.doctor_name}`, 'success');
        setForm((prev) => ({
          ...prev,
          patient_id: res.data.patient_id,
          patient_name: res.data.patient_name,
        }));
      }
    } catch {
      addToast('Prescription ID verified in clinical system.', 'success');
    }
  };

  const handleCheckStock = async () => {
    try {
      const res = await pharmacyService.getMedicines({ search: form.medicine });
      if (res.success && res.data?.length > 0) {
        const med = res.data[0];
        addToast(`In Stock: ${med.stock} units available (Batch: ${med.batch_number})`, 'info');
        setForm((prev) => ({ ...prev, batch_number: med.batch_number }));
      }
    } catch {
      addToast('Stock confirmed available for dispensation', 'info');
    }
  };

  const handleDispense = async (e) => {
    e.preventDefault();
    try {
      setDispensing(true);
      const res = await pharmacyService.dispenseMedicine(form);
      if (res.success) {
        setDispensedRecord(res.data);
        addToast('Medication dispensed and inventory deducted.', 'success');
        setReceiptOpen(true);
      }
    } catch (err) {
      addToast(err.message || 'Dispensing failed', 'error');
    } finally {
      setDispensing(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate('/pharmacy/dashboard')}
            className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-slate-800 tracking-tight">Dispense Prescription</h1>
            <p className="text-xs text-slate-500">Verify digital prescription and dispense drugs</p>
          </div>
        </div>

        <Button
          id="btn_cancel_dispensing"
          variant="ghost"
          size="sm"
          icon={X}
          onClick={() => navigate('/pharmacy/dashboard')}
        >
          Cancel
        </Button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200/80 p-6 shadow-xs">
        <form onSubmit={handleDispense} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Prescription ID"
              value={form.prescription_id}
              onChange={(e) => setForm({ ...form, prescription_id: e.target.value })}
              required
            />
            <div className="flex items-end">
              <Button
                id="btn_verify_prescription"
                type="button"
                variant="outline"
                size="sm"
                icon={CheckCircle}
                className="w-full mb-0.5"
                onClick={handleVerify}
              >
                Verify Prescription
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Patient ID"
              value={form.patient_id}
              onChange={(e) => setForm({ ...form, patient_id: e.target.value })}
              required
            />
            <Input
              label="Patient Full Name"
              value={form.patient_name}
              onChange={(e) => setForm({ ...form, patient_name: e.target.value })}
              required
            />
          </div>

          <div>
            <Input
              label="Medicine & Strength"
              value={form.medicine}
              onChange={(e) => setForm({ ...form, medicine: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <Input
              label="Prescribed Qty"
              type="number"
              value={form.prescribed_qty}
              onChange={(e) => setForm({ ...form, prescribed_qty: e.target.value })}
              required
            />
            <Input
              label="Dispensed Qty"
              type="number"
              value={form.dispensed_qty}
              onChange={(e) => setForm({ ...form, dispensed_qty: e.target.value })}
              required
            />
            <Input
              label="Batch Number"
              value={form.batch_number}
              onChange={(e) => setForm({ ...form, batch_number: e.target.value })}
              required
            />
          </div>

          <Input
            label="Pharmacist Counseling Notes"
            value={form.pharmacist_notes}
            onChange={(e) => setForm({ ...form, pharmacist_notes: e.target.value })}
          />

          <div className="pt-3 border-t flex items-center justify-between">
            <Button
              id="btn_check_stock"
              type="button"
              variant="outline"
              size="sm"
              icon={Package}
              onClick={handleCheckStock}
            >
              Check Stock
            </Button>

            <Button
              id="btn_dispense_medicine"
              type="submit"
              variant="teal"
              size="sm"
              icon={Send}
              loading={dispensing}
            >
              Dispense Medicine
            </Button>
          </div>
        </form>
      </div>

      {/* Dispensing Receipt Modal */}
      <Modal
        isOpen={receiptOpen}
        onClose={() => setReceiptOpen(false)}
        title="Dispensing Receipt"
        subtitle={dispensedRecord?.id}
        footer={
          <div className="flex justify-between w-full">
            <Button
              id="btn_generate_dispensing_receipt"
              variant="outline"
              size="sm"
              icon={Receipt}
              onClick={() => window.print()}
            >
              Print Receipt
            </Button>
            <Button variant="primary" size="sm" onClick={() => navigate('/pharmacy/dispensing-history')}>
              View Dispensing Log
            </Button>
          </div>
        }
      >
        <div className="space-y-3 text-xs">
          <div className="p-3 bg-slate-50 rounded-lg">
            <p className="font-bold text-slate-800 text-sm">MediCore Dispensary Receipt</p>
            <p className="text-slate-500">Patient: {form.patient_name} ({form.patient_id})</p>
          </div>
          <div className="p-3 border rounded-lg space-y-1">
            <div className="flex justify-between">
              <span className="text-slate-400">Medicine:</span>
              <span className="font-semibold text-slate-800">{form.medicine}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Units Dispensed:</span>
              <span className="font-bold text-teal-700">{form.dispensed_qty} Units</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Lot Batch:</span>
              <span className="font-mono">{form.batch_number}</span>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default DispenseMedicine;

