import api, { isMockMode } from './api';
import { mockAdminDashboard } from '../mocks/dashboard';

export const dashboardService = {
  getAdminDashboard: async () => {
    if (isMockMode) {
      await new Promise((r) => setTimeout(r, 200));
      return {
        success: true,
        message: 'Admin dashboard data loaded',
        data: mockAdminDashboard,
      };
    }
    return api.get('/dashboard/admin');
  },

  getStatistics: async () => {
    if (isMockMode) {
      await new Promise((r) => setTimeout(r, 150));
      return {
        success: true,
        message: 'Statistics loaded',
        data: mockAdminDashboard.statistics,
      };
    }
    return api.get('/dashboard/statistics');
  },

  getRecentActivities: async () => {
    if (isMockMode) {
      await new Promise((r) => setTimeout(r, 150));
      return {
        success: true,
        message: 'Activities loaded',
        data: mockAdminDashboard.recent_activities,
      };
    }
    return api.get('/dashboard/recent-activities');
  },

  getDoctorDashboard: async (doctorId) => {
    if (isMockMode) {
      await new Promise((r) => setTimeout(r, 200));
      return {
        success: true,
        data: {
          today_appointments: 8,
          pending_consultations: 2,
          completed_consultations: 6,
          assigned_patients: 64,
        },
      };
    }
    return api.get(`/dashboard/doctor/${doctorId}`);
  },

  getPatientDashboard: async (patientId) => {
    if (isMockMode) {
      await new Promise((r) => setTimeout(r, 200));
      return {
        success: true,
        data: {
          upcoming_appointments: 1,
          completed_appointments: 5,
          pending_payments: 0,
          prescriptions_count: 2,
        },
      };
    }
    return api.get(`/dashboard/patient/${patientId}`);
  },
};

