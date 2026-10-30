export let initialMedicines = [
  {
    id: 'MED-5001',
    name: 'Metformin Hydrochloride 500mg',
    generic_name: 'Metformin HCl',
    category: 'Antidiabetic',
    manufacturer: 'Merck Healthcare',
    batch_number: 'BT-8821A',
    expiry_date: '2027-08-30',
    stock: 450,
    reorder_level: 100,
    purchase_price: 3.50,
    unit_price: 6.20,
    status: 'In Stock',
    storage_instructions: 'Store below 25°C in a dry place protected from light'
  },
  {
    id: 'MED-5002',
    name: 'Amlodipine Besylate 5mg',
    generic_name: 'Amlodipine',
    category: 'Antihypertensive',
    manufacturer: 'Pfizer Labs',
    batch_number: 'BT-9042K',
    expiry_date: '2027-11-15',
    stock: 320,
    reorder_level: 80,
    purchase_price: 2.10,
    unit_price: 4.50,
    status: 'In Stock',
    storage_instructions: 'Store at 20°C to 25°C'
  },
  {
    id: 'MED-5003',
    name: 'Azithromycin 500mg',
    generic_name: 'Azithromycin Monohydrate',
    category: 'Antibiotic',
    manufacturer: 'Teva Pharmaceuticals',
    batch_number: 'BT-3312Z',
    expiry_date: '2026-12-01',
    stock: 28,
    reorder_level: 50,
    purchase_price: 8.00,
    unit_price: 14.50,
    status: 'Low Stock',
    storage_instructions: 'Controlled room temperature'
  },
  {
    id: 'MED-5004',
    name: 'Atorvastatin Calcium 20mg',
    generic_name: 'Atorvastatin',
    category: 'Cardiovascular',
    manufacturer: 'Viatris Inc.',
    batch_number: 'BT-7741C',
    expiry_date: '2028-02-28',
    stock: 610,
    reorder_level: 120,
    purchase_price: 5.40,
    unit_price: 9.80,
    status: 'In Stock',
    storage_instructions: 'Store between 20°C to 25°C'
  },
  {
    id: 'MED-5005',
    name: 'Paracetamol 650mg',
    generic_name: 'Acetaminophen',
    category: 'Antipyretic',
    manufacturer: 'GlaxoSmithKline',
    batch_number: 'BT-1029P',
    expiry_date: '2028-05-10',
    stock: 850,
    reorder_level: 150,
    purchase_price: 0.80,
    unit_price: 2.00,
    status: 'In Stock',
    storage_instructions: 'Keep away from excessive heat and direct sunlight'
  },
  {
    id: 'MED-5006',
    name: 'Amoxicillin + Clavulanate 625mg',
    generic_name: 'Co-amoxiclav',
    category: 'Antibiotic',
    manufacturer: 'Sandoz Pharma',
    batch_number: 'BT-4490S',
    expiry_date: '2026-11-20',
    stock: 12,
    reorder_level: 40,
    purchase_price: 11.20,
    unit_price: 18.00,
    status: 'Low Stock',
    storage_instructions: 'Store in moisture-proof container below 25°C'
  }
];

export let initialDispensingHistory = [
  {
    id: 'DISP-8001',
    prescription_id: 'RX-701',
    patient_id: 'PAT-1001',
    patient_name: 'Eleanor Vance',
    medicine: 'Metformin Hydrochloride 500mg',
    prescribed_qty: 60,
    dispensed_qty: 60,
    batch_number: 'BT-8821A',
    dispensed_at: '2026-10-20 11:30 AM',
    pharmacist_name: 'Pharmacist Alex Morgan',
    notes: 'Patient advised on dietary considerations'
  },
  {
    id: 'DISP-8002',
    prescription_id: 'RX-701',
    patient_id: 'PAT-1001',
    patient_name: 'Eleanor Vance',
    medicine: 'Amlodipine Besylate 5mg',
    prescribed_qty: 30,
    dispensed_qty: 30,
    batch_number: 'BT-9042K',
    dispensed_at: '2026-10-20 11:32 AM',
    pharmacist_name: 'Pharmacist Alex Morgan',
    notes: 'Full course provided'
  }
];

