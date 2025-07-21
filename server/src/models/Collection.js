import mongoose from 'mongoose';

const collectionItemSchema = new mongoose.Schema({
  card: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Card',
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
    default: 1
  },
  condition: {
    type: String,
    enum: ['mint', 'near_mint', 'excellent', 'good', 'light_played', 'played', 'poor'],
    default: 'near_mint'
  },
  language: {
    type: String,
    enum: ['fr', 'en', 'de', 'es', 'it', 'ja', 'ko', 'pt', 'ru', 'zh'],
    default: 'fr'
  },
  foil: {
    type: Boolean,
    default: false
  },
  signed: {
    type: Boolean,
    default: false
  },
  altered: {
    type: Boolean,
    default: false
  },
  priceAcquired: {
    type: Number,
    min: 0
  },
  dateAcquired: {
    type: Date,
    default: Date.now
  },
  notes: String
});

const collectionSchema = new mongoose.Schema({
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true,
    default: 'Ma Collection'
  },
  description: String,
  isPublic: {
    type: Boolean,
    default: false
  },
  cards: [collectionItemSchema],
  
  // Statistiques calculées
  totalCards: {
    type: Number,
    default: 0
  },
  totalValue: {
    type: Number,
    default: 0
  },
  
  // Métadonnées
  dateCreation: {
    type: Date,
    default: Date.now
  },
  derniereModification: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index pour améliorer les performances
collectionSchema.index({ owner: 1 });
collectionSchema.index({ 'cards.card': 1 });
collectionSchema.index({ isPublic: 1 });

// Middleware pour calculer les statistiques
collectionSchema.pre('save', function(next) {
  this.totalCards = this.cards.reduce((total, item) => total + item.quantity, 0);
  this.derniereModification = new Date();
  next();
});

// Méthodes d'instance
collectionSchema.methods.addCard = function(cardData) {
  const existingIndex = this.cards.findIndex(item => 
    item.card.toString() === cardData.card.toString() &&
    item.condition === cardData.condition &&
    item.language === cardData.language &&
    item.foil === cardData.foil
  );
  
  if (existingIndex >= 0) {
    this.cards[existingIndex].quantity += cardData.quantity || 1;
  } else {
    this.cards.push(cardData);
  }
  
  return this.save();
};

collectionSchema.methods.removeCard = function(cardId, options = {}) {
  const index = this.cards.findIndex(item => {
    let match = item.card.toString() === cardId.toString();
    
    if (options.condition) match = match && item.condition === options.condition;
    if (options.language) match = match && item.language === options.language;
    if (options.foil !== undefined) match = match && item.foil === options.foil;
    
    return match;
  });
  
  if (index >= 0) {
    if (options.quantity && this.cards[index].quantity > options.quantity) {
      this.cards[index].quantity -= options.quantity;
    } else {
      this.cards.splice(index, 1);
    }
  }
  
  return this.save();
};

const Collection = mongoose.model('Collection', collectionSchema);

export default Collection;
