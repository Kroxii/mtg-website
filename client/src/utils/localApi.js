import axios from 'axios';

// Configuration de base pour l'API locale
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

// Instance Axios pour l'API locale
export const localApi = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Intercepteur pour ajouter le token d'authentification
localApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Intercepteur pour gérer les erreurs de réponse
localApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expiré ou invalide
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    console.error('Erreur API locale:', error);
    return Promise.reject(error);
  }
);

// Fonctions d'API pour l'authentification
export const authApi = {
  // Vérifier la santé du serveur
  checkHealth: async () => {
    try {
      const response = await localApi.get('/health');
      return response.data;
    } catch (error) {
      throw new Error('Impossible de se connecter au serveur');
    }
  },

  // Connexion
  login: async (email, password) => {
    try {
      const response = await localApi.post('/auth/login', { email, password });
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
      }
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Erreur de connexion');
    }
  },

  // Inscription
  register: async (userData) => {
    try {
      const response = await localApi.post('/auth/register', userData);
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
      }
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Erreur d\'inscription');
    }
  },

  // Déconnexion
  logout: async () => {
    try {
      await localApi.post('/auth/logout');
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    } finally {
      localStorage.removeItem('token');
    }
  },

  // Obtenir le profil utilisateur
  getProfile: async () => {
    try {
      const response = await localApi.get('/auth/profile');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la récupération du profil');
    }
  }
};

// Fonctions d'API pour les cartes
export const cardsApi = {
  // Rechercher des cartes via l'API locale
  searchCards: async (query, page = 1) => {
    try {
      const response = await localApi.get('/cards/search', {
        params: { q: query, page }
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Erreur de recherche de cartes');
    }
  },

  // Obtenir les détails d'une carte
  getCard: async (cardId) => {
    try {
      const response = await localApi.get(`/cards/${cardId}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la récupération de la carte');
    }
  }
};

// Fonctions d'API pour les collections
export const collectionsApi = {
  // Obtenir les collections de l'utilisateur
  getUserCollections: async () => {
    try {
      const response = await localApi.get('/collections');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la récupération des collections');
    }
  },

  // Créer une nouvelle collection
  createCollection: async (collectionData) => {
    try {
      const response = await localApi.post('/collections', collectionData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la création de la collection');
    }
  }
};

export default localApi;
