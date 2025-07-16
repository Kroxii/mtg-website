# Système d'Authentification - Magic Collection Manager

## Vue d'ensemble

Le système d'authentification a été intégré avec succès dans l'application Magic Collection Manager. Il permet aux utilisateurs de créer un compte, se connecter et gérer leur profil.

## Fonctionnalités implémentées

### 1. Création de compte (/register)
- Formulaire avec validation en temps réel
- Champs requis : nom, prénom, email, mot de passe
- Validation de l'email et de la robustesse du mot de passe
- Vérification de l'unicité de l'email
- Connexion automatique après inscription

### 2. Connexion (/login)
- Formulaire de connexion avec email et mot de passe
- Validation des identifiants
- Gestion des erreurs d'authentification
- Redirection automatique après connexion

### 3. Profil utilisateur (/profile)
- Affichage des informations de l'utilisateur
- Statistiques du compte (date de création, nombre de cartes, etc.)
- Option de déconnexion

### 4. Protection des routes
- Les pages Collection et Deck Lists nécessitent une authentification
- Redirection automatique vers la page de connexion si non connecté
- Les utilisateurs connectés sont redirigés depuis les pages d'auth

## Composants créés

### Hooks
- `src/hooks/useAuth.js` : Contexte et hooks d'authentification

### Pages
- `src/pages/Login.jsx` : Page de connexion
- `src/pages/Register.jsx` : Page d'inscription
- `src/pages/Profile.jsx` : Page de profil utilisateur

### Styles
- `src/components/Auth.css` : Styles pour l'authentification
- Styles additionnels dans `src/App.css` pour la navigation

## Fonctionnement technique

### Stockage des données
Les données utilisateur sont stockées dans le localStorage du navigateur :
- `mtg_users` : Tableau de tous les utilisateurs inscrits
- `mtg_user` : Informations de l'utilisateur actuellement connecté

### Contexte d'authentification
Le `AuthProvider` fournit les fonctions suivantes :
- `login(email, password)` : Connexion d'un utilisateur
- `register(userData)` : Inscription d'un nouvel utilisateur
- `logout()` : Déconnexion de l'utilisateur
- `user` : Objet de l'utilisateur connecté
- `isAuthenticated` : Booléen indiquant l'état de connexion
- `loading` : Booléen pour l'état de chargement

### Navigation adaptative
La barre de navigation s'adapte selon l'état d'authentification :
- **Non connecté** : Boutons "Connexion" et "Créer un compte"
- **Connecté** : Menu utilisateur avec nom et options (Profil, Déconnexion)

## Sécurité

### Points implémentés
- Validation côté client des formulaires
- Vérification de l'unicité des emails
- Politique de mot de passe (minimum 6 caractères)
- Protection des routes sensibles

### Améliorations possibles pour la production
- Hachage des mots de passe (bcrypt)
- Authentification côté serveur avec JWT
- Limitation des tentatives de connexion
- Validation côté serveur
- Utilisation d'une base de données sécurisée

## Utilisation

### Pour tester le système
1. Ouvrez l'application : http://localhost:5174
2. Cliquez sur "Créer un compte" dans la navigation
3. Remplissez le formulaire d'inscription
4. Vous serez automatiquement connecté
5. Explorez les fonctionnalités protégées (Collection, Deck Lists)
6. Testez la déconnexion depuis le menu utilisateur

### Exemple de compte de test
Vous pouvez créer un compte avec ces informations :
- Nom : Dupont
- Prénom : Jean
- Email : jean.dupont@example.com
- Mot de passe : motdepasse123

## Structure de données utilisateur

```javascript
{
  id: "1642680000000", // Timestamp de création
  nom: "Dupont",
  prenom: "Jean",
  email: "jean.dupont@example.com",
  password: "motdepasse123", // En production : hash
  dateCreation: "2024-01-20T10:00:00.000Z",
  collection: [], // Cartes de la collection
  deckLists: [] // Decks créés
}
```

## Intégration avec les fonctionnalités existantes

Le système d'authentification est prêt à être intégré avec :
- La gestion de collection personnalisée par utilisateur
- Les deck lists privées
- Les préférences utilisateur
- Les statistiques de collection

## Prochaines étapes suggérées

1. Connecter la collection aux données utilisateur
2. Implémenter la sauvegarde des deck lists par utilisateur
3. Ajouter des préférences utilisateur
4. Implémenter un système de récupération de mot de passe
5. Migrer vers une authentification serveur pour la production
