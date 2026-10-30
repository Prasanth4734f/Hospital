import React, { useState, useEffect } from 'react';
import { pharmacyService } from '../../services/pharmacyService';
import { useNotificationContext } from '../../context/NotificationContext';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import { RefreshCw, Package } from 'lucide-react';

export const UpdateStock = () => {
  const { addToast } = useNotificationContext();

  const [medicines, setMedicines] = useState([]);
  const [selectedId, setSelectedId] = useState('');
  const [quantity, setQuantity] = useState(100);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    pharmacyService.getMedicines().then((res) => {
      if (res.success && res.data) {
        setMedicines(res.data);
        if (res.data.length > 0) setSelectedId(res.data[0].id);
      }
    });
  }, []);

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!selectedId) return;
    try {
      setSaving(true);
      const res = await pharmacyService.updateStock(selectedId, Number(quantity));
      if (res.success) {
        addToast(`Stock for ${res.data.name} updated. New balance: ${res.data.stock} units.`, 'success');
      }
    } catch (err) {
      addToast('Error updating stock', 'error');
    } finally {
      setSaving(false);
    }
  };

  const selectedMed = medicines.find((m) => m.id === selectedId);

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Stock Restock & Replenishment</h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Receive wholesale pharmaceutical supply and update available lots
        </p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200/80 p-6 shadow-xs">
        <form onSubmit={handleUpdate} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Select Medicine / Formulation
            </label>
            <select
              value={selectedId}
              onChange={(e) => setSelectedId(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-lg py-2.5 px-3 text-sm text-slate-800 focus:outline-none focus:border-teal-500"
            >
              {medicines.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name} (Batch: {m.batch_number} - Current: {m.stock} units)
                </option>
              ))}
            </select>
          </div>

          {selectedMed && (
            <div className="p-3 bg-slate-50 rounded-lg text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-400">Manufacturer:</span>
                <span className="font-semibold">{selectedMed.manufacturer}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Current Stock:</span>
                <span className="font-bold text-teal-700">{selectedMed.stock} units</span>
              </div>
            </div>
          )}

          <Input
            label="Quantity to Add"
            type="number"
            min="1"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            required
          />

          <div className="pt-3 border-t flex justify-end">
            <Button type="submit" variant="teal" icon={RefreshCw} loading={saving}>
              Confirm Stock Replenishment
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UpdateStock;

