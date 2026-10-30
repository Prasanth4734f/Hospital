import api, { isMockMode } from './api';
import { ROLES } from '../utils/constants';

// Realistic mock users for instant test drive across all 6 roles
const MOCK_USERS = [
  {
    id: 'USR-ADMIN-1',
    email: 'admin@medicore.com',
    full_name: 'Dr. Gregory House',
    role: ROLES.HOSPITAL_ADMIN,
    department: 'Hospital Administration',
    avatar: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=150',
  },
  {
    id: 'USR-DOC-1',
    email: 'doctor@medicore.com',
    full_name: 'Dr. Sarah Jenkins',
    doctor_id: 'DOC-201',
    role: ROLES.DOCTOR,
    department: 'Cardiology',
    avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=150',
  },
  {
    id: 'USR-RECEP-1',
    email: 'reception@medicore.com',
    full_name: 'Emma Watson',
    role: ROLES.RECEPTIONIST,
    department: 'Front Desk',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=150',
  },
  {
    id: 'USR-PHARM-1',
    email: 'pharmacy@medicore.com',
    full_name: 'Alex Morgan',
    role: ROLES.PHARMACIST,
    department: 'Central Pharmacy',
    avatar: 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?auto=format&fit=crop&q=80&w=150',
  },
  {
    id: 'USR-PAT-1',
    email: 'patient@medicore.com',
    full_name: 'Eleanor Vance',
    patient_id: 'PAT-1001',
    role: ROLES.PATIENT,
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=150',
  },
];

export const authService = {
  login: async (credentials) => {
    if (isMockMode) {
      await new Promise((r) => setTimeout(r, 400));
      const email = credentials.email?.toLowerCase().trim();
      const matched = MOCK_USERS.find((u) => u.email.toLowerCase() === email);

      if (matched && credentials.password) {
        const token = 'mock_jwt_token_' + matched.role.toLowerCase() + '_' + Date.now();
        localStorage.setItem('medicore_token', token);
        localStorage.setItem('medicore_user', JSON.stringify(matched));
        return {
          success: true,
          message: 'Login successful',
          data: {
            access_token: token,
            token_type: 'bearer',
            user: matched,
          },
        };
      }
      // If entered credentials don't match standard demo users, check if valid email format
      if (email && credentials.password) {
        // default fallback to admin for testing flexibility if custom email
        const user = {
          id: 'USR-CUSTOM',
          email,
          full_name: 'MediCore User',
          role: ROLES.HOSPITAL_ADMIN,
          department: 'Administration',
          avatar: null,
        };
        const token = 'mock_jwt_custom_' + Date.now();
        localStorage.setItem('medicore_token', token);
        localStorage.setItem('medicore_user', JSON.stringify(user));
        return {
          success: true,
          message: 'Login successful',
          data: { access_token: token, token_type: 'bearer', user },
        };
      }
      throw {
        success: false,
        message: 'Invalid email or password.',
      };
    }
    return api.post('/auth/login', credentials);
  },

  getCurrentUser: async () => {
    if (isMockMode) {
      const stored = localStorage.getItem('medicore_user');
      if (stored) {
        return {
          success: true,
          data: JSON.parse(stored),
        };
      }
      return { success: false, data: null };
    }
    return api.get('/auth/me');
  },

  register: async (userData) => {
    if (isMockMode) {
      await new Promise((r) => setTimeout(r, 500));
      const newUser = {
        id: 'USR-PAT-' + Math.floor(1000 + Math.random() * 9000),
        email: userData.email,
        full_name: `${userData.first_name} ${userData.last_name}`,
        role: ROLES.PATIENT,
        patient_id: 'PAT-' + Math.floor(1000 + Math.random() * 9000),
      };
      return {
        success: true,
        message: 'Patient account created successfully. Please sign in.',
        data: newUser,
      };
    }
    return api.post('/auth/register', userData);
  },

  forgotPassword: async (email) => {
    if (isMockMode) {
      await new Promise((r) => setTimeout(r, 400));
      return {
        success: true,
        message: 'Password reset link sent to ' + email,
        data: null,
      };
    }
    return api.post('/auth/forgot-password', { email });
  },

  resetPassword: async (token, newPassword) => {
    if (isMockMode) {
      await new Promise((r) => setTimeout(r, 400));
      return {
        success: true,
        message: 'Password has been updated successfully.',
        data: null,
      };
    }
    return api.post('/auth/reset-password', { token, new_password: newPassword });
  },

  logout: async () => {
    localStorage.removeItem('medicore_token');
    localStorage.removeItem('medicore_user');
    if (!isMockMode) {
      try {
        await api.post('/auth/logout');
      } catch (e) {
        // ignore logout network errors
      }
    }
    return { success: true };
  },
};

