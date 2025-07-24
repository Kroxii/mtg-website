import { useState, useEffect } from 'react';
import { scryfallApi, scryfallApiGeneral, apiUtils, formatSetDate } from '../utils/api';
import { collectionService } from '../services/backendApi';
import { useAuth } from '../hooks/useAuth';
import CardItem from '../components/CardItem';
import { Search, Filter, Grid, List } from 'lucide-react';
import './FullsetSets.css';

const Collection = () => {
  const { user, isAuthenticated } = useAuth();
  const [sets, setSets] = useState([]);
  const [selectedSet, setSelectedSet] = useState('');
  const [cards, setCards] = useState([]);
  const [collections, setCollections] = useState([]);
  const [selectedCollection, setSelectedCollection] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState('date_desc'); // 'date_desc', 'date_asc', 'name_asc', 'name_desc'
  const [displayMode, setDisplayMode] = useState('sets'); // 'sets' ou 'cards'
  const [viewMode, setViewMode] = useState('grid'); // 'grid' ou 'list'

  useEffect(() => {
    if (isAuthenticated) {
      loadUserCollections();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchSets();
  }, [sortOrder]);

  const loadUserCollections = async () => {
    try {
      const result = await collectionService.getMyCollections();
      if (result.success) {
        setCollections(result.collections);
        // Sélectionner la première collection par défaut, ou créer une nouvelle si aucune
        if (result.collections.length > 0) {
          setSelectedCollection(result.collections[0]);
        } else {
          await createDefaultCollection();
        }
      }
    } catch (error) {
      console.error('Erreur lors du chargement des collections:', error);
    }
  };

  const createDefaultCollection = async () => {
    try {
      const result = await collectionService.createCollection({
        name: 'Ma Collection',
        description: 'Ma collection principale de cartes Magic',
        isPublic: false
      });
      if (result.success) {
        setCollections([result.collection]);
        setSelectedCollection(result.collection);
      }
    } catch (error) {
      console.error('Erreur lors de la création de la collection par défaut:', error);
    }
  };

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
    setDisplayMode('cards');
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
      setDisplayMode('sets');
    }
  };

  const handleQuantityChange = async (card, newQuantity) => {
    if (!selectedCollection) return;
    
    try {
      if (newQuantity === 0) {
        // Supprimer la carte de la collection
        const cardInCollection = selectedCollection.cards.find(c => c.card === card.id);
        if (cardInCollection) {
          await collectionService.removeCardFromCollection(selectedCollection._id, cardInCollection._id);
        }
      } else {
        // Ajouter ou mettre à jour la carte dans la collection
        await collectionService.addCardToCollection(selectedCollection._id, {
          cardId: card.id,
          quantity: newQuantity,
          condition: 'near_mint',
          language: 'fr',
          foil: false
        });
      }
      
      // Recharger les collections pour avoir les données à jour
      await loadUserCollections();
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la collection:', error);
    }
  };

  const getCardQuantity = (cardId) => {
    if (!selectedCollection || !selectedCollection.cards) return 0;
    const cardInCollection = selectedCollection.cards.find(c => c.card === cardId);
    return cardInCollection ? cardInCollection.quantity : 0;
  };

  const getSetProgress = (setCode) => {
    if (!selectedCollection || !selectedCollection.cards) return { owned: 0, total: 0, percentage: 0 };
    
    const setCards = selectedCollection.cards.filter(card => 
      card.set_code && card.set_code.toLowerCase() === setCode.toLowerCase()
    );
    
    const totalCards = sets.find(set => set.code === setCode)?.card_count || 0;
    const ownedCards = setCards.length;
    const percentage = totalCards > 0 ? Math.round((ownedCards / totalCards) * 100) : 0;
    
    return { owned: ownedCards, total: totalCards, percentage };
  };

  const filteredSets = sets.filter(set => 
    set.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    set.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredCards = cards.filter(card => 
    card.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (card.printed_name && card.printed_name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const totalCards = selectedCollection?.totalCards || 0;
  const totalUniqueCards = selectedCollection?.cards?.length || 0;

  if (!isAuthenticated) {
    return (
      <div className="collection-container">
        <div className="collection-header">
          <h2>Connexion requise</h2>
          <p>Veuillez vous connecter pour accéder à votre collection.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="collection-container">
      <div className="collection-header">
        <h2>Ma Collection Magic</h2>
        <div className="collection-stats">
          <p>Total de cartes: {totalCards}</p>
          <p>Cartes uniques: {totalUniqueCards}</p>
          {selectedCollection && (
            <p>Collection active: {selectedCollection.name}</p>
          )}
        </div>
      </div>

      {collections.length > 1 && (
        <div className="collection-selector">
          <label htmlFor="collection-select">Collection:</label>
          <select 
            id="collection-select"
            value={selectedCollection?._id || ''} 
            onChange={(e) => {
              const collection = collections.find(c => c._id === e.target.value);
              setSelectedCollection(collection);
            }}
          >
            {collections.map(collection => (
              <option key={collection._id} value={collection._id}>
                {collection.name} ({collection.totalCards || 0} cartes)
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="fullset-controls">
        <div className="control-group">
          <button 
            className={`view-toggle ${displayMode === 'sets' ? 'active' : ''}`}
            onClick={() => {
              setDisplayMode('sets');
              setSelectedSet('');
              setCards([]);
            }}
          >
            Extensions
          </button>
          {selectedSet && (
            <button 
              className={`view-toggle ${displayMode === 'cards' ? 'active' : ''}`}
              onClick={() => setDisplayMode('cards')}
            >
              Cartes
            </button>
          )}
        </div>

        <div className="control-group">
          <div className="view-mode-controls">
            <button 
              className={`view-mode-btn ${viewMode === 'grid' ? 'active' : ''}`}
              onClick={() => setViewMode('grid')}
              title="Grille"
            >
              <Grid size={18} />
            </button>
            <button 
              className={`view-mode-btn ${viewMode === 'list' ? 'active' : ''}`}
              onClick={() => setViewMode('list')}
              title="Liste"
            >
              <List size={18} />
            </button>
          </div>
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

        <div className="control-group">
          <Search size={20} />
          <input
            type="text"
            placeholder={displayMode === 'sets' ? "Rechercher une extension..." : "Rechercher une carte..."}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
      </div>

      {loading && (
        <div className="loading">
          <p>Chargement...</p>
        </div>
      )}

      {displayMode === 'sets' && (
        <div className={`fullset-sets-grid ${viewMode}`}>
          {filteredSets.map(set => {
            const progress = getSetProgress(set.code);
            return (
              <div 
                key={set.code} 
                className="fullset-set-card"
                onClick={() => handleSetChange(set.code)}
              >
                <div className="set-icon">
                  {set.icon_svg_uri ? (
                    <img src={set.icon_svg_uri} alt={set.name} />
                  ) : (
                    <div className="set-icon-placeholder">{set.code.toUpperCase()}</div>
                  )}
                </div>
                
                <div className="set-info">
                  <h3 className="set-name">{set.name}</h3>
                  <div className="set-code">{set.code.toUpperCase()}</div>
                  <div className="set-meta">
                    <span>{progress.owned}/{set.card_count || 0}</span>
                    <span className="progress-percentage">{progress.percentage}%</span>
                    <span className="set-date">{formatSetDate(set.released_at)}</span>
                  </div>
                  <div className="progress-bar">
                    <div 
                      className="progress-fill" 
                      style={{ width: `${progress.percentage}%` }}
                    ></div>
                  </div>
                </div>
                
                <button className="set-details-btn">
                  Voir les détails
                </button>
              </div>
            );
          })}
        </div>
      )}

      {displayMode === 'cards' && selectedSet && (
        <>
          <div className="selected-set-info">
            {(() => {
              const currentSet = sets.find(set => set.code === selectedSet);
              if (!currentSet) return null;
              
              return (
                <div className="set-details">
                  <button 
                    className="back-btn"
                    onClick={() => {
                      setDisplayMode('sets');
                      setSelectedSet('');
                      setCards([]);
                    }}
                  >
                    ← Retour aux extensions
                  </button>
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

          <div className="cards-grid">
            {filteredCards.map(card => (
              <CardItem
                key={card.id}
                card={card}
                quantity={getCardQuantity(card.id)}
                onQuantityChange={(newQuantity) => handleQuantityChange(card, newQuantity)}
              />
            ))}
          </div>

          {!loading && filteredCards.length === 0 && (
            <div className="no-results">
              <p>Aucune carte trouvée pour cette recherche.</p>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Collection;
