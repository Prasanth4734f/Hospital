import React, { useState } from 'react';
import { useNotificationContext } from '../../context/NotificationContext';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import {
  Bell,
  CheckCheck,
  Trash2,
  Filter,
  RotateCcw,
  Calendar,
  Pill,
  CreditCard,
  AlertCircle,
  Eye,
  Check,
} from 'lucide-react';

export const Notifications = () => {
  const {
    notifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  } = useNotificationContext();

  const [categoryFilter, setCategoryFilter] = useState('All');
  const [selectedNotif, setSelectedNotif] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  const categories = ['All', 'Appointments', 'Prescriptions', 'Billing', 'Pharmacy', 'System Updates'];

  const filtered = notifications.filter(
    (n) => categoryFilter === 'All' || n.category === categoryFilter
  );

  const getCategoryIcon = (cat) => {
    switch (cat) {
      case 'Appointments':
        return <Calendar className="w-4 h-4 text-indigo-600" />;
      case 'Prescriptions':
        return <Pill className="w-4 h-4 text-teal-600" />;
      case 'Billing':
        return <CreditCard className="w-4 h-4 text-emerald-600" />;
      case 'Pharmacy':
        return <Pill className="w-4 h-4 text-amber-600" />;
      default:
        return <AlertCircle className="w-4 h-4 text-sky-600" />;
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Notification Center</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Real-time alerts, clinical intake dispatches, low stock warnings, and payment confirmations
          </p>
        </div>

        <Button
          id="btn_mark_all_as_read"
          variant="outline"
          size="sm"
          icon={CheckCheck}
          onClick={markAllAsRead}
        >
          Mark All as Read
        </Button>
      </div>

      {/* Categories Bar */}
      <div className="flex items-center justify-between flex-wrap gap-2 bg-white p-2 rounded-xl border border-slate-200/80 shadow-xs">
        <div className="flex items-center flex-wrap gap-1">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                categoryFilter === cat
                  ? 'bg-teal-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {categoryFilter !== 'All' && (
          <Button
            id="btn_clear_filters"
            variant="ghost"
            size="sm"
            icon={RotateCcw}
            onClick={() => setCategoryFilter('All')}
          >
            Clear Filter
          </Button>
        )}
      </div>

      {/* Notifications List */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs divide-y divide-slate-100 overflow-hidden">
        {filtered.length === 0 ? (
          <div className="text-center py-12">
            <Bell className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-700">No notifications in this category</p>
            <p className="text-xs text-slate-400 mt-1">You are completely up to date.</p>
          </div>
        ) : (
          filtered.map((item) => (
            <div
              key={item.id}
              className={`p-4 flex items-start gap-3.5 transition-colors ${
                !item.read ? 'bg-teal-50/20' : 'hover:bg-slate-50/60'
              }`}
            >
              <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                {getCategoryIcon(item.category)}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <h3 className={`text-sm font-semibold ${!item.read ? 'text-slate-900' : 'text-slate-700'}`}>
                      {item.title}
                    </h3>
                    {!item.read && (
                      <span className="w-2 h-2 rounded-full bg-teal-500 flex-shrink-0" />
                    )}
                  </div>
                  <span className="text-[11px] text-slate-400 whitespace-nowrap">{item.timestamp}</span>
                </div>

                <p className="text-xs text-slate-600 mt-1 leading-relaxed">{item.message}</p>

                <div className="mt-2.5 flex items-center gap-3">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    {item.category}
                  </span>

                  <button
                    id="btn_view_notification_details"
                    type="button"
                    onClick={() => {
                      setSelectedNotif(item);
                      setModalOpen(true);
                      if (!item.read) markAsRead(item.id);
                    }}
                    className="text-xs font-semibold text-teal-600 hover:text-teal-700 flex items-center gap-1"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>View Details</span>
                  </button>

                  {!item.read && (
                    <button
                      id="btn_mark_as_read"
                      type="button"
                      onClick={() => markAsRead(item.id)}
                      className="text-xs font-semibold text-slate-500 hover:text-slate-800 flex items-center gap-1"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Mark Read</span>
                    </button>
                  )}

                  <button
                    id="btn_delete_notification"
                    type="button"
                    onClick={() => deleteNotification(item.id)}
                    className="text-xs font-semibold text-rose-500 hover:text-rose-700 flex items-center gap-1 ml-auto"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Details Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={selectedNotif?.title || 'Notification Details'}
        subtitle={selectedNotif?.category}
        footer={
          <Button variant="primary" size="sm" onClick={() => setModalOpen(false)}>
            Close
          </Button>
        }
      >
        {selectedNotif && (
          <div className="space-y-3 text-xs">
            <div className="p-3 bg-slate-50 rounded-lg flex justify-between">
              <span className="text-slate-500">Timestamp:</span>
              <span className="font-semibold text-slate-800">{selectedNotif.timestamp}</span>
            </div>
            <p className="text-slate-700 text-sm leading-relaxed p-3 border rounded-lg">
              {selectedNotif.message}
            </p>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Notifications;

