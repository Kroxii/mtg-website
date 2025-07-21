# MTG Website - Serveur API

API REST pour l'application MTG Website, construite avec Express.js, MongoDB et l'API Scryfall.

## 🚀 Démarrage rapide

### Prérequis

- Node.js 18+ 
- MongoDB 6+
- npm ou yarn

### Installation

1. Copier le fichier d'environnement :
```bash
cp .env.example .env
```

2. Modifier le fichier `.env` avec vos paramètres :
```bash
NODE_ENV=development
PORT=3000
MONGODB_URI=mongodb://localhost:27017/mtg-website
JWT_SECRET=your_super_secret_jwt_key
CLIENT_URL=http://localhost:5173
```

3. Installer les dépendances :
```bash
npm install
```

4. Démarrer le serveur :
```bash
# Développement (avec rechargement automatique)
npm run dev

# Production
npm start
```

Le serveur sera accessible sur `http://localhost:3000`

## 📁 Structure du projet

```
server/
├── src/
│   ├── config/
│   │   └── database.js          # Configuration MongoDB
│   ├── middleware/
│   │   ├── auth.js             # Middleware d'authentification
│   │   ├── errorHandler.js     # Gestion d'erreurs
│   │   └── notFound.js         # Middleware 404
│   ├── models/
│   │   ├── User.js             # Modèle Utilisateur
│   │   ├── Collection.js       # Modèle Collection
│   │   ├── Deck.js            # Modèle Deck
│   │   └── Card.js            # Modèle Carte
│   └── routes/
│       ├── auth.js            # Routes d'authentification
│       ├── users.js           # Routes utilisateurs
│       ├── collections.js     # Routes collections
│       ├── decks.js          # Routes decks
│       └── cards.js          # Routes cartes (Scryfall API)
├── .env.example
├── package.json
├── README.md
└── server.js                  # Point d'entrée
```

## 🔐 Authentification

L'API utilise JWT (JSON Web Tokens) pour l'authentification. Les tokens sont valides pendant 7 jours par défaut.

### Endpoints d'authentification

- `POST /api/auth/register` - Inscription
- `POST /api/auth/login` - Connexion
- `GET /api/auth/me` - Profil utilisateur actuel
- `PUT /api/auth/password` - Changer le mot de passe
- `POST /api/auth/logout` - Déconnexion

## 📚 API Endpoints

### Utilisateurs
- `GET /api/users/profile` - Récupérer le profil
- `PUT /api/users/profile` - Mettre à jour le profil
- `GET /api/users/search` - Rechercher des utilisateurs
- `GET /api/users/:id` - Récupérer un utilisateur par ID
- `DELETE /api/users/profile` - Supprimer son compte

### Collections
- `GET /api/collections` - Mes collections
- `POST /api/collections` - Créer une collection
- `GET /api/collections/search` - Rechercher des collections publiques
- `GET /api/collections/:id` - Récupérer une collection
- `PUT /api/collections/:id` - Mettre à jour une collection
- `DELETE /api/collections/:id` - Supprimer une collection
- `POST /api/collections/:id/cards` - Ajouter une carte
- `PUT /api/collections/:id/cards/:cardId` - Modifier une carte
- `DELETE /api/collections/:id/cards/:cardId` - Supprimer une carte

### Decks
- `GET /api/decks` - Mes decks
- `POST /api/decks` - Créer un deck
- `GET /api/decks/search` - Rechercher des decks publics
- `GET /api/decks/:id` - Récupérer un deck
- `PUT /api/decks/:id` - Mettre à jour un deck
- `DELETE /api/decks/:id` - Supprimer un deck
- `POST /api/decks/:id/cards` - Ajouter une carte
- `PUT /api/decks/:id/cards/:cardId` - Modifier une carte
- `DELETE /api/decks/:id/cards/:cardId` - Supprimer une carte
- `POST /api/decks/:id/clone` - Cloner un deck

### Cartes (API Scryfall)
- `GET /api/cards/search` - Rechercher des cartes
- `GET /api/cards/:id` - Récupérer une carte par ID
- `GET /api/cards/named` - Récupérer une carte par nom
- `GET /api/cards/random` - Carte aléatoire
- `GET /api/cards/autocomplete` - Autocomplétion des noms
- `GET /api/cards/sets` - Liste des extensions
- `GET /api/cards/sets/:code` - Récupérer une extension
- `GET /api/cards/sets/:code/cards` - Cartes d'une extension
- `GET /api/cards/symbology` - Symboles de mana
- `GET /api/cards/formats` - Formats de jeu

## 🛡️ Sécurité

- Helmet.js pour les en-têtes de sécurité
- CORS configuré pour le domaine client
- Rate limiting (100 requêtes par 15 minutes)
- Validation des données avec Joi
- Hashage des mots de passe avec bcrypt
- JWT avec expiration

## 🎯 Fonctionnalités

### Gestion des utilisateurs
- Inscription/Connexion sécurisée
- Profils utilisateur avec préférences
- Recherche d'utilisateurs publics
- Gestion de la visibilité du profil

### Collections de cartes
- Création et gestion de collections personnelles
- Ajout de cartes avec condition, langue, foil
- Visibilité public/amis/privé
- Recherche et exploration des collections

### Construction de decks
- Support de tous les formats MTG
- Validation des règles par format
- Commandant pour le format Commander
- Sideboard et maybeboard
- Clonage de decks publics

### Intégration Scryfall
- Recherche avancée de cartes
- Données complètes des cartes
- Images haute qualité
- Prix et légalités
- Cache intelligent des requêtes

## 🔧 Configuration

### Variables d'environnement

| Variable | Description | Défaut |
|----------|-------------|---------|
| `NODE_ENV` | Environnement d'exécution | `development` |
| `PORT` | Port du serveur | `3000` |
| `MONGODB_URI` | URI MongoDB | `mongodb://localhost:27017/mtg-website` |
| `JWT_SECRET` | Clé secrète JWT | **Requis** |
| `JWT_EXPIRE` | Durée de vie JWT | `7d` |
| `CLIENT_URL` | URL du client | `http://localhost:5173` |

## 📝 Développement

### Scripts disponibles

```bash
npm run dev       # Développement avec nodemon
npm start         # Production
npm run lint      # ESLint
npm test          # Tests (à implémenter)
```

### Standards de code

- ESLint pour le linting
- Format de réponse standardisé :
```json
{
  "success": true|false,
  "data": {},
  "error": "message d'erreur",
  "pagination": {}
}
```

## 🚀 Production

1. Configurer les variables d'environnement
2. Installer les dépendances : `npm ci`
3. Démarrer : `npm start`

Recommandations :
- Utiliser PM2 pour la gestion des processus
- Configurer un proxy inverse (Nginx)
- Activer HTTPS
- Monitoring et logs

## 📊 Monitoring

- Route de santé : `GET /api/health`
- Logs avec Morgan
- Gestion d'erreurs centralisée
- Rate limiting avec Express Rate Limit

## 🤝 Contribution

1. Fork le projet
2. Créer une branche feature
3. Commiter les changements
4. Push sur la branche
5. Créer une Pull Request

## 📄 Licence

MIT License - voir le fichier LICENSE pour les détails.
