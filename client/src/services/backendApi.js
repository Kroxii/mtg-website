import axios from 'axios';

// Configuration de l'API backend
const API_BASE_URL = 'http://localhost:5000/api';

// Instance Axios pour les appels API backend avec authentification
const backendApiInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000
});

// Intercepteur pour ajouter le token d'authentification automatiquement
backendApiInstance.interceptors.request.use(
  (config) => {
    const user = JSON.parse(localStorage.getItem('mtg_user') || '{}');
    if (user.token) {
      config.headers.Authorization = `Bearer ${user.token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Intercepteur pour gérer les erreurs d'authentification
backendApiInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expiré ou invalide, déconnecter l'utilisateur
      localStorage.removeItem('mtg_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ===== SERVICES D'AUTHENTIFICATION =====

export const authService = {
  login: async (email, password) => {
    try {
      const response = await backendApiInstance.post('/auth/login', { email, password });
      const { token, user } = response.data;
      
      // Stocker le token et les infos utilisateur
      const userData = { ...user, token };
      localStorage.setItem('mtg_user', JSON.stringify(userData));
      
      return { success: true, user: userData };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Erreur de connexion'
      };
    }
  },

  register: async (userData) => {
    try {
      const response = await backendApiInstance.post('/auth/register', userData);
      const { token, user } = response.data;
      
      // Stocker le token et les infos utilisateur
      const userDataWithToken = { ...user, token };
      localStorage.setItem('mtg_user', JSON.stringify(userDataWithToken));
      
      return { success: true, user: userDataWithToken };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Erreur lors de l\'inscription'
      };
    }
  },

  logout: () => {
    localStorage.removeItem('mtg_user');
    window.location.href = '/login';
  },

  getCurrentUser: () => {
    try {
      const userData = localStorage.getItem('mtg_user');
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'utilisateur:', error);
      return null;
    }
  }
};

// ===== SERVICES DE COLLECTION =====

export const collectionService = {
  // Récupérer toutes les collections de l'utilisateur connecté
  getMyCollections: async () => {
    try {
      const response = await backendApiInstance.get('/collections');
      return { success: true, collections: response.data.collections };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Erreur lors de la récupération des collections'
      };
    }
  },

  // Créer une nouvelle collection
  createCollection: async (collectionData) => {
    try {
      const response = await backendApiInstance.post('/collections', {
        name: collectionData.name || 'Ma Collection',
        description: collectionData.description || '',
        isPublic: collectionData.isPublic || false
      });
      return { success: true, collection: response.data.collection };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Erreur lors de la création de la collection'
      };
    }
  },

  // Récupérer une collection par ID
  getCollectionById: async (collectionId) => {
    try {
      const response = await backendApiInstance.get(`/collections/${collectionId}`);
      return { success: true, collection: response.data.collection };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Erreur lors de la récupération de la collection'
      };
    }
  },

  // Mettre à jour une collection
  updateCollection: async (collectionId, updateData) => {
    try {
      const response = await backendApiInstance.put(`/collections/${collectionId}`, updateData);
      return { success: true, collection: response.data.collection };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Erreur lors de la mise à jour de la collection'
      };
    }
  },

  // Supprimer une collection
  deleteCollection: async (collectionId) => {
    try {
      await backendApiInstance.delete(`/collections/${collectionId}`);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Erreur lors de la suppression de la collection'
      };
    }
  },

  // Ajouter une carte à une collection
  addCardToCollection: async (collectionId, cardData) => {
    try {
      const response = await backendApiInstance.post(`/collections/${collectionId}/cards`, {
        card: cardData.cardId,
        quantity: cardData.quantity || 1,
        condition: cardData.condition || 'near_mint',
        language: cardData.language || 'fr',
        foil: cardData.foil || false,
        notes: cardData.notes || ''
      });
      return { success: true, collection: response.data.collection };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Erreur lors de l\'ajout de la carte'
      };
    }
  },

  // Retirer une carte d'une collection
  removeCardFromCollection: async (collectionId, cardItemId) => {
    try {
      await backendApiInstance.delete(`/collections/${collectionId}/cards/${cardItemId}`);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Erreur lors de la suppression de la carte'
      };
    }
  }
};

// ===== SERVICES DE STATISTIQUES =====

export const dashboardService = {
  // Récupérer les statistiques du tableau de bord
  getDashboardStats: async () => {
    try {
      const response = await backendApiInstance.get('/stats/dashboard');
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Erreur lors de la récupération des statistiques'
      };
    }
  },

  // Récupérer les données de croissance de la collection
  getCollectionGrowth: async (months = 12) => {
    try {
      const response = await backendApiInstance.get(`/stats/growth?months=${months}`);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Erreur lors de la récupération des données de croissance'
      };
    }
  },

  // Récupérer les données de comparaison entre utilisateurs
  getUserComparisons: async () => {
    try {
      const response = await backendApiInstance.get('/stats/comparisons');
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Erreur lors de la récupération des comparaisons'
      };
    }
  }
};

export default backendApiInstance;

// Export du service principal avec toutes les méthodes
export const backendApi = {
  // Authentification
  ...authService,
  
  // Collections
  getCollection: collectionService.getMyCollections,
  createCollection: collectionService.createCollection,
  updateCollection: collectionService.updateCollection,
  deleteCollection: collectionService.deleteCollection,
  addCardToCollection: collectionService.addCardToCollection,
  removeCardFromCollection: collectionService.removeCardFromCollection,
  
  // Dashboard et statistiques
  getDashboardStats: dashboardService.getDashboardStats,
  getCollectionGrowth: dashboardService.getCollectionGrowth,
  getUserComparisons: dashboardService.getUserComparisons
};
