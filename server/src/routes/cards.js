import express from 'express';
import Joi from 'joi';
import Card from '../models/Card.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Schémas de validation
const searchCardsSchema = Joi.object({
  q: Joi.string().trim().min(1).required(),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(175).default(25), // Scryfall limit
  order: Joi.string().valid('name', 'released', 'set', 'rarity', 'color', 'usd', 'tix', 'eur', 'cmc', 'power', 'toughness', 'edhrec', 'penny', 'artist', 'review').default('name'),
  dir: Joi.string().valid('auto', 'asc', 'desc').default('auto'),
  unique: Joi.string().valid('cards', 'art', 'prints').default('cards'),
  include_extras: Joi.boolean().default(false),
  include_multilingual: Joi.boolean().default(false),
  include_variations: Joi.boolean().default(false)
});

const getCardsBySetSchema = Joi.object({
  set: Joi.string().required(),
  page: Joi.number().integer().min(1).default(1)
});

// URL de base de l'API Scryfall
const SCRYFALL_API_BASE = 'https://api.scryfall.com';

// Cache simple en mémoire pour les requêtes fréquentes
const cache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// Fonction utilitaire pour faire des requêtes à Scryfall
const scryfallRequest = async (endpoint, params = {}) => {
  const url = new URL(`${SCRYFALL_API_BASE}${endpoint}`);
  Object.keys(params).forEach(key => {
    if (params[key] !== undefined && params[key] !== null) {
      url.searchParams.append(key, params[key]);
    }
  });

  const cacheKey = url.toString();
  const cached = cache.get(cacheKey);
  
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }

  const response = await fetch(url);
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.details || 'Erreur API Scryfall');
  }

  const data = await response.json();
  
  // Mettre en cache
  cache.set(cacheKey, {
    data,
    timestamp: Date.now()
  });

  return data;
};

// Fonction pour nettoyer le cache
const cleanCache = () => {
  const now = Date.now();
  for (const [key, value] of cache.entries()) {
    if (now - value.timestamp > CACHE_TTL) {
      cache.delete(key);
    }
  }
};

// Nettoyer le cache toutes les 10 minutes
setInterval(cleanCache, 10 * 60 * 1000);

// @desc    Rechercher des cartes
// @route   GET /api/cards/search
// @access  Private
export const searchCards = async (req, res, next) => {
  try {
    const { error, value } = searchCardsSchema.validate(req.query);
    
    if (error) {
      return res.status(400).json({
        success: false,
        error: error.details[0].message
      });
    }

    const { q, page, limit, order, dir, unique, include_extras, include_multilingual, include_variations } = value;

    const data = await scryfallRequest('/cards/search', {
      q,
      page,
      order,
      dir,
      unique,
      include_extras,
      include_multilingual,
      include_variations
    });

    res.json({
      success: true,
      cards: data.data,
      pagination: {
        page: page,
        limit: limit,
        total: data.total_cards || 0,
        totalPages: Math.ceil((data.total_cards || 0) / limit),
        hasNext: data.has_more || false,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message || 'Erreur lors de la recherche de cartes'
    });
  }
};

// @desc    Récupérer une carte par son ID Scryfall
// @route   GET /api/cards/:id
// @access  Private
export const getCardById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const card = await scryfallRequest(`/cards/${id}`);

    res.json({
      success: true,
      card
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      error: error.message || 'Carte non trouvée'
    });
  }
};

// @desc    Récupérer une carte par nom exact
// @route   GET /api/cards/named
// @access  Private
export const getCardByName = async (req, res, next) => {
  try {
    const { exact, fuzzy, set } = req.query;

    if (!exact && !fuzzy) {
      return res.status(400).json({
        success: false,
        error: 'Paramètre "exact" ou "fuzzy" requis'
      });
    }

    const params = {};
    if (exact) params.exact = exact;
    if (fuzzy) params.fuzzy = fuzzy;
    if (set) params.set = set;

    const card = await scryfallRequest('/cards/named', params);

    res.json({
      success: true,
      card
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      error: error.message || 'Carte non trouvée'
    });
  }
};

// @desc    Récupérer des cartes aléatoires
// @route   GET /api/cards/random
// @access  Private
export const getRandomCards = async (req, res, next) => {
  try {
    const { q } = req.query;

    const params = {};
    if (q) params.q = q;

    const card = await scryfallRequest('/cards/random', params);

    res.json({
      success: true,
      card
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message || 'Erreur lors de la récupération d\'une carte aléatoire'
    });
  }
};

