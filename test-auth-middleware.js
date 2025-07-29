/**
 * Tests unitaires pour les middlewares d'authentification
 */

import { authenticateToken, authorize, optionalAuth } from './server/src/middleware/auth.js';
import jwt from 'jsonwebtoken';

// Mock pour les tests
const mockUser = {
  _id: '507f1f77bcf86cd799439011',
  email: 'test@example.com',
  nom: 'Test',
  prenom: 'User',
  role: 'user',
  statut: 'actif',
  toSafeObject: () => ({
    _id: '507f1f77bcf86cd799439011',
    email: 'test@example.com',
    nom: 'Test',
    prenom: 'User',
    role: 'user'
  })
};

const mockAdminUser = {
  ...mockUser,
  role: 'admin'
};

const mockInactiveUser = {
  ...mockUser,
  statut: 'inactif'
};

// Mock User model
const User = {
  findById: jest.fn()
};

// Setup pour les tests
process.env.JWT_SECRET = 'test-secret-key';

describe('Middleware d\'authentification', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      headers: {},
      user: null
    };
    res = {
      status: jest.fn(() => res),
      json: jest.fn(() => res)
    };
    next = jest.fn();
    User.findById.mockClear();
  });

  describe('authenticateToken', () => {
    test('devrait authentifier avec un token valide', async () => {
      const token = jwt.sign({ userId: mockUser._id }, process.env.JWT_SECRET);
      req.headers.authorization = `Bearer ${token}`;
      User.findById.mockResolvedValue(mockUser);

      await authenticateToken(req, res, next);

      expect(req.user).toEqual(mockUser);
      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    test('devrait rejeter si aucun token n\'est fourni', async () => {
      await authenticateToken(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Accès refusé. Token manquant.'
      });
      expect(next).not.toHaveBeenCalled();
    });

    test('devrait rejeter un token invalide', async () => {
      req.headers.authorization = 'Bearer invalid-token';

      await authenticateToken(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Token invalide.'
      });
      expect(next).not.toHaveBeenCalled();
    });

    test('devrait rejeter si l\'utilisateur n\'existe pas', async () => {
      const token = jwt.sign({ userId: 'nonexistent' }, process.env.JWT_SECRET);
      req.headers.authorization = `Bearer ${token}`;
      User.findById.mockResolvedValue(null);

      await authenticateToken(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Token invalide. Utilisateur non trouvé.'
      });
    });

    test('devrait rejeter un utilisateur inactif', async () => {
      const token = jwt.sign({ userId: mockInactiveUser._id }, process.env.JWT_SECRET);
      req.headers.authorization = `Bearer ${token}`;
      User.findById.mockResolvedValue(mockInactiveUser);

      await authenticateToken(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Compte inactif ou suspendu.'
      });
    });

    test('devrait gérer les erreurs de base de données', async () => {
      const token = jwt.sign({ userId: mockUser._id }, process.env.JWT_SECRET);
      req.headers.authorization = `Bearer ${token}`;
      User.findById.mockRejectedValue(new Error('DB Error'));

      await authenticateToken(req, res, next);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Erreur serveur lors de l\'authentification.'
      });
    });
  });

  describe('authorize', () => {
    test('devrait autoriser un utilisateur avec le bon rôle', () => {
      req.user = mockUser;
      const middleware = authorize('user', 'admin');

      middleware(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    test('devrait autoriser un admin', () => {
      req.user = mockAdminUser;
      const middleware = authorize('admin');

      middleware(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    test('devrait rejeter un utilisateur sans le bon rôle', () => {
      req.user = mockUser;
      const middleware = authorize('admin');

      middleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Accès refusé. Rôle user non autorisé.'
      });
      expect(next).not.toHaveBeenCalled();
    });

    test('devrait rejeter si aucun utilisateur n\'est authentifié', () => {
      const middleware = authorize('user');

      middleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Accès refusé. Utilisateur non authentifié.'
      });
    });
  });

  describe('optionalAuth', () => {
    test('devrait définir l\'utilisateur si un token valide est fourni', async () => {
      const token = jwt.sign({ id: mockUser._id }, process.env.JWT_SECRET);
      req.headers.authorization = `Bearer ${token}`;
      User.findById.mockResolvedValue(mockUser);

      await optionalAuth(req, res, next);

      expect(req.user).toEqual(mockUser);
      expect(next).toHaveBeenCalled();
    });

    test('devrait continuer sans utilisateur si aucun token n\'est fourni', async () => {
      await optionalAuth(req, res, next);

      expect(req.user).toBeNull();
      expect(next).toHaveBeenCalled();
    });

    test('devrait continuer sans utilisateur si le token est invalide', async () => {
      req.headers.authorization = 'Bearer invalid-token';

      await optionalAuth(req, res, next);

      expect(req.user).toBeNull();
      expect(next).toHaveBeenCalled();
    });

    test('devrait ignorer un utilisateur inactif', async () => {
      const token = jwt.sign({ id: mockInactiveUser._id }, process.env.JWT_SECRET);
      req.headers.authorization = `Bearer ${token}`;
      User.findById.mockResolvedValue(mockInactiveUser);

      await optionalAuth(req, res, next);

      expect(req.user).toBeNull();
      expect(next).toHaveBeenCalled();
    });
  });
});

describe('Tests de sécurité des tokens JWT', () => {
  test('devrait rejeter un token avec une signature incorrecte', () => {
    const fakeToken = jwt.sign({ userId: 'test' }, 'wrong-secret');
    
    expect(() => {
      jwt.verify(fakeToken, process.env.JWT_SECRET);
    }).toThrow();
  });

  test('devrait rejeter un token expiré', () => {
    const expiredToken = jwt.sign(
      { userId: 'test' },
      process.env.JWT_SECRET,
      { expiresIn: '-1s' }
    );

    expect(() => {
      jwt.verify(expiredToken, process.env.JWT_SECRET);
    }).toThrow();
  });

  test('devrait valider un token correct', () => {
    const token = jwt.sign(
      { userId: 'test' },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    expect(decoded.userId).toBe('test');
  });
});

console.log('Tests unitaires des middlewares d\'authentification');
console.log('Pour exécuter ces tests, utilisez: npm test -- test-auth-middleware.js');
