import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import rateLimit from 'express-rate-limit';
import User from '../models/User.js';
import { authenticateToken } from '../middleware/auth.js';
import { 
  validate, 
  sanitize, 
  validationSchemas, 
  validatePayloadSize,
  preventNoSQLInjection,
  securityLogger
} from '../middleware/validation.js';

const router = express.Router();

// Rate limiting spécifique pour les connexions
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 tentatives par IP
  message: {
    success: false,
    error: 'Trop de tentatives de connexion. Réessayez dans 15 minutes.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true // Ne compter que les échecs
});

// Rate limiting pour les inscriptions
const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 heure
  max: 3, // 3 inscriptions par IP par heure
  message: {
    success: false,
    error: 'Trop d\'inscriptions depuis cette IP. Réessayez dans 1 heure.'
  }
});

// Middleware global pour toutes les routes auth
router.use(securityLogger);
router.use(preventNoSQLInjection);
router.use(validatePayloadSize(50)); // 50KB max

// Route de test
router.get('/test', (req, res) => {
    res.json({ message: 'Auth routes fonctionnent!' });
});

// POST /api/auth/register - Inscription
router.post('/register', 
  registerLimiter,
  validate(validationSchemas.register),
  sanitize(['nom', 'prenom']),
  async (req, res) => {
    try {
        const { email, password, nom, prenom, dateNaissance } = req.body;

        // Verifier si l utilisateur existe deja
        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return res.status(400).json({
                success: false,
                error: 'Un utilisateur avec cet email existe deja'
            });
        }

        // Creer le nouvel utilisateur
        const user = new User({
            email,
            password,
            nom,
            prenom,
            dateNaissance: dateNaissance ? new Date(dateNaissance) : null
        });

        await user.save();

        // Generer le token JWT
        const token = jwt.sign(
            { id: user._id },
            process.env.JWT_SECRET || 'mtg-secret-key-dev',
            { expiresIn: '7d' }
        );

        res.status(201).json({
            success: true,
            message: 'Utilisateur cree avec succes',
            token,
            user: user.toSafeObject()
        });

    } catch (error) {
        console.error('Erreur lors de l inscription:', error);
        res.status(500).json({
            success: false,
            error: 'Erreur serveur lors de l inscription'
        });
    }
});

// POST /api/auth/login - Connexion
router.post('/login', 
  loginLimiter,
  validate(validationSchemas.login),
  async (req, res) => {
    try {
        const { email, password } = req.body;

        // Trouver l utilisateur
        const user = await User.findByEmail(email);
        if (!user) {
            return res.status(401).json({
                success: false,
                error: 'Email ou mot de passe incorrect'
            });
        }

        // Verifier le mot de passe
        const isValid = await user.comparePassword(password);
        if (!isValid) {
            return res.status(401).json({
                success: false,
                error: 'Email ou mot de passe incorrect'
            });
        }

        // Generer le token JWT
        const token = jwt.sign(
            { id: user._id },
            process.env.JWT_SECRET || 'mtg-secret-key-dev',
            { expiresIn: '7d' }
        );

        res.json({
            success: true,
            message: 'Connexion reussie',
            token,
            user: user.toSafeObject()
        });

    } catch (error) {
        console.error('Erreur lors de la connexion:', error);
        res.status(500).json({
            success: false,
            error: 'Erreur serveur lors de la connexion'
        });
    }
});

// GET /api/auth/me - Obtenir les infos de l utilisateur connecte
router.get('/me', authenticateToken, async (req, res) => {
    try {
        res.json({
            success: true,
            user: req.user.toSafeObject()
        });
    } catch (error) {
        console.error('Erreur lors de la recuperation du profil:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur serveur'
        });
    }
});

// PUT /api/auth/profile - Modifier le profil utilisateur
router.put('/profile', 
  authenticateToken,
  validate(validationSchemas.updateProfile),
  sanitize(['nom', 'prenom']),
  async (req, res) => {
    try {
        const { nom, prenom, email } = req.body;
        const user = req.user;

        // Mise à jour des champs autorisés
        if (nom) user.nom = nom;
        if (prenom) user.prenom = prenom;
        if (email && email !== user.email) {
            // Vérifier que le nouvel email n'existe pas déjà
            const existingUser = await User.findOne({ email, _id: { $ne: user._id } });
            if (existingUser) {
                return res.status(400).json({
                    success: false,
                    error: 'Cette adresse email est déjà utilisée'
                });
            }
            user.email = email;
        }

        await user.save();

        res.json({
            success: true,
            message: 'Profil mis à jour avec succès',
            user: user.toSafeObject()
        });
    } catch (error) {
        console.error('Erreur lors de la mise à jour du profil:', error);
        res.status(500).json({
            success: false,
            error: 'Erreur serveur lors de la mise à jour'
        });
    }
});

// POST /api/auth/logout - Deconnexion (optionnel cote serveur)
router.post('/logout', (req, res) => {
    res.json({
        success: true,
        message: 'Deconnexion reussie'
    });
});

export default router;