// @desc    Récupérer l'autocomplétion pour les noms de cartes
// @route   GET /api/cards/autocomplete
// @access  Private
export const getAutocomplete = async (req, res, next) => {
  try {
    const { q, include_extras } = req.query;

    if (!q || q.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Paramètre "q" requis pour l\'autocomplétion'
      });
    }

    const params = { q };
    if (include_extras) params.include_extras = include_extras;

    const data = await scryfallRequest('/cards/autocomplete', params);

    res.json({
      success: true,
      suggestions: data.data || []
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message || 'Erreur lors de l\'autocomplétion'
    });
  }
};

// @desc    Récupérer toutes les extensions
// @route   GET /api/cards/sets
// @access  Private
export const getSets = async (req, res, next) => {
  try {
    const data = await scryfallRequest('/sets');

    res.json({
      success: true,
      sets: data.data || []
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message || 'Erreur lors de la récupération des extensions'
    });
  }
};

// @desc    Récupérer une extension par son code
// @route   GET /api/cards/sets/:code
// @access  Private
export const getSetByCode = async (req, res, next) => {
  try {
    const { code } = req.params;

    const set = await scryfallRequest(`/sets/${code}`);

    res.json({
      success: true,
      set
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      error: error.message || 'Extension non trouvée'
    });
  }
};

// @desc    Récupérer les cartes d'une extension
// @route   GET /api/cards/sets/:code/cards
// @access  Private
export const getCardsBySet = async (req, res, next) => {
  try {
    const { error, value } = getCardsBySetSchema.validate({
      set: req.params.code,
      ...req.query
    });
    
    if (error) {
      return res.status(400).json({
        success: false,
        error: error.details[0].message
      });
    }

    const { set, page } = value;

    const data = await scryfallRequest(`/cards/search`, {
      q: `set:${set}`,
      page,
      order: 'set'
    });

    res.json({
      success: true,
      cards: data.data || [],
      pagination: {
        page: page,
        total: data.total_cards || 0,
        hasNext: data.has_more || false,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message || 'Erreur lors de la récupération des cartes de l\'extension'
    });
  }
};

// @desc    Récupérer les symboles de mana
// @route   GET /api/cards/symbology
// @access  Private
export const getSymbology = async (req, res, next) => {
  try {
    const data = await scryfallRequest('/symbology');

    res.json({
      success: true,
      symbols: data.data || []
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message || 'Erreur lors de la récupération de la symbologie'
    });
  }
};

// @desc    Analyser le coût de mana
// @route   GET /api/cards/symbology/parse-mana
// @access  Private
export const parseMana = async (req, res, next) => {
  try {
    const { cost } = req.query;

    if (!cost) {
      return res.status(400).json({
        success: false,
        error: 'Paramètre "cost" requis'
      });
    }

    const data = await scryfallRequest('/symbology/parse-mana', { cost });

    res.json({
      success: true,
      parsed: data
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message || 'Erreur lors de l\'analyse du coût de mana'
    });
  }
};

// @desc    Récupérer les formats de jeu
// @route   GET /api/cards/formats
// @access  Private
export const getFormats = async (req, res, next) => {
  try {
    // Les formats sont relativement statiques, on peut les définir ici
    const formats = {
      standard: 'Standard',
      modern: 'Modern',
      legacy: 'Legacy',
      vintage: 'Vintage',
      pioneer: 'Pioneer',
      historic: 'Historic',
      commander: 'Commander',
      brawl: 'Brawl',
      pauper: 'Pauper',
      penny: 'Penny Dreadful'
    };

    res.json({
      success: true,
      formats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message || 'Erreur lors de la récupération des formats'
    });
  }
};

// Routes
router.get('/search', authenticate, searchCards);
router.get('/random', authenticate, getRandomCards);
router.get('/autocomplete', authenticate, getAutocomplete);
router.get('/named', authenticate, getCardByName);
router.get('/sets', authenticate, getSets);
router.get('/sets/:code', authenticate, getSetByCode);
router.get('/sets/:code/cards', authenticate, getCardsBySet);
router.get('/symbology', authenticate, getSymbology);
router.get('/symbology/parse-mana', authenticate, parseMana);
router.get('/formats', authenticate, getFormats);
router.get('/:id', authenticate, getCardById);

export default router;
