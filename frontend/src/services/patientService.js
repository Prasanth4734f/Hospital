import api, { isMockMode } from './api';
import { initialPatients } from '../mocks/patients';

let patientsDb = [...initialPatients];

export const patientService = {
  getPatients: async (params = {}) => {
    if (isMockMode) {
      await new Promise((r) => setTimeout(r, 200));
      let results = [...patientsDb];
      if (params.search) {
        const q = params.search.toLowerCase();
        results = results.filter(
          (p) =>
            p.full_name?.toLowerCase().includes(q) ||
            p.phone?.includes(q) ||
            p.id?.toLowerCase().includes(q)
        );
      }
      if (params.gender && params.gender !== 'All') {
        results = results.filter((p) => p.gender === params.gender);
      }
      if (params.blood_group && params.blood_group !== 'All') {
        results = results.filter((p) => p.blood_group === params.blood_group);
      }
      if (params.status && params.status !== 'All') {
        results = results.filter((p) => p.status === params.status);
      }
      return {
        success: true,
        message: 'Patients retrieved successfully',
        data: results,
      };
    }
    return api.get('/patients', { params });
  },

  getPatientById: async (patientId) => {
    if (isMockMode) {
      await new Promise((r) => setTimeout(r, 150));
      const patient = patientsDb.find((p) => p.id === patientId);
      if (!patient) {
        throw { success: false, message: 'Patient not found', data: null };
      }
      return {
        success: true,
        message: 'Patient retrieved successfully',
        data: patient,
      };
    }
    return api.get(`/patients/${patientId}`);
  },

  createPatient: async (patientData) => {
    if (isMockMode) {
      await new Promise((r) => setTimeout(r, 300));
      const newId = `PAT-${Math.floor(1000 + Math.random() * 9000)}`;
      const birthYear = new Date(patientData.dob).getFullYear();
      const calculatedAge = !isNaN(birthYear) ? new Date().getFullYear() - birthYear : 30;

      const newPatient = {
        id: newId,
        full_name: `${patientData.first_name} ${patientData.last_name}`,
        age: calculatedAge,
        registration_date: new Date().toISOString().split('T')[0],
        status: 'Active',
        allergies: patientData.allergies ? [patientData.allergies] : [],
        medical_history: [],
        ...patientData,
      };
      patientsDb.unshift(newPatient);
      return {
        success: true,
        message: 'Patient registered successfully',
        data: newPatient,
      };
    }
    return api.post('/patients', patientData);
  },

  updatePatient: async (patientId, patientData) => {
    if (isMockMode) {
      await new Promise((r) => setTimeout(r, 250));
      const idx = patientsDb.findIndex((p) => p.id === patientId);
      if (idx === -1) {
        throw { success: false, message: 'Patient not found', data: null };
      }
      patientsDb[idx] = {
        ...patientsDb[idx],
        ...patientData,
        full_name: patientData.first_name && patientData.last_name
          ? `${patientData.first_name} ${patientData.last_name}`
          : patientsDb[idx].full_name,
      };
      return {
        success: true,
        message: 'Patient profile updated successfully',
        data: patientsDb[idx],
      };
    }
    return api.put(`/patients/${patientId}`, patientData);
  },

  getPatientHistory: async (patientId) => {
    if (isMockMode) {
      await new Promise((r) => setTimeout(r, 150));
      const patient = patientsDb.find((p) => p.id === patientId);
      return {
        success: true,
        message: 'Patient history retrieved',
        data: patient?.medical_history || [],
      };
    }
    return api.get(`/patients/${patientId}/history`);
  },

  togglePatientStatus: async (patientId) => {
    if (isMockMode) {
      const idx = patientsDb.findIndex((p) => p.id === patientId);
      if (idx !== -1) {
        patientsDb[idx].status = patientsDb[idx].status === 'Active' ? 'Inactive' : 'Active';
        return {
          success: true,
          message: `Patient ${patientsDb[idx].status === 'Active' ? 'activated' : 'deactivated'} successfully`,
          data: patientsDb[idx],
        };
      }
    }
    return api.patch(`/patients/${patientId}/status`);
  },
};

