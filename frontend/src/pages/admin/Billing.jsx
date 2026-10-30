import React, { useState, useEffect, useCallback } from 'react';
import { billingService } from '../../services/billingService';
import { formatCurrency } from '../../utils/formatters';
import { PAYMENT_STATUS } from '../../utils/constants';
import { useNotificationContext } from '../../context/NotificationContext';
import DataTable from '../../components/common/DataTable';
import Button from '../../components/common/Button';
import SearchBar from '../../components/common/SearchBar';
import StatusBadge from '../../components/common/StatusBadge';
import Modal from '../../components/common/Modal';
import Input from '../../components/common/Input';
import {
  CreditCard,
  Plus,
  DollarSign,
  Download,
  Eye,
  CheckCircle,
  Receipt,
  RotateCcw,
  Clock,
  AlertCircle,
  FileText,
} from 'lucide-react';

export const Billing = () => {
  const { addToast } = useNotificationContext();

  const [invoices, setInvoices] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  // Modals
  const [createInvoiceModal, setCreateInvoiceModal] = useState(false);
  const [invoiceForm, setInvoiceForm] = useState({
    patient_id: 'PAT-1001',
    patient_name: 'Eleanor Vance',
    appointment_id: 'APT-3001',
    consultation_fee: 100,
    medicine_charges: 35,
    lab_charges: 50,
    other_charges: 10,
    discount: 15,
    tax: 18,
  });
  const [savingInvoice, setSavingInvoice] = useState(false);

  // Record Payment Modal
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [paymentAmount, setPaymentAmount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('Credit Card');
  const [transactionRef, setTransactionRef] = useState('');
  const [recordingPayment, setRecordingPayment] = useState(false);

  // View Receipt Modal
  const [receiptModalOpen, setReceiptModalOpen] = useState(false);
  const [receiptData, setReceiptData] = useState(null);

  const fetchBillingData = useCallback(async () => {
    try {
      setLoading(true);
      const params = {
        search: search.trim() || undefined,
        status: statusFilter !== 'All' ? statusFilter : undefined,
      };
      const [invRes, payRes] = await Promise.all([
        billingService.getInvoices(params),
        billingService.getPayments(),
      ]);
      if (invRes.success) setInvoices(invRes.data || []);
      if (payRes.success) setPayments(payRes.data || []);
    } catch (err) {
      addToast('Failed to fetch billing records', 'error');
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, addToast]);

  useEffect(() => {
    fetchBillingData();
  }, [fetchBillingData]);

  // Financial metric calculations
  const totalInvoicesCount = invoices.length;
  const paidInvoicesCount = invoices.filter((i) => i.payment_status === 'Paid').length;
  const pendingInvoicesCount = invoices.filter((i) => i.payment_status === 'Pending').length;
  const overdueInvoicesCount = invoices.filter((i) => i.payment_status === 'Overdue').length;
  const totalRevenueSum = invoices.reduce((sum, i) => sum + (Number(i.paid_amount) || 0), 0);

  const calculatedTotal = Math.max(
    0,
    Number(invoiceForm.consultation_fee || 0) +
      Number(invoiceForm.medicine_charges || 0) +
      Number(invoiceForm.lab_charges || 0) +
      Number(invoiceForm.other_charges || 0) -
      Number(invoiceForm.discount || 0) +
      Number(invoiceForm.tax || 0)
  );

  const handleCreateInvoice = async (e) => {
    e.preventDefault();
    try {
      setSavingInvoice(true);
      const res = await billingService.createInvoice(invoiceForm);
      if (res.success) {
        addToast('Invoice generated successfully.', 'success');
        setCreateInvoiceModal(false);
        fetchBillingData();
      }
    } catch (err) {
      addToast(err.message || 'Failed to create invoice', 'error');
    } finally {
      setSavingInvoice(false);
    }
  };

  const openPaymentModal = (inv) => {
    setSelectedInvoice(inv);
    setPaymentAmount(inv.balance);
    setPaymentMethod('Credit Card');
    setTransactionRef(`TXN-${Math.floor(1000000 + Math.random() * 9000000)}`);
    setPaymentModalOpen(true);
  };

  const handleRecordPayment = async (e) => {
    e.preventDefault();
    if (!selectedInvoice) return;
    try {
      setRecordingPayment(true);
      const res = await billingService.recordPayment(selectedInvoice.id, {
        amount: Number(paymentAmount),
        payment_method: paymentMethod,
        transaction_ref: transactionRef,
      });
      if (res.success) {
        addToast('Payment recorded successfully', 'success');
        setPaymentModalOpen(false);
        fetchBillingData();
      }
    } catch (err) {
      addToast(err.message || 'Payment recording failed', 'error');
    } finally {
      setRecordingPayment(false);
    }
  };

  const openReceipt = async (inv) => {
    try {
      const res = await billingService.getReceipt(inv.id);
      if (res.success && res.data) {
        setReceiptData(res.data);
        setReceiptModalOpen(true);
      }
    } catch (err) {
      addToast('Failed to load receipt', 'error');
    }
  };

  const handleExport = () => {
    const csv =
      'data:text/csv;charset=utf-8,' +
      ['Invoice ID,Patient,Appointment,Date,Total,Paid,Balance,Status']
        .concat(
          invoices.map(
            (i) =>
              `"${i.id}","${i.patient_name}","${i.appointment_id}","${i.invoice_date}","${i.total_amount}","${i.paid_amount}","${i.balance}","${i.payment_status}"`
          )
        )
        .join('\n');
    const a = document.createElement('a');
    a.href = encodeURI(csv);
    a.download = `MediCore_Billing_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    addToast('Billing report exported', 'success');
  };

  const columns = [
    {
      key: 'id',
      header: 'Invoice ID',
      render: (i) => <span className="font-semibold text-primary">{i.id}</span>,
    },
    {
      key: 'patient_name',
      header: 'Patient',
      render: (i) => (
        <div>
          <div className="font-semibold text-slate-800">{i.patient_name}</div>
          <div className="text-[11px] text-slate-400">{i.appointment_id}</div>
        </div>
      ),
    },
    {
      key: 'invoice_date',
      header: 'Invoice Date',
    },
    {
      key: 'total_amount',
      header: 'Total Amount',
      render: (i) => <span className="font-semibold text-slate-800">{formatCurrency(i.total_amount)}</span>,
    },
    {
      key: 'paid_amount',
      header: 'Paid',
      render: (i) => <span className="text-emerald-700 font-medium">{formatCurrency(i.paid_amount)}</span>,
    },
    {
      key: 'balance',
      header: 'Balance',
      render: (i) => (
        <span className={`font-semibold ${i.balance > 0 ? 'text-amber-600' : 'text-slate-500'}`}>
          {formatCurrency(i.balance)}
        </span>
      ),
    },
    {
      key: 'payment_status',
      header: 'Status',
      render: (i) => <StatusBadge status={i.payment_status} />,
    },
    {
      key: 'actions',
      header: 'Actions',
      headerClassName: 'text-right',
      className: 'text-right',
      render: (i) => (
        <div className="flex items-center justify-end gap-1.5">
          {i.balance > 0 && (
            <button
              type="button"
              title="Record Payment"
              onClick={() => openPaymentModal(i)}
              className="p-1.5 rounded-lg text-slate-500 hover:text-teal-600 hover:bg-teal-50 transition-colors"
            >
              <CreditCard className="w-4 h-4" />
            </button>
          )}
          <button
            type="button"
            title="View Receipt"
            onClick={() => openReceipt(i)}
            className="p-1.5 rounded-lg text-slate-500 hover:text-primary hover:bg-slate-100 transition-colors"
          >
            <Receipt className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Billing & Revenue Operations</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Invoicing, patient transactions, clinical fees, and balance settlements
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            id="btn_export_billing_report"
            variant="outline"
            size="sm"
            icon={Download}
            onClick={handleExport}
          >
            Export Report
          </Button>
          <Button
            id="btn_create_invoice"
            variant="teal"
            size="sm"
            icon={Plus}
            onClick={() => setCreateInvoiceModal(true)}
          >
            Create Invoice
          </Button>
        </div>
      </div>

      {/* Financial Metric Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
          <span className="text-xs text-slate-500 font-medium">Total Invoices</span>
          <div className="text-xl font-bold text-slate-800 mt-1">{totalInvoicesCount}</div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
          <span className="text-xs text-emerald-600 font-medium">Paid Invoices</span>
          <div className="text-xl font-bold text-emerald-700 mt-1">{paidInvoicesCount}</div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
          <span className="text-xs text-amber-600 font-medium">Pending Invoices</span>
          <div className="text-xl font-bold text-amber-700 mt-1">{pendingInvoicesCount}</div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
          <span className="text-xs text-rose-600 font-medium">Overdue Invoices</span>
          <div className="text-xl font-bold text-rose-700 mt-1">{overdueInvoicesCount}</div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs col-span-2 sm:col-span-1">
          <span className="text-xs text-primary font-medium">Total Revenue Collected</span>
          <div className="text-xl font-bold text-primary mt-1">{formatCurrency(totalRevenueSum)}</div>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="md:col-span-2">
          <SearchBar
            id="btn_search_invoice"
            value={search}
            onChange={setSearch}
            placeholder="Search by invoice ID, patient name, or appointment ID..."
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-white border border-slate-300 rounded-lg py-2 px-3 text-xs sm:text-sm text-slate-700 focus:outline-none focus:border-teal-500"
        >
          <option value="All">All Payment Statuses</option>
          {Object.values(PAYMENT_STATUS).map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      {/* Invoices Table */}
      <DataTable
        columns={columns}
        data={invoices}
        loading={loading}
        emptyTitle="No Invoices Recorded"
        emptyDescription="Clinical services and pharmacy bills generate invoices here."
        emptyActionLabel="Create Invoice"
        onEmptyAction={() => setCreateInvoiceModal(true)}
      />

      {/* Create Invoice Modal */}
      <Modal
        isOpen={createInvoiceModal}
        onClose={() => setCreateInvoiceModal(false)}
        title="Generate Clinical Invoice"
        subtitle="Itemized billing statement"
      >
        <form onSubmit={handleCreateInvoice} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Patient Name"
              value={invoiceForm.patient_name}
              onChange={(e) => setInvoiceForm({ ...invoiceForm, patient_name: e.target.value })}
              required
            />
            <Input
              label="Appointment ID"
              value={invoiceForm.appointment_id}
              onChange={(e) => setInvoiceForm({ ...invoiceForm, appointment_id: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Consultation Fee ($)"
              type="number"
              min="0"
              value={invoiceForm.consultation_fee}
              onChange={(e) => setInvoiceForm({ ...invoiceForm, consultation_fee: e.target.value })}
            />
            <Input
              label="Medicine Charges ($)"
              type="number"
              min="0"
              value={invoiceForm.medicine_charges}
              onChange={(e) => setInvoiceForm({ ...invoiceForm, medicine_charges: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Laboratory Charges ($)"
              type="number"
              min="0"
              value={invoiceForm.lab_charges}
              onChange={(e) => setInvoiceForm({ ...invoiceForm, lab_charges: e.target.value })}
            />
            <Input
              label="Other Hospital Charges ($)"
              type="number"
              min="0"
              value={invoiceForm.other_charges}
              onChange={(e) => setInvoiceForm({ ...invoiceForm, other_charges: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Discount / Concession ($)"
              type="number"
              min="0"
              value={invoiceForm.discount}
              onChange={(e) => setInvoiceForm({ ...invoiceForm, discount: e.target.value })}
            />
            <Input
              label="Applicable Taxes ($)"
              type="number"
              min="0"
              value={invoiceForm.tax}
              onChange={(e) => setInvoiceForm({ ...invoiceForm, tax: e.target.value })}
            />
          </div>

          <div className="p-3 bg-teal-50 border border-teal-200 rounded-lg flex items-center justify-between">
            <span className="text-xs font-semibold text-teal-800">Total Calculated Invoice:</span>
            <span className="text-base font-bold text-teal-900">{formatCurrency(calculatedTotal)}</span>
          </div>

          <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
            <Button variant="outline" size="sm" onClick={() => setCreateInvoiceModal(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="teal" size="sm" loading={savingInvoice}>
              Generate Invoice
            </Button>
          </div>
        </form>
      </Modal>

      {/* Record Payment Modal */}
      <Modal
        isOpen={paymentModalOpen}
        onClose={() => setPaymentModalOpen(false)}
        title="Record Payment Transaction"
        subtitle={`Invoice: ${selectedInvoice?.id} • Patient: ${selectedInvoice?.patient_name}`}
      >
        <form onSubmit={handleRecordPayment} className="space-y-4">
          <div className="p-3 bg-slate-50 rounded-lg text-xs space-y-1">
            <div className="flex justify-between">
              <span className="text-slate-500">Total Invoice Amount:</span>
              <span className="font-semibold text-slate-800">{formatCurrency(selectedInvoice?.total_amount)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Previously Paid:</span>
              <span className="text-emerald-600 font-semibold">{formatCurrency(selectedInvoice?.paid_amount)}</span>
            </div>
            <div className="flex justify-between border-t border-slate-200 pt-1 font-bold">
              <span>Outstanding Balance:</span>
              <span className="text-amber-600">{formatCurrency(selectedInvoice?.balance)}</span>
            </div>
          </div>

          <Input
            label="Payment Amount ($)"
            type="number"
            min="1"
            max={selectedInvoice?.balance}
            value={paymentAmount}
            onChange={(e) => setPaymentAmount(e.target.value)}
            required
          />

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Payment Method
            </label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-lg py-2.5 px-3 text-sm text-slate-800 focus:outline-none focus:border-teal-500"
            >
              <option value="Credit Card">Credit Card</option>
              <option value="Debit Card">Debit Card</option>
              <option value="Cash Counter">Cash Counter</option>
              <option value="Insurance Co-pay">Insurance Co-pay</option>
              <option value="Bank Transfer">Bank Transfer / UPI</option>
            </select>
          </div>

          <Input
            label="Transaction Reference / Authorization Code"
            value={transactionRef}
            onChange={(e) => setTransactionRef(e.target.value)}
            required
          />

          <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
            <Button variant="outline" size="sm" onClick={() => setPaymentModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" loading={recordingPayment}>
              Record Payment
            </Button>
          </div>
        </form>
      </Modal>

      {/* Receipt View Modal */}
      <Modal
        isOpen={receiptModalOpen}
        onClose={() => setReceiptModalOpen(false)}
        title="Official Payment Receipt"
        subtitle={receiptData?.receipt_no}
        footer={
          <div className="flex justify-between w-full">
            <Button variant="outline" size="sm" onClick={() => window.print()}>
              Print Receipt
            </Button>
            <Button variant="primary" size="sm" onClick={() => setReceiptModalOpen(false)}>
              Close
            </Button>
          </div>
        }
      >
        {receiptData && (
          <div className="space-y-4 text-xs">
            <div className="flex justify-between border-b pb-2">
              <div>
                <p className="font-bold text-slate-800">MediCore Hospital Billing Desk</p>
                <p className="text-slate-400">Date: {receiptData.issued_date}</p>
              </div>
              <StatusBadge status={receiptData.invoice?.payment_status} />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <span className="text-slate-400">Patient:</span>
                <p className="font-semibold text-slate-800">{receiptData.invoice?.patient_name}</p>
              </div>
              <div>
                <span className="text-slate-400">Invoice:</span>
                <p className="font-semibold text-slate-800">{receiptData.invoice?.id}</p>
              </div>
            </div>
            <div className="border-t pt-2 space-y-1">
              <div className="flex justify-between">
                <span>Total Amount:</span>
                <span className="font-semibold">{formatCurrency(receiptData.invoice?.total_amount)}</span>
              </div>
              <div className="flex justify-between text-emerald-700">
                <span>Amount Paid:</span>
                <span className="font-bold">{formatCurrency(receiptData.invoice?.paid_amount)}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Remaining Balance:</span>
                <span>{formatCurrency(receiptData.invoice?.balance)}</span>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Billing;

