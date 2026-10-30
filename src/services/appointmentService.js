import api, { isMockMode } from './api';
import { initialAppointments } from '../mocks/appointments';

let appointmentsDb = [...initialAppointments];

export const appointmentService = {
  getAppointments: async (params = {}) => {
    if (isMockMode) {
      await new Promise((r) => setTimeout(r, 200));
      let results = [...appointmentsDb];
      if (params.doctor_id) {
        results = results.filter((a) => a.doctor_id === params.doctor_id);
      }
      if (params.patient_id) {
        results = results.filter((a) => a.patient_id === params.patient_id);
      }
      if (params.status && params.status !== 'All') {
        results = results.filter((a) => a.status === params.status);
      }
      if (params.date) {
        results = results.filter((a) => a.appointment_date === params.date);
      }
      if (params.search) {
        const q = params.search.toLowerCase();
        results = results.filter(
          (a) =>
            a.patient_name?.toLowerCase().includes(q) ||
            a.doctor_name?.toLowerCase().includes(q) ||
            a.id?.toLowerCase().includes(q)
        );
      }
      return {
        success: true,
        message: 'Appointments retrieved successfully',
        data: results,
      };
    }
    return api.get('/appointments', { params });
  },

  getAppointmentById: async (id) => {
    if (isMockMode) {
      await new Promise((r) => setTimeout(r, 150));
      const apt = appointmentsDb.find((a) => a.id === id);
      if (!apt) throw { success: false, message: 'Appointment not found', data: null };
      return { success: true, message: 'Appointment retrieved', data: apt };
    }
    return api.get(`/appointments/${id}`);
  },

  getAvailability: async (doctorId, date) => {
    if (isMockMode) {
      await new Promise((r) => setTimeout(r, 200));
      // Generate available slots minus any booked ones
      const bookedSlots = appointmentsDb
        .filter((a) => a.doctor_id === doctorId && a.appointment_date === date && a.status !== 'Cancelled')
        .map((a) => a.time_slot);

      const allSlots = ['09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM', '02:00 PM', '02:30 PM', '03:00 PM', '03:30 PM'];
      const availableSlots = allSlots.filter((s) => !bookedSlots.includes(s));

      return {
        success: true,
        message: 'Available slots fetched',
        data: {
          doctor_id: doctorId,
          date,
          slots: availableSlots,
        },
      };
    }
    return api.get('/appointments/availability', { params: { doctor_id: doctorId, date } });
  },

  bookAppointment: async (appointmentData) => {
    if (isMockMode) {
      await new Promise((r) => setTimeout(r, 350));
      const newId = `APT-${Math.floor(3100 + Math.random() * 900)}`;
      const tokenNum = `T-${Math.floor(100 + Math.random() * 900)}`;
      const newAppointment = {
        id: newId,
        token_no: tokenNum,
        status: 'Confirmed',
        created_at: new Date().toISOString(),
        check_in_time: null,
        ...appointmentData,
      };
      appointmentsDb.unshift(newAppointment);
      return {
        success: true,
        message: 'Appointment booked successfully',
        data: newAppointment,
      };
    }
    return api.post('/appointments', appointmentData);
  },

  updateStatus: async (appointmentId, status) => {
    if (isMockMode) {
      await new Promise((r) => setTimeout(r, 200));
      const idx = appointmentsDb.findIndex((a) => a.id === appointmentId);
      if (idx !== -1) {
        appointmentsDb[idx].status = status;
        if (status === 'Checked In' && !appointmentsDb[idx].check_in_time) {
          appointmentsDb[idx].check_in_time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        }
        return {
          success: true,
          message: `Appointment status updated to ${status}`,
          data: appointmentsDb[idx],
        };
      }
    }
    return api.patch(`/appointments/${appointmentId}/status`, { status });
  },

  checkInPatient: async (appointmentId) => {
    return appointmentService.updateStatus(appointmentId, 'Checked In');
  },

  rescheduleAppointment: async (appointmentId, newDate, newTime) => {
    if (isMockMode) {
      await new Promise((r) => setTimeout(r, 250));
      const idx = appointmentsDb.findIndex((a) => a.id === appointmentId);
      if (idx !== -1) {
        appointmentsDb[idx].appointment_date = newDate;
        appointmentsDb[idx].appointment_time = newTime;
        appointmentsDb[idx].time_slot = newTime;
        appointmentsDb[idx].status = 'Confirmed';
        return {
          success: true,
          message: 'Appointment rescheduled successfully',
          data: appointmentsDb[idx],
        };
      }
    }
    return api.patch(`/appointments/${appointmentId}/reschedule`, { date: newDate, time: newTime });
  },

  cancelAppointment: async (appointmentId, reason = 'Cancelled by user') => {
    return appointmentService.updateStatus(appointmentId, 'Cancelled');
  },
};

