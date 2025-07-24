import Deck from '../models/Deck.js';
import Card from '../models/Card.js';

// @desc    Créer un nouveau deck
// @route   POST /api/decks
// @access  Private
export const createDeck = async (req, res, next) => {
  try {
    const { name, description, format, isPublic, commander } = req.body;

    if (!name || name.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Le nom du deck est requis'
      });
    }

    if (!format) {
      return res.status(400).json({
        success: false,
        error: 'Le format du deck est requis'
      });
    }

    // Validation spécifique pour Commander
    if (format === 'commander' && !commander) {
      return res.status(400).json({
        success: false,
        error: 'Un commandant est requis pour le format Commander'
      });
    }

    if (format !== 'commander' && commander) {
      return res.status(400).json({
        success: false,
        error: 'Un commandant n\'est autorisé que pour le format Commander'
      });
    }

    const deckData = {
      name: name.trim(),
      description: description?.trim() || '',
      format,
      isPublic: isPublic || false,
      owner: req.user._id
    };

    if (commander) {
      deckData.commander = commander;
    }

    const deck = await Deck.create(deckData);
    await deck.populate('owner', 'nom prenom email');

    res.status(201).json({
      success: true,
      message: 'Deck créé avec succès',
      deck
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
    const decks = await Deck.find({ owner: req.user._id })
      .populate('owner', 'nom prenom email')
      .populate('cards.card')
      .populate('commander')
      .sort({ derniereModification: -1 });

    res.json({
      success: true,
      decks,
      total: decks.length
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
      .populate('owner', 'nom prenom email')
      .populate('cards.card')
      .populate('commander');

    if (!deck) {
      return res.status(404).json({
        success: false,
        error: 'Deck non trouvé'
      });
    }

    // Vérifier les permissions d'accès
    const isOwner = deck.owner._id.toString() === req.user._id.toString();
    
    if (!isOwner && !deck.isPublic) {
      return res.status(403).json({
        success: false,
        error: 'Accès non autorisé à ce deck'
      });
    }

    res.json({
      success: true,
      deck
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
    const { name, description, format, isPublic, commander } = req.body;
    
    const deck = await Deck.findById(req.params.id);

    if (!deck) {
      return res.status(404).json({
        success: false,
        error: 'Deck non trouvé'
      });
    }

    // Vérifier que l'utilisateur est propriétaire
    if (deck.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        error: 'Non autorisé à modifier ce deck'
      });
    }

    // Mettre à jour les champs
    if (name !== undefined) deck.name = name.trim();
    if (description !== undefined) deck.description = description.trim();
    if (format !== undefined) deck.format = format;
    if (isPublic !== undefined) deck.isPublic = isPublic;
    if (commander !== undefined) deck.commander = commander;

    // Validation spécifique pour Commander
    if (deck.format === 'commander' && !deck.commander) {
      return res.status(400).json({
        success: false,
        error: 'Un commandant est requis pour le format Commander'
      });
    }

    await deck.save();
    await deck.populate('owner', 'nom prenom email');
    await deck.populate('commander');

    res.json({
      success: true,
      message: 'Deck mis à jour avec succès',
      deck
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
    if (deck.owner.toString() !== req.user._id.toString()) {
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
    const { card: cardId, quantity, isSideboard, isCommander } = req.body;

    if (!cardId) {
      return res.status(400).json({
        success: false,
        error: 'L\'ID de la carte est requis'
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
    if (deck.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        error: 'Non autorisé à modifier ce deck'
      });
    }

    // Si c'est un commandant, utiliser la méthode dédiée
    if (isCommander) {
      await deck.setCommander(cardId);
    } else {
      // Vérifier si la carte existe déjà avec les mêmes caractéristiques
      const existingCardIndex = deck.cards.findIndex(item => 
        item.card.toString() === cardId &&
        item.isSideboard === (isSideboard || false)
      );

      if (existingCardIndex !== -1) {
        // Mettre à jour la quantité de la carte existante
        deck.cards[existingCardIndex].quantity += quantity || 1;
      } else {
        // Ajouter une nouvelle carte
        deck.cards.push({
          card: cardId,
          quantity: quantity || 1,
          isSideboard: isSideboard || false,
          isCommander: false
        });
      }

      await deck.save();
    }

    await deck.populate('cards.card');
    await deck.populate('commander');

    res.json({
      success: true,
      message: 'Carte ajoutée au deck avec succès',
      deck
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
    const { quantity, isSideboard } = req.body;
    
    const deck = await Deck.findById(req.params.id);

    if (!deck) {
      return res.status(404).json({
        success: false,
        error: 'Deck non trouvé'
      });
    }

    // Vérifier que l'utilisateur est propriétaire
    if (deck.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        error: 'Non autorisé à modifier ce deck'
      });
    }

    const cardItem = deck.cards.id(req.params.cardId);
    
    if (!cardItem) {
      return res.status(404).json({
        success: false,
        error: 'Carte non trouvée dans le deck'
      });
    }

    // Mettre à jour les propriétés de la carte
    if (quantity !== undefined) cardItem.quantity = quantity;
    if (isSideboard !== undefined) cardItem.isSideboard = isSideboard;

    // Si la quantité est 0, supprimer la carte
    if (quantity === 0) {
      deck.cards.pull(req.params.cardId);
    }

    await deck.save();
    await deck.populate('cards.card');

    res.json({
      success: true,
      message: 'Carte mise à jour avec succès',
      deck
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
    if (deck.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        error: 'Non autorisé à modifier ce deck'
      });
    }

    const cardItem = deck.cards.id(req.params.cardId);
    
    if (!cardItem) {
      return res.status(404).json({
        success: false,
        error: 'Carte non trouvée dans le deck'
      });
    }

    // Si c'est le commandant, le retirer aussi du champ commander
    if (cardItem.isCommander) {
      deck.commander = null;
    }

    deck.cards.pull(req.params.cardId);
    await deck.save();

    res.json({
      success: true,
      message: 'Carte supprimée du deck avec succès'
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
    const { q, format, page = 1, limit = 10, sortBy = 'derniereModification', sortOrder = 'desc' } = req.query;
    const skip = (page - 1) * limit;

    // Construire la requête de recherche pour les decks publics
    const searchQuery = { isPublic: true };

    // Filtrer par format
    if (format) {
      searchQuery.format = format;
    }

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

    const [decks, total] = await Promise.all([
      Deck.find(searchQuery)
        .populate('owner', 'nom prenom email')
        .populate('commander')
        .skip(skip)
        .limit(parseInt(limit))
        .sort(sortOptions),
      Deck.countDocuments(searchQuery)
    ]);

    res.json({
      success: true,
      decks,
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
