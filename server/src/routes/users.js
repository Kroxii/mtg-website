import express from 'express';
import Joi from 'joi';
import User from '../models/User.js';
import Collection from '../models/Collection.js';
import Deck from '../models/Deck.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Schémas de validation
const updateProfileSchema = Joi.object({
  nom: Joi.string().trim().max(50).optional(),
  prenom: Joi.string().trim().max(50).optional(),
  email: Joi.string().email().optional(),
  dateNaissance: Joi.date().optional(),
  preferences: Joi.object({
    theme: Joi.string().valid('dark', 'light'),
    langue: Joi.string().valid('fr', 'en'),
    notifications: Joi.boolean(),
    visibiliteProfil: Joi.string().valid('public', 'amis', 'prive')
  }).optional()
}).min(1); // Au moins un champ requis

const searchUsersSchema = Joi.object({
  q: Joi.string().trim().min(2).max(50).optional(),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(50).default(10)
});

// @desc    Récupérer le profil de l'utilisateur connecté
// @route   GET /api/users/profile
// @access  Private
export const getProfile = async (req, res, next) => {
  try {
    const user = req.user;
    
    // Récupérer les statistiques
    const collectionsCount = await Collection.countDocuments({ utilisateur: user._id });
    const decksCount = await Deck.countDocuments({ utilisateur: user._id });
    
    // Récupérer le nombre total de cartes dans les collections
    const collections = await Collection.find({ utilisateur: user._id });
    const totalCards = collections.reduce((total, collection) => {
      return total + collection.cartes.reduce((sum, carte) => sum + carte.quantite, 0);
    }, 0);

    res.json({
      success: true,
      user: {
        ...user.toSafeObject(),
        statistiques: {
          nombreCollections: collectionsCount,
          nombreDecks: decksCount,
          nombreCartesTotal: totalCards
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Mettre à jour le profil de l'utilisateur
// @route   PUT /api/users/profile
// @access  Private
export const updateProfile = async (req, res, next) => {
  try {
    const { error, value } = updateProfileSchema.validate(req.body);
    
    if (error) {
      return res.status(400).json({
        success: false,
        error: error.details[0].message
      });
    }

    const { nom, prenom, email, dateNaissance, preferences } = value;

    // Si l'email est modifié, vérifier qu'il n'est pas déjà utilisé
    if (email && email !== req.user.email) {
      const existingUser = await User.findByEmail(email);
      if (existingUser && existingUser._id.toString() !== req.user._id.toString()) {
        return res.status(400).json({
          success: false,
          error: 'Cette adresse email est déjà utilisée'
        });
      }
    }

    // Construire l'objet de mise à jour
    const updateData = {};
    if (nom !== undefined) updateData.nom = nom;
    if (prenom !== undefined) updateData.prenom = prenom;
    if (email !== undefined) updateData.email = email;
    if (dateNaissance !== undefined) updateData.dateNaissance = dateNaissance;
    if (preferences !== undefined) {
      updateData.preferences = { ...req.user.preferences, ...preferences };
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      updateData,
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: 'Profil mis à jour avec succès',
      user: updatedUser.toSafeObject()
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Récupérer les utilisateurs publics (recherche)
// @route   GET /api/users/search
// @access  Private
export const searchUsers = async (req, res, next) => {
  try {
    const { error, value } = searchUsersSchema.validate(req.query);
    
    if (error) {
      return res.status(400).json({
        success: false,
        error: error.details[0].message
      });
    }

    const { q, page, limit } = value;
    const skip = (page - 1) * limit;

    // Construire la requête de recherche
    const searchQuery = {
      statut: 'actif',
      'preferences.visibiliteProfil': { $in: ['public', 'amis'] },
      _id: { $ne: req.user._id } // Exclure l'utilisateur actuel
    };

    if (q) {
      searchQuery.$or = [
        { nom: { $regex: q, $options: 'i' } },
        { prenom: { $regex: q, $options: 'i' } },
        { email: { $regex: q, $options: 'i' } }
      ];
    }

    const [users, total] = await Promise.all([
      User.find(searchQuery)
        .select('nom prenom email dateCreation preferences.visibiliteProfil')
        .skip(skip)
        .limit(limit)
        .sort({ nom: 1, prenom: 1 }),
      User.countDocuments(searchQuery)
    ]);

    res.json({
      success: true,
      users: users.map(user => ({
        _id: user._id,
        nom: user.nom,
        prenom: user.prenom,
        email: user.preferences?.visibiliteProfil === 'public' ? user.email : null,
        dateCreation: user.dateCreation,
        visibilite: user.preferences?.visibiliteProfil || 'public'
      })),
      pagination: {
        page,
        limit,
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

// @desc    Récupérer un utilisateur public par ID
// @route   GET /api/users/:id
// @access  Private
export const getUserById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);
    
    if (!user || user.statut !== 'actif') {
      return res.status(404).json({
        success: false,
        error: 'Utilisateur non trouvé'
      });
    }

    // Vérifier la visibilité du profil
    const visibilite = user.preferences?.visibiliteProfil || 'public';
    
    if (visibilite === 'prive') {
      return res.status(403).json({
        success: false,
        error: 'Ce profil est privé'
      });
    }

    // Pour les profils "amis", on pourrait implémenter un système d'amis plus tard
    if (visibilite === 'amis') {
      // Pour l'instant, on considère tous les utilisateurs connectés comme "amis"
      // Cette logique pourrait être étendue avec un système d'amis réel
    }

    // Récupérer les statistiques publiques
    const [collectionsCount, decksCount] = await Promise.all([
      Collection.countDocuments({ 
        utilisateur: user._id,
        visibilite: { $in: ['public', 'amis'] }
      }),
      Deck.countDocuments({ 
        utilisateur: user._id,
        visibilite: { $in: ['public', 'amis'] }
      })
    ]);

    res.json({
      success: true,
      user: {
        _id: user._id,
        nom: user.nom,
        prenom: user.prenom,
        email: visibilite === 'public' ? user.email : null,
        dateCreation: user.dateCreation,
        derniereConnexion: visibilite === 'public' ? user.derniereConnexion : null,
        statistiques: {
          nombreCollections: collectionsCount,
          nombreDecks: decksCount
        },
        visibilite
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Supprimer son compte
// @route   DELETE /api/users/profile
// @access  Private
export const deleteAccount = async (req, res, next) => {
  try {
    const userId = req.user._id;

    // Supprimer toutes les collections de l'utilisateur
    await Collection.deleteMany({ utilisateur: userId });
    
    // Supprimer tous les decks de l'utilisateur
    await Deck.deleteMany({ utilisateur: userId });
    
    // Supprimer l'utilisateur
    await User.findByIdAndDelete(userId);

    res.json({
      success: true,
      message: 'Compte supprimé avec succès'
    });
  } catch (error) {
    next(error);
  }
};

// Routes
router.get('/profile', authenticate, getProfile);
router.put('/profile', authenticate, updateProfile);
router.get('/search', authenticate, searchUsers);
router.get('/:id', authenticate, getUserById);
router.delete('/profile', authenticate, deleteAccount);

export default router;
