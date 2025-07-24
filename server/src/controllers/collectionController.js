import Collection from '../models/Collection.js';
import Card from '../models/Card.js';

// @desc    Créer une nouvelle collection
// @route   POST /api/collections
// @access  Private
export const createCollection = async (req, res, next) => {
  try {
    const { name, description, isPublic } = req.body;

    if (!name || name.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Le nom de la collection est requis'
      });
    }

    const collection = await Collection.create({
      name: name.trim(),
      description: description?.trim() || '',
      isPublic: isPublic || false,
      owner: req.user._id
    });

    await collection.populate('owner', 'nom prenom email');

    res.status(201).json({
      success: true,
      message: 'Collection créée avec succès',
      collection
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
    const collections = await Collection.find({ owner: req.user._id })
      .populate('owner', 'nom prenom email')
      .populate('cards.card')
      .sort({ derniereModification: -1 });

    res.json({
      success: true,
      collections,
      total: collections.length
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
      .populate('owner', 'nom prenom email')
      .populate('cards.card');

    if (!collection) {
      return res.status(404).json({
        success: false,
        error: 'Collection non trouvée'
      });
    }

    // Vérifier les permissions d'accès
    const isOwner = collection.owner._id.toString() === req.user._id.toString();
    
    if (!isOwner && !collection.isPublic) {
      return res.status(403).json({
        success: false,
        error: 'Accès non autorisé à cette collection'
      });
    }

    res.json({
      success: true,
      collection
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
    const { name, description, isPublic } = req.body;
    
    const collection = await Collection.findById(req.params.id);

    if (!collection) {
      return res.status(404).json({
        success: false,
        error: 'Collection non trouvée'
      });
    }

    // Vérifier que l'utilisateur est propriétaire
    if (collection.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        error: 'Non autorisé à modifier cette collection'
      });
    }

    // Mettre à jour les champs
    if (name !== undefined) collection.name = name.trim();
    if (description !== undefined) collection.description = description.trim();
    if (isPublic !== undefined) collection.isPublic = isPublic;

    await collection.save();
    await collection.populate('owner', 'nom prenom email');

    res.json({
      success: true,
      message: 'Collection mise à jour avec succès',
      collection
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
    if (collection.owner.toString() !== req.user._id.toString()) {
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
    const { card: cardId, quantity, condition, language, foil, notes } = req.body;

    if (!cardId) {
      return res.status(400).json({
        success: false,
        error: 'L\'ID de la carte est requis'
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
    if (collection.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        error: 'Non autorisé à modifier cette collection'
      });
    }

    // Vérifier si la carte existe déjà avec les mêmes caractéristiques
    const existingCardIndex = collection.cards.findIndex(item => 
      item.card.toString() === cardId &&
      item.condition === (condition || 'near_mint') &&
      item.language === (language || 'fr') &&
      item.foil === (foil || false)
    );

    if (existingCardIndex !== -1) {
      // Mettre à jour la quantité de la carte existante
      collection.cards[existingCardIndex].quantity += quantity || 1;
      if (notes) {
        collection.cards[existingCardIndex].notes = notes;
      }
    } else {
      // Ajouter une nouvelle carte
      collection.cards.push({
        card: cardId,
        quantity: quantity || 1,
        condition: condition || 'near_mint',
        language: language || 'fr',
        foil: foil || false,
        notes: notes || ''
      });
    }

    await collection.save();
    await collection.populate('cards.card');

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
    const { quantity, condition, language, foil, notes } = req.body;
    
    const collection = await Collection.findById(req.params.id);

    if (!collection) {
      return res.status(404).json({
        success: false,
        error: 'Collection non trouvée'
      });
    }

    // Vérifier que l'utilisateur est propriétaire
    if (collection.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        error: 'Non autorisé à modifier cette collection'
      });
    }

    const cardItem = collection.cards.id(req.params.cardId);
    
    if (!cardItem) {
      return res.status(404).json({
        success: false,
        error: 'Carte non trouvée dans la collection'
      });
    }

    // Mettre à jour les propriétés de la carte
    if (quantity !== undefined) cardItem.quantity = quantity;
    if (condition !== undefined) cardItem.condition = condition;
    if (language !== undefined) cardItem.language = language;
    if (foil !== undefined) cardItem.foil = foil;
    if (notes !== undefined) cardItem.notes = notes;

    // Si la quantité est 0, supprimer la carte
    if (quantity === 0) {
      collection.cards.pull(req.params.cardId);
    }

    await collection.save();
    await collection.populate('cards.card');

    res.json({
      success: true,
      message: 'Carte mise à jour avec succès',
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
    if (collection.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        error: 'Non autorisé à modifier cette collection'
      });
    }

    const cardItem = collection.cards.id(req.params.cardId);
    
    if (!cardItem) {
      return res.status(404).json({
        success: false,
        error: 'Carte non trouvée dans la collection'
      });
    }

    collection.cards.pull(req.params.cardId);
    await collection.save();

    res.json({
      success: true,
      message: 'Carte supprimée de la collection avec succès'
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
    const { q, page = 1, limit = 10, sortBy = 'derniereModification', sortOrder = 'desc' } = req.query;
    const skip = (page - 1) * limit;

    // Construire la requête de recherche pour les collections publiques
    const searchQuery = { isPublic: true };

    // Recherche textuelle
    if (q) {
      searchQuery.$or = [
        { name: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } }
      ];
    }

    // Construire le tri
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const [collections, total] = await Promise.all([
      Collection.find(searchQuery)
        .populate('owner', 'nom prenom email')
        .skip(skip)
        .limit(parseInt(limit))
        .sort(sortOptions),
      Collection.countDocuments(searchQuery)
    ]);

    res.json({
      success: true,
      collections,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      }
    });
  } catch (error) {
    next(error);
  }
};
