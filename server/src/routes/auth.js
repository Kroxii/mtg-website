import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Route de test
router.get('/test', (req, res) => {
    res.json({ message: 'Auth routes fonctionnent!' });
});

// POST /api/auth/register - Inscription
router.post('/register', async (req, res) => {
    try {
        const { email, password, nom, prenom } = req.body;

        // Verification des champs requis
        if (!email || !password || !nom || !prenom) {
            return res.status(400).json({
                success: false,
                message: 'Email, mot de passe, nom et prenom sont requis'
            });
        }

        // Verifier si l utilisateur existe deja
        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'Un utilisateur avec cet email existe deja'
            });
        }

        // Creer le nouvel utilisateur
        const user = new User({
            email,
            password,
            nom,
            prenom
        });

        await user.save();

        // Generer le token JWT
        const token = jwt.sign(
            { userId: user._id },
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
            message: 'Erreur serveur lors de l inscription'
        });
    }
});

// POST /api/auth/login - Connexion
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Email et mot de passe sont requis'
            });
        }

        // Trouver l utilisateur
        const user = await User.findByEmail(email);
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Email ou mot de passe incorrect'
            });
        }

        // Verifier le mot de passe
        const isValid = await user.comparePassword(password);
        if (!isValid) {
            return res.status(401).json({
                success: false,
                message: 'Email ou mot de passe incorrect'
            });
        }

        // Generer le token JWT
        const token = jwt.sign(
            { userId: user._id },
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
            message: 'Erreur serveur lors de la connexion'
        });
    }
});

// GET /api/auth/me - Obtenir les infos de l utilisateur connecte
router.get('/me', authenticateToken, async (req, res) => {
    try {
        const user = await User.findById(req.user.userId).select('-password');
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Utilisateur non trouve'
            });
        }

        res.json({
            success: true,
            user: user.toSafeObject()
        });
    } catch (error) {
        console.error('Erreur lors de la recuperation du profil:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur serveur'
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
