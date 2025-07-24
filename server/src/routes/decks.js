import express from 'express';
import Deck from '../models/Deck.js';
import Card from '../models/Card.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Toutes les routes necessitent une authentification
router.use(authenticateToken);

// Route de test
router.get('/test', (req, res) => {
    res.json({ 
        message: 'Decks routes fonctionnent!',
        userId: req.user._id 
    });
});

// GET /api/decks - Obtenir tous les decks de l utilisateur connecte
router.get('/', async (req, res) => {
    try {
        const decks = await Deck.find({ owner: req.user._id })
            .populate('cards.card')
            .populate('commander')
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            decks
        });
    } catch (error) {
        console.error('Erreur lors de la recuperation des decks:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur serveur lors de la recuperation des decks'
        });
    }
});

// POST /api/decks - Creer un nouveau deck
router.post('/', async (req, res) => {
    try {
        const { name, format, description, commander } = req.body;

        if (!name) {
            return res.status(400).json({
                success: false,
                message: 'Le nom du deck est requis'
            });
        }

        if (!format) {
            return res.status(400).json({
                success: false,
                message: 'Le format du deck est requis'
            });
        }

        const deckData = {
            name,
            format,
            description,
            owner: req.user._id
        };

        const deck = new Deck(deckData);
        await deck.save();

        res.status(201).json({
            success: true,
            message: 'Deck cree avec succes',
            deck
        });
    } catch (error) {
        console.error('Erreur lors de la creation du deck:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur serveur lors de la creation du deck'
        });
    }
});

export default router;
