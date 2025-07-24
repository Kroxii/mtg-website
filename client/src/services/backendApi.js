import axios from 'axios';

// Configuration de l'API backend
const API_BASE_URL = 'http://localhost:5000/api';

// Instance Axios pour les appels API backend avec authentification
const backendApi = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000
});

// Intercepteur pour ajouter le token d'authentification automatiquement
backendApi.interceptors.request.use(
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
backendApi.interceptors.response.use(
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
      const response = await backendApi.post('/auth/login', { email, password });
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
      const response = await backendApi.post('/auth/register', userData);
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
      const response = await backendApi.get('/collections');
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
      const response = await backendApi.post('/collections', {
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
      const response = await backendApi.get(`/collections/${collectionId}`);
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
      const response = await backendApi.put(`/collections/${collectionId}`, updateData);
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
      await backendApi.delete(`/collections/${collectionId}`);
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
      const response = await backendApi.post(`/collections/${collectionId}/cards`, {
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
      await backendApi.delete(`/collections/${collectionId}/cards/${cardItemId}`);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Erreur lors de la suppression de la carte'
      };
    }
  }
};

// ===== SERVICES DE DECK =====

export const deckService = {
  // Récupérer tous les decks de l'utilisateur connecté
  getMyDecks: async () => {
    try {
      const response = await backendApi.get('/decks');
      return { success: true, decks: response.data.decks };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Erreur lors de la récupération des decks'
      };
    }
  },

  // Créer un nouveau deck
  createDeck: async (deckData) => {
    try {
      const response = await backendApi.post('/decks', {
        name: deckData.name,
        description: deckData.description || '',
        format: deckData.format,
        isPublic: deckData.isPublic || false,
        commander: deckData.commander || null
      });
      return { success: true, deck: response.data.deck };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Erreur lors de la création du deck'
      };
    }
  },

  // Récupérer un deck par ID
  getDeckById: async (deckId) => {
    try {
      const response = await backendApi.get(`/decks/${deckId}`);
      return { success: true, deck: response.data.deck };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Erreur lors de la récupération du deck'
      };
    }
  },

  // Mettre à jour un deck
  updateDeck: async (deckId, updateData) => {
    try {
      const response = await backendApi.put(`/decks/${deckId}`, updateData);
      return { success: true, deck: response.data.deck };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Erreur lors de la mise à jour du deck'
      };
    }
  },

  // Supprimer un deck
  deleteDeck: async (deckId) => {
    try {
      await backendApi.delete(`/decks/${deckId}`);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Erreur lors de la suppression du deck'
      };
    }
  },

  // Ajouter une carte à un deck
  addCardToDeck: async (deckId, cardData) => {
    try {
      const response = await backendApi.post(`/decks/${deckId}/cards`, {
        card: cardData.cardId,
        quantity: cardData.quantity || 1,
        isSideboard: cardData.isSideboard || false,
        isCommander: cardData.isCommander || false
      });
      return { success: true, deck: response.data.deck };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Erreur lors de l\'ajout de la carte au deck'
      };
    }
  },

  // Retirer une carte d'un deck
  removeCardFromDeck: async (deckId, cardItemId) => {
    try {
      await backendApi.delete(`/decks/${deckId}/cards/${cardItemId}`);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Erreur lors de la suppression de la carte du deck'
      };
    }
  }
};

export default backendApi;
