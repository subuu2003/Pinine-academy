'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import apiClient from './apiClient';

export interface User {
  id: number;
  username: string;
  email: string;
  first_name?: string;
  last_name?: string;
  full_name?: string;
  phone_number?: string;
  role?: 'ADMIN' | 'STUDENT' | string;
  is_student?: boolean;
  is_teacher?: boolean;
  is_staff?: boolean;
  is_superuser?: boolean;
  is_active?: boolean;
  grade?: string;
  target_exam?: string;
  school_or_college?: string;
  city?: string;
  address?: string;
  date_joined?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoadingAuth: boolean;
  authError: any;
  login: (identifier: string, password: string) => Promise<{ success: boolean; user?: User; message?: string; inactive?: boolean }>;
  register: (userData: any) => Promise<{ success: boolean; user?: User; message?: string }>;
  updateProfile: (profileData: Partial<User>) => Promise<{ success: boolean; user?: User; message?: string }>;
  changePassword: (oldPassword: string, newPassword: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
  navigateToLogin: () => void;
  refetchUser: () => Promise<User | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState<boolean>(true);
  const [authError, setAuthError] = useState<any>(null);

  const checkAuth = async (): Promise<User | null> => {
    if (typeof window === 'undefined') {
      setIsLoadingAuth(false);
      return null;
    }

    const token = localStorage.getItem('authToken');
    if (!token) {
      setIsAuthenticated(false);
      setUser(null);
      setIsLoadingAuth(false);
      return null;
    }

    try {
      const response = await apiClient.get('/auth/me/');
      setUser(response.data);
      setIsAuthenticated(true);
      return response.data;
    } catch (error) {
      console.error('Auth verification failed:', error);
      logout();
      return null;
    } finally {
      setIsLoadingAuth(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const login = async (identifier: string, password: string) => {
    try {
      const response = await apiClient.post('/auth/login/', { identifier, password });
      const { access, refresh, user: userData } = response.data;
      if (typeof window !== 'undefined') {
        localStorage.setItem('authToken', access);
        localStorage.setItem('refreshToken', refresh);
      }
      setUser(userData);
      setIsAuthenticated(true);
      return { success: true, user: userData };
    } catch (error: any) {
      const data = error.response?.data;
      const isInactive = Boolean(data?.inactive);
      let message = 'Invalid email/phone or password.';
      if (data?.detail) {
        message = data.detail;
      } else if (typeof data === 'object') {
        const firstVal = Object.values(data).flat()[0];
        if (typeof firstVal === 'string') message = firstVal;
      }
      return { success: false, message, inactive: isInactive };
    }
  };

  const register = async (userData: any) => {
    try {
      const response = await apiClient.post('/auth/register/', userData);
      const { access, refresh, user: newUser } = response.data;
      if (access && refresh && typeof window !== 'undefined') {
        localStorage.setItem('authToken', access);
        localStorage.setItem('refreshToken', refresh);
        setUser(newUser);
        setIsAuthenticated(true);
      }
      return { success: true, user: newUser };
    } catch (error: any) {
      const data = error.response?.data;
      let message = 'Registration failed. Please check the details provided.';
      if (data?.detail) {
        message = data.detail;
      } else if (typeof data === 'object') {
        const firstVal = Object.values(data).flat()[0];
        if (typeof firstVal === 'string') message = firstVal;
      }
      return { success: false, message };
    }
  };

  const updateProfile = async (profileData: Partial<User>) => {
    try {
      const response = await apiClient.patch('/auth/profile/', profileData);
      setUser(response.data);
      return { success: true, user: response.data };
    } catch (error: any) {
      const data = error.response?.data;
      let message = 'Failed to update profile.';
      if (data?.detail) {
        message = data.detail;
      } else if (typeof data === 'object') {
        const firstVal = Object.values(data).flat()[0];
        if (typeof firstVal === 'string') message = firstVal;
      }
      return { success: false, message };
    }
  };

  const changePassword = async (old_password: string, new_password: string) => {
    try {
      const response = await apiClient.post('/auth/change-password/', {
        old_password,
        new_password
      });
      return { success: true, message: response.data?.detail || 'Password changed successfully.' };
    } catch (error: any) {
      const data = error.response?.data;
      let message = 'Failed to change password.';
      if (data?.detail) {
        message = data.detail;
      } else if (typeof data === 'object') {
        const firstVal = Object.values(data).flat()[0];
        if (typeof firstVal === 'string') message = firstVal;
      }
      return { success: false, message };
    }
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('authToken');
      localStorage.removeItem('refreshToken');
    }
  };

  const navigateToLogin = () => {
    if (typeof window !== 'undefined') {
      window.location.href = '/sign-in';
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      isAuthenticated, 
      isLoadingAuth,
      authError,
      login,
      register,
      updateProfile,
      changePassword,
      logout,
      navigateToLogin,
      refetchUser: checkAuth
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
