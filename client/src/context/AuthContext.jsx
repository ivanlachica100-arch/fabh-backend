import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/client';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkCurrentUser();
  }, []);

  const checkCurrentUser = async () => {
    try {
      const res = await api.get('/auth/me');
      setUser(res.data.data || res.data.user || null);
    } catch {
      setUser(null);
      localStorage.removeItem('token');
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    
    // Save JWT token in localStorage for cross-port fallback
    if (res.data.token) {
      localStorage.setItem('token', res.data.token);
    }

    const loggedInUser = res.data.data || res.data.user;
    setUser(loggedInUser);
    return loggedInUser;
  };

  const register = async (name, email, password) => {
    const res = await api.post('/auth/register', { name, email, password });
    
    // Save JWT token in localStorage for cross-port fallback
    if (res.data.token) {
      localStorage.setItem('token', res.data.token);
    }

    const newUser = res.data.data || res.data.user;
    setUser(newUser);
    return newUser;
  };

  const applyLandlord = async (applicationData) => {
    // If FormData is sent, Axios automatically handles boundary formatting
    const isFormData = applicationData instanceof FormData;
    const config = isFormData
      ? { headers: { 'Content-Type': 'multipart/form-data' } }
      : {};

    const res = await api.post('/users/apply-landlord', applicationData, config);
    const updatedApplication = res.data.application;
    setUser((prev) => ({
      ...prev,
      landlordApplication: updatedApplication,
    }));
    return res.data;
  };
  const logout = async () => {
    try {
      await api.get('/auth/logout');
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      localStorage.removeItem('token');
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        applyLandlord,
        checkCurrentUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);