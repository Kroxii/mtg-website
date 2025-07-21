import express from 'express';
import Joi from 'joi';
import Deck from '../models/Deck.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Schémas de validation
const createDeckSchema = Joi.object({
  nom: Joi.string().trim().min(1).max(100).required(),
  description: Joi.string().trim().max(500).optional(),
  format: Joi.string().valid(
    'Standard', 'Modern', 'Legacy', 'Vintage', 'Pioneer', 
    'Historic', 'Commander', 'Brawl', 'Pauper', 'Casual'
  ).required(),
  visibilite: Joi.string().valid('public', 'amis', 'prive').default('prive'),
  tags: Joi.array().items(Joi.string().trim().max(30)).max(10).optional(),
  commandant: Joi.object({
    scryfallId: Joi.string().required(),
    nom: Joi.string().required()
  }).optional()
});

const updateDeckSchema = Joi.object({
  nom: Joi.string().trim().min(1).max(100).optional(),
  description: Joi.string().trim().max(500).optional(),
  format: Joi.string().valid(
    'Standard', 'Modern', 'Legacy', 'Vintage', 'Pioneer', 
    'Historic', 'Commander', 'Brawl', 'Pauper', 'Casual'
  ).optional(),
  visibilite: Joi.string().valid('public', 'amis', 'prive').optional(),
  tags: Joi.array().items(Joi.string().trim().max(30)).max(10).optional(),
  commandant: Joi.object({
    scryfallId: Joi.string().required(),
    nom: Joi.string().required()
  }).optional().allow(null)
}).min(1);

const addCardToDeckSchema = Joi.object({
  scryfallId: Joi.string().required(),
  nom: Joi.string().required(),
  quantite: Joi.number().integer().min(1).max(99).default(1),
  category: Joi.string().valid('main', 'sideboard', 'maybeboard').default('main'),
  notes: Joi.string().trim().max(200).optional()
});

const updateCardInDeckSchema = Joi.object({
  quantite: Joi.number().integer().min(0).max(99).optional(),
  category: Joi.string().valid('main', 'sideboard', 'maybeboard').optional(),
  notes: Joi.string().trim().max(200).allow('').optional()
}).min(1);

const searchDecksSchema = Joi.object({
  q: Joi.string().trim().min(1).max(100).optional(),
  format: Joi.string().valid(
    'Standard', 'Modern', 'Legacy', 'Vintage', 'Pioneer', 
    'Historic', 'Commander', 'Brawl', 'Pauper', 'Casual'
  ).optional(),
  tags: Joi.array().items(Joi.string().trim()).optional(),
  visibilite: Joi.string().valid('public', 'amis', 'prive').optional(),
  utilisateur: Joi.string().optional(),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(50).default(10),
  sortBy: Joi.string().valid('dateCreation', 'dateModification', 'nom').default('dateModification'),
  sortOrder: Joi.string().valid('asc', 'desc').default('desc')
});

