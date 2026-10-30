import api, { isMockMode } from './api';
import { initialInvoices, initialPayments } from '../mocks/invoices';

let invoicesDb = [...initialInvoices];
let paymentsDb = [...initialPayments];

export const billingService = {
  getInvoices: async (params = {}) => {
    if (isMockMode) {
      await new Promise((r) => setTimeout(r, 200));
      let results = [...invoicesDb];
      if (params.patient_id) {
        results = results.filter((i) => i.patient_id === params.patient_id);
      }
      if (params.status && params.status !== 'All') {
        results = results.filter((i) => i.payment_status === params.status);
      }
      if (params.search) {
        const q = params.search.toLowerCase();
        results = results.filter(
          (i) =>
            i.patient_name?.toLowerCase().includes(q) ||
            i.id?.toLowerCase().includes(q) ||
            i.appointment_id?.toLowerCase().includes(q)
        );
      }
      return {
        success: true,
        message: 'Invoices retrieved successfully',
        data: results,
      };
    }
    return api.get('/billing/invoices', { params });
  },

  getInvoiceById: async (invoiceId) => {
    if (isMockMode) {
      await new Promise((r) => setTimeout(r, 150));
      const invoice = invoicesDb.find((i) => i.id === invoiceId);
      if (!invoice) throw { success: false, message: 'Invoice not found', data: null };
      return { success: true, message: 'Invoice retrieved', data: invoice };
    }
    return api.get(`/billing/invoices/${invoiceId}`);
  },

  createInvoice: async (invoiceData) => {
    if (isMockMode) {
      await new Promise((r) => setTimeout(r, 300));
      const subtotal =
        (Number(invoiceData.consultation_fee) || 0) +
        (Number(invoiceData.medicine_charges) || 0) +
        (Number(invoiceData.lab_charges) || 0) +
        (Number(invoiceData.other_charges) || 0);
      const discount = Number(invoiceData.discount) || 0;
      const tax = Number(invoiceData.tax) || 0;
      const total = Math.max(0, subtotal - discount + tax);

      const newId = `INV-${Math.floor(9000 + Math.random() * 1000)}`;
      const newInvoice = {
        id: newId,
        invoice_date: new Date().toISOString().split('T')[0],
        due_date: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
        total_amount: total,
        paid_amount: 0,
        balance: total,
        payment_status: 'Pending',
        ...invoiceData,
      };
      invoicesDb.unshift(newInvoice);
      return {
        success: true,
        message: 'Invoice generated successfully',
        data: newInvoice,
      };
    }
    return api.post('/billing/invoices', invoiceData);
  },

  recordPayment: async (invoiceId, paymentData) => {
    if (isMockMode) {
      await new Promise((r) => setTimeout(r, 300));
      const idx = invoicesDb.findIndex((i) => i.id === invoiceId);
      if (idx === -1) throw { success: false, message: 'Invoice not found', data: null };

      const payAmt = Number(paymentData.amount) || 0;
      invoicesDb[idx].paid_amount += payAmt;
      invoicesDb[idx].balance = Math.max(0, invoicesDb[idx].total_amount - invoicesDb[idx].paid_amount);
      invoicesDb[idx].payment_status = invoicesDb[idx].balance === 0 ? 'Paid' : 'Partial';
      invoicesDb[idx].payment_method = paymentData.payment_method;
      invoicesDb[idx].transaction_ref = paymentData.transaction_ref || `TXN-${Math.floor(1000000 + Math.random() * 9000000)}`;
      invoicesDb[idx].paid_at = new Date().toLocaleString();

      const newPayment = {
        id: `PAY-${Math.floor(400 + Math.random() * 600)}`,
        invoice_id: invoiceId,
        patient_name: invoicesDb[idx].patient_name,
        amount: payAmt,
        payment_method: paymentData.payment_method,
        transaction_ref: invoicesDb[idx].transaction_ref,
        date: new Date().toISOString().split('T')[0],
        notes: paymentData.notes || 'Payment recorded',
      };
      paymentsDb.unshift(newPayment);

      return {
        success: true,
        message: 'Payment recorded successfully',
        data: {
          invoice: invoicesDb[idx],
          payment: newPayment,
        },
      };
    }
    return api.patch(`/billing/invoices/${invoiceId}/payment`, paymentData);
  },

  getPayments: async () => {
    if (isMockMode) {
      await new Promise((r) => setTimeout(r, 150));
      return { success: true, message: 'Payments retrieved', data: paymentsDb };
    }
    return api.get('/billing/payments');
  },

  getReceipt: async (invoiceId) => {
    if (isMockMode) {
      await new Promise((r) => setTimeout(r, 150));
      const invoice = invoicesDb.find((i) => i.id === invoiceId);
      return {
        success: true,
        message: 'Receipt generated',
        data: {
          receipt_no: `REC-${invoiceId}`,
          issued_date: new Date().toLocaleDateString(),
          invoice,
        },
      };
    }
    return api.get(`/billing/invoices/${invoiceId}/receipt`);
  },
};

