# Guide API Française - Scryfall

## Vue d'ensemble
L'application a été configurée pour privilégier systématiquement les noms et visuels de cartes en français via l'API Scryfall.

## Configuration API

### Instances Axios
- **scryfallApi** : Instance principale avec paramètres français par défaut
- **scryfallApiGeneral** : Instance pour les appels généraux (extensions, metadata)

### Paramètres par défaut
```javascript
const FRENCH_API_CONFIG = {
  lang: 'fr',
  include_multilingual: false
};
```

## Fonctions utilitaires

### Affichage des noms
- **getCardDisplayName()** : Priorité au nom français imprimé
- **getCardFaceName()** : Noms français pour cartes double face
- **hasCardFrenchName()** : Vérifie la disponibilité du français

### Hiérarchie des noms
1. **printed_name** : Nom français imprimé sur la carte
2. **name_fr** : Nom français de la base de données
3. **name** : Nom anglais (fallback)

### Hiérarchie des types
1. **printed_type_line** : Type français imprimé
2. **type_line_fr** : Type français de la base de données
3. **type_line** : Type anglais (fallback)

## Appels API spécifiques

### Recherche de cartes
```javascript
// Automatiquement en français
const result = await apiUtils.searchCards('Lightning Bolt');
```

### Cartes d'une extension
```javascript
// Retourne les cartes françaises de l'extension
const cards = await apiUtils.getCardsFromSet('dom');
```

### Impressions d'une carte
```javascript
// Toutes les impressions françaises
const printings = await apiUtils.getCardPrintings('Lightning Bolt');
```

## Gestion des cartes double face

### Noms par face
- Face avant : `card.card_faces[0].printed_name`
- Face arrière : `card.card_faces[1].printed_name`
- Fallback automatique vers l'anglais si nécessaire

### Types par face
- Types français prioritaires sur chaque face
- Fallback automatique vers l'anglais

## Filtrage et validation

### Cartes avec noms français
```javascript
const frenchCards = filterCardsWithFrenchNames(allCards);
```

### Validation des noms
```javascript
const hasFrench = hasCardFrenchName(card);
```

## Avantages de cette approche

### 🇫🇷 **Expérience française**
- Noms de cartes en français par défaut
- Types et sous-types traduits
- Cohérence linguistique

### 🔄 **Fallback automatique**
- Pas de cartes manquantes
- Dégradation gracieuse vers l'anglais
- Toujours un nom d'affichage

### ⚡ **Performance**
- Paramètres par défaut optimisés
- Moins de requêtes API
- Cache automatique

## Cas spéciaux

### Cartes sans traduction
- Les cartes très récentes peuvent ne pas avoir de traduction
- Fallback automatique vers l'anglais
- Log en développement pour identification

### Extensions non traduites
- Certaines extensions spéciales restent en anglais
- Produits uniquement en anglais (ex: certains Masters)
- Gestion transparente pour l'utilisateur

### Cartes double face
- Chaque face peut avoir sa propre traduction
- Gestion indépendante des noms par face
- Cohérence maintenue lors du retournement

## Test et validation

### Tests en développement
```javascript
// Dans la console développeur
testFrenchAPI(); // Test général
testDoubleFacedCards(); // Test cartes double face
```

### Vérification manuelle
1. Ouvrir la console développeur
2. Vérifier les logs d'API
3. Confirmer les paramètres `lang=fr`

## Bonnes pratiques

### Utilisation des fonctions utilitaires
- **Toujours** utiliser `getCardDisplayName()` pour l'affichage
- **Toujours** utiliser `getCardDisplayType()` pour les types
- **Éviter** l'accès direct aux propriétés `name` et `type_line`

### Gestion des erreurs
- Fallback automatique intégré
- Logs informatifs en développement
- Expérience utilisateur préservée

### Performance
- Instance API réutilisée
- Paramètres par défaut optimisés
- Pas de requêtes supplémentaires

## Résultat pour l'utilisateur

✅ **Noms français** : Toutes les cartes affichent leur nom français quand disponible
✅ **Types français** : Types de créatures et sorts traduits
✅ **Cartes double face** : Chaque face en français
✅ **Cohérence** : Expérience entièrement française
✅ **Fiabilité** : Pas de cartes manquantes grâce au fallback

L'application garantit maintenant une expérience entièrement française tout en maintenant la compatibilité avec toutes les cartes Magic existantes !
