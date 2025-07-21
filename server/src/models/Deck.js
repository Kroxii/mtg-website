import mongoose from 'mongoose';

const deckCardSchema = new mongoose.Schema({
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
  isSideboard: {
    type: Boolean,
    default: false
  },
  isCommander: {
    type: Boolean,
    default: false
  },
  // Métadonnées pour l'affichage
  foil: {
    type: Boolean,
    default: false
  },
  condition: {
    type: String,
    enum: ['mint', 'near_mint', 'excellent', 'good', 'light_played', 'played', 'poor'],
    default: 'near_mint'
  }
});

const deckSchema = new mongoose.Schema({
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  description: {
    type: String,
    maxlength: 1000
  },
  format: {
    type: String,
    required: true,
    enum: ['standard', 'modern', 'legacy', 'vintage', 'commander', 'brawl', 'historic', 'pioneer', 'pauper', 'casual']
  },
  
  // Cartes du deck
  cards: [deckCardSchema],
  
  // Commander (pour le format Commander)
  commander: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Card'
  },
  
  // Métadonnées
  isPublic: {
    type: Boolean,
    default: false
  },
  colors: [String], // Couleurs du deck
  tags: [String],
  
  // Statistiques
  mainboardCount: {
    type: Number,
    default: 0
  },
  sideboardCount: {
    type: Number,
    default: 0
  },
  averageCmc: {
    type: Number,
    default: 0
  },
  
  // Dates
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

// Index
deckSchema.index({ owner: 1 });
deckSchema.index({ format: 1 });
deckSchema.index({ isPublic: 1 });
deckSchema.index({ colors: 1 });
deckSchema.index({ tags: 1 });

// Middleware pour calculer les statistiques
deckSchema.pre('save', function(next) {
  const mainboardCards = this.cards.filter(card => !card.isSideboard && !card.isCommander);
  const sideboardCards = this.cards.filter(card => card.isSideboard);
  
  this.mainboardCount = mainboardCards.reduce((total, card) => total + card.quantity, 0);
  this.sideboardCount = sideboardCards.reduce((total, card) => total + card.quantity, 0);
  
  this.derniereModification = new Date();
  next();
});

// Méthodes d'instance
deckSchema.methods.addCard = function(cardData) {
  const existingIndex = this.cards.findIndex(item => 
    item.card.toString() === cardData.card.toString() &&
    item.isSideboard === (cardData.isSideboard || false) &&
    item.isCommander === (cardData.isCommander || false)
  );
  
  if (existingIndex >= 0) {
    this.cards[existingIndex].quantity += cardData.quantity || 1;
  } else {
    this.cards.push(cardData);
  }
  
  return this.save();
};

deckSchema.methods.removeCard = function(cardId, options = {}) {
  const index = this.cards.findIndex(item => {
    let match = item.card.toString() === cardId.toString();
    
    if (options.isSideboard !== undefined) match = match && item.isSideboard === options.isSideboard;
    if (options.isCommander !== undefined) match = match && item.isCommander === options.isCommander;
    
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

deckSchema.methods.setCommander = function(cardId) {
  // Retirer l'ancien commandant
  this.cards = this.cards.filter(card => !card.isCommander);
  
  // Définir le nouveau commandant
  if (cardId) {
    this.commander = cardId;
    this.cards.push({
      card: cardId,
      quantity: 1,
      isCommander: true,
      isSideboard: false
    });
  } else {
    this.commander = null;
  }
  
  return this.save();
};

// Validation pour le format Commander
deckSchema.pre('validate', function(next) {
  if (this.format === 'commander') {
    const commanderCards = this.cards.filter(card => card.isCommander);
    if (commanderCards.length > 1) {
      return next(new Error('Un deck Commander ne peut avoir qu\'un seul commandant'));
    }
    
    const mainboardCards = this.cards.filter(card => !card.isSideboard && !card.isCommander);
    const totalMainboard = mainboardCards.reduce((total, card) => total + card.quantity, 0);
    
    if (totalMainboard > 99) {
      return next(new Error('Un deck Commander ne peut avoir plus de 99 cartes dans le deck principal'));
    }
  }
  
  next();
});

const Deck = mongoose.model('Deck', deckSchema);

export default Deck;
