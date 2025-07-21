import express from 'express';
import Joi from 'joi';
import Collection from '../models/Collection.js';
import Card from '../models/Card.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Schémas de validation
const createCollectionSchema = Joi.object({
  nom: Joi.string().trim().min(1).max(100).required(),
  description: Joi.string().trim().max(500).optional(),
  visibilite: Joi.string().valid('public', 'amis', 'prive').default('prive'),
  tags: Joi.array().items(Joi.string().trim().max(30)).max(10).optional()
});

const updateCollectionSchema = Joi.object({
  nom: Joi.string().trim().min(1).max(100).optional(),
  description: Joi.string().trim().max(500).optional(),
  visibilite: Joi.string().valid('public', 'amis', 'prive').optional(),
  tags: Joi.array().items(Joi.string().trim().max(30)).max(10).optional()
}).min(1);

const addCardSchema = Joi.object({
  scryfallId: Joi.string().required(),
  quantite: Joi.number().integer().min(1).max(99).default(1),
  condition: Joi.string().valid('NM', 'LP', 'MP', 'HP', 'D').default('NM'),
  langue: Joi.string().length(2).default('en'),
  foil: Joi.boolean().default(false),
  notes: Joi.string().trim().max(200).optional()
});

const updateCardSchema = Joi.object({
  quantite: Joi.number().integer().min(0).max(99).optional(),
  condition: Joi.string().valid('NM', 'LP', 'MP', 'HP', 'D').optional(),
  langue: Joi.string().length(2).optional(),
  foil: Joi.boolean().optional(),
  notes: Joi.string().trim().max(200).allow('').optional()
}).min(1);

const searchCollectionsSchema = Joi.object({
  q: Joi.string().trim().min(1).max(100).optional(),
  tags: Joi.array().items(Joi.string().trim()).optional(),
  visibilite: Joi.string().valid('public', 'amis', 'prive').optional(),
  utilisateur: Joi.string().optional(),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(50).default(10),
  sortBy: Joi.string().valid('dateCreation', 'dateModification', 'nom').default('dateModification'),
  sortOrder: Joi.string().valid('asc', 'desc').default('desc')
});

