import axios from 'axios';

// Configuration par défaut pour les appels API français
const FRENCH_API_CONFIG = {
  lang: 'fr',
  include_multilingual: false
};

const SCRYFALL_API_BASE = 'https://api.scryfall.com';

// Instance Axios pour les appels qui n'ont pas besoin de paramètres de langue
export const scryfallApiGeneral = axios.create({
  baseURL: SCRYFALL_API_BASE,
  timeout: 10000
});

// Instance principale pour les cartes en français
export const scryfallApi = axios.create({
  baseURL: SCRYFALL_API_BASE,
  timeout: 10000,
  params: FRENCH_API_CONFIG // Paramètres par défaut pour le français
});

// Intercepteur pour gérer les erreurs
[scryfallApi, scryfallApiGeneral].forEach(instance => {
  instance.interceptors.response.use(
    (response) => response,
    (error) => {
      console.error('Erreur API Scryfall:', error);
      return Promise.reject(error);
    }
  );
});

// Fonctions utilitaires pour les API
export const apiUtils = {
  // Recherche de cartes avec gestion de la pagination
  searchCards: async (query, page = 1) => {
    try {
      // Ajouter un filtre pour exclure les cartes MTG Arena
      const filteredQuery = `${query} -is:digital -set:arena`;
      
      const response = await scryfallApi.get(`/cards/search`, {
        params: {
          q: filteredQuery,
          page: page
        }
      });
      return response.data;
    } catch (error) {
      throw new Error('Erreur lors de la recherche de cartes');
    }
  },

  // Recherche de toutes les impressions d'une carte
  getCardPrintings: async (cardName) => {
    try {
      const response = await scryfallApi.get(`/cards/search`, {
        params: {
          q: `!"${cardName}" -is:digital -set:arena`,
          unique: 'prints',
          order: 'released'
        }
      });
      return response.data.data || [];
    } catch (error) {
      throw new Error('Erreur lors de la récupération des impressions');
    }
  },

  // Récupération des extensions triées par date de sortie
  getSetsSorted: async () => {
    try {
      const response = await scryfallApiGeneral.get('/sets');
      const allSets = response.data.data;
      
      // Filtrer les extensions principales et exclure MTG Arena
      const expansionSets = allSets.filter(set => 
        set.set_type === 'expansion' && 
        set.code !== 'arena' && 
        set.digital === false
      );
      
      return expansionSets.sort((a, b) => {
        const dateA = new Date(a.released_at);
        const dateB = new Date(b.released_at);
        return dateB - dateA; // Plus récent en premier
      });
    } catch (error) {
      throw new Error('Erreur lors de la récupération des extensions');
    }
  },

  // Récupération des extensions
  getSets: async () => {
    try {
      const response = await scryfallApiGeneral.get('/sets');
      // Filtrer pour exclure les extensions MTG Arena
      const filteredSets = response.data.data.filter(set => 
        set.code !== 'arena' && 
        set.digital === false
      );
      return filteredSets;
    } catch (error) {
      throw new Error('Erreur lors de la récupération des extensions');
    }
  },

  // Récupération des cartes d'une extension
  getCardsFromSet: async (setCode) => {
    try {
      const response = await scryfallApi.get(`/cards/search`, {
        params: {
          q: `set:${setCode} -is:digital -set:arena`
        }
      });
      // Filtrer au niveau client pour plus de sécurité
      const filteredCards = response.data.data.filter(card => !apiUtils.isArenaCard(card));
      return filteredCards;
    } catch (error) {
      throw new Error('Erreur lors de la récupération des cartes de l\'extension');
    }
  },

    // Simulation d'API CardMarket (remplacez par la vraie API)
  getCardPrice: async (cardName, setName) => {
    // Simulation d'un prix aléatoire
    return new Promise((resolve) => {
      setTimeout(() => {
        const price = (Math.random() * 50 + 0.1).toFixed(2);
        resolve({ price, currency: 'EUR' });
      }, 500);
    });
  },

  // Fonction pour filtrer les cartes MTG Arena
  isArenaCard: (card) => {
    return card.digital === true ||
           card.set === 'arena' ||
           (card.set_name && card.set_name.toLowerCase().includes('arena')) ||
           (card.games && card.games.includes('arena') && card.games.length === 1);
  },

  // Fonction pour traiter les résultats de recherche et privilégier le français
  processSearchResults: (cards) => {
    return cards
      .filter(card => !apiUtils.isArenaCard(card)) // Filtrer les cartes Arena
      .map(card => {
        // Si la carte n'a pas de nom français, on essaie de le récupérer
        if (!card.printed_name && card.lang !== 'fr') {
          // Log pour debug - à retirer en production
          console.log(`Carte sans nom français: ${card.name} (${card.lang})`);
        }
        
        return {
          ...card,
          // Assurer que nous utilisons le bon nom d'affichage
          display_name: getCardDisplayName(card),
          display_type: getCardDisplayType(card)
        };
      });
  },

  // Recherche de cartes avec post-traitement
  searchCardsProcessed: async (query, page = 1) => {
    try {
      const result = await apiUtils.searchCards(query, page);
      return {
        ...result,
        data: apiUtils.processSearchResults(result.data || [])
      };
    } catch (error) {
      throw new Error('Erreur lors de la recherche de cartes');
    }
  },
};

