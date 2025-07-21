/**
 * Middleware de gestion d'erreurs centralisé
 */

export const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Logger l'erreur
  console.error('🔥 Erreur:', err);

  // Erreur de validation Mongoose
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map(val => val.message).join(', ');
    error = {
      statusCode: 400,
      message: `Erreur de validation: ${message}`
    };
  }

  // Erreur de duplication MongoDB
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    const message = `Cette valeur pour le champ '${field}' existe déjà`;
    error = {
      statusCode: 400,
      message
    };
  }

  // Erreur d'ObjectId MongoDB invalide
  if (err.name === 'CastError') {
    const message = 'Identifiant invalide';
    error = {
      statusCode: 400,
      message
    };
  }

  // Erreur JWT
  if (err.name === 'JsonWebTokenError') {
    const message = 'Token invalide';
    error = {
      statusCode: 401,
      message
    };
  }

  // Erreur JWT expiré
  if (err.name === 'TokenExpiredError') {
    const message = 'Token expiré';
    error = {
      statusCode: 401,
      message
    };
  }

  res.status(error.statusCode || 500).json({
    success: false,
    error: error.message || 'Erreur serveur interne',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};