// @desc    Créer une nouvelle collection
// @route   POST /api/collections
// @access  Private
export const createCollection = async (req, res, next) => {
  try {
    const { error, value } = createCollectionSchema.validate(req.body);
    
    if (error) {
      return res.status(400).json({
        success: false,
        error: error.details[0].message
      });
    }

    const collection = await Collection.create({
      ...value,
      utilisateur: req.user._id
    });

    res.status(201).json({
      success: true,
      message: 'Collection créée avec succès',
      collection: await collection.populate('utilisateur', 'nom prenom email')
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Récupérer toutes les collections de l'utilisateur
// @route   GET /api/collections
// @access  Private
export const getMyCollections = async (req, res, next) => {
  try {
    const collections = await Collection.find({ utilisateur: req.user._id })
      .populate('utilisateur', 'nom prenom email')
      .sort({ dateModification: -1 });

    // Calculer les statistiques pour chaque collection
    const collectionsWithStats = collections.map(collection => ({
      ...collection.toObject(),
      statistiques: {
        nombreCartes: collection.cartes.reduce((sum, carte) => sum + carte.quantite, 0),
        nombreCartesUniques: collection.cartes.length,
        valeurEstimee: collection.cartes.reduce((sum, carte) => {
          // Cette valeur devrait idéalement venir d'une API de prix
          return sum + (carte.quantite * 0); // Placeholder
        }, 0)
      }
    }));

    res.json({
      success: true,
      collections: collectionsWithStats,
      total: collections.length
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Rechercher des collections publiques
// @route   GET /api/collections/search
// @access  Private
export const searchCollections = async (req, res, next) => {
  try {
    const { error, value } = searchCollectionsSchema.validate(req.query);
    
    if (error) {
      return res.status(400).json({
        success: false,
        error: error.details[0].message
      });
    }

    const { q, tags, visibilite, utilisateur, page, limit, sortBy, sortOrder } = value;
    const skip = (page - 1) * limit;

    // Construire la requête de recherche
    const searchQuery = {};

    // Si on recherche les collections d'un utilisateur spécifique
    if (utilisateur) {
      searchQuery.utilisateur = utilisateur;
    } else {
      // Sinon, ne montrer que les collections publiques/amis (pas privées)
      searchQuery.visibilite = { $in: ['public', 'amis'] };
    }

    // Filtrer par visibilité si spécifié
    if (visibilite) {
      searchQuery.visibilite = visibilite;
    }

    // Recherche textuelle
    if (q) {
      searchQuery.$or = [
        { nom: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } }
      ];
    }

    // Filtrer par tags
    if (tags && tags.length > 0) {
      searchQuery.tags = { $in: tags };
    }

    // Construire le tri
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const [collections, total] = await Promise.all([
      Collection.find(searchQuery)
        .populate('utilisateur', 'nom prenom email preferences.visibiliteProfil')
        .skip(skip)
        .limit(limit)
        .sort(sortOptions),
      Collection.countDocuments(searchQuery)
    ]);

    // Filtrer les collections selon la visibilité du profil de l'utilisateur
    const filteredCollections = collections.filter(collection => {
      const userVisibility = collection.utilisateur.preferences?.visibiliteProfil || 'public';
      return userVisibility === 'public' || userVisibility === 'amis';
    });

    res.json({
      success: true,
      collections: filteredCollections.map(collection => ({
        ...collection.toObject(),
        statistiques: {
          nombreCartes: collection.cartes.reduce((sum, carte) => sum + carte.quantite, 0),
          nombreCartesUniques: collection.cartes.length
        }
      })),
      pagination: {
        page,
        limit,
        total: filteredCollections.length,
        totalPages: Math.ceil(filteredCollections.length / limit),
        hasNext: page < Math.ceil(filteredCollections.length / limit),
        hasPrev: page > 1
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Récupérer une collection par ID
// @route   GET /api/collections/:id
// @access  Private
export const getCollectionById = async (req, res, next) => {
  try {
    const collection = await Collection.findById(req.params.id)
      .populate('utilisateur', 'nom prenom email preferences.visibiliteProfil')
      .populate('cartes.carte');

    if (!collection) {
      return res.status(404).json({
        success: false,
        error: 'Collection non trouvée'
      });
    }

    // Vérifier les permissions d'accès
    const isOwner = collection.utilisateur._id.toString() === req.user._id.toString();
    const userVisibility = collection.utilisateur.preferences?.visibiliteProfil || 'public';
    
    if (!isOwner) {
      if (collection.visibilite === 'prive' || userVisibility === 'prive') {
        return res.status(403).json({
          success: false,
          error: 'Accès non autorisé à cette collection'
        });
      }
    }

    res.json({
      success: true,
      collection: {
        ...collection.toObject(),
        statistiques: {
          nombreCartes: collection.cartes.reduce((sum, carte) => sum + carte.quantite, 0),
          nombreCartesUniques: collection.cartes.length
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Mettre à jour une collection
// @route   PUT /api/collections/:id
// @access  Private
export const updateCollection = async (req, res, next) => {
  try {
    const { error, value } = updateCollectionSchema.validate(req.body);
    
    if (error) {
      return res.status(400).json({
        success: false,
        error: error.details[0].message
      });
    }

    const collection = await Collection.findById(req.params.id);

    if (!collection) {
      return res.status(404).json({
        success: false,
        error: 'Collection non trouvée'
      });
    }

    // Vérifier que l'utilisateur est propriétaire
    if (collection.utilisateur.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        error: 'Non autorisé à modifier cette collection'
      });
    }

    const updatedCollection = await Collection.findByIdAndUpdate(
      req.params.id,
      { ...value, dateModification: new Date() },
      { new: true, runValidators: true }
    ).populate('utilisateur', 'nom prenom email');

    res.json({
      success: true,
      message: 'Collection mise à jour avec succès',
      collection: updatedCollection
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Supprimer une collection
// @route   DELETE /api/collections/:id
// @access  Private
export const deleteCollection = async (req, res, next) => {
  try {
    const collection = await Collection.findById(req.params.id);

    if (!collection) {
      return res.status(404).json({
        success: false,
        error: 'Collection non trouvée'
      });
    }

    // Vérifier que l'utilisateur est propriétaire
    if (collection.utilisateur.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        error: 'Non autorisé à supprimer cette collection'
      });
    }

    await Collection.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Collection supprimée avec succès'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Ajouter une carte à une collection
// @route   POST /api/collections/:id/cards
// @access  Private
export const addCardToCollection = async (req, res, next) => {
  try {
    const { error, value } = addCardSchema.validate(req.body);
    
    if (error) {
      return res.status(400).json({
        success: false,
        error: error.details[0].message
      });
    }

    const collection = await Collection.findById(req.params.id);

    if (!collection) {
      return res.status(404).json({
        success: false,
        error: 'Collection non trouvée'
      });
    }

    // Vérifier que l'utilisateur est propriétaire
    if (collection.utilisateur.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        error: 'Non autorisé à modifier cette collection'
      });
    }

    const { scryfallId, quantite, condition, langue, foil, notes } = value;

    // Vérifier si la carte existe déjà dans la collection avec les mêmes caractéristiques
    const existingCardIndex = collection.cartes.findIndex(carte => 
      carte.scryfallId === scryfallId &&
      carte.condition === condition &&
      carte.langue === langue &&
      carte.foil === foil
    );

    if (existingCardIndex !== -1) {
      // Mettre à jour la quantité de la carte existante
      collection.cartes[existingCardIndex].quantite += quantite;
      if (notes) {
        collection.cartes[existingCardIndex].notes = notes;
      }
    } else {
      // Ajouter une nouvelle carte
      collection.cartes.push({
        scryfallId,
        quantite,
        condition,
        langue,
        foil,
        notes: notes || ''
      });
    }

    collection.dateModification = new Date();
    await collection.save();

    res.json({
      success: true,
      message: 'Carte ajoutée à la collection avec succès',
      collection
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Mettre à jour une carte dans une collection
// @route   PUT /api/collections/:id/cards/:cardId
// @access  Private
export const updateCardInCollection = async (req, res, next) => {
  try {
    const { error, value } = updateCardSchema.validate(req.body);
    
    if (error) {
      return res.status(400).json({
        success: false,
        error: error.details[0].message
      });
    }

    const collection = await Collection.findById(req.params.id);

    if (!collection) {
      return res.status(404).json({
        success: false,
        error: 'Collection non trouvée'
      });
    }

    // Vérifier que l'utilisateur est propriétaire
    if (collection.utilisateur.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        error: 'Non autorisé à modifier cette collection'
      });
    }

    const card = collection.cartes.id(req.params.cardId);
    
    if (!card) {
      return res.status(404).json({
        success: false,
        error: 'Carte non trouvée dans la collection'
      });
    }

    // Mettre à jour les propriétés de la carte
    Object.keys(value).forEach(key => {
      card[key] = value[key];
    });

    // Si la quantité est 0, supprimer la carte
    if (value.quantite === 0) {
      collection.cartes.pull(req.params.cardId);
    }

    collection.dateModification = new Date();
    await collection.save();

    res.json({
      success: true,
      message: value.quantite === 0 ? 'Carte supprimée de la collection' : 'Carte mise à jour avec succès',
      collection
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Supprimer une carte d'une collection
// @route   DELETE /api/collections/:id/cards/:cardId
// @access  Private
export const removeCardFromCollection = async (req, res, next) => {
  try {
    const collection = await Collection.findById(req.params.id);

    if (!collection) {
      return res.status(404).json({
        success: false,
        error: 'Collection non trouvée'
      });
    }

    // Vérifier que l'utilisateur est propriétaire
    if (collection.utilisateur.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        error: 'Non autorisé à modifier cette collection'
      });
    }

    const card = collection.cartes.id(req.params.cardId);
    
    if (!card) {
      return res.status(404).json({
        success: false,
        error: 'Carte non trouvée dans la collection'
      });
    }

    collection.cartes.pull(req.params.cardId);
    collection.dateModification = new Date();
    await collection.save();

    res.json({
      success: true,
      message: 'Carte supprimée de la collection avec succès',
      collection
    });
  } catch (error) {
    next(error);
  }
};

// Routes
router.post('/', authenticate, createCollection);
router.get('/', authenticate, getMyCollections);
router.get('/search', authenticate, searchCollections);
router.get('/:id', authenticate, getCollectionById);
router.put('/:id', authenticate, updateCollection);
router.delete('/:id', authenticate, deleteCollection);
router.post('/:id/cards', authenticate, addCardToCollection);
router.put('/:id/cards/:cardId', authenticate, updateCardInCollection);
router.delete('/:id/cards/:cardId', authenticate, removeCardFromCollection);

export default router;
