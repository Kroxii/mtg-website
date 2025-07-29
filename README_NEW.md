# 🃏 MTG Collection Manager

Une application web moderne pour gérer votre collection de cartes Magic: The Gathering.

## ✨ Fonctionnalités

- 🔐 **Authentification sécurisée** avec JWT
- 📊 **Dashboard interactif** avec statistiques avancées
- 🃏 **Gestion de collection** complète
- 🎨 **Interface responsive** adaptée mobile/desktop
- 🌍 **API Française** intégrée (Scryfall)
- 💰 **Prix en temps réel** via CardMarket
- 🔍 **Recherche avancée** et filtres
- 📈 **Graphiques** de croissance et répartition

## 🚀 Démarrage rapide

### Prérequis
- Node.js 18+ 
- MongoDB
- npm ou yarn

### Installation

```bash
# Cloner le projet
git clone https://github.com/Kroxii/mtg-website.git
cd mtg-website

# Installer toutes les dépendances
npm run install:all

# Configuration des variables d'environnement
cp server/.env.example server/.env
# Éditer server/.env avec vos paramètres
```

### Lancement

```bash
# Démarrer le serveur (terminal 1)
npm run server:start

# Démarrer le client (terminal 2)  
npm run dev
```

L'application sera accessible sur:
- **Client**: http://localhost:5173
- **API**: http://localhost:5000/api

## 📁 Structure du projet

```
mtg-website/
├── client/          # Frontend React + Vite
├── server/          # Backend Node.js + Express
├── docs/           # Documentation technique
├── .github/        # Configuration GitHub
└── README.md       # Ce fichier
```

## 🛠️ Scripts disponibles

```bash
npm run dev          # Démarrer le client en développement
npm run server       # Démarrer le serveur en développement  
npm run server:start # Démarrer le serveur en production
npm run build        # Build du client pour production
npm run install:all  # Installer toutes les dépendances
npm run clean        # Nettoyage léger du projet
npm run clean:deep   # Nettoyage profond + réinstall
```

## 🔐 Sécurité

L'application intègre de nombreuses mesures de sécurité:

- ✅ Authentification JWT sécurisée
- ✅ Validation stricte des données (Joi)
- ✅ Protection XSS (DOMPurify)
- ✅ Rate limiting anti brute-force
- ✅ Headers de sécurité (Helmet.js)
- ✅ Protection injection NoSQL
- ✅ Sanitisation des entrées utilisateur

Voir `SECURITY_AUDIT_FINAL.md` pour le rapport complet.

## 📊 Technologies utilisées

### Frontend
- **React 18** - Interface utilisateur
- **Vite** - Build tool moderne
- **Chart.js** - Graphiques interactifs
- **CSS Modules** - Styles modulaires

### Backend  
- **Node.js** - Runtime JavaScript
- **Express** - Framework web
- **MongoDB** - Base de données NoSQL
- **JWT** - Authentification
- **Helmet** - Sécurité
- **Joi** - Validation des données

### APIs externes
- **Scryfall API** - Données cartes MTG
- **CardMarket API** - Prix des cartes

## 🤝 Contribution

1. Fork le projet
2. Créer une branche feature (`git checkout -b feature/AmazingFeature`)
3. Commit les changements (`git commit -m 'Add AmazingFeature'`)
4. Push sur la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

## 📞 Support

- 📧 Email: support@mtg-collection.com
- 🐛 Issues: [GitHub Issues](https://github.com/Kroxii/mtg-website/issues)
- 📖 Documentation: `docs/` directory

---

Développé avec ❤️ pour la communauté Magic: The Gathering
