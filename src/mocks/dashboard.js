export const mockAdminDashboard = {
  statistics: {
    total_patients: 1248,
    total_doctors: 48,
    today_appointments: 36,
    pending_appointments: 9,
    completed_consultations: 22,
    total_revenue: 84350.00
  },
  today_schedule: [
    { id: 'APT-3001', time: '10:00 AM', patient: 'Eleanor Vance', doctor: 'Dr. Sarah Jenkins', dept: 'Cardiology', status: 'Checked In' },
    { id: 'APT-3002', time: '11:00 AM', patient: 'Marcus Holloway', doctor: 'Dr. Marcus Vance', dept: 'General Medicine', status: 'Confirmed' },
    { id: 'APT-3004', time: '11:30 AM', patient: 'David Kim', doctor: 'Dr. Sarah Jenkins', dept: 'Cardiology', status: 'In Progress' },
    { id: 'APT-3003', time: '02:30 PM', patient: 'Clara Oswald', doctor: 'Dr. James Wilson', dept: 'Neurology', status: 'Pending' },
    { id: 'APT-3005', time: '04:00 PM', patient: 'Thomas Shelby', doctor: 'Dr. Rachel Zane', dept: 'Orthopedics', status: 'Confirmed' },
  ],
  recent_registrations: [
    { id: 'PAT-1005', name: 'Sofia Rodriguez', age: 25, gender: 'Female', phone: '+1 555-016-3392', date: '2026-10-30' },
    { id: 'PAT-1004', name: 'David Kim', age: 51, gender: 'Male', phone: '+1 555-012-7781', date: '2026-10-28' },
    { id: 'PAT-1003', name: 'Clara Oswald', age: 34, gender: 'Female', phone: '+1 555-018-4412', date: '2026-10-27' },
    { id: 'PAT-1002', name: 'Marcus Holloway', age: 32, gender: 'Male', phone: '+1 555-014-9923', date: '2026-10-25' },
  ],
  doctor_availability: [
    { name: 'Dr. Sarah Jenkins', dept: 'Cardiology', status: 'Available', patients_today: 8 },
    { name: 'Dr. Marcus Vance', dept: 'General Medicine', status: 'Available', patients_today: 11 },
    { name: 'Dr. Elena Rostova', dept: 'Pediatrics', status: 'In Consultation', patients_today: 6 },
    { name: 'Dr. James Wilson', dept: 'Neurology', status: 'On Leave', patients_today: 0 },
    { name: 'Dr. Rachel Zane', dept: 'Orthopedics', status: 'Available', patients_today: 5 },
  ],
  recent_activities: [
    { id: 'ACT-1', time: '10 mins ago', message: 'Invoice INV-9001 paid in full ($165.20)', type: 'billing' },
    { id: 'ACT-2', time: '25 mins ago', message: 'Dr. Sarah Jenkins finalized prescription RX-702', type: 'prescription' },
    { id: 'ACT-3', time: '42 mins ago', message: 'Eleanor Vance checked in for appointment APT-3001', type: 'appointment' },
    { id: 'ACT-4', time: '1 hour ago', message: 'New patient Sofia Rodriguez registered at Reception Desk A', type: 'registration' },
    { id: 'ACT-5', time: '2 hours ago', message: 'Low stock warning for Amoxicillin + Clavulanate (12 units remaining)', type: 'inventory' },
  ],
  hospital_performance: {
    monthly_trend: [
      { month: 'May', patients: 820, revenue: 64000, appointments: 790 },
      { month: 'Jun', patients: 910, revenue: 71200, appointments: 880 },
      { month: 'Jul', patients: 980, revenue: 76500, appointments: 940 },
      { month: 'Aug', patients: 1050, revenue: 81000, appointments: 1010 },
      { month: 'Sep', patients: 1160, revenue: 89000, appointments: 1120 },
      { month: 'Oct', patients: 1248, revenue: 94500, appointments: 1190 },
    ],
    department_distribution: [
      { name: 'General Medicine', value: 35 },
      { name: 'Cardiology', value: 25 },
      { name: 'Orthopedics', value: 15 },
      { name: 'Pediatrics', value: 15 },
      { name: 'Neurology', value: 10 },
    ]
  }
};

