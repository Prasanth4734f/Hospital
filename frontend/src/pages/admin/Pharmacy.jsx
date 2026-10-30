import React, { useState, useEffect, useCallback } from 'react';
import { pharmacyService } from '../../services/pharmacyService';
import { formatCurrency } from '../../utils/formatters';
import { MEDICINE_CATEGORIES } from '../../utils/constants';
import { useNotificationContext } from '../../context/NotificationContext';
import DataTable from '../../components/common/DataTable';
import Button from '../../components/common/Button';
import SearchBar from '../../components/common/SearchBar';
import StatusBadge from '../../components/common/StatusBadge';
import Modal from '../../components/common/Modal';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import {
  Package,
  Plus,
  AlertTriangle,
  RotateCcw,
  Download,
  Edit,
  RefreshCw,
  Send,
  History,
  CheckCircle,
} from 'lucide-react';

export const Pharmacy = () => {
  const { addToast } = useNotificationContext();

  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dispensingHistory, setDispensingHistory] = useState([]);

  // Active view: 'inventory' | 'dispensing'
  const [activeTab, setActiveTab] = useState('inventory');

  // Filters
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  // Modals
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [newMed, setNewMed] = useState({
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
  });
  const [savingMed, setSavingMed] = useState(false);

  // Update Stock Modal
  const [stockModalOpen, setStockModalOpen] = useState(false);
  const [selectedMed, setSelectedMed] = useState(null);
  const [stockDelta, setStockDelta] = useState(50);
  const [updatingStock, setUpdatingStock] = useState(false);

  // Dispense Modal
  const [dispenseModalOpen, setDispenseModalOpen] = useState(false);
  const [dispenseForm, setDispenseForm] = useState({
    prescription_id: 'RX-701',
    patient_id: 'PAT-1001',
    patient_name: 'Eleanor Vance',
    medicine: '',
    prescribed_qty: 30,
    dispensed_qty: 30,
    batch_number: '',
    notes: 'Counselled on dosage frequency',
  });
  const [dispensing, setDispensing] = useState(false);

  const fetchInventory = useCallback(async () => {
    try {
      setLoading(true);
      const params = {
        search: search.trim() || undefined,
        category: categoryFilter !== 'All' ? categoryFilter : undefined,
        status: statusFilter !== 'All' ? statusFilter : undefined,
      };
      const [medRes, dispRes] = await Promise.all([
        pharmacyService.getMedicines(params),
        pharmacyService.getDispensingHistory(),
      ]);
      if (medRes.success) setMedicines(medRes.data || []);
      if (dispRes.success) setDispensingHistory(dispRes.data || []);
    } catch (err) {
      addToast('Failed to fetch pharmacy inventory', 'error');
    } finally {
      setLoading(false);
    }
  }, [search, categoryFilter, statusFilter, addToast]);

  useEffect(() => {
    fetchInventory();
  }, [fetchInventory]);

  const handleAddMedicine = async (e) => {
    e.preventDefault();
    if (!newMed.name || !newMed.batch_number) {
      addToast('Please fill all required fields', 'warning');
      return;
    }
    try {
      setSavingMed(true);
      const res = await pharmacyService.addMedicine(newMed);
      if (res.success) {
        addToast('Medicine added to inventory successfully', 'success');
        setAddModalOpen(false);
        fetchInventory();
      }
    } catch (err) {
      addToast(err.message || 'Failed to add medicine', 'error');
    } finally {
      setSavingMed(false);
    }
  };

  const handleUpdateStock = async (e) => {
    e.preventDefault();
    if (!selectedMed) return;
    try {
      setUpdatingStock(true);
      const res = await pharmacyService.updateStock(selectedMed.id, Number(stockDelta));
      if (res.success) {
        addToast(res.message, 'success');
        setStockModalOpen(false);
        fetchInventory();
      }
    } catch (err) {
      addToast(err.message || 'Failed to update stock', 'error');
    } finally {
      setUpdatingStock(false);
    }
  };

  const handleDispense = async (e) => {
    e.preventDefault();
    try {
      setDispensing(true);
      const res = await pharmacyService.dispenseMedicine(dispenseForm);
      if (res.success) {
        addToast('Medicine dispensed and stock automatically updated', 'success');
        setDispenseModalOpen(false);
        fetchInventory();
      }
    } catch (err) {
      addToast(err.message || 'Dispensing failed', 'error');
    } finally {
      setDispensing(false);
    }
  };

  const handleExport = () => {
    const csv =
      'data:text/csv;charset=utf-8,' +
      ['ID,Name,Category,Batch,Stock,Price,Status,Expiry']
        .concat(
          medicines.map(
            (m) =>
              `"${m.id}","${m.name}","${m.category}","${m.batch_number}","${m.stock}","${m.unit_price}","${m.status}","${m.expiry_date}"`
          )
        )
        .join('\n');
    const a = document.createElement('a');
    a.href = encodeURI(csv);
    a.download = `MediCore_Pharmacy_Stock_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    addToast('Pharmacy inventory exported', 'success');
  };

  const lowStockCount = medicines.filter((m) => m.stock <= m.reorder_level).length;

  const inventoryColumns = [
    {
      key: 'id',
      header: 'Drug ID',
      render: (m) => <span className="font-semibold text-primary">{m.id}</span>,
    },
    {
      key: 'name',
      header: 'Medicine & Formulation',
      render: (m) => (
        <div>
          <div className="font-semibold text-slate-800">{m.name}</div>
          <div className="text-[11px] text-slate-400">{m.generic_name}</div>
        </div>
      ),
    },
    {
      key: 'category',
      header: 'Category',
      render: (m) => (
        <span className="text-xs font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
          {m.category}
        </span>
      ),
    },
    {
      key: 'batch_number',
      header: 'Batch No.',
      render: (m) => <span className="font-mono text-xs">{m.batch_number}</span>,
    },
    {
      key: 'stock',
      header: 'Available Stock',
      render: (m) => (
        <span className={`font-bold ${m.stock <= m.reorder_level ? 'text-amber-600' : 'text-slate-800'}`}>
          {m.stock} units
        </span>
      ),
    },
    {
      key: 'unit_price',
      header: 'Unit Price',
      render: (m) => <span className="font-semibold text-slate-800">{formatCurrency(m.unit_price)}</span>,
    },
    {
      key: 'expiry_date',
      header: 'Expiry Date',
    },
    {
      key: 'status',
      header: 'Status',
      render: (m) => <StatusBadge status={m.status} />,
    },
    {
      key: 'actions',
      header: 'Actions',
      headerClassName: 'text-right',
      className: 'text-right',
      render: (m) => (
        <div className="flex items-center justify-end gap-1.5">
          <button
            type="button"
            title="Update Stock"
            onClick={() => {
              setSelectedMed(m);
              setStockDelta(50);
              setStockModalOpen(true);
            }}
            className="p-1.5 rounded-lg text-slate-500 hover:text-teal-600 hover:bg-teal-50 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            type="button"
            title="Dispense Medicine"
            onClick={() => {
              setSelectedMed(m);
              setDispenseForm({
                ...dispenseForm,
                medicine: m.name,
                batch_number: m.batch_number,
              });
              setDispenseModalOpen(true);
            }}
            className="p-1.5 rounded-lg text-slate-500 hover:text-sky-600 hover:bg-sky-50 transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Pharmacy & Dispensary</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Pharmaceutical stock management, batches, reorder thresholds, and prescription dispensing
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button variant="outline" size="sm" icon={Download} onClick={handleExport}>
            Export Inventory
          </Button>
          <Button
            variant="teal"
            size="sm"
            icon={Plus}
            onClick={() => setAddModalOpen(true)}
          >
            Add Medicine
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-4 border-b border-slate-200">
        <button
          type="button"
          onClick={() => setActiveTab('inventory')}
          className={`py-2.5 px-3 text-xs sm:text-sm font-semibold border-b-2 transition-colors ${
            activeTab === 'inventory'
              ? 'border-teal-600 text-teal-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Drug Inventory ({medicines.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('dispensing')}
          className={`py-2.5 px-3 text-xs sm:text-sm font-semibold border-b-2 transition-colors ${
            activeTab === 'dispensing'
              ? 'border-teal-600 text-teal-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Dispensing Log ({dispensingHistory.length})
        </button>

        {lowStockCount > 0 && (
          <div className="ml-auto flex items-center gap-1.5 text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-full">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>{lowStockCount} Low Stock Alerts</span>
          </div>
        )}
      </div>

      {activeTab === 'inventory' ? (
        <>
          {/* Filters */}
          <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs grid grid-cols-1 md:grid-cols-3 gap-3">
            <SearchBar
              value={search}
              onChange={setSearch}
              placeholder="Search medicine name, generic formula, or batch..."
            />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="bg-white border border-slate-300 rounded-lg py-2 px-3 text-xs sm:text-sm text-slate-700 focus:outline-none focus:border-teal-500"
            >
              <option value="All">All Categories</option>
              {MEDICINE_CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-white border border-slate-300 rounded-lg py-2 px-3 text-xs sm:text-sm text-slate-700 focus:outline-none focus:border-teal-500"
            >
              <option value="All">All Stock Levels</option>
              <option value="In Stock">In Stock</option>
              <option value="Low Stock">Low Stock</option>
            </select>
          </div>

          <DataTable
            columns={inventoryColumns}
            data={medicines}
            loading={loading}
            emptyTitle="No Medicines in Inventory"
            emptyDescription="Add clinical medications and batch stock to begin tracking."
            emptyActionLabel="Add Medicine"
            onEmptyAction={() => setAddModalOpen(true)}
          />
        </>
      ) : (
        /* Dispensing History */
        <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs">
          <div className="divide-y divide-slate-100">
            {dispensingHistory.map((item) => (
              <div key={item.id} className="py-3.5 flex items-center justify-between text-xs">
                <div>
                  <div className="font-semibold text-slate-800 text-sm">{item.medicine}</div>
                  <div className="text-slate-500">
                    Prescription: {item.prescription_id} • Patient: {item.patient_name} ({item.patient_id})
                  </div>
                  <div className="text-[11px] text-teal-600 font-medium mt-0.5">
                    Dispensed by {item.pharmacist_name || 'Pharmacist'} • Batch {item.batch_number}
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-bold text-teal-700 bg-teal-50 px-2.5 py-1 rounded-full border border-teal-200">
                    {item.dispensed_qty} Units Dispensed
                  </span>
                  <div className="text-[11px] text-slate-400 mt-1">{item.dispensed_at}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add Medicine Modal */}
      <Modal
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        title="Add New Medicine to Central Inventory"
      >
        <form onSubmit={handleAddMedicine} className="space-y-4">
          <Input
            label="Medicine Commercial Name"
            placeholder="e.g. Atorvastatin 20mg"
            value={newMed.name}
            onChange={(e) => setNewMed({ ...newMed, name: e.target.value })}
            required
          />
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Generic Active Ingredient"
              placeholder="e.g. Atorvastatin Calcium"
              value={newMed.generic_name}
              onChange={(e) => setNewMed({ ...newMed, generic_name: e.target.value })}
            />
            <Select
              label="Category"
              value={newMed.category}
              onChange={(e) => setNewMed({ ...newMed, category: e.target.value })}
              options={MEDICINE_CATEGORIES}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Manufacturer"
              placeholder="e.g. Pfizer Labs"
              value={newMed.manufacturer}
              onChange={(e) => setNewMed({ ...newMed, manufacturer: e.target.value })}
            />
            <Input
              label="Batch Number"
              placeholder="BT-9901A"
              value={newMed.batch_number}
              onChange={(e) => setNewMed({ ...newMed, batch_number: e.target.value })}
              required
            />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <Input
              label="Quantity"
              type="number"
              min="1"
              value={newMed.stock}
              onChange={(e) => setNewMed({ ...newMed, stock: e.target.value })}
              required
            />
            <Input
              label="Purchase Price ($)"
              type="number"
              step="0.01"
              value={newMed.purchase_price}
              onChange={(e) => setNewMed({ ...newMed, purchase_price: e.target.value })}
            />
            <Input
              label="Selling Price ($)"
              type="number"
              step="0.01"
              value={newMed.unit_price}
              onChange={(e) => setNewMed({ ...newMed, unit_price: e.target.value })}
              required
            />
          </div>
          <Input
            label="Expiry Date"
            type="date"
            value={newMed.expiry_date}
            onChange={(e) => setNewMed({ ...newMed, expiry_date: e.target.value })}
            required
          />
          <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
            <Button variant="outline" size="sm" onClick={() => setAddModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="teal" size="sm" loading={savingMed}>
              Save Medicine
            </Button>
          </div>
        </form>
      </Modal>

      {/* Update Stock Modal */}
      <Modal
        isOpen={stockModalOpen}
        onClose={() => setStockModalOpen(false)}
        title="Replenish Medicine Stock"
        subtitle={selectedMed?.name}
      >
        <form onSubmit={handleUpdateStock} className="space-y-4">
          <div className="p-3 bg-slate-50 rounded-lg text-xs flex justify-between">
            <span className="text-slate-500">Current Stock Level:</span>
            <span className="font-bold text-slate-800">{selectedMed?.stock} units</span>
          </div>
          <Input
            label="Quantity to Add"
            type="number"
            min="1"
            value={stockDelta}
            onChange={(e) => setStockDelta(e.target.value)}
            required
          />
          <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
            <Button variant="outline" size="sm" onClick={() => setStockModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="teal" size="sm" loading={updatingStock}>
              Update Stock
            </Button>
          </div>
        </form>
      </Modal>

      {/* Dispense Modal */}
      <Modal
        isOpen={dispenseModalOpen}
        onClose={() => setDispenseModalOpen(false)}
        title="Dispense Medicine to Patient"
        subtitle={`Dispensing: ${dispenseForm.medicine}`}
      >
        <form onSubmit={handleDispense} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Prescription ID"
              value={dispenseForm.prescription_id}
              onChange={(e) => setDispenseForm({ ...dispenseForm, prescription_id: e.target.value })}
              required
            />
            <Input
              label="Patient Name"
              value={dispenseForm.patient_name}
              onChange={(e) => setDispenseForm({ ...dispenseForm, patient_name: e.target.value })}
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Quantity to Dispense"
              type="number"
              min="1"
              value={dispenseForm.dispensed_qty}
              onChange={(e) => setDispenseForm({ ...dispenseForm, dispensed_qty: e.target.value })}
              required
            />
            <Input
              label="Batch Number"
              value={dispenseForm.batch_number}
              onChange={(e) => setDispenseForm({ ...dispenseForm, batch_number: e.target.value })}
              required
            />
          </div>
          <Input
            label="Pharmacist Verification Notes"
            value={dispenseForm.notes}
            onChange={(e) => setDispenseForm({ ...dispenseForm, notes: e.target.value })}
          />
          <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
            <Button variant="outline" size="sm" onClick={() => setDispenseModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="teal" size="sm" loading={dispensing}>
              Confirm Dispensing
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Pharmacy;

