import api, { isMockMode } from './api';

let medicalRecordsDb = [
  {
    id: 'REC-601',
    appointment_id: 'APT-3006',
    patient_id: 'PAT-1001',
    doctor_id: 'DOC-202',
    doctor_name: 'Dr. Marcus Vance',
    date: '2026-10-20',
    status: 'Finalized',
    chief_complaint: 'Routine follow-up for blood glucose monitoring',
    symptoms: 'Mild morning fatigue, occasional polydipsia',
    bp: '128/82 mmHg',
    heart_rate: '74 bpm',
    temperature: '98.4 °F',
    spo2: '99 %',
    diagnosis: 'Type 2 Diabetes Mellitus with Essential Hypertension (controlled)',
    clinical_notes: 'Patient advised to maintain low-glycemic dietary regimen and daily aerobic exercise. Repeat HbA1c in 3 months.',
    follow_up_date: '2027-01-20',
  },
  {
    id: 'REC-602',
    appointment_id: 'APT-3001',
    patient_id: 'PAT-1001',
    doctor_id: 'DOC-201',
    doctor_name: 'Dr. Sarah Jenkins',
    date: '2026-10-31',
    status: 'Draft',
    chief_complaint: 'Chest discomfort on strenuous exertion',
    symptoms: 'Substernal tightness radiating to left shoulder',
    bp: '135/86 mmHg',
    heart_rate: '82 bpm',
    temperature: '98.6 °F',
    spo2: '98 %',
    diagnosis: 'Suspected Angina Pectoris',
    clinical_notes: 'Recommended treadmill stress test and 2D Echocardiogram.',
    follow_up_date: '2026-11-14',
  }
];

export const medicalService = {
  createMedicalRecord: async (recordData) => {
    if (isMockMode) {
      await new Promise((r) => setTimeout(r, 300));
      const newRecord = {
        id: `REC-${Math.floor(600 + Math.random() * 400)}`,
        date: new Date().toISOString().split('T')[0],
        ...recordData,
      };
      medicalRecordsDb.unshift(newRecord);
      return {
        success: true,
        message: 'Medical record saved successfully',
        data: newRecord,
      };
    }
    return api.post('/medical-records', recordData);
  },

  getMedicalRecordById: async (recordId) => {
    if (isMockMode) {
      await new Promise((r) => setTimeout(r, 150));
      const record = medicalRecordsDb.find((r) => r.id === recordId);
      if (!record) throw { success: false, message: 'Record not found', data: null };
      return { success: true, message: 'Record retrieved', data: record };
    }
    return api.get(`/medical-records/${recordId}`);
  },

  updateMedicalRecord: async (recordId, recordData) => {
    if (isMockMode) {
      await new Promise((r) => setTimeout(r, 200));
      const idx = medicalRecordsDb.findIndex((r) => r.id === recordId);
      if (idx === -1) throw { success: false, message: 'Record not found', data: null };

      // Prevent silently overwriting finalized records
      if (medicalRecordsDb[idx].status === 'Finalized' && !recordData.is_super_admin_override) {
        throw { success: false, message: 'Finalized medical records cannot be altered.', data: null };
      }

      medicalRecordsDb[idx] = { ...medicalRecordsDb[idx], ...recordData };
      return {
        success: true,
        message: 'Medical record updated successfully',
        data: medicalRecordsDb[idx],
      };
    }
    return api.put(`/medical-records/${recordId}`, recordData);
  },

  getPatientRecords: async (patientId) => {
    if (isMockMode) {
      await new Promise((r) => setTimeout(r, 150));
      const records = medicalRecordsDb.filter((r) => r.patient_id === patientId);
      return { success: true, message: 'Records retrieved', data: records };
    }
    return api.get(`/patients/${patientId}/records`);
  },
};

