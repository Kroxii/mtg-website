# Guide d'utilisation - Menu Contextuel des Cartes

## Vue d'ensemble
Le menu contextuel offre des options avancées pour gérer vos cartes dans les decklists avec un accès rapide à toutes les fonctionnalités.

## Comment accéder au menu contextuel

### Dans les Decklists (Mode Grille)
1. Passez votre souris sur une carte dans votre deck
2. Cliquez sur le bouton **⋮** (trois points verticaux) en haut à droite de la carte
3. Le menu contextuel s'ouvre avec toutes les options disponibles

### Fermer le menu
- Cliquez sur le **X** en haut à droite du menu
- Cliquez en dehors du menu
- Sélectionnez une option (fermeture automatique)

## Options disponibles

### 🔄 Retourner la carte
- **Disponible pour** : Cartes double face uniquement
- **Fonction** : Affiche l'autre face de la carte (transform, modal DFC, etc.)
- **Persistance** : L'état de la face est sauvegardé localement

### ✨ Version foil
- **Fonction** : Bascule entre version normale et foil
- **Effet visuel** : Ajoute un effet de brillance animé sur l'image
- **Indicateur** : Icône ✨ à côté du nom de la carte
- **Persistance** : L'état foil est sauvegardé pour chaque carte

### 🔢 Changer la quantité
- **Interface** : Champ de saisie numérique avec bouton de validation
- **Limites** : Entre 0 et 99 exemplaires
- **Validation** : Appuyez sur ✓ ou Entrée pour confirmer
- **Suppression** : Mettre 0 supprime la carte du deck

### 🗑️ Supprimer du deck
- **Fonction** : Retire complètement la carte du deck
- **Confirmation** : Action immédiate (pas de confirmation)
- **Couleur** : Texte rouge pour indiquer l'action destructive

### 🔗 Voir sur CardMarket
- **Fonction** : Ouvre CardMarket dans un nouvel onglet
- **URL** : Lien direct vers la carte sur CardMarket
- **Recherche** : Utilise le nom exact et l'extension de la carte

## Indicateurs visuels

### Dans le nom de la carte
- **⚡** = Carte double face
- **✨** = Version foil
- **⚠️** = Carte bannie dans le format

### Sur l'image
- **Contour orange** = Carte double face
- **Effet de brillance** = Version foil active
- **Animation** = Effet foil en cours

## Mode Liste
En mode liste, les indicateurs visuels (⚡, ✨, ⚠️) apparaissent directement à côté du nom de la carte, mais le menu contextuel n'est disponible qu'en mode grille.

## Conseils d'utilisation

### Gestion rapide
- Utilisez le menu contextuel pour les modifications importantes
- Utilisez les boutons +/- pour les ajustements rapides de quantité
- Le menu se ferme automatiquement après chaque action

### Versions foil
- L'effet foil est purement visuel et n'affecte pas les statistiques
- Toutes les cartes peuvent être mises en foil (effet simulé)
- L'état foil est indépendant pour chaque carte

### Cartes double face
- Le retournement via le menu a le même effet que le bouton direct
- La face affichée est sauvegardée pour chaque carte individuellement
- Changement d'apparence remet automatiquement sur la face avant

## Persistance des données
Toutes les modifications (quantités, états foil, faces) sont automatiquement sauvegardées dans le localStorage de votre navigateur.

## Dépannage

### Le menu ne s'ouvre pas
- Vérifiez que vous êtes en mode grille
- Assurez-vous de cliquer sur le bouton ⋮ et non sur la carte

### Les modifications ne sont pas sauvegardées
- Vérifiez que JavaScript est activé
- Effacez le cache du navigateur si nécessaire

### Problème d'affichage
- Actualisez la page
- Vérifiez que vous utilisez un navigateur moderne
