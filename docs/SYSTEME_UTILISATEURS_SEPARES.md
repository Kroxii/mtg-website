# Système de Collections et Decklists Séparées par Utilisateur

## Vue d'ensemble du système mis en place

Ce système permet à chaque utilisateur d'avoir ses propres collections et decklists complètement séparées des autres utilisateurs. Chaque compte créé sur le site aura accès uniquement à ses propres données.

## Architecture

### Côté Serveur (Backend)

#### Modèles de données
- **User** : Gère les utilisateurs avec authentification JWT
- **Collection** : Collections de cartes liées à un utilisateur spécifique (`owner`)
- **Deck** : Decklists liées à un utilisateur spécifique (`owner`)
- **Card** : Données des cartes Magic (partagées entre tous les utilisateurs)

#### Contrôleurs
- **authController.js** : Gestion de l'authentification (login, register, profil)
- **collectionController.js** : CRUD pour les collections utilisateur
- **deckController.js** : CRUD pour les decklists utilisateur

#### Routes sécurisées
- `/api/auth/*` : Authentification
- `/api/collections/*` : Collections (privées, nécessitent authentification)
- `/api/decks/*` : Decklists (privées, nécessitent authentification)

#### Middleware d'authentification
- Vérification JWT pour toutes les routes privées
- Association automatique avec l'utilisateur connecté

### Côté Client (Frontend)

#### Services API
- **backendApi.js** : Service centralisant les appels API avec gestion automatique des tokens
- **authService** : Gestion de l'authentification
- **collectionService** : Gestion des collections
- **deckService** : Gestion des decklists

#### Hooks React
- **useAuth** : Hook pour gérer l'état d'authentification global

#### Pages mises à jour
- **Collection.jsx** : Utilise l'API backend pour charger les collections de l'utilisateur
- **DeckLists.jsx** : Utilise l'API backend pour charger les decklists de l'utilisateur

## Fonctionnalités par utilisateur

### Collections
- Chaque utilisateur peut créer plusieurs collections
- Collections privées par défaut (peuvent être rendues publiques)
- Ajout/suppression de cartes avec quantités, conditions, langues
- Statistiques automatiques (nombre de cartes, cartes uniques)

### Decklists
- Création de decks dans différents formats (Commander, Modern, etc.)
- Gestion du mainboard, sideboard, et commandant
- Validation automatique selon les règles du format
- Decks privés par défaut (peuvent être rendus publics)

### Authentification
- Inscription et connexion sécurisées
- Tokens JWT avec expiration
- Gestion du profil utilisateur
- Déconnexion sécurisée

## Installation et démarrage

### Prérequis
- Node.js
- MongoDB (optionnel, le système peut fonctionner avec un fallback fichier)

### Démarrage du serveur
```bash
cd server
npm install
npm run server:start
```

### Démarrage du client
```bash
cd client
npm install
npm run dev
```

## Structure des données

### Utilisateur
```javascript
{
  "_id": "ObjectId",
  "nom": "Nom",
  "prenom": "Prénom", 
  "email": "email@example.com",
  "password": "hash",
  "dateCreation": "Date",
  "statut": "actif"
}
```

### Collection
```javascript
{
  "_id": "ObjectId",
  "owner": "ObjectId(User)",
  "name": "Ma Collection",
  "description": "Description",
  "isPublic": false,
  "cards": [
    {
      "card": "ObjectId(Card)",
      "quantity": 2,
      "condition": "near_mint",
      "language": "fr",
      "foil": false
    }
  ],
  "totalCards": 10,
  "dateCreation": "Date"
}
```

### Deck
```javascript
{
  "_id": "ObjectId", 
  "owner": "ObjectId(User)",
  "name": "Mon Deck Commander",
  "format": "commander",
  "description": "Description",
  "isPublic": false,
  "commander": "ObjectId(Card)",
  "cards": [
    {
      "card": "ObjectId(Card)",
      "quantity": 1,
      "isSideboard": false,
      "isCommander": false
    }
  ],
  "mainboardCount": 99,
  "sideboardCount": 0,
  "dateCreation": "Date"
}
```

## Sécurité

- **Authentification JWT** : Tous les appels API privés nécessitent un token valide
- **Autorisation** : Les utilisateurs ne peuvent accéder qu'à leurs propres données
- **Validation** : Validation des données côté serveur et client
- **CORS** : Configuration sécurisée pour les appels cross-origin
- **Rate limiting** : Protection contre les attaques par déni de service

## Points clés du système

1. **Isolation des données** : Chaque utilisateur voit uniquement ses propres collections et decklists
2. **Évolutivité** : Le système peut gérer un nombre illimité d'utilisateurs
3. **Performance** : Index MongoDB optimisés pour les requêtes fréquentes
4. **Flexibilité** : Support de plusieurs collections et decklists par utilisateur
5. **Sécurité** : Authentification robuste et validation des permissions

## Tests recommandés

1. Créer plusieurs comptes utilisateur
2. Vérifier que chaque utilisateur ne voit que ses propres données
3. Tester l'ajout/suppression de cartes dans les collections
4. Tester la création/modification de decklists
5. Vérifier la déconnexion et reconnexion

Ce système garantit que chaque utilisateur a un espace privé et sécurisé pour gérer ses collections et decklists Magic: The Gathering.
