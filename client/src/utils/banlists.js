// Banlists pour différents formats Magic
export const FORMATS = {
  COMMANDER: 'commander',
  DUEL_COMMANDER: 'duel-commander',
  STANDARD: 'standard',
  PIONEER: 'pioneer',
  MODERN: 'modern',
  LEGACY: 'legacy',
  VINTAGE: 'vintage',
  PAUPER: 'pauper'
};

export const FORMAT_NAMES = {
  [FORMATS.COMMANDER]: 'Commander',
  [FORMATS.DUEL_COMMANDER]: 'Duel Commander',
  [FORMATS.STANDARD]: 'Standard',
  [FORMATS.PIONEER]: 'Pionnier',
  [FORMATS.MODERN]: 'Modern',
  [FORMATS.LEGACY]: 'Legacy',
  [FORMATS.VINTAGE]: 'Vintage',
  [FORMATS.PAUPER]: 'Pauper'
};

// Fonction pour extraire les couleurs d'une carte
export const getCardColors = (card) => {
  if (!card) return [];
  
  // Pour les cartes double face, utiliser les couleurs des deux faces
  if (card.card_faces && card.card_faces.length > 0) {
    const allColors = new Set();
    card.card_faces.forEach(face => {
      if (face.colors) {
        face.colors.forEach(color => allColors.add(color));
      }
    });
    return Array.from(allColors);
  }
  
  return card.colors || [];
};

// Fonction pour vérifier si une carte peut être ajoutée dans un deck avec un commandant donné
export const isCardColorCompatible = (card, commander, format) => {
  // Si ce n'est pas un format Commander ou Duel Commander, pas de restriction
  if (format !== FORMATS.COMMANDER && format !== FORMATS.DUEL_COMMANDER) {
    return true;
  }
  
  // Si pas de commandant, autoriser toutes les cartes
  if (!commander) {
    return true;
  }
  
  const cardColors = getCardColors(card);
  const commanderColors = getCardColors(commander);
  
  // Une carte peut être ajoutée si toutes ses couleurs sont présentes dans l'identité couleur du commandant
  return cardColors.every(cardColor => commanderColors.includes(cardColor));
};

