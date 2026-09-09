// frontend/src/services/auth.service.ts

import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api/v1';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor pour ajouter le token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor pour rafraîchir le token
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) throw new Error('No refresh token');

        const response = await axios.post(`${API_URL}/auth/refresh`, { refreshToken });
        const { accessToken, refreshToken: newRefreshToken } = response.data.data;

        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', newRefreshToken);

        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch (err) {
        localStorage.clear();
        window.location.href = '/login';
        return Promise.reject(err);
      }
    }

    return Promise.reject(error);
  }
);

export const authService = {
  // Inscription
  async register(data: {
    email: string;
    motDePasse: string;
    prenom: string;
    nom: string;
    role?: string;
    telephone?: string;
  }) {
    const response = await api.post('/auth/register', data);
    return response.data;
  },

  // Connexion
  async login(email: string, motDePasse: string) {
    const response = await api.post('/auth/login', { email, motDePasse });
    if (response.data.data.tokens) {
      localStorage.setItem('accessToken', response.data.data.tokens.accessToken);
      localStorage.setItem('refreshToken', response.data.data.tokens.refreshToken);
      localStorage.setItem('user', JSON.stringify(response.data.data.user));
    }
    return response.data;
  },

  // Vérification OTP
  async verifyOtp(userId: string, otp: string) {
    const response = await api.post('/auth/verify-otp', { userId, otp });
    return response.data;
  },

  // Renvoyer OTP
  async resendOtp(userId: string) {
    const response = await api.post('/auth/resend-otp', { userId });
    return response.data;
  },

  // Rafraîchir token
  async refreshToken() {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) throw new Error('No refresh token');
    const response = await api.post('/auth/refresh', { refreshToken });
    if (response.data.data) {
      localStorage.setItem('accessToken', response.data.data.accessToken);
      localStorage.setItem('refreshToken', response.data.data.refreshToken);
    }
    return response.data;
  },

  // Déconnexion
  async logout() {
    const token = localStorage.getItem('accessToken');
    if (token) {
      await api.post('/auth/logout', {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
    }
    localStorage.clear();
  },

  // Obtenir l'utilisateur connecté
  async getCurrentUser() {
    const response = await api.get('/auth/me');
    return response.data;
  },

  // Mot de passe oublié
  async forgotPassword(email: string) {
    const response = await api.post('/auth/forgot-password', { email });
    return response.data;
  },
 
  // Réinitialiser mot de passe
  async resetPassword(token: string, nouveauMotDePasse: string) {
    const response = await api.post('/auth/reset-password', {
      token,
      nouveauMotDePasse
    });
    return response.data;
  },

  // Changer mot de passe
  async changePassword(ancienMotDePasse: string, nouveauMotDePasse: string) {
    const response = await api.post('/auth/change-password', {
      ancienMotDePasse,
      nouveauMotDePasse
    });
    return response.data;
  },

  // Mettre à jour le profil
  async updateProfile(data: {
    prenom?: string;
    nom?: string;
    telephone?: string;
    photoProfil?: string;
  }) {
    const response = await api.put('/auth/me', data);
    return response.data;
  }
};