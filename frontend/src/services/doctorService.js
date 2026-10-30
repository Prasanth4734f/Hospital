import api, { isMockMode } from './api';
import { initialDoctors } from '../mocks/doctors';

let doctorsDb = [...initialDoctors];

export const doctorService = {
  getDoctors: async (params = {}) => {
    if (isMockMode) {
      await new Promise((r) => setTimeout(r, 200));
      let results = [...doctorsDb];
      if (params.search) {
        const q = params.search.toLowerCase();
        results = results.filter(
          (d) =>
            d.full_name?.toLowerCase().includes(q) ||
            d.specialization?.toLowerCase().includes(q) ||
            d.department?.toLowerCase().includes(q)
        );
      }
      if (params.specialization && params.specialization !== 'All') {
        results = results.filter((d) => d.specialization === params.specialization);
      }
      if (params.availability && params.availability !== 'All') {
        results = results.filter((d) => d.availability === params.availability);
      }
      if (params.status && params.status !== 'All') {
        results = results.filter((d) => d.status === params.status);
      }
      return {
        success: true,
        message: 'Doctors retrieved successfully',
        data: results,
      };
    }
    return api.get('/doctors', { params });
  },

  getDoctorById: async (doctorId) => {
    if (isMockMode) {
      await new Promise((r) => setTimeout(r, 150));
      const doctor = doctorsDb.find((d) => d.id === doctorId);
      if (!doctor) {
        throw { success: false, message: 'Doctor not found', data: null };
      }
      return {
        success: true,
        message: 'Doctor retrieved successfully',
        data: doctor,
      };
    }
    return api.get(`/doctors/${doctorId}`);
  },

  createDoctor: async (doctorData) => {
    if (isMockMode) {
      await new Promise((r) => setTimeout(r, 300));
      const newId = `DOC-${Math.floor(200 + Math.random() * 800)}`;
      const newDoctor = {
        id: newId,
        availability: 'Available',
        status: 'Active',
        slots: ['09:00 AM', '10:00 AM', '11:00 AM', '02:00 PM', '03:00 PM'],
        profile_photo: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=300',
        ...doctorData,
      };
      doctorsDb.unshift(newDoctor);
      return {
        success: true,
        message: 'Doctor added successfully',
        data: newDoctor,
      };
    }
    return api.post('/doctors', doctorData);
  },

  updateDoctor: async (doctorId, doctorData) => {
    if (isMockMode) {
      await new Promise((r) => setTimeout(r, 250));
      const idx = doctorsDb.findIndex((d) => d.id === doctorId);
      if (idx === -1) {
        throw { success: false, message: 'Doctor not found', data: null };
      }
      doctorsDb[idx] = { ...doctorsDb[idx], ...doctorData };
      return {
        success: true,
        message: 'Doctor updated successfully',
        data: doctorsDb[idx],
      };
    }
    return api.put(`/doctors/${doctorId}`, doctorData);
  },

  getDoctorAvailability: async (doctorId, date) => {
    if (isMockMode) {
      await new Promise((r) => setTimeout(r, 150));
      const doctor = doctorsDb.find((d) => d.id === doctorId);
      return {
        success: true,
        message: 'Availability retrieved',
        data: {
          available_days: doctor?.available_days || ['Monday', 'Wednesday', 'Friday'],
          available_time: doctor?.available_time || '09:00 AM - 02:00 PM',
          slots: doctor?.slots || ['09:00 AM', '10:00 AM', '11:00 AM', '02:00 PM', '03:00 PM'],
        },
      };
    }
    return api.get(`/doctors/${doctorId}/availability`, { params: { date } });
  },

  updateDoctorAvailability: async (doctorId, availabilityData) => {
    if (isMockMode) {
      await new Promise((r) => setTimeout(r, 200));
      const idx = doctorsDb.findIndex((d) => d.id === doctorId);
      if (idx !== -1) {
        doctorsDb[idx] = { ...doctorsDb[idx], ...availabilityData };
        return {
          success: true,
          message: 'Doctor availability updated successfully',
          data: doctorsDb[idx],
        };
      }
    }
    return api.put(`/doctors/${doctorId}/availability`, availabilityData);
  },

  toggleDoctorStatus: async (doctorId) => {
    if (isMockMode) {
      const idx = doctorsDb.findIndex((d) => d.id === doctorId);
      if (idx !== -1) {
        doctorsDb[idx].status = doctorsDb[idx].status === 'Active' ? 'Inactive' : 'Active';
        return {
          success: true,
          message: `Doctor ${doctorsDb[idx].status === 'Active' ? 'activated' : 'deactivated'} successfully`,
          data: doctorsDb[idx],
        };
      }
    }
    return api.patch(`/doctors/${doctorId}/status`);
  },
};

