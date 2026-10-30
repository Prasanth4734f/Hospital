import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';
import { ROLE_REDIRECTS } from '../utils/constants';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem('medicore_token');
      const storedUser = localStorage.getItem('medicore_user');

      if (storedToken && storedUser) {
        setToken(storedToken);
        try {
          setUser(JSON.parse(storedUser));
        } catch {
          setUser(null);
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (credentials) => {
    const res = await authService.login(credentials);
    if (res.success && res.data) {
      const { access_token, user: loggedUser } = res.data;
      setToken(access_token);
      setUser(loggedUser);
      localStorage.setItem('medicore_token', access_token);
      localStorage.setItem('medicore_user', JSON.stringify(loggedUser));
      return { success: true, user: loggedUser };
    }
    return res;
  };

  const logout = async () => {
    await authService.logout();
    setToken(null);
    setUser(null);
  };

  const updateUser = (userData) => {
    setUser((prev) => {
      const updated = { ...prev, ...userData };
      localStorage.setItem('medicore_user', JSON.stringify(updated));
      return updated;
    });
  };

  const getDashboardRedirect = () => {
    if (!user || !user.role) return '/login';
    return ROLE_REDIRECTS[user.role] || '/login';
  };

  const value = {
    user,
    token,
    role: user?.role,
    isAuthenticated: !!token && !!user,
    loading,
    login,
    logout,
    updateUser,
    getDashboardRedirect,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
};

