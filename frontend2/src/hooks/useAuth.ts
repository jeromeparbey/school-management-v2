// src/hooks/useAuth.ts

import React, { useState, useEffect, createContext, useContext } from 'react';
import { authService } from '../services/auth.service';

interface User {
  id: string;
  email: string;
  prenom: string;
  nom: string;
  role: string;
  estActif: boolean;
  emailVerifie: boolean;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (data: any) => Promise<void>;
  verifyOtp: (userId: string, otp: string) => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (token: string, newPassword: string) => Promise<void>;
  changePassword: (oldPassword: string, newPassword: string) => Promise<void>;
  updateProfile: (data: any) => Promise<void>;
}


const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
      } finally {
        setLoading(false);
      }
    };
    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    const response = await authService.login(email, password);
    setUser(response.data.user);
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
  };

  const register = async (data: any) => {
    const response = await authService.register(data);
    localStorage.setItem('tempUserId', response.data.user.id);
    return response;
  };

  const verifyOtp = async (userId: string, otp: string) => {
    await authService.verifyOtp(userId, otp);
  };

  const forgotPassword = async (email: string) => {
    await authService.forgotPassword(email);
  };

  const resetPassword = async (token: string, newPassword: string) => {
    await authService.resetPassword(token, newPassword);
  };

  const changePassword = async (oldPassword: string, newPassword: string) => {
    await authService.changePassword(oldPassword, newPassword);
  };

  const updateProfile = async (data: any) => {
    const response = await authService.updateProfile(data);
    setUser(response.data);
  };

  const value = {
    user,
    loading,
    login,
    logout,   
    register,
    verifyOtp,
    forgotPassword,
    resetPassword,
    changePassword,
    updateProfile
  };

  // RETOURNER LE CONTEXTE CORRECTEMENT
  return React.createElement(
    AuthContext.Provider,
    { value },
    children
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};