// Banlists (exemples - à mettre à jour avec les vraies listes)
export const BANLISTS = {
  [FORMATS.COMMANDER]: [
    'Ancestral Recall',
    'Black Lotus',
    'Mox Pearl',
    'Mox Sapphire',
    'Mox Jet',
    'Mox Ruby',
    'Mox Emerald',
    'Time Walk',
    'Timetwister',
    'Chaos Orb',
    'Falling Star',
    'Shahrazad',
    'Biorhythm',
    'Coalition Victory',
    'Emrakul, the Aeons Torn',
    'Fastbond',
    'Gifts Ungiven',
    'Griselbrand',
    'Hullbreacher',
    'Iona, Shield of Emeria',
    'Leovold, Emissary of Trest',
    'Library of Alexandria',
    'Limited Resources',
    'Lutri, the Spellchaser',
    'Primeval Titan',
    'Prophet of Kruphix',
    'Recurring Nightmare',
    'Rofellos, Llanowar Emissary',
    'Sundering Titan',
    'Sway of the Stars',
    'Sylvan Primordial',
    'Time Vault',
    'Tinker',
    'Tolarian Academy',
    'Trade Secrets',
    'Upheaval',
    'Worldfire',
    'Braids, Cabal Minion',
    'Erayo, Soratami Ascendant',
    'Golos, Tireless Pilgrim'
  ],
  
  [FORMATS.DUEL_COMMANDER]: [
    // Duel Commander a sa propre banlist
    'Ancestral Recall',
    'Balance',
    'Back to Basics',
    'Bazaar of Baghdad',
    'Black Lotus',
    'Brainstorm',
    'Dig Through Time',
    'Entomb',
    'Fastbond',
    'Food Chain',
    'Gaea\'s Cradle',
    'Grim Monolith',
    'Hermit Druid',
    'Humility',
    'Imperial Seal',
    'Karakas',
    'Library of Alexandria',
    'Mana Crypt',
    'Mana Drain',
    'Mana Vault',
    'Mind Twist',
    'Mishra\'s Workshop',
    'Monastery Mentor',
    'Mystical Tutor',
    'Necropotence',
    'Oath of Druids',
    'Polymorph',
    'Ponder',
    'Preordain',
    'Protean Hulk',
    'Sensei\'s Divining Top',
    'Serra\'s Sanctum',
    'Shahrazad',
    'Sol Ring',
    'Stoneforge Mystic',
    'Strip Mine',
    'Survival of the Fittest',
    'The Tabernacle at Pendrell Vale',
    'Time Vault',
    'Time Walk',
    'Tinker',
    'Tolarian Academy',
    'Treasure Cruise',
    'True-Name Nemesis',
    'Vampiric Tutor',
    'Wasteland',
    'Windfall',
    'Yawgmoth\'s Will',
    'Zur the Enchanter'
  ],
  
  [FORMATS.STANDARD]: [
    // Standard banlist (change selon les rotations)
    'Oko, Thief of Crowns',
    'Once Upon a Time',
    'Veil of Summer',
    'Teferi, Time Raveler',
    'Wilderness Reclamation',
    'Growth Spiral',
    'Cauldron Familiar',
    'Omnath, Locus of Creation',
    'Lucky Clover',
    'Escape to the Wilds'
  ],
  
  [FORMATS.PIONEER]: [
    'Balustrade Spy',
    'Bloodstained Mire',
    'Expressive Iteration',
    'Felidar Guardian',
    'Field of the Dead',
    'Flooded Strand',
    'Inverter of Truth',
    'Kethis, the Hidden Hand',
    'Leyline of Abundance',
    'Lurrus of the Dream-Den',
    'Nexus of Fate',
    'Oko, Thief of Crowns',
    'Once Upon a Time',
    'Polluted Delta',
    'Smuggler\'s Copter',
    'Teferi, Time Raveler',
    'Undercity Informer',
    'Underworld Breach',
    'Veil of Summer',
    'Walking Ballista',
    'Wilderness Reclamation',
    'Windswept Heath',
    'Wooded Foothills'
  ],
  
  [FORMATS.MODERN]: [
    'Arcum\'s Astrolabe',
    'Birthing Pod',
    'Blazing Shoal',
    'Bloodbraid Elf',
    'Chrome Mox',
    'Cloudpost',
    'Dark Depths',
    'Deathrite Shaman',
    'Dig Through Time',
    'Dread Return',
    'Eye of Ugin',
    'Faithless Looting',
    'Frantic Search',
    'Gitaxian Probe',
    'Glimpse of Nature',
    'Golgari Grave-Troll',
    'Green Sun\'s Zenith',
    'Hypergenesis',
    'Krark-Clan Ironworks',
    'Life from the Loam',
    'Looting',
    'Mental Misstep',
    'Mox Opal',
    'Mycosynth Lattice',
    'Mystic Sanctuary',
    'Oko, Thief of Crowns',
    'Once Upon a Time',
    'Ponder',
    'Preordain',
    'Punishing Fire',
    'Rite of Flame',
    'Sensei\'s Divining Top',
    'Skullclamp',
    'Splinter Twin',
    'Summer Bloom',
    'Treasure Cruise',
    'Tree of Tales',
    'Umezawa\'s Jitte',
    'Uro, Titan of Nature\'s Wrath',
    'Vault of Whispers',
    'Wild Nacatl'
  ],
  
  [FORMATS.LEGACY]: [
    'Ancestral Recall',
    'Balance',
    'Bazaar of Baghdad',
    'Black Lotus',
    'Channel',
    'Chaos Orb',
    'Deathrite Shaman',
    'Dreadhorde Arcanist',
    'Earthcraft',
    'Falling Star',
    'Fastbond',
    'Frantic Search',
    'Goblin Recruiter',
    'Gush',
    'Hermit Druid',
    'Imperial Seal',
    'Library of Alexandria',
    'Mana Drain',
    'Memory Jar',
    'Mental Misstep',
    'Mind Twist',
    'Mishra\'s Workshop',
    'Mox Emerald',
    'Mox Jet',
    'Mox Pearl',
    'Mox Ruby',
    'Mox Sapphire',
    'Mystical Tutor',
    'Necropotence',
    'Oath of Druids',
    'Oko, Thief of Crowns',
    'Sensei\'s Divining Top',
    'Shahrazad',
    'Skullclamp',
    'Strip Mine',
    'Survival of the Fittest',
    'Time Vault',
    'Time Walk',
    'Timetwister',
    'Tinker',
    'Tolarian Academy',
    'Treasure Cruise',
    'Windfall',
    'Wrenn and Six',
    'Yawgmoth\'s Will'
  ],
  
  [FORMATS.VINTAGE]: [
    'Ancestral Recall', // Restricted
    'Balance', // Restricted
    'Black Lotus', // Restricted
    'Brainstorm', // Restricted
    'Chalice of the Void', // Restricted
    'Channel', // Restricted
    'Chaos Orb',
    'Demonic Tutor', // Restricted
    'Dig Through Time', // Restricted
    'Falling Star',
    'Fastbond', // Restricted
    'Flash', // Restricted
    'Gitaxian Probe', // Restricted
    'Gush', // Restricted
    'Imperial Seal', // Restricted
    'Library of Alexandria', // Restricted
    'Lotus Petal', // Restricted
    'Mana Crypt', // Restricted
    'Mana Vault', // Restricted
    'Memory Jar', // Restricted
    'Mental Misstep', // Restricted
    'Merchant Scroll', // Restricted
    'Mind\'s Desire', // Restricted
    'Mox Emerald', // Restricted
    'Mox Jet', // Restricted
    'Mox Pearl', // Restricted
    'Mox Ruby', // Restricted
    'Mox Sapphire', // Restricted
    'Mystical Tutor', // Restricted
    'Necropotence', // Restricted
    'Ponder', // Restricted
    'Preordain', // Restricted
    'Shahrazad',
    'Sol Ring', // Restricted
    'Strip Mine', // Restricted
    'Time Vault', // Restricted
    'Time Walk', // Restricted
    'Timetwister', // Restricted
    'Tinker', // Restricted
    'Tolarian Academy', // Restricted
    'Treasure Cruise', // Restricted
    'Trinisphere', // Restricted
    'Vampiric Tutor', // Restricted
    'Wheel of Fortune', // Restricted
    'Windfall', // Restricted
    'Yawgmoth\'s Will' // Restricted
  ],
  
  [FORMATS.PAUPER]: [
    'Arcum\'s Astrolabe',
    'Atog',
    'Bonder\'s Ornament',
    'Chatterstorm',
    'Cloud of Faeries',
    'Cloudpost',
    'Cranial Plating',
    'Daze',
    'Disciple of the Vault',
    'Empty the Warrens',
    'Fall from Favor',
    'Fireblast',
    'Frantic Search',
    'Gitaxian Probe',
    'Grapeshot',
    'Hymn to Tourach',
    'Invigorate',
    'Mystic Sanctuary',
    'Peregrine Drake',
    'Prophetic Prism',
    'Sojourner\'s Companion',
    'Temporal Fissure',
    'Treasure Cruise'
  ]
};

