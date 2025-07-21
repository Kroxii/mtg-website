/**
 * Middleware pour gérer les routes non trouvées
 */

export const notFound = (req, res, next) => {
  const error = new Error(`Route non trouvée - ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
};
