# Documentation des Cartes Double Face

## Vue d'ensemble
Les cartes double face (Transform, Modal Double-Faced Cards, etc.) sont automatiquement détectées et affichées avec des fonctionnalités spéciales dans l'application.

## Fonctionnalités disponibles

### 1. Détection automatique
- Les cartes double face sont automatiquement détectées via l'API Scryfall
- Un indicateur visuel ⚡ apparaît à côté du nom de la carte
- Un contour orange spécial entoure l'image de la carte

### 2. Bouton de retournement
- **Collection** : Bouton orange en forme de cercle avec icône de rotation
- **Decklists (mode grille)** : Même bouton que dans la collection
- **Decklists (mode liste)** : Badge ⚡ pour indiquer qu'il s'agit d'une carte double face

### 3. Affichage des faces
- **Face avant** : Affichage par défaut
- **Face arrière** : Accessible via le bouton de retournement
- Le nom, l'image et le type de la carte changent selon la face sélectionnée

## Types de cartes double face supportés
- Transform (ex: Delver of Secrets)
- Modal Double-Faced Cards (ex: Jace, Vryn's Prodigy)
- Double-Faced Tokens
- Art Series
- Reversible Cards

## Utilisation

### Dans la Collection
1. Sélectionnez une extension contenant des cartes double face
2. Les cartes double face afficheront un contour orange
3. Cliquez sur le bouton de rotation pour voir l'autre face
4. Le nom et l'image se mettent à jour automatiquement

### Dans les Decklists
1. **Mode grille** : Même fonctionnement que dans la collection
2. **Mode liste** : 
   - Badge ⚡ indique les cartes double face
   - Miniature de la carte affichée
   - Nom et informations de la face actuelle

## Persistance
- La face sélectionnée se remet à zéro (face avant) lors du changement de carte
- Les cartes double face conservent leur état dans les decks
- Le changement d'apparence (impression) remet automatiquement sur la face avant

## Exemples de cartes double face populaires
- Delver of Secrets / Insectile Aberration
- Jace, Vryn's Prodigy / Jace, Telepath Unbound
- Huntmaster of the Fells / Ravager of the Fells
- Bloodline Keeper / Lord of Lineage
