import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Import des routes
import authRoutes from './src/routes/auth.js';
import userRoutes from './src/routes/users.js';
import collectionRoutes from './src/routes/collections.js';
import deckRoutes from './src/routes/decks.js';
import cardRoutes from './src/routes/cards.js';

// Import de la configuration de la base de données
import connectDB from './src/config/database.js';

// Import des middlewares personnalisés
import { errorHandler } from './src/middleware/errorHandler.js';
import { notFound } from './src/middleware/notFound.js';

// Configuration
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Connexion à la base de données
connectDB();

// Middleware de sécurité
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  crossOriginEmbedderPolicy: false
}));

// Configuration CORS
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limite chaque IP à 100 requêtes par fenêtre
  message: {
    error: 'Trop de requêtes depuis cette IP, réessayez dans 15 minutes.'
  },
  standardHeaders: true,
  legacyHeaders: false
});
app.use('/api/', limiter);

// Middleware de parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Compression
app.use(compression());

// Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Routes API
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/collections', collectionRoutes);
app.use('/api/decks', deckRoutes);
app.use('/api/cards', cardRoutes);

// Route de santé
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'MTG Server is running',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0'
  });
});

// Servir les fichiers statiques du client en production
if (process.env.NODE_ENV === 'production') {
  const clientPath = path.join(__dirname, '../client/dist');
  app.use(express.static(clientPath));
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(clientPath, 'index.html'));
  });
}

// Middleware de gestion d'erreurs
app.use(notFound);
app.use(errorHandler);

// Démarrage du serveur
app.listen(PORT, () => {
  console.log(`🚀 MTG Server démarré sur le port ${PORT}`);
  console.log(`🌍 Environnement: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📱 Client URL: ${process.env.CLIENT_URL || 'http://localhost:5173'}`);
  console.log(`🔗 API disponible sur: http://localhost:${PORT}/api`);
});

// Gestion propre de l'arrêt
process.on('SIGTERM', () => {
  console.log('👋 SIGTERM reçu. Arrêt propre du serveur...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('👋 SIGINT reçu. Arrêt propre du serveur...');
  process.exit(0);
});

export default app;
