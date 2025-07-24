import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import Collection from '../models/Collection.js';
import User from '../models/User.js';

const router = express.Router();

// Récupérer les statistiques du tableau de bord
router.get('/dashboard', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Récupérer la collection de l'utilisateur
    const collection = await Collection.findOne({ user: userId }).populate('cards.card');
    
    if (!collection) {
      // Retourner des données de démonstration si pas de collection
      return res.json({
        totalCards: 150,
        uniqueSets: 12,
        estimatedValue: 450.75,
        monthlyAdditions: 25,
        monthlyGrowth: 15,
        valueGrowth: 0.08,
        avgMonthlyAdditions: 20,
        colorDistribution: [
          { color: 'U', count: 35 },
          { color: 'W', count: 30 },
          { color: 'B', count: 25 },
          { color: 'R', count: 22 },
          { color: 'G', count: 20 },
          { color: 'M', count: 12 },
          { color: 'C', count: 6 }
        ],
        typeDistribution: [
          { type: 'Créature', count: 60 },
          { type: 'Éphémère', count: 25 },
          { type: 'Rituel', count: 20 },
          { type: 'Enchantement', count: 15 },
          { type: 'Artefact', count: 12 },
          { type: 'Planeswalker', count: 8 },
          { type: 'Terrain', count: 10 }
        ],
        cmcDistribution: [
          { cmc: 0, count: 5 },
          { cmc: 1, count: 20 },
          { cmc: 2, count: 35 },
          { cmc: 3, count: 30 },
          { cmc: 4, count: 25 },
          { cmc: 5, count: 15 },
          { cmc: 6, count: 12 },
          { cmc: 7, count: 8 }
        ],
        topExtensions: [
          { set_code: 'neo', set_name: 'Kamigawa: Neon Dynasty', count: 25 },
          { set_code: 'snc', set_name: 'Streets of New Capenna', count: 20 },
          { set_code: 'dmu', set_name: 'Dominaria United', count: 18 },
          { set_code: 'bro', set_name: 'The Brothers\' War', count: 15 },
          { set_code: 'one', set_name: 'Phyrexia: All Will Be One', count: 12 }
        ],
        recentAdditions: [
          {
            id: '1',
            name: 'Lightning Bolt',
            set_code: 'neo',
            rarity: 'common',
            mana_cost: '{R}',
            quantity: 1,
            added_date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
          },
          {
            id: '2',
            name: 'Counterspell',
            set_code: 'snc',
            rarity: 'uncommon',
            mana_cost: '{U}{U}',
            quantity: 2,
            added_date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
          },
          {
            id: '3',
            name: 'Serra Angel',
            set_code: 'dmu',
            rarity: 'rare',
            mana_cost: '{3}{W}{W}',
            quantity: 1,
            added_date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
          }
        ],
        comparisonData: [
          { username: 'Alice', totalCards: 200, uniqueSets: 15, estimatedValue: 600, isCurrentUser: false },
          { username: user?.username || 'Vous', totalCards: 150, uniqueSets: 12, estimatedValue: 450.75, isCurrentUser: true },
          { username: 'Bob', totalCards: 120, uniqueSets: 10, estimatedValue: 380, isCurrentUser: false },
          { username: 'Charlie', totalCards: 95, uniqueSets: 8, estimatedValue: 290, isCurrentUser: false }
        ],
        growthData: [
          { date: '2024-01-01', totalCards: 50, cardsAdded: 50 },
          { date: '2024-02-01', totalCards: 75, cardsAdded: 25 },
          { date: '2024-03-01', totalCards: 100, cardsAdded: 25 },
          { date: '2024-04-01', totalCards: 120, cardsAdded: 20 },
          { date: '2024-05-01', totalCards: 135, cardsAdded: 15 },
          { date: '2024-06-01', totalCards: 150, cardsAdded: 15 }
        ]
      });
    }

    const cards = collection.cards || [];
    const totalCards = cards.reduce((sum, item) => sum + item.quantity, 0);
    
    // Calculer les statistiques
    const stats = calculateDashboardStats(cards);
    
    // Récupérer les ajouts récents (30 derniers jours)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const recentAdditions = cards
      .filter(item => new Date(item.addedAt) >= thirtyDaysAgo)
      .sort((a, b) => new Date(b.addedAt) - new Date(a.addedAt))
      .slice(0, 10)
      .map(item => ({
        ...item.card.toObject(),
        quantity: item.quantity,
        added_date: item.addedAt
      }));

    // Récupérer les données de comparaison
    const comparisonData = await getUserComparisons(userId);

    res.json({
      totalCards,
      uniqueSets: stats.uniqueSets,
      estimatedValue: stats.estimatedValue,
      monthlyAdditions: stats.monthlyAdditions,
      monthlyGrowth: stats.monthlyGrowth,
      valueGrowth: stats.valueGrowth,
      avgMonthlyAdditions: stats.avgMonthlyAdditions,
      colorDistribution: stats.colorDistribution,
      typeDistribution: stats.typeDistribution,
      cmcDistribution: stats.cmcDistribution,
      topExtensions: stats.topExtensions,
      recentAdditions,
      comparisonData,
      growthData: await getCollectionGrowthData(userId)
    });
    
  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Récupérer les données de croissance de la collection
router.get('/growth', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const months = parseInt(req.query.months) || 12;
    
    const growthData = await getCollectionGrowthData(userId, months);
    res.json(growthData);
    
  } catch (error) {
    console.error('Erreur lors de la récupération des données de croissance:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Récupérer les comparaisons entre utilisateurs
router.get('/comparisons', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const comparisonData = await getUserComparisons(userId);
    res.json(comparisonData);
    
  } catch (error) {
    console.error('Erreur lors de la récupération des comparaisons:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// ===== FONCTIONS UTILITAIRES =====

function calculateDashboardStats(cards) {
  // Initialiser les compteurs
  const colorCounts = {};
  const typeCounts = {};
  const cmcCounts = {};
  const setCounts = {};
  let estimatedValue = 0;
  
  // Calculer les statistiques pour chaque carte
  cards.forEach(item => {
    const card = item.card;
    const quantity = item.quantity;
    
    // Répartition par couleurs
    if (card.colors && card.colors.length > 0) {
      if (card.colors.length === 1) {
        const color = card.colors[0];
        colorCounts[color] = (colorCounts[color] || 0) + quantity;
      } else {
        colorCounts['M'] = (colorCounts['M'] || 0) + quantity; // Multicolore
      }
    } else {
      colorCounts['C'] = (colorCounts['C'] || 0) + quantity; // Incolore
    }
    
    // Répartition par types
    if (card.type_line) {
      const types = card.type_line.split('—')[0].trim().split(' ');
      const mainType = types.find(type => 
        ['Creature', 'Instant', 'Sorcery', 'Artifact', 'Enchantment', 'Planeswalker', 'Land'].includes(type)
      ) || 'Other';
      
      const frenchType = translateType(mainType);
      typeCounts[frenchType] = (typeCounts[frenchType] || 0) + quantity;
    }
    
    // Répartition par CMC
    const cmc = card.cmc || 0;
    const cmcKey = cmc >= 7 ? '7+' : cmc.toString();
    cmcCounts[cmcKey] = (cmcCounts[cmcKey] || 0) + quantity;
    
    // Répartition par extensions
    if (card.set) {
      if (!setCounts[card.set]) {
        setCounts[card.set] = {
          set_code: card.set,
          set_name: card.set_name || card.set,
          count: 0
        };
      }
      setCounts[card.set].count += quantity;
    }
    
    // Valeur estimée (placeholder - vous pouvez intégrer une API de prix)
    estimatedValue += (card.prices?.eur || 0.5) * quantity;
  });
  
  // Calculer les ajouts mensuels
  const now = new Date();
  const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  
  const monthlyAdditions = cards.filter(item => 
    new Date(item.addedAt) >= thisMonth
  ).reduce((sum, item) => sum + item.quantity, 0);
  
  const lastMonthAdditions = cards.filter(item => 
    new Date(item.addedAt) >= lastMonth && new Date(item.addedAt) < thisMonth
  ).reduce((sum, item) => sum + item.quantity, 0);
  
  // Convertir en tableaux et trier
  const colorDistribution = Object.entries(colorCounts).map(([color, count]) => ({
    color,
    count
  })).sort((a, b) => b.count - a.count);
  
  const typeDistribution = Object.entries(typeCounts).map(([type, count]) => ({
    type,
    count
  })).sort((a, b) => b.count - a.count);
  
  const cmcDistribution = Object.entries(cmcCounts).map(([cmc, count]) => ({
    cmc: cmc === '7+' ? 7 : parseInt(cmc),
    count
  })).sort((a, b) => a.cmc - b.cmc);
  
  const topExtensions = Object.values(setCounts)
    .sort((a, b) => b.count - a.count)
    .slice(0, 15);
  
  return {
    uniqueSets: Object.keys(setCounts).length,
    estimatedValue,
    monthlyAdditions,
    monthlyGrowth: monthlyAdditions - lastMonthAdditions,
    valueGrowth: 0.05, // Placeholder 5%
    avgMonthlyAdditions: Math.round(cards.length / 12), // Approximation
    colorDistribution,
    typeDistribution,
    cmcDistribution,
    topExtensions
  };
}

function translateType(englishType) {
  const translations = {
    'Creature': 'Créature',
    'Instant': 'Éphémère',
    'Sorcery': 'Rituel',
    'Artifact': 'Artefact',
    'Enchantment': 'Enchantement',
    'Planeswalker': 'Planeswalker',
    'Land': 'Terrain',
    'Tribal': 'Tribal'
  };
  return translations[englishType] || englishType;
}

async function getCollectionGrowthData(userId, months = 12) {
  try {
    const collection = await Collection.findOne({ user: userId }).populate('cards.card');
    if (!collection || !collection.cards) return [];
    
    const cards = collection.cards;
    const now = new Date();
    const startDate = new Date(now.getFullYear(), now.getMonth() - months, 1);
    
    // Grouper par mois
    const monthlyData = {};
    
    cards.forEach(item => {
      const addedDate = new Date(item.addedAt);
      if (addedDate >= startDate) {
        const monthKey = `${addedDate.getFullYear()}-${String(addedDate.getMonth() + 1).padStart(2, '0')}`;
        if (!monthlyData[monthKey]) {
          monthlyData[monthKey] = {
            date: monthKey + '-01',
            totalCards: 0,
            cardsAdded: 0
          };
        }
        monthlyData[monthKey].cardsAdded += item.quantity;
      }
    });
    
    // Calculer les totaux cumulés
    let cumulativeTotal = 0;
    const sortedMonths = Object.keys(monthlyData).sort();
    
    return sortedMonths.map(month => {
      cumulativeTotal += monthlyData[month].cardsAdded;
      return {
        date: monthlyData[month].date,
        totalCards: cumulativeTotal,
        cardsAdded: monthlyData[month].cardsAdded
      };
    });
    
  } catch (error) {
    console.error('Erreur lors du calcul de la croissance:', error);
    return [];
  }
}

async function getUserComparisons(currentUserId) {
  try {
    // Récupérer toutes les collections avec les statistiques de base
    const users = await User.find({}, 'username').lean();
    const comparisons = [];
    
    for (const user of users) {
      const collection = await Collection.findOne({ user: user._id }).populate('cards.card');
      
      if (collection && collection.cards && collection.cards.length > 0) {
        const totalCards = collection.cards.reduce((sum, item) => sum + item.quantity, 0);
        const uniqueSets = [...new Set(collection.cards.map(item => item.card.set))].length;
        const estimatedValue = collection.cards.reduce((sum, item) => 
          sum + ((item.card.prices?.eur || 0.5) * item.quantity), 0
        );
        
        comparisons.push({
          username: user.username,
          totalCards,
          uniqueSets,
          estimatedValue,
          isCurrentUser: user._id.toString() === currentUserId
        });
      }
    }
    
    return comparisons.sort((a, b) => b.totalCards - a.totalCards);
    
  } catch (error) {
    console.error('Erreur lors de la récupération des comparaisons:', error);
    return [];
  }
}

export default router;
