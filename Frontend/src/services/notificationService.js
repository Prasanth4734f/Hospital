import api, { isMockMode } from './api';
import { initialNotifications } from '../mocks/notifications';

let notifsDb = [...initialNotifications];

export const notificationService = {
  getNotifications: async () => {
    if (isMockMode) {
      await new Promise((r) => setTimeout(r, 150));
      return {
        success: true,
        message: 'Notifications retrieved',
        data: notifsDb,
      };
    }
    return api.get('/notifications');
  },

  markAsRead: async (id) => {
    if (isMockMode) {
      const idx = notifsDb.findIndex((n) => n.id === id);
      if (idx !== -1) notifsDb[idx].read = true;
      return { success: true, message: 'Notification marked as read', data: notifsDb[idx] };
    }
    return api.patch(`/notifications/${id}/read`);
  },

  markAllAsRead: async () => {
    if (isMockMode) {
      notifsDb = notifsDb.map((n) => ({ ...n, read: true }));
      return { success: true, message: 'All notifications marked as read', data: notifsDb };
    }
    return api.patch('/notifications/read-all');
  },

  deleteNotification: async (id) => {
    if (isMockMode) {
      notifsDb = notifsDb.filter((n) => n.id !== id);
      return { success: true, message: 'Notification deleted', data: id };
    }
    return api.delete(`/notifications/${id}`);
  },
};

