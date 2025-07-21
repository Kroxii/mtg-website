import express from 'express';
import jwt from 'jsonwebtoken';
import Joi from 'joi';
import User from '../models/User.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Schémas de validation
const registerSchema = Joi.object({
  nom: Joi.string().trim().max(50).required(),
  prenom: Joi.string().trim().max(50).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  dateNaissance: Joi.date().optional(),
  preferences: Joi.object({
    theme: Joi.string().valid('dark', 'light').default('dark'),
    langue: Joi.string().valid('fr', 'en').default('fr'),
    notifications: Joi.boolean().default(true),
    visibiliteProfil: Joi.string().valid('public', 'amis', 'prive').default('public')
  }).optional()
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});

const updatePasswordSchema = Joi.object({
  currentPassword: Joi.string().required(),
  newPassword: Joi.string().min(6).required()
});

// Fonction pour générer un token JWT
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d'
  });
};

// @desc    Inscription d'un utilisateur
// @route   POST /api/auth/register
// @access  Public
export const register = async (req, res, next) => {
  try {
    const { error, value } = registerSchema.validate(req.body);
    
    if (error) {
      return res.status(400).json({
        success: false,
        error: error.details[0].message
      });
    }

    const { nom, prenom, email, password, dateNaissance, preferences } = value;

    // Vérifier si l'utilisateur existe déjà
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: 'Un compte avec cette adresse email existe déjà'
      });
    }

    // Créer l'utilisateur
    const user = await User.create({
      nom,
      prenom,
      email,
      password,
      dateNaissance,
      preferences: preferences || {}
    });

    // Générer le token
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: 'Compte créé avec succès',
      token,
      user: user.toSafeObject()
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Connexion d'un utilisateur
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res, next) => {
  try {
    const { error, value } = loginSchema.validate(req.body);
    
    if (error) {
      return res.status(400).json({
        success: false,
        error: error.details[0].message
      });
    }

    const { email, password } = value;

    // Trouver l'utilisateur et inclure le mot de passe pour la vérification
    const user = await User.findByEmail(email).select('+password');
    
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Email ou mot de passe incorrect'
      });
    }

    if (user.statut !== 'actif') {
      return res.status(401).json({
        success: false,
        error: 'Compte inactif ou suspendu'
      });
    }

    // Vérifier le mot de passe
    const isPasswordValid = await user.comparePassword(password);
    
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        error: 'Email ou mot de passe incorrect'
      });
    }

    // Mettre à jour la dernière connexion
    user.derniereConnexion = new Date();
    await user.save();

    // Générer le token
    const token = generateToken(user._id);

    res.json({
      success: true,
      message: 'Connexion réussie',
      token,
      user: user.toSafeObject()
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Récupérer l'utilisateur actuel
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res, next) => {
  try {
    res.json({
      success: true,
      user: req.user.toSafeObject()
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Changer le mot de passe
// @route   PUT /api/auth/password
// @access  Private
export const updatePassword = async (req, res, next) => {
  try {
    const { error, value } = updatePasswordSchema.validate(req.body);
    
    if (error) {
      return res.status(400).json({
        success: false,
        error: error.details[0].message
      });
    }

    const { currentPassword, newPassword } = value;

    // Récupérer l'utilisateur avec le mot de passe
    const user = await User.findById(req.user.id).select('+password');
    
    // Vérifier le mot de passe actuel
    const isCurrentPasswordValid = await user.comparePassword(currentPassword);
    
    if (!isCurrentPasswordValid) {
      return res.status(401).json({
        success: false,
        error: 'Mot de passe actuel incorrect'
      });
    }

    // Mettre à jour le mot de passe
    user.password = newPassword;
    await user.save();

    res.json({
      success: true,
      message: 'Mot de passe mis à jour avec succès'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Déconnexion (côté client principalement)
// @route   POST /api/auth/logout
// @access  Private
export const logout = async (req, res, next) => {
  try {
    // En JWT, la déconnexion se fait principalement côté client
    // Ici on pourrait implémenter une blacklist de tokens si nécessaire
    
    res.json({
      success: true,
      message: 'Déconnexion réussie'
    });
  } catch (error) {
    next(error);
  }
};

// Routes
router.post('/register', register);
router.post('/login', login);
router.get('/me', authenticate, getMe);
router.put('/password', authenticate, updatePassword);
router.post('/logout', authenticate, logout);

export default router;
