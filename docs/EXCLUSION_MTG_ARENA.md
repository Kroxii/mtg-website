# Exclusion des cartes MTG Arena

## Description
Le système exclut automatiquement les cartes spécifiquement conçues pour MTG Arena qui ne sont pas disponibles physiquement.

## Fonctionnalité
- Filtre automatique des cartes digitales uniquement
- Exclusion des extensions MTG Arena 
- Vérification au niveau client et serveur

## Critères d'exclusion
Une carte est considérée comme MTG Arena si :
- `digital === true`
- `set === 'arena'`
- Le nom de l'extension contient "arena"
- La carte n'est disponible que sur MTG Arena (`games.includes('arena') && games.length === 1`)

## Implémentation
- Filtres dans les requêtes API Scryfall (`-is:digital -set:arena`)
- Fonction utilitaire `isArenaCard()` pour vérification côté client
- Filtre appliqué à toutes les fonctions de recherche et récupération

## Avantages
- Collection plus authentique (cartes physiques uniquement)
- Meilleure expérience utilisateur
- Cohérence avec les decks physiques
- Évite la confusion entre cartes physiques et digitales

## Fonctions affectées
- `searchCards()` - Recherche de cartes
- `getCardPrintings()` - Impressions d'une carte
- `getCardsFromSet()` - Cartes d'une extension
- `getSetsSorted()` - Extensions triées
- `getSets()` - Toutes les extensions
- `processSearchResults()` - Traitement des résultats