// Fonction pour déterminer si une carte est double face
export const isDoubleFacedCard = (card) => {
  return card.layout === 'transform' || 
         card.layout === 'modal_dfc' || 
         card.layout === 'double_faced_token' ||
         card.layout === 'art_series' ||
         card.layout === 'reversible_card' ||
         (card.card_faces && card.card_faces.length > 1);
};

// Fonction pour obtenir l'image d'une face spécifique d'une carte
export const getCardFaceImage = (card, faceIndex = 0) => {
  if (isDoubleFacedCard(card) && card.card_faces && card.card_faces[faceIndex]) {
    const face = card.card_faces[faceIndex];
    return face.image_uris?.normal || 
           face.image_uris?.large || 
           face.image_uris?.small ||
           card.image_uris?.normal || 
           card.image_uris?.large;
  }
  
  return card.image_uris?.normal || card.image_uris?.large;
};

// Fonction pour obtenir le nom d'une face spécifique d'une carte
export const getCardFaceName = (card, faceIndex = 0) => {
  if (isDoubleFacedCard(card) && card.card_faces && card.card_faces[faceIndex]) {
    const face = card.card_faces[faceIndex];
    return face.printed_name || face.name_fr || face.name;
  }
  
  return getCardDisplayName(card);
};

// Fonction pour obtenir le type d'une face spécifique d'une carte
export const getCardFaceType = (card, faceIndex = 0) => {
  if (isDoubleFacedCard(card) && card.card_faces && card.card_faces[faceIndex]) {
    const face = card.card_faces[faceIndex];
    return face.printed_type_line || face.type_line_fr || face.type_line;
  }
  
  return getCardDisplayType(card);
};

// Fonction pour récupérer les versions foil d'une carte
export const getCardFoilVersions = async (cardName) => {
  try {
    const response = await scryfallApi.get(`/cards/search`, {
      params: {
        q: `!"${cardName}" (is:foil OR is:nonfoil)`,
        unique: 'prints',
        order: 'released'
      }
    });
    return response.data.data || [];
  } catch (error) {
    throw new Error('Erreur lors de la récupération des versions foil');
  }
};

// Fonction pour vérifier si une carte a une version foil
export const hasCardFoilVersion = (card) => {
  return card.foil === true || card.nonfoil === false;
};

// Fonction pour obtenir l'URL d'une carte sur CardMarket
export const getCardMarketUrl = (card) => {
  const cardName = encodeURIComponent(card.printed_name || card.name);
  const setName = encodeURIComponent(card.set_name);
  return `https://www.cardmarket.com/en/Magic/Products/Singles/${setName}/${cardName}`;
};

// Fonction pour formater les dates d'extension
export const formatSetDate = (dateString) => {
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = date.toLocaleDateString('fr-FR', { month: 'long' });
  return `${month} ${year}`;
};

// Fonction pour obtenir le type d'extension en français
export const getSetTypeFrench = (setType) => {
  const types = {
    'expansion': 'Extension',
    'core': 'Édition de base',
    'masters': 'Masters',
    'draft_innovation': 'Innovation de draft',
    'funny': 'Humoristique',
    'starter': 'Starter',
    'commander': 'Commander',
    'planechase': 'Planechase',
    'archenemy': 'Archenemy',
    'vanguard': 'Vanguard',
    'from_the_vault': 'From the Vault',
    'spellbook': 'Spellbook',
    'premium_deck': 'Premium Deck',
    'duel_deck': 'Duel Deck',
    'treasure_chest': 'Treasure Chest',
    'memorabilia': 'Memorabilia',
    'token': 'Jeton',
    'box': 'Boîte',
    'promo': 'Promo'
  };
  return types[setType] || setType;
};

// Fonction pour obtenir le nom de carte en français
export const getCardDisplayName = (card) => {
  // Priorité au nom français imprimé, puis au nom français, puis au nom anglais
  return card.printed_name || card.name_fr || card.name;
};

// Fonction pour obtenir le type de carte en français
export const getCardDisplayType = (card) => {
  // Priorité au type français imprimé, puis au type français, puis au type anglais
  return card.printed_type_line || card.type_line_fr || card.type_line;
};

// Fonction pour valider qu'une carte a un nom français
export const hasCardFrenchName = (card) => {
  return card.printed_name || card.name_fr || card.lang === 'fr';
};

// Fonction pour filtrer les cartes ayant un nom français
export const filterCardsWithFrenchNames = (cards) => {
  return cards.filter(card => hasCardFrenchName(card));
};
