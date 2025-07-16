# Magic: The Gathering Collection Manager

Une application React moderne pour cataloguer votre collection de cartes Magic: The Gathering et gérer vos deck lists.

## ✨ Fonctionnalités

- **🏠 Page d'accueil attractive** : Interface moderne avec accès rapide aux fonctionnalités
- **📊 Statistiques en temps réel** : Suivi de votre collection et de vos decks
- **📚 Catalogage par extension** : Organisez votre collection par extension Magic
- **🔍 Recherche avancée** : Trouvez facilement les cartes dans votre collection
- **🗂️ Tri personnalisable** : Triez les extensions par date ou alphabétiquement
- **🃏 Visuels des cartes** : Affichage des images des cartes via l'API Scryfall
- **🇫🇷 Noms français** : Support complet des noms de cartes en français avec fallback automatique
- **📋 Gestion des deck lists** : Créez et gérez vos decks sur une page dédiée
- **�️ Menu contextuel** : Options avancées pour chaque carte (retourner, foil, quantité, supprimer, CardMarket)
- **✨ Support foil** : Basculez entre versions normales et foil avec effet visuel
- **�🎮 Formats supportés** : Commander, Duel Commander, Standard, Pionnier, Modern, Legacy, Vintage, Pauper
- **⚖️ Validation des decks** : Vérification automatique des banlists par format
- **🎨 Sélection d'apparence** : Choisissez l'apparence des cartes parmi toutes leurs impressions
- **⚡ Support des cartes double face** : Détection automatique avec bouton de retournement et indicateurs visuels
- **👁️ Deux modes d'affichage** : Vue grille (6 cartes par ligne) et vue liste compacte
- **💰 Prix CardMarket** : Affichage des prix moyens avec redirection vers CardMarket
- **📱 Design responsive** : Interface adaptée mobile et desktop

## 🚀 Technologies utilisées

- **React 18** avec Vite pour de meilleures performances
- **React Router** pour la navigation
- **Axios** pour les appels API
- **Lucide React** pour les icônes
- **API Scryfall** pour les données des cartes
- **LocalStorage** pour la persistance des données
- **CSS moderne** avec Flexbox/Grid

## 📖 Utilisation

### Page d'Accueil
- **Vue d'ensemble** : Découvrez toutes les fonctionnalités
- **Statistiques** : Consultez vos statistiques de collection en temps réel
- **Accès rapide** : Boutons directs vers Collection et Deck Lists

### Collection
1. Sélectionnez une extension dans la liste déroulante
2. Parcourez les cartes de l'extension
3. Utilisez les boutons + et - pour ajouter/retirer des cartes
4. Cliquez sur "CardMarket" pour voir les prix et acheter la carte

### Deck Lists
1. **Création** : Cliquez sur "Nouveau Deck" et choisissez le format
2. **Sélection** : Cliquez sur un deck dans la barre latérale
3. **Ajout de cartes** : Recherchez et ajoutez des cartes (vérification des banlists)
4. **Gestion des quantités** : Ajustez les quantités avec les boutons +/-
5. **Changement d'apparence** : Cliquez sur l'icône d'image pour changer l'apparence
6. **Modes d'affichage** : Basculez entre vue grille (6 cartes/ligne) et vue liste
7. **Validation** : Vérifiez automatiquement les cartes bannies et les règles du format


## 🌐 APIs utilisées

- **Scryfall API** : Récupération des données et images des cartes

## 📁 Structure du projet

```
src/
├── components/          # Composants réutilisables
│   ├── Navigation.jsx   # Navigation principale
│   └── CardItem.jsx     # Composant carte
├── pages/               # Pages principales
│   ├── Home.jsx         # Page d'accueil
│   ├── Collection.jsx   # Page collection
│   └── DeckLists.jsx    # Page deck lists
├── utils/               # Utilitaires
│   ├── api.js          # Configuration API
│   └── banlists.js     # Gestion des formats et banlists
├── App.jsx             # Composant principal
├── App.css             # Styles principaux
├── index.css           # Styles globaux
└── main.jsx            # Point d'entrée

```

## 🎨 Design

L'interface utilise un design moderne avec :
- Palette de couleurs cohérente
- Animations fluides
- Interface responsive
- Composants réutilisables

## 📝 Développement

Le projet suit les meilleures pratiques React :
- Composants fonctionnels avec hooks
- Gestion d'état locale avec useState
- Effet de bord avec useEffect
- Persistance avec localStorage
- Séparation des responsabilités

## 🤝 Contribution

Les contributions sont les bienvenues ! N'hésitez pas à :
1. Fork le projet
2. Créer une branche pour votre feature
3. Commit vos changements
4. Pousser vers la branche
5. Ouvrir une Pull Request
