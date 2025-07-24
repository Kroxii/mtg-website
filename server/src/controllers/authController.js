import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// Générer un token JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '30d'
  });
};

// @desc    Connexion utilisateur
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validation des entrées
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email et mot de passe sont requis'
      });
    }

    // Vérifier si l'utilisateur existe et récupérer le mot de passe
    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Identifiants invalides'
      });
    }

    // Vérifier le mot de passe
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        error: 'Identifiants invalides'
      });
    }

    // Vérifier le statut du compte
    if (user.statut !== 'actif') {
      return res.status(401).json({
        success: false,
        error: 'Compte inactif ou suspendu'
      });
    }

    // Générer le token
    const token = generateToken(user._id);

    // Mettre à jour la dernière connexion
    user.derniereConnexion = new Date();
    await user.save();

    res.json({
      success: true,
      token,
      user: user.toSafeObject()
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Inscription utilisateur
// @route   POST /api/auth/register
// @access  Public
export const register = async (req, res, next) => {
  try {
    const { nom, prenom, email, password, dateNaissance } = req.body;

    // Validation des entrées
    if (!nom || !prenom || !email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Tous les champs obligatoires doivent être remplis'
      });
    }

    // Vérifier si l'utilisateur existe déjà
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: 'Un compte avec cette adresse email existe déjà'
      });
    }

    // Créer le nouvel utilisateur
    const user = await User.create({
      nom,
      prenom,
      email,
      password,
      dateNaissance: dateNaissance ? new Date(dateNaissance) : null
    });

    // Générer le token
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      token,
      user: user.toSafeObject(),
      message: 'Compte créé avec succès'
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        error: messages.join(', ')
      });
    }
    next(error);
  }
};

// @desc    Récupérer les informations de l'utilisateur connecté
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'Utilisateur non trouvé'
      });
    }

    res.json({
      success: true,
      user: user.toSafeObject()
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Mettre à jour le profil utilisateur
// @route   PUT /api/auth/profile
// @access  Private
export const updateProfile = async (req, res, next) => {
  try {
    const allowedFields = ['nom', 'prenom', 'dateNaissance', 'avatar', 'preferences'];
    const updateData = {};

    // Filtrer les champs autorisés
    Object.keys(req.body).forEach(key => {
      if (allowedFields.includes(key)) {
        updateData[key] = req.body[key];
      }
    });

    const user = await User.findByIdAndUpdate(
      req.user._id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'Utilisateur non trouvé'
      });
    }

    res.json({
      success: true,
      user: user.toSafeObject(),
      message: 'Profil mis à jour avec succès'
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        error: messages.join(', ')
      });
    }
    next(error);
  }
};

// @desc    Changer le mot de passe
// @route   PUT /api/auth/password
// @access  Private
export const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        error: 'Mot de passe actuel et nouveau mot de passe sont requis'
      });
    }

    const user = await User.findById(req.user._id);
    
    // Vérifier le mot de passe actuel
    const isCurrentPasswordValid = await user.comparePassword(currentPassword);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({
        success: false,
        error: 'Mot de passe actuel incorrect'
      });
    }

    // Mettre à jour le mot de passe
    user.password = newPassword;
    await user.save();

    res.json({
      success: true,
      message: 'Mot de passe changé avec succès'
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
    // Mettre à jour la dernière connexion
    await User.findByIdAndUpdate(req.user._id, {
      derniereConnexion: new Date()
    });

    res.json({
      success: true,
      message: 'Déconnexion réussie'
    });
  } catch (error) {
    next(error);
  }
};
