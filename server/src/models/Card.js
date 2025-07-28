import mongoose from 'mongoose';

const cardSchema = new mongoose.Schema({
  // ID Scryfall de la carte
  scryfallId: {
    type: String,
    required: true
  },
  // Informations de base
  name: {
    type: String,
    required: true
  },
  printedName: String,
  typeLine: String,
  oracleText: String,
  manaCost: String,
  cmc: Number,
  
  // Informations sur l'extension
  setCode: String,
  setName: String,
  collectorNumber: String,
  rarity: String,
  
  // Images
  imageUris: {
    small: String,
    normal: String,
    large: String,
    artCrop: String
  },
  
  // Cartes double face
  cardFaces: [{
    name: String,
    typeLine: String,
    oracleText: String,
    manaCost: String,
    imageUris: {
      small: String,
      normal: String,
      large: String
    }
  }],
  
  // Métadonnées
  layout: String,
  colors: [String],
  colorIdentity: [String],
  keywords: [String],
  
  // Prix et légalité
  prices: {
    eur: String,
    eurFoil: String,
    usd: String,
    usdFoil: String
  },
  
  legalities: {
    standard: String,
    modern: String,
    legacy: String,
    vintage: String,
    commander: String,
    brawl: String,
    historic: String,
    pioneer: String,
    pauper: String
  },
  
  // Informations de cache
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index pour améliorer les performances de recherche
cardSchema.index({ scryfallId: 1 });
cardSchema.index({ name: 1 });
cardSchema.index({ setCode: 1 });
cardSchema.index({ colors: 1 });
cardSchema.index({ typeLine: 1 });
cardSchema.index({ 'legalities.commander': 1 });

const Card = mongoose.model('Card', cardSchema);

export default Card;
