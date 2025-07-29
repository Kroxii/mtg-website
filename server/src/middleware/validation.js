import joi from 'joi';
import createDOMPurify from 'dompurify';
import { JSDOM } from 'jsdom';

const window = new JSDOM('').window;
const DOMPurify = createDOMPurify(window);

/**
 * Schémas de validation Joi
 */
export const validationSchemas = {
  // Validation pour l'inscription
  register: joi.object({
    nom: joi.string()
      .min(2)
      .max(50)
      .pattern(/^[a-zA-ZÀ-ÿ\-\s]*$/)
      .required()
      .messages({
        'string.pattern.base': 'Le nom ne peut contenir que des lettres, espaces et tirets',
        'string.min': 'Le nom doit contenir au moins 2 caractères',
        'string.max': 'Le nom ne peut pas dépasser 50 caractères'
      }),
    prenom: joi.string()
      .min(2)
      .max(50)
      .pattern(/^[a-zA-ZÀ-ÿ\-\s]*$/)
      .required()
      .messages({
        'string.pattern.base': 'Le prénom ne peut contenir que des lettres, espaces et tirets',
        'string.min': 'Le prénom doit contenir au moins 2 caractères',
        'string.max': 'Le prénom ne peut pas dépasser 50 caractères'
      }),
    email: joi.string()
      .email()
      .max(100)
      .required()
      .messages({
        'string.email': 'Veuillez fournir une adresse email valide',
        'string.max': 'L\'email ne peut pas dépasser 100 caractères'
      }),
    password: joi.string()
      .min(8)
      .max(128)
      .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
      .required()
      .messages({
        'string.pattern.base': 'Le mot de passe doit contenir au moins une lettre minuscule, une majuscule, un chiffre et un caractère spécial',
        'string.min': 'Le mot de passe doit contenir au moins 8 caractères',
        'string.max': 'Le mot de passe ne peut pas dépasser 128 caractères'
      }),
    dateNaissance: joi.date()
      .max('now')
      .min('1900-01-01')
      .optional()
  }),

  // Validation pour la connexion
  login: joi.object({
    email: joi.string()
      .email()
      .required()
      .messages({
        'string.email': 'Veuillez fournir une adresse email valide'
      }),
    password: joi.string()
      .required()
      .messages({
        'any.required': 'Le mot de passe est requis'
      })
  }),

  // Validation pour la mise à jour du profil
  updateProfile: joi.object({
    nom: joi.string()
      .min(2)
      .max(50)
      .pattern(/^[a-zA-ZÀ-ÿ\-\s]*$/)
      .optional()
      .messages({
        'string.pattern.base': 'Le nom ne peut contenir que des lettres, espaces et tirets'
      }),
    prenom: joi.string()
      .min(2)
      .max(50)
      .pattern(/^[a-zA-ZÀ-ÿ\-\s]*$/)
      .optional()
      .messages({
        'string.pattern.base': 'Le prénom ne peut contenir que des lettres, espaces et tirets'
      }),
    email: joi.string()
      .email()
      .max(100)
      .optional()
      .messages({
        'string.email': 'Veuillez fournir une adresse email valide'
      })
  })
};

/**
 * Middleware de validation
 */
export const validate = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));

      return res.status(400).json({
        success: false,
        error: 'Données invalides',
        details: errors
      });
    }

    // Remplacer req.body par les données validées
    req.body = value;
    next();
  };
};

/**
 * Middleware de sanitisation
 */
export const sanitize = (fields = []) => {
  return (req, res, next) => {
    try {
      // Si aucun champ spécifié, sanitiser tous les champs string
      const fieldsToSanitize = fields.length > 0 ? fields : Object.keys(req.body);

      fieldsToSanitize.forEach(field => {
        if (req.body[field] && typeof req.body[field] === 'string') {
          // Nettoyer les balises HTML et les scripts
          req.body[field] = DOMPurify.sanitize(req.body[field], {
            ALLOWED_TAGS: [],
            ALLOWED_ATTR: []
          });

          // Nettoyer les caractères de path traversal
          req.body[field] = req.body[field]
            .replace(/\.\./g, '')
            .replace(/[<>:"/\\|?*]/g, '')
            .trim();
        }
      });

      next();
    } catch (error) {
      console.error('Erreur lors de la sanitisation:', error);
      return res.status(500).json({
        success: false,
        error: 'Erreur de traitement des données'
      });
    }
  };
};

/**
 * Middleware de validation des tailles de payload
 */
export const validatePayloadSize = (maxSizeKB = 100) => {
  return (req, res, next) => {
    const contentLength = parseInt(req.get('Content-Length') || '0');
    const maxSizeBytes = maxSizeKB * 1024;

    if (contentLength > maxSizeBytes) {
      return res.status(413).json({
        success: false,
        error: `Payload trop volumineux. Maximum autorisé: ${maxSizeKB}KB`
      });
    }

    next();
  };
};

/**
 * Middleware de protection contre les injections NoSQL
 */
export const preventNoSQLInjection = (req, res, next) => {
  try {
    const checkForInjection = (obj) => {
      if (typeof obj === 'object' && obj !== null) {
        for (const key in obj) {
          if (key.startsWith('$') || key.includes('.')) {
            throw new Error('Caractères interdits détectés');
          }
          if (typeof obj[key] === 'object') {
            checkForInjection(obj[key]);
          }
        }
      }
    };

    checkForInjection(req.body);
    checkForInjection(req.query);
    checkForInjection(req.params);

    next();
  } catch (error) {
    return res.status(400).json({
      success: false,
      error: 'Requête invalide détectée'
    });
  }
};

/**
 * Middleware de logging de sécurité
 */
export const securityLogger = (req, res, next) => {
  const startTime = Date.now();
  const originalSend = res.send;

  res.send = function(data) {
    const responseTime = Date.now() - startTime;
    
    // Logger les tentatives suspectes
    if (res.statusCode >= 400) {
      console.log(`[SECURITY] ${new Date().toISOString()} - ${req.method} ${req.originalUrl} - IP: ${req.ip} - Status: ${res.statusCode} - Time: ${responseTime}ms`);
      
      // Logger les tentatives de brute force
      if (req.originalUrl.includes('/auth/login') && res.statusCode === 401) {
        console.log(`[BRUTE_FORCE_ATTEMPT] IP: ${req.ip} - Email: ${req.body?.email} - Time: ${new Date().toISOString()}`);
      }
    }

    originalSend.call(this, data);
  };

  next();
};
