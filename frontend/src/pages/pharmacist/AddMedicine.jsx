import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { pharmacyService } from '../../services/pharmacyService';
import { MEDICINE_CATEGORIES } from '../../utils/constants';
import { useNotificationContext } from '../../context/NotificationContext';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import Button from '../../components/common/Button';
import { ArrowLeft, Save, RotateCcw, X, PlusCircle } from 'lucide-react';

export const AddMedicine = () => {
  const navigate = useNavigate();
  const { addToast } = useNotificationContext();

  const initialForm = {
    name: '',
    generic_name: '',
    category: 'Antibiotic',
    manufacturer: '',
    batch_number: '',
    expiry_date: '',
    stock: 100,
    reorder_level: 50,
    purchase_price: 5.0,
    unit_price: 10.0,
    storage_instructions: 'Store in dry place below 25°C',
  };

  const [formData, setFormData] = useState(initialForm);
  const [saving, setSaving] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const submitMedicine = async (andAddAnother = false) => {
    if (!formData.name || !formData.batch_number || !formData.expiry_date) {
      addToast('Please fill all required medicine fields.', 'warning');
      return;
    }

    try {
      setSaving(true);
      const res = await pharmacyService.addMedicine(formData);
      if (res.success) {
        addToast('Medicine added to inventory successfully.', 'success');
        if (andAddAnother) {
          setFormData(initialForm);
        } else {
          navigate('/pharmacy/inventory');
        }
      }
    } catch (err) {
      addToast(err.message || 'Failed to add medicine', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate('/pharmacy/inventory')}
            className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-slate-800 tracking-tight">Add Medicine Lot</h1>
            <p className="text-xs text-slate-500">Record new pharmaceutical batch into inventory</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            id="btn_reset_medicine_form"
            variant="outline"
            size="sm"
            icon={RotateCcw}
            onClick={() => setFormData(initialForm)}
          >
            Reset
          </Button>
          <Button
            id="btn_cancel_medicine"
            variant="ghost"
            size="sm"
            icon={X}
            onClick={() => navigate('/pharmacy/inventory')}
          >
            Cancel
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200/80 p-6 shadow-xs space-y-4">
        <Input
          name="name"
          label="Medicine Name & Dosage Form"
          placeholder="e.g. Paracetamol 650mg Tablet"
          value={formData.name}
          onChange={handleChange}
          required
        />

        <div className="grid grid-cols-2 gap-4">
          <Input
            name="generic_name"
            label="Generic Name"
            placeholder="Acetaminophen"
            value={formData.generic_name}
            onChange={handleChange}
          />
          <Select
            name="category"
            label="Pharmacological Category"
            value={formData.category}
            onChange={handleChange}
            options={MEDICINE_CATEGORIES}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input
            name="manufacturer"
            label="Manufacturer"
            placeholder="GlaxoSmithKline"
            value={formData.manufacturer}
            onChange={handleChange}
          />
          <Input
            name="batch_number"
            label="Batch Number"
            placeholder="BT-9921X"
            value={formData.batch_number}
            onChange={handleChange}
            required
          />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <Input
            name="stock"
            type="number"
            min="1"
            label="Initial Stock Quantity"
            value={formData.stock}
            onChange={handleChange}
            required
          />
          <Input
            name="reorder_level"
            type="number"
            min="1"
            label="Reorder Safety Level"
            value={formData.reorder_level}
            onChange={handleChange}
            required
          />
          <Input
            name="expiry_date"
            type="date"
            label="Batch Expiry Date"
            value={formData.expiry_date}
            onChange={handleChange}
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input
            name="purchase_price"
            type="number"
            step="0.01"
            label="Purchase Cost ($)"
            value={formData.purchase_price}
            onChange={handleChange}
          />
          <Input
            name="unit_price"
            type="number"
            step="0.01"
            label="Selling Unit Price ($)"
            value={formData.unit_price}
            onChange={handleChange}
            required
          />
        </div>

        <Input
          name="storage_instructions"
          label="Storage Instructions"
          value={formData.storage_instructions}
          onChange={handleChange}
        />

        <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
          <Button
            id="btn_save_and_add_another"
            type="button"
            variant="outline"
            size="sm"
            icon={PlusCircle}
            loading={saving}
            onClick={() => submitMedicine(true)}
          >
            Save & Add Another
          </Button>

          <Button
            id="btn_save_medicine"
            type="button"
            variant="teal"
            size="sm"
            icon={Save}
            loading={saving}
            onClick={() => submitMedicine(false)}
          >
            Save Medicine
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AddMedicine;

