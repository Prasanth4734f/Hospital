import api, { isMockMode } from './api';
import { initialPrescriptions } from '../mocks/prescriptions';

let prescriptionsDb = [...initialPrescriptions];

export const prescriptionService = {
  getPrescriptions: async (params = {}) => {
    if (isMockMode) {
      await new Promise((r) => setTimeout(r, 200));
      let results = [...prescriptionsDb];
      if (params.patient_id) {
        results = results.filter((p) => p.patient_id === params.patient_id);
      }
      if (params.doctor_id) {
        results = results.filter((p) => p.doctor_id === params.doctor_id);
      }
      if (params.search) {
        const q = params.search.toLowerCase();
        results = results.filter(
          (p) =>
            p.patient_name?.toLowerCase().includes(q) ||
            p.id?.toLowerCase().includes(q) ||
            p.diagnosis?.toLowerCase().includes(q)
        );
      }
      return {
        success: true,
        message: 'Prescriptions retrieved successfully',
        data: results,
      };
    }
    return api.get('/prescriptions', { params });
  },

  getPrescriptionById: async (id) => {
    if (isMockMode) {
      await new Promise((r) => setTimeout(r, 150));
      const rx = prescriptionsDb.find((p) => p.id === id);
      if (!rx) throw { success: false, message: 'Prescription not found', data: null };
      return { success: true, message: 'Prescription retrieved', data: rx };
    }
    return api.get(`/prescriptions/${id}`);
  },

  getPatientPrescriptions: async (patientId) => {
    if (isMockMode) {
      await new Promise((r) => setTimeout(r, 150));
      const records = prescriptionsDb.filter((p) => p.patient_id === patientId);
      return { success: true, message: 'Patient prescriptions retrieved', data: records };
    }
    return api.get(`/patients/${patientId}/prescriptions`);
  },

  createPrescription: async (prescriptionData) => {
    if (isMockMode) {
      await new Promise((r) => setTimeout(r, 300));
      const newId = `RX-${Math.floor(700 + Math.random() * 300)}`;
      const newPrescription = {
        id: newId,
        date: new Date().toISOString().split('T')[0],
        status: 'Finalized',
        ...prescriptionData,
      };
      prescriptionsDb.unshift(newPrescription);
      return {
        success: true,
        message: 'Prescription saved successfully',
        data: newPrescription,
      };
    }
    return api.post('/prescriptions', prescriptionData);
  },
};

