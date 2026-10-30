import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { billingService } from '../../services/billingService';
import { formatCurrency } from '../../utils/formatters';
import { useNotificationContext } from '../../context/NotificationContext';
import DataTable from '../../components/common/DataTable';
import Button from '../../components/common/Button';
import StatusBadge from '../../components/common/StatusBadge';
import Modal from '../../components/common/Modal';
import Input from '../../components/common/Input';
import { CreditCard, Receipt, CheckCircle } from 'lucide-react';

export const PatientBilling = () => {
  const { user } = useAuth();
  const { addToast } = useNotificationContext();
  const patientId = user?.patient_id || 'PAT-1001';

  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);

  // Pay Now Modal
  const [payModalOpen, setPayModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [payMethod, setPayMethod] = useState('Credit Card');
  const [paying, setPaying] = useState(false);

  const fetchInvoices = async () => {
    setLoading(true);
    const res = await billingService.getInvoices({ patient_id: patientId });
    if (res.success && res.data) setInvoices(res.data);
    setLoading(false);
  };

  useEffect(() => {
    fetchInvoices();
  }, [patientId]);

  const handlePayNow = async (e) => {
    e.preventDefault();
    if (!selectedInvoice) return;
    try {
      setPaying(true);
      const res = await billingService.recordPayment(selectedInvoice.id, {
        amount: selectedInvoice.balance,
        payment_method: payMethod,
        transaction_ref: `PORTAL-PAY-${Date.now()}`,
      });
      if (res.success) {
        addToast('Payment settled successfully via patient portal', 'success');
        setPayModalOpen(false);
        fetchInvoices();
      }
    } catch {
      addToast('Payment processing error', 'error');
    } finally {
      setPaying(false);
    }
  };

  const columns = [
    {
      key: 'id',
      header: 'Invoice ID',
      render: (i) => <span className="font-semibold text-primary">{i.id}</span>,
    },
    {
      key: 'invoice_date',
      header: 'Date',
    },
    {
      key: 'total_amount',
      header: 'Total Charges',
      render: (i) => <span className="font-semibold text-slate-800">{formatCurrency(i.total_amount)}</span>,
    },
    {
      key: 'paid_amount',
      header: 'Paid',
      render: (i) => <span className="text-emerald-700 font-medium">{formatCurrency(i.paid_amount)}</span>,
    },
    {
      key: 'balance',
      header: 'Outstanding Balance',
      render: (i) => (
        <span className={`font-bold ${i.balance > 0 ? 'text-amber-600' : 'text-slate-500'}`}>
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
      header: 'Payment Action',
      headerClassName: 'text-right',
      className: 'text-right',
      render: (i) => (
        i.balance > 0 ? (
          <Button
            id="btn_pay_now"
            variant="teal"
            size="sm"
            icon={CreditCard}
            onClick={() => {
              setSelectedInvoice(i);
              setPayModalOpen(true);
            }}
          >
            Pay Now
          </Button>
        ) : (
          <span className="text-xs text-emerald-600 font-semibold flex items-center justify-end gap-1">
            <CheckCircle className="w-3.5 h-3.5" /> Settled
          </span>
        )
      ),
    },
  ];

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-slate-800 tracking-tight">My Hospital Invoices</h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Review itemized clinical fees, receipts, and settle pending balances
        </p>
      </div>

      <DataTable columns={columns} data={invoices} loading={loading} />

      {/* Pay Modal */}
      <Modal
        isOpen={payModalOpen}
        onClose={() => setPayModalOpen(false)}
        title="Settle Outstanding Hospital Invoice"
        subtitle={selectedInvoice?.id}
      >
        <form onSubmit={handlePayNow} className="space-y-4">
          <div className="p-4 bg-teal-50 border border-teal-200 rounded-xl flex justify-between items-center text-teal-900">
            <div>
              <span className="text-xs text-teal-700 font-semibold uppercase">Balance to Pay</span>
              <p className="text-2xl font-bold">{formatCurrency(selectedInvoice?.balance)}</p>
            </div>
            <CreditCard className="w-8 h-8 text-teal-600 opacity-60" />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Select Payment Method
            </label>
            <select
              value={payMethod}
              onChange={(e) => setPayMethod(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-lg py-2.5 px-3 text-sm text-slate-800 focus:outline-none focus:border-teal-500"
            >
              <option value="Credit Card">Credit Card (Visa/Mastercard)</option>
              <option value="Debit Card">Debit Card</option>
              <option value="HSA / FSA Card">HSA / FSA Card</option>
              <option value="Bank Account">Online Banking / UPI</option>
            </select>
          </div>

          <div className="pt-3 border-t flex justify-end gap-2">
            <Button variant="outline" size="sm" onClick={() => setPayModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="teal" size="sm" loading={paying}>
              Authorize Payment of {formatCurrency(selectedInvoice?.balance)}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default PatientBilling;

