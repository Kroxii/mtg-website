import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  nom: {
    type: String,
    required: [true, 'Le nom est requis'],
    trim: true,
    maxlength: [50, 'Le nom ne peut pas dépasser 50 caractères']
  },
  prenom: {
    type: String,
    required: [true, 'Le prénom est requis'],
    trim: true,
    maxlength: [50, 'Le prénom ne peut pas dépasser 50 caractères']
  },
  email: {
    type: String,
    required: [true, 'L\'email est requis'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Email invalide']
  },
  password: {
    type: String,
    required: [true, 'Le mot de passe est requis'],
    minlength: [6, 'Le mot de passe doit contenir au moins 6 caractères']
  },
  dateNaissance: {
    type: Date,
    default: null
  },
  avatar: {
    type: String,
    default: null
  },
  role: {
    type: String,
    enum: ['utilisateur', 'moderateur', 'admin'],
    default: 'utilisateur'
  },
  statut: {
    type: String,
    enum: ['actif', 'inactif', 'suspendu', 'supprime'],
    default: 'actif'
  },
  preferences: {
    theme: {
      type: String,
      enum: ['dark', 'light'],
      default: 'dark'
    },
    langue: {
      type: String,
      enum: ['fr', 'en'],
      default: 'fr'
    },
    notifications: {
      type: Boolean,
      default: true
    },
    visibiliteProfil: {
      type: String,
      enum: ['public', 'amis', 'prive'],
      default: 'public'
    }
  },
  derniereConnexion: {
    type: Date,
    default: null
  },
  dateCreation: {
    type: Date,
    default: Date.now
  },
  dateModification: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Index pour améliorer les performances
userSchema.index({ email: 1 });
userSchema.index({ statut: 1 });
userSchema.index({ dateCreation: -1 });

// Virtual pour le nom complet
userSchema.virtual('nomComplet').get(function() {
  return `${this.prenom} ${this.nom}`;
});

// Middleware pre-save pour hasher le mot de passe
userSchema.pre('save', async function(next) {
  // Seulement hasher le mot de passe s'il a été modifié
  if (!this.isModified('password')) return next();

  try {
    // Hasher le mot de passe avec un salt de 12 rounds
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Middleware pre-save pour mettre à jour dateModification
userSchema.pre('save', function(next) {
  this.dateModification = new Date();
  next();
});

// Méthode pour comparer les mots de passe
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Méthode pour retourner l'utilisateur sans le mot de passe
userSchema.methods.toSafeObject = function() {
  const userObject = this.toObject();
  delete userObject.password;
  return userObject;
};

// Méthode statique pour trouver un utilisateur par email
userSchema.statics.findByEmail = function(email) {
  return this.findOne({ email: email.toLowerCase() });
};

// Méthode statique pour les utilisateurs actifs
userSchema.statics.findActiveUsers = function() {
  return this.find({ statut: 'actif' });
};

const User = mongoose.model('User', userSchema);

export default User;
