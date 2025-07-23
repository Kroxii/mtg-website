# MTG Website - Guide de démarrage rapide

## Configuration et démarrage

### Prérequis
- Node.js (version 18 ou supérieure)
- npm

### Installation
1. Installer toutes les dépendances :
```bash
npm run install:all
```

### Démarrage en mode développement

#### Option 1 : Démarrage manuel (recommandé)
1. **Démarrer le serveur** (Terminal 1) :
```bash
cd server
npm run dev
```
Le serveur démarrera sur `http://localhost:3001`

2. **Démarrer le client** (Terminal 2) :
```bash
cd client
npm run dev
```
Le client démarrera sur `http://localhost:5173`

#### Option 2 : Démarrage direct
```bash
# Terminal 1 - Serveur
npm run server:start

# Terminal 2 - Client  
npm run dev
```

### Configuration

#### Serveur
Le fichier `.env` dans le dossier `server/` contient la configuration :
- `PORT=3001` : Port du serveur
- `CLIENT_URL=http://localhost:5173` : URL du client pour CORS
- `JWT_SECRET` : Clé secrète pour les tokens JWT

#### Client
Le client utilise un proxy Vite configuré pour rediriger les appels `/api` vers `http://localhost:3001`

### URLs importantes
- **Client** : http://localhost:5173
- **Serveur** : http://localhost:3001
- **API Health Check** : http://localhost:3001/api/health

### Statut de la connexion
Une fois les deux serveurs démarrés, rendez-vous sur http://localhost:5173 pour voir l'état de la connexion serveur-client en haut de la page.

### Base de données
Le projet est configuré pour utiliser MongoDB. Si MongoDB n'est pas disponible, le serveur continuera à fonctionner avec un système de fichiers simple.

### Dépannage

#### Port déjà utilisé
Si le port 3001 ou 5173 est déjà utilisé :
1. Changez le port dans `server/.env` pour le serveur
2. Mettez à jour le proxy dans `client/vite.config.js`

#### Erreur de connexion
1. Vérifiez que les deux serveurs sont démarrés
2. Vérifiez les ports dans la configuration
3. Consultez les logs dans les terminaux

### Structure du projet
```
mtg-website/
├── client/          # Application React (Vite)
│   ├── src/
│   ├── package.json
│   └── vite.config.js
├── server/          # API Node.js (Express)
│   ├── src/
│   ├── .env
│   ├── package.json
│   └── server.js
└── package.json     # Scripts globaux
```
