import express from 'express';
import Collection from '../models/Collection.js';
import Card from '../models/Card.js';
import { authenticateToken } from '../middleware/auth.js';
import {
    createCollection,
    getMyCollections,
    getCollectionById,
    updateCollection,
    deleteCollection,
    addCardToCollection,
    updateCardInCollection,
    removeCardFromCollection
} from '../controllers/collectionController.js';

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

// Routes utilisant le contrôleur
router.get('/', getMyCollections);
router.post('/', createCollection);
router.get('/:id', getCollectionById);
router.put('/:id', updateCollection);
router.delete('/:id', deleteCollection);

// Routes pour les cartes dans les collections
router.post('/:id/cards', addCardToCollection);
router.put('/:id/cards/:cardId', updateCardInCollection);
router.delete('/:id/cards/:cardId', removeCardFromCollection);

export default router;
