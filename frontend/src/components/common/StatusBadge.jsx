import React from 'react';

const statusStyles = {
  // Positive / Active / Completed / In Stock / Paid
  Active: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  Completed: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  Paid: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  'In Stock': 'bg-emerald-50 text-emerald-700 border-emerald-200',
  Available: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  Finalized: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  Dispensed: 'bg-emerald-50 text-emerald-700 border-emerald-200',

  // Caution / Warning / Pending / Low Stock
  Pending: 'bg-amber-50 text-amber-700 border-amber-200',
  Partial: 'bg-amber-50 text-amber-700 border-amber-200',
  'Low Stock': 'bg-amber-50 text-amber-700 border-amber-200',
  'On Leave': 'bg-amber-50 text-amber-700 border-amber-200',
  'Pending Dispensation': 'bg-amber-50 text-amber-700 border-amber-200',

  // Progress / Blue / Teal
  Confirmed: 'bg-sky-50 text-sky-700 border-sky-200',
  'Checked In': 'bg-teal-50 text-teal-700 border-teal-200',
  'In Progress': 'bg-blue-50 text-blue-700 border-blue-200',
  'In Consultation': 'bg-indigo-50 text-indigo-700 border-indigo-200',
  Draft: 'bg-slate-100 text-slate-700 border-slate-200',

  // Negative / Danger / Overdue / Cancelled / Inactive
  Inactive: 'bg-rose-50 text-rose-700 border-rose-200',
  Cancelled: 'bg-rose-50 text-rose-700 border-rose-200',
  Overdue: 'bg-rose-50 text-rose-700 border-rose-200',
  'No Show': 'bg-slate-100 text-slate-700 border-slate-200',
  'Out of Stock': 'bg-rose-50 text-rose-700 border-rose-200',
};

export const StatusBadge = ({ status, className = '' }) => {
  const currentStyle = statusStyles[status] || 'bg-slate-100 text-slate-700 border-slate-200';

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${currentStyle} ${className}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5 opacity-70" />
      {status || 'Unknown'}
    </span>
  );
};

export default StatusBadge;

