export let initialPrescriptions = [
  {
    id: 'RX-701',
    appointment_id: 'APT-3006',
    patient_id: 'PAT-1001',
    patient_name: 'Eleanor Vance',
    doctor_id: 'DOC-202',
    doctor_name: 'Dr. Marcus Vance',
    consultation_id: 'CON-501',
    date: '2026-10-20',
    diagnosis: 'Type 2 Diabetes Mellitus with Essential Hypertension',
    status: 'Dispensed',
    medicines: [
      {
        name: 'Metformin Hydrochloride',
        type: 'Tablet',
        dosage: '500 mg',
        frequency: 'Twice daily (BD)',
        duration: '30 Days',
        route: 'Oral',
        instructions: 'Take immediately after morning and evening meals'
      },
      {
        name: 'Amlodipine Besylate',
        type: 'Tablet',
        dosage: '5 mg',
        frequency: 'Once daily (OD)',
        duration: '30 Days',
        route: 'Oral',
        instructions: 'Take every morning with plenty of water'
      }
    ]
  },
  {
    id: 'RX-702',
    appointment_id: 'APT-3001',
    patient_id: 'PAT-1001',
    patient_name: 'Eleanor Vance',
    doctor_id: 'DOC-201',
    doctor_name: 'Dr. Sarah Jenkins',
    consultation_id: 'CON-502',
    date: '2026-10-31',
    diagnosis: 'Stable Angina - Maintenance Regimen',
    status: 'Finalized',
    medicines: [
      {
        name: 'Atorvastatin Calcium',
        type: 'Tablet',
        dosage: '20 mg',
        frequency: 'Once daily (OD)',
        duration: '60 Days',
        route: 'Oral',
        instructions: 'Take at bedtime'
      },
      {
        name: 'Bisoprolol Fumarate',
        type: 'Tablet',
        dosage: '2.5 mg',
        frequency: 'Once daily (OD)',
        duration: '30 Days',
        route: 'Oral',
        instructions: 'Take in the morning before breakfast'
      }
    ]
  },
  {
    id: 'RX-703',
    appointment_id: 'APT-3002',
    patient_id: 'PAT-1002',
    patient_name: 'Marcus Holloway',
    doctor_id: 'DOC-202',
    doctor_name: 'Dr. Marcus Vance',
    consultation_id: 'CON-503',
    date: '2026-10-28',
    diagnosis: 'Acute Upper Respiratory Tract Infection',
    status: 'Pending Dispensation',
    medicines: [
      {
        name: 'Azithromycin',
        type: 'Tablet',
        dosage: '500 mg',
        frequency: 'Once daily (OD)',
        duration: '5 Days',
        route: 'Oral',
        instructions: 'Take 1 hour before meal or 2 hours after'
      },
      {
        name: 'Paracetamol',
        type: 'Tablet',
        dosage: '650 mg',
        frequency: 'Thrice daily (TDS)',
        duration: '3 Days',
        route: 'Oral',
        instructions: 'Take when temperature exceeds 99.5F'
      }
    ]
  }
];

