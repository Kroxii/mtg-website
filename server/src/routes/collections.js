import express from 'express';
import Collection from '../models/Collection.js';
import Card from '../models/Card.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Toutes les routes necessitent une authentification
router.use(authenticateToken);

// Route de test
router.get('/test', (req, res) => {
    res.json({ 
        message: 'Collections routes fonctionnent!',
        userId: req.user._id 
    });
});

// GET /api/collections - Obtenir toutes les collections de l utilisateur connecte
router.get('/', async (req, res) => {
    try {
        const collections = await Collection.find({ owner: req.user._id })
            .populate('cards.card')
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            collections
        });
    } catch (error) {
        console.error('Erreur lors de la recuperation des collections:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur serveur lors de la recuperation des collections'
        });
    }
});

// POST /api/collections - Creer une nouvelle collection
router.post('/', async (req, res) => {
    try {
        const { name, description } = req.body;

        if (!name) {
            return res.status(400).json({
                success: false,
                message: 'Le nom de la collection est requis'
            });
        }

        const collection = new Collection({
            name,
            description,
            owner: req.user._id
        });

        await collection.save();

        res.status(201).json({
            success: true,
            message: 'Collection creee avec succes',
            collection
        });
    } catch (error) {
        console.error('Erreur lors de la creation de la collection:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur serveur lors de la creation de la collection'
        });
    }
});

export default router;
