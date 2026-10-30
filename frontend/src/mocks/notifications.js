export let initialNotifications = [
  {
    id: 'NOTIF-1',
    category: 'Appointments',
    title: 'New Appointment Scheduled',
    message: 'Patient Sofia Rodriguez scheduled an appointment with Dr. Rachel Zane for Nov 2, 2026.',
    timestamp: '15 minutes ago',
    read: false,
    priority: 'Normal'
  },
  {
    id: 'NOTIF-2',
    category: 'Pharmacy',
    title: 'Low Stock Alert',
    message: 'Azithromycin 500mg has fallen below the safety threshold (28 units remaining).',
    timestamp: '1 hour ago',
    read: false,
    priority: 'High'
  },
  {
    id: 'NOTIF-3',
    category: 'Billing',
    title: 'Payment Received',
    message: 'Payment of $165.20 was recorded for invoice INV-9001.',
    timestamp: '2 hours ago',
    read: true,
    priority: 'Normal'
  },
  {
    id: 'NOTIF-4',
    category: 'Prescriptions',
    title: 'Prescription Dispensed',
    message: 'Pharmacist Alex Morgan dispensed medications for Eleanor Vance (RX-701).',
    timestamp: '5 hours ago',
    read: true,
    priority: 'Normal'
  },
  {
    id: 'NOTIF-5',
    category: 'System Updates',
    title: 'System Maintenance Scheduled',
    message: 'Scheduled cloud database indexing will take place on Sunday at 02:00 AM UTC.',
    timestamp: '1 day ago',
    read: true,
    priority: 'Low'
  }
];

