import { useState, useEffect } from 'react';
import { scryfallApi, scryfallApiGeneral, apiUtils, formatSetDate } from '../utils/api';
import CardItem from '../components/CardItem';
import { Search, Filter } from 'lucide-react';

const Collection = () => {
  const [sets, setSets] = useState([]);
  const [selectedSet, setSelectedSet] = useState('');
  const [cards, setCards] = useState([]);
  const [collection, setCollection] = useState({});
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState('date_desc'); // 'date_desc', 'date_asc', 'name_asc', 'name_desc'

  useEffect(() => {
    loadCollection();
  }, []);

  useEffect(() => {
    fetchSets();
  }, [sortOrder]);

  const fetchSets = async () => {
    try {
      const response = await scryfallApiGeneral.get('/sets');
      // Inclure TOUTES les extensions sauf celles qui sont digitales (Arena/MTGO)
      const allPhysicalSets = response.data.data.filter(set => set.digital === false);
      
      const sortedSets = sortSets(allPhysicalSets, sortOrder);
      setSets(sortedSets);
    } catch (error) {
      console.error('Erreur lors du chargement des extensions:', error);
    }
  };

  const sortSets = (sets, order) => {
    return [...sets].sort((a, b) => {
      switch (order) {
        case 'date_desc':
          return new Date(b.released_at) - new Date(a.released_at);
        case 'date_asc':
          return new Date(a.released_at) - new Date(b.released_at);
        case 'name_asc':
          return a.name.localeCompare(b.name);
        case 'name_desc':
          return b.name.localeCompare(a.name);
        case 'card_count_desc':
          return (b.card_count || 0) - (a.card_count || 0);
        case 'card_count_asc':
          return (a.card_count || 0) - (b.card_count || 0);
        default:
          return new Date(b.released_at) - new Date(a.released_at);
      }
    });
  };

  // Fonction pour formatter le type d'extension en français
  const formatSetType = (setType) => {
    const typeMap = {
      'expansion': 'Extension',
      'core': 'Edition de base',
      'commander': 'Commander',
      'masters': 'Masters',
      'duel_deck': 'Duel Deck',
      'from_the_vault': 'From the Vault',
      'premium_deck': 'Premium Deck',
      'box': 'Produit spécial',
      'promo': 'Promo',
      'token': 'Jetons',
      'memorabilia': 'Memorabilia',
      'funny': 'Un-Set',
      'starter': 'Starter',
      'planechase': 'Planechase',
      'archenemy': 'Archenemy',
      'vanguard': 'Vanguard',
      'masterpiece': 'Masterpiece',
      'spellbook': 'Signature Spellbook',
      'arsenal': 'Arsenal',
      'draft_innovation': 'Innovation Draft',
      'minigame': 'Mini-jeu',
      'treasure_chest': 'Coffre aux trésors'
    };
    return typeMap[setType] || setType;
  };

  // Fonction pour formater l'affichage complet d'une extension
  const formatSetDisplay = (set) => {
    const type = formatSetType(set.set_type);
    const date = formatSetDate(set.released_at);
    return `${set.name} (${set.code.toUpperCase()}) - ${type} - ${date}`;
  };

  const handleSortChange = (newSortOrder) => {
    setSortOrder(newSortOrder);
    localStorage.setItem('mtg-sort-order', newSortOrder);
    // Le useEffect s'occupera de refetch avec le nouveau tri
  };

  const fetchCardsFromSet = async (setCode) => {
    setLoading(true);
    try {
      // Première tentative en français
      let response;
      try {
        response = await scryfallApi.get(`/cards/search`, {
          params: {
            q: `set:${setCode} lang:fr`,
            order: 'cmc'
          }
        });
      } catch (frenchError) {
        // Fallback en anglais si pas de version française
        console.log('Pas de cartes françaises trouvées, fallback vers l\'anglais');
        response = await scryfallApi.get(`/cards/search`, {
          params: {
            q: `set:${setCode}`,
            order: 'cmc'
          }
        });
      }
      
      // Trier les cartes par numéro de collection
      const sortedCards = (response.data.data || []).sort((a, b) => {
        const numA = parseInt(a.collector_number) || 0;
        const numB = parseInt(b.collector_number) || 0;
        return numA - numB;
      });
      
      setCards(sortedCards);
    } catch (error) {
      console.error('Erreur lors du chargement des cartes:', error);
      setCards([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSetChange = (setCode) => {
    setSelectedSet(setCode);
    if (setCode) {
      fetchCardsFromSet(setCode);
    } else {
      setCards([]);
    }
  };

  const handleQuantityChange = (cardId, newQuantity) => {
    const updatedCollection = { ...collection };
    if (newQuantity === 0) {
      delete updatedCollection[cardId];
    } else {
      updatedCollection[cardId] = newQuantity;
    }
    setCollection(updatedCollection);
    saveCollection(updatedCollection);
  };

  const saveCollection = (collectionData) => {
    localStorage.setItem('mtg-collection', JSON.stringify(collectionData));
  };

  const loadCollection = () => {
    const saved = localStorage.getItem('mtg-collection');
    if (saved) {
      setCollection(JSON.parse(saved));
    }
    
    // Charger les préférences de tri
    const savedSortOrder = localStorage.getItem('mtg-sort-order');
    if (savedSortOrder) {
      setSortOrder(savedSortOrder);
    }
  };

  const filteredCards = cards.filter(card => 
    card.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (card.printed_name && card.printed_name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const totalCards = Object.values(collection).reduce((sum, quantity) => sum + quantity, 0);

  return (
    <div className="collection-container">
      <div className="collection-header">
        <h2>Ma Collection Magic</h2>
        <p>Total de cartes: {totalCards}</p>
      </div>

      <div className="collection-controls">
        <div className="control-group">
          <Filter size={20} />
          <select 
            value={selectedSet} 
            onChange={(e) => handleSetChange(e.target.value)}
            className="set-selector"
          >
            <option value="">Choisir une extension</option>
            {sets.map(set => (
              <option key={set.code} value={set.code}>
                {formatSetDisplay(set)}
              </option>
            ))}
          </select>
        </div>

        <div className="control-group">
          <label htmlFor="sort-order">Trier par:</label>
          <select 
            id="sort-order"
            value={sortOrder} 
            onChange={(e) => handleSortChange(e.target.value)}
            className="sort-selector"
          >
            <option value="date_desc">Date (Plus récent)</option>
            <option value="date_asc">Date (Plus ancien)</option>
            <option value="name_asc">Nom (A-Z)</option>
            <option value="name_desc">Nom (Z-A)</option>
            <option value="card_count_desc">Nb cartes (Plus)</option>
            <option value="card_count_asc">Nb cartes (Moins)</option>
          </select>
        </div>

        {selectedSet && (
          <div className="control-group">
            <Search size={20} />
            <input
              type="text"
              placeholder="Rechercher une carte..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
        )}
      </div>

      {selectedSet && (
        <div className="selected-set-info">
          {(() => {
            const currentSet = sets.find(set => set.code === selectedSet);
            if (!currentSet) return null;
            
            return (
              <div className="set-details">
                <h3>{currentSet.name}</h3>
                <div className="set-meta">
                  <span>Code: {currentSet.code.toUpperCase()}</span>
                  <span>•</span>
                  <span>Sortie: {formatSetDate(currentSet.released_at)}</span>
                  <span>•</span>
                  <span>{currentSet.card_count} cartes</span>
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {loading && (
        <div className="loading">
          <p>Chargement des cartes...</p>
        </div>
      )}

      <div className="cards-grid">
        {filteredCards.map(card => (
          <CardItem
            key={card.id}
            card={card}
            quantity={collection[card.id] || 0}
            onQuantityChange={handleQuantityChange}
          />
        ))}
      </div>

      {selectedSet && !loading && filteredCards.length === 0 && (
        <div className="no-results">
          <p>Aucune carte trouvée pour cette recherche.</p>
        </div>
      )}
    </div>
  );
};

export default Collection;
