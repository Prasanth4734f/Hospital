import api, { isMockMode } from './api';

export const reportService = {
  getPatientReport: async (params) => {
    if (isMockMode) {
      await new Promise((r) => setTimeout(r, 200));
      return {
        success: true,
        data: {
          total_registrations: 48,
          gender_distribution: [
            { name: 'Male', value: 26 },
            { name: 'Female', value: 20 },
            { name: 'Other', value: 2 },
          ],
          age_groups: [
            { group: '0-18', count: 8 },
            { group: '19-35', count: 18 },
            { group: '36-60', count: 15 },
            { group: '60+', count: 7 },
          ],
        },
      };
    }
    return api.get('/reports/patients', { params });
  },

  getDoctorReport: async (params) => {
    if (isMockMode) {
      await new Promise((r) => setTimeout(r, 200));
      return {
        success: true,
        data: {
          doctor_workload: [
            { name: 'Dr. Sarah Jenkins', consultations: 120, avg_rating: 4.9 },
            { name: 'Dr. Marcus Vance', consultations: 145, avg_rating: 4.8 },
            { name: 'Dr. Elena Rostova', consultations: 98, avg_rating: 4.9 },
            { name: 'Dr. Rachel Zane', consultations: 110, avg_rating: 4.7 },
          ],
        },
      };
    }
    return api.get('/reports/doctors', { params });
  },

  getAppointmentReport: async (params) => {
    if (isMockMode) {
      await new Promise((r) => setTimeout(r, 200));
      return {
        success: true,
        data: {
          completion_rate: '88.4%',
          cancellation_rate: '7.2%',
          no_show_rate: '4.4%',
          daily_distribution: [
            { day: 'Mon', completed: 28, cancelled: 2 },
            { day: 'Tue', completed: 32, cancelled: 3 },
            { day: 'Wed', completed: 30, cancelled: 1 },
            { day: 'Thu', completed: 35, cancelled: 4 },
            { day: 'Fri', completed: 38, cancelled: 2 },
            { day: 'Sat', completed: 22, cancelled: 1 },
          ],
        },
      };
    }
    return api.get('/reports/appointments', { params });
  },

  getRevenueReport: async (params) => {
    if (isMockMode) {
      await new Promise((r) => setTimeout(r, 200));
      return {
        success: true,
        data: {
          total_revenue: 94500,
          pending_revenue: 14200,
          revenue_by_dept: [
            { name: 'Cardiology', revenue: 32000 },
            { name: 'Orthopedics', revenue: 24500 },
            { name: 'General Medicine', revenue: 19800 },
            { name: 'Neurology', revenue: 11200 },
            { name: 'Pediatrics', revenue: 7000 },
          ],
        },
      };
    }
    return api.get('/reports/revenue', { params });
  },
};

