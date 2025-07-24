import jwt from 'jsonwebtoken';
import User from '../models/User.js';

/**
 * Middleware d'authentification JWT
 */
export const authenticateToken = async (req, res, next) => {
  try {
    let token;

    // Vérifier si le token est présent dans les headers
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Accès refusé. Token manquant.'
      });
    }

    try {
      // Vérifier le token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Récupérer l'utilisateur
      const user = await User.findById(decoded.userId).select('-password');
      
      if (!user) {
        return res.status(401).json({
          success: false,
          error: 'Token invalide. Utilisateur non trouvé.'
        });
      }

      if (user.statut !== 'actif') {
        return res.status(401).json({
          success: false,
          error: 'Compte inactif ou suspendu.'
        });
      }

      req.user = user;
      next();
    } catch (error) {
      return res.status(401).json({
        success: false,
        error: 'Token invalide.'
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: 'Erreur serveur lors de l\'authentification.'
    });
  }
};

/**
 * Middleware d'autorisation par rôle
 */
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Accès refusé. Utilisateur non authentifié.'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: `Accès refusé. Rôle ${req.user.role} non autorisé.`
      });
    }

    next();
  };
};

/**
 * Middleware optionnel pour récupérer l'utilisateur si connecté
 */
export const optionalAuth = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id).select('-password');
        
        if (user && user.statut === 'actif') {
          req.user = user;
        }
      } catch (error) {
        // Ignorer les erreurs de token pour l'authentification optionnelle
      }
    }

    next();
  } catch (error) {
    next();
  }
};