// @desc    Créer un nouveau deck
// @route   POST /api/decks
// @access  Private
export const createDeck = async (req, res, next) => {
  try {
    const { error, value } = createDeckSchema.validate(req.body);
    
    if (error) {
      return res.status(400).json({
        success: false,
        error: error.details[0].message
      });
    }

    // Validation spécifique pour Commander
    if (value.format === 'Commander' && !value.commandant) {
      return res.status(400).json({
        success: false,
        error: 'Un commandant est requis pour le format Commander'
      });
    }

    if (value.format !== 'Commander' && value.commandant) {
      return res.status(400).json({
        success: false,
        error: 'Un commandant n\'est autorisé que pour le format Commander'
      });
    }

    const deck = await Deck.create({
      ...value,
      utilisateur: req.user._id
    });

    res.status(201).json({
      success: true,
      message: 'Deck créé avec succès',
      deck: await deck.populate('utilisateur', 'nom prenom email')
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Récupérer tous les decks de l'utilisateur
// @route   GET /api/decks
// @access  Private
export const getMyDecks = async (req, res, next) => {
  try {
    const decks = await Deck.find({ utilisateur: req.user._id })
      .populate('utilisateur', 'nom prenom email')
      .sort({ dateModification: -1 });

    // Calculer les statistiques pour chaque deck
    const decksWithStats = decks.map(deck => ({
      ...deck.toObject(),
      statistiques: deck.getStatistics()
    }));

    res.json({
      success: true,
      decks: decksWithStats,
      total: decks.length
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Rechercher des decks publics
// @route   GET /api/decks/search
// @access  Private
export const searchDecks = async (req, res, next) => {
  try {
    const { error, value } = searchDecksSchema.validate(req.query);
    
    if (error) {
      return res.status(400).json({
        success: false,
        error: error.details[0].message
      });
    }

    const { q, format, tags, visibilite, utilisateur, page, limit, sortBy, sortOrder } = value;
    const skip = (page - 1) * limit;

    // Construire la requête de recherche
    const searchQuery = {};

    // Si on recherche les decks d'un utilisateur spécifique
    if (utilisateur) {
      searchQuery.utilisateur = utilisateur;
    } else {
      // Sinon, ne montrer que les decks publics/amis (pas privés)
      searchQuery.visibilite = { $in: ['public', 'amis'] };
    }

    // Filtrer par visibilité si spécifié
    if (visibilite) {
      searchQuery.visibilite = visibilite;
    }

    // Filtrer par format
    if (format) {
      searchQuery.format = format;
    }

    // Recherche textuelle
    if (q) {
      searchQuery.$or = [
        { nom: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } },
        { 'commandant.nom': { $regex: q, $options: 'i' } }
      ];
    }

    // Filtrer par tags
    if (tags && tags.length > 0) {
      searchQuery.tags = { $in: tags };
    }

    // Construire le tri
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const [decks, total] = await Promise.all([
      Deck.find(searchQuery)
        .populate('utilisateur', 'nom prenom email preferences.visibiliteProfil')
        .skip(skip)
        .limit(limit)
        .sort(sortOptions),
      Deck.countDocuments(searchQuery)
    ]);

    // Filtrer les decks selon la visibilité du profil de l'utilisateur
    const filteredDecks = decks.filter(deck => {
      const userVisibility = deck.utilisateur.preferences?.visibiliteProfil || 'public';
      return userVisibility === 'public' || userVisibility === 'amis';
    });

    res.json({
      success: true,
      decks: filteredDecks.map(deck => ({
        ...deck.toObject(),
        statistiques: deck.getStatistics()
      })),
      pagination: {
        page,
        limit,
        total: filteredDecks.length,
        totalPages: Math.ceil(filteredDecks.length / limit),
        hasNext: page < Math.ceil(filteredDecks.length / limit),
        hasPrev: page > 1
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Récupérer un deck par ID
// @route   GET /api/decks/:id
// @access  Private
export const getDeckById = async (req, res, next) => {
  try {
    const deck = await Deck.findById(req.params.id)
      .populate('utilisateur', 'nom prenom email preferences.visibiliteProfil');

    if (!deck) {
      return res.status(404).json({
        success: false,
        error: 'Deck non trouvé'
      });
    }

    // Vérifier les permissions d'accès
    const isOwner = deck.utilisateur._id.toString() === req.user._id.toString();
    const userVisibility = deck.utilisateur.preferences?.visibiliteProfil || 'public';
    
    if (!isOwner) {
      if (deck.visibilite === 'prive' || userVisibility === 'prive') {
        return res.status(403).json({
          success: false,
          error: 'Accès non autorisé à ce deck'
        });
      }
    }

    res.json({
      success: true,
      deck: {
        ...deck.toObject(),
        statistiques: deck.getStatistics()
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Mettre à jour un deck
// @route   PUT /api/decks/:id
// @access  Private
export const updateDeck = async (req, res, next) => {
  try {
    const { error, value } = updateDeckSchema.validate(req.body);
    
    if (error) {
      return res.status(400).json({
        success: false,
        error: error.details[0].message
      });
    }

    const deck = await Deck.findById(req.params.id);

    if (!deck) {
      return res.status(404).json({
        success: false,
        error: 'Deck non trouvé'
      });
    }

    // Vérifier que l'utilisateur est propriétaire
    if (deck.utilisateur.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        error: 'Non autorisé à modifier ce deck'
      });
    }

    // Validation spécifique pour Commander
    if (value.format === 'Commander' && !value.commandant && !deck.commandant) {
      return res.status(400).json({
        success: false,
        error: 'Un commandant est requis pour le format Commander'
      });
    }

    if (value.format && value.format !== 'Commander' && (value.commandant || deck.commandant)) {
      return res.status(400).json({
        success: false,
        error: 'Un commandant n\'est autorisé que pour le format Commander'
      });
    }

    const updatedDeck = await Deck.findByIdAndUpdate(
      req.params.id,
      { ...value, dateModification: new Date() },
      { new: true, runValidators: true }
    ).populate('utilisateur', 'nom prenom email');

    res.json({
      success: true,
      message: 'Deck mis à jour avec succès',
      deck: updatedDeck
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Supprimer un deck
// @route   DELETE /api/decks/:id
// @access  Private
export const deleteDeck = async (req, res, next) => {
  try {
    const deck = await Deck.findById(req.params.id);

    if (!deck) {
      return res.status(404).json({
        success: false,
        error: 'Deck non trouvé'
      });
    }

    // Vérifier que l'utilisateur est propriétaire
    if (deck.utilisateur.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        error: 'Non autorisé à supprimer ce deck'
      });
    }

    await Deck.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Deck supprimé avec succès'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Ajouter une carte à un deck
// @route   POST /api/decks/:id/cards
// @access  Private
export const addCardToDeck = async (req, res, next) => {
  try {
    const { error, value } = addCardToDeckSchema.validate(req.body);
    
    if (error) {
      return res.status(400).json({
        success: false,
        error: error.details[0].message
      });
    }

    const deck = await Deck.findById(req.params.id);

    if (!deck) {
      return res.status(404).json({
        success: false,
        error: 'Deck non trouvé'
      });
    }

    // Vérifier que l'utilisateur est propriétaire
    if (deck.utilisateur.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        error: 'Non autorisé à modifier ce deck'
      });
    }

    const { scryfallId, nom, quantite, category, notes } = value;

    // Vérifier si la carte existe déjà dans la même catégorie
    const existingCardIndex = deck.cartes.findIndex(carte => 
      carte.scryfallId === scryfallId && carte.category === category
    );

    if (existingCardIndex !== -1) {
      // Mettre à jour la quantité de la carte existante
      deck.cartes[existingCardIndex].quantite += quantite;
      if (notes) {
        deck.cartes[existingCardIndex].notes = notes;
      }
    } else {
      // Ajouter une nouvelle carte
      deck.cartes.push({
        scryfallId,
        nom,
        quantite,
        category,
        notes: notes || ''
      });
    }

    deck.dateModification = new Date();
    await deck.save();

    // Valider le deck après l'ajout
    const validation = deck.validateDeck();
    
    res.json({
      success: true,
      message: 'Carte ajoutée au deck avec succès',
      deck,
      validation
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Mettre à jour une carte dans un deck
// @route   PUT /api/decks/:id/cards/:cardId
// @access  Private
export const updateCardInDeck = async (req, res, next) => {
  try {
    const { error, value } = updateCardInDeckSchema.validate(req.body);
    
    if (error) {
      return res.status(400).json({
        success: false,
        error: error.details[0].message
      });
    }

    const deck = await Deck.findById(req.params.id);

    if (!deck) {
      return res.status(404).json({
        success: false,
        error: 'Deck non trouvé'
      });
    }

    // Vérifier que l'utilisateur est propriétaire
    if (deck.utilisateur.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        error: 'Non autorisé à modifier ce deck'
      });
    }

    const card = deck.cartes.id(req.params.cardId);
    
    if (!card) {
      return res.status(404).json({
        success: false,
        error: 'Carte non trouvée dans le deck'
      });
    }

    // Mettre à jour les propriétés de la carte
    Object.keys(value).forEach(key => {
      card[key] = value[key];
    });

    // Si la quantité est 0, supprimer la carte
    if (value.quantite === 0) {
      deck.cartes.pull(req.params.cardId);
    }

    deck.dateModification = new Date();
    await deck.save();

    // Valider le deck après la modification
    const validation = deck.validateDeck();

    res.json({
      success: true,
      message: value.quantite === 0 ? 'Carte supprimée du deck' : 'Carte mise à jour avec succès',
      deck,
      validation
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Supprimer une carte d'un deck
// @route   DELETE /api/decks/:id/cards/:cardId
// @access  Private
export const removeCardFromDeck = async (req, res, next) => {
  try {
    const deck = await Deck.findById(req.params.id);

    if (!deck) {
      return res.status(404).json({
        success: false,
        error: 'Deck non trouvé'
      });
    }

    // Vérifier que l'utilisateur est propriétaire
    if (deck.utilisateur.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        error: 'Non autorisé à modifier ce deck'
      });
    }

    const card = deck.cartes.id(req.params.cardId);
    
    if (!card) {
      return res.status(404).json({
        success: false,
        error: 'Carte non trouvée dans le deck'
      });
    }

    deck.cartes.pull(req.params.cardId);
    deck.dateModification = new Date();
    await deck.save();

    // Valider le deck après la suppression
    const validation = deck.validateDeck();

    res.json({
      success: true,
      message: 'Carte supprimée du deck avec succès',
      deck,
      validation
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Cloner un deck
// @route   POST /api/decks/:id/clone
// @access  Private
export const cloneDeck = async (req, res, next) => {
  try {
    const originalDeck = await Deck.findById(req.params.id);

    if (!originalDeck) {
      return res.status(404).json({
        success: false,
        error: 'Deck non trouvé'
      });
    }

    // Vérifier les permissions d'accès
    const isOwner = originalDeck.utilisateur.toString() === req.user._id.toString();
    
    if (!isOwner && originalDeck.visibilite === 'prive') {
      return res.status(403).json({
        success: false,
        error: 'Accès non autorisé à ce deck'
      });
    }

    // Créer une copie du deck
    const clonedDeck = await Deck.create({
      nom: `${originalDeck.nom} (Copie)`,
      description: originalDeck.description,
      format: originalDeck.format,
      visibilite: 'prive', // Toujours privé par défaut
      tags: [...originalDeck.tags],
      commandant: originalDeck.commandant ? { ...originalDeck.commandant } : null,
      cartes: originalDeck.cartes.map(carte => ({
        scryfallId: carte.scryfallId,
        nom: carte.nom,
        quantite: carte.quantite,
        category: carte.category,
        notes: carte.notes
      })),
      utilisateur: req.user._id
    });

    res.status(201).json({
      success: true,
      message: 'Deck cloné avec succès',
      deck: clonedDeck
    });
  } catch (error) {
    next(error);
  }
};

// Routes
router.post('/', authenticate, createDeck);
router.get('/', authenticate, getMyDecks);
router.get('/search', authenticate, searchDecks);
router.get('/:id', authenticate, getDeckById);
router.put('/:id', authenticate, updateDeck);
router.delete('/:id', authenticate, deleteDeck);
router.post('/:id/cards', authenticate, addCardToDeck);
router.put('/:id/cards/:cardId', authenticate, updateCardInDeck);
router.delete('/:id/cards/:cardId', authenticate, removeCardFromDeck);
router.post('/:id/clone', authenticate, cloneDeck);

export default router;