// Fonction pour vérifier si une carte est bannie dans un format
export const isCardBanned = (cardName, format) => {
  const banlist = BANLISTS[format] || [];
  return banlist.some(bannedCard => 
    bannedCard.toLowerCase() === cardName.toLowerCase()
  );
};

// Fonction pour obtenir les cartes bannies d'un deck
export const getBannedCardsInDeck = (deck, format) => {
  const bannedCards = [];
  
  Object.values(deck.cards || {}).forEach(card => {
    if (isCardBanned(card.name, format)) {
      bannedCards.push(card);
    }
  });
  
  return bannedCards;
};

// Fonction pour valider un deck selon un format
export const validateDeck = (deck, format) => {
  const bannedCards = getBannedCardsInDeck(deck, format);
  const totalCards = Object.values(deck.cards || {}).reduce((sum, card) => sum + card.quantity, 0);
  
  const validation = {
    isValid: bannedCards.length === 0,
    bannedCards,
    totalCards,
    warnings: []
  };
  
  // Règles spécifiques par format
  switch (format) {
    case FORMATS.COMMANDER:
    case FORMATS.DUEL_COMMANDER:
      if (totalCards !== 100) {
        validation.warnings.push(`Un deck Commander doit contenir exactement 100 cartes (actuellement: ${totalCards})`);
      }
      break;
    case FORMATS.STANDARD:
    case FORMATS.PIONEER:
    case FORMATS.MODERN:
      if (totalCards < 60) {
        validation.warnings.push(`Un deck ${FORMAT_NAMES[format]} doit contenir au moins 60 cartes (actuellement: ${totalCards})`);
      }
      break;
  }
  
  return validation;
};
