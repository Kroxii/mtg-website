# 🛠️ GUIDE DE MAINTENANCE - MTG Collection Manager

## 🧹 Nettoyage du projet

### Commandes de nettoyage

```bash
# Nettoyage léger (cache, logs, fichiers temporaires)
npm run clean

# Nettoyage profond (+ réinstallation des dépendances)
npm run clean:deep
```

### Fichiers automatiquement ignorés

Le `.gitignore` est configuré pour ignorer automatiquement :
- Fichiers de test (`test-*.js`, `*-test.js`)
- Rapports de développement (`BUGFIX_REPORT.md`, etc.)
- Caches (`.vite`, `.cache`)
- Dossiers temporaires (`temp/`, `tmp/`)
- Fichiers de sauvegarde (`*.bak`, `*copy/`)

## 📦 Gestion des dépendances

### Mise à jour des dépendances

```bash
# Vérifier les dépendances obsolètes
npm outdated
cd client && npm outdated
cd ../server && npm outdated

# Mettre à jour (attention aux breaking changes)
npm update
cd client && npm update
cd ../server && npm update
```

### Audit de sécurité

```bash
# Audit de sécurité complet
npm audit
cd client && npm audit
cd ../server && npm audit

# Correction automatique (à utiliser avec prudence)
npm audit fix
```

## 🔐 Maintenance de sécurité

### Tests de sécurité périodiques

Les scripts de test de sécurité ont été supprimés du projet de production, mais peuvent être recréés si nécessaire :

```bash
# Réexécuter l'audit de sécurité
# Récréer test-security-final.js depuis SECURITY_AUDIT_FINAL.md
```

### Checklist mensuelle

- [ ] Mise à jour des dépendances
- [ ] Audit de sécurité npm
- [ ] Vérification des logs d'erreur
- [ ] Test de l'application complète
- [ ] Backup de la base de données
- [ ] Vérification des certificats SSL (production)

## 📊 Monitoring

### Métriques à surveiller

1. **Performance**
   - Temps de réponse API < 500ms
   - Temps de chargement client < 3s
   - Utilisation mémoire serveur

2. **Sécurité**
   - Tentatives de connexion échouées
   - Requêtes bloquées par rate limiting
   - Erreurs d'authentification

3. **Fonctionnel**
   - Taux d'erreur < 1%
   - Disponibilité > 99.5%
   - Succès des opérations CRUD

### Logs à vérifier

```bash
# Logs serveur
cd server && npm run logs

# Logs système (production)
tail -f /var/log/mtg-app.log
```

## 🚀 Déploiement

### Checklist pré-déploiement

- [ ] Tests passent (frontend + backend)
- [ ] Build de production réussi
- [ ] Variables d'environnement configurées
- [ ] Base de données migrée si nécessaire
- [ ] Certificats SSL valides
- [ ] Backup créé

### Commandes de déploiement

```bash
# Build de production
npm run build

# Test du build
npm run preview

# Déploiement (selon votre infrastructure)
# Exemple avec PM2
pm2 start ecosystem.config.js --env production
pm2 reload all
```

## 🔄 Rollback

### Procédure de rollback

```bash
# Arrêter l'application
pm2 stop all

# Restaurer la version précédente
git checkout <previous-commit>
npm run install:all
npm run build

# Restaurer la base de données si nécessaire
mongorestore --db mtg_collection backup_<date>/

# Redémarrer
pm2 start all
```

## 📋 Maintenance préventive

### Hebdomadaire
- Vérification des logs d'erreur
- Monitoring des performances
- Backup base de données

### Mensuelle  
- Mise à jour des dépendances non-critiques
- Audit de sécurité complet
- Nettoyage des fichiers temporaires
- Test de la procédure de rollback

### Trimestrielle
- Audit de sécurité externe
- Mise à jour majeure des dépendances
- Revue de la configuration de sécurité
- Test de récupération après sinistre

## 🆘 Dépannage

### Problèmes courants

**Serveur ne démarre pas**
```bash
# Vérifier les ports
netstat -ano | findstr :5000
# Vérifier MongoDB
mongosh --eval "db.runCommand('ping')"
```

**Frontend ne se connecte pas au backend**
```bash
# Vérifier CORS dans server.js
# Vérifier CLIENT_URL dans .env
# Vérifier les URLs dans le frontend
```

**Erreurs de base de données**
```bash
# Vérifier la connexion MongoDB
# Vérifier les collections et indexes
# Restaurer depuis backup si nécessaire
```

### Contacts d'urgence

- **Développeur principal** : [contact]
- **Support technique** : support@mtg-collection.com
- **Hébergement** : [contact hébergeur]

---

*Guide maintenu à jour avec chaque release majeure*
